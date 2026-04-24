const express = require("express");
const router = express.Router();
const {
  uploadEvidence,
  getEvidence,
  updateEvidence,
  deleteEvidence,
  getAllEvidence,
} = require("../controllers/evidenceController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const fileMiddleware = require("../middlewares/fileMiddleware");
const rateLimitMiddleware = require("../middlewares/rateLimitMiddleware");

// Evidence routes
router.post(
  "/upload",
  authMiddleware,
  roleMiddleware(["officer", "police", "admin"]),
  fileMiddleware,
  rateLimitMiddleware,
  uploadEvidence,
);

router.post(
  "/upload/ipfs",
  authMiddleware,
  roleMiddleware(["police", "admin"]),
  fileMiddleware,
  rateLimitMiddleware,
  require("../controllers/evidenceController").uploadEvidenceToIPFS,
);

// Confirm blockchain transaction and save to MongoDB
router.post(
  "/confirm-blockchain",
  authMiddleware,
  roleMiddleware(["police", "admin"]),
  rateLimitMiddleware,
  require("../controllers/evidenceController").confirmEvidenceBlockchain,
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["officer", "police", "forensic", "legal", "admin"]),
  getEvidence,
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["officer", "police", "admin"]),
  updateEvidence,
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["officer", "police", "admin"]),
  deleteEvidence,
);

// Admin routes
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllEvidence);

module.exports = router;
