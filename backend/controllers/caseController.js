const LegalCase = require("../models/LegalCase");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const { sendEmail } = require("../services/notificationService");
const { searchCases: searchIndianKanoon } = require("../services/indianKanoonService");
const path = require("path");
const fs = require("fs");

// Load legal database
const loadLegalDatabase = () => {
  const jsonFilesPath = path.join(__dirname, "../../frontend/src/pages/Lawyer/LawPenalJsons");
  const legalDB = {};

  const lawCategories = {
    ipc: "ipc.json",
    cpc: "cpc.json",
    crpc: "crpc.json",
    hma: "hma.json",
    iea: "iea.json",
    mva: "MVA.json",
    ida: "ida.json",
    nia: "nia.json",
  };

  Object.entries(lawCategories).forEach(([category, filename]) => {
    try {
      const filePath = path.join(jsonFilesPath, filename);
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf8");
        const jsonData = JSON.parse(fileData);
        legalDB[category] = Array.isArray(jsonData) ? jsonData : Object.values(jsonData);
      }
    } catch (error) {
      console.error(`Error loading ${category}:`, error.message);
      legalDB[category] = [];
    }
  });

  return legalDB;
};

// AI Analysis Engine
const analyzeCaseWithAI = (caseDescription, category, legalDB) => {
  const descLower = caseDescription.toLowerCase();
  const keywords = extractKeywords(descLower);
  const applicableSections = [];

  // Search through IPC sections
  if (legalDB.ipc) {
    legalDB.ipc.forEach((section) => {
      const relevance = calculateRelevance(descLower, keywords, section);
      if (relevance > 30) {
        applicableSections.push({
          act: "IPC",
          sectionNumber: section.Section || section.number || "",
          sectionTitle: section.section_title || section.title || "",
          sectionDescription: section.section_desc || section.description || "",
          relevanceScore: relevance,
        });
      }
    });
  }

  // Search through IT Act (NIA) for cyber cases
  if (category === "cyber" && legalDB.nia) {
    legalDB.nia.forEach((section) => {
      const relevance = calculateRelevance(descLower, keywords, section);
      if (relevance > 30) {
        applicableSections.push({
          act: "NIA",
          sectionNumber: section.Section || section.number || "",
          sectionTitle: section.section_title || section.title || "",
          sectionDescription: section.section_desc || section.description || "",
          relevanceScore: relevance,
        });
      }
    });
  }

  // Search through CPC for civil cases
  if (["civil", "property", "family", "consumer"].includes(category) && legalDB.cpc) {
    legalDB.cpc.forEach((section) => {
      const relevance = calculateRelevance(descLower, keywords, section);
      if (relevance > 30) {
        applicableSections.push({
          act: "CPC",
          sectionNumber: section.Section || section.number || "",
          sectionTitle: section.section_title || section.title || "",
          sectionDescription: section.section_desc || section.description || "",
          relevanceScore: relevance,
        });
      }
    });
  }

  // Sort by relevance and take top 10
  applicableSections.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const topSections = applicableSections.slice(0, 10);

  // Determine case classification
  const classification = classifyCase(category, descLower, topSections);

  // Determine punishment based on sections
  const punishment = determinePunishment(topSections, category);

  // Generate legal procedures
  const procedures = generateProcedures(category, classification);

  // Generate required documents
  const requiredDocuments = generateRequiredDocuments(category);

  // Determine court jurisdiction
  const jurisdiction = determineJurisdiction(category, classification);

  // Calculate confidence score
  const confidenceScore = calculateConfidenceScore(topSections, keywords);

  return {
    applicableSections: topSections,
    classification,
    punishment,
    procedures,
    requiredDocuments,
    jurisdiction,
    confidenceScore,
  };
};

// Extract keywords from case description
const extractKeywords = (text) => {
  const legalKeywords = [
    // Criminal keywords
    "theft", "robbery", "murder", "assault", "fraud", "cheating", "rape", "kidnapping",
    "extortion", "forgery", "defamation", "bribery", "corruption", "violence", "attack",
    "weapon", "injury", "death", "threat", "intimidation",
    // Cyber keywords
    "hacking", "cyber", "phishing", "data", "breach", "online", "fraud", "identity",
    "theft", "computer", "internet", "email", "scam", "password",
    // Property keywords
    "property", "land", "house", "building", "apartment", "ownership", "title", "deed",
    "boundary", "dispute", "possession", "eviction", "rent", "lease",
    // Family keywords
    "divorce", "marriage", "dowry", "custody", "child", "maintenance", "alimony",
    "domestic", "violence", "husband", "wife", "spouse",
    // Consumer keywords
    "consumer", "product", "defective", "service", "refund", "warranty", "complaint",
    // Corporate keywords
    "company", "shareholder", "director", "contract", "agreement", "breach",
    // Labor keywords
    "employee", "employer", "wages", "salary", "termination", "wrongful", "dismissal",
  ];

  const foundKeywords = legalKeywords.filter((keyword) => text.includes(keyword));
  return foundKeywords;
};

// Calculate relevance score
const calculateRelevance = (descLower, keywords, section) => {
  let score = 0;
  const sectionText = (
    (section.section_desc || section.description || "") +
    " " +
    (section.section_title || section.title || "")
  ).toLowerCase();

  // Check for keyword matches
  keywords.forEach((keyword) => {
    if (sectionText.includes(keyword)) {
      score += 15;
    }
  });

  // Check for direct text overlap
  const descWords = descLower.split(" ").filter((w) => w.length > 3);
  const sectionWords = sectionText.split(" ").filter((w) => w.length > 3);
  const overlap = descWords.filter((w) => sectionWords.includes(w));
  score += overlap.length * 2;

  return Math.min(score, 100);
};

// Classify case
const classifyCase = (category, description, sections) => {
  let type = "criminal";
  let subType = category;
  let severityLevel = "medium";
  let compoundable = true;
  let cognizable = false;
  let bailable = true;

  // Determine type based on category
  if (["civil", "property", "family", "consumer"].includes(category)) {
    type = "civil";
  } else if (category === "criminal" || category === "cyber") {
    type = "criminal";
  }

  // Determine severity
  const severeCrimes = ["murder", "rape", "kidnapping", "terrorism", "death"];
  const seriousCrimes = ["fraud", "robbery", "assault", "extortion"];

  if (severeCrimes.some((crime) => description.includes(crime))) {
    severityLevel = "critical";
    compoundable = false;
    cognizable = true;
    bailable = false;
  } else if (seriousCrimes.some((crime) => description.includes(crime))) {
    severityLevel = "high";
    cognizable = true;
    bailable = false;
  } else if (category === "cyber" || description.includes("fraud")) {
    severityLevel = "medium";
    cognizable = true;
  } else {
    severityLevel = "low";
  }

  return {
    type,
    subType,
    severityLevel,
    compoundable,
    cognizable,
    bailable,
  };
};

// Determine punishment
const determinePunishment = (sections, category) => {
  const punishment = {
    minJailTerm: "none",
    maxJailTerm: "none",
    minFine: 0,
    maxFine: 0,
    additionalPenalties: [],
  };

  // Check section descriptions for punishment details
  sections.forEach((section) => {
    const desc = (section.sectionDescription || "").toLowerCase();

    // Extract jail terms
    if (desc.includes("death")) {
      punishment.maxJailTerm = "death";
    } else if (desc.includes("life") || desc.includes("imprisonment for life")) {
      if (punishment.maxJailTerm !== "death") {
        punishment.maxJailTerm = "life imprisonment";
      }
    } else if (desc.includes("ten years") || desc.includes("10 years")) {
      if (!["death", "life imprisonment"].includes(punishment.maxJailTerm)) {
        punishment.maxJailTerm = "10 years";
      }
    } else if (desc.includes("seven years") || desc.includes("7 years")) {
      if (!["death", "life imprisonment", "10 years"].includes(punishment.maxJailTerm)) {
        punishment.maxJailTerm = "7 years";
      }
    } else if (desc.includes("three years") || desc.includes("3 years")) {
      if (punishment.maxJailTerm === "none") {
        punishment.maxJailTerm = "3 years";
      }
    } else if (desc.includes("one year") || desc.includes("1 year")) {
      if (punishment.maxJailTerm === "none") {
        punishment.maxJailTerm = "1 year";
      }
    }

    // Extract fines
    if (desc.includes("fine")) {
      if (desc.includes("lakh") || desc.includes("lakhs")) {
        punishment.maxFine = Math.max(punishment.maxFine, 100000);
      } else if (desc.includes("thousand")) {
        punishment.maxFine = Math.max(punishment.maxFine, 10000);
      } else {
        punishment.maxFine = Math.max(punishment.maxFine, 5000);
      }
    }
  });

  // Set minimum terms
  if (punishment.maxJailTerm !== "none" && punishment.maxJailTerm !== "death") {
    punishment.minJailTerm = "6 months";
  }
  if (punishment.maxFine > 0) {
    punishment.minFine = Math.floor(punishment.maxFine * 0.1);
  }

  return punishment;
};

// Generate procedures
const generateProcedures = (category, classification) => {
  if (classification.type === "criminal") {
    return [
      {
        step: 1,
        title: "File FIR (First Information Report)",
        description: "Visit the nearest police station and file an FIR. Provide all details of the incident and supporting evidence.",
        estimatedDuration: "1-2 days",
      },
      {
        step: 2,
        title: "Police Investigation",
        description: "Police will investigate the matter, collect evidence, and record statements from witnesses.",
        estimatedDuration: "2-6 months",
      },
      {
        step: 3,
        title: "Charge Sheet Filing",
        description: "If evidence is found, police will file a charge sheet in the court.",
        estimatedDuration: "1-3 months",
      },
      {
        step: 4,
        title: "Court Proceedings",
        description: "Case will be heard in court with arguments from both sides.",
        estimatedDuration: "6-24 months",
      },
      {
        step: 5,
        title: "Judgment",
        description: "Court will deliver the final judgment based on evidence and arguments.",
        estimatedDuration: "Variable",
      },
    ];
  } else {
    // Civil procedures
    return [
      {
        step: 1,
        title: "Consultation with Lawyer",
        description: "Consult with a civil lawyer to discuss your case and gather necessary documents.",
        estimatedDuration: "1-2 weeks",
      },
      {
        step: 2,
        title: "File Civil Suit",
        description: "File a civil suit in the appropriate court with all necessary documentation and court fees.",
        estimatedDuration: "1-2 weeks",
      },
      {
        step: 3,
        title: "Service of Summons",
        description: "Court will issue summons to the defendant.",
        estimatedDuration: "2-4 weeks",
      },
      {
        step: 4,
        title: "Written Statement & Discovery",
        description: "Defendant files written statement, followed by discovery and evidence exchange.",
        estimatedDuration: "3-6 months",
      },
      {
        step: 5,
        title: "Trial and Arguments",
        description: "Court hearings with examination of witnesses and legal arguments.",
        estimatedDuration: "6-18 months",
      },
      {
        step: 6,
        title: "Judgment and Decree",
        description: "Court delivers judgment and issues decree.",
        estimatedDuration: "Variable",
      },
    ];
  }
};

// Generate required documents
const generateRequiredDocuments = (category) => {
  const commonDocs = [
    { documentName: "Identity Proof", description: "Aadhaar Card, PAN Card, or Passport", mandatory: true },
    { documentName: "Address Proof", description: "Utility bill, Rent agreement, or Aadhaar", mandatory: true },
  ];

  const categoryDocs = {
    criminal: [
      { documentName: "FIR Copy", description: "Copy of the filed FIR", mandatory: true },
      { documentName: "Medical Reports", description: "If injuries are involved", mandatory: false },
      { documentName: "Witness Statements", description: "Statements from eyewitnesses", mandatory: false },
      { documentName: "CCTV Footage", description: "If available", mandatory: false },
    ],
    cyber: [
      { documentName: "Screenshots/Evidence", description: "Digital evidence of the crime", mandatory: true },
      { documentName: "Transaction Records", description: "Bank statements, payment records", mandatory: true },
      { documentName: "Communication Records", description: "Emails, messages, chat logs", mandatory: true },
      { documentName: "Cyber Cell Complaint", description: "Complaint filed with cyber cell", mandatory: true },
    ],
    property: [
      { documentName: "Property Documents", description: "Sale deed, title deed, or ownership documents", mandatory: true },
      { documentName: "Survey/Layout Plan", description: "Property survey and approved plans", mandatory: true },
      { documentName: "Tax Receipts", description: "Property tax payment receipts", mandatory: true },
      { documentName: "Possession Certificate", description: "Proof of possession", mandatory: false },
    ],
    family: [
      { documentName: "Marriage Certificate", description: "Proof of marriage", mandatory: true },
      { documentName: "Income Proof", description: "Salary slips, IT returns", mandatory: true },
      { documentName: "Children's Birth Certificates", description: "If custody is involved", mandatory: false },
      { documentName: "Property Documents", description: "Joint property documents", mandatory: false },
    ],
    civil: [
      { documentName: "Agreement/Contract", description: "Original agreement or contract", mandatory: true },
      { documentName: "Correspondence", description: "Letters, emails, notices exchanged", mandatory: true },
      { documentName: "Payment Receipts", description: "Proof of payments made", mandatory: false },
    ],
  };

  return [...commonDocs, ...(categoryDocs[category] || [])];
};

// Determine jurisdiction
const determineJurisdiction = (category, classification) => {
  let courtLevel = "magistrate";

  if (classification.severityLevel === "critical") {
    courtLevel = "sessions";
  } else if (classification.severityLevel === "high") {
    courtLevel = "sessions";
  } else if (classification.type === "civil") {
    courtLevel = "district";
  }

  return {
    policeStation: "Nearest Police Station",
    courtLevel,
    courtName: `${courtLevel.charAt(0).toUpperCase() + courtLevel.slice(1)} Court`,
    courtAddress: "To be determined based on location",
  };
};

// Calculate confidence score
const calculateConfidenceScore = (sections, keywords) => {
  if (sections.length === 0) return 30;
  if (sections.length >= 5 && keywords.length >= 3) return 85;
  if (sections.length >= 3 && keywords.length >= 2) return 70;
  if (sections.length >= 1) return 55;
  return 40;
};

// Generate lawyer recommendations based on case
const generateLawyerRecommendations = (category, classification) => {
  const lawyers = [
    {
      name: "Adv. Rajesh Kumar",
      specialization: ["Criminal Law", "Cyber Crime"],
      experience: 15,
      location: "Delhi",
      rating: 4.8,
      consultationFee: 2000,
      caseFee: { min: 25000, max: 150000 },
      contactInfo: { phone: "+91-98XXXXXX01", email: "rajesh.kumar@lawfirm.in" },
      availability: "within_week",
    },
    {
      name: "Adv. Priya Sharma",
      specialization: ["Civil Law", "Property Disputes"],
      experience: 12,
      location: "Mumbai",
      rating: 4.7,
      consultationFee: 1500,
      caseFee: { min: 20000, max: 100000 },
      contactInfo: { phone: "+91-98XXXXXX02", email: "priya.sharma@lawfirm.in" },
      availability: "immediate",
    },
    {
      name: "Adv. Vikram Singh",
      specialization: ["Family Law", "Divorce"],
      experience: 10,
      location: "Bangalore",
      rating: 4.6,
      consultationFee: 1800,
      caseFee: { min: 30000, max: 120000 },
      contactInfo: { phone: "+91-98XXXXXX03", email: "vikram.singh@lawfirm.in" },
      availability: "within_week",
    },
    {
      name: "Adv. Anita Desai",
      specialization: ["Consumer Law", "Corporate Law"],
      experience: 8,
      location: "Pune",
      rating: 4.5,
      consultationFee: 1200,
      caseFee: { min: 15000, max: 80000 },
      contactInfo: { phone: "+91-98XXXXXX04", email: "anita.desai@lawfirm.in" },
      availability: "immediate",
    },
  ];

  // Filter lawyers based on specialization
  const relevantLawyers = lawyers.filter((lawyer) => {
    if (category === "criminal" || category === "cyber") {
      return lawyer.specialization.some((s) => s.includes("Criminal") || s.includes("Cyber"));
    }
    if (category === "property" || category === "civil") {
      return lawyer.specialization.some((s) => s.includes("Civil") || s.includes("Property"));
    }
    if (category === "family") {
      return lawyer.specialization.some((s) => s.includes("Family"));
    }
    if (category === "consumer" || category === "corporate") {
      return lawyer.specialization.some((s) => s.includes("Consumer") || s.includes("Corporate"));
    }
    return true;
  });

  return relevantLawyers.length > 0 ? relevantLawyers.slice(0, 3) : lawyers.slice(0, 3);
};

// Generate cost estimation
const generateCostEstimation = (category, classification, lawyerRecommendations) => {
  const baseCosts = {
    criminal: { consultation: [1500, 5000], filing: [5000, 30000], representation: [50000, 300000], documentation: [3000, 15000] },
    civil: { consultation: [1000, 4000], filing: [3000, 25000], representation: [30000, 200000], documentation: [2000, 12000] },
    cyber: { consultation: [2000, 5000], filing: [5000, 30000], representation: [40000, 250000], documentation: [5000, 20000] },
    property: { consultation: [1500, 5000], filing: [10000, 50000], representation: [50000, 300000], documentation: [5000, 25000] },
    family: { consultation: [1000, 3000], filing: [5000, 20000], representation: [25000, 150000], documentation: [3000, 15000] },
    consumer: { consultation: [500, 2000], filing: [2000, 10000], representation: [10000, 50000], documentation: [1000, 5000] },
    corporate: { consultation: [3000, 10000], filing: [10000, 50000], representation: [100000, 500000], documentation: [10000, 30000] },
  };

  const costs = baseCosts[category] || baseCosts.civil;

  // Adjust based on severity
  let multiplier = 1;
  if (classification.severityLevel === "critical") multiplier = 1.5;
  else if (classification.severityLevel === "high") multiplier = 1.3;
  else if (classification.severityLevel === "low") multiplier = 0.8;

  return {
    consultationCost: { min: Math.floor(costs.consultation[0] * multiplier), max: Math.floor(costs.consultation[1] * multiplier) },
    caseFilingCost: { min: Math.floor(costs.filing[0] * multiplier), max: Math.floor(costs.filing[1] * multiplier) },
    representationCost: { min: Math.floor(costs.representation[0] * multiplier), max: Math.floor(costs.representation[1] * multiplier) },
    documentationCost: { min: Math.floor(costs.documentation[0] * multiplier), max: Math.floor(costs.documentation[1] * multiplier) },
    totalEstimatedCost: {
      min: Math.floor((costs.consultation[0] + costs.filing[0] + costs.representation[0] + costs.documentation[0]) * multiplier),
      max: Math.floor((costs.consultation[1] + costs.filing[1] + costs.representation[1] + costs.documentation[1]) * multiplier),
    },
    currency: "INR",
  };
};

// Submit a new case
exports.submitCase = async (req, res) => {
  try {
    const {
      caseTitle,
      caseDescription,
      incidentCategory,
      incidentDate,
      incidentLocation,
    } = req.body;

    // Validate required fields
    if (!caseTitle || !caseDescription || !incidentCategory) {
      return res.status(400).json({
        success: false,
        message: "Please provide case title, description, and category",
      });
    }

    // Get user info
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Handle file uploads if any
    const supportingDocuments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "legalcase_documents",
            resource_type: "auto",
          });

          supportingDocuments.push({
            fileName: file.originalname,
            fileUrl: result.secure_url,
            fileType: file.mimetype,
          });

          // Delete temp file
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    }

    // Load legal database and analyze case
    const legalDB = loadLegalDatabase();
    const analysis = analyzeCaseWithAI(caseDescription, incidentCategory, legalDB);

    // Generate lawyer recommendations
    const lawyerRecommendations = generateLawyerRecommendations(incidentCategory, analysis.classification);

    // Generate cost estimation
    const costEstimation = generateCostEstimation(incidentCategory, analysis.classification, lawyerRecommendations);

    // Create case
    const newCase = await LegalCase.create({
      userId: req.user.userId,
      userEmail: user.email,
      userName: user.fullName || user.email,
      caseTitle,
      caseDescription,
      incidentCategory,
      incidentDate,
      incidentLocation: incidentLocation ? JSON.parse(incidentLocation) : {},
      supportingDocuments,
      analysis,
      lawyerRecommendations,
      costEstimation,
      status: "analyzed",
    });

    // Send email notification
    try {
      await sendEmail({
        to: user.email,
        subject: "Legal Case Analysis Complete - LEGALVAULT",
        html: `
          <h2>Case Analysis Complete</h2>
          <p>Dear ${user.fullName || "User"},</p>
          <p>Your legal case "${caseTitle}" has been analyzed successfully.</p>
          <p><strong>Case ID:</strong> ${newCase._id}</p>
          <p><strong>Category:</strong> ${incidentCategory}</p>
          <p><strong>Severity:</strong> ${analysis.classification.severityLevel}</p>
          <p><strong>Applicable Sections:</strong> ${analysis.applicableSections.length} sections found</p>
          <p>Login to your account to view the detailed analysis and recommendations.</p>
          <p>Best regards,<br>LEGALVAULT Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Case submitted and analyzed successfully",
      data: newCase,
    });
  } catch (error) {
    console.error("Error submitting case:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting case",
      error: error.message,
    });
  }
};

// Get all user cases
exports.getMyCases = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user.userId };
    if (status) query.status = status;
    if (category) query.incidentCategory = category;

    const cases = await LegalCase.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await LegalCase.countDocuments(query);

    res.json({
      success: true,
      data: cases,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching cases:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cases",
      error: error.message,
    });
  }
};

// Get case by ID
exports.getCaseById = async (req, res) => {
  try {
    const caseData = await LegalCase.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    res.json({
      success: true,
      data: caseData,
    });
  } catch (error) {
    console.error("Error fetching case:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching case",
      error: error.message,
    });
  }
};

// Update case status
exports.updateCaseStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const caseData = await LegalCase.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    caseData.status = status;
    if (notes) {
      caseData.notes.push({
        content: notes,
        addedBy: req.user.email,
      });
    }

    await caseData.save();

    res.json({
      success: true,
      message: "Case status updated successfully",
      data: caseData,
    });
  } catch (error) {
    console.error("Error updating case:", error);
    res.status(500).json({
      success: false,
      message: "Error updating case",
      error: error.message,
    });
  }
};

// Get user case statistics
exports.getCaseStats = async (req, res) => {
  try {
    const stats = await LegalCase.getUserStats(req.user.userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// Delete case
exports.deleteCase = async (req, res) => {
  try {
    const caseData = await LegalCase.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    res.json({
      success: true,
      message: "Case deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting case:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting case",
      error: error.message,
    });
  }
};

// Admin: Get all cases
exports.getAllCases = async (req, res) => {
  try {
    const { status, category, severity, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.incidentCategory = category;
    if (severity) query["analysis.classification.severityLevel"] = severity;

    const cases = await LegalCase.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("userId", "fullName email");

    const total = await LegalCase.countDocuments(query);

    res.json({
      success: true,
      data: cases,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching all cases:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cases",
      error: error.message,
    });
  }
};

// Admin: Get platform statistics
exports.getPlatformStats = async (req, res) => {
  try {
    const totalCases = await LegalCase.countDocuments();

    const byStatus = await LegalCase.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const byCategory = await LegalCase.aggregate([
      {
        $group: {
          _id: "$incidentCategory",
          count: { $sum: 1 },
        },
      },
    ]);

    const bySeverity = await LegalCase.aggregate([
      {
        $group: {
          _id: "$analysis.classification.severityLevel",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalCases,
        byStatus,
        byCategory,
        bySeverity,
      },
    });
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// Search cases from Indian Kanoon
exports.searchCases = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
        cases: [],
      });
    }

    // Fetch from Indian Kanoon
    const result = await searchIndianKanoon(q.trim(), parseInt(page), parseInt(limit));

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      cases: result.cases || [],
      pagination: result.pagination,
      note: result.note,
    });
  } catch (error) {
    console.error("Error searching cases:", error);
    res.status(500).json({
      success: false,
      message: "Error searching cases",
      error: error.message,
      cases: [],
    });
  }
};
