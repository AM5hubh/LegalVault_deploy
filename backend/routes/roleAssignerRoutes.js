const express = require("express");
const router = express.Router();
const {
  getAllRequestsForReview,
  getRequestById,
  verifyRoleRequest,
  returnRequestForInfo,
  getStatistics,
  getMyVerifications,
} = require("../controllers/roleAssignerController");
const authMiddleware = require("../middlewares/authMiddleware");
const { roleAssignerOnly } = require("../middlewares/roleMiddleware");

// All routes require authentication and role_assigner role
router.use(authMiddleware);
router.use(roleAssignerOnly);

// Get all requests for review
router.get("/requests", getAllRequestsForReview);

// Get statistics
router.get("/statistics", getStatistics);

// Get my verification history
router.get("/my-verifications", getMyVerifications);

// Get single request by ID
router.get("/requests/:id", getRequestById);

// Verify a request
router.post("/requests/:id/verify", verifyRoleRequest);

// Return request for more information
router.post("/requests/:id/return", returnRequestForInfo);

module.exports = router;
