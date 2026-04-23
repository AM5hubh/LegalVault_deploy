const express = require("express");
const router = express.Router();
const { documentUploadMiddleware } = require("../middlewares/fileMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  uploadDocument,
  getUserDocuments,
  getDocumentByCID,
  downloadDocument,
  deleteDocument,
  updateDocumentMetadata,
  verifyDocumentIntegrity,
} = require("../controllers/documentUploadController");

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/documents/upload
 * Upload a document to IPFS and store CID in user model
 * Required fields: file (multipart/form-data with field name 'document')
 * Optional fields: description
 * Returns: { success, message, data: { cid, fileName, fileType, fileSize, hash, ipfsUrl, uploadedAt, description, status } }
 */
router.post("/upload", documentUploadMiddleware, uploadDocument);

/**
 * GET /api/documents
 * Get all documents for the logged-in user
 * Returns: { success, message, data: { documents[], totalDocuments } }
 */
router.get("/", getUserDocuments);

/**
 * GET /api/documents/:cid
 * Get specific document details by CID
 * Returns: { success, message, data: { cid, fileName, fileType, fileSize, hash, uploadedAt, description, status, ipfsUrl } }
 */
router.get("/:cid", getDocumentByCID);

/**
 * GET /api/documents/download/:cid
 * Download document from IPFS
 * Returns: File binary data with headers including X-Document-CID and X-Document-Hash
 */
router.get("/download/:cid", downloadDocument);

/**
 * DELETE /api/documents/:cid
 * Delete document from user's documents array
 * Returns: { success, message, data: { cid, fileName, deletedAt } }
 */
router.delete("/:cid", deleteDocument);

/**
 * PATCH /api/documents/:cid
 * Update document metadata (description only)
 * Required body: { description: string }
 * Returns: { success, message, data: { cid, fileName, description, ... } }
 */
router.patch("/:cid", updateDocumentMetadata);

/**
 * POST /api/documents/verify/:cid
 * Verify document integrity by checking if it exists on IPFS
 * Returns: { success, message, data: { cid, fileName, isValid, hash, verifiedAt } }
 */
router.post("/verify/:cid", verifyDocumentIntegrity);

module.exports = router;
