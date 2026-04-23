const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

const SANDBOX_BASE_URL = 'https://api.sandbox.co.in';
const SANDBOX_TEST_URL = 'https://api.sandbox.co.in';
const API_KEY = process.env.SANDBOX_API_KEY;
const API_SECRET = process.env.SANDBOX_API_SECRET;
const ACCESS_TOKEN = process.env.SANDBOX_ACCESS_TOKEN;

// Validate API credentials
function validateApiCredentials() {
  if (!API_KEY || !API_SECRET) {
    throw new Error(
      'Sandbox API credentials not configured. Please set SANDBOX_API_KEY and SANDBOX_API_SECRET in .env'
    );
  }
  if (API_KEY.length < 10) {
    throw new Error('Invalid SANDBOX_API_KEY format');
  }
  if (API_SECRET.length < 10) {
    throw new Error('Invalid SANDBOX_API_SECRET format');
  }
}

// Generate JWT token for Sandbox API - using proper format
function generateSandboxJWT() {
  try {
    validateApiCredentials();

    const iat = Math.floor(Date.now() / 1000);
    const payload = {
      iss: 'in.co.sandbox.kyc.client',
      aud: 'api.sandbox.co.in',
      iat: iat,
      exp: iat + 3600,
      // Add additional claims that Sandbox may require
      sub: 'kyc_client',
    };

    const token = jwt.sign(payload, API_SECRET, {
      algorithm: 'HS256',
      header: {
        typ: 'JWT',
        alg: 'HS256',
      },
    });

    logger.info('JWT token generated for Sandbox API', { iss: payload.iss });
    return token;
  } catch (error) {
    logger.error('JWT generation failed for Sandbox API', {
      error: error.message,
    });
    throw new Error('Failed to generate Sandbox API authentication token: ' + error.message);
  }
}

// Generate OTP for Aadhaar KYC
async function generateKycOtp(aadhaarNumber, consent = 'Y', reason = 'kyc_verification') {
  try {
    // Validate input
    if (!aadhaarNumber || aadhaarNumber.length !== 12 || !/^\d+$/.test(aadhaarNumber)) {
      throw new Error('Invalid Aadhaar number. Must be 12 digits.');
    }

    if (!ACCESS_TOKEN) {
      throw new Error(
        'Sandbox access token not configured. Please set SANDBOX_ACCESS_TOKEN in .env'
      );
    }

    logger.info('Attempting to generate KYC OTP', {
      aadhaarLastFour: aadhaarNumber.slice(-4),
    });

    const payload = {
      '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.otp.request',
      aadhaar_number: aadhaarNumber,
      consent: consent.toUpperCase(),
      reason: reason,
    };

    const headers = {
      'x-api-key': API_KEY,
      'x-api-version': '1',
      'Authorization': ACCESS_TOKEN,
      'Content-Type': 'application/json',
    };

    logger.info('Sending request to Sandbox API', {
      endpoint: '/kyc/aadhaar/okyc/otp',
      aadhaarLastFour: aadhaarNumber.slice(-4),
      'x-api-key': 'key_****' + API_KEY.slice(-4),
    });

    const response = await axios.post(
      `${SANDBOX_BASE_URL}/kyc/aadhaar/okyc/otp`,
      payload,
      { headers, timeout: 10000 }
    );

    logger.info('KYC OTP generated successfully', {
      transactionId: response.data.transaction_id,
      referenceId: response.data.data?.reference_id,
      referenceIdType: typeof response.data.data?.reference_id,
    });

    return {
      success: true,
      transactionId: response.data.transaction_id,
      referenceId: String(response.data.data?.reference_id),
      message: response.data.data?.message || 'OTP sent successfully',
      timestamp: response.data.timestamp,
    };
  } catch (error) {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;

    logger.error('KYC OTP generation failed', {
      error: errorMessage,
      status: status,
      aadhaarLastFour: aadhaarNumber?.slice(-4),
    });

    // Provide helpful error messages
    if (status === 403) {
      throw new Error(
        `Insufficient privilege: Your Sandbox API key does not have KYC permissions. ` +
        `Visit https://developer.sandbox.co.in/ and ensure KYC endpoints are enabled for your API credentials.`
      );
    } else if (status === 401) {
      throw new Error(
        `Authentication failed: Invalid/expired access token. ` +
        `Please update SANDBOX_ACCESS_TOKEN in .env`
      );
    } else if (status === 422) {
      throw new Error(`Invalid Aadhaar number: ${errorMessage}`);
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to Sandbox API. Please check your internet connection.');
    }

    throw new Error(`KYC OTP generation failed: ${errorMessage}`);
  }
}

// Verify OTP and retrieve KYC details
async function verifyKycOtp(otp, referenceId) {
  try {
    if (!otp || !referenceId) {
      throw new Error('Missing required parameters: otp, referenceId');
    }

    // Ensure OTP is a string with exactly 6 digits
    const otpStr = String(otp).trim();
    if (!/^\d{6}$/.test(otpStr)) {
      throw new Error('Invalid OTP format. Must be 6 digits.');
    }

    // Ensure referenceId is a string
    const refIdStr = String(referenceId).trim();

    if (!ACCESS_TOKEN) {
      throw new Error('Sandbox access token not configured. Please set SANDBOX_ACCESS_TOKEN in .env');
    }

    // Prepare payload exactly as per Sandbox API specification
    const payload = {
      '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request',
      reference_id: refIdStr,
      otp: otpStr,
    };

    const headers = {
      'x-api-key': API_KEY,
      'Authorization': ACCESS_TOKEN,
      'x-api-version': '1',
      'Content-Type': 'application/json',
    };

    logger.info('Verifying OTP with Sandbox API', {
      referenceId: refIdStr,
      endpoint: '/kyc/aadhaar/okyc/otp/verify',
      payload: payload,
    });

    const response = await axios.post(
      `${SANDBOX_BASE_URL}/kyc/aadhaar/okyc/otp/verify`,
      payload,
      { 
        headers, 
        timeout: 10000,
        validateStatus: function (status) {
          return status < 500; // Resolve for all status codes less than 500
        }
      }
    );

    // Check if response has error message from Sandbox
    if (response.status === 200 && response.data?.code === 200) {
      logger.info('KYC OTP verified successfully', {
        transactionId: response.data.transaction_id,
        referenceId: refIdStr,
        status: response.data.data?.status,
      });

      return {
        success: true,
        transactionId: response.data.transaction_id,
        kycData: response.data.data,
        timestamp: response.data.timestamp,
      };
    } else if (response.status === 200 && response.data?.data?.message) {
      // Handle specific messages like "OTP Expired", "Invalid OTP", "Request under process"
      throw new Error(response.data.data.message);
    } else if (response.status === 422) {
      throw new Error(`Invalid request format: ${response.data?.message || 'Unspecified error'}`);
    } else {
      throw new Error(`Sandbox API error: ${response.data?.message || `Status ${response.status}`}`);
    }
  } catch (error) {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;

    logger.error('KYC OTP verification failed', {
      error: errorMessage,
      status: status,
      referenceId: String(referenceId),
    });

    if (status === 403) {
      throw new Error(
        `Insufficient privilege: Your Sandbox API key does not have KYC permissions. ` +
        `Visit https://developer.sandbox.co.in/ to enable KYC endpoints.`
      );
    } else if (status === 401) {
      throw new Error('Authentication failed: Invalid/expired access token.');
    } else if (status === 422) {
      throw new Error(`Invalid request body to Sandbox API: ${errorMessage}`);
    }

    throw new Error(`KYC OTP verification failed: ${errorMessage}`);
  }
}

module.exports = {
  generateKycOtp,
  verifyKycOtp,
  generateSandboxJWT,
  validateApiCredentials,
};

