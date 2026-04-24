const express = require('express');
const router = express.Router();
const { 
  enhanceEvidence, 
  getEnhancementStatus, 
  getAllEnhancements, 
  cancelEnhancement 
} = require('../controllers/enhancementController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const rateLimitMiddleware = require('../middlewares/rateLimitMiddleware');

// Enhancement routes
router.post('/:evidenceId', 
  authMiddleware, 
  roleMiddleware(['forensic', 'admin']), 
  rateLimitMiddleware,
  enhanceEvidence
);

router.get('/status/:evidenceId', 
  authMiddleware, 
  roleMiddleware(['officer', 'forensic', 'legal', 'admin']), 
  getEnhancementStatus
);

// Admin routes
router.get('/', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  getAllEnhancements
);

router.delete('/:evidenceId', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  cancelEnhancement
);

module.exports = router;