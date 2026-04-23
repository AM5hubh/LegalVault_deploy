const EvidenceMetadata = require('../models/EvidenceMetadata');
const User = require('../models/User');
const { addEnhancementJob } = require('../jobs/aiEnhancementJob');
const { logCustodyAction } = require('../services/blockchainService');
const { generateUserHash } = require('../utils/hashUtils');
const logger = require('../utils/logger');

// Enhance evidence (CRUD: Create enhancement)
exports.enhanceEvidence = async (req, res) => {
  try {
    const { evidenceId } = req.params;
    const { type } = req.query; // 'super-resolution' or 'noise-reduction'
    const allowedTypes = ['super-resolution', 'noise-reduction', 'contrast-adjustment'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid enhancement type' });
    }

    // Verify evidence
    const evidence = await EvidenceMetadata.findOne({ evidenceId });
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    // Check access (forensic or admin)
    const user = await User.findById(req.user.userId);
    if (user.role !== 'forensic' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Forensic role required' });
    }

    // Check if already enhanced
    if (evidence.enhancedUrl) {
      return res.status(400).json({ message: 'Evidence already enhanced' });
    }

    // Add to AI job queue
    const jobId = await addEnhancementJob(evidenceId, evidence.cloudinaryPublicId, type, req.user.userId);

    // Log intent to blockchain
    const userHash = generateUserHash(user.email, user.aadhaarHash);
    await logCustodyAction(evidenceId, 'enhance_start', userHash);

    logger.info('Enhancement job queued', { evidenceId, type, jobId, userId: req.user.userId });

    res.json({
      message: 'Enhancement queued successfully',
      jobId,
      estimatedTime: '5-10 minutes',
    });
  } catch (error) {
    logger.error('Enhance evidence failed', { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

// Get enhancement status (CRUD: Read)
exports.getEnhancementStatus = async (req, res) => {
  try {
    const { evidenceId } = req.params;

    const evidence = await EvidenceMetadata.findOne({ evidenceId });
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    // Check access
    const user = await User.findById(req.user.userId);
    const isAdmin = user.role === 'admin';
    const isUploader = evidence.uploaderId.toString() === req.user.userId;
    if (!isAdmin && !isUploader) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const status = evidence.enhancedUrl ? 'completed' : 'pending';
    const enhancedUrl = evidence.enhancedUrl || null;

    logger.info('Enhancement status retrieved', { evidenceId, status, userId: req.user.userId });

    res.json({
      evidenceId,
      status,
      enhancedUrl,
      originalUrl: evidence.cloudinaryUrl,
    });
  } catch (error) {
    logger.error('Get enhancement status failed', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all enhancements (CRUD: Read)
exports.getAllEnhancements = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { page = 1, limit = 10, status } = req.query;
    const filter = status ? { enhancedUrl: { $exists: status === 'completed' } } : {};
    const evidence = await EvidenceMetadata.find(filter)
      .populate('uploaderId', 'email fullName role')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ uploadDate: -1 });

    const total = await EvidenceMetadata.countDocuments(filter);

    logger.info('Admin fetched all enhancements', { page, limit, total });

    res.json({
      enhancements: evidence,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    logger.error('Get all enhancements failed', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Cancel enhancement job (CRUD: Update)
exports.cancelEnhancement = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { evidenceId } = req.params;

    const evidence = await EvidenceMetadata.findOne({ evidenceId });
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    if (evidence.enhancedUrl) {
      // Assume job queue cancellation logic (BullMQ)
      // aiQueue.getJob(jobId).remove(); // If jobId stored
      evidence.enhancedUrl = null; // Reset if pending
      await evidence.save();
    }

    logger.info('Enhancement cancelled by admin', { evidenceId, adminId: req.user.userId });

    res.json({ message: 'Enhancement cancelled' });
  } catch (error) {
    logger.error('Cancel enhancement failed', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

