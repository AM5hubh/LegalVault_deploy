// Mock blockchain service for development
const logger = require("../utils/logger");

// Mock function for adding evidence to blockchain
const addEvidence = async (evidenceId, hash, uri, userHash) => {
  try {
    const transactionHash = `0x${Math.random().toString(16).slice(2, 66)}`;

    logger.info("Evidence anchored to blockchain (mock)", {
      evidenceId,
      hash,
      uri,
      userHash,
      transactionHash,
      timestamp: new Date().toISOString(),
    });

    return transactionHash;
  } catch (error) {
    logger.error("addEvidence failed", { error: error.message, evidenceId });
    throw error;
  }
};

// Mock function for verifying evidence hash on blockchain
const verifyEvidence = async (evidenceId, hash) => {
  try {
    logger.info("Evidence verification requested (mock)", {
      evidenceId,
      hash,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    logger.error("verifyEvidence failed", { error: error.message, evidenceId });
    return false;
  }
};

// Mock function for logging custody actions
const logCustodyAction = async (action, type, hash, metadata = {}) => {
  try {
    // For development, just log to console
    logger.info("Blockchain action logged", {
      action,
      type,
      hash,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // Return a mock transaction hash
    return {
      success: true,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: Math.floor(Math.random() * 1000000),
    };
  } catch (error) {
    logger.error("Blockchain logging failed", { error: error.message });
    return {
      success: false,
      error: error.message,
    };
  }
};

// Mock function for generating user hash
const generateUserHash = (email, aadhaar = "") => {
  const crypto = require("crypto");
  return crypto
    .createHash("sha256")
    .update(email + aadhaar)
    .digest("hex");
};

module.exports = {
  addEvidence,
  verifyEvidence,
  logCustodyAction,
  generateUserHash,
};
