// General Legal NLP Model - Handles basic legal queries, laws, and procedures
const generalLegalNLP = {
    // Basic legal information intents
    intents: {
        // Law and Crime Queries
        law_section_query: {
            patterns: [
                'what is section',
                'tell me about section',
                'explain section',
                'section details',
                'what does section mean',
                'ipc section',
                'cpc section',
                'crpc section',
                'under which law',
                'what law covers',
                'which section applies'
            ],
            responses: [
                'Let me find the specific law section for you.',
                'I\'ll search our legal database for that section.',
                'Checking the legal provisions for you.'
            ],
            controller: 'legal_query',
            suggestions: [
                'What is Section 420 IPC?',
                'What is the punishment for theft under IPC?',
                'What does IPC Section 498A mean?',
                'What are the laws against cybercrime?'
            ]
        },

        crime_punishment_query: {
            patterns: [
                'what is the punishment for',
                'penalty for',
                'sentence for',
                'jail time for',
                'fine for',
                'punishment under',
                'what happens if',
                'legal consequences',
                'criminal charges'
            ],
            responses: [
                'Let me check the punishment details for that offense.',
                'I\'ll find the legal consequences for you.',
                'Searching for penalty information.'
            ],
            controller: 'legal_query',
            suggestions: [
                'What is the punishment for theft under IPC?',
                'Is dowry demand a criminal offence?',
                'What is the punishment for cyberbullying?',
                'What are the legal consequences of fraud?'
            ]
        },

        legal_rights_query: {
            patterns: [
                'what are my rights',
                'rights if arrested',
                'fundamental rights',
                'legal rights',
                'constitutional rights',
                'rights during',
                'what can i do',
                'my legal options',
                'rights of'
            ],
            responses: [
                'I\'ll explain your legal rights in this situation.',
                'Let me outline your constitutional protections.',
                'Here are your legal rights and options.'
            ],
            controller: 'legal_query',
            suggestions: [
                'What are my fundamental rights under the Indian Constitution?',
                'What are my rights if I\'m arrested?',
                'What are my rights during police interrogation?',
                'What are the rights of women under Indian law?',
                'What are the rights of senior citizens in India?'
            ]
        },

        // Legal Procedures and Help
        // Case Filing and Legal Procedures
        file_case_query: {
            patterns: [
                'file a case',
                'file case',
                'how to file a case',
                'case filing',
                'new case',
                'create case',
                'register case',
                'submit case',
                'legal case filing',
                'start case',
                'case filing process',
                'file complaint',
                'lodge complaint',
                'file suit',
                'civil case filing',
                'criminal case filing',
                'file petition',
                'how can i file case'
            ],
            responses: [
                'I\'ll guide you through the complete case filing process step by step.',
                'Let me help you understand how to file a case in court.',
                'Here\'s a comprehensive guide on filing legal cases.'
            ],
            controller: 'legal_query',
            suggestions: [
                'Step-by-step case filing guide',
                'Documents needed for filing',
                'Court fees and procedures',
                'Find nearest court',
                'Types of cases you can file'
            ]
        },

        legal_help_general: {
            patterns: [
                'how can i get',
                'how do i',
                'what should i do',
                'how to',
                'process for',
                'procedure to',
                'steps to',
                'how can i file',
                'where do i go',
                'who should i contact'
            ],
            responses: [
                'I\'ll guide you through the legal process.',
                'Let me explain the procedure step by step.',
                'Here\'s what you need to do.'
            ],
            controller: 'legal_query',
            suggestions: [
                'How can I get a lawyer near me?',
                'How do I file a police complaint?',
                'What should I do if I receive a legal notice?',
                'How can I check the status of my case online?',
                'What is the process to get free legal aid in India?'
            ]
        },

        lawyer_verification: {
            patterns: [
                'verify lawyer',
                'check lawyer registration',
                'bar council registration',
                'is lawyer registered',
                'lawyer credentials',
                'authenticate lawyer',
                'lawyer verification'
            ],
            responses: [
                'I\'ll help you verify the lawyer\'s credentials.',
                'Let me guide you through lawyer verification process.',
                'Here\'s how to check Bar Council registration.'
            ],
            controller: 'legal_query',
            suggestions: [
                'How can I verify if a lawyer is registered with the Bar Council?',
                'How can I get a lawyer near me?',
                'What should I look for in a good lawyer?',
                'How much do lawyers charge?'
            ]
        },

        // Court and Jurisdiction
        court_information: {
            patterns: [
                'court jurisdiction',
                'which court',
                'find court',
                'court near me',
                'district court',
                'high court',
                'supreme court',
                'court difference',
                'court hierarchy',
                'file in court'
            ],
            responses: [
                'Let me explain the court system and jurisdiction.',
                'I\'ll help you identify the right court.',
                'Here\'s information about court hierarchy.'
            ],
            controller: 'legal_query',
            suggestions: [
                'What is the difference between District Court, High Court, and Supreme Court?',
                'Find the nearest court to me.',
                'How do I know which court has jurisdiction over my case?',
                'How can I file a case in court?',
                'How can I get my case hearing date?'
            ]
        },

        // Family and Civil Matters
        family_law: {
            patterns: [
                'divorce',
                'child custody',
                'maintenance',
                'alimony',
                'domestic violence',
                'marriage',
                'family dispute',
                'wife rights',
                'husband rights',
                'property division'
            ],
            responses: [
                'I\'ll provide information about family law matters.',
                'Let me explain the legal aspects of your family issue.',
                'Here\'s what the law says about this family matter.'
            ],
            controller: 'legal_query',
            suggestions: [
                'How can I get child custody?',
                'How to file for divorce in India?',
                'What are the rights of a wife after divorce?',
                'How to claim maintenance or alimony?',
                'How to report domestic violence?'
            ]
        },

        // Property and Business Law
        property_business: {
            patterns: [
                'property',
                'business registration',
                'company registration',
                'property verification',
                'property ownership',
                'start business',
                'llp',
                'companies act',
                'property registration'
            ],
            responses: [
                'I\'ll help with property and business law information.',
                'Let me explain the legal requirements.',
                'Here\'s what you need to know about property/business law.'
            ],
            controller: 'legal_query',
            suggestions: [
                'How can I verify property ownership?',
                'What is the process for property registration?',
                'What are the legal requirements to start a business?',
                'How to register a company under the Companies Act?',
                'What is an LLP?'
            ]
        }
    },

    // Entity extraction patterns
    entities: {
        section_number: /(?:section\s+)?(\d+[a-z]?)/i,
        law_type: /(ipc|cpc|crpc|hma|iea|mva|ida|nia|indian penal code|civil procedure|criminal procedure)/i,
        crime_type: /(theft|murder|fraud|rape|dowry|cybercrime|cheating|assault|defamation|bribery)/i,
        court_type: /(district court|high court|supreme court|family court|sessions court)/i,
        document_type: /(fir|affidavit|bail|petition|notice|complaint|writ)/i
    },

    // Confidence scoring
    calculateConfidence: function(message, intent) {
        const messageLower = message.toLowerCase();
        let confidence = 0;
        
        // Check for exact pattern matches
        for (const pattern of this.intents[intent].patterns) {
            if (messageLower.includes(pattern)) {
                confidence += 0.8;
                break;
            }
        }
        
        // Check for entity matches
        for (const [entityType, regex] of Object.entries(this.entities)) {
            if (regex.test(messageLower)) {
                confidence += 0.2;
            }
        }
        
        return Math.min(confidence, 1.0);
    }
};

// Utility functions for general legal queries
const generalLegalUtils = {
    // Extract legal entities from message
    extractLegalEntities: function(message) {
        const entities = {};
        const messageLower = message.toLowerCase();
        
        // Extract section numbers
        const sectionMatch = messageLower.match(generalLegalNLP.entities.section_number);
        if (sectionMatch) {
            entities.section = sectionMatch[1];
        }
        
        // Extract law type
        const lawMatch = messageLower.match(generalLegalNLP.entities.law_type);
        if (lawMatch) {
            entities.law = lawMatch[1];
        }
        
        // Extract crime type
        const crimeMatch = messageLower.match(generalLegalNLP.entities.crime_type);
        if (crimeMatch) {
            entities.crime = crimeMatch[1];
        }
        
        // Extract court type
        const courtMatch = messageLower.match(generalLegalNLP.entities.court_type);
        if (courtMatch) {
            entities.court = courtMatch[1];
        }
        
        // Extract document type
        const docMatch = messageLower.match(generalLegalNLP.entities.document_type);
        if (docMatch) {
            entities.document = docMatch[1];
        }
        
        return entities;
    },

    // Get contextual suggestions based on user query and role
    getContextualSuggestions: function(intent, entities, userRole) {
        let suggestions = [];
        
        // Add intent-specific suggestions
        if (generalLegalNLP.intents[intent]) {
            suggestions = [...generalLegalNLP.intents[intent].suggestions];
        }
        
        // Add role-based suggestions
        const roleSuggestions = this.getRoleBasedSuggestions(userRole);
        suggestions = [...suggestions, ...roleSuggestions.slice(0, 2)];
        
        // Add entity-specific suggestions
        if (entities.law) {
            suggestions.push(`More about ${entities.law.toUpperCase()}`);
        }
        
        if (entities.crime) {
            suggestions.push(`Related laws for ${entities.crime}`);
        }
        
        return [...new Set(suggestions)].slice(0, 6); // Remove duplicates and limit to 6
    },

    // Get role-based legal suggestions
    getRoleBasedSuggestions: function(role) {
        const suggestions = {
            lawyer: [
                'Latest court judgments',
                'Legal precedents',
                'Bar Council updates',
                'Professional ethics guidelines'
            ],
            judge: [
                'Case law references',
                'Judicial precedents', 
                'Court procedures',
                'Constitutional provisions'
            ],
            police: [
                'How to draft an FIR?',
                'Investigation procedures',
                'Evidence collection guidelines',
                'Arrest procedures and rights'
            ],
            admin: [
                'Platform analytics',
                'User management',
                'System status',
                'Legal database updates'
            ],
            user: [
                'How can I get a lawyer near me?',
                'What are my fundamental rights?',
                'How do I file a police complaint?',
                'What should I do if I receive a legal notice?'
            ]
        };
        
        return suggestions[role] || suggestions.user;
    },

    // Comprehensive legal question bank
    getAllLegalSuggestions: function() {
        return {
            'General Legal Help': [
                'How can I get a lawyer near me?',
                'How do I file a police complaint?',
                'What should I do if I receive a legal notice?',
                'How can I check the status of my case online?',
                'How can I verify if a lawyer is registered with the Bar Council?',
                'What is the process to get free legal aid in India?'
            ],
            'Laws and Crimes': [
                'Under which law does this crime come?',
                'What is the punishment for theft under IPC?',
                'What is Section 420 IPC?',
                'What are my rights if I\'m arrested?',
                'What are the laws against cybercrime?',
                'Is dowry demand a criminal offence?',
                'What does IPC Section 498A mean?',
                'What is the difference between cognizable and non-cognizable offences?'
            ],
            'Courts and Jurisdiction': [
                'Find the nearest court to me.',
                'What is the difference between District Court, High Court, and Supreme Court?',
                'How can I file a case in court?',
                'How do I know which court has jurisdiction over my case?',
                'How can I get my case hearing date?'
            ],
            'Documents and Procedures': [
                'How to draft an FIR?',
                'How can I get a copy of an FIR?',
                'How to make an affidavit?',
                'What documents are required for bail?',
                'How to register a property legally?',
                'What is the process for filing a divorce petition?'
            ],
            'Family & Civil Matters': [
                'How can I get child custody?',
                'How to file for divorce in India?',
                'What are the rights of a wife after divorce?',
                'How to claim maintenance or alimony?',
                'How to report domestic violence?'
            ],
            'Cyber & Technology Law': [
                'How to report online fraud or scams?',
                'What is the punishment for cyberbullying?',
                'How to file a cybercrime complaint?',
                'What are data protection laws in India?'
            ],
            'Property and Business Law': [
                'How can I verify property ownership?',
                'What is the process for property registration?',
                'What are the legal requirements to start a business?',
                'How to register a company under the Companies Act?',
                'What is an LLP?'
            ],
            'Rights and Awareness': [
                'What are my fundamental rights under the Indian Constitution?',
                'What are my rights during police interrogation?',
                'What are the rights of women under Indian law?',
                'What are the rights of senior citizens in India?'
            ]
        };
    },

    // Entity extraction for general legal queries
    extractEntities: function(message) {
        const entities = [];
        const messageLower = message.toLowerCase();
        
        // Legal section patterns (IPC 420, Section 302, etc.)
        const sectionPattern = /(ipc|cpc|crpc|section)\s*(\d+[a-z]*)/g;
        let sectionMatch;
        while ((sectionMatch = sectionPattern.exec(messageLower)) !== null) {
            entities.push({
                type: 'legal_section',
                value: `${sectionMatch[1]} ${sectionMatch[2]}`,
                position: sectionMatch.index
            });
        }
        
        // Crime types
        const crimeTypes = ['theft', 'fraud', 'murder', 'assault', 'harassment', 'cheating', 'dowry', 'domestic violence'];
        crimeTypes.forEach(crime => {
            if (messageLower.includes(crime)) {
                entities.push({
                    type: 'crime_type',
                    value: crime,
                    position: messageLower.indexOf(crime)
                });
            }
        });
        
        // Legal procedures
        const procedures = ['bail', 'fir', 'case', 'court', 'lawyer', 'appeal'];
        procedures.forEach(procedure => {
            if (messageLower.includes(procedure)) {
                entities.push({
                    type: 'legal_procedure',
                    value: procedure,
                    position: messageLower.indexOf(procedure)
                });
            }
        });
        
        // Rights keywords
        const rightsKeywords = ['rights', 'fundamental', 'constitutional', 'legal', 'protection'];
        rightsKeywords.forEach(right => {
            if (messageLower.includes(right)) {
                entities.push({
                    type: 'legal_rights',
                    value: right,
                    position: messageLower.indexOf(right)
                });
            }
        });
        
        return entities;
    }
};

// Main processing function for general legal queries
async function processGeneralLegalQuery(message, userData = {}) {
    console.log('🔍 Processing General Legal Query:', message);
    
    const messageLower = message.toLowerCase().trim();
    let bestMatch = { intent: 'unknown', confidence: 0.0, entities: [], response: null };

    // Check each intent for pattern matches
    Object.entries(generalLegalNLP.intents).forEach(([intentName, intentData]) => {
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
                confidence = 0.8;
            }
            // Word overlap
            else {
                const messageWords = messageLower.split(' ');
                const patternWords = patternLower.split(' ');
                const matchedWords = patternWords.filter(word => 
                    messageWords.some(msgWord => msgWord.includes(word) || word.includes(msgWord))
                );
                confidence = matchedWords.length / patternWords.length * 0.6;
            }

            if (confidence > maxConfidence) {
                maxConfidence = confidence;
            }
        });

        if (maxConfidence > bestMatch.confidence) {
            bestMatch = {
                intent: intentName,
                confidence: maxConfidence,
                entities: generalLegalUtils.extractEntities(messageLower),
                response: intentData.responses[Math.floor(Math.random() * intentData.responses.length)],
                suggestions: intentData.suggestions || []
            };
        }
    });

    console.log(`🎯 General NLP Result: ${bestMatch.intent} (${bestMatch.confidence})`);
    return bestMatch;
}

module.exports = {
    generalLegalNLP,
    generalLegalUtils,
    processGeneralLegalQuery
};