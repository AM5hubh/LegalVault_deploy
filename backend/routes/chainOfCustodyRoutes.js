const express = require("express");
const router = express.Router();

const {
  addCustodyEntryTx,
  getCustodyLogs,
  getCustodyLogCount,
} = require("../controllers/Blockchain/chainOfCustodyController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const rateLimitMiddleware = require("../middlewares/rateLimitMiddleware");

// Prepare unsigned tx for adding a custody entry
router.post(
  "/add",
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
  addCustodyEntryTx,
);

// Fetch custody logs for an evidenceId
router.get(
  "/:evidenceId",
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
  getCustodyLogs,
);

// Fetch custody log count for an evidenceId
router.get(
  "/:evidenceId/count",
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
  getCustodyLogCount,
);

module.exports = router;
