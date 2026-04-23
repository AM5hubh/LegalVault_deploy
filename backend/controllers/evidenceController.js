const EvidenceMetadata = require("../models/EvidenceMetadata");
const User = require("../models/User");
const { uploadFile, deleteFile } = require("../services/cloudinaryService");
const { uploadFileToIPFS } = require("../services/ipfsService");
const {
  addEvidence,
  verifyEvidence,
} = require("../services/blockchainService");
const {
  prepareEvidenceRegistration,
  verifyEvidenceTransaction,
} = require("../services/evidenceBlockchainService");
const { generateHash, generateUserHash } = require("../utils/hashUtils");
const { fileUploadSchema } = require("../utils/validationUtils");
const { logCustodyAction } = require("../services/blockchainService");
const logger = require("../utils/logger");
const multer = require("multer"); // Assume middleware handles upload

// Upload evidence (CRUD: Create)
exports.uploadEvidence = async (req, res) => {
  try {
    // Validate (assume multer middleware already processed file)
    const { error, value } = fileUploadSchema.validate({
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      caseId: req.body.caseId,
    });
    if (error) throw new Error(error.details[0].message);

    const userId = req.user.userId;

    // Check KYC
    const user = await User.findById(userId);
    if (user.kycStatus !== "verified") {
      return res.status(403).json({ message: "KYC verification required" });
    }

    // Upload to Cloudinary
    const { hash, publicId, url, fileType, size } = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    // Generate evidence ID
    const evidenceId = generateHash(`${userId}${Date.now()}${hash}`);

    // Add to blockchain
    const userHash = generateUserHash(user.email, user.aadhaarHash);
    const txHash = await addEvidence(evidenceId, hash, url, userHash);

    // Create metadata
    const evidence = new EvidenceMetadata({
      evidenceId,
      hash,
      cloudinaryPublicId: publicId,
      cloudinaryUrl: url,
      uploaderId: userId,
      fileType,
      fileName: req.file.originalname,
      size,
      caseId: req.body.caseId,
      status: "pending",
      metadata: { uploadTx: txHash },
    });
    await evidence.save();

    // Log action
    await logCustodyAction(evidenceId, "upload", userHash);

    logger.info("Evidence uploaded successfully", { evidenceId, userId });

    res.status(201).json({
      message: "Evidence uploaded successfully",
      evidenceId,
      url,
    });
  } catch (error) {
    logger.error("Evidence upload failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

// Step 1: Upload evidence to IPFS and prepare blockchain transaction
exports.uploadEvidenceToIPFS = async (req, res) => {
  try {
    // Validate (assume multer middleware already processed file)
    const { error, value } = fileUploadSchema.validate({
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      caseId: req.body.caseId,
    });
    if (error) throw new Error(error.details[0].message);

    const userId = req.user.userId;

    // Check KYC
    const user = await User.findById(userId);
    if (user.kycStatus !== "verified") {
      return res.status(403).json({ message: "KYC verification required" });
    }

    // Upload to IPFS
    const { cid, hash, ipfsUrl, fileSize } = await uploadFileToIPFS(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    // Prepare blockchain transaction data (client will sign this)
    // DocumentRegistry only needs CID and file hash
    const txData = await prepareEvidenceRegistration({
      ipfsCid: cid,
      ipfsHash: hash,
    });

    logger.info("Evidence uploaded to IPFS, blockchain tx prepared", {
      userId,
      cid,
    });

    // Return transaction data for client to sign
    res.status(200).json({
      message:
        "Evidence uploaded to IPFS. Please sign the blockchain transaction.",
      ipfsData: {
        cid,
        ipfsUrl,
        hash,
        fileSize,
      },
      blockchainTx: txData,
      requiresSignature: true,
    });
  } catch (error) {
    logger.error("Evidence IPFS upload failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

// Step 2: Confirm blockchain transaction and save to MongoDB
exports.confirmEvidenceBlockchain = async (req, res) => {
  try {
    const { txHash, ipfsData, caseId, evidenceType, description, fileName } =
      req.body;

    if (!txHash) {
      return res.status(400).json({ message: "Transaction hash required" });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    // Verify blockchain transaction
    const txResult = await verifyEvidenceTransaction(txHash);

    if (!txResult.success) {
      throw new Error("Blockchain transaction verification failed");
    }

    // Extract blockchain document ID from transaction
    const blockchainDocumentId = txResult.documentId;

    // Create metadata with IPFS and blockchain details
    const evidence = new EvidenceMetadata({
      evidenceId: blockchainDocumentId,
      hash: ipfsData.hash,
      ipfsCID: ipfsData.cid,
      ipfsUrl: ipfsData.ipfsUrl,
      uploaderId: userId,
      fileType: ipfsData.fileType || req.body.fileType,
      fileName: fileName || "evidence-file",
      size: ipfsData.fileSize || 0,
      caseId: caseId,
      storageType: "ipfs",
      status: "pending",
      metadata: {
        blockchainTxHash: txHash,
        blockNumber: txResult.blockNumber,
        gasUsed: txResult.gasUsed,
        uploadMethod: "IPFS+Blockchain",
        evidenceType: evidenceType || "digital",
        description: description,
        blockchainTimestamp: txResult.eventData?.timestamp?.toString(),
        uploaderAddress: txResult.eventData?.uploader,
      },
    });
    await evidence.save();

    // Log custody action
    const userHash = generateUserHash(user.email, user.aadhaarHash);
    await logCustodyAction(blockchainDocumentId, "upload", userHash);

    logger.info("Document registered on blockchain and saved to MongoDB", {
      documentId: blockchainDocumentId,
      userId,
      txHash,
      blockNumber: txResult.blockNumber,
    });

    res.status(201).json({
      success: true,
      message: "Evidence successfully registered on blockchain and MongoDB",
      data: {
        evidenceId: blockchainDocumentId,
        documentId: blockchainDocumentId,
        txHash,
        blockNumber: txResult.blockNumber,
        ipfsCid: ipfsData.cid,
        ipfsUrl: ipfsData.ipfsUrl,
        gasUsed: txResult.gasUsed,
      },
    });
  } catch (error) {
    logger.error("Evidence blockchain confirmation failed", {
      error: error.message,
    });
    res.status(400).json({ message: error.message });
  }
};

// Get evidence by ID (CRUD: Read)
exports.getEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const evidence = await EvidenceMetadata.findOne({
      evidenceId: id,
    }).populate("uploaderId", "email fullName role");

    if (!evidence) {
      return res.status(404).json({ message: "Evidence not found" });
    }

    // Verify hash from blockchain
    const isValid = await verifyEvidence(id, evidence.hash);
    if (!isValid) {
      return res.status(400).json({ message: "Evidence tampered" });
    }

    // Check access (role-based)
    const isAdmin = req.user.role === "admin";
    const isUploader = evidence.uploaderId._id.toString() === req.user.userId;
    if (!isAdmin && !isUploader) {
      return res.status(403).json({ message: "Access denied" });
    }

    logger.info("Evidence retrieved", {
      evidenceId: id,
      userId: req.user.userId,
    });

    res.json(evidence);
  } catch (error) {
    logger.error("Get evidence failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// Update evidence status (CRUD: Update, admin/forensic)
exports.updateEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, caseId } = req.body;
    const allowedStatuses = ["pending", "approved", "archived"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const evidence = await EvidenceMetadata.findOne({ evidenceId: id });
    if (!evidence) {
      return res.status(404).json({ message: "Evidence not found" });
    }

    // Check access
    const isAdmin = req.user.role === "admin";
    const isUploader = evidence.uploaderId.toString() === req.user.userId;
    if (!isAdmin && !isUploader) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update
    evidence.status = status;
    if (caseId) evidence.caseId = caseId;
    await evidence.save();

    // Log action
    const userHash = generateUserHash(req.user.email, req.user.aadhaarHash);
    await logCustodyAction(id, "update", userHash);

    logger.info("Evidence updated", {
      evidenceId: id,
      status,
      userId: req.user.userId,
    });

    res.json({ message: "Evidence updated", evidence });
  } catch (error) {
    logger.error("Update evidence failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

// Delete evidence (CRUD: Delete, admin/uploader)
exports.deleteEvidence = async (req, res) => {
  try {
    const { id } = req.params;

    const evidence = await EvidenceMetadata.findOne({ evidenceId: id });
    if (!evidence) {
      return res.status(404).json({ message: "Evidence not found" });
    }

    // Check access
    const isAdmin = req.user.role === "admin";
    const isUploader = evidence.uploaderId.toString() === req.user.userId;
    if (!isAdmin && !isUploader) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Soft delete (set status to archived)
    evidence.status = "archived";
    await evidence.save();

    // Delete from Cloudinary
    await deleteFile(evidence.cloudinaryPublicId);

    // Log action
    const userHash = generateUserHash(req.user.email, req.user.aadhaarHash);
    await logCustodyAction(id, "delete", userHash);

    logger.info("Evidence deleted", {
      evidenceId: id,
      userId: req.user.userId,
    });

    res.json({ message: "Evidence deleted" });
  } catch (error) {
    logger.error("Delete evidence failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// Get all evidence (Admin CRUD: Read)
exports.getAllEvidence = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { page = 1, limit = 10, status, uploaderId, caseId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (uploaderId) filter.uploaderId = uploaderId;
    if (caseId) filter.caseId = caseId;

    const evidence = await EvidenceMetadata.find(filter)
      .populate("uploaderId", "email fullName role")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ uploadDate: -1 });

    const total = await EvidenceMetadata.countDocuments(filter);

    logger.info("Admin fetched all evidence", { page, limit, total });

    res.json({
      evidence,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    logger.error("Get all evidence failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};
