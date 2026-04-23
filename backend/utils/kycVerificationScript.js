/**
 * KYC Data Verification and Validation Script
 * Run this to diagnose and repair KYC data issues
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('./logger');

/**
 * Verify and report KYC data completeness
 */
async function verifyKycData() {
  try {
    // Count users with verified KYC
    const verifiedCount = await User.countDocuments({ kycStatus: 'verified' });
    logger.info(`Total verified KYC users: ${verifiedCount}`);

    // Find users with incomplete KYC data
    const incompleteKyc = await User.find({
      kycStatus: 'verified',
      $or: [
        { kycData: { $exists: false } },
        { 'kycData.careOf': { $exists: false } },
        { kycVerifiedAt: { $exists: false } },
        { aadhaarHash: { $exists: false } }
      ]
    }).select('email fullName kycStatus kycData aadhaarHash kycVerifiedAt');

    if (incompleteKyc.length > 0) {
      logger.warn(`Found ${incompleteKyc.length} users with INCOMPLETE KYC data:`);
      incompleteKyc.forEach(user => {
        logger.warn(`  - ${user.email}: missing fields`, {
          hasKycData: !!user.kycData && Object.keys(user.kycData).length > 0,
          hasAadhaarHash: !!user.aadhaarHash,
          hasKycVerifiedAt: !!user.kycVerifiedAt,
          kycDataKeys: user.kycData ? Object.keys(user.kycData) : []
        });
      });
    } else {
      logger.info('✓ All verified users have complete KYC data');
    }

    // Sample verified user
    const sampleUser = await User.findOne({ kycStatus: 'verified' });
    if (sampleUser) {
      logger.info('Sample verified user document:', {
        email: sampleUser.email,
        fullName: sampleUser.fullName,
        kycStatus: sampleUser.kycStatus,
        kycVerifiedAt: sampleUser.kycVerifiedAt,
        kycExpiry: sampleUser.kycExpiry,
        hasAadhaarHash: !!sampleUser.aadhaarHash,
        kycDataFields: sampleUser.kycData ? Object.keys(sampleUser.kycData) : [],
        addressFields: sampleUser.address ? Object.keys(sampleUser.address) : [],
        hasDob: !!sampleUser.dob,
        hasGender: !!sampleUser.gender
      });

      // Log full KYC data structure
      logger.info('Full KYC data structure:', {
        kycData: sampleUser.kycData,
        address: sampleUser.address,
        dob: sampleUser.dob,
        gender: sampleUser.gender
      });
    }

    return {
      success: true,
      totalVerified: verifiedCount,
      incompleteCount: incompleteKyc.length,
      incompleteUsers: incompleteKyc.map(u => ({
        email: u.email,
        fullName: u.fullName
      }))
    };
  } catch (error) {
    logger.error('KYC verification failed:', { error: error.message });
    throw error;
  }
}

/**
 * Fix missing KYC fields (use with caution!)
 */
async function fixIncompleteKycData() {
  try {
    const incompleteUsers = await User.find({
      kycStatus: 'verified',
      $or: [
        { kycVerifiedAt: { $exists: false } },
        { kycExpiry: { $exists: false } }
      ]
    });

    let fixed = 0;
    for (const user of incompleteUsers) {
      if (!user.kycVerifiedAt) {
        user.kycVerifiedAt = new Date();
      }
      if (!user.kycExpiry) {
        user.kycExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      }
      
      user.markModified('kycVerifiedAt');
      user.markModified('kycExpiry');
      
      await user.save();
      fixed++;
    }

    logger.info(`Fixed ${fixed} users with missing KYC timestamps`);
    return { success: true, fixed };
  } catch (error) {
    logger.error('Fix incomplete KYC data failed:', { error: error.message });
    throw error;
  }
}

/**
 * Export KYC data to JSON for backup
 */
async function exportKycData(outputPath = './kyc_backup.json') {
  try {
    const users = await User.find({ kycStatus: 'verified' })
      .select('email fullName kycStatus kycVerifiedAt kycExpiry kycData address dob gender')
      .lean();

    const fs = require('fs');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(users, null, 2)
    );

    logger.info(`Exported ${users.length} users to ${outputPath}`);
    return { success: true, count: users.length, path: outputPath };
  } catch (error) {
    logger.error('Export KYC data failed:', { error: error.message });
    throw error;
  }
}

module.exports = {
  verifyKycData,
  fixIncompleteKycData,
  exportKycData
};

// Run if called directly
if (require.main === module) {
  const mongoUri = process.env.MONGO_URI;
  
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(async () => {
      logger.info('Connected to MongoDB');
      
      // Run verification
      const result = await verifyKycData();
      
      // Optionally fix missing fields
      // await fixIncompleteKycData();
      
      // Optionally export data
      // await exportKycData();
      
      logger.info('Verification complete:', result);
      process.exit(0);
    })
    .catch(error => {
      logger.error('Database connection failed:', { error: error.message });
      process.exit(1);
    });
}
