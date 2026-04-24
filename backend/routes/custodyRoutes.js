const express = require('express');
const router = express.Router();
const { 
  getCustodyForEvidence, 
  getAllCustodyLogs, 
  createCustodyLog, 
  deleteCustodyLog 
} = require('../controllers/custodyController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const rateLimitMiddleware = require('../middlewares/rateLimitMiddleware');

// Custody routes
router.get('/evidence/:evidenceId', 
  authMiddleware, 
  roleMiddleware(['officer', 'forensic', 'legal', 'admin']), 
  getCustodyForEvidence
);

// Admin routes
router.get('/', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  getAllCustodyLogs
);

router.post('/', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  rateLimitMiddleware,
  createCustodyLog
);

router.delete('/:logId', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  deleteCustodyLog
);

module.exports = router;