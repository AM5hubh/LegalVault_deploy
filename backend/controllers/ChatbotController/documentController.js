// Document Services Controller - Handles legal document creation, templates, and procedures
const { advancedLegalNLP, advancedLegalUtils } = require('../../models/NLPmodels/advancedLegalNLP');

// Legal document templates and formats
const documentTemplates = {
    fir: {
        title: 'First Information Report (FIR)',
        format: `FIR NO: _________________ DATE: _________________
POLICE STATION: _____________________________________
DISTRICT: ___________________________________________

COMPLAINANT DETAILS:
Name: ______________________________________________
Father's/Husband's Name: ____________________________
Age: _______ Occupation: ____________________________
Address: ___________________________________________
___________________________________________________
Mobile No: __________ Email: _______________________

INCIDENT DETAILS:
Date of Incident: ___________________________________
Time of Incident: ___________________________________
Place of Incident: __________________________________

DESCRIPTION OF INCIDENT:
___________________________________________________
___________________________________________________
___________________________________________________

ACCUSED PERSON(S) (if known):
Name: _____________________________________________
Address: __________________________________________

WITNESSES (if any):
1. Name: _________________ Mobile: _______________
2. Name: _________________ Mobile: _______________

LOSS/DAMAGE:
___________________________________________________

RELIEF SOUGHT:
___________________________________________________

I hereby declare that the above information is true to the best of my knowledge.

Signature of Complainant
Date: _____________ Place: _________________________`,
        
        instructions: [
            'Fill all details accurately and completely',
            'Mention exact date, time, and place of incident',
            'Provide clear description of what happened',
            'Include witness details if available',
            'Mention any loss or damage suffered',
            'Sign in front of police officer',
            'Keep a copy of filed FIR with you'
        ],
        
        requirements: [
            'Valid photo identification',
            'Address proof',
            'Any supporting documents/evidence',
            'Witness contact information (if available)'
        ]
    },

    affidavit: {
        title: 'General Affidavit',
        format: `AFFIDAVIT

I, _____________________________________________, 
Son/Daughter/Wife of ______________________________,
Aged _______ years, Resident of ___________________
___________________________________________________,
do hereby solemnly affirm and state as under:

1. That I am the deponent herein and I know the facts of this case.

2. That _______________________________________
___________________________________________________
___________________________________________________

3. That _______________________________________
___________________________________________________
___________________________________________________

4. That I have not filed any other petition/application relating to the same subject matter in any other Court/Forum.

5. That the statements made in paras 1 to 4 above are true to the best of my knowledge and belief and nothing has been concealed therein.

DEPONENT

VERIFICATION:
I, the above named deponent do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief and nothing material has been concealed or misstated therein.

Verified at _____________ on this _____ day of _______, 20__.

DEPONENT`,
        
        instructions: [
            'Fill personal details accurately',
            'State facts clearly and chronologically',
            'Number each paragraph properly',
            'Sign in front of notary/oath commissioner',
            'Get it notarized with proper stamp',
            'Carry original for court proceedings'
        ],
        
        requirements: [
            'Valid photo identification',
            'Address proof',
            'Notarization fees (usually ₹10-20)',
            'Supporting documents (if referenced)'
        ]
    },

    petition: {
        title: 'Court Petition Format',
        format: `IN THE COURT OF ________________________________

PETITION NO. _______ OF 20__

IN THE MATTER OF:
___________________________________________________

AND

IN THE MATTER OF:
___________________________________________________

                    ........................PETITIONER(S)
                            VERSUS
                    ........................RESPONDENT(S)

PETITION UNDER ____________________________________

TO,
THE HON'BLE COURT

THE HUMBLE PETITION OF THE PETITIONER(S) ABOVE NAMED MOST RESPECTFULLY SHEWETH:

1. That the petitioner(s) is/are ________________
___________________________________________________

2. That the facts of the case are ______________
___________________________________________________

3. That the petitioner(s) is/are aggrieved by ___
___________________________________________________

4. That the petitioner(s) has/have no other effective remedy except to approach this Hon'ble Court.

5. That the petitioner(s) has/have not filed any other petition relating to the same subject matter.

PRAYER:
In the premises, it is most respectfully prayed that this Hon'ble Court may be pleased to:

a) _______________________________________________
b) _______________________________________________
c) Pass such other order(s) as this Hon'ble Court may deem fit and proper.

AND FOR THIS ACT OF KINDNESS, THE PETITIONER(S) SHALL EVER PRAY.

                                    PETITIONER(S)

THROUGH: _______________________________________
            (Advocate for Petitioner)`,
        
        instructions: [
            'Specify correct court jurisdiction',
            'State facts chronologically and clearly',
            'Cite applicable laws and sections',
            'Mention specific relief sought',
            'Attach all supporting documents',
            'Sign through authorized advocate',
            'Pay required court fees'
        ],
        
        requirements: [
            'Court fee stamp',
            'Vakalatnama (if through advocate)',
            'Supporting documents',
            'Address for service',
            'Affidavit of truth'
        ]
    },

    bail_application: {
        title: 'Bail Application',
        format: `IN THE COURT OF ________________________________

BAIL APPLICATION NO. _______ OF 20__

                    ........................APPLICANT
                            VERSUS
                    STATE/COMPLAINANT...........RESPONDENT

APPLICATION FOR BAIL U/S 437/439 Cr.P.C.

TO,
THE HON'BLE COURT

THE HUMBLE APPLICATION OF THE APPLICANT ABOVE NAMED MOST RESPECTFULLY SHEWETH:

1. That the applicant has been arrested in FIR No. _____ dated _____ under Sections _______ at Police Station _______.

2. That the applicant is innocent and has been falsely implicated in the said case.

3. That the applicant is ready to furnish bail bond and surety as required by this Hon'ble Court.

4. That the applicant undertakes to:
   a) Not leave the jurisdiction without permission
   b) Not tamper with evidence or influence witnesses
   c) Cooperate with the investigation
   d) Appear before the Court as and when required

5. That the applicant has no criminal antecedents.

PRAYER:
It is therefore most respectfully prayed that this Hon'ble Court may be pleased to grant bail to the applicant on such terms and conditions as this Hon'ble Court may deem fit.

                                    APPLICANT

THROUGH: _______________________________________
            (Advocate for Applicant)`,
        
        instructions: [
            'File within reasonable time of arrest',
            'Mention FIR details accurately',
            'Provide surety details and documents',
            'Show strong roots in community',
            'Demonstrate no flight risk',
            'Comply with all conditions if granted'
        ],
        
        requirements: [
            'Surety documents (property papers/income proof)',
            'Character certificate',
            'Address proof',
            'Employment/business proof',
            'Passport size photographs'
        ]
    },

    legal_notice: {
        title: 'Legal Notice Format',
        format: `LEGAL NOTICE

TO:
Mr./Ms. _______________________________________
Address: ______________________________________
_____________________________________________

Sir/Madam,

SUBJECT: Legal Notice for _____________________

I, __________________________________________, 
through my advocate, do hereby serve upon you this Legal Notice and state as under:

1. That my client is ____________________________
_______________________________________________

2. That ______________________________________
_______________________________________________

3. That despite repeated requests, you have failed to _______________________________

4. That your act/omission has caused loss and damage to my client amounting to Rs. ______

5. That you are hereby called upon to ____________
within 15 days from the receipt of this notice, failing which my client shall be constrained to initiate appropriate legal proceedings against you for recovery of the said amount along with interest and costs.

Take Notice that if you fail to comply with the above, my client shall be free to take such legal action as advised, at your cost and consequences.

Dated: __________                    Advocate for
Place: ___________                   (Name of Client)

ACKNOWLEDGMENT:
Received the above Legal Notice on ___________

                                    Signature`,
        
        instructions: [
            'Send through registered post/courier',
            'Keep acknowledgment receipt',
            'Give reasonable time for response',
            'Maintain formal legal language',
            'Specify exact demand/action required',
            'Keep copies for court proceedings'
        ],
        
        requirements: [
            'Clear statement of facts',
            'Specific demand or action required',
            'Reasonable timeline for compliance',
            'Advocate\'s signature and details'
        ]
    }
};

// Document creation guidance and procedures
const documentProcedures = {
    fir_filing: {
        title: 'FIR Filing Complete Procedure',
        steps: [
            'Approach the nearest police station having jurisdiction',
            'Meet the Station House Officer (SHO) or duty officer',
            'Provide oral/written complaint with all details',
            'Police will record FIR in prescribed format',
            'Read through the FIR before signing',
            'Obtain signed copy of FIR with number',
            'Follow up on investigation progress regularly'
        ],
        tips: [
            'File FIR immediately after incident',
            'Be specific about time, place, and persons involved',
            'Mention all material facts clearly',
            'Don\'t sign blank or incomplete FIR',
            'Keep multiple copies of FIR safe',
            'Note down investigating officer\'s details'
        ],
        documents: [
            'Identity proof (Aadhaar/Passport/License)',
            'Address proof',
            'Medical certificates (in case of injury)',
            'Any evidence or supporting documents',
            'Witness statements (if available)'
        ]
    },

    notarization: {
        title: 'Document Notarization Process',
        steps: [
            'Prepare the document completely except signatures',
            'Locate nearby notary public or oath commissioner',
            'Carry original documents and photocopies',
            'Sign the document in presence of notary',
            'Notary will affix official seal and signature',
            'Pay the prescribed notarization fees',
            'Collect notarized document with seal'
        ],
        fees: 'Generally ₹10-50 per page depending on document type',
        validity: 'Notarized documents are valid indefinitely unless specified otherwise'
    }
};

// Handle document creation requests
const handleDocumentCreationQuery = async (message, entities, userData) => {
    console.log('📄 Processing document creation query:', { message, entities });
    
    const messageLower = message.toLowerCase();
    const documentType = detectDocumentType(messageLower, entities);
    
    if (documentType) {
        return await getDocumentTemplate(documentType, userData);
    } else {
        return getGeneralDocumentInfo(message, userData);
    }
};

// Detect document type from message
const detectDocumentType = (message, entities) => {
    const documentKeywords = {
        'fir': ['fir', 'police complaint', 'criminal complaint'],
        'affidavit': ['affidavit', 'sworn statement'],
        'petition': ['petition', 'court application', 'writ'],
        'bail_application': ['bail', 'bail application', 'release application'],
        'legal_notice': ['legal notice', 'notice', 'demand notice']
    };
    
    for (const [docType, keywords] of Object.entries(documentKeywords)) {
        for (const keyword of keywords) {
            if (message.includes(keyword)) {
                return docType;
            }
        }
    }
    
    return entities.legal_document || null;
};

// Get document template and guidance
const getDocumentTemplate = async (documentType, userData) => {
    const template = documentTemplates[documentType];
    
    if (!template) {
        return {
            response: `Document template for "${documentType}" is not available. Please contact legal assistance for help with this document.`,
            suggestions: ['Available templates', 'Legal document help', 'Lawyer consultation']
        };
    }

    const response = `📄 **${template.title}**

**📋 Document Format:**

\`\`\`
${template.format}
\`\`\`

**📝 Important Instructions:**
${template.instructions.map((instruction, i) => `${i + 1}. ${instruction}`).join('\n')}

**📎 Required Documents:**
${template.requirements.map(req => `• ${req}`).join('\n')}

**⚠️ Legal Disclaimer:**
This is a general template for guidance only. For specific legal matters, consult with a qualified lawyer. Ensure all information is accurate before submitting to any legal authority.

**💡 Need Help?**
• Review template carefully before filling
• Consult lawyer for complex cases
• Keep copies of all submitted documents
• Follow up on submitted applications`;

    // Add specific guidance based on document type
    let additionalInfo = '';
    
    if (documentType === 'fir') {
        const procedure = documentProcedures.fir_filing;
        additionalInfo = `

**🚔 FIR Filing Procedure:**
${procedure.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**💡 Pro Tips:**
${procedure.tips.map(tip => `• ${tip}`).join('\n')}`;
    } else if (documentType === 'affidavit') {
        const notaryInfo = documentProcedures.notarization;
        additionalInfo = `

**📋 Notarization Process:**
${notaryInfo.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**💰 Fees:** ${notaryInfo.fees}
**⏱️ Validity:** ${notaryInfo.validity}`;
    }

    return {
        response: response + additionalInfo,
        suggestions: [
            'Document requirements checklist',
            'Notarization procedure',
            'Court filing process',
            'Legal document samples',
            'Lawyer consultation',
            'Document verification'
        ],
        template: {
            type: documentType,
            format: template.format,
            instructions: template.instructions,
            requirements: template.requirements
        }
    };
};

// Handle FIR drafting assistance
const handleFIRDrafting = async (incidentDetails, userData) => {
    console.log('📝 Assisting with FIR drafting for user:', userData.userId);
    
    const response = `📝 **FIR Drafting Assistant**

I'll help you draft your FIR step by step:

**🔍 Information Required:**

**1. Personal Details:**
• Your full name, age, occupation
• Complete address with pin code
• Mobile number and email
• Father's/Husband's name

**2. Incident Details:**
• What exactly happened?
• When did it happen? (Date and time)
• Where did it happen? (Exact location)
• Who was involved? (Names if known)
• Were there any witnesses?

**3. Loss/Damage:**
• What was stolen/damaged?
• Approximate value of loss
• Any injuries sustained?

**4. Accused Information:**
• Name(s) if known
• Physical description
• Any identifying features
• Address if known

**📋 Sample FIR Format:**

Based on the information you provide, I can help you structure your complaint properly for police registration.

**⚠️ Important Points:**
• Be truthful and accurate
• Include all material facts
• Mention witnesses if any
• Don't exaggerate or speculate
• Keep the language simple and clear

Would you like to proceed with filling out the FIR details?`;

    return {
        response: response,
        suggestions: [
            'Start FIR drafting',
            'FIR format template',
            'Police station procedure',
            'Required documents',
            'Legal rights information',
            'Lawyer consultation'
        ],
        interactive: true,
        nextSteps: ['collect_incident_details', 'draft_fir', 'review_fir']
    };
};

// Handle affidavit creation assistance
const handleAffidavitCreation = async (purpose, userData) => {
    const response = `📋 **Affidavit Creation Assistant**

**Types of Affidavits:**

**📄 Common Affidavit Types:**
• **Income Affidavit** - For financial declarations
• **Residence Affidavit** - For address proof
• **Identity Affidavit** - For name/identity issues  
• **Non-Criminal Affidavit** - Character certificate
• **Loss Affidavit** - For lost documents
• **Relationship Affidavit** - Family relationships
• **Age Affidavit** - Date of birth declarations

**📝 What You Need:**
1. **Clear statement of facts** you want to declare
2. **Personal identification details**
3. **Supporting documents** (if any references)
4. **Notary fees** (₹10-50 typically)

**🏛️ Notarization Process:**
• Find registered notary public
• Sign in presence of notary only
• Notary will verify your identity
• Official seal and signature applied
• Receive original notarized copy

**⚖️ Legal Importance:**
• Sworn statement under oath
• False statement is perjury (punishable)
• Can be used as evidence in court
• Valid across India when properly notarized

Which type of affidavit do you need help with?`;

    return {
        response: response,
        suggestions: [
            'Income affidavit format',
            'Residence proof affidavit',
            'Loss affidavit template',
            'Notary public finder',
            'Affidavit legal validity',
            'Document requirements'
        ]
    };
};

// Handle legal notice drafting
const handleLegalNoticeDrafting = async (issueType, userData) => {
    const response = `⚖️ **Legal Notice Drafting Guide**

**📋 When to Send Legal Notice:**
• **Recovery of Money** - Unpaid debts/loans
• **Breach of Contract** - Agreement violations  
• **Property Disputes** - Ownership/possession issues
• **Defamation Cases** - False accusations/statements
• **Employment Issues** - Salary, termination disputes
• **Consumer Complaints** - Defective goods/services

**📝 Essential Components:**

**1. Clear Statement of Facts**
• Chronological sequence of events
• Specific details of loss/damage
• Evidence and supporting documents

**2. Legal Basis**
• Applicable laws and sections
• Breach/violation details
• Rights being claimed

**3. Specific Demand**
• Exact action required
• Timeline for compliance
• Consequences of non-compliance

**4. Professional Format**
• Formal legal language
• Proper addressing
• Advocate's signature

**⚠️ Important Considerations:**
• Give reasonable time (15-30 days typically)
• Send via registered post/courier
• Keep acknowledgment receipt
• Consult lawyer for complex matters
• May be used as evidence in court

**💰 Typical Costs:**
• Advocate fees: ₹2,000-10,000
• Postal charges: ₹50-200
• Court fees (if case filed): Varies

Would you like help drafting a notice for a specific issue?`;

    return {
        response: response,
        suggestions: [
            'Money recovery notice',
            'Contract breach notice',
            'Property dispute notice',
            'Employment issue notice',
            'Consumer complaint notice',
            'Legal notice samples'
        ]
    };
};

// Get general document information
const getGeneralDocumentInfo = (message, userData) => {
    return {
        response: `📄 **Legal Document Assistance**

I can help you with various legal documents:

**📋 Available Document Templates:**
• **FIR (First Information Report)** - Police complaints
• **Affidavits** - Sworn statements for various purposes  
• **Court Petitions** - Applications to court
• **Bail Applications** - For release from custody
• **Legal Notices** - Formal legal communications

**📝 Document Services:**
• Template formats with instructions
• Step-by-step filling guidance
• Required documents checklist
• Filing procedures and fees
• Legal validity information

**⚖️ Professional Advice:**
For complex legal matters, I recommend consulting with a qualified lawyer who can:
• Review your specific situation
• Customize documents for your case
• Represent you in legal proceedings
• Provide strategic legal advice

**🔍 Popular Queries:**
Which type of legal document do you need help with?`,
        
        suggestions: [
            'How to draft an FIR?',
            'How to make an affidavit?',
            'Legal notice template',
            'Court petition format',
            'Bail application guide',
            'Document notarization'
        ]
    };
};

// Interactive document builder (for future enhancement)
const startDocumentBuilder = (documentType, userData) => {
    return {
        response: `🔧 **Interactive ${documentType.toUpperCase()} Builder**

I'll help you create your ${documentType} step by step.

This interactive process will guide you through:
1. Collecting all required information
2. Filling the template correctly
3. Reviewing for accuracy
4. Providing filing instructions

This feature is coming soon! For now, please use the template provided above.`,
        
        suggestions: [
            `${documentType} template`,
            'Manual filling guide',
            'Required documents',
            'Legal assistance',
            'Lawyer consultation'
        ],
        
        interactive: true,
        status: 'coming_soon'
    };
};

// Main request handler for document queries
async function handleDocumentRequest(req) {
    const { message, intent, entities, userData } = req.body;
    
    console.log('📄 Document Controller Processing:', { intent, message });
    
    try {
        let response, suggestions, additionalData;
        
        switch (intent) {
            case 'document_creation':
            case 'fir_help':
                const firResult = await handleFIRDrafting(message, entities, userData);
                response = firResult.response;
                suggestions = firResult.suggestions;
                additionalData = firResult.additionalData;
                break;
                
            case 'affidavit_help':
                const affidavitResult = await handleAffidavitCreation(message, entities, userData);
                response = affidavitResult.response;
                suggestions = affidavitResult.suggestions;
                additionalData = affidavitResult.additionalData;
                break;
                
            case 'legal_notice':
                const noticeResult = await handleLegalNoticeDrafting(message, entities, userData);
                response = noticeResult.response;
                suggestions = noticeResult.suggestions;
                additionalData = noticeResult.additionalData;
                break;
                
            case 'petition_help':
            case 'bail_application':
                const templateResult = await getDocumentTemplate(intent, entities);
                response = templateResult.response;
                suggestions = templateResult.suggestions;
                additionalData = templateResult.additionalData;
                break;
                
            default:
                const documentResult = await handleDocumentCreationQuery(message, entities, userData);
                response = documentResult.response;
                suggestions = documentResult.suggestions;
                additionalData = documentResult.additionalData;
        }
        
        return {
            response: response,
            suggestions: suggestions || [
                'FIR template',
                'Affidavit format',
                'Legal notice help',
                'Document procedures'
            ],
            additionalData: additionalData
        };
        
    } catch (error) {
        console.error('Document Controller Error:', error);
        return {
            response: 'I encountered an issue with document assistance. Please try again or specify the type of document you need help with.',
            suggestions: ['FIR help', 'Affidavit template', 'Legal notice', 'Document types']
        };
    }
}

module.exports = {
    handleDocumentCreationQuery,
    handleFIRDrafting,
    handleAffidavitCreation,
    handleLegalNoticeDrafting,
    getDocumentTemplate,
    startDocumentBuilder,
    handleDocumentRequest,
    documentTemplates,
    documentProcedures
};