// Location Services Controller - Handles court/police station location queries with maps
const { advancedLegalNLP, advancedLegalUtils } = require('../../models/NLPmodels/advancedLegalNLP');

// Indian Legal Institution Database
const legalInstitutions = {
    courts: {
        'supreme_court': {
            name: 'Supreme Court of India',
            address: 'Tilak Marg, New Delhi - 110001',
            phone: '011-23388922',
            website: 'https://main.sci.gov.in',
            coordinates: { lat: 28.6229, lng: 77.2397 },
            jurisdiction: 'National',
            timings: '10:30 AM - 4:00 PM (Mon-Fri)'
        },
        'delhi_hc': {
            name: 'Delhi High Court',
            address: 'Sher Shah Road, New Delhi - 110003',
            phone: '011-23863314',
            coordinates: { lat: 28.6292, lng: 77.2337 },
            jurisdiction: 'Delhi NCR',
            timings: '10:15 AM - 4:00 PM (Mon-Fri)'
        },
        // Add more courts as needed
    },
    
    policeStations: {
        'cp_delhi': {
            name: 'Connaught Place Police Station',
            address: 'Connaught Place, New Delhi - 110001',
            phone: '011-23341182',
            coordinates: { lat: 28.6315, lng: 77.2167 },
            jurisdiction: 'Central Delhi',
            services: ['FIR Registration', 'Complaint Filing', 'Emergency Response'],
            timings: '24x7'
        }
        // Add more police stations as needed
    }
};

// State-wise court information
const stateCourtInfo = {
    'delhi': {
        'high_court': 'Delhi High Court',
        'district_courts': ['Tis Hazari Courts Complex', 'Karkardooma Courts Complex', 'Saket Courts Complex'],
        'sessions_courts': ['Sessions Court Tis Hazari', 'Sessions Court Karkardooma']
    },
    'mumbai': {
        'high_court': 'Bombay High Court',
        'district_courts': ['Mumbai City Civil Court', 'Andheri District Court'],
        'sessions_courts': ['Sessions Court Mumbai', 'Sessions Court Thane']
    }
    // Add more states as needed
};

// Emergency contact numbers by state/city
const emergencyContacts = {
    national: {
        'police': '100',
        'ambulance': '108',
        'fire': '101',
        'women_helpline': '1091',
        'child_helpline': '1098',
        'cyber_crime': '1930',
        'legal_aid': '15100'
    },
    delhi: {
        'police_control_room': '011-23490123',
        'delhi_police_helpline': '011-25844444',
        'women_helpline_delhi': '011-23317004',
        'legal_services_delhi': '011-23388942'
    }
    // Add more cities as needed
};

// Handle location-based queries for courts and police stations
const handleLocationQuery = async (message, entities, userData, userLocation = null) => {
    console.log('📍 Processing location query:', { message, entities, userLocation });
    
    const messageLower = message.toLowerCase();
    
    // Detect what user is looking for
    const isCourtQuery = messageLower.includes('court');
    const isPoliceQuery = messageLower.includes('police');
    
    // Extract or request location
    const locationInfo = advancedLegalNLP.detectLocation(message);
    const finalLocation = userLocation || locationInfo.textLocation;
    
    // If no location detected, request it with interactive options
    if (!finalLocation) {
        return await requestUserLocationInteractively(message, { isCourtQuery, isPoliceQuery }, userData);
    }
    
    if (isCourtQuery) {
        return await handleCourtLocationQuery(message, finalLocation, userData, locationInfo);
    } else if (isPoliceQuery) {
        return await handlePoliceLocationQuery(message, finalLocation, userData, locationInfo);
    } else {
        return await handleGeneralLocationQuery(message, finalLocation, userData);
    }
};

// Handle court location queries
const handleCourtLocationQuery = async (message, location, userData, locationInfo) => {
    console.log('🏛️ Processing court location query for:', location);
    
    // Generate maps iframe for courts
    const mapIframe = generateMapIframe('courts', location);
    
    const response = `🏛️ **Courts Near ${location}**

**Court Hierarchy in India:**

**🏛️ Supreme Court of India**
📍 New Delhi - Final appellate court
📞 011-23388922 | 🌐 sci.gov.in

**🏢 High Courts** (State Level)
• Constitutional and appellate jurisdiction
• Civil and criminal matters above district level
• Writ jurisdiction for fundamental rights

**🏛️ District Courts** (District Level)
• Original civil and criminal jurisdiction
• Sessions cases and appeals from lower courts
• Family courts for matrimonial matters

**📋 Magistrate Courts** (Local Level)
• Summary trials for minor offenses
• Preliminary hearings for serious crimes
• Civil cases up to specified monetary limits

**🗺️ Find Courts Near You:**

${mapIframe}

**📱 How to Locate Nearest Court:**
1. **E-Courts Website:** https://ecourts.gov.in
2. **Court Locator:** Use official court directory
3. **District Collector Office:** Get local court information
4. **Legal Aid Office:** Free guidance on court selection

**📞 Important Court Contacts:**
• Supreme Court: 011-23388922
• High Court Registry: [Varies by state]
• District Court: [Local numbers]
• E-Courts Helpline: 1800-103-1095

**⚖️ What Court for Your Case:**
• **Civil Disputes:** Civil Court/District Court
• **Criminal Cases:** Magistrate/Sessions Court  
• **Family Matters:** Family Court
• **Constitutional Issues:** High Court/Supreme Court
• **Consumer Disputes:** Consumer Forum
• **Labour Issues:** Labour Court

**🕒 General Court Timings:**
Monday-Friday: 10:30 AM - 4:00 PM
(Varies by court and state)

**💡 Pro Tips:**
• Call ahead to confirm timings
• Carry proper identification
• Check cause list for hearing dates
• Arrive early for security checks`;

    return {
        response: response,
        suggestions: [
            'Court jurisdiction guide',
            'How to file a case',
            'Court fee structure',
            'E-filing procedures',
            'Legal representation',
            'Court dress code'
        ],
        mapData: {
            query: 'courts',
            location: location,
            iframe: mapIframe
        }
    };
};

// Handle police station location queries
const handlePoliceLocationQuery = async (message, location, userData, locationInfo) => {
    console.log('👮 Processing police station query for:', location);
    
    const mapIframe = generateMapIframe('police stations', location);
    
    const response = `👮 **Police Stations Near ${location}**

**Police Station Hierarchy:**

**🏢 Police Commissionerate/SP Office** (District Level)
• Overall law enforcement coordination
• Senior police administration
• Inter-district crime coordination

**🚔 Police Stations** (Local Area)
• FIR registration and investigation
• Local crime prevention and detection
• Community policing and assistance

**👮 Police Outposts/Chowkis** (Neighborhood)
• Beat policing and patrol
• First contact for minor issues
• Crime prevention activities

**🗺️ Find Police Stations Near You:**

${mapIframe}

**📱 Police Station Services:**
✅ **FIR Registration** - Criminal complaints
✅ **Non-Cognizable Complaints** - Civil disputes
✅ **Missing Person Reports** - Person/property
✅ **Verification Services** - Character/address
✅ **Emergency Response** - 24x7 availability
✅ **Women's Help Desk** - Special assistance
✅ **Traffic Violation** - Challan payments
✅ **Passport Verification** - Police clearance

**📞 Emergency Contact Numbers:**

**🚨 National Emergency:**
• Police: **100**
• Ambulance: **108**
• Fire Brigade: **101**
• Women Helpline: **1091**
• Child Helpline: **1098**
• Cyber Crime: **1930**

**📋 What to Bring to Police Station:**
• Valid photo identification
• Address proof
• Relevant documents/evidence
• Witness contact information (if any)
• Mobile phone for emergency contact

**⚖️ Your Rights at Police Station:**
• Right to file FIR for cognizable offenses
• Right to get FIR copy immediately
• Right to legal representation
• Right to inform family about detention
• Right against custodial violence

**🕒 Police Station Timings:**
• **Emergency Services:** 24x7
• **Regular Services:** Usually 9 AM - 6 PM
• **Duty Officer:** Always available

**💡 Important Tips:**
• Keep FIR number safe
• Get acknowledgment for complaints
• Note officer's name and badge number
• Be clear and factual in statements
• Carry copies of all documents`;

    return {
        response: response,
        suggestions: [
            'How to file FIR',
            'Police complaint procedure',
            'Emergency contact numbers',
            'Your rights with police',
            'Women safety helplines',
            'Cyber crime reporting'
        ],
        mapData: {
            query: 'police stations',
            location: location,
            iframe: mapIframe
        }
    };
};

// Handle general location queries
const handleGeneralLocationQuery = async (message, location, userData) => {
    const response = `📍 **Legal Institutions Near ${location}**

I can help you find:

**🏛️ Courts & Judicial Institutions**
• Supreme Court, High Courts, District Courts
• Family Courts, Consumer Courts
• Tribunal and Appellate Authorities

**👮 Law Enforcement**
• Police Stations and Outposts
• Traffic Police Offices
• Crime Branch Offices

**⚖️ Legal Aid & Services**
• Legal Service Authority Offices
• Bar Council Offices
• Legal Aid Clinics

**🏢 Administrative Offices**
• Registrar Offices
• Tehsil/Revenue Courts
• Municipal Legal Offices

To get specific information, please ask:
• "Find courts near me"
• "Police stations in my area"
• "Legal aid offices nearby"`;

    return {
        response: response,
        suggestions: [
            'Find courts near me',
            'Police stations in my area',
            'Legal aid offices nearby',
            'Bar Council offices',
            'Consumer courts',
            'Emergency legal contacts'
        ]
    };
};

// Generate Google Maps iframe for location queries
const generateMapIframe = (query, location) => {
    // Using Google Maps Embed API
    const baseUrl = 'https://www.google.com/maps/embed/v1/search';
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
    
    const searchQuery = `${query} near ${location}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    return `<iframe 
        width="100%" 
        height="300" 
        frameborder="0" 
        style="border:0; border-radius: 8px; margin: 10px 0;" 
        src="${baseUrl}?key=${apiKey}&q=${encodedQuery}&zoom=14"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
    </iframe>`;
};

// Get user's geolocation (to be called from frontend)
const requestUserLocation = () => {
    return {
        response: `📍 **Location Access Required**

To provide you with accurate information about nearby courts and police stations, I need access to your location.

**How to Share Location:**
1. **Browser:** Click "Allow" when prompted for location
2. **Mobile:** Enable location services in browser settings
3. **Manual:** Tell me your city/area name

**Privacy Note:** Your location is only used to find nearby legal institutions and is not stored permanently.

**Alternative:** You can also tell me your city or area name, for example:
• "Find courts in Mumbai"
• "Police stations in Delhi"
• "Legal institutions in Bangalore"

Would you like to share your location or specify your city manually?`,
        
        suggestions: [
            'Allow location access',
            'Enter city manually',
            'Find courts in Delhi',
            'Find courts in Mumbai',
            'Find courts in Bangalore',
            'Privacy information'
        ],
        
        requiresLocationPermission: true
    };
};

// Get specific institution details
const getInstitutionDetails = async (institutionType, institutionName, location) => {
    // This would query a comprehensive database of legal institutions
    // For now, return general information
    
    return {
        response: `🏛️ **${institutionName}** Details

**Address:** [Address would be fetched from database]
**Phone:** [Contact numbers]
**Timings:** [Operating hours]
**Services:** [Available services]
**Jurisdiction:** [Area of jurisdiction]

**How to Reach:**
[Directions and transportation details]

**Important Information:**
• Carry valid photo ID
• Check timings before visiting
• Security screening required
• Mobile phones may be restricted`,
        
        suggestions: [
            'Get directions',
            'Contact information',
            'Services available',
            'Visiting guidelines',
            'Alternative locations'
        ]
    };
};

// Generate location-specific emergency contacts
const getEmergencyContacts = (location) => {
    const nationalContacts = emergencyContacts.national;
    const localContacts = emergencyContacts[location.toLowerCase()] || {};
    
    let response = `🚨 **Emergency Contacts - ${location}**

**🚨 National Emergency Numbers:**
${Object.entries(nationalContacts).map(([service, number]) => 
    `• **${service.replace(/_/g, ' ').toUpperCase()}:** ${number}`
).join('\n')}

**📞 Local Emergency Contacts:**
${Object.entries(localContacts).map(([service, number]) => 
    `• **${service.replace(/_/g, ' ').toUpperCase()}:** ${number}`
).join('\n')}

**⚖️ Legal Emergency Assistance:**
• **National Legal Services Authority:** 15100
• **Women in Distress:** 1091
• **Senior Citizen Helpline:** 14567
• **Railway Helpline:** 139
• **Road Accident Emergency:** 1073

**💡 When to Call:**
• **100 (Police):** Crime, theft, violence, emergency
• **1091 (Women):** Harassment, domestic violence
• **1098 (Child):** Child abuse, trafficking
• **1930 (Cyber):** Online fraud, cyber crimes

**Important:** Save these numbers in your phone and share with family members.`;

    return {
        response: response,
        suggestions: [
            'Police emergency procedures',
            'Women safety helplines',
            'Legal aid emergency',
            'Medical emergency contacts',
            'Disaster helplines'
        ]
    };
};

// Handle map data requests
const getMapData = (query, location, coordinates = null) => {
    return {
        mapType: 'embed',
        query: query,
        location: location,
        coordinates: coordinates,
        iframe: generateMapIframe(query, location),
        directionsUrl: `https://www.google.com/maps/dir//${encodeURIComponent(query + ' near ' + location)}`,
        
        // Additional map features
        features: {
            satellite: true,
            traffic: true,
            transit: true,
            directions: true
        }
    };
};

// Main request handler for location queries
async function handleLocationRequest(req) {
    const { message, intent, entities, userData } = req.body;
    
    console.log('📍 Location Controller Processing:', { intent, message });
    
    try {
        let response, suggestions, additionalData;
        
        switch (intent) {
            case 'location_query':
            case 'court_finder':
                const courtResult = await handleCourtLocationQuery(message, entities);
                response = courtResult.response;
                suggestions = courtResult.suggestions;
                additionalData = courtResult.additionalData;
                break;
                
            case 'police_station_finder':
                const policeResult = await handlePoliceLocationQuery(message, entities);
                response = policeResult.response;
                suggestions = policeResult.suggestions;
                additionalData = policeResult.additionalData;
                break;
                
            case 'emergency_contact':
                const emergencyResult = await getEmergencyContacts(message, entities);
                response = emergencyResult.response;
                suggestions = emergencyResult.suggestions;
                additionalData = emergencyResult.additionalData;
                break;
                
            default:
                const locationResult = await handleLocationQuery(message, entities);
                response = locationResult.response;
                suggestions = locationResult.suggestions;
                additionalData = locationResult.additionalData;
        }
        
        return {
            response: response,
            suggestions: suggestions || [
                'Find nearest court',
                'Police stations nearby',
                'Emergency contacts',
                'Get directions'
            ],
            additionalData: additionalData
        };
        
    } catch (error) {
        console.error('Location Controller Error:', error);
        return {
            response: 'I encountered an issue finding location information. Please try again or provide more specific details.',
            suggestions: ['Try again', 'Provide location', 'Emergency contacts', 'General help']
        };
    }
}

// Interactive location request with geolocation support
const requestUserLocationInteractively = async (originalMessage, queryOptions, userData) => {
    const { isCourtQuery, isPoliceQuery } = queryOptions;
    
    let queryTypeText = 'legal institutions';
    if (isCourtQuery && isPoliceQuery) queryTypeText = 'courts and police stations';
    else if (isCourtQuery) queryTypeText = 'courts';
    else if (isPoliceQuery) queryTypeText = 'police stations';
    
    const response = `📍 **Location Required for ${queryTypeText.charAt(0).toUpperCase() + queryTypeText.slice(1)} Near You**

To provide accurate results for nearby ${queryTypeText}, I need your location.

**🎯 Choose an option:**

**1. 🌍 Auto-Detect Location** (Recommended)
Click "Share Location" to automatically find ${queryTypeText} near you.

**2. 🏙️ Enter City/Area**
Type your city, area, or landmark. Examples:
• "courts in Mumbai"
• "police stations in Delhi Cantt"
• "legal help in Bangalore Koramangala"

**3. 📍 Use Specific Address**
Provide your full address or nearby landmark for precise results.

**🔒 Privacy:** Your location is only used to find nearby legal institutions and is not stored.

**💡 Quick Options:**
${userData?.role === 'admin' ? '• "All districts overview"' : ''}
• "Major cities list"
• "Emergency contacts only"
• "Legal helplines"

How would you like to share your location?`;

    return {
        response: response,
        suggestions: [
            '🌍 Share my location',
            '🏙️ Enter city name',
            'Courts in Mumbai',
            'Police in Delhi',
            'Emergency contacts',
            'Legal helplines'
        ],
        additionalData: {
            requiresLocation: true,
            queryType: queryTypeText,
            originalMessage: originalMessage,
            locationRequestActive: true
        }
    };
};

// Enhanced location-based search with real data
const findNearbyInstitutionsWithLocation = async (latitude, longitude, institutionType, radius = 10) => {
    // This would typically call a real mapping API
    // For now, return structured data based on common locations
    
    const institutionData = {
        courts: [
            { name: 'District Court', address: 'Court Complex', distance: '1.2 km', phone: '011-23456789' },
            { name: 'Family Court', address: 'Legal District', distance: '2.1 km', phone: '011-23456790' },
            { name: 'Sessions Court', address: 'Judicial Complex', distance: '3.5 km', phone: '011-23456791' }
        ],
        police: [
            { name: 'City Police Station', address: 'Main Road', distance: '0.8 km', phone: '100', services: ['FIR', 'General'] },
            { name: 'Traffic Police', address: 'Highway Junction', distance: '1.5 km', phone: '103', services: ['Traffic', 'Accidents'] },
            { name: 'Cyber Crime Unit', address: 'Tech City', distance: '4.2 km', phone: '1930', services: ['Cyber Crime', 'Online Fraud'] }
        ]
    };
    
    return institutionData[institutionType] || [];
};

module.exports = {
    handleLocationQuery,
    handleCourtLocationQuery,
    handlePoliceLocationQuery,
    requestUserLocation,
    requestUserLocationInteractively,
    findNearbyInstitutionsWithLocation,
    getInstitutionDetails,
    getEmergencyContacts,
    getMapData,
    handleLocationRequest,
    legalInstitutions,
    emergencyContacts
};