const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { uploadMultiple } = require('../middlewares/fileMiddleware');
const {
  submitCase,
  getMyCases,
  getCaseById,
  updateCaseStatus,
  getCaseStats,
  deleteCase,
  getAllCases,
  getPlatformStats,
  searchCases,
} = require('../controllers/caseController');

// Public/User routes - Case submission and management
router.post(
  '/submit',
  authMiddleware,
  uploadMultiple([{ name: 'documents', maxCount: 10 }]),
  submitCase
);

// Search cases from Indian Kanoon (public endpoint)
router.get('/search', searchCases);

router.get('/my-cases', authMiddleware, getMyCases);
router.get('/my-stats', authMiddleware, getCaseStats);
router.get('/:id', authMiddleware, getCaseById);
router.patch('/:id/status', authMiddleware, updateCaseStatus);
router.delete('/:id', authMiddleware, deleteCase);

// Admin routes
router.get('/', authMiddleware, roleMiddleware(['admin']), getAllCases);
router.get('/admin/stats', authMiddleware, roleMiddleware(['admin']), getPlatformStats);

module.exports = router;