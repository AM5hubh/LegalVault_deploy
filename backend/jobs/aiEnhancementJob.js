const Queue = require('bull');
const { enhanceImage } = require('../services/aiService');
const { logCustodyAction } = require('../services/blockchainService');
const { generateHash } = require('../utils/hashUtils');
const EvidenceMetadata = require('../models/EvidenceMetadata');
const logger = require('../utils/logger');

// Initialize BullMQ queue for AI enhancements
const aiQueue = new Queue('ai-enhancement', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

// Process AI enhancement jobs
aiQueue.process(async (job) => {
  const { evidenceId, publicId, type, userId } = job.data;
  try {
    logger.info('Starting AI enhancement job', { evidenceId, type });
    
    // Fetch evidence metadata
    const evidence = await EvidenceMetadata.findOne({ evidenceId });
    if (!evidence) {
      throw new Error('Evidence not found');
    }

    // Download original file from Cloudinary (assumes buffer access)
    const response = await fetch(evidence.cloudinaryUrl);
    const buffer = await response.buffer();

    // Enhance image
    const { enhancedPublicId, enhancedUrl } = await enhanceImage(buffer, publicId, type);

    // Update metadata with enhanced file details
    evidence.enhancedPublicId = enhancedPublicId;
    evidence.enhancedUrl = enhancedUrl;
    await evidence.save();

    // Log action to blockchain
    const userHash = generateHash(`${userId}`); // Simplified; use generateUserHash if needed
    await logCustodyAction(evidenceId, 'enhance', userHash);

    logger.info('AI enhancement job completed', { evidenceId, enhancedUrl });
    return { enhancedUrl };
  } catch (error) {
    logger.error('AI enhancement job failed', { evidenceId, error: error.message });
    throw error;
  }
});

// Add job to queue
async function addEnhancementJob(evidenceId, publicId, type, userId) {
  try {
    const job = await aiQueue.add({
      evidenceId,
      publicId,
      type,
      userId,
    });
    logger.info('Added AI enhancement job to queue', { jobId: job.id, evidenceId });
    return job.id;
  } catch (error) {
    logger.error('Failed to add AI enhancement job', { evidenceId, error: error.message });
    throw error;
  }
}

module.exports = {
  addEnhancementJob,
};

