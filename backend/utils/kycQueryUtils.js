/**
 * MongoDB KYC Data Query Utilities
 * Use these scripts to verify KYC data in the database
 */

// MongoDB Shell Commands
// Run these in MongoDB Atlas Web Shell or mongosh

// ==========================================
// 1. CHECK KYC DATA FOR VERIFIED USERS
// =========================================
db.users.find({
  kycStatus: "verified"
}, {
  email: 1,
  fullName: 1,
  kycStatus: 1,
  kycVerifiedAt: 1,
  kycExpiry: 1,
  aadhaarHash: 1,
  dob: 1,
  gender: 1,
  address: 1,
  kycData: 1
});

// ==========================================
// 2. COUNT USERS WITH COMPLETE KYC DATA
// =========================================
db.users.countDocuments({
  kycStatus: "verified",
  kycData: { $exists: true, $ne: {} },
  address: { $exists: true, $ne: {} }
});

// ==========================================
// 3. GET SPECIFIC USER KYC DATA
// =========================================
db.users.findOne({
  email: "xebyl@mailinator.com"
}, {
  projection: {
    email: 1,
    fullName: 1,
    phone: 1,
    kycStatus: 1,
    kycVerifiedAt: 1,
    kycExpiry: 1,
    aadhaarHash: 1,
    kycData: 1,
    address: 1,
    dob: 1,
    gender: 1
  }
});

// ==========================================
// 4. CHECK FOR MISSING KYC FIELDS
// =========================================
db.users.find({
  kycStatus: "verified",
  $or: [
    { kycData: { $exists: false } },
    { kycData: {} },
    { address: { $exists: false } },
    { address: { $eq: { country: "India" } } },
    { aadhaarHash: { $exists: false } }
  ]
}, {
  email: 1,
  kycStatus: 1,
  kycData: 1,
  address: 1,
  aadhaarHash: 1
});

// ==========================================
// 5. UPDATE KYC EXPIRY (IF NEEDED)
// =========================================
db.users.updateMany({
  kycStatus: "verified",
  kycExpiry: { $exists: false }
}, {
  $set: {
    kycExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  }
});

// ==========================================
// 6. VIEW ACTIVITY LOG FOR KYC UPDATES
// =========================================
db.users.findOne({
  email: "xebyl@mailinator.com"
}, {
  activityLog: {
    $filter: {
      input: "$activityLog",
      as: "log",
      cond: { $eq: ["$$log.action", "kyc_updated"] }
    }
  }
});

// ==========================================
// Node.js Query Examples
// =========================================

/**
 * Usage in Node.js:
 * 
 * const User = require('../models/User');
 * 
 * // Get user with full KYC data
 * const user = await User.findById(userId).select(
 *   'email fullName kycStatus kycVerifiedAt kycExpiry aadhaarHash kycData address dob gender'
 * );
 * 
 * // Check if KYC data exists
 * if (user.kycData && Object.keys(user.kycData).length > 0) {
 *   console.log('KYC Data exists:', user.kycData);
 * } else {
 *   console.log('KYC Data missing or empty');
 * }
 * 
 * // Update KYC data
 * user.kycData = {
 *   careOf: 'S/O: Father Name',
 *   emailHash: 'hashed...',
 *   mobileHash: 'hashed...',
 *   photo: 'base64...',
 *   shareCode: '1234',
 *   yearOfBirth: 1990,
 *   status: 'VALID',
 *   message: 'Aadhaar verified'
 * };
 * user.markModified('kycData');
 * await user.save();
 */
