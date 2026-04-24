const mongoose = require('mongoose');
const crypto = require('crypto');

// Define MongoDB schemas for backup storage
const BackupDataSchema = new mongoose.Schema({
  backupId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['full', 'incremental'], required: true },
  encryptedData: { type: String, required: true }, // Base64 encoded encrypted data
  iv: { type: String, required: true }, // Initialization vector
  metadata: {
    timestamp: { type: Date, required: true },
    version: { type: String, default: '1.0.0' },
    collections: [{
      name: String,
      documentCount: Number,
      size: Number
    }],
    integrityHash: { type: String, required: true },
    size: { type: Number, required: true },
    lastBackupTimestamp: Date
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date } // For automatic cleanup
});

// Add TTL index for automatic cleanup
BackupDataSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BackupMetadataSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now }
});

// Create models
const BackupData = mongoose.model('BackupData', BackupDataSchema);
const BackupMetadata = mongoose.model('BackupMetadata', BackupMetadataSchema);

class DatabaseBackupService {
  constructor() {
    // Ensure encryption key is 32 bytes for AES-256
    const keyString = process.env.BACKUP_ENCRYPTION_KEY || 'your-256-bit-secret-key-here-change-this-in-production';
    this.encryptionKey = crypto.scryptSync(keyString, 'salt', 32); // Derive 32-byte key
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
    this.backupInterval = parseInt(process.env.BACKUP_INTERVAL_HOURS) || 24;
  }

  /**
   * Calculate SHA-256 hash for integrity verification
   */
  calculateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Initialize backup service - ensure MongoDB collections exist
   */
  async initialize() {
    try {
      // Ensure collections exist
      await BackupData.createCollection();
      await BackupMetadata.createCollection();

      // Create TTL index for automatic cleanup
      await BackupData.collection.createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
      );

      console.log('✅ Database backup service initialized with MongoDB storage');
    } catch (error) {
      console.error('❌ Failed to initialize backup service:', error);
      throw error;
    }
  }

  /**
   * Create a full database backup
   */
  async createFullBackup(options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `full_${timestamp}`;

    try {
      console.log(`🔄 Starting full database backup: ${backupId}`);

      // Get all collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      const backupData = {
        metadata: {
          backupId,
          type: 'full',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          collections: []
        },
        data: {}
      };

      // Backup each collection
      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;
        console.log(`📊 Backing up collection: ${collectionName}`);

        const collection = mongoose.connection.db.collection(collectionName);
        const documents = await collection.find({}).toArray();

        backupData.data[collectionName] = documents;
        backupData.metadata.collections.push({
          name: collectionName,
          documentCount: documents.length,
          size: JSON.stringify(documents).length
        });
      }

      // Calculate integrity hash
      const dataString = JSON.stringify(backupData);
      backupData.metadata.integrityHash = this.calculateHash(dataString);
      backupData.metadata.size = dataString.length;

      // Encrypt and store in MongoDB
      await this.storeEncryptedBackupInDB(backupData);

      // Update backup metadata
      await this.updateBackupMetadata(backupData.metadata);

      // Clean up old backups
      await this.cleanupOldBackups();

      console.log(`✅ Full backup completed: ${backupId}`);
      return {
        success: true,
        backupId,
        size: backupData.metadata.size,
        collections: backupData.metadata.collections.length
      };

    } catch (error) {
      console.error('❌ Full backup failed:', error);
      throw error;
    }
  }

  /**
   * Create incremental backup (changes since last backup)
   */
  async createIncrementalBackup(lastBackupTimestamp) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `incremental_${timestamp}`;

    try {
      console.log(`🔄 Starting incremental backup: ${backupId}`);

      const collections = await mongoose.connection.db.listCollections().toArray();
      const backupData = {
        metadata: {
          backupId,
          type: 'incremental',
          timestamp: new Date().toISOString(),
          lastBackupTimestamp,
          version: '1.0.0',
          collections: []
        },
        data: {}
      };

      // Backup only modified documents since last backup
      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;
        const collection = mongoose.connection.db.collection(collectionName);

        // Find documents modified since last backup
        const modifiedDocs = await collection.find({
          updatedAt: { $gte: new Date(lastBackupTimestamp) }
        }).toArray();

        if (modifiedDocs.length > 0) {
          backupData.data[collectionName] = modifiedDocs;
          backupData.metadata.collections.push({
            name: collectionName,
            documentCount: modifiedDocs.length,
            size: JSON.stringify(modifiedDocs).length
          });
        }
      }

      if (Object.keys(backupData.data).length === 0) {
        console.log('ℹ️ No changes detected, skipping incremental backup');
        return { success: true, message: 'No changes to backup' };
      }

      // Calculate integrity hash
      const dataString = JSON.stringify(backupData);
      backupData.metadata.integrityHash = this.calculateHash(dataString);
      backupData.metadata.size = dataString.length;

      // Encrypt and store in MongoDB
      await this.storeEncryptedBackupInDB(backupData);

      // Update backup metadata
      await this.updateBackupMetadata(backupData.metadata);

      console.log(`✅ Incremental backup completed: ${backupId}`);
      return {
        success: true,
        backupId,
        size: backupData.metadata.size,
        collections: backupData.metadata.collections.length
      };

    } catch (error) {
      console.error('❌ Incremental backup failed:', error);
      throw error;
    }
  }

  /**
   * Store encrypted backup data in MongoDB
   */
  async storeEncryptedBackupInDB(backupData) {
    try {
      const { metadata } = backupData;
      const { backupId, type } = metadata;
      const dataString = JSON.stringify(backupData);

      // Generate a random IV for each backup
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);

      let encrypted = cipher.update(dataString, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.retentionDays);

      // Store in MongoDB
      const backupDoc = {
        backupId,
        type,
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        metadata,
        expiresAt
      };

      await BackupData.findOneAndUpdate(
        { backupId },
        backupDoc,
        { upsert: true, new: true }
      );

      console.log(`🔐 Encrypted backup stored in MongoDB: ${backupId}`);

    } catch (error) {
      console.error('❌ Failed to store encrypted backup in DB:', error);
      throw error;
    }
  }

  /**
   * Retrieve and decrypt backup from MongoDB
   */
  async retrieveDecryptedBackupFromDB(backupId) {
    try {
      const backupDoc = await BackupData.findOne({ backupId });

      if (!backupDoc) {
        throw new Error('Backup not found');
      }

      const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, Buffer.from(backupDoc.iv, 'hex'));
      decipher.setAutoPadding(true);

      let decrypted = decipher.update(backupDoc.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('❌ Failed to retrieve/decrypt backup from DB:', error);
      throw error;
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackupIntegrity(backupId) {
    try {
      const backupData = await this.retrieveDecryptedBackupFromDB(backupId);
      const dataString = JSON.stringify(backupData);
      const calculatedHash = this.calculateHash(dataString);

      const isValid = calculatedHash === backupData.metadata.integrityHash;

      return {
        valid: isValid,
        backupId,
        originalHash: backupData.metadata.integrityHash,
        calculatedHash,
        timestamp: backupData.metadata.timestamp
      };
    } catch (error) {
      console.error('❌ Backup integrity verification failed:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId, options = {}) {
    try {
      console.log(`🔄 Starting restore from backup: ${backupId}`);

      // Verify backup integrity first
      const integrityCheck = await this.verifyBackupIntegrity(backupId);
      if (!integrityCheck.valid) {
        throw new Error('Backup integrity check failed - backup may be corrupted');
      }

      const backupData = await this.retrieveDecryptedBackupFromDB(backupId);
      const { dryRun = false, collections = null } = options;

      let restoredCollections = 0;
      let restoredDocuments = 0;

      // Restore each collection
      for (const [collectionName, documents] of Object.entries(backupData.data)) {
        if (collections && !collections.includes(collectionName)) {
          continue; // Skip if not in specified collections
        }

        console.log(`📊 Restoring collection: ${collectionName} (${documents.length} documents)`);

        if (!dryRun) {
          const collection = mongoose.connection.db.collection(collectionName);

          // Clear existing data if full backup
          if (backupData.metadata.type === 'full') {
            await collection.deleteMany({});
          }

          // Insert backup data
          if (documents.length > 0) {
            await collection.insertMany(documents, { ordered: false });
          }
        }

        restoredCollections++;
        restoredDocuments += documents.length;
      }

      console.log(`✅ Restore completed: ${restoredCollections} collections, ${restoredDocuments} documents`);

      return {
        success: true,
        backupId,
        type: backupData.metadata.type,
        restoredCollections,
        restoredDocuments,
        dryRun
      };

    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  /**
   * Get backup metadata
   */
  async getBackupMetadata() {
    try {
      const metadataDoc = await BackupMetadata.findOne({ key: 'backup_history' });

      if (metadataDoc && metadataDoc.data) {
        return metadataDoc.data;
      }

      // Return empty metadata if not found
      return { backups: [], lastBackup: null };
    } catch (error) {
      console.error('❌ Failed to read backup metadata:', error);
      return { backups: [], lastBackup: null };
    }
  }

  /**
   * Update backup metadata
   */
  async updateBackupMetadata(backupMetadata) {
    try {
      const currentMetadata = await this.getBackupMetadata();

      currentMetadata.backups.unshift(backupMetadata);
      currentMetadata.lastBackup = backupMetadata.timestamp;

      // Keep only last 100 backups in metadata
      if (currentMetadata.backups.length > 100) {
        currentMetadata.backups = currentMetadata.backups.slice(0, 100);
      }

      await BackupMetadata.findOneAndUpdate(
        { key: 'backup_history' },
        {
          key: 'backup_history',
          data: currentMetadata,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('❌ Failed to update backup metadata:', error);
      throw error;
    }
  }

  /**
   * Clean up old backups (TTL will handle automatic cleanup, this is for manual cleanup)
   */
  async cleanupOldBackups() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      const result = await BackupData.deleteMany({
        'metadata.timestamp': { $lt: cutoffDate.toISOString() }
      });

      if (result.deletedCount > 0) {
        console.log(`🗑️ Cleaned up ${result.deletedCount} old backups from MongoDB`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup old backups:', error);
    }
  }

  /**
   * Get all backup IDs
   */
  async getAllBackupIds() {
    try {
      const backups = await BackupData.find(
        { backupId: { $ne: null, $exists: true } }, 
        { backupId: 1, type: 1, metadata: 1 }
      )
        .sort({ 'metadata.timestamp': -1 });
      return backups.map(b => ({
        id: b.backupId,
        type: b.type,
        timestamp: b.metadata.timestamp,
        size: b.metadata.size
      }));
    } catch (error) {
      console.error('❌ Failed to get backup IDs:', error);
      return [];
    }
  }

  /**
   * Delete a specific backup
   */
  async deleteBackup(backupId) {
    try {
      const result = await BackupData.deleteOne({ backupId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('❌ Failed to delete backup:', error);
      return false;
    }
  }

  /**
   * Schedule automated backups
   */
  scheduleAutomatedBackups() {
    console.log(`⏰ Scheduling automated backups every ${this.backupInterval} hours`);

    setInterval(async () => {
      try {
        const metadata = await this.getBackupMetadata();
        const lastBackup = metadata.lastBackup;

        if (!lastBackup) {
          // First backup - create full backup
          await this.createFullBackup();
        } else {
          const hoursSinceLastBackup = (new Date() - new Date(lastBackup)) / (1000 * 60 * 60);

          if (hoursSinceLastBackup >= this.backupInterval) {
            // Create incremental backup
            await this.createIncrementalBackup(lastBackup);
          }
        }
      } catch (error) {
        console.error('❌ Automated backup failed:', error);
      }
    }, this.backupInterval * 60 * 60 * 1000); // Convert hours to milliseconds
  }

  /**
   * Get backup statistics
   */
  async getBackupStatistics() {
    try {
      const metadata = await this.getBackupMetadata();
      const stats = {
        totalBackups: metadata.backups.length,
        lastBackup: metadata.lastBackup,
        backupTypes: {
          full: metadata.backups.filter(b => b.type === 'full').length,
          incremental: metadata.backups.filter(b => b.type === 'incremental').length
        },
        totalSize: metadata.backups.reduce((sum, b) => sum + (b.size || 0), 0),
        collections: {}
      };

      // Calculate collection statistics
      metadata.backups.forEach(backup => {
        if (backup.collections) {
          backup.collections.forEach(col => {
            if (!stats.collections[col.name]) {
              stats.collections[col.name] = { backups: 0, documents: 0, size: 0 };
            }
            stats.collections[col.name].backups++;
            stats.collections[col.name].documents += col.documentCount || 0;
            stats.collections[col.name].size += col.size || 0;
          });
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ Failed to get backup statistics:', error);
      return null;
    }
  }

  /**
   * Start automated backup scheduling
   */
  startAutomatedBackups() {
    console.log(`⏰ Starting automated backups every ${this.backupInterval} hours`);

    // Schedule backups
    this.backupIntervalId = setInterval(async () => {
      try {
        console.log('🔄 Running scheduled backup...');
        const metadata = await this.getBackupMetadata();
        const lastBackup = metadata.lastBackup;

        if (!lastBackup) {
          await this.createFullBackup();
        } else {
          const hoursSinceLastBackup = (new Date() - new Date(lastBackup)) / (1000 * 60 * 60);
          if (hoursSinceLastBackup >= this.backupInterval) {
            await this.createIncrementalBackup(lastBackup);
          }
        }
        console.log('✅ Scheduled backup completed successfully');
      } catch (error) {
        console.error('❌ Scheduled backup failed:', error.message);
      }
    }, this.backupInterval * 60 * 60 * 1000); // Convert hours to milliseconds

    // Also schedule cleanup of old backups daily
    this.cleanupIntervalId = setInterval(async () => {
      try {
        console.log('🧹 Running scheduled backup cleanup...');
        await this.cleanupOldBackups();
        console.log('✅ Scheduled cleanup completed successfully');
      } catch (error) {
        console.error('❌ Scheduled cleanup failed:', error.message);
      }
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  /**
   * Stop automated backup scheduling
   */
  stopAutomatedBackups() {
    if (this.backupIntervalId) {
      clearInterval(this.backupIntervalId);
      console.log('⏹️  Automated backup scheduling stopped');
    }
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      console.log('⏹️  Automated cleanup scheduling stopped');
    }
  }
}

module.exports = DatabaseBackupService;