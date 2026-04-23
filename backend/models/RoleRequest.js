const mongoose = require("mongoose");

const roleRequestSchema = new mongoose.Schema(
  {
    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Not required for new users
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Role Information
    requestedRole: {
      type: String,
      enum: ["police", "lawyer", "judge", "forensic_expert"],
      required: true,
    },
    
    // Organization Details
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    departmentId: {
      type: String,
      trim: true,
    },
    
    // Address Information
    officeAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    
    // Documents Upload URLs (Cloudinary)
    documents: {
      idProof: {
        url: String,
        publicId: String,
        filename: String,
      },
      authorizationLetter: {
        url: String,
        publicId: String,
        filename: String,
      },
      registrationCertificate: {
        url: String,
        publicId: String,
        filename: String,
      },
      professionalLicense: {
        url: String,
        publicId: String,
        filename: String,
      },
      securityClearance: {
        url: String,
        publicId: String,
        filename: String,
      },
      additionalDocuments: [{
        url: String,
        publicId: String,
        filename: String,
      }],
    },
    
    // Request Status
    status: {
      type: String,
      enum: ["pending", "under_review", "verified", "approved", "rejected"],
      default: "pending",
    },
    
    // RoleAssigner Verification
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    verificationNotes: {
      type: String,
    },
    verificationWatermark: {
      type: String, // RoleAssigner's name/signature
    },
    
    // Request Details
    purpose: {
      type: String,
      required: true,
    },
    caseDetails: {
      type: String,
    },
    
    // Admin Review
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    
    // Technical Requirements Confirmation
    technicalRequirements: {
      internetSpeed: { type: Boolean, default: false },
      systemSpecs: { type: Boolean, default: false },
      secureDevice: { type: Boolean, default: false },
      vpnCapability: { type: Boolean, default: false },
      twoFactorAuth: { type: Boolean, default: false },
    },
    
    // Verification
    backgroundVerificationStatus: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "failed"],
      default: "not_started",
    },
    
    // Terms & Conditions
    acceptedTerms: {
      type: Boolean,
      required: true,
      default: false,
    },
    acceptedAt: {
      type: Date,
    },
    
    // IP and User Agent for security
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
roleRequestSchema.index({ email: 1 });
roleRequestSchema.index({ status: 1 });
roleRequestSchema.index({ requestedRole: 1 });
roleRequestSchema.index({ userId: 1 });
roleRequestSchema.index({ createdAt: -1 });

// Virtual for request age in days
roleRequestSchema.virtual("ageInDays").get(function () {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to check if request is expired (pending for more than 30 days)
roleRequestSchema.methods.isExpired = function () {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.status === "pending" && this.createdAt < thirtyDaysAgo;
};

module.exports = mongoose.model("RoleRequest", roleRequestSchema);
