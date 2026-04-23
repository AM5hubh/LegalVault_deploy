/**
 * KYC Flow Test and Debug Utility
 * This script tests the entire KYC flow and identifies persistence issues
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('./logger');

/**
 * Test 1: Schema validation - Ensure KYC fields can be saved
 */
async function testSchemaValidation() {
  try {
    logger.info('=== TEST 1: Schema Validation ===');

    const testUser = new User({
      email: `test-kyc-${Date.now()}@test.com`,
      password: 'testPassword123',
      fullName: 'Test KYC User',
      phone: '9999999999',
    });

    // Test 1a: Set simple fields
    logger.info('Setting simple fields...');
    testUser.kycStatus = 'verified';
    testUser.kycVerifiedAt = new Date();
    testUser.kycExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    testUser.aadhaarHash = 'abc123hash';

    // Test 1b: Set nested objects
    logger.info('Setting nested objects...');
    testUser.address = {
      line1: '123 Main St',
      line2: 'Apt 4B',
      city: 'Delhi',
      state: 'Delhi',
      pinCode: '110001',
      country: 'India',
      fullAddress: '123 Main St, Apt 4B, Delhi, Delhi 110001, India',
    };

    testUser.kycData = {
      careOf: 'Father Name',
      emailHash: 'hash@email',
      mobileHash: 'hash@mobile',
      photo: 'data:image/jpeg,base64string...',
      shareCode: 'ABC123',
      yearOfBirth: 1990,
      status: 'VALID',
      message: 'Success',
    };

    testUser.dob = new Date('1990-01-15');
    testUser.gender = 'M';

    // Test 1c: Save the user
    logger.info('Saving user with KYC data...');
    const savedUser = await testUser.save();

    logger.info('✓ User saved successfully');

    // Test 1d: Verify all fields were saved
    const retrievedUser = await User.findById(savedUser._id);

    const results = {
      kycStatus: retrievedUser.kycStatus === 'verified',
      kycVerifiedAt: !!retrievedUser.kycVerifiedAt,
      kycExpiry: !!retrievedUser.kycExpiry,
      aadhaarHash: retrievedUser.aadhaarHash === 'abc123hash',
      addressLine1: retrievedUser.address?.line1 === '123 Main St',
      addressCity: retrievedUser.address?.city === 'Delhi',
      kycDataCareOf: retrievedUser.kycData?.careOf === 'Father Name',
      kycDataPhoto: !!retrievedUser.kycData?.photo,
      dob: !!retrievedUser.dob,
      gender: retrievedUser.gender === 'M',
    };

    logger.info('Schema Validation Results:', results);

    // Clean up
    await User.findByIdAndDelete(savedUser._id);

    return {
      success: Object.values(results).every(v => v),
      details: results,
    };
  } catch (error) {
    logger.error('Schema validation test failed', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: markModified behavior - Ensure markModified works
 */
async function testMarkModified() {
  try {
    logger.info('=== TEST 2: markModified Behavior ===');

    // Create and save user
    const testUser = new User({
      email: `test-markmod-${Date.now()}@test.com`,
      password: 'testPassword123',
      fullName: 'Test markModified',
    });

    const savedUser = await testUser.save();
    logger.info('✓ User created');

    // Now update nested objects
    const retrievedUser = await User.findById(savedUser._id);

    logger.info('Setting address with markModified...');
    retrievedUser.address = {
      line1: 'Test Address 1',
      line2: 'Test Address 2',
      city: 'Test City',
      state: 'Test State',
      pinCode: '123456',
      country: 'India',
    };
    retrievedUser.markModified('address');

    logger.info('Setting kycData with markModified...');
    retrievedUser.kycData = {
      careOf: 'Test Care Of',
      emailHash: 'test@hash',
      mobileHash: 'mobile@hash',
      photo: 'photo_data',
      shareCode: 'TEST123',
      yearOfBirth: 1990,
      status: 'VALID',
      message: 'Test',
    };
    retrievedUser.markModified('kycData');

    await retrievedUser.save();
    logger.info('✓ User updated with markModified');

    // Verify
    const finalUser = await User.findById(savedUser._id);

    const results = {
      addressSaved: !!finalUser.address?.line1,
      kycDataSaved: !!finalUser.kycData?.careOf,
      addressCity: finalUser.address?.city === 'Test City',
      kycDataPhoto: finalUser.kycData?.photo === 'photo_data',
    };

    logger.info('markModified Results:', results);

    // Clean up
    await User.findByIdAndDelete(savedUser._id);

    return {
      success: Object.values(results).every(v => v),
      details: results,
    };
  } catch (error) {
    logger.error('markModified test failed', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: Bulk KYC field update
 */
async function testBulkKycUpdate() {
  try {
    logger.info('=== TEST 3: Bulk KYC Update ===');

    // Create test user
    const testUser = new User({
      email: `test-bulk-${Date.now()}@test.com`,
      password: 'testPassword123',
      fullName: 'Test Bulk Update',
    });

    const savedUser = await testUser.save();

    // Update with all KYC fields at once
    const updatedUser = await User.findByIdAndUpdate(
      savedUser._id,
      {
        $set: {
          kycStatus: 'verified',
          kycVerifiedAt: new Date(),
          kycExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          aadhaarHash: 'test_hash_123',
          'kycData.careOf': 'Care Of Name',
          'kycData.emailHash': 'email_hash',
          'kycData.mobileHash': 'mobile_hash',
          'kycData.photo': 'photo_data',
          'kycData.shareCode': 'SHARE123',
          'kycData.yearOfBirth': 1990,
          'kycData.status': 'VALID',
          'kycData.message': 'Success',
          'address.line1': 'Line 1',
          'address.city': 'Delhi',
          'address.state': 'Delhi',
          'address.pinCode': '110001',
          'address.country': 'India',
          dob: new Date('1990-01-15'),
          gender: 'M',
        }
      },
      { new: true }
    );

    logger.info('✓ User updated with bulk KYC fields');

    const results = {
      kycStatus: updatedUser.kycStatus === 'verified',
      kycVerifiedAt: !!updatedUser.kycVerifiedAt,
      aadhaarHash: updatedUser.aadhaarHash === 'test_hash_123',
      careOf: updatedUser.kycData?.careOf === 'Care Of Name',
      addressCity: updatedUser.address?.city === 'Delhi',
      dob: !!updatedUser.dob,
    };

    logger.info('Bulk Update Results:', results);

    // Clean up
    await User.findByIdAndDelete(savedUser._id);

    return {
      success: Object.values(results).every(v => v),
      details: results,
    };
  } catch (error) {
    logger.error('Bulk update test failed', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Test 4: Check existing verified users for missing fields
 */
async function testExistingVerifiedUsers() {
  try {
    logger.info('=== TEST 4: Analyze Existing Verified Users ===');

    const verifiedUsers = await User.find({ kycStatus: 'verified' })
      .select('email kycStatus kycData address aadhaarHash kycVerifiedAt')
      .limit(5);

    const analysis = verifiedUsers.map(user => ({
      email: user.email,
      hasKycData: !!user.kycData && Object.keys(user.kycData).length > 0,
      kycDataFields: user.kycData ? Object.keys(user.kycData) : [],
      hasFullAddress: !!user.address && !!user.address.line1,
      addressFields: user.address ? Object.keys(user.address) : [],
      hasAadhaarHash: !!user.aadhaarHash,
      hasKycVerifiedAt: !!user.kycVerifiedAt,
      missingFields: getMissingFields(user),
    }));

    logger.info('Verified Users Analysis:', analysis);

    return {
      success: true,
      verifiedCount: verifiedUsers.length,
      analysis,
    };
  } catch (error) {
    logger.error('Existing users test failed', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Helper: Identify missing KYC fields
 */
function getMissingFields(user) {
  const required = [
    'kycData.careOf',
    'kycData.emailHash',
    'kycData.mobileHash',
    'kycData.photo',
    'address.line1',
    'address.city',
    'address.state',
    'aadhaarHash',
    'kycVerifiedAt',
  ];

  const missing = [];

  required.forEach(field => {
    const [main, sub] = field.split('.');
    const value = sub ? user[main]?.[sub] : user[field];
    if (!value) {
      missing.push(field);
    }
  });

  return missing;
}

/**
 * Run all tests
 */
async function runAllTests() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      logger.error('MONGO_URI not set in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('✓ Connected to MongoDB');
    logger.info('Starting KYC Flow Tests...\n');

    const test1 = await testSchemaValidation();
    logger.info(`Test 1 Result: ${test1.success ? '✓ PASSED' : '✗ FAILED'}\n`);

    const test2 = await testMarkModified();
    logger.info(`Test 2 Result: ${test2.success ? '✓ PASSED' : '✗ FAILED'}\n`);

    const test3 = await testBulkKycUpdate();
    logger.info(`Test 3 Result: ${test3.success ? '✓ PASSED' : '✗ FAILED'}\n`);

    const test4 = await testExistingVerifiedUsers();
    logger.info(`Test 4 Result: ${test4.success ? '✓ PASSED' : '✗ FAILED'}\n`);

    logger.info('========== TEST SUMMARY ==========');
    logger.info(`Schema Validation: ${test1.success ? '✓ PASSED' : '✗ FAILED'}`);
    logger.info(`markModified: ${test2.success ? '✓ PASSED' : '✗ FAILED'}`);
    logger.info(`Bulk Update: ${test3.success ? '✓ PASSED' : '✗ FAILED'}`);
    logger.info(`Existing Users: ${test4.success ? '✓ PASSED' : '✗ FAILED'}`);

    const allPassed = test1.success && test2.success && test3.success && test4.success;
    logger.info(`\nOverall: ${allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);

    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    logger.error('Test suite failed', { error: error.message });
    process.exit(1);
  }
}

module.exports = {
  testSchemaValidation,
  testMarkModified,
  testBulkKycUpdate,
  testExistingVerifiedUsers,
  runAllTests,
};

// Run if called directly
if (require.main === module) {
  runAllTests();
}
