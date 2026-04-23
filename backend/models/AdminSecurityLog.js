const mongoose = require('mongoose');

// Immutable admin security log schema
const AdminSecurityLogSchema = new mongoose.Schema({
  logId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  adminUserId: { type: String, required: true },
  adminEmail: { type: String, required: true },
  action: { 
    type: String, 
    required: true,
    enum: [
      'BACKUP_ACCESS_ATTEMPT',
      'BACKUP_VERIFICATION_SUCCESS',
      'BACKUP_VERIFICATION_FAILED',
      'BACKUP_CREATED',
      'BACKUP_RESTORED',
      'BACKUP_DOWNLOADED',
      'BACKUP_DELETED',
      'CONFIG_CHANGED',
      'SECURITY_QUESTION_ANSWERED'
    ]
  },
  details: {
    endpoint: String,
    method: String,
    userAgent: String,
    ipAddress: String,
    timestamp: { type: Date, default: Date.now },
    verificationQuestions: [{
      question: String,
      answer: String,
      isCorrect: Boolean,
      answeredAt: { type: Date, default: Date.now }
    }],
    backupId: String,
    backupType: String,
    resourcesAccessed: [String],
    additionalMetadata: mongoose.Schema.Types.Mixed
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  isSuccessful: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now, immutable: true },
  // This field ensures logs cannot be modified
  isImmutable: { type: Boolean, default: true, immutable: true }
}, {
  // Prevent updates to this collection
  strict: true,
  timestamps: false, // We handle timestamps manually for security
  versionKey: false
});

// Prevent any updates or deletions
AdminSecurityLogSchema.pre('updateOne', function() {
  throw new Error('Security logs are immutable and cannot be modified');
});

AdminSecurityLogSchema.pre('findOneAndUpdate', function() {
  throw new Error('Security logs are immutable and cannot be modified');
});

AdminSecurityLogSchema.pre('findOneAndDelete', function() {
  throw new Error('Security logs are immutable and cannot be deleted');
});

AdminSecurityLogSchema.pre('deleteOne', function() {
  throw new Error('Security logs are immutable and cannot be deleted');
});

AdminSecurityLogSchema.pre('deleteMany', function() {
  throw new Error('Security logs are immutable and cannot be deleted');
});

// Create compound index for efficient querying
AdminSecurityLogSchema.index({ adminUserId: 1, createdAt: -1 });
AdminSecurityLogSchema.index({ action: 1, createdAt: -1 });
AdminSecurityLogSchema.index({ severity: 1, createdAt: -1 });

module.exports = mongoose.model('AdminSecurityLog', AdminSecurityLogSchema);