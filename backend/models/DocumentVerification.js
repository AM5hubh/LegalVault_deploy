const mongoose = require("mongoose");

const documentVerificationSchema = new mongoose.Schema(
  {
    // Reference to uploaded document
    documentId: {
      type: String, // Cloudinary public_id
      required: true,
    },
    documentUrl: {
      type: String, // Cloudinary URL
      required: true,
    },
    documentType: {
      type: String, // "id_proof", "legal_document", "court_order", "fir", "contract", etc.
      enum: [
        "id_proof",
        "legal_document",
        "court_order",
        "fir",
        "contract",
        "affidavit",
        "stamp_duty",
        "license",
        "other",
      ],
      required: true,
    },
    fileName: String,
    fileSize: Number, // in bytes
    mimeType: String,

    // User who uploaded
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Related case if any
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LegalCase",
    },

    // Verification Status
    verificationStatus: {
      type: String,
      enum: ["pending", "in_progress", "completed", "failed"],
      default: "pending",
    },

    // Verification Results - AI Text Detection
    aiTextDetection: {
      is_enabled: { type: Boolean, default: true },
      ai_text_probability: {
        type: Number,
        min: 0,
        max: 1,
      },
      human_text_probability: {
        type: Number,
        min: 0,
        max: 1,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
      },
      detected_patterns: [String], // ["repetitive_phrases", "statistical_anomaly", etc.]
      model_used: String, // "roberta-detector", "gpt-zero", "detect-gpt"
      processing_time_ms: Number,
    },

    // Verification Results - Image Deepfake Detection
    deepfakeDetection: {
      is_enabled: { type: Boolean, default: true },
      face_detected: Boolean,
      is_deepfake_probability: {
        type: Number,
        min: 0,
        max: 1,
      },
      authenticity_score: {
        type: Number,
        min: 0,
        max: 1,
      },
      morphing_detected: Boolean,
      artifacts_found: [String], // ["face_blending", "eye_anomaly", etc.]
      model_used: String, // "FaceForensics++", "EfficientNet"
      processing_time_ms: Number,
    },

    // Verification Results - Document Tampering Detection
    tamperingDetection: {
      is_enabled: { type: Boolean, default: true },
      tamper_probability: {
        type: Number,
        min: 0,
        max: 1,
      },
      tampering_detected: Boolean,
      tampering_regions: [
        {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
          confidence: Number,
          type: String, // "copy_move", "splicing", "clone", "edit"
        },
      ],
      ela_score: Number, // Error Level Analysis score
      is_jpeg_ghost: Boolean,
      noise_consistency: Number,
      suspicious_edits: [String], // ["timestamp_altered", "seal_replaced", etc.]
      model_used: String,
      processing_time_ms: Number,
    },

    // Verification Results - Signature Verification
    signatureVerification: {
      is_enabled: { type: Boolean, default: true },
      signature_detected: Boolean,
      signature_count: Number,
      signatures: [
        {
          position: String, // "top_right", "bottom_left", etc.
          confidence: Number,
          is_forged_probability: {
            type: Number,
            min: 0,
            max: 1,
          },
          authenticity_score: {
            type: Number,
            min: 0,
            max: 1,
          },
          comparison_score: Number, // against known samples
        },
      ],
      model_used: String, // "SigNet", "siamese-network"
      processing_time_ms: Number,
    },

    // Verification Results - OCR & Content Validation
    ocrAnalysis: {
      is_enabled: { type: Boolean, default: true },
      extracted_text: String,
      text_confidence: Number,
      language_detected: [String], // ["en", "hi", etc.]
      validation_results: {
        case_number_valid: Boolean,
        case_number_found: String,
        court_name_valid: Boolean,
        court_name_found: String,
        ipc_sections_found: [String],
        date_formats_consistent: Boolean,
        inconsistencies: [String], // ["date_mismatch", "invalid_case_number", etc.]
      },
      processing_time_ms: Number,
    },

    // Verification Results - Metadata & PDF Analysis
    metadataAnalysis: {
      is_enabled: { type: Boolean, default: true },
      pdf_metadata: {
        creation_date: Date,
        modification_date: Date,
        creation_software: String,
        creator: String,
        producer: String,
        pages_count: Number,
        has_layers: Boolean,
        is_encrypted: Boolean,
      },
      metadata_anomalies: [String], // ["software_mismatch", "timestamp_inconsistency", etc.]
      file_hash: String, // SHA256
      processing_time_ms: Number,
    },

    // Overall Risk Assessment
    riskAssessment: {
      overall_risk_score: {
        type: Number,
        min: 0,
        max: 100,
      },
      risk_level: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      },
      risk_factors: [
        {
          factor: String,
          score: Number,
          severity: String, // "low", "medium", "high"
          description: String,
        },
      ],
      recommendations: [String],
      flagged_for_manual_review: Boolean,
      manual_review_reason: String,
    },

    // Verification Timeline
    verificationStartedAt: Date,
    verificationCompletedAt: Date,

    // Manual Review (if needed)
    manualReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    manualReviewedAt: Date,
    manualReviewNotes: String,
    manualVerificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
    },

    // Error Tracking
    errors: [
      {
        stage: String, // "ocr", "deepfake_detection", "text_analysis", etc.
        error_message: String,
        error_code: String,
        timestamp: Date,
      },
    ],

    // AI-Generated Verification Summary
    verificationSummary: {
      summary_text: String,
      key_findings: [String],
      verdict: {
        type: String,
        enum: ["AUTHENTIC", "SUSPICIOUS", "FRAUDULENT", "INCONCLUSIVE"],
      },
      generated_by: String,
      generated_at: Date,
    },

    // Archive & Compliance
    is_archived: { type: Boolean, default: false },
    compliance_notes: String,

    // Audit Trail
    verification_attempts: [
      {
        attempt_number: Number,
        started_at: Date,
        completed_at: Date,
        status: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
documentVerificationSchema.index({ uploadedBy: 1 });
documentVerificationSchema.index({ caseId: 1 });
documentVerificationSchema.index({ verificationStatus: 1 });
documentVerificationSchema.index({ "riskAssessment.risk_level": 1 });
documentVerificationSchema.index({ createdAt: -1 });
documentVerificationSchema.index({ documentId: 1 });

// Virtual for verification age in hours
documentVerificationSchema.virtual("verificationAgeHours").get(function () {
  if (!this.verificationCompletedAt) return null;
  return Math.floor((new Date() - this.verificationCompletedAt) / (1000 * 60 * 60));
});

// Method to determine if document needs re-verification (older than 30 days)
documentVerificationSchema.methods.needsReVerification = function () {
  if (!this.verificationCompletedAt) return true;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.verificationCompletedAt < thirtyDaysAgo;
};

// Method to check if manual review is recommended
documentVerificationSchema.methods.requiresManualReview = function () {
  return (
    this.riskAssessment?.flagged_for_manual_review === true ||
    this.riskAssessment?.risk_level === "CRITICAL" ||
    this.riskAssessment?.risk_level === "HIGH"
  );
};

module.exports = mongoose.model("DocumentVerification", documentVerificationSchema);
