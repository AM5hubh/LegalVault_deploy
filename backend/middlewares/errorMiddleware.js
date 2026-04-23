const logger = require('../utils/logger');

// Global error handling middleware
const errorMiddleware = (error, req, res, next) => {
  try {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';

    logger.error('Error occurred', {
      status,
      message,
      path: req.path,
      method: req.method,
      userId: req.user ? req.user.userId : 'unauthenticated'
    });

    res.status(status).json({
      message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  } catch (err) {
    logger.error('Error middleware failed', { error: err.message, path: req.path });
    res.status(500).json({ message: 'Critical server error' });
  }
};

module.exports = errorMiddleware;