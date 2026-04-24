const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "role_assigner", "police", "lawyer", "judge", "forensic_expert", "user"],
      default: "user",
    },
    agency: {
      type: String,
      trim: true,
    },
    kycStatus: {
      type: String,
      enum: ["verified", "pending", "rejected", "expired"],
      default: "pending",
    },
    kycVerifiedAt: Date,
    kycExpiry: Date,
    aadhaarHash: {
      type: String,
      sparse: true,
    },
    kycRejectionReason: String,
    kycData: {
      // Basic details
      careOf: String,
      emailHash: String,
      mobileHash: String,
      photo: String, // Base64 encoded photo from Aadhaar
      shareCode: String,
      yearOfBirth: Number,
      aadhaarLastFour: String,
      registrar: String,
      
      // Dates and validity
      issueDate: Date,
      expiryDate: Date,
      
      // Verification details
      status: String,
      message: String,
      faceMatch: Boolean,
      hasPhoto: Boolean,
      
      // Metadata
      uid: String,
    },
    tempKycData: {
      aadhaarHash: String,
      transactionId: String,
      referenceId: Number,
      aadhaarLastFour: String,
      generatedAt: Date,
      expiresAt: Date,
    },

    // Address information
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pinCode: String,
      country: { type: String, default: "India" },
      fullAddress: String, // Full address from KYC
    },

    // Personal information
    dob: Date,
    gender: {
      type: String,
      enum: ["M", "F", "O"],
    },

    // Login tracking - Fixed schema
    lastLoginAt: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    ipAddresses: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^::1$|^localhost$/.test(v);
          },
          message: "Invalid IP address format",
        },
      },
    ],

    // Activity logging - Enhanced schema
    activityLog: [
      {
        action: {
          type: String,
          required: true,
          enum: [
            "login",
            "logout",
            "register",
            "profile_updated",
            "password_changed",
            "role_updated",
            "kyc_updated",
            "account_banned",
            "account_unbanned",
            "admin_note_added",
            "evidence_uploaded",
            "case_created",
            "case_updated",
            "case_deleted",
            "evidence_deleted",
            "view_user_details",
            "update_user_role",
            "update_user_status",
            "ban_user",
            "add_admin_note",
            // Blog-related actions
            "blog_created",
            "blog_updated",
            "blog_deleted",
            "blog_viewed",
            // Document-related actions
            "document_uploaded",
            "document_deleted",
          ],
        },
        timestamp: {
          type: Date,
          default: Date.now,
          required: true,
        },
        ipAddress: {
          type: String,
          default: "Unknown",
        },
        userAgent: {
          type: String,
          default: "Unknown",
        },
        details: {
          type: String,
          default: "",
        },
        category: {
          type: String,
          enum: [
            "authentication",
            "profile",
            "admin",
            "system",
            "security",
            "blog",
          ],
          default: "system",
        },
        severity: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
          default: "low",
        },
      },
    ],

    // Account status
    banned: {
      type: Boolean,
      default: false,
    },
    banUpdatedAt: Date,
    banUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // History tracking
    roleHistory: [
      {
        oldRole: String,
        newRole: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
      },
    ],

    statusHistory: [
      {
        oldStatus: String,
        newStatus: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
      },
    ],

    banHistory: [
      {
        oldStatus: Boolean,
        newStatus: Boolean,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
      },
    ],

    // Admin notes
    adminNotes: [
      {
        note: {
          type: String,
          required: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // IPFS Documents
    documents: [
      {
        cid: {
          type: String,
          required: true,
          trim: true,
        },
        fileName: {
          type: String,
          required: true,
          trim: true,
        },
        fileType: {
          type: String,
          trim: true,
        },
        fileSize: {
          type: Number,
        },
        hash: {
          type: String,
          trim: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        description: {
          type: String,
          trim: true,
        },
        status: {
          type: String,
          enum: ["pending", "confirmed", "failed"],
          default: "pending",
        },
        ipfsUrl: {
          type: String,
          trim: true,
        },
      },
    ],

    // Wallet Integration
    primaryWallet: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^0x[a-fA-F0-9]{40}$/, // Ethereum address format
    },

    linkedWallets: [
      {
        address: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
          match: /^0x[a-fA-F0-9]{40}$/,
        },
        label: {
          type: String,
          trim: true,
        },
        isVerified: {
          type: Boolean,
          default: false,
        },
        verificationSignature: String, // Signature from wallet verification
        linkedAt: {
          type: Date,
          default: Date.now,
        },
        lastUsedAt: Date,
        Chain: {
          type: String,
          default: "sepolia", // Default to Sepolia testnet
        },
      },
    ],

    walletVerificationStatus: {
      type: String,
      enum: ["unverified", "verified", "pending", "rejected"],
      default: "unverified",
    },

    walletVerifiedAt: Date,

    walletMetadata: {
      verificationMethod: String, // "message_signature" or other methods
      lastVerificationIP: String,
      totalWalletsLinked: {
        type: Number,
        default: 0,
      },
    },

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
