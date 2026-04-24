const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    process.exit(1);
  }
}

module.exports = { connectDB };

