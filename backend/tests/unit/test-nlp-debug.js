const { nlpModel, nlpUtils } = require('../../models/nlpModel');

// Test function to check intent detection - mirroring the actual function
function testIntentDetection(message) {
    console.log(`\n🔍 Testing message: "${message}"`);
    
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
    
    const result = { ...bestMatch, entities };
    console.log(`✅ Result:`, result);
    return result;
}

// Test the problematic queries
console.log('=== NLP Intent Detection Test ===');
testIntentDetection("system health check");
testIntentDetection("constitutional amendments");
testIntentDetection("What are constitutional amendments?");
testIntentDetection("Check system health");

// Show system_status patterns
console.log('\n📋 system_status patterns:');
console.log(nlpModel.intents.system_status.patterns);