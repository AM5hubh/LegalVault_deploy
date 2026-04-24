const fs = require('fs');
const path = require('path');

/**
 * Script to load legal database JSON files from frontend into backend legalDatabase object
 * This will populate the legalDatabase used by the chatbot with actual legal data
 */

const frontendJsonPath = path.join(__dirname, '../../frontend/src/pages/Lawyer/LawPenalJsons');
const backendControllerPath = path.join(__dirname, '../controllers/legalChatbotController.js');

// Legal database mapping
const legalDatabaseFiles = {
  ipc: 'ipc.json',
  cpc: 'cpc.json', 
  crpc: 'crpc.json',
  hma: 'hma.json',
  iea: 'iea.json',
  mva: 'MVA.json',
  ida: 'ida.json',
  nia: 'nia.json'
};

async function loadLegalDatabase() {
  console.log('🏛️ Loading Legal Database from Frontend JSON files...\n');
  
  const legalDatabase = {};
  
  for (const [dbKey, fileName] of Object.entries(legalDatabaseFiles)) {
    try {
      const filePath = path.join(frontendJsonPath, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${fileName}`);
        continue;
      }
      
      console.log(`📚 Loading ${dbKey.toUpperCase()} from ${fileName}...`);
      
      const rawData = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(rawData);
      
      // Process the data based on structure
      const processedData = processLegalData(dbKey, jsonData);
      legalDatabase[dbKey] = processedData;
      
      console.log(`✅ Loaded ${Object.keys(processedData).length} sections for ${dbKey.toUpperCase()}`);
      
    } catch (error) {
      console.error(`❌ Error loading ${fileName}:`, error.message);
    }
  }
  
  // Generate the updated controller code
  await updateControllerWithDatabase(legalDatabase);
  
  console.log('\n🎉 Legal Database loading completed!');
  console.log('📊 Database Summary:');
  Object.entries(legalDatabase).forEach(([key, data]) => {
    console.log(`   ${key.toUpperCase()}: ${Object.keys(data).length} sections`);
  });
}

function processLegalData(dbKey, jsonData) {
  const processedData = {};
  
  if (!Array.isArray(jsonData)) {
    console.log(`⚠️  ${dbKey} data is not an array, skipping...`);
    return processedData;
  }
  
  jsonData.forEach((item, index) => {
    try {
      let sectionKey, sectionData;
      
      switch (dbKey) {
        case 'ipc':
          // IPC structure: { Section: 1, section_title: "...", section_desc: "..." }
          sectionKey = `section_${item.Section}`;
          sectionData = {
            number: item.Section,
            title: item.section_title || 'Untitled',
            description: item.section_desc || 'No description',
            chapter: item.chapter,
            chapter_title: item.chapter_title
          };
          break;
          
        case 'cpc':
        case 'crpc':
          // CPC/CrPC structure: { section: 1, title: "...", description: "..." }
          sectionKey = `section_${item.section}`;
          sectionData = {
            number: item.section,
            title: item.title || 'Untitled',
            description: item.description || 'No description'
          };
          break;
          
        case 'hma':
        case 'iea':
        case 'mva':
        case 'ida':
        case 'nia':
          // Generic structure handling
          const sectionNum = item.section || item.Section || item.number || (index + 1);
          sectionKey = `section_${sectionNum}`;
          sectionData = {
            number: sectionNum,
            title: item.title || item.section_title || item.name || 'Untitled',
            description: item.description || item.section_desc || item.desc || item.content || 'No description'
          };
          break;
          
        default:
          // Fallback for unknown structures
          const fallbackSectionNum = item.section || item.Section || item.number || (index + 1);
          sectionKey = `section_${fallbackSectionNum}`;
          sectionData = {
            number: fallbackSectionNum,
            title: item.title || item.section_title || item.name || 'Untitled',
            description: item.description || item.section_desc || item.desc || item.content || 'No description'
          };
      }
      
      if (sectionKey && sectionData) {
        processedData[sectionKey] = sectionData;
      }
      
    } catch (error) {
      console.log(`⚠️  Error processing item ${index} in ${dbKey}:`, error.message);
    }
  });
  
  return processedData;
}

async function updateControllerWithDatabase(legalDatabase) {
  try {
    console.log('\n🔧 Updating controller with legal database...');
    
    // Read the current controller file
    let controllerContent = fs.readFileSync(backendControllerPath, 'utf8');
    
    // Find the initializeLegalDatabase function and replace its content
    const functionStartRegex = /function initializeLegalDatabase\(\) \{/;
    const functionEndRegex = /^}\s*$/m;
    
    const startMatch = controllerContent.match(functionStartRegex);
    if (!startMatch) {
      console.log('❌ Could not find initializeLegalDatabase function');
      return;
    }
    
    const startIndex = startMatch.index + startMatch[0].length;
    const afterStart = controllerContent.slice(startIndex);
    const endMatch = afterStart.match(functionEndRegex);
    
    if (!endMatch) {
      console.log('❌ Could not find end of initializeLegalDatabase function');
      return;
    }
    
    const endIndex = startIndex + endMatch.index;
    
    // Generate the new function content
    const newFunctionContent = generateLegalDatabaseCode(legalDatabase);
    
    // Replace the function content
    const newControllerContent = 
      controllerContent.slice(0, startIndex) + 
      newFunctionContent + 
      controllerContent.slice(endIndex);
    
    // Write the updated controller
    fs.writeFileSync(backendControllerPath, newControllerContent, 'utf8');
    
    console.log('✅ Controller updated successfully with legal database');
    
  } catch (error) {
    console.error('❌ Error updating controller:', error.message);
  }
}

function generateLegalDatabaseCode(legalDatabase) {
  const dbEntries = Object.entries(legalDatabase).map(([key, data]) => {
    const dataStr = JSON.stringify(data, null, 4).replace(/^/gm, '    ');
    return `  legalDatabase.${key} = ${dataStr};`;
  }).join('\n\n');

  return `
  console.log('📚 Initializing Legal Database with comprehensive Indian law data...');
  
${dbEntries}

  console.log('✅ Legal Database initialized with:', {
${Object.keys(legalDatabase).map(key => `    ${key}: Object.keys(legalDatabase.${key}).length`).join(',\n')}
  });
`;
}

// Run the script
if (require.main === module) {
  loadLegalDatabase().catch(console.error);
}

module.exports = { loadLegalDatabase, processLegalData };