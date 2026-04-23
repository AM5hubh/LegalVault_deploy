/**
 * KYC Debug Utilities
 * Use these functions to test and debug KYC OTP flow
 */

const axios = require('axios');
const logger = require('./logger');

// Test the KYC OTP generation and verification flow
async function testKycFlow() {
  const SANDBOX_BASE_URL = 'https://api.sandbox.co.in';
  
  // Get credentials from environment
  const API_KEY = process.env.SANDBOX_API_KEY;
  const API_SECRET = process.env.SANDBOX_API_SECRET;
  const ACCESS_TOKEN = process.env.SANDBOX_ACCESS_TOKEN;

  logger.info('KYC Debug: Testing Sandbox API connection', {
    apiKeyExists: !!API_KEY,
    apiSecretExists: !!API_SECRET,
    accessTokenExists: !!ACCESS_TOKEN,
    apiKeyLen: API_KEY?.length,
    accessTokenLen: ACCESS_TOKEN?.length,
  });

  if (!API_KEY || !API_SECRET || !ACCESS_TOKEN) {
    throw new Error(
      'Missing Sandbox credentials. Check SANDBOX_API_KEY, SANDBOX_API_SECRET, and SANDBOX_ACCESS_TOKEN in .env'
    );
  }

  // Test headers format
  const headers = {
    'x-api-key': API_KEY,
    'Authorization': ACCESS_TOKEN,
    'x-api-version': '1',
    'Content-Type': 'application/json',
  };

  logger.info('KYC Debug: Headers prepared', {
    headerKeys: Object.keys(headers),
    hasApiKey: !!headers['x-api-key'],
    hasAuth: !!headers['Authorization'],
  });

  // Test with a valid 12-digit Aadhaar (test number)
  const testAadhaar = '123456789012';
  const testOtpPayload = {
    '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.otp.request',
    aadhaar_number: testAadhaar,
    consent: 'Y',
    reason: 'kyc_verification',
  };

  logger.info('KYC Debug: Testing OTP generation payload', {
    endpoint: '/kyc/aadhaar/okyc/otp',
    payload: testOtpPayload,
  });

  try {
    const response = await axios.post(
      `${SANDBOX_BASE_URL}/kyc/aadhaar/okyc/otp`,
      testOtpPayload,
      { headers, timeout: 10000 }
    );

    logger.info('KYC Debug: OTP generation successful', {
      statusCode: response.status,
      transactionId: response.data.transaction_id,
      referenceId: response.data.data?.reference_id,
      referenceIdType: typeof response.data.data?.reference_id,
    });

    return {
      success: true,
      transactionId: response.data.transaction_id,
      referenceId: response.data.data?.reference_id,
      message: 'OTP generation test successful',
    };
  } catch (error) {
    logger.error('KYC Debug: OTP generation failed', {
      statusCode: error.response?.status,
      errorMessage: error.response?.data?.message,
      fullError: error.message,
      responseData: error.response?.data,
    });

    throw new Error(
      `KYC OTP generation test failed: ${error.response?.data?.message || error.message}`
    );
  }
}

// Test the payload format for OTP verification
async function testVerifyPayloadFormat(referenceId, otp = '123456') {
  logger.info('KYC Debug: Testing verify OTP payload format', {
    referenceId,
    referenceIdType: typeof referenceId,
    refIdAsString: String(referenceId),
    otp,
    otpType: typeof otp,
  });

  const payload = {
    '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request',
    reference_id: String(referenceId),
    otp: String(otp),
  };

  logger.info('KYC Debug: Verify OTP payload', {
    payload,
    payloadStringified: JSON.stringify(payload),
  });

  return payload;
}

module.exports = {
  testKycFlow,
  testVerifyPayloadFormat,
};
