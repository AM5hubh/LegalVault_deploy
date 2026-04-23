const logger = require('../utils/logger');

const sandboxConfig = {
  baseUrl: 'https://api.sandbox.co.in',
  apiKey: process.env.SANDBOX_API_KEY,
};

try {
  if (!process.env.SANDBOX_API_KEY) {
    throw new Error('SANDBOX_API_KEY is not set in environment variables');
  }
  logger.info('Sandbox.co.in configuration initialized');
} catch (error) {
  logger.error('Sandbox configuration failed', { error: error.message });
  throw error;
}

module.exports = sandboxConfig;

