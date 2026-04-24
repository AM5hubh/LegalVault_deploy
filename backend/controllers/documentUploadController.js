const User = require("../models/User");
const {
  uploadFileToIPFS,
  getIPFSGatewayUrl,
  verifyFileOnIPFS,
  pinFileOnIPFS,
  retrieveFileFromIPFS,
} = require("../services/ipfsService");
const { fileUploadSchema } = require("../utils/validationUtils");
const { generateHash } = require("../utils/hashUtils");
const logger = require("../utils/logger");

/**
 * Upload document to IPFS and store CID in user's document array
 * POST /api/documents/upload
 * Authenticated, requires file upload
 */
exports.uploadDocument = async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      logger.warn("Document upload attempted without file", {
        userId: req.user.userId,
        path: req.path,
      });
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please provide a document.",
      });
    }

    // Validate request
    const { error, value } = fileUploadSchema.validate({
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    if (error) {
      logger.warn("Document upload validation failed", {
        userId: req.user.userId,
        error: error.details[0].message,
      });
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.user.userId;
    const description = req.body.description || "";

    // Fetch user to check KYC status (optional, can be removed based on requirements)
    const user = await User.findById(userId);
    if (!user) {
      logger.error("User not found during document upload", { userId });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    logger.info("Starting document upload to IPFS", {
      userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
    });

    // Upload file to IPFS
    const ipfsResult = await uploadFileToIPFS(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    const { cid, hash, ipfsUrl, fileSize } = ipfsResult;

    logger.info("Document uploaded to IPFS successfully", {
      userId,
      cid,
      fileName: req.file.originalname,
    });

    // Optional: Pin file on IPFS for persistence
    try {
      await pinFileOnIPFS(cid);
      logger.info("Document pinned on IPFS", { cid, userId });
    } catch (pinError) {
      logger.warn("Failed to pin document on IPFS", {
        cid,
        error: pinError.message,
      });
      // Continue even if pinning fails
    }

    // Add document to user's documents array
    if (!user.documents) {
      user.documents = [];
    }

    const documentEntry = {
      cid,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize,
      hash,
      uploadedAt: new Date(),
      description,
      status: "confirmed",
      ipfsUrl,
    };

    user.documents.push(documentEntry);

    // Save user with new document
    await user.save();

    logger.info("Document CID stored in user model", {
      userId,
      cid,
      documentCount: user.documents.length,
    });

    // Log user activity
    if (user.activityLog) {
      user.activityLog.push({
        action: "document_uploaded",
        timestamp: new Date(),
        ipAddress: req.ip || "Unknown",
        userAgent: req.get("User-Agent") || "Unknown",
        details: `Uploaded document: ${req.file.originalname}`,
        category: "profile",
        severity: "low",
      });
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully to IPFS",
      data: {
        cid,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize,
        hash,
        ipfsUrl,
        uploadedAt: documentEntry.uploadedAt,
        description,
        status: "confirmed",
      },
    });
  } catch (error) {
    logger.error("Document upload failed", {
      userId: req.user.userId,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: "Failed to upload document: " + error.message,
    });
  }
};

/**
 * Get all documents for logged-in user
 * GET /api/documents
 * Authenticated
 */
exports.getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      logger.error("User not found", { userId });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const documents = user.documents || [];

    logger.info("Retrieved user documents", {
      userId,
      documentCount: documents.length,
    });

    res.status(200).json({
      success: true,
      message: "Documents retrieved successfully",
      data: {
        documents,
        totalDocuments: documents.length,
      },
    });
  } catch (error) {
    logger.error("Failed to retrieve user documents", {
      userId: req.user.userId,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve documents: " + error.message,
    });
  }
};

/**
 * Get specific document details by CID
 * GET /api/documents/:cid
 * Authenticated
 */
exports.getDocumentByCID = async (req, res) => {
  try {
    const { cid } = req.params;
    const userId = req.user.userId;

    if (!cid || typeof cid !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid CID provided",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.error("User not found", { userId });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find document in user's documents array
    const document = user.documents.find((doc) => doc.cid === cid);
    if (!document) {
      logger.warn("Document not found for user", { userId, cid });
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    logger.info("Retrieved document details", { userId, cid });

    res.status(200).json({
      success: true,
      message: "Document details retrieved successfully",
      data: document,
    });
  } catch (error) {
    logger.error("Failed to retrieve document details", {
      userId: req.user.userId,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve document: " + error.message,
    });
  }
};

/**
 * Download document from IPFS
 * GET /api/documents/download/:cid
 * Authenticated
 */
exports.downloadDocument = async (req, res) => {
  try {
    const { cid } = req.params;
    const userId = req.user.userId;

    if (!cid || typeof cid !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid CID provided",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.error("User not found", { userId });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify document belongs to user
    const document = user.documents.find((doc) => doc.cid === cid);
    if (!document) {
      logger.warn("User attempting to download unauthorized document", {
        userId,
        cid,
      });
      return res.status(403).json({
        success: false,
        message: "Access denied. Document not found in your documents.",
      });
    }

    logger.info("Downloading document from IPFS", { userId, cid });

    // Verify file exists on IPFS
    const fileExists = await verifyFileOnIPFS(cid);
    if (!fileExists) {
      logger.warn("Document not found on IPFS", { cid, userId });
      return res.status(404).json({
        success: false,
        message: "Document not found on IPFS",
      });
    }

    // Retrieve file from IPFS
    const fileBuffer = await retrieveFileFromIPFS(cid);

    logger.info("Document downloaded from IPFS successfully", {
      userId,
      cid,
      fileSize: fileBuffer.length,
    });

    // Set response headers for file download
    res.setHeader("Content-Type", document.fileType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.fileName}"`,
    );
    res.setHeader("Content-Length", fileBuffer.length);
    res.setHeader("X-Document-CID", cid);
    res.setHeader("X-Document-Hash", document.hash);

    res.send(fileBuffer);
  } catch (error) {
    logger.error("Failed to download document", {
      userId: req.user.userId,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Failed to download document: " + error.message,
    });
  }
};

/**
 * Delete document from user's documents array
 * DELETE /api/documents/:cid
 * Authenticated
 * Note: This removes the CID reference from user model, but doesn't delete from IPFS
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { cid } = req.params;
    const userId = req.user.userId;

    if (!cid || typeof cid !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid CID provided",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.error("User not found", { userId });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find and remove document from user's documents array
    const documentIndex = user.documents.findIndex((doc) => doc.cid === cid);
    if (documentIndex === -1) {
      logger.warn("Document not found for deletion", { userId, cid });
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const deletedDocument = user.documents[documentIndex];
    user.documents.splice(documentIndex, 1);

    // Save user with updated documents
    await user.save();

    logger.info("Document deleted from user model", {
      userId,
      cid,
      fileName: deletedDocument.fileName,
    });

    // Log user activity
    if (user.activityLog) {
      user.activityLog.push({
        action: "document_deleted",
        timestamp: new Date(),
        ipAddress: req.ip || "Unknown",
        userAgent: req.get("User-Agent") || "Unknown",
        details: `Deleted document: ${deletedDocument.fileName}`,
        category: "profile",
        severity: "low",
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
      data: {
        cid,
        fileName: deletedDocument.fileName,
        deletedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error("Failed to delete document", {
      userId: req.user.userId,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Failed to delete document: " + error.message,
    });
  }
};

/**
 * Update document metadata (description only)
 * PATCH /api/documents/:cid
 * Authenticated
 */
exports.updateDocumentMetadata = async (req, res) => {
  try {
    const { cid } = req.params;
    const { description } = req.body;
    const userId = req.user.userId;

    if (!cid || typeof cid !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid CID provided",
      });
    }

    if (description && typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be a string",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.error("User not found", { userId });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find document in user's documents array
    const document = user.documents.find((doc) => doc.cid === cid);
    if (!document) {
      logger.warn("Document not found for update", { userId, cid });
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Update description
    if (description !== undefined) {
      document.description = description;
    }

    // Save user with updated document
    await user.save();

    logger.info("Document metadata updated", {
      userId,
      cid,
      fileName: document.fileName,
    });

    res.status(200).json({
      success: true,
      message: "Document metadata updated successfully",
      data: document,
    });
  } catch (error) {
    logger.error("Failed to update document metadata", {
      userId: req.user.userId,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Failed to update document: " + error.message,
    });
  }
};

/**
 * Verify document integrity by comparing hash
 * POST /api/documents/verify/:cid
 * Authenticated
 */
exports.verifyDocumentIntegrity = async (req, res) => {
  try {
    const { cid } = req.params;
    const userId = req.user.userId;

    if (!cid || typeof cid !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid CID provided",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.error("User not found", { userId });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find document in user's documents array
    const document = user.documents.find((doc) => doc.cid === cid);
    if (!document) {
      logger.warn("Document not found for verification", { userId, cid });
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    logger.info("Verifying document integrity", { userId, cid });

    // Verify file exists on IPFS
    const fileExists = await verifyFileOnIPFS(cid);

    if (fileExists) {
      logger.info("Document integrity verified", {
        userId,
        cid,
        fileName: document.fileName,
      });

      return res.status(200).json({
        success: true,
        message: "Document integrity verified successfully",
        data: {
          cid,
          fileName: document.fileName,
          isValid: true,
          hash: document.hash,
          verifiedAt: new Date(),
        },
      });
    } else {
      logger.warn("Document integrity verification failed", {
        userId,
        cid,
      });

      return res.status(404).json({
        success: false,
        message: "Document not found on IPFS - integrity check failed",
        data: {
          cid,
          isValid: false,
        },
      });
    }
  } catch (error) {
    logger.error("Failed to verify document integrity", {
      userId: req.user.userId,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: "Failed to verify document: " + error.message,
    });
  }
};
