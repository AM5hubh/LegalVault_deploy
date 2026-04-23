
const crypto = require('crypto');


// Check if ENCRYPTION_KEY exists before using it
const encryptionKey = process.env.ENCRYPTION_KEY;
if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
}

const key = Buffer.from(encryptionKey, 'hex');
const algorithm = 'aes-256-gcm';
const ivLength = 16; // AES block size

// Encrypt sensitive data (e.g., PAN number)
function encryptData(data) {
  try {
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

// Decrypt sensitive data
function decryptData(encryptedData) {
  try {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

module.exports = {
  encryptData,
  decryptData,
};

