const express = require("express");
const router = express.Router();

const {
  addEvidenceOnchain,
  freezeEvidenceOnchain,
  getAllEvidenceOnchain,
  getCaseEvidenceOnchain,
} = require("../controllers/Blockchain/evidenceOnchainController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const rateLimitMiddleware = require("../middlewares/rateLimitMiddleware");

// User signs tx client-side; backend returns unsigned payloads.
router.post(
  "/add",
  authMiddleware,
  roleMiddleware(["police", "officer", "admin", "judge", "registrar"]),
  rateLimitMiddleware,
  addEvidenceOnchain,
);

router.post(
  "/freeze",
  authMiddleware,
  roleMiddleware(["judge", "registrar", "admin"]),
  rateLimitMiddleware,
  freezeEvidenceOnchain,
);

// List all cases that have evidence
router.get(
  "/",
  authMiddleware,
  roleMiddleware([
    "police",
    "officer",
    "admin",
    "judge",
    "registrar",
    "forensic",
    "legal",
  ]),
  rateLimitMiddleware,
  getAllEvidenceOnchain,
);

router.get(
  "/:caseId",
  authMiddleware,
  roleMiddleware([
    "police",
    "officer",
    "admin",
    "judge",
    "registrar",
    "forensic",
    "legal",
  ]),
  rateLimitMiddleware,
  getCaseEvidenceOnchain,
);

module.exports = router;
