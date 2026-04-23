const mongoose = require("mongoose");

const evidenceMetadataSchema = new mongoose.Schema({
  evidenceId: {
    type: String, // Blockchain-generated ID
    required: true,
    unique: true,
  },
  hash: {
    type: String, // SHA-256 hash of file
    required: true,
  },
  storageType: {
    type: String, // 'cloudinary' or 'ipfs'
    enum: ["cloudinary", "ipfs"],
    default: "cloudinary",
  },
  // Cloudinary storage
  cloudinaryPublicId: {
    type: String, // Cloudinary public_id
  },
  cloudinaryUrl: {
    type: String, // Cloudinary secure_url
  },
  enhancedPublicId: {
    type: String, // Cloudinary public_id for enhanced version
  },
  enhancedUrl: {
    type: String, // Cloudinary secure_url for enhanced version
  },
  // IPFS storage
  ipfsCID: {
    type: String, // IPFS Content Identifier
  },
  ipfsUrl: {
    type: String, // IPFS gateway URL
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileType: {
    type: String, // e.g., image/jpeg, video/mp4
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  size: {
    type: Number, // File size in bytes
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "archived"],
    default: "pending",
  },
  caseId: {
    type: String, // Optional case identifier
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Object, // e.g., GPS, EXIF, uploader details, uploadMethod, evidenceType, blockchain data
  },
  // Blockchain transaction details
  blockchainTxHash: {
    type: String, // Transaction hash from blockchain
  },
  blockchainEvidenceId: {
    type: String, // Evidence ID from smart contract (may differ from evidenceId)
  },
  blockNumber: {
    type: Number, // Block number where transaction was mined
  },
  gasUsed: {
    type: String, // Gas used for transaction
  },
  uploaderWalletAddress: {
    type: String, // Wallet address that signed the transaction
  },
});

evidenceMetadataSchema.index({ evidenceId: 1 });
evidenceMetadataSchema.index({ uploaderId: 1 });
evidenceMetadataSchema.index({ status: 1 });
evidenceMetadataSchema.index({ storageType: 1 });
evidenceMetadataSchema.index({ ipfsCID: 1 });

module.exports = mongoose.model("EvidenceMetadata", evidenceMetadataSchema);
