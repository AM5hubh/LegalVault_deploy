const ChainOfCustody = require('../models/ChainOfCustody');
const EvidenceMetadata = require('../models/EvidenceMetadata');
const User = require('../models/User');
const { getCustodyLogs } = require('../services/blockchainService');
const { generateHash } = require('../utils/hashUtils');
const logger = require('../utils/logger');

// Get chain of custody for specific evidence (CRUD: Read)
exports.getCustodyForEvidence = async (req, res) => {
  try {
    const { evidenceId } = req.params;

    // Verify evidence exists
    const evidence = await EvidenceMetadata.findOne({ evidenceId });
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    // Check access
    const isAdmin = req.user.role === 'admin';
    const isUploader = evidence.uploaderId.toString() === req.user.userId;
    if (!isAdmin && !isUploader) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get from MongoDB mirror
    const logs = await ChainOfCustody.find({ evidenceId })
      .populate('userId', 'email fullName role')
      .sort({ timestamp: 1 });

    // Sync with blockchain if needed (optional)
    const blockchainLogs = await getCustodyLogs(evidenceId);
    // Merge logic if discrepancy

    logger.info('Chain of custody retrieved', { evidenceId, userId: req.user.userId });

    res.json({
      evidenceId,
      logs,
      totalActions: logs.length,
    });
  } catch (error) {
    logger.error('Get custody logs failed', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all custody logs (CRUD: Read)
exports.getAllCustodyLogs = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { page = 1, limit = 10, evidenceId, userId, action } = req.query;
    const filter = {};
    if (evidenceId) filter.evidenceId = evidenceId;
    if (userId) filter.userId = userId;
    if (action) filter.action = action;

    const logs = await ChainOfCustody.find(filter)
      .populate('userId', 'email fullName role')
      .populate('evidenceId', 'fileName status') // If evidenceId is ref, but it's string
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ timestamp: -1 });

    const total = await ChainOfCustody.countDocuments(filter);

    logger.info('Admin fetched all custody logs', { page, limit, total });

    res.json({
      logs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    logger.error('Get all custody logs failed', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

// Log new custody action (CRUD: Create, internal use)
exports.createCustodyLog = async (req, res) => {
  try {
    // This is typically called internally, but for API
    const { evidenceId, action, details } = req.body;
    const userId = req.user.userId;

    // Verify evidence
    const evidence = await EvidenceMetadata.findOne({ evidenceId });
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    // Check access
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required for manual logs' });
    }

    // Create log
    const log = new ChainOfCustody({
      evidenceId,
      actionId: generateHash(`${evidenceId}${Date.now()}`), // Placeholder tx
      userId,
      action,
      details,
    });
    await log.save();

    logger.info('Custody log created', { evidenceId, action, userId });

    res.status(201).json({ message: 'Custody log created', logId: log._id });
  } catch (error) {
    logger.error('Create custody log failed', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Delete custody log (CRUD: Delete, rare use)
exports.deleteCustodyLog = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { logId } = req.params;
    const log = await ChainOfCustody.findByIdAndDelete(logId);

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    logger.info('Custody log deleted by admin', { logId, adminId: req.user.userId });

    res.json({ message: 'Custody log deleted' });
  } catch (error) {
    logger.error('Delete custody log failed', { error: error.message });
    res.status(500).json({ message: 'Server error' });
  }
};

