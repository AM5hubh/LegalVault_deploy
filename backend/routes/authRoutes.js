const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  resetPassword, 
  getProfile, 
  updateProfile, 
  deleteUser, 
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  getUserById,
  banUser,
  addAdminNote,
  exportActivityLog,
  getActivityStats
} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { rateLimitMiddleware } = require('../middlewares/rateLimitMiddleware');

// Public routes
router.post('/register', rateLimitMiddleware, registerUser);
router.post('/login', rateLimitMiddleware, loginUser);
router.post('/forgot-password', rateLimitMiddleware, forgotPassword);
router.post('/reset-password', rateLimitMiddleware, resetPassword);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile/:id', authMiddleware, updateProfile);

// Admin routes
router.get('/users', authMiddleware, roleMiddleware(['admin']), getAllUsers);
router.get('/users/:userId', authMiddleware, roleMiddleware(['admin']), getUserById);
router.put('/users/:userId/role', authMiddleware, roleMiddleware(['admin']), updateUserRole);
router.put('/users/:userId/status', authMiddleware, roleMiddleware(['admin']), updateUserStatus);
router.put('/users/:userId/ban', authMiddleware, roleMiddleware(['admin']), banUser);
router.post('/users/:userId/notes', authMiddleware, roleMiddleware(['admin']), addAdminNote);
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), deleteUser);

// Activity routes
router.get('/users/:userId/activity/export', authMiddleware, roleMiddleware(['admin']), exportActivityLog);
router.get('/users/:userId/activity/stats', authMiddleware, roleMiddleware(['admin']), getActivityStats);

module.exports = router;