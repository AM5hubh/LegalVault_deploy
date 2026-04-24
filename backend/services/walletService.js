/**
 * Wallet Service
 * Handles wallet verification, linking, and authentication for users
 * Integrates with Thirdweb SDK for secure authentication
 */

const User = require("../models/User");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { verifyMessage } = require("ethers");

/**
 * Generate a verification message for the user to sign with their wallet
 * @param {string} userEmail - User's email address
 * @param {string} walletAddress - Wallet address to verify
 * @returns {Object} Verification message and nonce
 */
const generateVerificationMessage = (userEmail, walletAddress) => {
  try {
    const nonce = crypto.randomBytes(16).toString("hex");
    const timestamp = new Date().toISOString();

    const message = `
Connect Wallet to LegalVault

Email: ${userEmail}
Wallet: ${walletAddress.toLowerCase()}
Nonce: ${nonce}
Timestamp: ${timestamp}

By signing this message, you confirm ownership of this wallet.
This is a one-time authentication request and does not incur any gas fees.
    `.trim();

    return {
      message,
      nonce,
      timestamp,
      address: walletAddress.toLowerCase(),
    };
  } catch (error) {
    logger.error("Error generating verification message", {
      error: error.message,
    });
    throw new Error("Failed to generate verification message");
  }
};

/**
 * Verify a wallet ownership signature
 * @param {string} address - Wallet address
 * @param {string} signature - Signed message
 * @param {string} message - Original message
 * @returns {boolean} Whether signature is valid
 */
const verifySignature = async (address, signature, message) => {
  try {
    console.log("=== SIGNATURE VERIFICATION DEBUG ===");
    console.log("Message type:", typeof message);
    console.log("Message length:", message?.length);
    console.log("Full message content:");
    console.log(message);
    console.log("Signature:", signature?.slice(0, 20) + "...");
    console.log("Address:", address);
    console.log("====================================");

    // Recover the signer from the signature
    const recoveredAddress = verifyMessage(message, signature);

    console.log("Signature verification result:", {
      provided: address.toLowerCase(),
      recovered: recoveredAddress.toLowerCase(),
      match: recoveredAddress.toLowerCase() === address.toLowerCase(),
    });

    // Compare with the provided address (case-insensitive)
    const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();

    if (isValid) {
      logger.info("Signature verified successfully", {
        address: address.toLowerCase(),
      });
    } else {
      logger.warn("Signature verification failed - address mismatch", {
        expected: address.toLowerCase(),
        recovered: recoveredAddress.toLowerCase(),
      });
    }

    return isValid;
  } catch (error) {
    console.error("Error verifying signature:", {
      error: error.message,
      address,
      stack: error.stack,
    });
    logger.error("Error verifying signature", {
      error: error.message,
      address,
      stack: error.stack,
    });
    return false;
  }
};

/**
 * Link a wallet to a user account
 * @param {string} userId - User ID
 * @param {string} walletAddress - Wallet address to link
 * @param {string} signature - Signed verification message
 * @param {string} message - Original verification message
 * @param {string} label - Optional label for the wallet
 * @param {Object} req - Express request object for IP logging
 * @returns {Promise<Object>} Updated user with linked wallet
 */
const linkWallet = async (
  userId,
  walletAddress,
  signature,
  message,
  label = null,
  req = null,
) => {
  try {
    console.log("linkWallet called with:", {
      userId,
      walletAddress,
      signatureLength: signature ? signature.length : 0,
      messageLength: message ? message.length : 0,
      label,
    });

    // Verify the signature
    const isValidSignature = await verifySignature(
      walletAddress,
      signature,
      message,
    );

    console.log("Signature verification result:", isValidSignature);

    if (!isValidSignature) {
      throw new Error(
        "Invalid signature - wallet ownership cannot be verified",
      );
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if wallet already linked to this user
    const walletExists = user.linkedWallets?.some(
      (w) => w.address.toLowerCase() === walletAddress.toLowerCase(),
    );

    if (walletExists) {
      throw new Error("Wallet already linked to this account");
    }

    // Check if wallet is linked to another user
    const otherUser = await User.findOne({
      "linkedWallets.address": walletAddress.toLowerCase(),
    });

    if (otherUser) {
      throw new Error(
        "This wallet is already linked to another account. Please use a different wallet.",
      );
    }

    // Add wallet to linkedWallets array
    if (!user.linkedWallets) {
      user.linkedWallets = [];
    }

    user.linkedWallets.push({
      address: walletAddress.toLowerCase(),
      label: label || `Wallet ${user.linkedWallets.length + 1}`,
      isVerified: true,
      verificationSignature: signature,
      linkedAt: new Date(),
      lastUsedAt: new Date(),
    });

    // Set as primary wallet if it's the first one
    if (!user.primaryWallet) {
      user.primaryWallet = walletAddress.toLowerCase();
      user.walletVerificationStatus = "verified";
      user.walletVerifiedAt = new Date();
    }

    // Update wallet metadata
    if (!user.walletMetadata) {
      user.walletMetadata = {};
    }

    user.walletMetadata.totalWalletsLinked = user.linkedWallets.length;
    user.walletMetadata.verificationMethod = "message_signature";

    if (req) {
      const clientIP =
        req.headers["cf-connecting-ip"] ||
        req.headers["x-real-ip"] ||
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        "Unknown";
      user.walletMetadata.lastVerificationIP = clientIP;
    }

    await user.save();

    // Log activity
    const logUserActivity =
      require("../controllers/authController").logUserActivity;
    if (logUserActivity) {
      await logUserActivity(
        userId,
        "wallet_linked",
        `Wallet linked: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`,
        req,
        "security",
        "medium",
      );
    }

    logger.info("Wallet linked successfully", {
      userId,
      walletAddress:
        walletAddress.substring(0, 6) + "..." + walletAddress.substring(38),
    });

    console.log("Wallet linked successfully");

    return {
      success: true,
      walletAddress: walletAddress.toLowerCase(),
      linkedWallets: user.linkedWallets.length,
      primaryWallet: user.primaryWallet,
    };
  } catch (error) {
    console.error("Error linking wallet:", {
      error: error.message,
      stack: error.stack,
      userId,
      walletAddress,
    });
    logger.error("Error linking wallet", {
      error: error.message,
      userId,
    });
    throw error;
  }
};

/**
 * Unlink a wallet from user account
 * @param {string} userId - User ID
 * @param {string} walletAddress - Wallet address to unlink
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Updated user info
 */
const unlinkWallet = async (userId, walletAddress, req = null) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Find and remove wallet
    const initialLength = user.linkedWallets?.length || 0;
    user.linkedWallets = user.linkedWallets.filter(
      (w) => w.address.toLowerCase() !== walletAddress.toLowerCase(),
    );

    if (user.linkedWallets.length === initialLength) {
      throw new Error("Wallet not found in user's linked wallets");
    }

    // If primary wallet was unlinked, set first remaining wallet as primary
    if (user.primaryWallet?.toLowerCase() === walletAddress.toLowerCase()) {
      if (user.linkedWallets.length > 0) {
        user.primaryWallet = user.linkedWallets[0].address;
      } else {
        user.primaryWallet = null;
        user.walletVerificationStatus = "unverified";
      }
    }

    // Update metadata
    if (user.walletMetadata) {
      user.walletMetadata.totalWalletsLinked = user.linkedWallets.length;
    }

    await user.save();

    logger.info("Wallet unlinked successfully", {
      userId,
      walletAddress:
        walletAddress.substring(0, 6) + "..." + walletAddress.substring(38),
    });

    return {
      success: true,
      linkedWallets: user.linkedWallets.length,
      primaryWallet: user.primaryWallet,
    };
  } catch (error) {
    logger.error("Error unlinking wallet", {
      error: error.message,
      userId,
    });
    throw error;
  }
};

/**
 * Get user's linked wallets
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of linked wallets
 */
const getLinkedWallets = async (userId) => {
  try {
    const user = await User.findById(userId).select({
      linkedWallets: 1,
      primaryWallet: 1,
      walletVerificationStatus: 1,
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      success: true,
      linkedWallets: user.linkedWallets || [],
      primaryWallet: user.primaryWallet,
      verificationStatus: user.walletVerificationStatus,
    };
  } catch (error) {
    logger.error("Error retrieving linked wallets", {
      error: error.message,
      userId,
    });
    throw error;
  }
};

/**
 * Set primary wallet
 * @param {string} userId - User ID
 * @param {string} walletAddress - Wallet to set as primary
 * @returns {Promise<Object>} Updated user info
 */
const setPrimaryWallet = async (userId, walletAddress) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if wallet is linked
    const wallet = user.linkedWallets?.find(
      (w) => w.address.toLowerCase() === walletAddress.toLowerCase(),
    );

    if (!wallet) {
      throw new Error("Wallet not linked to this account");
    }

    user.primaryWallet = walletAddress.toLowerCase();
    user.walletVerificationStatus = "verified";

    await user.save();

    logger.info("Primary wallet updated", {
      userId,
      walletAddress:
        walletAddress.substring(0, 6) + "..." + walletAddress.substring(38),
    });

    return {
      success: true,
      primaryWallet: user.primaryWallet,
    };
  } catch (error) {
    logger.error("Error setting primary wallet", {
      error: error.message,
      userId,
    });
    throw error;
  }
};

/**
 * Generate JWT token for wallet authentication (for Auth flow)
 * @param {string} userId - User ID
 * @param {string} walletAddress - Wallet address used for login
 * @returns {string} JWT token
 */
const generateWalletAuthToken = (userId, walletAddress) => {
  try {
    const payload = {
      userId,
      walletAddress: walletAddress.toLowerCase(),
      authType: "wallet",
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return token;
  } catch (error) {
    logger.error("Error generating wallet auth token", {
      error: error.message,
    });
    throw new Error("Failed to generate authentication token");
  }
};

module.exports = {
  generateVerificationMessage,
  verifySignature,
  linkWallet,
  unlinkWallet,
  getLinkedWallets,
  setPrimaryWallet,
  generateWalletAuthToken,
};
