const mongoose = require("mongoose");

const legalCaseSchema = new mongoose.Schema(
  {
    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },

    // Case Input Details
    caseTitle: {
      type: String,
      required: true,
      trim: true,
    },
    caseDescription: {
      type: String,
      required: true,
    },
    incidentCategory: {
      type: String,
      enum: [
        "criminal",
        "civil",
        "cyber",
        "property",
        "family",
        "corporate",
        "labor",
        "consumer",
        "constitutional",
        "other",
      ],
      required: true,
    },
    incidentDate: {
      type: Date,
    },
    incidentLocation: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    // Uploaded Documents
    supportingDocuments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // AI Analysis Results
    analysis: {
      // Applicable Law Sections
      applicableSections: [
        {
          act: {
            type: String,
            enum: ["IPC", "CPC", "CRPC", "IT_ACT", "HMA", "IEA", "MVA", "IDA", "NIA"],
          },
          sectionNumber: String,
          sectionTitle: String,
          sectionDescription: String,
          relevanceScore: Number, // 0-100
        },
      ],

      // Case Classification
      classification: {
        type: {
          type: String,
          enum: ["criminal", "civil", "both"],
        },
        subType: String, // "theft", "fraud", "assault", "property_dispute", etc.
        severityLevel: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
        },
        compoundable: Boolean,
        cognizable: Boolean,
        bailable: Boolean,
      },

      // Punishment Details
      punishment: {
        minJailTerm: String, // "6 months", "1 year", "none"
        maxJailTerm: String, // "7 years", "life imprisonment", "death"
        minFine: Number,
        maxFine: Number,
        additionalPenalties: [String],
      },

      // Legal Procedures
      procedures: [
        {
          step: Number,
          title: String,
          description: String,
          estimatedDuration: String,
        },
      ],

      // Required Documents
      requiredDocuments: [
        {
          documentName: String,
          description: String,
          mandatory: Boolean,
        },
      ],

      // Court Jurisdiction
      jurisdiction: {
        policeStation: String,
        courtLevel: {
          type: String,
          enum: ["magistrate", "sessions", "district", "high_court", "supreme_court"],
        },
        courtName: String,
        courtAddress: String,
      },

      // AI Confidence Score
      confidenceScore: {
        type: Number,
        min: 0,
        max: 100,
      },

      // Analysis Timestamp
      analyzedAt: {
        type: Date,
        default: Date.now,
      },
    },

    // Lawyer Recommendations
    lawyerRecommendations: [
      {
        name: String,
        specialization: [String],
        experience: Number, // years
        location: String,
        rating: Number,
        consultationFee: Number,
        caseFee: {
          min: Number,
          max: Number,
        },
        contactInfo: {
          phone: String,
          email: String,
        },
        availability: {
          type: String,
          enum: ["immediate", "within_week", "within_month"],
        },
      },
    ],

    // Cost Estimation
    costEstimation: {
      consultationCost: {
        min: Number,
        max: Number,
      },
      caseFilingCost: {
        min: Number,
        max: Number,
      },
      representationCost: {
        min: Number,
        max: Number,
      },
      documentationCost: {
        min: Number,
        max: Number,
      },
      totalEstimatedCost: {
        min: Number,
        max: Number,
      },
      currency: {
        type: String,
        default: "INR",
      },
    },

    // Case Status
    status: {
      type: String,
      enum: [
        "pending_analysis",
        "analyzed",
        "lawyer_contacted",
        "case_filed",
        "under_investigation",
        "in_court",
        "resolved",
        "closed",
      ],
      default: "pending_analysis",
    },

    // Case Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Additional Notes
    notes: [
      {
        content: String,
        addedBy: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Outcome Prediction (Future Feature)
    outcomePrediction: {
      winProbability: Number, // 0-100
      factors: [String],
      similarCases: [
        {
          caseId: String,
          outcome: String,
          similarity: Number,
        },
      ],
    },

    // FIR Details (if filed)
    firDetails: {
      firNumber: String,
      filingDate: Date,
      policeStation: String,
      investigatingOfficer: String,
      status: String,
    },

    // Court Case Details (if filed)
    courtCaseDetails: {
      caseNumber: String,
      filingDate: Date,
      courtName: String,
      nextHearingDate: Date,
      judge: String,
      caseStatus: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
legalCaseSchema.index({ userId: 1, createdAt: -1 });
legalCaseSchema.index({ status: 1 });
legalCaseSchema.index({ "analysis.classification.type": 1 });
legalCaseSchema.index({ incidentCategory: 1 });

// Virtual for case age
legalCaseSchema.virtual("caseAge").get(function () {
  const ageInDays = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  if (ageInDays === 0) return "Today";
  if (ageInDays === 1) return "1 day ago";
  if (ageInDays < 30) return `${ageInDays} days ago`;
  if (ageInDays < 365) return `${Math.floor(ageInDays / 30)} months ago`;
  return `${Math.floor(ageInDays / 365)} years ago`;
});

// Method to get case summary
legalCaseSchema.methods.getSummary = function () {
  return {
    caseId: this._id,
    title: this.caseTitle,
    category: this.incidentCategory,
    severity: this.analysis?.classification?.severityLevel || "unknown",
    status: this.status,
    createdAt: this.createdAt,
    sections: this.analysis?.applicableSections?.length || 0,
    estimatedCost: this.costEstimation?.totalEstimatedCost,
  };
};

// Static method to get user case statistics
legalCaseSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalCases = await this.countDocuments({ userId });

  return {
    totalCases,
    byStatus: stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
  };
};

module.exports = mongoose.model("LegalCase", legalCaseSchema);
