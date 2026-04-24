const express = require('express');
const router = express.Router();
const {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactStats
} = require('../controllers/contactController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Public route - Create contact message
router.post('/', createContact);

// Admin routes - Require authentication and admin role
router.get('/', authMiddleware, roleMiddleware(['admin']), getAllContacts);
router.get('/stats', authMiddleware, roleMiddleware(['admin']), getContactStats);
router.get('/:id', authMiddleware, roleMiddleware(['admin']), getContactById);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateContact);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteContact);

module.exports = router;