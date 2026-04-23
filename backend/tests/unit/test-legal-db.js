// Test script to directly test the legal chatbot controller
const controller = require('../../controllers/legalChatbotController');

// Initialize the database
console.log('=== Initializing Legal Database ===');
controller.initializeLegalDatabase();

// Test the database directly
console.log('\n=== Testing Legal Database Access ===');
const { legalDatabase } = controller;

console.log('Legal Database keys:', Object.keys(legalDatabase));
console.log('Total databases:', Object.keys(legalDatabase).length);

Object.entries(legalDatabase).forEach(([key, data]) => {
  const count = Object.keys(data).length;
  console.log(`${key.toUpperCase()}: ${count} sections`);

  // Show a sample entry
  const firstKey = Object.keys(data)[0];
  if (firstKey && data[firstKey]) {
    console.log(`  Sample ${key.toUpperCase()} entry:`, {
      section: data[firstKey].number,
      title: data[firstKey].title?.substring(0, 50) + '...'
    });
  }
});

console.log('\n=== Total Sections ===');
const totalSections = Object.values(legalDatabase).reduce((sum, db) => sum + Object.keys(db).length, 0);
console.log(`Total sections across all databases: ${totalSections}`);

// Test a specific query simulation
console.log('\n=== Testing IPC Section Count Query ===');
const ipcCount = Object.keys(legalDatabase.ipc || {}).length;
console.log(`IPC sections count: ${ipcCount}`);

if (ipcCount > 0) {
  console.log('✅ Legal database is properly loaded and accessible!');
} else {
  console.log('❌ Legal database sections count is 0 - there might be an issue');
}