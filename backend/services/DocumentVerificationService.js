const axios = require("axios");
const DocumentVerification = require("../models/DocumentVerification");
const { sendEmail } = require("./notificationService");
const aiVerificationService = require("./aiVerificationService");

// No external Python service needed - using JavaScript AI service
class DocumentVerificationService {
  /**
   * Initiate document verification process
   */
  async initiateVerification(documentData, userId) {
    try {
      const verification = await DocumentVerification.create({
        documentId: documentData.publicId,
        documentUrl: documentData.url,
        documentType: documentData.type,
        fileName: documentData.fileName,
        fileSize: documentData.fileSize,
        mimeType: documentData.mimeType,
        uploadedBy: userId,
        caseId: documentData.caseId || null,
        verificationStatus: "pending",
        verificationStartedAt: new Date(),
      });

      return verification;
    } catch (error) {
      console.error("Error creating verification record:", error);
      throw error;
    }
  }

  /**
   * Send document to JavaScript AI service for analysis
   */
  async analyzeDocument(verificationId, documentUrl) {
    try {
      const verification = await DocumentVerification.findById(verificationId);
      if (!verification) {
        throw new Error("Verification record not found");
      }

      // Update status to in_progress
      verification.verificationStatus = "in_progress";
      verification.verificationStartedAt = new Date();
      await verification.save();

      // Use JavaScript-based AI verification service (OpenAI + OCR)
      const analysisResults = await aiVerificationService.verifyDocument(
        documentUrl, 
        verification.documentType
      );

      return analysisResults;
    } catch (error) {
      console.error("Error in document analysis:", error);
      throw new Error(`Document analysis failed: ${error.message}`);
    }
  }

  /**
   * Process verification results and calculate risk score
   */
  async processVerificationResults(verificationId, analysisResults) {
    try {
      const verification = await DocumentVerification.findById(verificationId);
      if (!verification) {
        throw new Error("Verification record not found");
      }

      // Store individual verification results (from JavaScript AI service)
      if (analysisResults.aiTextDetection) {
        verification.aiTextDetection = analysisResults.aiTextDetection;
      }
      if (analysisResults.deepfakeDetection) {
        verification.deepfakeDetection = analysisResults.deepfakeDetection;
      }
      if (analysisResults.tamperingDetection) {
        verification.tamperingDetection = analysisResults.tamperingDetection;
      }
      if (analysisResults.signatureVerification) {
        verification.signatureVerification = analysisResults.signatureVerification;
      }
      if (analysisResults.ocrAnalysis) {
        verification.ocrAnalysis = analysisResults.ocrAnalysis;
      }
      if (analysisResults.metadataAnalysis) {
        verification.metadataAnalysis = analysisResults.metadataAnalysis;
      }

      // Calculate composite risk score
      const riskAssessment = this.calculateRiskScore(verification);
      verification.riskAssessment = riskAssessment;

      // Update verification status
      verification.verificationStatus = "completed";
      verification.verificationCompletedAt = new Date();

      // Track verification attempt
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
      return verification;
    } catch (error) {
      console.error("Error processing verification results:", error);
      throw error;
    }
  }

  /**
   * Calculate composite risk score from all analysis results
   */
  calculateRiskScore(verification) {
    const riskFactors = [];
    let totalRiskScore = 0;
    let criticalIssuesFound = false;

    // AI Text Detection scoring (30% weight)
    if (verification.aiTextDetection?.confidence) {
      const aiScore = verification.aiTextDetection.confidence * 100;
      totalRiskScore += aiScore * 0.3;

      if (verification.aiTextDetection.isAiGenerated && aiScore > 80) {
        riskFactors.push({
          factor: "AI-Generated Text",
          score: aiScore,
          severity: "high",
          description: "Document likely contains AI-generated text",
        });
        criticalIssuesFound = true;
      } else if (verification.aiTextDetection.isAiGenerated && aiScore > 60) {
        riskFactors.push({
          factor: "Possible AI-Generated Text",
          score: aiScore,
          severity: "medium",
          description: "Document may contain AI-generated content",
        });
      }
    }

    // Deepfake Detection scoring (25% weight)
    if (verification.deepfakeDetection?.confidence) {
      const deepfakeScore = verification.deepfakeDetection.confidence * 100;
      totalRiskScore += deepfakeScore * 0.25;

      if (verification.deepfakeDetection.isDeepfake && deepfakeScore > 75) {
        riskFactors.push({
          factor: "Face Deepfake Detected",
          score: deepfakeScore,
          severity: "critical",
          description: "Document contains suspected deepfake face",
        });
        criticalIssuesFound = true;
      } else if (verification.deepfakeDetection.isDeepfake && deepfakeScore > 50) {
        riskFactors.push({
          factor: "Face Authenticity Questionable",
          score: deepfakeScore,
          severity: "high",
          description: "Document face authenticity is uncertain",
        });
      }

      // Check manipulation areas
      if (verification.deepfakeDetection.manipulationAreas?.length > 0) {
        riskFactors.push({
          factor: "Face Manipulation Detected",
          score: 85,
          severity: "critical",
          description: `Manipulation detected in: ${verification.deepfakeDetection.manipulationAreas.join(", ")}`,
        });
        criticalIssuesFound = true;
      }
    }

    // Tampering Detection scoring (25% weight)
    if (verification.tamperingDetection?.confidence) {
      const tamperScore = verification.tamperingDetection.confidence * 100;
      totalRiskScore += tamperScore * 0.25;

      if (verification.tamperingDetection.isTampered && tamperScore > 75) {
        riskFactors.push({
          factor: "Document Tampering Detected",
          score: tamperScore,
          severity: "critical",
          description: "Document shows clear signs of tampering",
        });
        criticalIssuesFound = true;
      } else if (verification.tamperingDetection.isTampered && tamperScore > 50) {
        riskFactors.push({
          factor: "Possible Document Tampering",
          score: tamperScore,
          severity: "high",
          description: "Document may have been edited or modified",
        });
      }

      // Inconsistencies found
      if (verification.tamperingDetection.inconsistencies?.length > 0) {
        riskFactors.push({
          factor: "Document Inconsistencies",
          score: 70,
          severity: "high",
          description: `Detected: ${verification.tamperingDetection.inconsistencies.join(", ")}`,
        });
      }
    }

    // Signature Verification scoring (10% weight)
    if (verification.signatureVerification?.confidence) {
      const signatureScore = verification.signatureVerification.confidence * 100;
      totalRiskScore += signatureScore * 0.1;

      if (!verification.signatureVerification.isAuthentic && signatureScore > 80) {
        riskFactors.push({
          factor: "Invalid Signature Detected",
          score: signatureScore,
          severity: "critical",
          description: "Signature appears to be invalid or forged",
        });
        criticalIssuesFound = true;
      } else if (!verification.signatureVerification.isAuthentic && signatureScore > 60) {
        riskFactors.push({
          factor: "Signature Authenticity Questionable",
          score: signatureScore,
          severity: "high",
          description: "Signature may not be authentic",
        });
      }

      if (verification.signatureVerification.inconsistencies?.length > 0) {
        riskFactors.push({
          factor: "Signature Inconsistencies",
          score: 70,
          severity: "high",
          description: `Detected: ${verification.signatureVerification.inconsistencies.join(", ")}`,
        });
      }
    }

    // Metadata anomalies
    if (verification.metadataAnalysis?.suspiciousFlags?.length > 0) {
      const anomalyScore = Math.min(verification.metadataAnalysis.suspiciousFlags.length * 15, 40);
      riskFactors.push({
        factor: "Metadata Anomalies",
        score: anomalyScore,
        severity: "medium",
        description: `Found: ${verification.metadataAnalysis.suspiciousFlags.join(", ")}`,
      });
    }

    // OCR Quality check
    if (verification.ocrAnalysis?.textQuality === "poor") {
      riskFactors.push({
        factor: "Poor OCR Quality",
        score: 30,
        severity: "medium",
        description: "Document text quality or scanning issues detected",
      });
    }

    // Determine overall risk level
    let riskLevel = "LOW";
    if (totalRiskScore >= 75 || criticalIssuesFound) {
      riskLevel = "CRITICAL";
    } else if (totalRiskScore >= 60) {
      riskLevel = "HIGH";
    } else if (totalRiskScore >= 40) {
      riskLevel = "MEDIUM";
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(riskFactors, riskLevel);

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
   * Generate recommendations based on risk assessment
   */
  generateRecommendations(riskFactors, riskLevel) {
    const recommendations = [];

    if (riskLevel === "CRITICAL") {
      recommendations.push("⛔ REJECT: Critical authenticity issues detected");
      recommendations.push("🔍 Escalate to senior legal officer for investigation");
      recommendations.push("📋 File report for potential document fraud");
      recommendations.push("👤 Contact document issuer to verify authenticity");
    } else if (riskLevel === "HIGH") {
      recommendations.push("⚠️ REJECT: Significant authenticity concerns");
      recommendations.push("📞 Contact issuing authority for verification");
      recommendations.push("🔎 Request original hard copy for manual verification");
      recommendations.push("💾 Archive for audit trail");
    } else if (riskLevel === "MEDIUM") {
      recommendations.push("✓ CONDITIONAL ACCEPTANCE: Minor inconsistencies found");
      recommendations.push("📝 Request clarification from document issuer");
      recommendations.push("🔐 Mark for enhanced monitoring");
      recommendations.push("📋 Add verification notes to case file");
    } else {
      recommendations.push("✅ ACCEPT: Document appears authentic");
      recommendations.push("📂 File in case records");
      recommendations.push("🔒 Standard archival procedures apply");
    }

    // Add specific remediation recommendations
    const hasFaceIssue = riskFactors.some((f) => f.factor.includes("Face") || f.factor.includes("Deepfake"));
    const hasTamperingIssue = riskFactors.some((f) => f.factor.includes("Tampering") || f.factor.includes("Edit"));
    const hasSignatureIssue = riskFactors.some((f) => f.factor.includes("Signature"));
    const hasAIIssue = riskFactors.some((f) => f.factor.includes("AI"));

    if (hasFaceIssue) {
      recommendations.push("🆔 Re-issue identity proof from authorized agency");
    }
    if (hasTamperingIssue) {
      recommendations.push("📄 Request certified/attested copies");
    }
    if (hasSignatureIssue) {
      recommendations.push("✍️ Obtain certified signature comparison from authorized expert");
    }
    if (hasAIIssue) {
      recommendations.push("🤖 Review content with legal language expert");
    }

    return recommendations;
  }

  /**
   * Get verification details by ID
   */
  async getVerificationDetails(verificationId) {
    try {
      const verification = await DocumentVerification.findById(verificationId)
        .populate("uploadedBy", "fullName email")
        .populate("manualReviewedBy", "fullName email")
        .populate("caseId", "caseNumber caseTitle");

      return verification;
    } catch (error) {
      console.error("Error fetching verification details:", error);
      throw error;
    }
  }

  /**
   * Get all verifications for a case
   */
  async getCaseVerifications(caseId) {
    try {
      const verifications = await DocumentVerification.find({ caseId })
        .sort({ createdAt: -1 })
        .populate("uploadedBy", "fullName email");

      return verifications;
    } catch (error) {
      console.error("Error fetching case verifications:", error);
      throw error;
    }
  }

  /**
   * Get high-risk documents for admin dashboard
   */
  async getHighRiskDocuments(limit = 10) {
    try {
      const verifications = await DocumentVerification.find({
        "riskAssessment.risk_level": { $in: ["HIGH", "CRITICAL"] },
        "riskAssessment.flagged_for_manual_review": true,
      })
        .sort({ verificationCompletedAt: -1 })
        .limit(limit)
        .populate("uploadedBy", "fullName email")
        .populate("caseId", "caseNumber caseTitle");

      return verifications;
    } catch (error) {
      console.error("Error fetching high-risk documents:", error);
      throw error;
    }
  }

  /**
   * Perform manual review of document
   */
  async submitManualReview(verificationId, reviewData, reviewerUserId) {
    try {
      const verification = await DocumentVerification.findById(verificationId);
      if (!verification) {
        throw new Error("Verification record not found");
      }

      verification.manualReviewedBy = reviewerUserId;
      verification.manualReviewedAt = new Date();
      verification.manualVerificationStatus = reviewData.status; // "approved" or "rejected"
      verification.manualReviewNotes = reviewData.notes;

      await verification.save();

      // Notify uploader about manual review result
      const uploader = await DocumentVerification.findById(verificationId).populate("uploadedBy");
      if (uploader?.uploadedBy?.email) {
        try {
          await sendEmail({
            to: uploader.uploadedBy.email,
            subject: `Document Verification Manual Review - ${reviewData.status.toUpperCase()}`,
            html: `
              <h2>Document Verification Manual Review Result</h2>
              <p>Dear ${uploader.uploadedBy.fullName},</p>
              <p>Your uploaded document has been reviewed by our legal expert team.</p>
              <p><strong>Review Status:</strong> ${reviewData.status.toUpperCase()}</p>
              <p><strong>Reviewer Notes:</strong></p>
              <p>${reviewData.notes}</p>
              <p>Please contact support if you have any questions.</p>
              <br>
              <p>Best regards,<br>LEGALVAULT Verification Team</p>
            `,
          });
        } catch (emailError) {
          console.error("Error sending manual review notification:", emailError);
        }
      }

      return verification;
    } catch (error) {
      console.error("Error submitting manual review:", error);
      throw error;
    }
  }

  /**
   * Get verification statistics
   */
  async getVerificationStats() {
    try {
      const stats = {
        total_verifications: await DocumentVerification.countDocuments(),
        pending: await DocumentVerification.countDocuments({ verificationStatus: "pending" }),
        in_progress: await DocumentVerification.countDocuments({ verificationStatus: "in_progress" }),
        completed: await DocumentVerification.countDocuments({ verificationStatus: "completed" }),
        failed: await DocumentVerification.countDocuments({ verificationStatus: "failed" }),

        risk_breakdown: {
          low: await DocumentVerification.countDocuments({
            "riskAssessment.risk_level": "LOW",
          }),
          medium: await DocumentVerification.countDocuments({
            "riskAssessment.risk_level": "MEDIUM",
          }),
          high: await DocumentVerification.countDocuments({
            "riskAssessment.risk_level": "HIGH",
          }),
          critical: await DocumentVerification.countDocuments({
            "riskAssessment.risk_level": "CRITICAL",
          }),
        },

        flagged_for_review: await DocumentVerification.countDocuments({
          "riskAssessment.flagged_for_manual_review": true,
        }),

        pending_manual_review: await DocumentVerification.countDocuments({
          manualVerificationStatus: "pending",
        }),
      };

      return stats;
    } catch (error) {
      console.error("Error fetching verification stats:", error);
      throw error;
    }
  }
}

module.exports = new DocumentVerificationService();
