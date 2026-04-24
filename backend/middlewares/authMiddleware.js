const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Middleware to verify JWT token and attach user to request
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('No token provided', { path: req.path, method: req.method });
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      logger.warn('Invalid token', { path: req.path, method: req.method });
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      logger.warn('User not found', { userId: decoded.userId });
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.kycStatus !== 'verified') {
      logger.warn('KYC verification required', { userId: user._id, email: user.email });
      return res.status(403).json({ message: 'KYC verification required' });
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus
    };

    logger.info('User authenticated', { userId: user._id, email: user.email, path: req.path });
    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message, path: req.path });
    return res.status(401).json({ message: 'Authentication failed: ' + error.message });
  }
};

module.exports = authMiddleware;