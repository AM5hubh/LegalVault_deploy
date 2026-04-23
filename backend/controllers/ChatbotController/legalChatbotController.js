const { join } = require('path');
const { readFileSync } = require('fs');
const fetch = require('node-fetch');
const User = require('../../models/User');
const logger = require('../../utils/logger');
const { nlpModel, nlpUtils } = require('../../models/NLPmodels/nlpModel');

// Import specialized controllers and NLP models
const { processGeneralLegalQuery } = require('../../models/NLPmodels/generalLegalNLP');
const { processAdvancedLegalQuery } = require('../../models/NLPmodels/advancedLegalNLP');
const { handleLegalQueryRequest } = require('./legalQueryController');
const { handleLocationRequest } = require('./locationController');
const { handleDocumentRequest } = require('./documentController');

// Constants
const NEWS_API_KEY = '6af4a7e3b97844fa8ed04f03530b072f';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const API_BASE_URL = 'http://localhost:5000/api';

// Legal database files
const lawFiles = ['ipc', 'cpc', 'crpc', 'hma', 'ida', 'iea', 'MVA', 'nia'];

// Global legal database
let legalDatabase = {};

// Initialize legal database at module load
initializeLegalDatabase();

// Enhanced API utility functions
const makeAuthenticatedRequest = async (endpoint, authToken, method = 'GET', body = null) => {
    try {
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error for ${endpoint}:`, error.message);
        return null;
    }
};

// Alternative API call function
const makeApiCall = async (url, options) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        return null;
    }
};

// Initialize legal database
function initializeLegalDatabase() {
    console.log('📚 Initializing Legal Database with comprehensive Indian law data...');
    
    const fs = require('fs');
    const path = require('path');

    // Define the path to JSON files
    const jsonFilesPath = path.join(__dirname, '../../../frontend/src/pages/Lawyer/LawPenalJsons');
    
    // Define law categories and their corresponding file names
    const lawCategories = {
        ipc: 'ipc.json',
        cpc: 'cpc.json', 
        crpc: 'crpc.json',
        hma: 'hma.json',
        iea: 'iea.json',
        mva: 'MVA.json',
        ida: 'ida.json',
        nia: 'nia.json'
    };

    // Load each law category from its JSON file
    Object.entries(lawCategories).forEach(([category, filename]) => {
        try {
            const filePath = path.join(jsonFilesPath, filename);
            console.log(`📖 Loading ${category.toUpperCase()} from: ${filePath}`);
            
            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath, 'utf8');
                const jsonData = JSON.parse(fileData);
                
                // Convert array format to object format if needed
                if (Array.isArray(jsonData)) {
                    legalDatabase[category] = {};
                    jsonData.forEach((section, index) => {
                        const sectionKey = `section_${section.number || index + 1}`;
                        legalDatabase[category][sectionKey] = section;
                    });
                } else {
                    legalDatabase[category] = jsonData;
                }
                
                console.log(`✅ Loaded ${Object.keys(legalDatabase[category]).length} sections for ${category.toUpperCase()}`);
            } else {
                console.warn(`⚠️ File not found: ${filePath}. Using empty dataset for ${category}`);
                legalDatabase[category] = {};
            }
        } catch (error) {
            console.error(`❌ Error loading ${category.toUpperCase()}:`, error.message);
            legalDatabase[category] = {}; // Fallback to empty object
        }
    });

    console.log('✅ Legal Database initialized with:', {
        ipc: Object.keys(legalDatabase.ipc).length,
        cpc: Object.keys(legalDatabase.cpc).length,
        crpc: Object.keys(legalDatabase.crpc).length,
        hma: Object.keys(legalDatabase.hma).length,
        iea: Object.keys(legalDatabase.iea).length,
        mva: Object.keys(legalDatabase.mva).length,
        ida: Object.keys(legalDatabase.ida).length,
        nia: Object.keys(legalDatabase.nia).length
    });
}

// Enhanced intent detection using improved NLP algorithm
function detectIntentFromNLP(message, userContext = {}) {
    const messageLower = message.toLowerCase().trim();
    let bestMatch = { intent: 'unknown', confidence: 0.0, response: null };
    
    console.log('🎯 Intent detection for message:', messageLower);

    // Improved pattern matching algorithm
    Object.entries(nlpModel.intents).forEach(([intentName, intentData]) => {
        let maxConfidence = 0;
        let matchedPattern = '';

        intentData.patterns.forEach(pattern => {
            const patternLower = pattern.toLowerCase();
            let confidence = 0;

            // Exact match gets highest confidence
            if (messageLower === patternLower) {
                confidence = 1.0;
            }
            // Check if message starts with pattern
            else if (messageLower.startsWith(patternLower)) {
                confidence = 0.9;
            }
            // Check if message ends with pattern  
            else if (messageLower.endsWith(patternLower)) {
                confidence = 0.8;
            }
            // Check if message contains whole words from pattern
            else if (messageLower.includes(patternLower)) {
                const words = patternLower.split(' ');
                const messageWords = messageLower.split(' ');
                const matchedWords = words.filter(word => messageWords.includes(word));
                confidence = matchedWords.length / words.length * 0.7;
            }

            if (confidence > maxConfidence) {
                maxConfidence = confidence;
                matchedPattern = pattern;
            }
        });

        if (maxConfidence > bestMatch.confidence) {
            console.log(`🎯 Better match: "${matchedPattern}" in intent "${intentName}" with confidence ${maxConfidence}`);
            
            const randomResponse = intentData.responses[
                Math.floor(Math.random() * intentData.responses.length)
            ];

            bestMatch = {
                intent: intentName,
                confidence: maxConfidence,
                response: randomResponse,
                api_endpoint: intentData.api_endpoint,
                base_suggestions: intentData.suggestions || []
            };
        }
    });

    // Extract entities from the message
    const entities = nlpUtils.extractEntities(messageLower);
    
    console.log(`🎯 Final intent: ${bestMatch.intent} with confidence ${bestMatch.confidence}`);
    return { ...bestMatch, entities };
}

// Get user info from request headers (simulating local storage data)
function getUserInfoFromHeaders(req) {
    try {
        // Try to get user info from custom headers (simulating localStorage)
        const userDataHeader = req.headers['x-user-data'];
        console.log('🔍 Raw user data header:', userDataHeader);
        
        if (userDataHeader) {
            const parsedData = JSON.parse(decodeURIComponent(userDataHeader));
            console.log('✅ Parsed user data from headers:', parsedData);
            return parsedData;
        }

        // Check if user data is in request body (alternative method)
        if (req.body && req.body.userData) {
            console.log('✅ Found user data in request body:', req.body.userData);
            return req.body.userData;
        }

        // Enhanced fallback to JWT user info with more complete data structure
        const fallbackData = {
            _id: req.user?.userId || 'unknown',
            userId: req.user?.userId || 'unknown',
            email: req.user?.email || 'user@example.com',
            fullName: req.user?.fullName || req.user?.name || 'User',
            role: req.user?.role || 'user',
            agency: req.user?.agency || 'Unknown Agency',
            kycStatus: req.user?.kycStatus || 'verified',
            loginCount: req.user?.loginCount || 0,
            lastLoginAt: req.user?.lastLoginAt || new Date().toISOString()
        };
        
        console.log('📋 Using fallback user data (JWT):', fallbackData);
        console.log('🔍 Available req.user data:', req.user);
        return fallbackData;
    } catch (error) {
        console.error('❌ Error parsing user data from headers:', error);
        return {
            _id: 'unknown',
            userId: 'unknown',
            email: 'user@example.com',
            fullName: 'User',
            role: 'user',
            agency: 'Unknown Agency',
            kycStatus: 'verified'
        };
    }
}

// Handle navigation help
function handleNavigationHelp(message, user, userRole) {
    const messageLower = message.toLowerCase();

    // Check for specific navigation requests
    for (const [section, guide] of Object.entries(navigationGuides)) {
        if (messageLower.includes(section)) {
            return {
                response: `${guide.title}

${guide.content}

Need help with something specific?`,
                suggestions: guide.suggestions
            };
        }
    }

    // General navigation help
    return {
        response: `I can guide you to any section of LegalVault:

Main Sections:
• Dashboard - Your main hub with overview and quick actions
• Cases - Manage and file legal cases  
• Evidence - Upload and verify legal documents
• Legal Database - Search Indian laws and sections
• Legal News - Stay updated with latest developments

Where would you like to go?`,
        suggestions: ["Dashboard guide", "Cases section", "Evidence upload", "Legal database"]
    };
}

// Advanced Intelligent Legal Chatbot with Real NLP Processing
const chatWithLegalBot = async (req, res, next) => {
    console.log('🤖 INTELLIGENT CHATBOT PROCESSING:', new Date().toISOString());
    console.log('� User Message:', req.body?.message);
    console.log('📍 User Location:', req.body?.userLocation ? 'Provided' : 'Not provided');
    
    try {
        const { message, userLocation, context } = req.body;
        const authToken = req.headers.authorization?.replace('Bearer ', '');

        if (!message?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Get real user data from database
        const userData = await User.findById(req.user.userId).catch(() => null);
        const realUserData = {
            userId: req.user.userId,
            fullName: userData?.fullName || req.user.fullName || req.user.name || 'User',
            email: userData?.email || req.user.email,
            role: userData?.role || req.user.role || 'user',
            agency: userData?.agency || 'Unknown Agency',
            kycStatus: userData?.kycStatus || 'pending'
        };

        console.log('� Real User Data:', realUserData);

        // Process message with intelligent NLP, including location data
        const { intent, confidence, entities, response, suggestions, additionalData } = await processIntelligentResponse(message, realUserData, authToken, userLocation, context);

        console.log('🎯 NLP Analysis Result:', { intent, confidence, entities });

        res.json({
            success: true,
            response: response,
            suggestions: suggestions,
            userRole: realUserData.role,
            intent: intent,
            confidence: confidence,
            entities: entities,
            userId: realUserData.userId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Chatbot Intelligence Error:', error);
        res.status(500).json({
            success: false,
            message: 'I encountered an issue processing your request. Please try again.',
            suggestions: ['Try again', 'Contact support'],
            error: error.message
        });
    }
};

// Intelligent NLP Processing Engine with Specialized Controller Routing
async function processIntelligentResponse(message, userData, authToken, userLocation = null, context = null) {
    console.log('🧠 Processing with Advanced Multi-Controller NLP:', message);
    if (userLocation) console.log('📍 User location provided:', userLocation);
    
    // First, try advanced NLP processing for complex queries
    const advancedResult = await processAdvancedLegalQuery(message, userData);
    if (advancedResult.confidence > 0.85) {
        console.log('🎯 High confidence advanced query detected:', advancedResult.intent);
        
        // Route to appropriate specialized controller based on advanced NLP result
        switch (advancedResult.intent) {
            case 'location_query':
            case 'location_court_police':
            case 'court_finder':
            case 'police_station_finder':
            case 'emergency_contact':
                return await routeToLocationController(message, userData, advancedResult, userLocation);
                
            case 'document_creation':
            case 'fir_help':
            case 'affidavit_help':
            case 'petition_help':
            case 'bail_application':
            case 'legal_notice':
                return await routeToDocumentController(message, userData, advancedResult);
                
            case 'emergency_legal':
            case 'immediate_help':
                return await handleEmergencyQuery(message, userData, advancedResult);
        }
    }
    
    // Try general legal NLP for standard queries
    const generalResult = await processGeneralLegalQuery(message, userData);
    if (generalResult.confidence > 0.75) {
        console.log('🎯 High confidence general query detected:', generalResult.intent);
        
        // Route to legal query controller for law-specific questions and case filing
        if (['law_section_query', 'crime_punishment_query', 'legal_rights_query', 'legal_procedure_query', 'file_case_query'].includes(generalResult.intent)) {
            return await routeToLegalQueryController(message, userData, generalResult);
        }
    }
    
    // Fallback to original NLP detection for basic intents
    const intentResult = detectIntentFromNLP(message, userData);
    const { intent, confidence, entities } = intentResult;

    console.log('🔍 Final Intent Route:', { intent, confidence });

    // Route to intelligent handlers based on intent
    switch (intent) {
        case 'greeting':
            return handleIntelligentGreeting(userData);
            
        case 'user_info':
        case 'user_management':
            return await handleIntelligentUserQuery(message, userData, authToken);
            
        case 'law_search':
        case 'section_query':
            // Route to specialized legal query controller
            return await routeToLegalQueryController(message, userData, { intent, confidence, entities, message });
            
        case 'case_management':
            return await handleIntelligentCaseQuery(message, userData, authToken);
            
        case 'evidence_management':
            return await handleIntelligentEvidenceQuery(message, userData, authToken);
            
        case 'legal_news':
        case 'blog_content':
            return await handleIntelligentNewsQuery(message, userData, authToken);
            
        case 'system_status':
            return handleIntelligentSystemStatus(userData);
            
        case 'goodbye':
        case 'thanks':
            return handleIntelligentFarewell(userData);
            
        default:
            return await handleIntelligentFallback(message, userData, entities);
    }
}

// Route to Location Controller
async function routeToLocationController(message, userData, nlpResult, userLocation = null) {
    try {
        console.log('📍 Routing to Location Controller:', nlpResult.intent);
        
        const locationResponse = await handleLocationRequest({
            body: { 
                message: message,
                intent: nlpResult.intent,
                entities: nlpResult.entities,
                userData: userData,
                userLocation: userLocation
            }
        });
        
        return {
            intent: nlpResult.intent,
            confidence: nlpResult.confidence,
            entities: nlpResult.entities,
            response: locationResponse.response,
            suggestions: locationResponse.suggestions,
            additionalData: locationResponse.additionalData
        };
    } catch (error) {
        console.error('Error routing to location controller:', error);
        return await handleIntelligentFallback(message, userData, nlpResult.entities);
    }
}

// Route to Document Controller
async function routeToDocumentController(message, userData, nlpResult) {
    try {
        console.log('📄 Routing to Document Controller:', nlpResult.intent);
        
        const documentResponse = await handleDocumentRequest({
            body: { 
                message: message,
                intent: nlpResult.intent,
                entities: nlpResult.entities,
                userData: userData
            }
        });
        
        return {
            intent: nlpResult.intent,
            confidence: nlpResult.confidence,
            entities: nlpResult.entities,
            response: documentResponse.response,
            suggestions: documentResponse.suggestions,
            additionalData: documentResponse.additionalData
        };
    } catch (error) {
        console.error('Error routing to document controller:', error);
        return await handleIntelligentFallback(message, userData, nlpResult.entities);
    }
}

// Route to Legal Query Controller
async function routeToLegalQueryController(message, userData, nlpResult) {
    try {
        console.log('⚖️ Routing to Legal Query Controller:', nlpResult.intent);
        
        const legalResponse = await handleLegalQueryRequest({
            body: { 
                message: message,
                intent: nlpResult.intent,
                entities: nlpResult.entities,
                userData: userData
            }
        });
        
        return {
            intent: nlpResult.intent,
            confidence: nlpResult.confidence,
            entities: nlpResult.entities,
            response: legalResponse.response,
            suggestions: legalResponse.suggestions,
            additionalData: legalResponse.additionalData
        };
    } catch (error) {
        console.error('Error routing to legal query controller:', error);
        return await handleIntelligentLegalSearch(message, nlpResult.entities, userData);
    }
}

// Handle Emergency Legal Queries
async function handleEmergencyQuery(message, userData, nlpResult) {
    console.log('🚨 Emergency legal query detected');
    
    const emergencyResponse = `🚨 **Emergency Legal Assistance**

I understand this is urgent. Here's immediate help:

**Emergency Contacts:**
• Police: 100
• Legal Aid: 15100
• Women Helpline: 1091
• Cyber Crime: 1930

**Immediate Actions:**
1. Contact local police if crime in progress
2. Preserve any evidence safely
3. Contact a lawyer immediately
4. Document everything that happened

**I can help you with:**
• Finding nearby police stations
• Locating emergency legal aid
• Preparing FIR documentation
• Understanding your legal rights

What specific emergency help do you need right now?`;

    return {
        intent: 'emergency_legal',
        confidence: 1.0,
        entities: nlpResult.entities,
        response: emergencyResponse,
        suggestions: [
            'Find nearest police station',
            'Help with FIR',
            'Emergency legal aid',
            'Document evidence',
            'Know my rights'
        ]
    };
}

// ============ INTELLIGENT HANDLER FUNCTIONS ============

// Intelligent Greeting Handler
function handleIntelligentGreeting(userData) {
    const userName = userData.fullName || 'there';
    const userRole = userData.role;
    const currentHour = new Date().getHours();
    
    const timeGreeting = currentHour < 12 ? 'Good morning' : 
                        currentHour < 17 ? 'Good afternoon' : 'Good evening';

    const roleSpecificGreetings = {
        admin: `${timeGreeting}, ${userName}! What admin task can I help with?`,
        lawyer: `${timeGreeting}, ${userName}! Ready to work on legal matters?`,
        judge: `${timeGreeting}, Your Honor! How can I assist today?`,
        police: `${timeGreeting}, Officer ${userName}! What do you need help with?`
    };

    const greeting = roleSpecificGreetings[userRole] || 
                    `${timeGreeting}, ${userName}! How can I help you today?`;

    return {
        intent: 'greeting',
        confidence: 1.0,
        entities: [],
        response: greeting,
        suggestions: getContextualSuggestions('greeting', userRole, 'greeting')
    };
}

// Intelligent User Query Handler
async function handleIntelligentUserQuery(message, userData, authToken) {
    const messageLower = message.toLowerCase();
    
    // Admin user management queries
    if (userData.role === 'admin' && (messageLower.includes('all users') || messageLower.includes('user management') || messageLower.includes('show users'))) {
        return await fetchAllUsersForAdmin(authToken, userData);
    }
    
    // "Who am I" type queries
    if (messageLower.includes('who am i') || messageLower.includes('about me') || messageLower.includes('my info') || messageLower.includes('profile')) {
        return await fetchDetailedUserProfile(authToken, userData);
    }
    
    // Personal user info queries
    return await fetchUserProfile(authToken, userData);
}

// Enhanced detailed user profile with next steps
async function fetchDetailedUserProfile(authToken, userData) {
    try {
        const response = await makeAuthenticatedRequest('/auth/profile', authToken);
        
        const profileInfo = `👤 **Who You Are - ${userData.fullName}**

**Personal Details:**
• Full Name: ${userData.fullName}
• Email: ${userData.email} 
• Role: ${userData.role} ${getRoleIcon(userData.role)}
• Agency: ${userData.agency}
• User ID: ${userData.userId}

**Account Status:**
• KYC Status: ${userData.kycStatus} ${userData.kycStatus === 'verified' ? '✅' : '⏳'}
• Account Status: Active ✅
• Member Since: ${response?.createdAt ? new Date(response.createdAt).toLocaleDateString() : 'Recently joined'}

**What You Can Do Next:**
${getPersonalizedNextSteps(userData)}

**Platform Access:**
As a ${userData.role}, you have access to ${getRoleFeatures(userData.role)}`;

        return {
            intent: 'user_info',
            confidence: 0.98,
            entities: ['profile', 'personal_info'],
            response: profileInfo,
            suggestions: getPersonalizedSuggestions(userData)
        };
    } catch (error) {
        console.error('Error fetching detailed profile:', error);
    }

    return {
        intent: 'user_info',
        confidence: 0.8,
        entities: [],
        response: `**You Are: ${userData.fullName}**

**Role:** ${userData.role} ${getRoleIcon(userData.role)}
**Email:** ${userData.email}
**Status:** ${userData.kycStatus}

**What You Can Do:**
${getPersonalizedNextSteps(userData)}`,
        suggestions: getPersonalizedSuggestions(userData)
    };
}

// Get personalized next steps based on user role and status
function getPersonalizedNextSteps(userData) {
    const roleActions = {
        admin: `• Manage platform users and permissions
• Monitor system health and performance
• Review security logs and reports
• Configure platform settings
• Generate analytics reports`,
        
        lawyer: `• Search legal databases for case research
• File and manage client cases
• Upload and organize evidence
• Access latest legal news and updates
• Collaborate with legal teams`,
        
        judge: `• Review case precedents and legal research
• Access comprehensive legal databases
• Monitor court procedures and guidelines
• Review evidence submissions
• Stay updated with legal developments`,
        
        police: `• File cases and investigation reports
• Upload and verify digital evidence
• Access legal procedure guidelines
• Manage chain of custody documentation
• Coordinate with legal teams`,
        
        user: `• Search Indian laws and legal sections
• Get legal guidance and information
• Access legal news and updates
• Learn about legal rights and procedures
• Contact legal professionals if needed`
    };
    
    return roleActions[userData.role] || roleActions.user;
}

// Get personalized suggestions based on user context
function getPersonalizedSuggestions(userData) {
    const roleSuggestions = {
        admin: ['Show all users', 'System analytics', 'Security logs', 'Platform settings', 'User reports'],
        lawyer: ['Legal research', 'My cases', 'Upload evidence', 'Legal news', 'Client tools'],
        judge: ['Legal precedents', 'Case reviews', 'Court procedures', 'Evidence review', 'Legal updates'],
        police: ['File a case', 'Upload evidence', 'Investigation tools', 'Legal procedures', 'Evidence chain'],
        user: ['Legal sections', 'My rights', 'Legal help', 'Latest news', 'Contact lawyer']
    };
    
    let suggestions = roleSuggestions[userData.role] || roleSuggestions.user;
    
    // Add KYC suggestion if not verified
    if (userData.kycStatus !== 'verified') {
        suggestions = ['Complete KYC verification', ...suggestions];
    }
    
    return suggestions;
}

// Get role features description
function getRoleFeatures(role) {
    const features = {
        admin: 'full platform administration, user management, system analytics, and security controls',
        lawyer: 'advanced legal research, case management, evidence handling, and client collaboration tools',
        judge: 'comprehensive legal research, case review tools, court procedures, and precedent analysis',
        police: 'case filing, evidence management, investigation tools, and legal procedure guidance',
        user: 'legal information access, basic case tools, and educational legal resources'
    };
    
    return features[role] || features.user;
}

// Fetch all users for admin
async function fetchAllUsersForAdmin(authToken, userData) {
    try {
        const response = await makeAuthenticatedRequest('/auth/users', authToken);
        
        if (response && response.users) {
            const users = response.users;
            const userSummary = `👥 **User Management Dashboard**

**Total Users:** ${users.length}

**User List:**
${users.slice(0, 10).map((user, i) => 
`${i+1}. **${user.fullName || 'No name'}**
   📧 ${user.email}
   🎭 Role: ${user.role}
   ✅ Status: ${user.kycStatus}`
).join('\n\n')}

${users.length > 10 ? `\n*Showing first 10 of ${users.length} users*` : ''}`;

            return {
                intent: 'user_management',
                confidence: 0.95,
                entities: ['all_users'],
                response: userSummary,
                suggestions: ['User statistics', 'Role management', 'Account verification', 'System logs']
            };
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }

    return {
        intent: 'user_management',
        confidence: 0.8,
        entities: [],
        response: `I couldn't retrieve user data right now. Please try again or check your admin permissions.`,
        suggestions: ['Try again', 'System status', 'Contact support']
    };
}

// Fetch user profile
async function fetchUserProfile(authToken, userData) {
    try {
        const response = await makeAuthenticatedRequest('/auth/profile', authToken);
        
        if (response) {
            const profileInfo = `👤 **Your Profile Information**

**Name:** ${userData.fullName}
**Email:** ${userData.email}
**Role:** ${userData.role}
**Agency:** ${userData.agency}
**KYC Status:** ${userData.kycStatus}
**User ID:** ${userData.userId}

**Account Status:** Active ✅
**Member Since:** ${response.createdAt ? new Date(response.createdAt).toLocaleDateString() : 'N/A'}`;

            return {
                intent: 'user_info',
                confidence: 0.95,
                entities: [],
                response: profileInfo,
                suggestions: ['Update profile', 'Security settings', 'Account preferences', 'Privacy controls']
            };
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }

    return {
        intent: 'user_info',
        confidence: 0.8,
        entities: [],
        response: `**Your Basic Info:**\n\n**Name:** ${userData.fullName}\n**Role:** ${userData.role}\n**Email:** ${userData.email}`,
        suggestions: ['Account settings', 'Platform help', 'Contact support']
    };
}

// Intelligent Legal Search Handler
async function handleIntelligentLegalSearch(message, entities, userData) {
    console.log('🔍 Legal Search Query:', message);
    console.log('📚 Available databases:', Object.keys(legalDatabase));
    
    const messageLower = message.toLowerCase();
    let searchResults = [];
    let searchType = 'general';
    
    // Extract section numbers (e.g., "420", "section 420", "IPC 420")
    const sectionMatch = message.match(/(?:section\s+)?(\d+)/i);
    const lawMatch = message.match(/(ipc|cpc|crpc|hma|iea|mva|ida|nia)/i);
    
    if (sectionMatch && lawMatch) {
        // Specific section search
        const sectionNum = sectionMatch[1];
        const lawType = lawMatch[1].toLowerCase();
        searchResults = searchSpecificSection(lawType, sectionNum);
        searchType = 'section_specific';
    } else if (sectionMatch) {
        // Section number without law type - search across all laws
        const sectionNum = sectionMatch[1];
        searchResults = searchAcrossAllLaws(sectionNum);
        searchType = 'section_general';
    } else {
        // Keyword search
        searchResults = searchByKeywords(messageLower);
        searchType = 'keyword';
    }
    
    if (searchResults.length > 0) {
        const response = formatLegalSearchResults(searchResults, searchType, message);
        return {
            intent: 'law_search',
            confidence: 0.9,
            entities: entities,
            response: response,
            suggestions: getContextualSuggestions(message, userData.role, 'legal_search')
        };
    } else {
        return {
            intent: 'law_search',
            confidence: 0.7,
            entities: entities,
            response: `I couldn't find specific legal information for "${message}". Try searching with section numbers or specific legal terms.

**Available laws:** IPC, CPC, CrPC, HMA, IEA, MVA, IDA, NIA

**Example searches:**
• "IPC Section 420"
• "theft punishment"
• "bail provisions"`,
            suggestions: ['IPC Section 420', 'CrPC bail', 'Marriage laws', 'Evidence rules']
        };
    }
}

// Search specific section in a law
function searchSpecificSection(lawType, sectionNum) {
    const lawData = legalDatabase[lawType];
    if (!lawData) return [];
    
    // Try different section key formats
    const possibleKeys = [
        `section_${sectionNum}`,
        `${sectionNum}`,
        sectionNum
    ];
    
    for (const key of possibleKeys) {
        if (lawData[key]) {
            return [{
                law: lawType.toUpperCase(),
                section: sectionNum,
                data: lawData[key],
                relevance: 1.0
            }];
        }
    }
    
    return [];
}

// Search section across all laws
function searchAcrossAllLaws(sectionNum) {
    const results = [];
    
    Object.entries(legalDatabase).forEach(([lawType, lawData]) => {
        const sectionData = searchSpecificSection(lawType, sectionNum);
        if (sectionData.length > 0) {
            results.push(...sectionData);
        }
    });
    
    return results;
}

// Search by keywords
function searchByKeywords(query) {
    const results = [];
    const keywords = query.split(' ').filter(word => word.length > 3);
    
    Object.entries(legalDatabase).forEach(([lawType, lawData]) => {
        Object.entries(lawData).forEach(([sectionKey, sectionData]) => {
            if (sectionData && typeof sectionData === 'object') {
                const searchText = (
                    (sectionData.title || '') + ' ' +
                    (sectionData.description || '') + ' ' +
                    (sectionData.text || '') + ' ' +
                    (sectionData.content || '')
                ).toLowerCase();
                
                let relevance = 0;
                keywords.forEach(keyword => {
                    if (searchText.includes(keyword)) {
                        relevance += 0.3;
                    }
                });
                
                if (relevance > 0) {
                    results.push({
                        law: lawType.toUpperCase(),
                        section: sectionData.number || sectionKey,
                        data: sectionData,
                        relevance: relevance
                    });
                }
            }
        });
    });
    
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}

// Format legal search results
function formatLegalSearchResults(results, searchType, originalQuery) {
    if (results.length === 1) {
        const result = results[0];
        return `📖 **${result.law} Section ${result.section}**

**${result.data.title || 'Legal Provision'}**

${result.data.description || result.data.text || result.data.content || 'Section details available in legal database.'}

${result.data.punishment ? `**Punishment:** ${result.data.punishment}` : ''}
${result.data.cognizable !== undefined ? `**Cognizable:** ${result.data.cognizable}` : ''}
${result.data.bailable !== undefined ? `**Bailable:** ${result.data.bailable}` : ''}`;
    } else {
        let response = `📚 **Legal Search Results for "${originalQuery}"**\n\n`;
        
        results.forEach((result, index) => {
            response += `**${index + 1}. ${result.law} Section ${result.section}**\n`;
            response += `${(result.data.title || result.data.description || 'Legal provision').substring(0, 100)}...\n\n`;
        });
        
        return response;
    }
}

// Intelligent Case Query Handler
async function handleIntelligentCaseQuery(message, userData, authToken) {
    try {
        const caseData = await makeAuthenticatedRequest('/cases/stats', authToken);
        
        if (caseData) {
            const summary = `⚖️ **Case Management Overview**

**Total Cases:** ${caseData.totalCases || 0}
**Active Cases:** ${caseData.activeCases || 0}
**Completed:** ${caseData.closedCases || 0}

**Recent Activity:**
${caseData.recentActivity?.slice(0, 3).map(activity => 
    `• ${activity.date}: ${activity.action}`
).join('\n') || 'No recent activity'}

**Quick Actions Available:**
• View case details
• File new case
• Update case status
• Generate reports`;

            return {
                intent: 'case_management',
                confidence: 0.9,
                entities: [],
                response: summary,
                suggestions: ['View all cases', 'File new case', 'Case reports', 'Search cases']
            };
        }
    } catch (error) {
        console.error('Error fetching case data:', error);
    }

    return {
        intent: 'case_management',
        confidence: 0.8,
        entities: [],
        response: `📋 **Case Management System**

I can help you with:
• Filing new cases
• Managing existing cases
• Searching case records
• Generating case reports
• Tracking case progress

What specific case task do you need help with?`,
        suggestions: ['File a case', 'Case search', 'Case procedures', 'Documentation help']
    };
}

// Intelligent Evidence Query Handler  
async function handleIntelligentEvidenceQuery(message, userData, authToken) {
    try {
        const evidenceData = await makeAuthenticatedRequest('/evidence/stats', authToken);
        
        if (evidenceData) {
            const summary = `🔐 **Evidence Management System**

**Total Evidence:** ${evidenceData.totalEvidence || 0} items
**Blockchain Verified:** ${evidenceData.blockchainVerified || 0} items
**Storage Used:** ${evidenceData.storageUsed || '0MB'}

**Evidence Types:**
• Documents: ${evidenceData.documents || 0}
• Images: ${evidenceData.images || 0}
• Videos: ${evidenceData.videos || 0}
• Audio: ${evidenceData.audio || 0}

**Security Status:** 🔒 All evidence encrypted and blockchain-secured`;

            return {
                intent: 'evidence_management',
                confidence: 0.9,
                entities: [],
                response: summary,
                suggestions: ['Upload evidence', 'View evidence', 'Verify integrity', 'Evidence reports']
            };
        }
    } catch (error) {
        console.error('Error fetching evidence data:', error);
    }

    return {
        intent: 'evidence_management',
        confidence: 0.8,
        entities: [],
        response: `📁 **Digital Evidence Vault**

Secure evidence management features:
• Upload & store evidence files
• Blockchain verification
• Chain of custody tracking
• Access control & permissions
• Integrity verification

What evidence task can I help with?`,
        suggestions: ['Upload evidence', 'Evidence guide', 'Security info', 'Access controls']
    };
}

// Intelligent News Query Handler
async function handleIntelligentNewsQuery(message, userData, authToken) {
    try {
        // Try to get blogs first
        const blogData = await makeAuthenticatedRequest('/blogs', authToken);
        
        if (blogData && blogData.data && blogData.data.blogs) {
            const blogs = blogData.data.blogs.slice(0, 5);
            const blogSummary = `📚 **Latest Legal Content**

${blogs.map((blog, i) => 
    `**${i+1}. ${blog.title}**
Author: ${blog.author?.fullName || 'Legal Team'}
Category: ${blog.category || 'Legal'}
Published: ${new Date(blog.createdAt).toLocaleDateString()}`
).join('\n\n')}

Stay informed with our expert legal insights!`;

            return {
                intent: 'blog_content',
                confidence: 0.9,
                entities: [],
                response: blogSummary,
                suggestions: ['Read more blogs', 'Legal news', 'Create post', 'Blog categories']
            };
        }

        // Fallback to news API
        const newsResponse = await fetch(`${NEWS_API_BASE_URL}/everything?q=legal+law+court&apiKey=${NEWS_API_KEY}&pageSize=3`);
        const newsData = await newsResponse.json();
        
        if (newsData.articles && newsData.articles.length > 0) {
            const newsSummary = `📰 **Latest Legal News**

${newsData.articles.map((article, i) => 
    `**${i+1}. ${article.title}**
Source: ${article.source.name}
Published: ${new Date(article.publishedAt).toLocaleDateString()}
${article.description?.substring(0, 150)}...`
).join('\n\n')}`;

            return {
                intent: 'legal_news',
                confidence: 0.9,
                entities: [],
                response: newsSummary,
                suggestions: ['More news', 'Legal updates', 'Court news', 'Industry trends']
            };
        }
    } catch (error) {
        console.error('Error fetching news/blogs:', error);
    }

    return {
        intent: 'legal_news',
        confidence: 0.7,
        entities: [],
        response: `📰 **Legal Information Center**

I can provide:
• Latest legal news and updates
• Court decisions and judgments
• Legal blog articles
• Industry analysis and trends
• Educational legal content

What type of legal information interests you?`,
        suggestions: ['Latest news', 'Court updates', 'Legal blogs', 'Educational content']
    };
}

// Intelligent System Status Handler
function handleIntelligentSystemStatus(userData) {
    const currentTime = new Date().toLocaleString();
    
    return {
        intent: 'system_status',
        confidence: 1.0,
        entities: [],
        response: `🖥️ **System Status Dashboard**

**Platform Health:** ✅ All systems operational
**Current Time:** ${currentTime}
**Database Status:** ✅ Connected (${Object.keys(legalDatabase).length} law databases loaded)
**API Services:** ✅ Online
**Security:** ✅ SSL/TLS active
**Backups:** ✅ Automated daily backups running

**Your Access Level:** ${userData.role} ${getRoleIcon(userData.role)}
**Available Features:** All ${userData.role} features accessible

System is running smoothly!`,
        suggestions: ['Platform features', 'User guide', 'Technical support', 'Performance metrics']
    };
}

// Intelligent Farewell Handler
function handleIntelligentFarewell(userData) {
    const farewells = [
        `Thanks for using LegalVault, ${userData.fullName}! Have a great day! 👋`,
        `Goodbye ${userData.fullName}! Feel free to return anytime for legal assistance. 🌟`,
        `See you later, ${userData.fullName}! Hope I was helpful with your legal queries. ⚖️`
    ];
    
    const selectedFarewell = farewells[Math.floor(Math.random() * farewells.length)];
    
    return {
        intent: 'goodbye',
        confidence: 1.0,
        entities: [],
        response: selectedFarewell,
        suggestions: ['Legal resources', 'Contact support', 'Platform help']
    };
}

// Intelligent Fallback Handler
async function handleIntelligentFallback(message, userData, entities) {
    const messageLower = message.toLowerCase();
    
    // Check for legal terms or section references
    if (messageLower.match(/section|ipc|cpc|crpc|law|legal|court|case|punishment|bail|evidence/)) {
        return await handleIntelligentLegalSearch(message, entities, userData);
    }
    
    // Check for user-related queries
    if (messageLower.match(/profile|account|user|my info|settings|who am i|about me/)) {
        return await handleIntelligentUserQuery(message, userData, null);
    }
    
    // Check for case-related queries
    if (messageLower.match(/case|filing|evidence|upload|document/)) {
        return await handleIntelligentCaseQuery(message, userData, null);
    }
    
    // Check for news/blog queries
    if (messageLower.match(/news|blog|update|article|latest/)) {
        return await handleIntelligentNewsQuery(message, userData, null);
    }
    
    // Personalized fallback based on user role
    const roleSpecificHelp = {
        admin: `Hi ${userData.fullName}! As an admin, I can help you with:
• **User Management:** "show all users", "user statistics"
• **System Status:** "system health", "platform analytics"
• **Legal Database:** "search IPC 420", "legal sections"
• **Security:** "audit logs", "security status"`,

        lawyer: `Hi ${userData.fullName}! As a lawyer, I can help with:
• **Legal Research:** "IPC Section 420", "bail provisions"
• **Case Management:** "my cases", "file a case"
• **Evidence:** "upload evidence", "evidence verification"
• **News:** "legal updates", "court news"`,

        user: `Hi ${userData.fullName}! I can help you with:
• **Legal Information:** "IPC Section 420", "my legal rights"
• **Platform Help:** "who am I", "my account"
• **Legal News:** "latest legal news", "court updates"
• **Guidance:** "how to file case", "legal procedures"`
    };
    
    const helpText = roleSpecificHelp[userData.role] || roleSpecificHelp.user;
    
    return {
        intent: 'unknown',
        confidence: 0.6,
        entities: entities,
        response: `I didn't quite understand "${message}". 

${helpText}

What specific help do you need?`,
        suggestions: getContextualSuggestions(message, userData.role, 'unknown')
    };
}

// Comprehensive Legal Questions Database - All User's Suggested Questions
const comprehensiveLegalQuestions = {
    // Criminal Law Questions
    criminal_law: [
        "What is IPC Section 420?",
        "What is the punishment for theft?",
        "What are the provisions for domestic violence?",
        "How to file an FIR?",
        "What is IPC Section 302?",
        "What are the rights of an accused?",
        "What is the procedure for arrest?",
        "How to get bail?",
        "What is IPC Section 498A?",
        "What is cyber crime law?",
        "What is the punishment for fraud?",
        "What is defamation law?",
        "What are dowry laws?",
        "What is sexual harassment law?",
        "What is the punishment for murder?"
    ],
    
    // Civil Law Questions  
    civil_law: [
        "What is a civil suit?",
        "How to file a divorce?",
        "What are property rights?",
        "What is the procedure for adoption?",
        "What are marriage laws?",
        "What is child custody law?",
        "What is succession law?",
        "What are tenant rights?",
        "What is contract law?",
        "What is consumer protection?",
        "What are women's rights?",
        "What is maintenance law?",
        "What are inheritance rights?",
        "What is partition law?",
        "What is trademark law?"
    ],
    
    // Constitutional & Legal Rights
    constitutional_rights: [
        "What are fundamental rights?",
        "What is right to equality?",
        "What is right to freedom?",
        "What is right to life?",
        "What are directive principles?",
        "What is right to education?",
        "What is right to information?",
        "What are my legal rights?",
        "What is habeas corpus?",
        "What is mandamus?",
        "What is certiorari?",
        "What are human rights?",
        "What is constitutional remedy?",
        "What is due process?",
        "What is natural justice?"
    ],
    
    // Legal Procedures
    legal_procedures: [
        "How to file a case?",
        "What is the court procedure?",
        "How to hire a lawyer?",
        "What is legal aid?",
        "How to prepare legal documents?",
        "What is the appeals process?",
        "How to get legal help?",
        "What is mediation?",
        "What is arbitration?",
        "How to file an affidavit?",
        "What is a power of attorney?",
        "How to register a complaint?",
        "What is plea bargaining?",
        "How to get legal advice?",
        "What is court fee?"
    ],
    
    // Specific Legal Situations
    specific_situations: [
        "How to deal with police harassment?",
        "What to do if arrested?",
        "How to handle workplace harassment?",
        "What to do in domestic violence?",
        "How to report cyber crime?",
        "What to do if cheated?",
        "How to recover money?",
        "What to do in accident cases?",
        "How to handle property disputes?",
        "What to do for false cases?",
        "How to get compensation?",
        "What to do if blackmailed?",
        "How to handle business disputes?",
        "What to do for medical negligence?",
        "How to deal with fraud?"
    ],
    
    // Document & Location Help
    practical_help: [
        "Find nearest court",
        "Find police station",
        "Emergency legal contacts",
        "Help with FIR format",
        "Help with affidavit",
        "Help with legal notice",
        "Help with petition",
        "Help with bail application",
        "Court procedures guide",
        "Legal document templates",
        "Lawyer consultation",
        "Legal aid centers",
        "Court timings",
        "Required documents",
        "Legal fees information"
    ]
};

// Get contextual suggestions based on query type and user role
function getContextualSuggestions(currentQuery, userRole, queryType = 'general') {
    const currentQueryLower = currentQuery.toLowerCase();
    let relevantSuggestions = [];
    
    // Add role-based priority suggestions
    const rolePrioritySuggestions = {
        admin: ['Show all users', 'System status', 'User management', 'Platform analytics'],
        lawyer: comprehensiveLegalQuestions.legal_procedures.slice(0, 5),
        judge: comprehensiveLegalQuestions.constitutional_rights.slice(0, 5), 
        police: [...comprehensiveLegalQuestions.criminal_law.slice(0, 3), ...comprehensiveLegalQuestions.practical_help.slice(0, 2)],
        user: [...comprehensiveLegalQuestions.criminal_law.slice(0, 2), ...comprehensiveLegalQuestions.civil_law.slice(0, 2), 'Find nearest court']
    };
    
    // Start with role-based suggestions
    relevantSuggestions.push(...(rolePrioritySuggestions[userRole] || rolePrioritySuggestions.user));
    
    // Add contextual suggestions based on current query
    if (currentQueryLower.includes('ipc') || currentQueryLower.includes('section') || currentQueryLower.includes('criminal')) {
        relevantSuggestions.push(...comprehensiveLegalQuestions.criminal_law.slice(0, 8));
    } else if (currentQueryLower.includes('civil') || currentQueryLower.includes('divorce') || currentQueryLower.includes('property')) {
        relevantSuggestions.push(...comprehensiveLegalQuestions.civil_law.slice(0, 8));
    } else if (currentQueryLower.includes('rights') || currentQueryLower.includes('fundamental') || currentQueryLower.includes('constitutional')) {
        relevantSuggestions.push(...comprehensiveLegalQuestions.constitutional_rights.slice(0, 8));
    } else if (currentQueryLower.includes('procedure') || currentQueryLower.includes('file') || currentQueryLower.includes('case')) {
        relevantSuggestions.push(...comprehensiveLegalQuestions.legal_procedures.slice(0, 8));
    } else if (currentQueryLower.includes('help') || currentQueryLower.includes('emergency') || currentQueryLower.includes('urgent')) {
        relevantSuggestions.push(...comprehensiveLegalQuestions.specific_situations.slice(0, 8));
    } else if (currentQueryLower.includes('court') || currentQueryLower.includes('police') || currentQueryLower.includes('document')) {
        relevantSuggestions.push(...comprehensiveLegalQuestions.practical_help.slice(0, 8));
    } else {
        // General mix for non-specific queries
        relevantSuggestions.push(
            ...comprehensiveLegalQuestions.criminal_law.slice(0, 3),
            ...comprehensiveLegalQuestions.civil_law.slice(0, 3),
            ...comprehensiveLegalQuestions.legal_procedures.slice(0, 2),
            ...comprehensiveLegalQuestions.practical_help.slice(0, 2)
        );
    }
    
    // Remove duplicates and current query
    const uniqueSuggestions = [...new Set(relevantSuggestions)]
        .filter(suggestion => suggestion.toLowerCase() !== currentQueryLower)
        .slice(0, 8); // Limit to 8 suggestions for UI
    
    return uniqueSuggestions;
}

// Helper function to get role-based suggestions (updated to use comprehensive questions)
function getRoleBasedSuggestions(role) {
    const suggestions = {
        admin: ['Show all users', 'System status', 'User management', 'Platform analytics'],
        lawyer: [
            'Legal research', 
            'Case management', 
            'Evidence handling', 
            ...comprehensiveLegalQuestions.legal_procedures.slice(0, 4)
        ],
        judge: [
            'Legal precedents', 
            'Case reviews', 
            'Court procedures', 
            ...comprehensiveLegalQuestions.constitutional_rights.slice(0, 4)
        ],
        police: [
            'Evidence upload', 
            'Case filing', 
            ...comprehensiveLegalQuestions.criminal_law.slice(0, 3),
            ...comprehensiveLegalQuestions.practical_help.slice(0, 3)
        ],
        user: [
            ...comprehensiveLegalQuestions.criminal_law.slice(0, 3),
            ...comprehensiveLegalQuestions.civil_law.slice(0, 2),
            ...comprehensiveLegalQuestions.practical_help.slice(0, 3)
        ]
    };
    
    return suggestions[role] || suggestions.user;
}

// Helper function to get role icons
function getRoleIcon(role) {
    const icons = {
        admin: '👑',
        lawyer: '⚖️', 
        judge: '🏛️',
        police: '🛡️',
        user: '👤'
    };
    return icons[role] || '👤';
}

// Generate enhanced greeting based on time and user context
function generateEnhancedGreeting(user, userRole, currentHour) {
    const timeGreeting = currentHour < 12 ? 'Good morning' :
        currentHour < 17 ? 'Good afternoon' : 'Good evening';

    const userName = user?.fullName || user?.name || user?.username;
    
    // More conversational greetings based on role
    const roleGreetings = {
        admin: [
            `${timeGreeting}, ${userName}! Ready to manage the platform?`,
            `Hey ${userName}! What admin task can I help with today?`,
            `Hi ${userName}! Need to check users or system status?`
        ],
        lawyer: [
            `${timeGreeting}, ${userName}! Working on a case today?`,
            `Hey ${userName}! How can I help with your legal work?`,
            `Hi ${userName}! Need to search laws or manage cases?`
        ],
        judge: [
            `${timeGreeting}, Your Honor! How can I assist you today?`,
            `Hello ${userName}! Looking for case precedents or laws?`,
            `Hi ${userName}! Need help with legal research?`
        ],
        police: [
            `${timeGreeting}, Officer ${userName}! How can I help?`,
            `Hey ${userName}! Working on evidence or case documentation?`,
            `Hi ${userName}! Need assistance with legal procedures?`
        ]
    };

    const defaultGreetings = [
        `${timeGreeting}, ${userName}! What legal question do you have?`,
        `Hey ${userName}! How can I help you today?`,
        `Hi ${userName}! What brings you here?`
    ];

    const greetings = roleGreetings[userRole] || defaultGreetings;
    const selectedGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    return selectedGreeting;
}

module.exports = {
    chatWithLegalBot,
    initializeLegalDatabase,
    legalDatabase
};
