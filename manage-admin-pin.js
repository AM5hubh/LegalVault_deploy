#!/usr/bin/env node

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 LEGALVAULT Admin PIN Management Tool');
console.log('=====================================\n');

console.log('Current ADMIN_BACKUP_VERIFICATION_CODE in .env:');
console.log('f2f98a4ca5a4ac139c90021af3cb855ae5e4a291ff4e9a7ab2635e3ad1303eb3\n');

console.log('Options:');
console.log('1. Set a new admin PIN');
console.log('2. Test if a PIN matches the current hash');
console.log('3. Generate hash for a PIN (to manually update .env)');
console.log('4. Show common PIN examples\n');

rl.question('Choose an option (1-4): ', (choice) => {
  switch (choice) {
    case '1':
      rl.question('Enter new admin PIN (6-20 characters): ', (pin) => {
        if (pin.length < 6 || pin.length > 20) {
          console.log('❌ PIN must be 6-20 characters long');
          rl.close();
          return;
        }

        const hash = crypto.createHash('sha256').update(pin).digest('hex');
        console.log('\n✅ New PIN set!');
        console.log('PIN:', pin);
        console.log('SHA-256 Hash:', hash);
        console.log('\n📝 Update your .env file:');
        console.log(`ADMIN_BACKUP_VERIFICATION_CODE=${hash}`);
        rl.close();
      });
      break;

    case '2':
      rl.question('Enter PIN to test: ', (pin) => {
        const hash = crypto.createHash('sha256').update(pin).digest('hex');
        const currentHash = 'f2f98a4ca5a4ac139c90021af3cb855ae5e4a291ff4e9a7ab2635e3ad1303eb3';

        if (hash === currentHash) {
          console.log('✅ PIN matches! This is the correct admin PIN.');
        } else {
          console.log('❌ PIN does not match the current hash.');
        }
        rl.close();
      });
      break;

    case '3':
      rl.question('Enter PIN to hash: ', (pin) => {
        const hash = crypto.createHash('sha256').update(pin).digest('hex');
        console.log('\nSHA-256 Hash:', hash);
        console.log('Use this in your .env file as ADMIN_BACKUP_VERIFICATION_CODE');
        rl.close();
      });
      break;

    case '4':
      console.log('\n🔍 Common PIN Examples:');
      const examples = [
        'ADMIN123',
        'SECURE2025',
        'BACKUP2025',
        'LEGALVAULT',
        'ADMIN2025',
        'SECUREPIN',
        'VAULT2025'
      ];

      examples.forEach(pin => {
        const hash = crypto.createHash('sha256').update(pin).digest('hex');
        console.log(`${pin} -> ${hash}`);
      });

      console.log('\n💡 Tip: Use a strong PIN like "ADMIN2025" or "SECURE2025"');
      rl.close();
      break;

    default:
      console.log('❌ Invalid option');
      rl.close();
  }
});