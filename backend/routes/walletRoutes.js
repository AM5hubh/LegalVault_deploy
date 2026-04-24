/**
 * Wallet Routes
 * Handles wallet linking, verification, and authentication
 * Part of Phase 1: Hybrid Implementation
 */

const express = require("express");
const router = express.Router();
const {
  generateWalletVerificationMessage,
  linkUserWallet,
  unlinkUserWallet,
  getLinkedWallets,
  setPrimaryWallet,
  verifyWalletOwnership,
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimitMiddleware");

/**
 * Protected Routes (require authentication)
 */

// Generate verification message for wallet linking
router.post(
  "/generate-verification",
  authMiddleware,
  rateLimitMiddleware,
  generateWalletVerificationMessage,
);

// Link wallet to user account
router.post("/link", authMiddleware, rateLimitMiddleware, linkUserWallet);

// Unlink wallet from user account
router.delete(
  "/unlink/:walletAddress",
  authMiddleware,
  rateLimitMiddleware,
  unlinkUserWallet,
);

// Get all linked wallets for current user
router.get("/linked-wallets", authMiddleware, getLinkedWallets);

// Set primary wallet
router.put(
  "/set-primary",
  authMiddleware,
  rateLimitMiddleware,
  setPrimaryWallet,
);

/**
 * Public Routes (for initial wallet verification)
 * Used by thirdweb ConnectButton Auth flow
 */

// Verify wallet ownership (for login/auth)
router.post("/verify-ownership", rateLimitMiddleware, verifyWalletOwnership);

module.exports = router;
