// Advanced Legal NLP Model - Handles complex legal research and location-based queries
const advancedLegalNLP = {
    // Complex legal research and location intents
    intents: {
        // Location-based queries
        location_court_police: {
            patterns: [
                'court near me',
                'police station near me',
                'find court',
                'find police station', 
                'nearest court',
                'nearest police station',
                'court location',
                'police station location',
                'where is court',
                'where is police station',
                'court address',
                'police station address'
            ],
            responses: [
                'I\'ll help you find the nearest courts and police stations.',
                'Let me locate the legal institutions near you.',
                'Searching for nearby legal facilities.'
            ],
            controller: 'location_services',
            requiresLocation: true,
            suggestions: [
                'Find the nearest court to me',
                'Police stations in my area',
                'Court timings and contact info',
                'How to reach the court',
                'Emergency contact numbers'
            ]
        },

        // Complex legal document creation
        document_creation: {
            patterns: [
                'draft fir',
                'create affidavit',
                'write petition',
                'legal document template',
                'document format',
                'fir format',
                'affidavit format',
                'petition format',
                'legal notice format',
                'complaint format'
            ],
            responses: [
                'I\'ll help you create the legal document.',
                'Let me provide the document template and guidance.',
                'I\'ll guide you through the document creation process.'
            ],
            controller: 'document_services',
            suggestions: [
                'How to draft an FIR?',
                'How to make an affidavit?',
                'Legal notice template',
                'Petition format guide',
                'Document requirements checklist'
            ]
        },

        // Case status and tracking
        case_tracking: {
            patterns: [
                'check case status',
                'case hearing date',
                'track my case',
                'case number lookup',
                'court case status',
                'case updates',
                'next hearing date',
                'case proceedings'
            ],
            responses: [
                'I\'ll help you check your case status.',
                'Let me guide you to track your case.',
                'Here\'s how to get case updates.'
            ],
            controller: 'legal_query',
            suggestions: [
                'How can I check the status of my case online?',
                'How can I get my case hearing date?',
                'Track case by case number',
                'Court e-filing system'
            ]
        },

        // Advanced legal research
        legal_research_advanced: {
            patterns: [
                'legal precedent',
                'case law',
                'judgment search',
                'supreme court judgment',
                'high court ruling',
                'legal citation',
                'case reference',
                'judicial precedent',
                'court ruling',
                'legal authority'
            ],
            responses: [
                'I\'ll search for relevant legal precedents.',
                'Let me find applicable case law for you.',
                'Searching judicial precedents and rulings.'
            ],
            controller: 'legal_query',
            suggestions: [
                'Recent Supreme Court judgments',
                'Constitutional law precedents',
                'Criminal law case studies',
                'Civil law references'
            ]
        },

        // Emergency legal help
        emergency_legal: {
            patterns: [
                'emergency legal help',
                'urgent legal assistance',
                'immediate legal aid',
                'legal emergency',
                'arrest situation',
                'police custody',
                'bail urgently',
                'emergency contact',
                'emergency numbers',
                'emergency helpline',
                'legal crisis',
                'immediate help needed'
            ],
            responses: [
                'This seems urgent. Let me provide immediate assistance.',
                'I\'ll connect you with emergency legal resources.',
                'Here are immediate steps and emergency contacts.'
            ],
            controller: 'legal_query',
            priority: 'high',
            suggestions: [
                'Emergency legal aid contacts',
                'Bail application process',
                'Rights during arrest',
                'Police station legal aid',
                'Court duty lawyer contact'
            ]
        },

        // Cybercrime and technology
        cyber_legal: {
            patterns: [
                'cybercrime',
                'online fraud',
                'cyber bullying',
                'digital evidence',
                'internet crime',
                'data theft',
                'privacy violation',
                'online harassment',
                'cyber law',
                'digital rights'
            ],
            responses: [
                'I\'ll provide information about cyber laws and procedures.',
                'Let me explain cybercrime regulations and remedies.',
                'Here\'s what you need to know about digital legal issues.'
            ],
            controller: 'legal_query',
            suggestions: [
                'How to report online fraud or scams?',
                'What is the punishment for cyberbullying?',
                'How to file a cybercrime complaint?',
                'What are data protection laws in India?'
            ]
        },

        // Professional legal services
        professional_legal: {
            patterns: [
                'legal consultation',
                'hire lawyer',
                'legal advice',
                'attorney consultation',
                'legal representation',
                'court representation',
                'legal fees',
                'lawyer charges',
                'legal services cost'
            ],
            responses: [
                'I\'ll help you find appropriate legal representation.',
                'Let me explain legal consultation options.',
                'Here\'s information about legal services and costs.'
            ],
            controller: 'legal_query',
            suggestions: [
                'How can I get a lawyer near me?',
                'Legal consultation rates',
                'Free legal aid options',
                'Lawyer specialization areas'
            ]
        }
    },

    // Advanced entity extraction patterns
    entities: {
        location: /(?:in|near|at)\s+([a-z\s]+(?:city|state|district|area|locality))/i,
        coordinates: /(?:lat|latitude)[:=]\s*(-?\d+\.?\d*)[,\s]*(?:lon|lng|longitude)[:=]\s*(-?\d+\.?\d*)/i,
        case_number: /(?:case\s+(?:no|number)[:=]?\s*)?([a-z]{2,4}\/?\d{1,6}\/?\d{2,4})/i,
        court_name: /(district court|high court|supreme court|sessions court|magistrate court|family court)/i,
        urgency_level: /(urgent|emergency|immediate|asap|critical|high priority)/i,
        legal_document: /(fir|affidavit|petition|notice|complaint|writ|bail|appeal)/i,
        date_time: /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{1,2}:\d{2}\s*(?:am|pm)?)/i
    },

    // Advanced confidence calculation with context awareness
    calculateAdvancedConfidence: function(message, intent, context = {}) {
        const messageLower = message.toLowerCase();
        let confidence = 0;
        
        // Base pattern matching
        for (const pattern of this.intents[intent].patterns) {
            if (messageLower.includes(pattern)) {
                confidence += 0.7;
                break;
            }
        }
        
        // Entity bonus scoring
        let entityBonus = 0;
        for (const [entityType, regex] of Object.entries(this.entities)) {
            if (regex.test(messageLower)) {
                entityBonus += 0.1;
            }
        }
        
        confidence += Math.min(entityBonus, 0.3);
        
        // Context bonus (user role, previous queries, etc.)
        if (context.userRole === 'lawyer' && intent.includes('legal_research')) {
            confidence += 0.1;
        }
        
        if (context.userRole === 'police' && intent.includes('document')) {
            confidence += 0.1;
        }
        
        // Urgency detection bonus
        if (this.entities.urgency_level.test(messageLower)) {
            confidence += 0.2;
        }
        
        return Math.min(confidence, 1.0);
    },

    // Location detection and processing
    detectLocation: function(message) {
        const locationInfo = {};
        
        // Extract location entities
        const locationMatch = message.match(this.entities.location);
        if (locationMatch) {
            locationInfo.textLocation = locationMatch[1].trim();
        }
        
        // Extract coordinates if provided
        const coordMatch = message.match(this.entities.coordinates);
        if (coordMatch) {
            locationInfo.latitude = parseFloat(coordMatch[1]);
            locationInfo.longitude = parseFloat(coordMatch[2]);
        }
        
        // Default to request user location if no location found
        if (!locationInfo.textLocation && !locationInfo.latitude) {
            locationInfo.requestLocation = true;
        }
        
        return locationInfo;
    }
};

// Advanced utility functions
const advancedLegalUtils = {
    // Extract all entities from complex queries
    extractAdvancedEntities: function(message) {
        const entities = {};
        const messageLower = message.toLowerCase();
        
        // Use both basic and advanced entity extraction
        Object.entries(advancedLegalNLP.entities).forEach(([entityType, regex]) => {
            const match = messageLower.match(regex);
            if (match) {
                entities[entityType] = match[1] || match[0];
            }
        });
        
        return entities;
    },

    // Generate location-aware suggestions
    getLocationSuggestions: function(userLocation) {
        const suggestions = [
            'Find the nearest court to me',
            'Police stations in my area',
            'Legal aid centers nearby',
            'Lawyer offices in my city'
        ];
        
        if (userLocation) {
            suggestions.unshift(`Courts near ${userLocation}`);
            suggestions.push(`Emergency contacts in ${userLocation}`);
        }
        
        return suggestions;
    },

    // Generate emergency response suggestions
    getEmergencySuggestions: function() {
        return [
            'Emergency legal aid: 1800-345-4545',
            'Police helpline: 100',
            'Women helpline: 1091',
            'Cyber crime helpline: 1930',
            'Child helpline: 1098',
            'Senior citizen helpline: 1291'
        ];
    },

    // Get document-specific suggestions
    getDocumentSuggestions: function(documentType) {
        const suggestions = {
            'fir': [
                'FIR format and requirements',
                'How to file FIR online',
                'FIR copy procedure',
                'Zero FIR concept'
            ],
            'affidavit': [
                'Affidavit format template',
                'Notarization process',
                'Affidavit types and uses',
                'Court affidavit requirements'
            ],
            'petition': [
                'Petition writing guidelines',
                'Court petition format',
                'Filing petition procedure',
                'Petition fees and costs'
            ],
            'bail': [
                'Bail application format',
                'Bail types and conditions',
                'Surety requirements',
                'Bail hearing process'
            ]
        };
        
        return suggestions[documentType] || [
            'Legal document templates',
            'Document formatting guide',
            'Filing procedures',
            'Required attachments'
        ];
    },

    // Generate comprehensive context-aware suggestions
    getComprehensiveSuggestions: function(intent, entities, userContext) {
        let suggestions = [];
        
        // Add intent-specific suggestions
        if (advancedLegalNLP.intents[intent]) {
            suggestions = [...advancedLegalNLP.intents[intent].suggestions];
        }
        
        // Add entity-specific suggestions
        if (entities.legal_document) {
            suggestions = [...suggestions, ...this.getDocumentSuggestions(entities.legal_document)];
        }
        
        // Add location-specific suggestions
        if (entities.location || userContext.location) {
            suggestions = [...suggestions, ...this.getLocationSuggestions(entities.location || userContext.location)];
        }
        
        // Add emergency suggestions if urgency detected
        if (entities.urgency_level) {
            suggestions = [...this.getEmergencySuggestions(), ...suggestions];
        }
        
        // Add role-based suggestions
        if (userContext.role) {
            suggestions = [...suggestions, ...this.getRoleSpecificAdvancedSuggestions(userContext.role)];
        }
        
        return [...new Set(suggestions)].slice(0, 8); // Remove duplicates and limit
    },

    // Role-specific advanced suggestions
    getRoleSpecificAdvancedSuggestions: function(role) {
        const suggestions = {
            lawyer: [
                'Legal research databases',
                'Case law citations',
                'Professional ethics updates',
                'Court e-filing systems'
            ],
            judge: [
                'Judicial precedents search',
                'Constitutional interpretations',
                'Procedural guidelines',
                'Court administration'
            ],
            police: [
                'Investigation procedures',
                'Evidence collection',
                'FIR registration process',
                'Cyber crime procedures'
            ],
            admin: [
                'Platform usage analytics',
                'Legal database updates',
                'User activity reports',
                'System performance'
            ]
        };
        
        return suggestions[role] || [];
    },

    // Maps and location integration helper
    generateMapIframe: function(query, userLocation) {
        const baseUrl = 'https://www.google.com/maps/embed/v1/search';
        const apiKey = 'AIzaSyAH7iDFCffRLwIJ56UUnkwBOhNzmSL2uMQ'; // Replace with actual API key
        
        let searchQuery = query;
        if (userLocation) {
            searchQuery += ` near ${userLocation}`;
        }
        
        return `<iframe 
            width="100%" 
            height="300" 
            frameborder="0" 
            style="border:0" 
            src="${baseUrl}?key=${apiKey}&q=${encodeURIComponent(searchQuery)}"
            allowfullscreen>
        </iframe>`;
    },

    // Entity extraction for advanced queries
    extractEntities: function(message) {
        const entities = [];
        const messageLower = message.toLowerCase();
        
        // Location entities
        const locationPattern = /(near|in|at|around)\s+([a-zA-Z\s]+)/g;
        let locationMatch;
        while ((locationMatch = locationPattern.exec(messageLower)) !== null) {
            entities.push({
                type: 'location',
                value: locationMatch[2].trim(),
                position: locationMatch.index
            });
        }
        
        // Document type entities
        const documentTypes = ['fir', 'affidavit', 'petition', 'notice', 'bail', 'application'];
        documentTypes.forEach(docType => {
            if (messageLower.includes(docType)) {
                entities.push({
                    type: 'document_type',
                    value: docType,
                    position: messageLower.indexOf(docType)
                });
            }
        });
        
        // Legal institution entities
        const institutions = ['court', 'police', 'station', 'tribunal', 'magistrate'];
        institutions.forEach(institution => {
            if (messageLower.includes(institution)) {
                entities.push({
                    type: 'legal_institution',
                    value: institution,
                    position: messageLower.indexOf(institution)
                });
            }
        });
        
        // Emergency keywords
        const emergencyKeywords = ['urgent', 'emergency', 'help', 'immediate', 'asap'];
        emergencyKeywords.forEach(keyword => {
            if (messageLower.includes(keyword)) {
                entities.push({
                    type: 'emergency',
                    value: keyword,
                    position: messageLower.indexOf(keyword)
                });
            }
        });
        
        return entities;
    }
};

// Main processing function for advanced legal queries
async function processAdvancedLegalQuery(message, userData = {}) {
    console.log('🚀 Processing Advanced Legal Query:', message);
    
    const messageLower = message.toLowerCase().trim();
    let bestMatch = { intent: 'unknown', confidence: 0.0, entities: [], response: null };

    // Check each advanced intent for pattern matches
    Object.entries(advancedLegalNLP.intents).forEach(([intentName, intentData]) => {
        let maxConfidence = 0;

        intentData.patterns.forEach(pattern => {
            const patternLower = pattern.toLowerCase();
            let confidence = 0;

            // Exact match
            if (messageLower === patternLower) {
                confidence = 1.0;
            }
            // Contains pattern
            else if (messageLower.includes(patternLower)) {
                confidence = 0.9;
            }
            // Advanced keyword matching for location/document queries
            else {
                const messageWords = messageLower.split(' ');
                const patternWords = patternLower.split(' ');
                const matchedWords = patternWords.filter(word => 
                    messageWords.some(msgWord => msgWord.includes(word) || word.includes(msgWord))
                );
                
                // Higher confidence for location/document specific terms
                if (intentName.includes('location') || intentName.includes('document')) {
                    confidence = matchedWords.length / patternWords.length * 0.85;
                } else {
                    confidence = matchedWords.length / patternWords.length * 0.7;
                }
            }

            if (confidence > maxConfidence) {
                maxConfidence = confidence;
            }
        });

        if (maxConfidence > bestMatch.confidence) {
            bestMatch = {
                intent: intentName,
                confidence: maxConfidence,
                entities: advancedLegalUtils.extractEntities(messageLower),
                response: intentData.responses[Math.floor(Math.random() * intentData.responses.length)],
                suggestions: intentData.suggestions || [],
                controller: intentData.controller || null,
                requiresLocation: intentData.requiresLocation || false
            };
        }
    });

    console.log(`🎯 Advanced NLP Result: ${bestMatch.intent} (${bestMatch.confidence})`);
    return bestMatch;
}

module.exports = {
    advancedLegalNLP,
    advancedLegalUtils,
    processAdvancedLegalQuery
};