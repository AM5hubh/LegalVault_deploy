/**
 * KYC Alternative Update Method
 * Use this if the standard kycController has persistence issues
 * This method uses MongoDB's $set operator for guaranteed updates
 */

const User = require('../models/User');
const logger = require('./logger');
const crypto = require('crypto');

/**
 * Alternative approach: Use findByIdAndUpdate with $set operator
 * This ensures all fields are properly persisted to MongoDB
 */
async function updateUserKycDataViaMongoDB(userId, kycDetails) {
  try {
    logger.info('Updating KYC data via MongoDB $set operator', {
      userId,
      kycStatus: kycDetails.kycStatus,
      hasAddress: !!kycDetails.address,
    });

    const updateData = {
      $set: {
        kycStatus: kycDetails.kycStatus || 'verified',
        kycVerifiedAt: kycDetails.kycVerifiedAt || new Date(),
        kycExpiry: kycDetails.kycExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        aadhaarHash: kycDetails.aadhaarHash,
        fullName: kycDetails.fullName,
        dob: kycDetails.dob,
        gender: kycDetails.gender,
        // Address fields using dot notation
        'address.line1': kycDetails.address?.line1 || '',
        'address.line2': kycDetails.address?.line2 || '',
        'address.city': kycDetails.address?.city || '',
        'address.state': kycDetails.address?.state || '',
        'address.pinCode': kycDetails.address?.pinCode || '',
        'address.country': kycDetails.address?.country || 'India',
        'address.fullAddress': kycDetails.address?.fullAddress || '',
        // KYC data fields using dot notation
        'kycData.careOf': kycDetails.kycData?.careOf || '',
        'kycData.emailHash': kycDetails.kycData?.emailHash || '',
        'kycData.mobileHash': kycDetails.kycData?.mobileHash || '',
        'kycData.photo': kycDetails.kycData?.photo || '',
        'kycData.shareCode': kycDetails.kycData?.shareCode || '',
        'kycData.yearOfBirth': kycDetails.kycData?.yearOfBirth || null,
        'kycData.status': kycDetails.kycData?.status || '',
        'kycData.message': kycDetails.kycData?.message || '',
      },
      $push: {
        activityLog: {
          action: 'kyc_updated',
          timestamp: new Date(),
          ipAddress: kycDetails.ipAddress || 'Unknown',
          userAgent: kycDetails.userAgent || 'Unknown',
          details: kycDetails.activityDetails || 'KYC verified successfully',
          category: 'security',
          severity: 'high',
        }
      }
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error('User not found or update failed');
    }

    logger.info('KYC data updated successfully via MongoDB', {
      userId: updatedUser._id,
      kycStatus: updatedUser.kycStatus,
      hasKycData: !!updatedUser.kycData?.careOf,
      hasAddress: !!updatedUser.address?.line1,
    });

    return {
      success: true,
      user: updatedUser,
      verifiedFields: {
        kycStatus: updatedUser.kycStatus,
        hasTitle: !!updatedUser.fullName,
        hasDob: !!updatedUser.dob,
        hasGender: !!updatedUser.gender,
        hasKycData: !!updatedUser.kycData?.careOf,
        hasAddress: !!updatedUser.address?.line1,
        hasAadhaarHash: !!updatedUser.aadhaarHash,
      }
    };
  } catch (error) {
    logger.error('Failed to update KYC data via MongoDB', {
      error: error.message,
      userId,
    });
    throw error;
  }
}

/**
 * Verify persisted KYC data and repair if needed
 */
async function verifyAndRepairKycData(userId) {
  try {
    logger.info('Verifying KYC data persistence', { userId });

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const issues = [];
    const repairs = {};

    // Check each critical field
    if (!user.kycStatus || user.kycStatus !== 'verified') {
      issues.push('Invalid kycStatus');
      repairs['kycStatus'] = 'verified';
    }

    if (!user.aadhaarHash) {
      issues.push('Missing aadhaarHash');
    }

    if (!user.kycVerifiedAt) {
      issues.push('Missing kycVerifiedAt');
      repairs['kycVerifiedAt'] = new Date();
    }

    if (!user.kycExpiry) {
      issues.push('Missing kycExpiry');
      repairs['kycExpiry'] = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    // Check nested kycData
    const requiredKycFields = ['careOf', 'emailHash', 'mobileHash', 'photo'];
    const missingKycFields = requiredKycFields.filter(
      field => !user.kycData || !user.kycData[field]
    );

    if (missingKycFields.length > 0) {
      issues.push(`Missing KYC fields: ${missingKycFields.join(', ')}`);
    }

    // Check nested address
    const requiredAddressFields = ['line1', 'city', 'state', 'pinCode'];
    const missingAddressFields = requiredAddressFields.filter(
      field => !user.address || !user.address[field]
    );

    if (missingAddressFields.length > 0) {
      issues.push(`Missing address fields: ${missingAddressFields.join(', ')}`);
    }

    logger.info('KYC data verification complete', {
      userId,
      issuesFound: issues.length,
      issues,
      needsRepair: Object.keys(repairs).length > 0,
    });

    return {
      success: true,
      userId,
      issuesFound: issues,
      needsRepair: Object.keys(repairs).length > 0,
      repairsNeeded: repairs,
      fullUserData: {
        email: user.email,
        kycStatus: user.kycStatus,
        kycVerifiedAt: user.kycVerifiedAt,
        kycExpiry: user.kycExpiry,
        hasKycData: !!user.kycData,
        hasAddress: !!user.address,
      }
    };
  } catch (error) {
    logger.error('KYC verification failed', {
      error: error.message,
      userId,
    });
    throw error;
  }
}

/**
 * Bulk repair KYC data for all affected users
 */
async function bulkRepairKycData() {
  try {
    logger.info('Starting bulk KYC data repair...');

    // Find all verified users missing KYC data
    const affectedUsers = await User.find({
      kycStatus: 'verified',
      $or: [
        { 'kycData.careOf': { $exists: false } },
        { 'kycData.careOf': null },
        { 'kycData.careOf': '' },
        { kycVerifiedAt: { $exists: false } },
        { aadhaarHash: { $exists: false } }
      ]
    }).select('_id email kycData');

    logger.info(`Found ${affectedUsers.length} users needing repair`);

    let repaired = 0;
    const errors = [];

    for (const user of affectedUsers) {
      try {
        // Re-verify the user's KYC status
        const verification = await verifyAndRepairKycData(user._id);

        if (verification.needsRepair) {
          // Apply repairs
          const updateData = {
            $set: verification.repairsNeeded
          };

          await User.findByIdAndUpdate(user._id, updateData);
          repaired++;
          logger.info(`Repaired KYC for user: ${user.email}`);
        }
      } catch (error) {
        errors.push({
          userId: user._id,
          email: user.email,
          error: error.message
        });
        logger.error(`Failed to repair user ${user.email}`, { error: error.message });
      }
    }

    logger.info('Bulk repair completed', {
      total: affectedUsers.length,
      repaired,
      failed: errors.length,
    });

    return {
      success: true,
      total: affectedUsers.length,
      repaired,
      failed: errors.length,
      errors
    };
  } catch (error) {
    logger.error('Bulk repair failed', { error: error.message });
    throw error;
  }
}

module.exports = {
  updateUserKycDataViaMongoDB,
  verifyAndRepairKycData,
  bulkRepairKycData,
};
