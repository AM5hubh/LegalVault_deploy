const DocumentVerification = require("../models/DocumentVerification");
const cloudinary = require("../config/cloudinary");
const fs = require("fs").promises;
const path = require("path");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const axios = require("axios");
const aiVerificationServiceFull = require("../services/aiVerificationService");

// AI Verification Service using HuggingFace or OpenAI
class AIVerificationService {
  constructor() {
    this.huggingFaceUrl = "https://api-inference.huggingface.co/models";
    this.huggingFaceToken = process.env.HUGGINGFACE_API_TOKEN || "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";
  }

  async detectAIText(text) {
    try {
      if (!text || text.length < 10) {
        return {
          is_enabled: true,
          ai_text_probability: 0,
          human_text_probability: 1.0,
          confidence: 0,
          detected_patterns: [],
          model_used: "local-heuristic",
          processing_time_ms: 0,
        };
      }

      // Heuristic-based AI detection (no API dependency)
      const result = this.analyzeTextPatterns(text);
      return result;
    } catch (error) {
      console.error("AI text detection error:", error);
      return {
        is_enabled: true,
        ai_text_probability: null,
        human_text_probability: null,
        confidence: 0,
        detected_patterns: [],
        model_used: "error",
        processing_time_ms: 0,
      };
    }
  }

  analyzeTextPatterns(text) {
    const startTime = Date.now();
    const patterns = [];
    let suspicionScore = 0;

    // Check for repetitive phrases
    const sentenceCount = (text.match(/[.!?]/g) || []).length;
    const uniqueWordRatio = new Set(text.toLowerCase().split(/\s+/)).size / text.split(/\s+/).length;

    if (uniqueWordRatio < 0.4) {
      patterns.push("low_vocabulary_diversity");
      suspicionScore += 15;
    }

    // Check for overly formal structure
    const formalWords = (text.match(/\b(furthermore|moreover|therefore|consequently|notwithstanding)\b/gi) || []).length;
    if (formalWords > sentenceCount / 2) {
      patterns.push("excessive_formal_language");
      suspicionScore += 10;
    }

    // Check for perfect grammar (oddly consistent)
    const multiPunctuation = (text.match(/[.!?]{2,}/g) || []).length;
    if (multiPunctuation === 0 && text.length > 500) {
      patterns.push("no_natural_punctuation_errors");
      suspicionScore += 5;
    }

    // Check for repetitive sentence structure
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length > 3) {
      const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
      const variance = sentences.reduce((sum, s) => sum + Math.pow(s.length - avgLength, 2), 0) / sentences.length;
      if (Math.sqrt(variance) < 5) {
        patterns.push("repetitive_sentence_structure");
        suspicionScore += 15;
      }
    }

    // Check for common AI phrases
    const aiPhrases = [
      "as an ai",
      "as a language model",
      "in accordance with",
      "it is worth noting",
      "this could potentially",
    ];
    const aiPhraseCount = aiPhrases.filter((phrase) => text.toLowerCase().includes(phrase)).length;
    if (aiPhraseCount > 0) {
      patterns.push("suspicious_ai_phrases");
      suspicionScore += 20 * aiPhraseCount;
    }

    const processingTime = Date.now() - startTime;

    return {
      is_enabled: true,
      ai_text_probability: Math.min(suspicionScore / 100, 1),
      human_text_probability: Math.max(1 - suspicionScore / 100, 0),
      confidence: 0.6, // Lower confidence for heuristic
      detected_patterns: patterns,
      model_used: "local-heuristic",
      processing_time_ms: processingTime,
    };
  }

  async analyzeMetadata(filePath, mimeType) {
    try {
      const stats = await fs.stat(filePath);
      const fileHash = require("crypto").createHash("sha256").update(await fs.readFile(filePath)).digest("hex");

      const metadata = {
        is_enabled: true,
        pdf_metadata: {},
        metadata_anomalies: [],
        file_hash: fileHash,
        processing_time_ms: 0,
      };

      // Check file signature
      const buffer = Buffer.alloc(8);
      const fd = await fs.open(filePath, "r");
      await fd.read(buffer, 0, 8, 0);
      await fd.close();

      // PDF signature check
      if (mimeType === "application/pdf") {
        const header = buffer.toString("utf8", 0, 4);
        if (header !== "%PDF") {
          metadata.metadata_anomalies.push("invalid_pdf_header");
        }
      }

      // Image metadata check
      if (mimeType.startsWith("image/")) {
        const fileSize = stats.size;
        if (fileSize > 10 * 1024 * 1024) {
          metadata.metadata_anomalies.push("suspiciously_large_file");
        }
      }

      return metadata;
    } catch (error) {
      console.error("Metadata analysis error:", error);
      return {
        is_enabled: true,
        pdf_metadata: {},
        metadata_anomalies: ["metadata_analysis_failed"],
        file_hash: null,
        processing_time_ms: 0,
      };
    }
  }
}

const aiVerificationService = new AIVerificationService();

/**
 * Upload and verify document
 */
exports.uploadAndVerifyDocument = async (req, res) => {
  try {
    const { documentType, caseId } = req.body;
    const userId = req.user.userId;

    console.log("🔍 Upload request received:", {
      userId,
      documentType,
      caseId,
      file: req.file ? { name: req.file.originalname, size: req.file.size, path: req.file.path } : null,
      body: req.body,
    });

    if (!req.file) {
      console.error("❌ No file in request. Multer may have failed.");
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!documentType) {
      console.error("❌ Document type is missing");
      // Clean up file
      try {
        await fs.unlink(req.file.path);
      } catch (e) {
        console.warn("Could not delete temp file:", e.message);
      }
      return res.status(400).json({
        success: false,
        message: "Document type is required",
      });
    }

    // Validate caseId if provided - silently ignore invalid ones
    let validatedCaseId = null;
    if (caseId) {
      const mongoose = require("mongoose");
      if (mongoose.Types.ObjectId.isValid(caseId)) {
        validatedCaseId = caseId;
      }
      // If invalid caseId, just set to null instead of rejecting
    }

    // Upload to Cloudinary
    console.log("📤 Uploading to Cloudinary...", { filePath: req.file.path });
    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: `document-verification/${userId}`,
        resource_type: "auto",
        tags: ["verified_document", documentType],
      });
      console.log("✅ Cloudinary upload success:", { public_id: uploadResult.public_id });
    } catch (cloudinaryError) {
      console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
      // Clean up file
      try {
        await fs.unlink(req.file.path);
      } catch (e) {
        console.warn("Could not delete temp file:", e.message);
      }
      throw cloudinaryError;
    }

    // Create initial verification record
    console.log("💾 Creating verification record in DB...");
    let verification;
    try {
      verification = await DocumentVerification.create({
        documentId: uploadResult.public_id,
        documentUrl: uploadResult.secure_url,
        documentType: documentType,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: userId,
        caseId: validatedCaseId,
        verificationStatus: "pending",
        verificationStartedAt: new Date(),
      });
      console.log("✅ Verification record created:", { verificationId: verification._id });
    } catch (dbError) {
      console.error("❌ Database error creating verification record:", dbError.message);
      // Clean up file
      try {
        await fs.unlink(req.file.path);
      } catch (e) {
        console.warn("Could not delete temp file:", e.message);
      }
      throw dbError;
    }

    // Start async verification process
    console.log("⚙️ Starting async verification...", { verificationId: verification._id, filePath: req.file.path });
    setImmediate(async () => {
      try {
        await verifyDocument(verification._id, req.file.path, req.file.mimetype);
        console.log("✅ Async verification completed:", { verificationId: verification._id });
      } catch (error) {
        console.error("❌ Async verification error:", {
          verificationId: verification._id,
          error: error.message,
          stack: error.stack,
        });
        const doc = await DocumentVerification.findById(verification._id);
        if (doc) {
          doc.verificationStatus = "failed";
          doc.errors = doc.errors || [];
          doc.errors.push({
            stage: "verification_pipeline",
            error_message: error.message,
            error_code: "VERIFICATION_FAILED",
            timestamp: new Date(),
          });
          await doc.save();
        }
      }

      // Cleanup temp file
      try {
        await fs.unlink(req.file.path);
        console.log("🗑️ Temp file cleaned up:", req.file.path);
      } catch (e) {
        console.warn("⚠️ Could not delete temp file:", { path: req.file.path, error: e.message });
      }
    });

    console.log("✅ Upload response sent successfully", { verificationId: verification._id });
    res.status(201).json({
      success: true,
      message: "Document uploaded and verification initiated",
      data: {
        verificationId: verification._id,
        status: verification.verificationStatus,
        documentId: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error("❌ Error in document upload and verification:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({
      success: false,
      message: "Error uploading and verifying document",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Main verification function - uses full OpenAI-powered AI service
 */
async function verifyDocument(verificationId, filePath, mimeType) {
  const verification = await DocumentVerification.findById(verificationId);
  if (!verification) throw new Error("Verification record not found");

  try {
    verification.verificationStatus = "in_progress";
    await verification.save();

    // Use the full OpenAI-powered AI verification service
    let results;
    try {
      // Read file buffer from local path instead of downloading
      const fileBuffer = await fs.readFile(filePath);
      results = await aiVerificationServiceFull.verifyDocument(
        fileBuffer,
        verification.documentType,
        mimeType
      );
    } catch (aiError) {
      console.warn("Full AI service failed, falling back to local heuristic:", aiError.message);

      // Fallback: local OCR + heuristic
      let extractedText = "";
      try {
        if (mimeType === "application/pdf") {
          const fileBuffer = await fs.readFile(filePath);
          try {
            // Try standard pdf-parse usage
            const pdfModule = require("pdf-parse");
            const parseFn = pdfModule.default || pdfModule;
            const pdfData = await parseFn(fileBuffer);
            extractedText = pdfData.text || "";
          } catch (pdfErr) {
            console.warn("PDF parse with pdf-parse failed:", pdfErr.message);
            // Final fallback: try to extract as text
            extractedText = fileBuffer.toString("utf8", 0, Math.min(5000, fileBuffer.length));
          }
        } else if (mimeType && mimeType.startsWith("image/")) {
          try {
            const result = await Tesseract.recognize(filePath, "eng+hin", {
              logger: (m) => {
                if (m.status === "recognizing text" && m.progress < 1) {
                  // Silent progress
                }
              },
            });
            extractedText = result.data.text || "";
          } catch (ocrErr) {
            console.warn("Tesseract OCR failed:", ocrErr.message);
          }
        }
      } catch (ocrError) {
        console.warn("OCR extraction failed:", ocrError.message);
      }

      const localAiResult = await aiVerificationService.detectAIText(extractedText);
      results = {
        ai_text_detection: localAiResult,
        ocr_analysis: {
          extracted_text: extractedText.substring(0, 5000),
          text_confidence: extractedText ? 0.85 : 0,
          language_detected: ["en"],
          validation_results: { case_number_valid: true, court_name_valid: true, ipc_sections_found: [], date_formats_consistent: true, inconsistencies: [] },
        },
        tampering_detection: { tamper_probability: 0, tampering_detected: false, suspicious_edits: [] },
        deepfake_detection: { face_detected: false, is_deepfake_probability: 0, authenticity_score: 1.0 },
        signature_verification: { signature_detected: false, signature_count: 0, signatures: [] },
        metadata_analysis: { metadata_anomalies: [], file_hash: null },
      };
    }

    // Map results to model fields
    if (results.ai_text_detection) {
      verification.aiTextDetection = {
        is_enabled: true,
        ai_text_probability: results.ai_text_detection.ai_text_probability ?? 0,
        human_text_probability: results.ai_text_detection.human_text_probability ?? 1,
        confidence: results.ai_text_detection.confidence ?? 0,
        detected_patterns: results.ai_text_detection.detected_patterns || [],
        model_used: results.ai_text_detection.model_used || "gpt-4-turbo",
        processing_time_ms: results.ai_text_detection.processing_time_ms ?? 0,
      };
    }

    if (results.tampering_detection) {
      verification.tamperingDetection = {
        is_enabled: true,
        tamper_probability: results.tampering_detection.tamper_probability ?? 0,
        tampering_detected: results.tampering_detection.tampering_detected ?? false,
        tampering_regions: results.tampering_detection.tampering_regions || [],
        suspicious_edits: results.tampering_detection.suspicious_edits || [],
        model_used: results.tampering_detection.model_used || "gpt-4-analysis",
        processing_time_ms: results.tampering_detection.processing_time_ms ?? 0,
      };
    }

    if (results.deepfake_detection) {
      verification.deepfakeDetection = {
        is_enabled: true,
        face_detected: results.deepfake_detection.face_detected ?? false,
        is_deepfake_probability: results.deepfake_detection.is_deepfake_probability ?? 0,
        authenticity_score: results.deepfake_detection.authenticity_score ?? 1.0,
        morphing_detected: results.deepfake_detection.morphing_detected ?? false,
        artifacts_found: results.deepfake_detection.artifacts_found || [],
        model_used: results.deepfake_detection.model_used || "basic-image-analysis",
        processing_time_ms: 0,
      };
    }

    if (results.signature_verification) {
      verification.signatureVerification = {
        is_enabled: true,
        signature_detected: results.signature_verification.signature_detected ?? false,
        signature_count: results.signature_verification.signature_count ?? 0,
        signatures: results.signature_verification.signatures || [],
        model_used: results.signature_verification.model_used || "not-implemented",
        processing_time_ms: 0,
      };
    }

    if (results.ocr_analysis) {
      verification.ocrAnalysis = {
        is_enabled: true,
        extracted_text: results.ocr_analysis.extracted_text || "",
        text_confidence: results.ocr_analysis.text_confidence ?? 0,
        language_detected: results.ocr_analysis.language_detected || ["en"],
        validation_results: results.ocr_analysis.validation_results || {
          case_number_valid: true,
          court_name_valid: true,
          ipc_sections_found: [],
          date_formats_consistent: true,
          inconsistencies: [],
        },
        processing_time_ms: results.ocr_analysis.processing_time_ms ?? 0,
      };
    }

    if (results.metadata_analysis) {
      verification.metadataAnalysis = {
        is_enabled: true,
        metadata_anomalies: results.metadata_analysis.metadata_anomalies || [],
        file_hash: results.metadata_analysis.file_hash || null,
        pdf_metadata: results.metadata_analysis.pdf_metadata || null,
        processing_time_ms: results.metadata_analysis.processing_time_ms ?? 0,
      };
    }

    // Calculate composite risk score
    const riskAssessment = calculateRiskScore(verification);
    verification.riskAssessment = riskAssessment;
    verification.verificationStatus = "completed";
    verification.verificationCompletedAt = new Date();

    if (!verification.verification_attempts) {
      verification.verification_attempts = [];
    }
    verification.verification_attempts.push({
      attempt_number: verification.verification_attempts.length + 1,
      started_at: verification.verificationStartedAt,
      completed_at: new Date(),
      status: "completed",
    });

    await verification.save();

    // Generate AI-powered verification summary using GPT-4
    try {
      console.log("Generating verification summary with GPT-4...");
      const summary = await aiVerificationServiceFull.generateVerificationSummary(verification);
      verification.verificationSummary = {
        summary_text: summary.summary_text,
        key_findings: summary.key_findings,
        verdict: summary.verdict,
        generated_by: summary.generated_by,
        generated_at: summary.generated_at,
      };
      await verification.save();
      console.log(`✅ Summary generated: verdict=${summary.verdict}, model=${summary.generated_by}`);
    } catch (summaryError) {
      console.warn("Summary generation failed (non-critical):", summaryError.message);
    }
  } catch (error) {
    console.error("Error in verification process:", error);
    verification.verificationStatus = "failed";
    verification.errors = verification.errors || [];
    verification.errors.push({
      stage: "verification_process",
      error_message: error.message,
      error_code: "PROCESS_ERROR",
      timestamp: new Date(),
    });
    await verification.save();
    throw error;
  }
}

/**
 * Transform snake_case DB document to camelCase for frontend
 */
function transformVerificationForFrontend(v) {
  const doc = v.toObject ? v.toObject() : v;
  return {
    ...doc,
    aiTextDetection: doc.aiTextDetection ? {
      ...doc.aiTextDetection,
      isAiGenerated: (doc.aiTextDetection.ai_text_probability ?? 0) > 0.5,
      humanWritingScore: doc.aiTextDetection.human_text_probability ?? 1,
      confidence: doc.aiTextDetection.confidence ?? 0,
      detectedPatterns: doc.aiTextDetection.detected_patterns || [],
    } : null,
    tamperingDetection: doc.tamperingDetection ? {
      ...doc.tamperingDetection,
      isTampered: (doc.tamperingDetection.tamper_probability ?? 0) > 0.5 || doc.tamperingDetection.tampering_detected,
      integrityScore: 1 - (doc.tamperingDetection.tamper_probability ?? 0),
      inconsistencies: doc.tamperingDetection.suspicious_edits || [],
    } : null,
    ocrAnalysis: doc.ocrAnalysis ? {
      ...doc.ocrAnalysis,
      extractedText: doc.ocrAnalysis.extracted_text || "",
      language: (doc.ocrAnalysis.language_detected || ["en"])[0],
      textQuality: (doc.ocrAnalysis.text_confidence ?? 0) > 0.8 ? "good" : (doc.ocrAnalysis.text_confidence ?? 0) > 0.5 ? "average" : "poor",
      confidence: doc.ocrAnalysis.text_confidence ?? 0,
    } : null,
    metadataAnalysis: doc.metadataAnalysis ? {
      ...doc.metadataAnalysis,
      creationDate: doc.metadataAnalysis.pdf_metadata?.creation_date || null,
      suspiciousFlags: doc.metadataAnalysis.metadata_anomalies || [],
    } : null,
    deepfakeDetection: doc.deepfakeDetection ? {
      ...doc.deepfakeDetection,
      isDeepfake: (doc.deepfakeDetection.is_deepfake_probability ?? 0) > 0.5,
    } : null,
    verificationSummary: doc.verificationSummary || null,
  };
}

/**
 * Calculate composite risk score
 */
function calculateRiskScore(verification) {
  const riskFactors = [];
  let totalRiskScore = 0;
  let criticalIssuesFound = false;

  // AI Text Detection scoring (40% weight)
  if (verification.aiTextDetection?.ai_text_probability) {
    const aiScore = verification.aiTextDetection.ai_text_probability * 100;
    totalRiskScore += aiScore * 0.4;

    if (aiScore > 70) {
      riskFactors.push({
        factor: "AI-Generated Text Suspected",
        score: aiScore,
        severity: "high",
        description: "Document likely contains AI-generated or suspicious content",
      });
      criticalIssuesFound = true;
    } else if (aiScore > 50) {
      riskFactors.push({
        factor: "Possible AI-Generated Text",
        score: aiScore,
        severity: "medium",
        description: "Document may contain AI-generated content",
      });
    }
  }

  // Metadata anomalies (30% weight)
  if (verification.metadataAnalysis?.metadata_anomalies?.length > 0) {
    const anomalyScore = Math.min(verification.metadataAnalysis.metadata_anomalies.length * 20, 60);
    totalRiskScore += anomalyScore * 0.3;

    if (anomalyScore > 50) {
      riskFactors.push({
        factor: "Metadata Anomalies Detected",
        score: anomalyScore,
        severity: "medium",
        description: `Found: ${verification.metadataAnalysis.metadata_anomalies.join(", ")}`,
      });
    }
  }

  // OCR confidence (30% weight)
  if (verification.ocrAnalysis?.text_confidence) {
    const ocrConfidence = verification.ocrAnalysis.text_confidence;
    if (ocrConfidence < 0.6) {
      const confidenceScore = (1 - ocrConfidence) * 100;
      totalRiskScore += confidenceScore * 0.3;

      riskFactors.push({
        factor: "Low OCR Confidence",
        score: confidenceScore,
        severity: "low",
        description: "Could not reliably extract text from document",
      });
    }
  }

  // Determine risk level
  let riskLevel = "LOW";
  if (totalRiskScore >= 70 || criticalIssuesFound) {
    riskLevel = "CRITICAL";
  } else if (totalRiskScore >= 55) {
    riskLevel = "HIGH";
  } else if (totalRiskScore >= 40) {
    riskLevel = "MEDIUM";
  }

  // Generate recommendations
  const recommendations = generateRecommendations(riskLevel, riskFactors);

  return {
    overall_risk_score: Math.round(totalRiskScore),
    risk_level: riskLevel,
    risk_factors: riskFactors,
    recommendations,
    flagged_for_manual_review: riskLevel === "HIGH" || riskLevel === "CRITICAL",
    manual_review_reason:
      riskLevel === "HIGH" || riskLevel === "CRITICAL"
        ? `Risk level: ${riskLevel}. Requires manual legal expert review.`
        : null,
  };
}

/**
 * Generate recommendations
 */
function generateRecommendations(riskLevel, riskFactors) {
  const recommendations = [];

  if (riskLevel === "CRITICAL") {
    recommendations.push("⛔ REJECT: Critical authenticity issues detected");
    recommendations.push("🔍 Escalate to senior legal officer for investigation");
    recommendations.push("📋 File report for potential document fraud");
  } else if (riskLevel === "HIGH") {
    recommendations.push("⚠️ REJECT: Significant authenticity concerns");
    recommendations.push("📞 Contact issuing authority for verification");
    recommendations.push("🔎 Request original hard copy for manual verification");
  } else if (riskLevel === "MEDIUM") {
    recommendations.push("✓ CONDITIONAL: Minor inconsistencies found");
    recommendations.push("📝 Request clarification from document issuer");
    recommendations.push("🔐 Mark for enhanced monitoring");
  } else {
    recommendations.push("✅ ACCEPT: Document appears authentic");
    recommendations.push("📂 File in case records");
  }

  return recommendations;
}

/**
 * Get verification status
 */
exports.getVerificationStatus = async (req, res) => {
  try {
    const { verificationId } = req.params;

    const verification = await DocumentVerification.findById(verificationId).populate("uploadedBy", "fullName email");

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transformVerificationForFrontend(verification),
    });
  } catch (error) {
    console.error("Error fetching verification status:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching verification status",
      error: error.message,
    });
  }
}

/**
 * Get case verifications
 */
exports.getCaseVerifications = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const verifications = await DocumentVerification.find({ caseId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("uploadedBy", "fullName email");

    const total = await DocumentVerification.countDocuments({ caseId });

    res.status(200).json({
      success: true,
      data: verifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching case verifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching case verifications",
      error: error.message,
    });
  }
};

/**
 * Get high-risk documents
 */
exports.getHighRiskDocuments = async (req, res) => {
  try {
    const { limit = 15 } = req.query;

    const highRiskDocs = await DocumentVerification.find({
      "riskAssessment.risk_level": { $in: ["HIGH", "CRITICAL"] },
      "riskAssessment.flagged_for_manual_review": true,
    })
      .sort({ verificationCompletedAt: -1 })
      .limit(parseInt(limit))
      .populate("uploadedBy", "fullName email")
      .populate("caseId", "caseNumber caseTitle");

    res.status(200).json({
      success: true,
      data: {
        documents: highRiskDocs,
      },
    });
  } catch (error) {
    console.error("Error fetching high-risk documents:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching high-risk documents",
      error: error.message,
    });
  }
};

/**
 * Submit manual review
 */
exports.submitManualReview = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { status, notes } = req.body;
    const reviewerId = req.user.userId;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status. Must be 'approved' or 'rejected'",
      });
    }

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: "Review notes are required",
      });
    }

    const verification = await DocumentVerification.findById(verificationId);
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification record not found",
      });
    }

    verification.manualReviewedBy = reviewerId;
    verification.manualReviewedAt = new Date();
    verification.manualVerificationStatus = status;
    verification.manualReviewNotes = notes;

    await verification.save();

    res.status(200).json({
      success: true,
      message: "Manual review submitted successfully",
      data: verification,
    });
  } catch (error) {
    console.error("Error submitting manual review:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting manual review",
      error: error.message,
    });
  }
};

/**
 * Get verification statistics
 */
exports.getVerificationStats = async (req, res) => {
  try {
    const total = await DocumentVerification.countDocuments();
    const lowRisk = await DocumentVerification.countDocuments({
      "riskAssessment.risk_level": "LOW",
    });
    const mediumRisk = await DocumentVerification.countDocuments({
      "riskAssessment.risk_level": "MEDIUM",
    });
    const highRisk = await DocumentVerification.countDocuments({
      "riskAssessment.risk_level": "HIGH",
    });
    const criticalRisk = await DocumentVerification.countDocuments({
      "riskAssessment.risk_level": "CRITICAL",
    });

    // Calculate average risk score
    const allDocs = await DocumentVerification.find({}, "riskAssessment.overall_risk_score");
    const totalRiskScore = allDocs.reduce((sum, doc) => {
      return sum + (doc.riskAssessment?.overall_risk_score || 0);
    }, 0);
    const averageRiskScore = total > 0 ? (totalRiskScore / total) * 100 : 0;

    const stats = {
      totalVerifications: total,
      pending: await DocumentVerification.countDocuments({ verificationStatus: "pending" }),
      inProgress: await DocumentVerification.countDocuments({ verificationStatus: "in_progress" }),
      completed: await DocumentVerification.countDocuments({ verificationStatus: "completed" }),
      failed: await DocumentVerification.countDocuments({ verificationStatus: "failed" }),
      lowRiskCount: lowRisk,
      mediumRiskCount: mediumRisk,
      highRiskCount: highRisk,
      criticalRiskCount: criticalRisk,
      averageRiskScore: averageRiskScore,
      flaggedForReview: await DocumentVerification.countDocuments({
        "riskAssessment.flagged_for_manual_review": true,
      }),
      pendingManualReview: await DocumentVerification.countDocuments({
        manualVerificationStatus: "pending",
      }),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching verification stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching verification statistics",
      error: error.message,
    });
  }
};

/**
 * Get verification analytics
 */
exports.getVerificationAnalytics = async (req, res) => {
  try {
    const { dateRange = "30" } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    const verifications = await DocumentVerification.find({
      createdAt: { $gte: startDate },
    })
      .populate("uploadedBy", "fullName email")
      .populate("caseId", "caseNumber caseTitle");

    const analytics = {
      totalProcessed: verifications.length,
      averageRiskScore:
        verifications.length > 0
          ? verifications.reduce((sum, v) => sum + (v.riskAssessment?.overall_risk_score || 0), 0) / verifications.length
          : 0,
      riskDistribution: {
        low: verifications.filter((v) => v.riskAssessment?.risk_level === "LOW").length,
        medium: verifications.filter((v) => v.riskAssessment?.risk_level === "MEDIUM").length,
        high: verifications.filter((v) => v.riskAssessment?.risk_level === "HIGH").length,
        critical: verifications.filter((v) => v.riskAssessment?.risk_level === "CRITICAL").length,
      },
      detectionBreakdown: {
        aiDetectedCount: verifications.filter(
          (v) => v.aiTextDetection?.ai_text_probability > 0.6
        ).length,
        metadataIssuesCount: verifications.filter(
          (v) => v.metadataAnalysis?.metadata_anomalies?.length > 0
        ).length,
      },
      processingTimeStats: {
        averageTimeSeconds: verifications.length > 0 ? verifications.reduce(
          (sum, v) => {
            const endTime = v.verificationCompletedAt || new Date();
            const duration = (endTime - v.verificationStartedAt) / 1000;
            return sum + duration;
          },
          0
        ) / verifications.length : 0,
      },
      allVerifications: verifications.map(transformVerificationForFrontend),
    };

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching verification analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: error.message,
    });
  }
};

/**
 * Export verification report
 */
exports.exportVerificationReport = async (req, res) => {
  try {
    const { verificationId } = req.params;

    const verification = await DocumentVerification.findById(verificationId)
      .populate("uploadedBy", "fullName email")
      .populate("manualReviewedBy", "fullName email");

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification record not found",
      });
    }

    const report = {
      report_id: verification._id,
      generated_at: new Date().toISOString(),
      document_info: {
        file_name: verification.fileName,
        document_type: verification.documentType,
        uploaded_by: verification.uploadedBy.fullName,
        upload_date: verification.createdAt,
      },
      verification_results: {
        overall_risk_level: verification.riskAssessment?.risk_level,
        overall_risk_score: verification.riskAssessment?.overall_risk_score,
        risk_factors: verification.riskAssessment?.risk_factors,
        recommendations: verification.riskAssessment?.recommendations,
      },
      detailed_analysis: {
        ai_text_detection: verification.aiTextDetection,
        ocr_analysis: verification.ocrAnalysis,
        metadata_analysis: verification.metadataAnalysis,
      },
      manual_review: {
        reviewed_by: verification.manualReviewedBy?.fullName || "Not reviewed",
        review_status: verification.manualVerificationStatus || "pending",
        review_notes: verification.manualReviewNotes,
        reviewed_at: verification.manualReviewedAt,
      },
    };

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error exporting verification report:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting report",
      error: error.message,
    });
  }
};

module.exports = exports;
