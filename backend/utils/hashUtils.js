const crypto = require('crypto');

// Generate SHA-256 hash for a buffer or string
function generateHash(data) {
  try {
    return crypto.createHash('sha256').update(data).digest('hex');
  } catch (error) {
    throw new Error(`Hash generation failed: ${error.message}`);
  }
}

// Generate hash for Aadhaar number (for KYC)
function generateAadhaarHash(aadhaarNumber) {
  try {
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      throw new Error('Invalid Aadhaar number');
    }
    return generateHash(aadhaarNumber);
  } catch (error) {
    throw new Error(`Aadhaar hash generation failed: ${error.message}`);
  }
}

// Generate hash for user identifier (e.g., email + Aadhaar hash for blockchain)
function generateUserHash(email, aadhaarHash) {
  try {
    return generateHash(`${email}:${aadhaarHash}`);
  } catch (error) {
    throw new Error(`User hash generation failed: ${error.message}`);
  }
}

module.exports = {
  generateHash,
  generateAadhaarHash,
  generateUserHash,
};

