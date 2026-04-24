const express = require('express');
const router = express.Router();
const { 
  generateKycOtp, 
  verifyKycOtp,
  getKycStatus,
  getAllKycRequests, 
  updateKycStatus 
} = require('../controllers/kycController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { rateLimitMiddleware } = require('../middlewares/rateLimitMiddleware');

// Public KYC routes (for login flow)
router.post(
  '/generate-otp', 
  rateLimitMiddleware,
  generateKycOtp
);

router.post(
  '/verify-otp', 
  rateLimitMiddleware,
  verifyKycOtp
);

// Protected user KYC routes
router.get(
  '/status', 
  authMiddleware,
  getKycStatus
);

// Admin KYC routes
router.get(
  '/requests', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  getAllKycRequests
);

router.put(
  '/status', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  updateKycStatus
);

module.exports = router;
