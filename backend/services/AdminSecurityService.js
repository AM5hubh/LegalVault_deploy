const AdminSecurityLog = require('../models/AdminSecurityLog');
const crypto = require('crypto');

class AdminSecurityService {
  constructor() {
    this.securityQuestions = [
      {
        id: 'backup_purpose',
        question: 'What is the primary purpose of this backup operation?',
        type: 'select',
        options: ['Data Migration', 'Disaster Recovery', 'System Maintenance', 'Security Audit', 'Compliance Requirement'],
        required: true
      },
      {
        id: 'business_justification',
        question: 'Provide business justification for accessing backup system:',
        type: 'text',
        minLength: 10,
        required: true
      },
      {
        id: 'data_sensitivity',
        question: 'Rate the sensitivity of data being accessed (1-5):',
        type: 'number',
        min: 1,
        max: 5,
        required: true
      },
      {
        id: 'notification_required',
        question: 'Should data owners be notified of this access?',
        type: 'select',
        options: ['Yes - Immediate', 'Yes - Within 24 hours', 'No - Routine operation'],
        required: true
      },
      {
        id: 'compliance_framework',
        question: 'Which compliance framework applies to this operation?',
        type: 'select',
        options: ['GDPR', 'HIPAA', 'SOX', 'PCI-DSS', 'Internal Policy', 'N/A'],
        required: false
      }
    ];
  }

  /**
   * Get security questions for admin verification
   */
  getSecurityQuestions() {
    return this.securityQuestions;
  }

  /**
   * Validate security question answers
   */
  validateSecurityAnswers(answers) {
    const errors = [];
    const validatedAnswers = [];

    for (const question of this.securityQuestions) {
      const answer = answers[question.id];
      
      if (question.required && (!answer || answer.toString().trim() === '')) {
        errors.push(`${question.question} is required`);
        continue;
      }

      // Validate based on question type
      switch (question.type) {
        case 'text':
          if (question.minLength && answer.length < question.minLength) {
            errors.push(`${question.question} must be at least ${question.minLength} characters`);
          }
          break;
        case 'number':
          const numValue = parseInt(answer);
          if (isNaN(numValue) || numValue < question.min || numValue > question.max) {
            errors.push(`${question.question} must be between ${question.min} and ${question.max}`);
          }
          break;
        case 'select':
          if (!question.options.includes(answer)) {
            errors.push(`${question.question} must be one of the provided options`);
          }
          break;
      }

      validatedAnswers.push({
        question: question.question,
        answer: answer,
        isCorrect: errors.length === 0
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      validatedAnswers
    };
  }

  /**
   * Log admin security event (immutable)
   */
  async logSecurityEvent(eventData) {
    try {
      const logEntry = new AdminSecurityLog({
        adminUserId: eventData.adminUserId,
        adminEmail: eventData.adminEmail,
        action: eventData.action,
        details: {
          endpoint: eventData.endpoint,
          method: eventData.method,
          userAgent: eventData.userAgent,
          ipAddress: eventData.ipAddress,
          timestamp: new Date(),
          verificationQuestions: eventData.verificationQuestions || [],
          backupId: eventData.backupId,
          backupType: eventData.backupType,
          resourcesAccessed: eventData.resourcesAccessed || [],
          additionalMetadata: eventData.additionalMetadata || {}
        },
        severity: eventData.severity || 'MEDIUM',
        isSuccessful: eventData.isSuccessful
      });

      const savedLog = await logEntry.save();
      
      // Log to console for real-time monitoring
      console.log(`🔒 SECURITY LOG [${savedLog.severity}]: ${savedLog.action}`, {
        logId: savedLog.logId,
        adminEmail: savedLog.adminEmail,
        timestamp: savedLog.createdAt,
        isSuccessful: savedLog.isSuccessful
      });

      return savedLog;
    } catch (error) {
      console.error('❌ Failed to create security log:', error);
      throw error;
    }
  }

  /**
   * Get security logs with filtering
   */
  async getSecurityLogs(filters = {}) {
    try {
      const {
        adminUserId,
        action,
        severity,
        isSuccessful,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = filters;

      const query = {};

      if (adminUserId) query.adminUserId = adminUserId;
      if (action) query.action = action;
      if (severity) query.severity = severity;
      if (typeof isSuccessful === 'boolean') query.isSuccessful = isSuccessful;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;
      
      const [logs, total] = await Promise.all([
        AdminSecurityLog.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AdminSecurityLog.countDocuments(query)
      ]);

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Failed to retrieve security logs:', error);
      throw error;
    }
  }

  /**
   * Get security statistics
   */
  async getSecurityStatistics(timeframe = '30d') {
    try {
      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await AdminSecurityLog.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            successfulEvents: {
              $sum: { $cond: [{ $eq: ['$isSuccessful', true] }, 1, 0] }
            },
            failedEvents: {
              $sum: { $cond: [{ $eq: ['$isSuccessful', false] }, 1, 0] }
            },
            criticalEvents: {
              $sum: { $cond: [{ $eq: ['$severity', 'CRITICAL'] }, 1, 0] }
            },
            highSeverityEvents: {
              $sum: { $cond: [{ $eq: ['$severity', 'HIGH'] }, 1, 0] }
            }
          }
        }
      ]);

      // Get action breakdown
      const actionBreakdown = await AdminSecurityLog.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      return {
        timeframe: `${days} days`,
        summary: stats[0] || {
          totalEvents: 0,
          successfulEvents: 0,
          failedEvents: 0,
          criticalEvents: 0,
          highSeverityEvents: 0
        },
        actionBreakdown
      };
    } catch (error) {
      console.error('❌ Failed to get security statistics:', error);
      throw error;
    }
  }

  /**
   * Verify admin PIN only (first step of verification)
   */
  async verifyAdminPin(adminUserId, adminEmail, pin) {
    try {
      if (!pin) {
        return false;
      }

      const expectedHash = process.env.ADMIN_BACKUP_VERIFICATION_CODE;
      if (!expectedHash) {
        console.error('❌ ADMIN_BACKUP_VERIFICATION_CODE not set in environment');
        return false;
      }

      const providedHash = crypto.createHash('sha256').update(pin).digest('hex');
      return providedHash === expectedHash;
    } catch (error) {
      console.error('❌ Admin PIN verification error:', error);
      return false;
    }
  }

  /**
   * Verify admin PIN and questions
   */
  async verifyAdminAccess(adminUserId, adminEmail, pin, questionAnswers, metadata = {}) {
    const startTime = Date.now();
    
    try {
      // Verify PIN
      const expectedHash = process.env.ADMIN_BACKUP_VERIFICATION_CODE;
      const providedHash = crypto.createHash('sha256').update(pin).digest('hex');
      
      const isPinValid = providedHash === expectedHash;
      
      // Validate security questions
      const questionValidation = this.validateSecurityAnswers(questionAnswers);
      
      const isAccessGranted = isPinValid && questionValidation.isValid;
      
      // Log the verification attempt
      await this.logSecurityEvent({
        adminUserId,
        adminEmail,
        action: isAccessGranted ? 'BACKUP_VERIFICATION_SUCCESS' : 'BACKUP_VERIFICATION_FAILED',
        endpoint: metadata.endpoint,
        method: metadata.method,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        verificationQuestions: questionValidation.validatedAnswers,
        severity: isAccessGranted ? 'MEDIUM' : 'HIGH',
        isSuccessful: isAccessGranted,
        additionalMetadata: {
          pinProvided: !!pin,
          questionsAnswered: Object.keys(questionAnswers).length,
          verificationTime: Date.now() - startTime
        }
      });

      return {
        success: isAccessGranted,
        pinValid: isPinValid,
        questionsValid: questionValidation.isValid,
        errors: questionValidation.errors,
        message: isAccessGranted 
          ? 'Admin access verified successfully' 
          : 'Verification failed. Check PIN and security questions.'
      };
      
    } catch (error) {
      // Log the error
      await this.logSecurityEvent({
        adminUserId,
        adminEmail,
        action: 'BACKUP_VERIFICATION_FAILED',
        endpoint: metadata.endpoint,
        method: metadata.method,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        severity: 'CRITICAL',
        isSuccessful: false,
        additionalMetadata: {
          error: error.message,
          verificationTime: Date.now() - startTime
        }
      });

      throw error;
    }
  }
}

module.exports = new AdminSecurityService();