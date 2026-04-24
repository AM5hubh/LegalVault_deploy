// Comprehensive NLP Model for LegalVault Chatbot
// This file contains all conversation patterns, responses, and entity definitions

const nlpModel = {
  // Intent patterns and responses
  intents: {
    greeting: {
      patterns: [
        'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 
        'namaste', 'namaskar', 'greetings', 'howdy', 'hola', 'salaam', 'sup', 'what\'s up'
      ],
      responses: [
        'Hey! What can I help you with?',
        'Hi there! What\'s on your mind?',
        'Hello! How can I assist you today?',
        'Hey! What legal question do you have?'
      ],
      suggestions: [
        'Show me legal news',
        'Search law sections', 
        'Help with platform',
        'My profile'
      ]
    },

    goodbye: {
      patterns: [
        'bye', 'goodbye', 'see you', 'exit', 'quit', 'thank you bye', 
        'good night', 'farewell', 'take care', 'see you later'
      ],
      responses: [
        'Take care! Come back anytime.',
        'Bye! Happy to help whenever you need.',
        'See you later! Good luck with everything.',
        'Goodbye! Feel free to ask me anything anytime.'
      ],
      suggestions: [
        'Legal tips',
        'Save chat',
        'Quick help',
        'Contact info'
      ]
    },

    thanks: {
      patterns: [
        'thank you', 'thanks', 'appreciate it', 'grateful', 'thank u', 
        'thx', 'ty', 'much appreciated', 'thanks a lot', 'many thanks'
      ],
      responses: [
        'You\'re very welcome! Happy to help with legal matters.',
        'Glad I could assist you! Feel free to ask more questions.',
        'My pleasure! Legal clarity is important for everyone.',
        'Anytime! I\'m here to make legal information accessible.'
      ],
      suggestions: [
        'Ask another question',
        'Legal tips',
        'Platform features',
        'Share feedback'
      ]
    },

    how_are_you: {
      patterns: [
        'how are you', 'how do you do', 'what\'s up', 'whats up', 'how\'s it going', 
        'how have you been', 'what\'s new', 'how\'s everything', 'sup', 'wassup'
      ],
      responses: [
        'I\'m doing great! Ready to help you with legal stuff.',
        'All good here! What legal question do you have?',
        'I\'m great! How can I help you today?',
        'Doing well! What brings you here today?'
      ],
      suggestions: [
        'Legal news updates',
        'Platform status',
        'Recent judgments',
        'Help features'
      ]
    },

    user_info: {
      patterns: [
        'who am i', 'my profile', 'my account', 'my information', 'user details', 
        'account info', 'profile info', 'my data', 'user profile', 'account details',
        'about me', 'tell me about myself', 'what can i do', 'my role', 'my status',
        'what should i do next', 'what next', 'my capabilities', 'what am i allowed'
      ],
      responses: [
        'Let me get your complete profile and next steps.',
        'I\'ll show you who you are and what you can do.',
        'Fetching your profile and personalized guidance.'
      ],
      api_endpoint: '/auth/profile',
      suggestions: [
        'Update profile',
        'Account settings',
        'Next steps',
        'Role capabilities'
      ]
    },

    account_setup: {
      patterns: [
        'account setup', 'set up account', 'setup account', 'account configuration',
        'configure account', 'account settings', 'profile setup', 'setup profile'
      ],
      responses: [
        'Let me help you set up your account properly.',
        'I\'ll guide you through the account setup process.',
        'Setting up your account is easy! Let me help.'
      ],
      suggestions: [
        'Complete profile',
        'Verify KYC',
        'Security settings',
        'Notification preferences'
      ]
    },

    system_status: {
      patterns: [
        'system status', 'health check', 'system health', 'platform status', 
        'server status', 'system check', 'is system working', 'platform health'
      ],
      responses: [
        'Checking all LegalVault systems for you...',
        'Running comprehensive system diagnostics...',
        'Performing platform health verification...'
      ],
      suggestions: [
        'Server details',
        'Database status', 
        'Performance metrics',
        'Technical support'
      ]
    },

    case_management: {
      patterns: [
        'my cases', 'view cases', 'case list', 'case status', 'recent cases', 
        'case search', 'find cases', 'case details', 'case management', 'legal cases',
        'active cases', 'pending cases', 'closed cases', 'case history'
      ],
      responses: [
        'Retrieving your case information...',
        'Accessing case management system...',
        'Gathering your legal case data...'
      ],
      api_endpoint: '/cases/stats',
      suggestions: [
        'View all cases',
        'Search cases',
        'Create new case', 
        'Case analytics',
        'Case documents',
        'Recent activity'
      ]
    },

    evidence_management: {
      patterns: [
        'evidence', 'my evidence', 'evidence list', 'upload evidence', 'evidence status',
        'evidence management', 'digital evidence', 'evidence storage', 'evidence security',
        'blockchain evidence', 'evidence verification'
      ],
      responses: [
        'Accessing secure evidence management system...',
        'Retrieving evidence storage information...',
        'Connecting to blockchain-verified evidence vault...'
      ],
      api_endpoint: '/evidence',
      suggestions: [
        'Upload evidence',
        'View evidence', 
        'Verify integrity',
        'Evidence security',
        'Storage options',
        'Access controls'
      ]
    },

    blog_content: {
      patterns: [
        'blog', 'blogs', 'latest blogs', 'blog posts', 'articles', 'legal articles',
        'legal content', 'legal blogs', 'news articles', 'legal insights'
      ],
      responses: [
        'Fetching latest legal blogs and articles...',
        'Accessing legal content library...',
        'Retrieving recent legal insights...'
      ],
      api_endpoint: '/blogs',
      suggestions: [
        'Latest articles',
        'Legal insights',
        'Create blog post',
        'Popular topics',
        'Legal analysis',
        'Recent updates'
      ]
    },

    user_management: {
      patterns: [
        'user management', 'manage users', 'all users', 'user list', 'users', 'show users',
        'user administration', 'user admin', 'user accounts', 'registered users',
        'user database', 'account management', 'view all users', 'list users'
      ],
      responses: [
        'Fetching user management data...',
        'Accessing user administration panel...',
        'Retrieving user account information...'
      ],
      api_endpoint: '/auth/users',
      suggestions: [
        'View user details',
        'User statistics', 
        'Role management',
        'Account status',
        'User activity logs',
        'Export user data'
      ]
    },

    confirmation: {
      patterns: [
        'yes', 'yeah', 'yep', 'sure', 'okay', 'ok', 'alright', 'sounds good', 
        'got it', 'understood', 'correct', 'right', 'exactly', 'that\'s right'
      ],
      responses: [
        'Great! What would you like to do next?',
        'Perfect! How else can I help?',
        'Awesome! What\'s your next question?',
        'Good! Anything else you need?'
      ],
      suggestions: [
        'Search legal sections',
        'Latest news',
        'My account',
        'Platform help'
      ]
    },

    denial: {
      patterns: [
        'no', 'nope', 'not really', 'nah', 'not now', 'maybe later', 
        'that\'s not right', 'incorrect', 'wrong', 'not what i meant'
      ],
      responses: [
        'No problem! What can I help you with instead?',
        'Okay! What would you like to do?',
        'Alright! How else can I assist?',
        'Got it! What are you looking for?'
      ],
      suggestions: [
        'Ask something else',
        'Platform features',
        'Legal help',
        'Search laws'
      ]
    },

    casual_chat: {
      patterns: [
        'tell me something', 'what can you do', 'what do you know', 'random fact',
        'tell me about yourself', 'what are you', 'who are you', 'about you'
      ],
      responses: [
        'I\'m your legal AI assistant! I can help with Indian laws, cases, and platform navigation.',
        'I know about Indian legal system, court procedures, and can search through thousands of law sections!',
        'I\'m here to make legal stuff easier for you! Ask me about laws, cases, or how to use the platform.',
        'I\'m a legal AI that can search IPC, CPC, evidence laws and more! What interests you?'
      ],
      suggestions: [
        'Show me IPC sections',
        'Latest legal news',
        'How to file case',
        'Platform tour'
      ]
    },

    legal_news: {
      patterns: [
        'news', 'legal news', 'latest news', 'current affairs', 'legal updates', 
        'court news', 'supreme court news', 'legal developments', 'breaking news',
        'legal headlines', 'court updates', 'judgment news'
      ],
      responses: [
        'Fetching the latest legal news and developments...',
        'Retrieving current legal affairs and court updates...',
        'Accessing breaking legal news from trusted sources...'
      ],
      suggestions: [
        'Supreme Court updates',
        'Recent judgments',
        'Legal reforms',
        'Court decisions',
        'Legal analysis',
        'Breaking news'
      ]
    },

    navigation_help: {
      patterns: [
        'navigate', 'dashboard', 'menu', 'where to find', 'how to access', 'where is',
        'help navigate', 'platform navigation', 'site navigation', 'how to use',
        'find feature', 'locate section'
      ],
      responses: [
        'I\'ll help you navigate the LegalVault platform!',
        'Let me guide you through the platform features.',
        'I can show you how to find any section or feature.'
      ],
      suggestions: [
        'Dashboard tour',
        'Feature guide',
        'Quick navigation',
        'Search help',
        'Menu overview',
        'Shortcuts'
      ]
    },

    platform_help: {
      patterns: [
        'how to use', 'help', 'tutorial', 'guide', 'instructions', 'getting started',
        'platform help', 'user guide', 'how does this work', 'need help',
        'assistance', 'support'
      ],
      responses: [
        'I\'ll provide comprehensive platform guidance!',
        'Let me walk you through LegalVault features.',
        'I\'m here to help you master the platform!'
      ],
      suggestions: [
        'Getting started',
        'Feature tutorials',
        'User guide',
        'Video tutorials',
        'FAQ',
        'Contact support'
      ]
    },

    law_search: {
      patterns: [
        'section', 'ipc', 'cpc', 'crpc', 'law', 'legal section', 'find law', 
        'search law', 'indian penal code', 'criminal procedure', 'civil procedure',
        'constitution', 'article', 'legal provision', 'statute'
      ],
      responses: [
        'I can help you find specific legal sections and provisions!',
        'Searching comprehensive legal databases for you...',
        'Accessing Indian legal statutes and sections...'
      ],
      suggestions: [
        'IPC sections',
        'CrPC provisions',
        'Constitutional articles',
        'Recent amendments',
        'Legal definitions',
        'Case law'
      ]
    },

    complaint: {
      patterns: [
        'not working', 'error', 'problem', 'issue', 'bug', 'broken', 'slow',
        'trouble', 'difficulty', 'malfunction', 'glitch', 'fault'
      ],
      responses: [
        'I understand you\'re experiencing an issue. Let me help resolve it.',
        'I\'m here to help troubleshoot any problems you\'re facing.',
        'Let\'s work together to solve this technical issue.'
      ],
      suggestions: [
        'Technical support',
        'Report bug',
        'Clear cache',
        'Refresh page',
        'Contact admin',
        'Help docs'
      ]
    },

    compliment: {
      patterns: [
        'good job', 'well done', 'excellent', 'amazing', 'great work', 'you\'re helpful',
        'fantastic', 'brilliant', 'awesome', 'wonderful', 'impressive'
      ],
      responses: [
        'Thank you! I\'m glad I could help. Is there anything else you need?',
        'I appreciate your kind words! How else can I assist you?',
        'That\'s very encouraging! What other legal matters can I help with?'
      ],
      suggestions: [
        'Rate experience',
        'Share feedback',
        'Explore features',
        'Ask more questions',
        'Legal tips',
        'Platform tour'
      ]
    },

    small_talk: {
      patterns: [
        'tell me a joke', 'are you real', 'what can you do', 'who made you', 
        'what is your name', 'tell me about yourself', 'what are your capabilities'
      ],
      responses: [
        'I\'m LegalVault AI Assistant, designed to help with legal matters and platform navigation.',
        'I\'m an AI specialized in Indian law and legal assistance. How can I help you today?',
        'I\'m your legal AI companion, here to make law accessible and understandable.'
      ],
      suggestions: [
        'My capabilities',
        'Legal expertise',
        'Platform features',
        'Ask legal question',
        'Get started',
        'Legal resources'
      ]
    },

    file_case: {
      patterns: [
        'file a case', 'file case', 'new case', 'create case', 'register case',
        'submit case', 'case filing', 'legal case filing', 'start case'
      ],
      responses: [
        'I\'ll guide you through the case filing process step by step.',
        'Let me help you create and file a new legal case.',
        'I\'ll walk you through case registration procedures.'
      ],
      suggestions: [
        'Case filing guide',
        'Required documents',
        'Filing fees',
        'Court selection',
        'Legal grounds',
        'Expert consultation'
      ]
    },

    kyc_verification: {
      patterns: [
        'kyc', 'kyc verification', 'verify identity', 'identity verification',
        'document verification', 'account verification', 'kyc status'
      ],
      responses: [
        'I can help you with KYC verification process and status.',
        'Let me assist you with identity verification requirements.',
        'I\'ll guide you through account verification steps.'
      ],
      suggestions: [
        'KYC status',
        'Upload documents',
        'Verification guide',
        'Required docs',
        'Support contact',
        'Verification timeline'
      ]
    },

    legal_rights: {
      patterns: [
        'my rights', 'legal rights', 'fundamental rights', 'constitutional rights',
        'citizen rights', 'human rights', 'rights and duties'
      ],
      responses: [
        'I\'ll explain your fundamental and legal rights comprehensively.',
        'Let me outline your constitutional and legal protections.',
        'I can help you understand your rights and how to exercise them.'
      ],
      suggestions: [
        'Fundamental rights',
        'Legal protections',
        'Rights violations',
        'Remedies available',
        'Constitutional law',
        'Citizen duties'
      ]
    }
  },

  // Entity recognition patterns
  entities: {
    time: {
      patterns: ['today', 'tomorrow', 'yesterday', 'this week', 'next week', 'last week',
                'this month', 'next month', 'this year', 'morning', 'afternoon', 'evening', 'night'],
      type: 'temporal'
    },
    law_types: {
      patterns: ['ipc', 'cpc', 'crpc', 'constitution', 'evidence act', 'family law', 
                'criminal law', 'civil law', 'constitutional law', 'corporate law'],
      type: 'legal'
    },
    case_types: {
      patterns: ['criminal', 'civil', 'constitutional', 'family', 'property', 'commercial', 
                'labor', 'tax', 'environmental', 'cyber'],
      type: 'case_category'
    },
    urgency: {
      patterns: ['urgent', 'emergency', 'immediate', 'asap', 'quick', 'fast', 'priority', 'critical'],
      type: 'priority'
    },
    locations: {
      patterns: ['supreme court', 'high court', 'district court', 'delhi', 'mumbai', 
                'bangalore', 'chennai', 'kolkata', 'hyderabad'],
      type: 'location'
    },
    legal_documents: {
      patterns: ['fir', 'chargesheet', 'petition', 'appeal', 'affidavit', 'notice', 
                'agreement', 'contract', 'will', 'deed'],
      type: 'document'
    }
  },

  // Conversation context templates
  contextTemplates: {
    greeting_with_time: {
      morning: "Good morning! Ready to tackle legal challenges today?",
      afternoon: "Good afternoon! How can I assist with your legal matters?", 
      evening: "Good evening! What legal questions can I help resolve?"
    },
    role_based_greetings: {
      admin: "Welcome, Administrator! How can I assist with platform management?",
      lawyer: "Greetings, Counselor! Ready to assist with legal research and cases.",
      officer: "Hello, Officer! How can I help with investigations and evidence?",
      user: "Welcome! I'm here to help with your legal questions and platform navigation."
    },
    fallback_responses: {
      confused: "I want to help but didn't quite understand. Could you rephrase that?",
      partial_match: "I think I understand partially. Are you asking about {entity}?",
      no_match: "I'm here to help with legal matters. Try asking about laws, cases, or platform features.",
      technical_error: "I encountered a technical issue. Please try again or contact support."
    }
  },

  // Dynamic suggestion generators
  suggestionGenerators: {
    time_based: {
      morning: ['Legal news digest', 'Today\'s court schedule', 'Priority cases'],
      afternoon: ['Case updates', 'Legal research', 'Document review'],
      evening: ['Case summary', 'Tomorrow\'s preparation', 'Legal insights']
    },
    role_based: {
      admin: ['Platform analytics', 'User management', 'System monitoring', 'Reports'],
      lawyer: ['Case research', 'Legal precedents', 'Client management', 'Court filings'],
      officer: ['Evidence collection', 'Investigation tools', 'Case updates', 'Reports'],
      user: ['Legal guidance', 'Platform help', 'Document upload', 'News updates']
    },
    context_based: {
      first_visit: ['Platform tour', 'Getting started', 'Key features', 'Help center'],
      return_user: ['Recent activity', 'Pending items', 'Updates', 'Continue work'],
      frequent_user: ['Advanced features', 'Shortcuts', 'New capabilities', 'Expert tips']
    }
  },

  // Response enhancement patterns
  responseEnhancers: {
    empathy_phrases: [
      "I understand this is important to you.",
      "Let me help you with this matter.",
      "I can see why you'd need this information.",
      "This is definitely something I can assist with."
    ],
    confidence_builders: [
      "Based on current legal provisions...",
      "According to established procedures...",
      "The latest legal updates indicate...",
      "Our secure platform ensures..."
    ],
    call_to_action: [
      "Would you like me to guide you through this?",
      "Shall I provide more detailed information?",
      "Do you need help with the next steps?",
      "Can I assist you with anything else related to this?"
    ]
  },

  // Navigation guides and tutorials
  navigationGuides: {
    dashboard: {
      title: "Dashboard Navigation Guide",
      sections: [
        "Quick Stats Overview",
        "Recent Activity Feed", 
        "Notification Center",
        "Search Functionality",
        "Quick Actions Panel"
      ],
      tips: [
        "Customize your dashboard layout",
        "Set up notification preferences",
        "Use quick search for instant access",
        "Bookmark frequently used features"
      ]
    },
    cases: {
      title: "Case Management System",
      sections: [
        "Case List and Filters",
        "Case Details View",
        "Document Management",
        "Timeline Tracking",
        "Status Updates"
      ],
      tips: [
        "Use advanced filters for better case organization",
        "Set up automated status notifications",
        "Maintain comprehensive case documentation",
        "Regular timeline updates improve tracking"
      ]
    },
    evidence: {
      title: "Digital Evidence Platform",
      sections: [
        "Secure Upload System",
        "Blockchain Verification",
        "Evidence Categorization",
        "Access Control Management",
        "Chain of Custody Tracking"
      ],
      tips: [
        "Always verify evidence integrity",
        "Properly categorize for easy retrieval",
        "Maintain detailed metadata",
        "Regular backup ensures security"
      ]
    }
  }
};

// Utility functions for NLP processing
const nlpUtils = {
  // Calculate confidence score for intent matching
  calculateConfidence: (message, pattern, allPatterns) => {
    let confidence = 0.6; // Base confidence
    
    const messageLower = message.toLowerCase();
    const patternLower = pattern.toLowerCase();
    
    // Exact match gets highest confidence
    if (messageLower === patternLower) return 0.95;
    
    // Contains full pattern
    if (messageLower.includes(patternLower)) confidence += 0.2;
    
    // Word count similarity
    const messageWords = messageLower.split(' ').length;
    const patternWords = patternLower.split(' ').length;
    if (Math.abs(messageWords - patternWords) <= 1) confidence += 0.1;
    
    // Additional pattern matches in same intent
    const additionalMatches = allPatterns.filter(p => 
      p !== pattern && messageLower.includes(p.toLowerCase())
    ).length;
    confidence += additionalMatches * 0.05;
    
    return Math.min(confidence, 0.95);
  },

  // Extract entities from user message
  extractEntities: (message) => {
    const messageLower = message.toLowerCase();
    const extractedEntities = {};
    
    Object.entries(nlpModel.entities).forEach(([entityType, entityData]) => {
      entityData.patterns.forEach(pattern => {
        if (messageLower.includes(pattern.toLowerCase())) {
          if (!extractedEntities[entityType]) {
            extractedEntities[entityType] = [];
          }
          extractedEntities[entityType].push(pattern);
        }
      });
    });
    
    return extractedEntities;
  },

  // Generate dynamic suggestions based on context
  generateDynamicSuggestions: (intent, userRole, timeOfDay, entities = {}, conversationHistory = []) => {
    const suggestions = [];
    
    // Add intent-specific suggestions
    if (nlpModel.intents[intent] && nlpModel.intents[intent].suggestions) {
      suggestions.push(...nlpModel.intents[intent].suggestions);
    }
    
    // Add role-based suggestions
    if (nlpModel.suggestionGenerators.role_based[userRole]) {
      suggestions.push(...nlpModel.suggestionGenerators.role_based[userRole].slice(0, 2));
    }
    
    // Add time-based suggestions
    const timeKey = timeOfDay < 12 ? 'morning' : timeOfDay < 17 ? 'afternoon' : 'evening';
    if (nlpModel.suggestionGenerators.time_based[timeKey]) {
      suggestions.push(...nlpModel.suggestionGenerators.time_based[timeKey].slice(0, 1));
    }
    
    // Add entity-based suggestions (with null checks)
    if (entities && entities.law_types) {
      suggestions.push('Legal section search', 'Recent amendments');
    }
    if (entities && entities.urgency) {
      suggestions.push('Priority support', 'Emergency contacts');
    }
    
    // Remove duplicates and limit to 6 suggestions
    return [...new Set(suggestions)].slice(0, 6);
  },

  // Enhance response with context
  enhanceResponse: (baseResponse, entities, userRole, confidence) => {
    let enhancedResponse = baseResponse;
    
    // Add empathy if urgency detected
    if (entities.urgency && confidence > 0.7) {
      const empathyPhrase = nlpModel.responseEnhancers.empathy_phrases[
        Math.floor(Math.random() * nlpModel.responseEnhancers.empathy_phrases.length)
      ];
      enhancedResponse = `${empathyPhrase} ${enhancedResponse}`;
    }
    
    // Add confidence building for legal queries
    if (entities.law_types && confidence > 0.8) {
      const confidencePhrase = nlpModel.responseEnhancers.confidence_builders[
        Math.floor(Math.random() * nlpModel.responseEnhancers.confidence_builders.length)
      ];
      enhancedResponse += `\n\n${confidencePhrase}`;
    }
    
    // Add call to action for lower confidence responses
    if (confidence < 0.7) {
      const ctaPhrase = nlpModel.responseEnhancers.call_to_action[
        Math.floor(Math.random() * nlpModel.responseEnhancers.call_to_action.length)
      ];
      enhancedResponse += `\n\n${ctaPhrase}`;
    }
    
    return enhancedResponse;
  }
};

module.exports = {
  nlpModel,
  nlpUtils
};