const express = require("express");
const router = express.Router();
const {
  submitRoleRequest,
  getAllRoleRequests,
  getRoleRequestById,
  getMyRoleRequests,
  updateRoleRequestStatus,
  deleteRoleRequest,
  getRoleRequestStats,
} = require("../controllers/roleRequestController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { uploadMultiple } = require("../middlewares/fileMiddleware");

// Public route - Submit role request
router.post(
  "/submit",
  uploadMultiple([
    { name: "idProof", maxCount: 1 },
    { name: "authorizationLetter", maxCount: 1 },
    { name: "registrationCertificate", maxCount: 1 },
    { name: "professionalLicense", maxCount: 1 },
    { name: "securityClearance", maxCount: 1 },
    { name: "additionalDocuments", maxCount: 5 },
  ]),
  submitRoleRequest
);

// Protected routes - User must be authenticated
router.get("/my-requests", authMiddleware, getMyRoleRequests);

// Admin only routes
router.get("/all", authMiddleware, roleMiddleware(["admin"]), getAllRoleRequests);
router.get("/stats", authMiddleware, roleMiddleware(["admin"]), getRoleRequestStats);
router.get("/:id", authMiddleware, roleMiddleware(["admin"]), getRoleRequestById);
router.patch("/:id/status", authMiddleware, roleMiddleware(["admin"]), updateRoleRequestStatus);
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteRoleRequest);

module.exports = router;
