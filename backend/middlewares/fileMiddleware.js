const multer = require("multer");
const path = require("path");
const logger = require("../utils/logger");

// Configure Multer for file uploads (memory storage so downstream can use buffers)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "video/mp4",
    "application/pdf",
    "audio/mpeg",
    "audio/wav",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/zip",
    "application/x-rar-compressed",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    logger.warn("Invalid file type uploaded", {
      mimetype: file.mimetype,
      path: req.path,
    });
    return cb(
      new Error(
        "Invalid file type. Allowed: JPEG, PNG, MP4, PDF, MP3, WAV, DOC, DOCX, XLS, XLSX, TXT, ZIP, RAR",
      ),
      false,
    );
  }

  if (file.size > 100 * 1024 * 1024) {
    logger.warn("File size limit exceeded", {
      size: file.size,
      path: req.path,
    });
    return cb(new Error("File size exceeds 100MB limit"), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
});

// Middleware for evidence upload (single field: 'evidence')
const evidenceUploadMiddleware = (req, res, next) => {
  upload.single("evidence")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      logger.error("Multer error during file upload", {
        error: err.message,
        path: req.path,
      });
      return res
        .status(400)
        .json({ message: "File upload error: " + err.message });
    } else if (err) {
      logger.error("File validation error", {
        error: err.message,
        path: req.path,
      });
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      logger.warn("No file uploaded", { path: req.path });
      return res.status(400).json({ message: "No file uploaded" });
    }

    logger.info("File uploaded successfully", {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.path,
    });
    next();
  });
};

// Middleware for document upload (single field: 'document')
const documentUploadMiddleware = (req, res, next) => {
  upload.single("document")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      logger.error("Multer error during document upload", {
        error: err.message,
        path: req.path,
      });
      return res
        .status(400)
        .json({ success: false, message: "File upload error: " + err.message });
    } else if (err) {
      logger.error("Document validation error", {
        error: err.message,
        path: req.path,
      });
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      logger.warn("No document uploaded", { path: req.path });
      return res
        .status(400)
        .json({ success: false, message: "No document uploaded" });
    }

    logger.info("Document uploaded successfully", {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.path,
    });
    next();
  });
};

// Middleware for multiple file uploads with different fields
const uploadMultiple = (fields) => {
  return upload.fields(fields);
};

module.exports = evidenceUploadMiddleware;
module.exports.evidenceUploadMiddleware = evidenceUploadMiddleware;
module.exports.documentUploadMiddleware = documentUploadMiddleware;
module.exports.uploadMultiple = uploadMultiple;
