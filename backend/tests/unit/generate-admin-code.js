#!/usr/bin/env node

/**
 * Generate Admin Backup Verification Code Hash
 *
 * Usage: node generate-admin-code.js "your-secret-code"
 *
 * This script generates a SHA-256 hash of your admin verification code
 * that can be used in the ADMIN_BACKUP_VERIFICATION_CODE environment variable.
 */

const crypto = require('crypto');

function generateAdminCodeHash(code) {
  if (!code) {
    console.error('❌ Error: Please provide an admin verification code');
    console.log('Usage: node generate-admin-code.js "your-secret-code"');
    process.exit(1);
  }

  const hash = crypto.createHash('sha256').update(code).digest('hex');

  console.log('🔐 Admin Backup Verification Code Setup');
  console.log('=====================================');
  console.log(`Original Code: ${code}`);
  console.log(`SHA-256 Hash: ${hash}`);
  console.log('');
  console.log('Add this to your .env file:');
  console.log(`ADMIN_BACKUP_VERIFICATION_CODE=${hash}`);
  console.log('');
  console.log('⚠️  Important: Keep your original code safe and never commit it to version control!');
  console.log('   Only the hash should be stored in environment variables.');
}

// Get code from command line argument
const code = process.argv[2];
generateAdminCodeHash(code);