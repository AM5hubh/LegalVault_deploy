const express = require("express");
const router = express.Router();

const {
  createCaseTx,
  updateCaseStatusTx,
  assignAccessTx,
  getCaseOnchain,
  getAllCasesOnchain,
} = require("../controllers/Blockchain/caseOnchainController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const rateLimitMiddleware = require("../middlewares/rateLimitMiddleware");

// Registrar-only: create cases
router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["registrar", "admin", "police", "officer"]),
  rateLimitMiddleware,
  createCaseTx,
);

// Registrar or judge: update status
router.post(
  "/status",
  authMiddleware,
  roleMiddleware(["registrar", "judge", "admin", "forensic"]),
  rateLimitMiddleware,
  updateCaseStatusTx,
);

// Registrar: assign access
router.post(
  "/access",
  authMiddleware,
  roleMiddleware(["registrar", "admin", "forensic"]),
  rateLimitMiddleware,
  assignAccessTx,
);

// Read case
router.get(
  "/:caseId",
  authMiddleware,
  roleMiddleware([
    "registrar",
    "judge",
    "admin",
    "police",
    "officer",
    "forensic",
    "legal",
  ]),
  rateLimitMiddleware,
  getCaseOnchain,
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware([
    "registrar",
    "judge",
    "admin",
    "police",
    "officer",
    "forensic",
    "legal",
  ]),
  rateLimitMiddleware,
  getAllCasesOnchain,
);

module.exports = router;
