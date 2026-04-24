const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const DocumentVerificationController = require("../controllers/DocumentVerificationController");

// Ensure temp directory exists
const tempDir = path.join(__dirname, "../uploads/temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log("✅ Created temp upload directory:", tempDir);
}

// Configure multer for document upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/temp/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      console.log("✅ File type accepted:", file.mimetype);
      cb(null, true);
    } else {
      console.error("❌ File type rejected:", file.mimetype);
      cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF and images allowed.`));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("❌ Multer error:", err.code, err.message);
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
      code: err.code,
    });
  } else if (err) {
    console.error("❌ Upload error:", err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};


// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/verification/upload
 * @desc    Upload document for verification
 * @access  Private
 */
router.post(
  "/upload",
  (req, res, next) => {
    console.log("📥 Upload request started...");
    upload.single("document")(req, res, (err) => handleMulterError(err, req, res, next));
  },
  DocumentVerificationController.uploadAndVerifyDocument
);

/**
 * @route   GET /api/verification/:verificationId
 * @desc    Get verification status and details
 * @access  Private
 */
router.get("/:verificationId", DocumentVerificationController.getVerificationStatus);

/**
 * @route   GET /api/verification/case/:caseId
 * @desc    Get all verifications for a case
 * @access  Private
 */
router.get("/case/:caseId", DocumentVerificationController.getCaseVerifications);

/**
 * @route   POST /api/verification/:verificationId/manual-review
 * @desc    Submit manual review for document
 * @access  Private (Admin/Lawyer only)
 */
router.post(
  "/:verificationId/manual-review",
  roleMiddleware(["admin", "lawyer", "judge"]),
  DocumentVerificationController.submitManualReview
);

/**
 * @route   GET /api/verification/admin/analytics/stats
 * @desc    Get verification statistics
 * @access  Private (Admin only)
 */
router.get(
  "/admin/analytics/stats",
  roleMiddleware(["admin"]),
  DocumentVerificationController.getVerificationStats
);

/**
 * @route   GET /api/verification/admin/analytics/high-risk
 * @desc    Get high-risk documents for admin dashboard
 * @access  Private (Admin only)
 */
router.get(
  "/admin/analytics/high-risk",
  roleMiddleware(["admin"]),
  DocumentVerificationController.getHighRiskDocuments
);

/**
 * @route   GET /api/verification/admin/analytics/detailed
 * @desc    Get detailed verification analytics
 * @access  Private (Admin only)
 */
router.get(
  "/admin/analytics/detailed",
  roleMiddleware(["admin"]),
  DocumentVerificationController.getVerificationAnalytics
);

/**
 * @route   GET /api/verification/:verificationId/export
 * @desc    Export verification report
 * @access  Private
 */
router.get("/:verificationId/export", DocumentVerificationController.exportVerificationReport);

module.exports = router;
