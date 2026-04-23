const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const DatabaseBackupService = require('../services/DatabaseBackupService');
const AdminSecurityService = require('../services/AdminSecurityService');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const logger = require('../utils/logger');

// Initialize backup service
const backupService = new DatabaseBackupService();

// Initialize backup service on startup
backupService.initialize().catch(console.error);

// Schedule automated backups
backupService.scheduleAutomatedBackups();

// Enhanced admin verification middleware with security questions
const adminVerificationMiddleware = async (req, res, next) => {
  try {
    // Check if admin verification code is provided
    const verificationCode = req.headers['x-admin-verification'] || req.body.verificationCode;
    const questionAnswers = req.body.securityQuestions || {};

    const metadata = {
      endpoint: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    };

    if (!verificationCode) {
      await AdminSecurityService.logSecurityEvent({
        adminUserId: req.user?.id || 'unknown',
        adminEmail: req.user?.email || 'unknown',
        action: 'BACKUP_ACCESS_ATTEMPT',
        ...metadata,
        severity: 'HIGH',
        isSuccessful: false,
        additionalMetadata: { reason: 'Missing verification code' }
      });

      return res.status(403).json({
        error: 'Admin verification required',
        message: 'Please provide admin verification code and answer security questions',
        requiresSecurityQuestions: true,
        securityQuestions: AdminSecurityService.getSecurityQuestions()
      });
    }

    // Verify admin access with security questions
    const verificationResult = await AdminSecurityService.verifyAdminAccess(
      req.user?.id || 'unknown',
      req.user?.email || 'unknown',
      verificationCode,
      questionAnswers,
      metadata
    );

    if (!verificationResult.success) {
      return res.status(403).json({
        error: 'Admin verification failed',
        message: verificationResult.message,
        errors: verificationResult.errors,
        requiresSecurityQuestions: true,
        securityQuestions: AdminSecurityService.getSecurityQuestions()
      });
    }

    // Add verification result to request for later use
    req.adminVerified = true;
    req.verificationResult = verificationResult;
    
    next();
  } catch (error) {
    logger.error('Admin verification error:', error);
    res.status(500).json({ error: 'Verification process failed' });
  }
};

// Get backup metadata
router.get('/metadata', authMiddleware, roleMiddleware(['admin']), adminVerificationMiddleware, async (req, res) => {
  try {
    const metadata = await backupService.getBackupMetadata();
    // Also include list of all backup IDs
    const allBackups = await backupService.getAllBackupIds();
    res.json({
      ...metadata,
      allBackups
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get backup metadata' });
  }
});

// Get backup statistics
router.get('/statistics', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const statistics = await backupService.getBackupStatistics();
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get backup statistics' });
  }
});

// Create new backup
router.post('/create', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { type = 'full' } = req.body;

    let result;
    if (type === 'full') {
      result = await backupService.createFullBackup();
    } else if (type === 'incremental') {
      // Get last backup timestamp for incremental backup
      const metadata = await backupService.getBackupMetadata();
      const lastBackupTimestamp = metadata.lastBackup || new Date(0).toISOString();
      result = await backupService.createIncrementalBackup(lastBackupTimestamp);
    } else {
      return res.status(400).json({ error: 'Invalid backup type. Use "full" or "incremental"' });
    }

    // Log successful backup creation
    await AdminSecurityService.logSecurityEvent({
      adminUserId: req.user?.userId || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      action: 'BACKUP_CREATED',
      endpoint: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      backupId: result.backupId,
      backupType: type,
      severity: 'MEDIUM',
      isSuccessful: true,
      additionalMetadata: {
        size: result.size,
        collections: result.collections
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Backup creation error:', error);
    
    // Log failed backup creation
    await AdminSecurityService.logSecurityEvent({
      adminUserId: req.user?.userId || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      action: 'BACKUP_CREATED',
      endpoint: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      backupType: req.body.type || 'full',
      severity: 'HIGH',
      isSuccessful: false,
      additionalMetadata: {
        error: error.message
      }
    });

    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Verify backup integrity
router.get('/verify/:backupId', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { backupId } = req.params;
    const result = await backupService.verifyBackupIntegrity(backupId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify backup integrity' });
  }
});

// Restore from backup
router.post('/restore/:backupId', authMiddleware, roleMiddleware(['admin']), adminVerificationMiddleware, async (req, res) => {
  try {
    const { backupId } = req.params;
    const { dryRun = false, collections = null } = req.body;

    const result = await backupService.restoreFromBackup(backupId, { dryRun, collections });
    res.json(result);
  } catch (error) {
    console.error('Backup restore error:', error);
    res.status(500).json({ error: 'Failed to restore from backup' });
  }
});

// Download backup data (from MongoDB)
router.get('/download/:backupId', authMiddleware, roleMiddleware(['admin']), adminVerificationMiddleware, async (req, res) => {
  try {
    const { backupId } = req.params;

    // Get backup from MongoDB
    const backupDoc = await require('../services/DatabaseBackupService').BackupData.findOne({ backupId });

    if (!backupDoc) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    // Return encrypted data as downloadable file
    res.setHeader('Content-Disposition', `attachment; filename="${backupId}.backup"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', backupDoc.encryptedData.length);

    // Send the encrypted data
    res.send(Buffer.from(backupDoc.encryptedData, 'hex'));

  } catch (error) {
    console.error('Backup download error:', error);
    res.status(500).json({ error: 'Failed to download backup' });
  }
});

// Get backup configuration
router.get('/config', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const config = {
      retentionDays: backupService.retentionDays,
      backupInterval: backupService.backupInterval,
      encryptionEnabled: true,
      encryptionAlgorithm: 'AES-256-CBC',
      integrityVerification: true,
      automatedBackups: true,
      storageType: 'MongoDB',
      backupLocation: 'MongoDB Collections (backupdatas, backupmetadatas)'
    };
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get backup configuration' });
  }
});

// Delete a specific backup
router.delete('/:backupId', authMiddleware, roleMiddleware(['admin']), adminVerificationMiddleware, async (req, res) => {
  try {
    const { backupId } = req.params;
    
    const deleted = await backupService.deleteBackup(backupId);
    
    if (deleted) {
      // Log successful backup deletion
      await AdminSecurityService.logSecurityEvent({
        adminUserId: req.user?.userId || 'unknown',
        adminEmail: req.user?.email || 'unknown',
        action: 'BACKUP_DELETED',
        endpoint: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress,
        backupId: backupId,
        severity: 'MEDIUM',
        isSuccessful: true,
        additionalMetadata: { deletedBackupId: backupId }
      });

      res.json({ success: true, message: 'Backup deleted successfully' });
    } else {
      res.status(404).json({ error: 'Backup not found' });
    }
  } catch (error) {
    console.error('Backup deletion error:', error);
    
    // Log failed backup deletion
    await AdminSecurityService.logSecurityEvent({
      adminUserId: req.user?.userId || 'unknown',
      adminEmail: req.user?.email || 'unknown',
      action: 'BACKUP_DELETED',
      endpoint: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      backupId: req.params.backupId,
      severity: 'HIGH',
      isSuccessful: false,
      additionalMetadata: { error: error.message }
    });

    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

// Get list of backups
router.get('/list', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const backups = await backupService.getAllBackupIds();
    
    // If no backups found in BackupData collection, try to get from metadata
    let formattedBackups = [];
    if (backups.length === 0) {
      console.log('No backups found in BackupData collection, checking metadata...');
      const metadata = await backupService.getBackupMetadata();
      if (metadata.backups && metadata.backups.length > 0) {
        formattedBackups = metadata.backups.map((backup, index) => ({
          _id: backup.backupId || `backup_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          backupId: backup.backupId,
          createdAt: backup.timestamp,
          status: 'completed',
          type: backup.type,
          size: backup.size,
          metadata: {
            type: backup.type,
            originalSize: backup.size,
            timestamp: backup.timestamp,
            collections: backup.collections
          }
        }));
      }
    } else {
      // Format backups from BackupData collection
      formattedBackups = backups.map((backup, index) => {
        const backupId = backup.id || `backup_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
        return {
          _id: backupId,
          backupId: backupId,
          createdAt: backup.timestamp,
          status: 'completed',
          type: backup.type,
          size: backup.size,
          metadata: {
            type: backup.type,
            originalSize: backup.size,
            timestamp: backup.timestamp
          }
        };
      });
    }

    console.log(`Returning ${formattedBackups.length} backups`);
    res.json({ backups: formattedBackups });
  } catch (error) {
    console.error('Failed to get backup list:', error);
    res.status(500).json({ error: 'Failed to retrieve backup list' });
  }
});

// Update backup configuration
router.put('/config', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { retentionDays, backupInterval } = req.body;

    if (retentionDays && retentionDays > 0) {
      backupService.retentionDays = retentionDays;
    }

    if (backupInterval && backupInterval > 0) {
      backupService.backupInterval = backupInterval;
    }

    res.json({
      success: true,
      message: 'Backup configuration updated',
      config: {
        retentionDays: backupService.retentionDays,
        backupInterval: backupService.backupInterval
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update backup configuration' });
  }
});

// Get backup logs/status
router.get('/status', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const status = {
      serviceActive: true,
      lastBackup: null,
      nextBackup: null,
      totalBackups: 0,
      storageType: 'MongoDB',
      diskUsage: 'N/A (MongoDB storage)'
    };

    const metadata = await backupService.getBackupMetadata();
    status.totalBackups = metadata.backups.length;
    status.lastBackup = metadata.lastBackup;

    if (status.lastBackup) {
      const nextBackupTime = new Date(status.lastBackup);
      nextBackupTime.setHours(nextBackupTime.getHours() + backupService.backupInterval);
      status.nextBackup = nextBackupTime.toISOString();
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get backup status' });
  }
});

// Get security logs (Admin only)
router.get('/security-logs', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      action: req.query.action,
      severity: req.query.severity,
      isSuccessful: req.query.isSuccessful ? req.query.isSuccessful === 'true' : undefined,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      adminUserId: req.query.adminUserId
    };

    const result = await AdminSecurityService.getSecurityLogs(filters);
    res.json(result);
  } catch (error) {
    console.error('Failed to get security logs:', error);
    res.status(500).json({ error: 'Failed to retrieve security logs' });
  }
});

// Get security statistics
router.get('/security-stats', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '30d';
    const stats = await AdminSecurityService.getSecurityStatistics(timeframe);
    res.json(stats);
  } catch (error) {
    console.error('Failed to get security statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve security statistics' });
  }
});

// Verify admin PIN (first step of verification - no JWT required)
router.post('/verify-admin', async (req, res) => {
  try {
    const { adminPin } = req.body;

    if (!adminPin) {
      return res.status(400).json({ error: 'Admin PIN is required' });
    }

    // Verify admin PIN using AdminSecurityService
    const isValidPin = await AdminSecurityService.verifyAdminPin('system', 'system', adminPin);

    if (!isValidPin) {
      // Log failed PIN verification attempt
      await AdminSecurityService.logSecurityEvent({
        adminUserId: 'unknown',
        adminEmail: 'unknown',
        action: 'BACKUP_ACCESS_ATTEMPT',
        endpoint: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress,
        severity: 'HIGH',
        isSuccessful: false,
        additionalMetadata: { reason: 'Invalid admin PIN' }
      });

      return res.status(400).json({ error: 'Invalid admin PIN' });
    }

    // Log successful PIN verification
    await AdminSecurityService.logSecurityEvent({
      adminUserId: 'unknown',
      adminEmail: 'unknown',
      action: 'BACKUP_VERIFICATION_SUCCESS',
      endpoint: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      severity: 'LOW',
      isSuccessful: true,
      additionalMetadata: { step: 'PIN verification' }
    });

    res.json({ success: true, message: 'Admin PIN verified successfully' });
  } catch (error) {
    console.error('Admin PIN verification error:', error);
    res.status(500).json({ error: 'PIN verification failed' });
  }
});// Get security questions for verification
router.get('/security-questions', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const questions = AdminSecurityService.getSecurityQuestions();
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get security questions' });
  }
});

// Export security logs as JSON
router.get('/security-logs/export', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const filters = {
      action: req.query.action,
      severity: req.query.severity,
      isSuccessful: req.query.isSuccessful ? req.query.isSuccessful === 'true' : undefined,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      adminUserId: req.query.adminUserId
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const logs = await AdminSecurityService.getSecurityLogs({ 
      ...filters, 
      limit: 10000 // Export limit
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="security-logs.json"');
    res.json({
      exportDate: new Date().toISOString(),
      filters: filters,
      totalLogs: logs.logs.length,
      logs: logs.logs
    });
  } catch (error) {
    console.error('Failed to export security logs:', error);
    res.status(500).json({ error: 'Failed to export security logs' });
  }
});

module.exports = router;