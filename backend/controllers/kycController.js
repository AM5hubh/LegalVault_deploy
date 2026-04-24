const User = require('../models/User');
const { 
  kycGenerateOtpSchema, 
  kycVerifyOtpSchema 
} = require('../utils/validationUtils');
const { 
  generateKycOtp, 
  verifyKycOtp
} = require('../services/kycService');
const { logCustodyAction } = require('../services/blockchainService');
const { generateHash } = require('../utils/hashUtils');
const { encryptData } = require('../utils/encryptionUtils');
const { sendKycStatusEmail } = require('../services/notificationService');
const logger = require('../utils/logger');
const crypto = require('crypto');

// Generate KYC OTP for Aadhaar
exports.generateKycOtp = async (req, res) => {
  try {
    const { error, value } = kycGenerateOtpSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { aadhaarNumber, consent = 'Y', reason = 'kyc_verification' } = value;
    const userId = req.user?.userId || req.user?.id;

    // Check if user is authenticated
    if (!userId) {
      // Allow unauthenticated request (for login flow)
      logger.info('KYC OTP generation requested (unauthenticated)');
    } else {
      // For authenticated users, check existing KYC status
      const user = await User.findById(userId);
      if (user && user.kycStatus === 'verified' && !req.body.forceRenew) {
        return res.status(400).json({ message: 'KYC already verified. Valid until ' + user.kycExpiry });
      }
    }

    // Call Sandbox API to generate OTP
    const otpResponse = await generateKycOtp(aadhaarNumber, consent, reason);

    // Store OTP details temporarily (in cache or session)
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.tempKycData = {
          aadhaarHash: crypto.createHash('sha256').update(aadhaarNumber).digest('hex'),
          transactionId: otpResponse.transactionId,
          referenceId: otpResponse.referenceId,
          aadhaarLastFour: aadhaarNumber.slice(-4),
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        };
        await user.save();
      }
    }

    logger.info('KYC OTP generated', {
      transactionId: otpResponse.transactionId,
      userId: userId || 'unauthenticated',
    });

    res.status(200).json({
      success: true,
      message: otpResponse.message || 'OTP sent successfully',
      transactionId: otpResponse.transactionId,
      referenceId: otpResponse.referenceId,
      aadhaarLastFour: aadhaarNumber.slice(-4),
      expiresIn: 600, // 10 minutes in seconds
      timestamp: otpResponse.timestamp,
    });
  } catch (error) {
    logger.error('KYC OTP generation failed', {
      error: error.message,
      userId: req.user?.userId || 'unauthenticated',
    });
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate OTP',
    });
  }
};

// Verify KYC OTP and retrieve Aadhaar details
exports.verifyKycOtp = async (req, res) => {
  try {
    logger.info('KYC OTP verification request received', {
      body: req.body,
      bodyKeys: Object.keys(req.body),
    });

    const { error, value } = kycVerifyOtpSchema.validate(req.body);
    if (error) {
      logger.error('Validation error in verify OTP', {
        error: error.details[0].message,
        details: error.details,
      });
      return res.status(400).json({ message: error.details[0].message });
    }

    const { referenceId, otp } = value;
    const userId = req.user?.userId || req.user?.id;

    logger.info('Validated OTP data', {
      referenceId,
      referenceIdType: typeof referenceId,
      otp: '****',
      userId: userId || 'unauthenticated',
    });

    let user = null;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify reference ID belongs to user
      if (user.tempKycData?.referenceId !== parseInt(referenceId)) {
        return res.status(400).json({ message: 'Invalid or expired transaction' });
      }

      if (new Date() > user.tempKycData.expiresAt) {
        return res.status(400).json({ message: 'OTP expired. Please generate a new one' });
      }
    }

    // Verify OTP with Sandbox API - response contains all KYC data
    const verificationResponse = await verifyKycOtp(otp, referenceId);

    if (user) {
      // Extract KYC data from verification response
      const kyc = verificationResponse.kycData;

      logger.info('Received KYC data', {
        status: kyc.status,
        name: kyc.name,
        hasPhoto: !!kyc.photo,
      });

      // Update user with verified KYC details
      user.fullName = kyc.name || user.fullName;
      
      // Parse date_of_birth (format: DD-MM-YYYY)
      if (kyc.date_of_birth) {
        const [day, month, year] = kyc.date_of_birth.split('-');
        user.dob = new Date(`${year}-${month}-${day}`);
        user.markModified('dob');
      }
      
      user.gender = kyc.gender || user.gender;
      
      // Store address from KYC
      if (kyc.address) {
        user.address = {
          line1: kyc.address.house || '',
          line2: kyc.address.street || '',
          city: kyc.address.district || '',
          state: kyc.address.state || '',
          pinCode: kyc.address.pincode?.toString() || '',
          country: kyc.address.country || 'India',
        };
        // Ensure Mongoose detects the change
        user.markModified('address');
      }

      // Store full address string
      if (kyc.full_address) {
        user.address.fullAddress = kyc.full_address;
        user.markModified('address');
      }

      // Store all KYC details from Aadhaar verification
      user.kycData = {
        // Basic details
        careOf: kyc.care_of,
        emailHash: kyc.email_hash,
        mobileHash: kyc.mobile_hash,
        photo: kyc.photo, // Base64 encoded photo
        shareCode: kyc.share_code,
        yearOfBirth: kyc.year_of_birth,
        aadhaarLastFour: kyc.aadhaar_last_four,
        registrar: kyc.registrar,
        
        // Dates and validity
        issueDate: kyc.issue_date ? new Date(kyc.issue_date) : undefined,
        expiryDate: kyc.expiry_date ? new Date(kyc.expiry_date) : undefined,
        
        // Verification details
        status: kyc.status,
        message: kyc.message,
        faceMatch: kyc.face_match,
        hasPhoto: kyc.has_photo,
        
        // Metadata
        uid: kyc.uid,
      };
      // Ensure Mongoose detects nested object changes
      user.markModified('kycData');

      // Store Aadhaar hash (never store actual Aadhaar)
      const aadhaarHash = user.tempKycData?.aadhaarHash;
      
      user.aadhaarHash = aadhaarHash;
      user.kycStatus = 'verified';
      user.kycVerifiedAt = new Date();
      user.kycExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

      // Add KYC verification to activity log
      user.activityLog.push({
        action: 'kyc_updated',
        timestamp: new Date(),
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('user-agent') || 'Unknown',
        details: `KYC verified successfully from ${kyc.status === 'VALID' ? 'Aadhaar' : 'alternative'} verification`,
        category: 'security',
        severity: 'high',
      });
      user.markModified('activityLog');

      // Clean up temporary data
      user.tempKycData = undefined;
      user.markModified('tempKycData');

      logger.info('Saving KYC data to user', {
        userId: user._id,
        email: user.email,
        kycStatus: user.kycStatus,
        hasKycData: !!user.kycData,
        hasAddress: !!user.address,
        addressFields: user.address ? Object.keys(user.address) : [],
      });

      await user.save();

      logger.info('User saved successfully with KYC data', {
        userId: user._id,
        savedKycStatus: user.kycStatus,
        savedKycVerifiedAt: user.kycVerifiedAt,
      });

      // Log KYC verification to blockchain
      try {
        await logCustodyAction('user_kyc', 'kyc_verified', aadhaarHash);
      } catch (blockchainError) {
        logger.warn('Blockchain logging failed but KYC verified', { error: blockchainError.message });
      }

      // Send verification email
      try {
        await sendKycStatusEmail(user.email, 'verified', 'Your Aadhaar KYC has been successfully verified.');
      } catch (emailError) {
        logger.warn('KYC email notification failed', { error: emailError.message });
      }

      logger.info('KYC verified successfully', {
        userId: user._id,
        kycStatus: 'verified',
        fullName: user.fullName,
        kycDataSaved: user.kycData?.careOf ? 'yes' : 'no',
      });

      res.status(200).json({
        success: true,
        message: 'KYC verified successfully',
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          dob: user.dob,
          gender: user.gender,
          address: user.address,
          kycStatus: user.kycStatus,
          kycVerifiedAt: user.kycVerifiedAt,
          kycExpiry: user.kycExpiry,
          kycData: user.kycData,
        },
      });
    } else {
      // Unauthenticated verification (for login flow)
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        verificationToken: verificationResponse.transactionId,
        kycVerified: true,
        kycData: verificationResponse.kycData,
      });
    }
  } catch (error) {
    logger.error('KYC OTP verification failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId || 'unauthenticated',
    });
    res.status(400).json({
      success: false,
      message: error.message || 'OTP verification failed',
    });
  }
};

// Get KYC status for current user
exports.getKycStatus = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('kycStatus kycVerifiedAt kycExpiry');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      kycStatus: user.kycStatus,
      kycVerifiedAt: user.kycVerifiedAt,
      kycExpiry: user.kycExpiry,
      isExpired: user.kycExpiry && new Date() > new Date(user.kycExpiry),
    });
  } catch (error) {
    logger.error('Get KYC status failed', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all KYC requests
exports.getAllKycRequests = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { page = 1, limit = 10, status } = req.query;
    const filter = status 
      ? { kycStatus: status } 
      : { $and: [{ kycStatus: { $ne: 'verified' } }, { kycStatus: { $ne: 'pending' } }] };
    
    const users = await User.find(filter)
      .select('email phone fullName kycStatus kycVerifiedAt aadhaarHash createdAt address')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ kycVerifiedAt: -1 });

    const total = await User.countDocuments(filter);

    logger.info('Admin fetched KYC requests', { page, limit, total, adminId: req.user.userId });

    res.status(200).json({
      success: true,
      kycRequests: users,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    logger.error('Get KYC requests failed', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update KYC status
exports.updateKycStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId, status, reason } = req.body;
    const allowedStatuses = ['verified', 'rejected', 'expired'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.kycStatus === 'verified' && status !== 'expired') {
      return res.status(400).json({ message: 'KYC already verified' });
    }

    // Update status
    user.kycStatus = status;
    if (status === 'verified') {
      user.kycVerifiedAt = new Date();
      user.kycExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    } else if (status === 'rejected') {
      user.kycRejectionReason = reason || 'Rejected by admin';
    }
    await user.save();

    // Log action
    const userHash = user.aadhaarHash || generateHash(user.email);
    try {
      await logCustodyAction('user_kyc', `kyc_${status}`, userHash);
    } catch (error) {
      logger.warn('Blockchain logging failed', { error: error.message });
    }

    // Notify user
    const message = status === 'verified' 
      ? 'Your KYC has been approved.' 
      : `Your KYC has been ${status}: ${reason || ''}`;
    try {
      await sendKycStatusEmail(user.email, status, message);
    } catch (error) {
      logger.warn('KYC email notification failed', { error: error.message });
    }

    logger.info('Admin updated KYC status', {
      userId,
      status,
      adminId: req.user.userId,
    });

    res.status(200).json({
      success: true,
      message: `KYC ${status} successfully`,
    });
  } catch (error) {
    logger.error('Update KYC status failed', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};