const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { chatWithLegalBot } = require('../controllers/ChatbotController/legalChatbotController');

const router = express.Router();

// All chatbot routes require authentication
router.use(authMiddleware);

// Main legal chatbot conversation endpoint with enhanced NLP and navigation guidance
// POST /api/chatbot/chat
router.post('/chat', (req, res, next) => {
  console.log('🔥🔥🔥 CHATBOT ROUTE HIT:', new Date().toISOString(), '🔥🔥🔥');
  console.log('📝 Request body:', req.body);
  chatWithLegalBot(req, res, next);
});

module.exports = router;