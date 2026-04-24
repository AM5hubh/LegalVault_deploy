const Queue = require('bull');
const axios = require('axios');
const { sendEmail } = require('../services/notificationService');
const sandboxConfig = require('../config/sandbox');
const logger = require('../utils/logger');

// Initialize BullMQ queue for KYC health checks
const kycQueue = new Queue('kyc-health-check', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

// Process KYC health check jobs
kycQueue.process(async (job) => {
  try {
    logger.info('Starting KYC API health check');
    
    // Ping Sandbox.co.in API (use a lightweight endpoint, e.g., health or status)
    const response = await axios.get(`${sandboxConfig.baseUrl}/health`, {
      headers: { Authorization: `Bearer ${sandboxConfig.apiKey}` },
    });

      throw new Error('KYC API health check failed');
    }

    logger.info('KYC API health check passed', { status: response.data.status });
    return { status: 'healthy' };
  } catch (error) {
    logger.error('KYC API health check failed', { error: error.message });
    
    // Notify admin via email
    await sendEmail(
      process.env.ADMIN_EMAIL || 'admin@example.com',
      'KYC API Health Check Failure',
      `<p>KYC API health check failed: ${error.message}</p><p>Please verify Sandbox.co.in API status.</p>`
    );
    
    throw error;
  }
});

// Schedule recurring health check (e.g., every 6 hours)
async function scheduleKycHealthCheck() {
  try {
    await kycQueue.add(
      {},
      {
        repeat: {
          every: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
        },
      }
    );
    logger.info('Scheduled KYC API health check');
  } catch (error) {
    logger.error('Failed to schedule KYC API health check', { error: error.message });
    throw error;
  }
}

module.exports = {
  scheduleKycHealthCheck,
};

