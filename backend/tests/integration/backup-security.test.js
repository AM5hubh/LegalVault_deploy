// Integration test for the enhanced backup security system
const request = require('supertest');
const app = require('../server');
const AdminSecurityService = require('../services/AdminSecurityService');

describe('Enhanced Backup Security System', () => {
  let adminToken;
  let adminUserId;

  beforeAll(async () => {
    // Setup admin user and get token
    // This would be your actual admin authentication setup
    adminToken = 'your-admin-jwt-token';
    adminUserId = 'admin-user-id';
  });

  describe('Security Verification', () => {
    test('should get security questions for admin verification', async () => {
      const response = await request(app)
        .get('/api/backup/security-questions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.questions).toBeDefined();
      expect(Array.isArray(response.body.questions)).toBe(true);
      expect(response.body.questions.length).toBeGreaterThan(0);
    });

    test('should verify admin with PIN and security questions', async () => {
      const response = await request(app)
        .post('/api/backup/verify-admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminPin: '123456',
          securityAnswers: {
            'business-justification': 'Regular maintenance backup for compliance',
            'data-sensitivity': 'Contains sensitive legal documents requiring encryption',
            'compliance-requirement': 'Required for SOX compliance auditing'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('verification successful');
    });
  });

  describe('Security Logging', () => {
    test('should log security events immutably', async () => {
      // Simulate a backup access attempt
      await AdminSecurityService.logSecurityEvent(
        'BACKUP_ACCESS_ATTEMPT',
        adminUserId,
        'HIGH',
        true,
        'Admin requested backup system access',
        {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 Test',
          sessionId: 'test-session-123'
        }
      );

      const logs = await AdminSecurityService.getSecurityLogs({
        page: 1,
        limit: 10,
        action: 'BACKUP_ACCESS_ATTEMPT'
      });

      expect(logs.logs.length).toBeGreaterThan(0);
      expect(logs.logs[0].action).toBe('BACKUP_ACCESS_ATTEMPT');
      expect(logs.logs[0].adminUserId.toString()).toBe(adminUserId);
    });

    test('should retrieve security logs with filtering', async () => {
      const response = await request(app)
        .get('/api/backup/security-logs?severity=HIGH&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.logs).toBeDefined();
      expect(Array.isArray(response.body.logs)).toBe(true);
      expect(response.body.totalPages).toBeDefined();
    });

    test('should export security logs for compliance', async () => {
      const response = await request(app)
        .get('/api/backup/security-logs/export?severity=HIGH')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body.exportDate).toBeDefined();
      expect(response.body.logs).toBeDefined();
    });
  });

  describe('Backup Operations with Security', () => {
    test('should create backup with full security verification', async () => {
      const response = await request(app)
        .post('/api/backup/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminPin: '123456',
          securityAnswers: {
            'business-justification': 'Weekly backup for disaster recovery',
            'data-sensitivity': 'Contains confidential client information',
            'operational-timeline': 'Immediate backup required for maintenance window'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.backupId).toBeDefined();
    });

    test('should fail backup creation with invalid PIN', async () => {
      const response = await request(app)
        .post('/api/backup/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminPin: 'wrong-pin',
          securityAnswers: {
            'business-justification': 'Test backup'
          }
        })
        .expect(403);

      expect(response.body.error).toContain('Invalid admin PIN');
    });

    test('should fail backup creation with insufficient security answers', async () => {
      const response = await request(app)
        .post('/api/backup/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminPin: '123456',
          securityAnswers: {
            // Missing required security answers
          }
        })
        .expect(400);

      expect(response.body.error).toContain('security questions');
    });
  });

  describe('Security Statistics', () => {
    test('should retrieve security statistics for monitoring', async () => {
      const response = await request(app)
        .get('/api/backup/security-stats?timeframe=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.totalEvents).toBeDefined();
      expect(response.body.failedAttempts).toBeDefined();
      expect(response.body.highSeverityEvents).toBeDefined();
      expect(response.body.recentEvents).toBeDefined();
    });
  });

  describe('Immutable Logging Verification', () => {
    test('should prevent modification of security logs', async () => {
      // Create a security log
      const logId = await AdminSecurityService.logSecurityEvent(
        'TEST_EVENT',
        adminUserId,
        'MEDIUM',
        true,
        'Test security event for immutability verification',
        { testData: 'original' }
      );

      // Attempt to modify the log (should fail due to pre-save hooks)
      const AdminSecurityLog = require('../models/AdminSecurityLog');
      
      try {
        await AdminSecurityLog.findByIdAndUpdate(logId, {
          details: 'Modified details',
          severity: 'LOW'
        });
      } catch (error) {
        expect(error.message).toContain('Security logs cannot be modified');
      }

      // Verify the log remains unchanged
      const unchangedLog = await AdminSecurityLog.findById(logId);
      expect(unchangedLog.details).toBe('Test security event for immutability verification');
      expect(unchangedLog.severity).toBe('MEDIUM');
    });

    test('should prevent deletion of security logs', async () => {
      // Create a security log
      const logId = await AdminSecurityService.logSecurityEvent(
        'TEST_DELETE_EVENT',
        adminUserId,
        'HIGH',
        true,
        'Test security event for deletion prevention',
        { testData: 'cannot-delete' }
      );

      // Attempt to delete the log (should fail due to pre-remove hooks)
      const AdminSecurityLog = require('../models/AdminSecurityLog');
      
      try {
        await AdminSecurityLog.findByIdAndDelete(logId);
      } catch (error) {
        expect(error.message).toContain('Security logs cannot be deleted');
      }

      // Verify the log still exists
      const existingLog = await AdminSecurityLog.findById(logId);
      expect(existingLog).toBeTruthy();
      expect(existingLog.details).toBe('Test security event for deletion prevention');
    });
  });
});

// Performance test for large log volumes
describe('Security Logging Performance', () => {
  test('should handle high volume of security events efficiently', async () => {
    const startTime = Date.now();
    const promises = [];

    // Simulate 100 concurrent security events
    for (let i = 0; i < 100; i++) {
      promises.push(
        AdminSecurityService.logSecurityEvent(
          'PERFORMANCE_TEST',
          'test-admin-id',
          'LOW',
          true,
          `Performance test event ${i}`,
          { eventNumber: i }
        )
      );
    }

    await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time (5 seconds for 100 events)
    expect(duration).toBeLessThan(5000);
  });
});

module.exports = {
  testSuite: 'Enhanced Backup Security System',
  description: 'Comprehensive test suite for immutable security logging and multi-factor admin verification'
};