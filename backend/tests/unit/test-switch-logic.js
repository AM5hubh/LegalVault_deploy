// Test direct chatbot functionality by calling the controller function directly
const { nlpModel, nlpUtils } = require('../../../models/nlpModel');

// Import the controller function directly
const path = require('path');
const fs = require('fs');

// Read the controller file to extract the function
const controllerPath = './backend/controllers/legalChatbotController.js';
const controllerContent = fs.readFileSync(controllerPath, 'utf8');

// Mock the dependencies
const mockUser = { 
    userId: 'test123', 
    email: 'test@example.com', 
    role: 'user',
    name: 'Test User'
};

// Test the detectIntentFromNLP function directly
function testDetectIntent() {
    // Copy the detectIntentFromNLP function from the controller
    function detectIntentFromNLP(message, userContext = {}) {
        const messageLower = message.toLowerCase();
        let bestMatch = { intent: 'unknown', confidence: 0.0, response: null };
        
        // Search through all intents in the NLP model
        Object.entries(nlpModel.intents).forEach(([intentName, intentData]) => {
            intentData.patterns.forEach(pattern => {
                if (messageLower.includes(pattern.toLowerCase())) {
                    const confidence = nlpUtils.calculateConfidence(messageLower, pattern, intentData.patterns);
                    
                    if (confidence > bestMatch.confidence) {
                        // Select random response from available responses
                        const randomResponse = intentData.responses[
                            Math.floor(Math.random() * intentData.responses.length)
                        ];
                        
                        bestMatch = {
                            intent: intentName,
                            confidence,
                            response: randomResponse,
                            api_endpoint: intentData.api_endpoint,
                            base_suggestions: intentData.suggestions || []
                        };
                    }
                }
            });
        });
        
        // Extract entities from the message
        const entities = nlpUtils.extractEntities(messageLower);
        
        return { ...bestMatch, entities };
    }

    console.log('=== Testing Intent Detection in Switch Context ===');
    
    const testMessages = [
        "system health check",
        "constitutional amendments"
    ];
    
    testMessages.forEach(message => {
        console.log(`\n🔍 Testing: "${message}"`);
        const result = detectIntentFromNLP(message, {});
        console.log(`Intent: ${result.intent}`);
        console.log(`Confidence: ${result.confidence}`);
        console.log(`NLP Response: ${result.response}`);
        
        // Test the switch logic
        console.log(`\n🔄 Switch case would match: case '${result.intent}':`);
        
        switch(result.intent) {
            case 'system_status':
                console.log('✅ Would call handleEnhancedSystemStatusQuery');
                break;
            case 'law_search':
                console.log('✅ Would call handleEnhancedSectionQuery');
                break;
            default:
                console.log('❌ Would fall to default case (generateEnhancedFallbackResponse)');
        }
        
        // Test enhanceResponse
        const enhanced = nlpUtils.enhanceResponse(
            result.response, 
            result.entities, 
            'user', 
            result.confidence
        );
        console.log(`Enhanced Response: ${enhanced}`);
    });
}

testDetectIntent();