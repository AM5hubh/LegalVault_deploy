// Legal Query Controller - Handles law sections, crimes, punishments, and legal procedures
const { legalDatabase } = require('./legalChatbotController');
const { generalLegalNLP, generalLegalUtils } = require('../../models/NLPmodels/generalLegalNLP');
const { advancedLegalNLP, advancedLegalUtils } = require('../../models/NLPmodels/advancedLegalNLP');
const fetch = require('node-fetch');

// Comprehensive legal knowledge base for detailed responses
const legalKnowledgeBase = {
    // IPC Sections with detailed information
    ipcSections: {
        '420': {
            title: 'Cheating and dishonestly inducing delivery of property',
            description: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.',
            punishment: 'Imprisonment up to 7 years + fine',
            cognizable: true,
            bailable: false,
            examples: ['Online fraud', 'Credit card fraud', 'Investment scams', 'Identity theft']
        },
        '498A': {
            title: 'Husband or relative of husband subjecting a woman to cruelty',
            description: 'Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty shall be punished with imprisonment for a term which may extend to three years and shall also be liable to fine.',
            punishment: 'Imprisonment up to 3 years + fine',
            cognizable: true,
            bailable: false,
            examples: ['Dowry harassment', 'Domestic violence', 'Mental cruelty', 'Physical abuse']
        },
        '302': {
            title: 'Punishment for murder',
            description: 'Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.',
            punishment: 'Death penalty or life imprisonment + fine',
            cognizable: true,
            bailable: false,
            examples: ['Intentional killing', 'Premeditated murder', 'Murder with motive']
        }
    },

    // Legal procedures and processes
    procedures: {
        fir: {
            title: 'First Information Report (FIR)',
            process: [
                'Visit the nearest police station',
                'Provide detailed information about the incident',
                'Ensure all facts are recorded accurately',
                'Get a copy of the FIR with number',
                'Follow up on the investigation'
            ],
            requirements: ['Valid ID proof', 'Details of incident', 'Evidence if available', 'Witness information'],
            tips: ['Be clear and specific', 'Don\'t sign blank papers', 'Keep FIR copy safe', 'Note FIR number']
        },
        bail: {
            title: 'Bail Application Process',
            types: ['Regular Bail', 'Anticipatory Bail', 'Interim Bail', 'Default Bail'],
            process: [
                'File bail application in appropriate court',
                'Submit required documents and sureties',
                'Attend bail hearing',
                'Comply with bail conditions if granted'
            ],
            requirements: ['Bail application', 'Surety documents', 'Property papers', 'Character certificate']
        }
    },

    // Rights and legal awareness
    rights: {
        arrest: [
            'Right to know reason for arrest',
            'Right to legal representation',
            'Right to inform family/friends',
            'Right against self-incrimination',
            'Right to medical examination',
            'Right to be produced before magistrate within 24 hours'
        ],
        fundamental: [
            'Right to Equality (Article 14)',
            'Right to Freedom (Article 19)',
            'Right to Life and Liberty (Article 21)',
            'Right to Education (Article 21A)',
            'Right against Exploitation (Article 23-24)',
            'Right to Freedom of Religion (Article 25-28)'
        ]
    }
};

// Handle case filing queries with comprehensive guidance
const handleCaseFilingQuery = async (message, entities, userData) => {
    console.log('📋 Processing case filing query:', { message, entities });
    
    const caseType = detectCaseType(message);
    const jurisdiction = entities.location || 'general';
    const urgency = detectUrgency(message);
    
    const response = `📋 **Complete Case Filing Guide**

${urgency === 'emergency' ? '🚨 **Emergency Filing Process:**\n' : ''}

**📝 Step-by-Step Filing Process:**

**1. 🎯 Determine Case Type**
${getCaseTypeGuidance(caseType)}

**2. 📄 Required Documents**
• Petition/Plaint with proper format
• Identity proof (Aadhar, PAN, Passport)
• Address proof (Latest utility bill)
• Relevant evidence (contracts, photos, receipts)
• Witness statements (if applicable)
• Power of attorney (if filing through advocate)

**3. 💰 Court Fees Structure**
• Civil cases: ₹500 - ₹50,000 (based on claim value)
• Criminal complaints: ₹100 - ₹500
• Family court matters: ₹200 - ₹1,000
• Consumer court: ₹500 - ₹5,000
${userData.role === 'admin' || userData.role === 'lawyer' ? '• Fee exemption available for poor litigants' : ''}

**4. 🏛️ Filing Process**
• Visit appropriate court registry
• Submit documents with prescribed fees
• Get case number and next hearing date
• Serve notice to opposite party (civil cases)
• Attend all scheduled hearings

**5. ⚖️ Court Hierarchy & Jurisdiction**
• **Magistrate Court:** Criminal cases, small disputes
• **District Court:** Civil suits, appeals from lower courts  
• **High Court:** Constitutional matters, major cases
• **Supreme Court:** Final appeals, constitutional issues

**🎯 Immediate Action Steps:**
1. **Consult a lawyer** for legal strategy
2. **Gather evidence** systematically
3. **Prepare proper documentation**
4. **Calculate court fees** accurately
5. **File within limitation period**

**📞 Emergency Contacts:**
• Legal Aid: 15100
• Consumer Helpline: 1800-11-4000
• Women Helpline: 1091

${getSpecificGuidance(caseType, userData.role)}

**💡 Pro Tips:**
• Keep multiple copies of all documents
• Maintain a case diary with all proceedings
• Never miss court dates - can lead to dismissal
• Follow proper court etiquette and dress code

Need help with specific case type or documents?`;

    return {
        response: response,
        suggestions: [
            'Documents needed for civil case',
            'Criminal complaint process',
            'Court fees calculator',
            'Find nearest court',
            'Legal aid eligibility',
            'Lawyer consultation guide'
        ],
        additionalData: {
            caseType: caseType,
            urgency: urgency,
            jurisdiction: jurisdiction
        }
    };
};

// Detect what type of case the user wants to file
const detectCaseType = (message) => {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('civil') || messageLower.includes('property') || messageLower.includes('contract')) {
        return 'civil';
    } else if (messageLower.includes('criminal') || messageLower.includes('fir') || messageLower.includes('complaint')) {
        return 'criminal';
    } else if (messageLower.includes('divorce') || messageLower.includes('marriage') || messageLower.includes('family')) {
        return 'family';
    } else if (messageLower.includes('consumer') || messageLower.includes('deficiency')) {
        return 'consumer';
    } else if (messageLower.includes('labour') || messageLower.includes('employment')) {
        return 'labour';
    }
    return 'general';
};

// Detect urgency level
const detectUrgency = (message) => {
    const messageLower = message.toLowerCase();
    const urgentKeywords = ['urgent', 'emergency', 'immediate', 'asap', 'quickly'];
    return urgentKeywords.some(keyword => messageLower.includes(keyword)) ? 'emergency' : 'normal';
};

// Get case type specific guidance
const getCaseTypeGuidance = (caseType) => {
    const guidance = {
        civil: `**Civil Case Filing:**
• Money recovery, property disputes, contract breaches
• File in District Court or appropriate jurisdiction
• Requires detailed pleadings and evidence`,
        
        criminal: `**Criminal Case Filing:**
• File FIR for cognizable offenses
• Private complaint for non-cognizable offenses  
• Magistrate court for most criminal matters`,
        
        family: `**Family Court Matters:**
• Divorce, maintenance, child custody
• Mediation often attempted first
• Family court has special procedures`,
        
        consumer: `**Consumer Court Filing:**
• Deficiency in goods/services
• Three-tier system based on claim value
• Simpler procedures, minimal court fees`,
        
        labour: `**Labour Court Matters:**
• Employment disputes, wage claims
• Industrial tribunals for specific matters
• Conciliation often tried first`,
        
        general: `**General Case Filing:**
• Identify correct case type first
• Choose appropriate court and jurisdiction
• Follow specific procedural requirements`
    };
    
    return guidance[caseType] || guidance.general;
};

// Get role-specific guidance
const getSpecificGuidance = (caseType, userRole) => {
    if (userRole === 'lawyer') {
        return `**👨‍💼 Lawyer Resources:**
• Draft pleadings using standard formats
• Calculate court fees accurately
• Ensure proper service of process
• Maintain client communication records`;
    } else if (userRole === 'judge') {
        return `**⚖️ Judicial Reference:**
• Ensure proper jurisdiction before accepting cases
• Check for court fee compliance
• Verify document authenticity
• Follow case management guidelines`;
    } else {
        return `**👤 Self-Representation Tips:**
• Consider hiring a lawyer for complex cases
• Use court-approved formats for documents  
• Seek legal aid if financially eligible
• Attend court orientation if available`;
    }
};

// Handle legal section queries with detailed responses
const handleLegalSectionQuery = async (message, entities, userData) => {
    console.log('🔍 Processing legal section query:', { message, entities });
    
    // Extract section and law information
    const section = entities.section || extractSectionFromMessage(message);
    const law = entities.law || extractLawFromMessage(message);
    
    if (section && law) {
        return await getDetailedSectionInfo(section, law, userData);
    } else if (section) {
        return await searchSectionAcrossLaws(section, userData);
    } else {
        return await searchLegalContent(message, userData);
    }
};

// Get detailed information about a specific section
const getDetailedSectionInfo = async (section, law, userData) => {
    const lawType = normalizeLawType(law);
    
    // Check if we have detailed info in knowledge base
    if (lawType === 'ipc' && legalKnowledgeBase.ipcSections[section]) {
        const sectionInfo = legalKnowledgeBase.ipcSections[section];
        
        return {
            response: `📖 **IPC Section ${section}**

**${sectionInfo.title}**

**Description:**
${sectionInfo.description}

**Punishment:** ${sectionInfo.punishment}
**Cognizable:** ${sectionInfo.cognizable ? 'Yes' : 'No'}
**Bailable:** ${sectionInfo.bailable ? 'Yes' : 'No'}

**Common Examples:**
${sectionInfo.examples.map(ex => `• ${ex}`).join('\n')}

**Legal Advice:** ${userData.role === 'user' ? 'Consult a qualified lawyer for specific legal advice regarding your situation.' : 'This section is commonly used in cases involving fraud and deception.'}`,
            
            suggestions: [
                'Related IPC sections',
                'Case precedents',
                'How to file complaint',
                'Legal remedies available',
                'Lawyer consultation',
                'Court procedures'
            ]
        };
    }
    
    // Fallback to database search
    const sectionData = searchInLegalDatabase(lawType, section);
    if (sectionData) {
        return formatDatabaseSectionResponse(sectionData, lawType, section);
    }
    
    return {
        response: `I couldn't find specific details for ${law.toUpperCase()} Section ${section}. Let me search for general information about this topic.`,
        suggestions: ['Search legal database', 'Contact legal expert', 'General legal help']
    };
};

// Handle crime and punishment queries
const handleCrimePunishmentQuery = async (message, entities, userData) => {
    console.log('⚖️ Processing crime/punishment query:', { message, entities });
    
    const crime = entities.crime || extractCrimeFromMessage(message);
    
    if (crime) {
        return await getCrimeDetails(crime, userData);
    }
    
    // General punishment query
    return await getGeneralPunishmentInfo(message, userData);
};

// Get detailed crime information
const getCrimeDetails = async (crime, userData) => {
    const crimeInfo = {
        'theft': {
            sections: ['IPC 378', 'IPC 379', 'IPC 380'],
            definition: 'Dishonest taking of movable property without consent',
            punishment: 'Imprisonment up to 3 years or fine or both',
            procedure: 'File FIR → Investigation → Chargesheet → Trial → Judgment'
        },
        'fraud': {
            sections: ['IPC 420', 'IPC 415'],
            definition: 'Deceiving someone to gain unfair advantage',
            punishment: 'Imprisonment up to 7 years + fine',
            procedure: 'Complaint → FIR → Investigation → Court proceedings'
        },
        'cybercrime': {
            sections: ['IT Act 66', 'IT Act 67', 'IPC 420'],
            definition: 'Crimes involving computers and internet',
            punishment: 'Varies based on offense - up to 3 years + fine',
            procedure: 'Cyber cell complaint → Investigation → Legal action'
        }
    };
    
    const info = crimeInfo[crime.toLowerCase()];
    
    if (info) {
        return {
            response: `🚨 **${crime.charAt(0).toUpperCase() + crime.slice(1)} - Legal Information**

**Definition:** ${info.definition}

**Applicable Laws:** ${info.sections.join(', ')}

**Punishment:** ${info.punishment}

**Legal Procedure:**
${info.procedure.split(' → ').map((step, i) => `${i + 1}. ${step}`).join('\n')}

**What to do if you're a victim:**
• Gather evidence and documentation
• File complaint with police
• Consult with a lawyer
• Cooperate with investigation

**Legal Rights:** You have the right to legal representation and fair trial.`,
            
            suggestions: [
                'File complaint procedure',
                'Find lawyer specializing in this area',
                'Evidence collection guide',
                'Court procedure timeline',
                'Legal aid options'
            ]
        };
    }
    
    return await getGeneralPunishmentInfo(`punishment for ${crime}`, userData);
};

// Handle legal rights queries
const handleLegalRightsQuery = async (message, entities, userData) => {
    console.log('⚖️ Processing legal rights query:', { message, entities });
    
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('arrest') || messageLower.includes('custody')) {
        return {
            response: `🛡️ **Your Rights During Arrest**

**Fundamental Rights:**
${legalKnowledgeBase.rights.arrest.map((right, i) => `${i + 1}. ${right}`).join('\n')}

**Important Points:**
• Police must inform you of charges
• You cannot be detained beyond 24 hours without magistrate order
• You have right to remain silent
• Confession under police custody is not admissible in court

**Emergency Contacts:**
• Legal Aid Helpline: 15100
• Human Rights Commission: 1091
• Police Control Room: 100

**What to Remember:**
- Stay calm and cooperate
- Don't resist arrest
- Ask for lawyer immediately
- Inform family/friends about arrest`,
            
            suggestions: [
                'Bail application process',
                'Legal aid services',
                'Police complaint procedure',
                'Court representation',
                'Emergency legal contacts'
            ]
        };
    }
    
    if (messageLower.includes('fundamental') || messageLower.includes('constitutional')) {
        return {
            response: `🏛️ **Fundamental Rights Under Indian Constitution**

${legalKnowledgeBase.rights.fundamental.map((right, i) => `**${i + 1}. ${right}**`).join('\n\n')}

**Key Protections:**
• Equality before law
• Freedom of speech and expression
• Protection of life and personal liberty
• Right to education
• Protection from discrimination
• Religious freedom

**Enforcement:**
These rights are enforceable by courts. You can directly approach High Court or Supreme Court if these rights are violated.

**Remedies Available:**
• Writ petitions (Habeas Corpus, Mandamus, etc.)
• Constitutional remedies
• Legal compensation`,
            
            suggestions: [
                'How to file writ petition',
                'Constitutional remedies',
                'Human rights violations',
                'Legal aid for rights protection',
                'Supreme Court procedures'
            ]
        };
    }
    
    return getGeneralRightsInfo(message, userData);
};

// Handle general legal help queries
const handleGeneralLegalHelp = async (message, entities, userData) => {
    console.log('💼 Processing general legal help query:', { message, entities });
    
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('lawyer') && messageLower.includes('near')) {
        return {
            response: `👨‍⚖️ **Finding a Lawyer Near You**

**Ways to Find Lawyers:**
1. **Bar Council Directory** - Official lawyer registry
2. **Legal Aid Services** - Free legal assistance
3. **Court Complex** - Practicing lawyers available
4. **Legal Service Authority** - Government legal aid
5. **Online Platforms** - Verified lawyer directories

**What to Check:**
✅ Bar Council registration
✅ Specialization in your case type
✅ Experience and track record
✅ Fee structure and payment terms
✅ Reviews and recommendations

**Free Legal Aid Eligibility:**
• Annual income below ₹9,000 (rural) / ₹12,000 (urban)
• SC/ST, women, children, disabled persons
• Natural disaster victims
• Industrial workers

**Contact Legal Aid:**
• National Legal Services Authority: 1800-258-8866
• State Legal Services Authority: [Varies by state]`,
            
            suggestions: [
                'Bar Council verification',
                'Free legal aid application',
                'Lawyer consultation rates',
                'Legal service authorities',
                'Court duty lawyers'
            ]
        };
    }
    
    if (messageLower.includes('police complaint') || messageLower.includes('fir')) {
        return getLegalProcedureInfo('fir', userData);
    }
    
    if (messageLower.includes('legal notice')) {
        return {
            response: `📋 **What to Do When You Receive a Legal Notice**

**Immediate Steps:**
1. **Don't Panic** - Read the notice carefully
2. **Check Authenticity** - Verify sender's credentials
3. **Note Timeline** - Check response deadline
4. **Preserve Original** - Keep safe copy
5. **Consult Lawyer** - Get professional advice immediately

**Key Information to Check:**
• Sender's name and address
• Legal basis for the notice
• Specific demands or allegations
• Timeline for response
• Consequences mentioned

**Types of Legal Notices:**
• Defamation notice
• Recovery notice
• Termination notice
• Cease and desist notice
• Pre-litigation notice

**Response Options:**
• Reply through lawyer
• Negotiate settlement
• Ignore (not recommended)
• Counter-notice if false claims

**Don't:** Sign any documents or make payments without legal advice.`,
            
            suggestions: [
                'Lawyer consultation for notice',
                'How to reply to legal notice',
                'Settlement negotiation',
                'Court case procedures',
                'Legal notice templates'
            ]
        };
    }
    
    return getGeneralLegalInfo(message, userData);
};

// Utility functions

// Extract section number from message
const extractSectionFromMessage = (message) => {
    const sectionMatch = message.match(/(?:section\s+)?(\d+[a-z]?)/i);
    return sectionMatch ? sectionMatch[1] : null;
};

// Extract law type from message
const extractLawFromMessage = (message) => {
    const lawMatch = message.match(/(ipc|cpc|crpc|hma|iea|mva|ida|nia)/i);
    return lawMatch ? lawMatch[1] : null;
};

// Extract crime type from message
const extractCrimeFromMessage = (message) => {
    const crimes = ['theft', 'murder', 'fraud', 'rape', 'dowry', 'cybercrime', 'cheating', 'assault'];
    const messageLower = message.toLowerCase();
    
    for (const crime of crimes) {
        if (messageLower.includes(crime)) {
            return crime;
        }
    }
    return null;
};

// Normalize law type
const normalizeLawType = (law) => {
    const lawMap = {
        'ipc': 'ipc',
        'indian penal code': 'ipc',
        'cpc': 'cpc',
        'civil procedure': 'cpc',
        'crpc': 'crpc',
        'criminal procedure': 'crpc'
    };
    
    return lawMap[law.toLowerCase()] || law.toLowerCase();
};

// Search in legal database
const searchInLegalDatabase = (lawType, section) => {
    if (!legalDatabase[lawType]) return null;
    
    const possibleKeys = [
        `section_${section}`,
        section,
        `${section}`
    ];
    
    for (const key of possibleKeys) {
        if (legalDatabase[lawType][key]) {
            return legalDatabase[lawType][key];
        }
    }
    
    return null;
};

// Format database section response
const formatDatabaseSectionResponse = (sectionData, lawType, section) => {
    return {
        response: `📖 **${lawType.toUpperCase()} Section ${section}**

**${sectionData.title || 'Legal Provision'}**

${sectionData.description || sectionData.text || sectionData.content || 'Section details available in legal database.'}

${sectionData.punishment ? `**Punishment:** ${sectionData.punishment}` : ''}
${sectionData.cognizable !== undefined ? `**Cognizable:** ${sectionData.cognizable}` : ''}
${sectionData.bailable !== undefined ? `**Bailable:** ${sectionData.bailable}` : ''}`,
        
        suggestions: [
            'Related sections',
            'Legal procedures',
            'Case examples',
            'Lawyer consultation',
            'Court filing'
        ]
    };
};

// Get legal procedure information
const getLegalProcedureInfo = (procedure, userData) => {
    const procedureInfo = legalKnowledgeBase.procedures[procedure];
    
    if (procedureInfo) {
        return {
            response: `📋 **${procedureInfo.title}**

**Process:**
${procedureInfo.process.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**Requirements:**
${procedureInfo.requirements.map(req => `• ${req}`).join('\n')}

**Important Tips:**
${procedureInfo.tips.map(tip => `• ${tip}`).join('\n')}

**Legal Advice:** Ensure all information is accurate and complete. Consult a lawyer if you need assistance with the process.`,
            
            suggestions: [
                'Document requirements',
                'Procedure timeline',
                'Legal assistance',
                'Follow-up process',
                'Rights during procedure'
            ]
        };
    }
    
    return {
        response: `I can help you with legal procedures. Please specify what type of procedure you need assistance with.`,
        suggestions: [
            'FIR filing procedure',
            'Bail application process',
            'Court case filing',
            'Legal documentation',
            'Lawyer consultation'
        ]
    };
};

// Fallback functions for general queries
const getGeneralLegalInfo = (message, userData) => {
    return {
        response: `I'm here to help with legal matters. Based on your query "${message}", I can provide information about:

• **Legal procedures and processes**
• **Laws and legal sections**
• **Your legal rights and protections**
• **Court procedures and documentation**
• **Legal consultation guidance**

Please ask a more specific question, and I'll provide detailed information.`,
        
        suggestions: generalLegalUtils.getAllLegalSuggestions()['General Legal Help']
    };
};

const getGeneralRightsInfo = (message, userData) => {
    return {
        response: `**Legal Rights Information**

I can help you understand your legal rights in various situations:

• **Constitutional and Fundamental Rights**
• **Rights during arrest and police custody**
• **Rights in family and civil matters**
• **Consumer rights and protections**
• **Women's rights and child rights**
• **Employment and labor rights**

What specific rights would you like to know about?`,
        
        suggestions: generalLegalUtils.getAllLegalSuggestions()['Rights and Awareness']
    };
};

const getGeneralPunishmentInfo = (message, userData) => {
    return {
        response: `**Legal Consequences and Punishments**

I can provide information about:

• **Punishments under various laws (IPC, Special Acts)**
• **Criminal vs. Civil consequences**
• **Bail and legal procedures**
• **Rights of accused and victims**
• **Legal remedies and appeals**

Please specify the particular offense or legal issue you want to know about.`,
        
        suggestions: generalLegalUtils.getAllLegalSuggestions()['Laws and Crimes']
    };
};

const searchLegalContent = async (message, userData) => {
    // Implement content search across legal database
    const keywords = message.toLowerCase().split(' ').filter(word => word.length > 3);
    // This would search across the legal database
    // For now, return a helpful response
    
    return {
        response: `I'm searching for legal information related to "${message}". Here are some ways I can help:

• **Search specific law sections** (e.g., "IPC Section 420")
• **Explain legal procedures** (e.g., "How to file FIR")
• **Provide rights information** (e.g., "Rights during arrest")
• **Guide through legal processes** (e.g., "Bail application process")

Try asking a more specific legal question.`,
        
        suggestions: [
            'IPC Section 420',
            'How to file FIR',
            'Rights during arrest',
            'Bail application process',
            'Legal aid services',
            'Court procedures'
        ]
    };
};

const searchSectionAcrossLaws = async (section, userData) => {
    // Search for section across all laws
    const results = [];
    
    Object.entries(legalDatabase).forEach(([lawType, lawData]) => {
        const sectionData = searchInLegalDatabase(lawType, section);
        if (sectionData) {
            results.push({
                law: lawType.toUpperCase(),
                section: section,
                data: sectionData
            });
        }
    });
    
    if (results.length > 0) {
        let response = `📚 **Section ${section} found in multiple laws:**\n\n`;
        
        results.forEach((result, index) => {
            response += `**${index + 1}. ${result.law} Section ${result.section}**\n`;
            response += `${(result.data.title || result.data.description || 'Legal provision').substring(0, 150)}...\n\n`;
        });
        
        return {
            response: response,
            suggestions: [
                `${results[0].law} Section ${section} details`,
                'Compare sections across laws',
                'Legal procedures',
                'Related sections'
            ]
        };
    }
    
    return {
        response: `Section ${section} not found in our legal database. Please verify the section number or try searching with the specific law (e.g., "IPC Section ${section}").`,
        suggestions: [
            `IPC Section ${section}`,
            `CPC Section ${section}`,
            `CrPC Section ${section}`,
            'Legal database search'
        ]
    };
};

// Main request handler for routing legal queries
async function handleLegalQueryRequest(req) {
    const { message, intent, entities, userData } = req.body;
    
    console.log('⚖️ Legal Query Controller Processing:', { intent, message });
    
    try {
        let response, suggestions, additionalData;
        
        switch (intent) {
            case 'file_case_query':
            case 'case_filing':
                const caseResult = await handleCaseFilingQuery(message, entities, userData);
                response = caseResult.response;
                suggestions = caseResult.suggestions;
                additionalData = caseResult.additionalData;
                break;
                
            case 'law_section_query':
            case 'section_query':
                const sectionResult = await handleLegalSectionQuery(message, entities, userData);
                response = sectionResult.response;
                suggestions = sectionResult.suggestions;
                additionalData = sectionResult.additionalData;
                break;
                
            case 'crime_punishment_query':
                const crimeResult = await handleCrimePunishmentQuery(message, entities, userData);
                response = crimeResult.response;
                suggestions = crimeResult.suggestions;
                additionalData = crimeResult.additionalData;
                break;
                
            case 'legal_rights_query':
                const rightsResult = await handleLegalRightsQuery(message, entities, userData);
                response = rightsResult.response;
                suggestions = rightsResult.suggestions;
                additionalData = rightsResult.additionalData;
                break;
                
            default:
                const generalResult = await handleGeneralLegalHelp(message, userData);
                response = generalResult.response;
                suggestions = generalResult.suggestions;
                additionalData = generalResult.additionalData;
        }
        
        return {
            response: response,
            suggestions: suggestions || [
                'More legal sections',
                'Explain legal procedure',
                'Related laws',
                'Legal rights info'
            ],
            additionalData: additionalData
        };
        
    } catch (error) {
        console.error('Legal Query Controller Error:', error);
        return {
            response: 'I encountered an issue processing your legal query. Please try again or contact support.',
            suggestions: ['Try again', 'Contact support', 'Legal help', 'General assistance']
        };
    }
}

module.exports = {
    handleCaseFilingQuery,
    handleLegalSectionQuery,
    handleCrimePunishmentQuery,
    handleLegalRightsQuery,
    handleGeneralLegalHelp,
    handleLegalQueryRequest,
    legalKnowledgeBase
};