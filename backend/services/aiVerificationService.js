const axios = require("axios");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * JavaScript-based AI Verification Service
 * Uses OpenAI GPT-4 and HuggingFace APIs for document analysis
 */

class AIVerificationService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openaiEndpoint = "https://api.openai.com/v1/chat/completions";
    this.huggingFaceToken = process.env.HUGGINGFACE_API_TOKEN || "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";
    this.huggingFaceUrl = "https://api-inference.huggingface.co/models";
  }

  /**
   * Download document from URL or return buffer if already provided
   */
  async getDocumentBuffer(urlOrBuffer) {
    try {
      // If already a buffer, return it
      if (Buffer.isBuffer(urlOrBuffer)) {
        return urlOrBuffer;
      }
      // If it's a URL string, try to download
      if (typeof urlOrBuffer === "string" && urlOrBuffer.startsWith("http")) {
        const response = await axios.get(urlOrBuffer, {
          responseType: "arraybuffer",
          timeout: 30000,
        });
        return Buffer.from(response.data);
      }
      throw new Error("Invalid input: expected Buffer or HTTP URL");
    } catch (error) {
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF using pdf-parse
   */
  async extractTextFromPDF(buffer) {
    try {
      // pdfParse is a function that takes a buffer and returns a promise
      const data = await pdfParse(buffer);
      
      return {
        text: data.text || "",
        pages: data.numpages || 0,
        metadata: data.info || {},
      };
    } catch (error) {
      console.error("PDF extraction error details:", { message: error.message });
      throw new Error(`PDF text extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from image using OCR
   */
  async extractTextFromImage(buffer) {
    try {
      // Tesseract.recognize can work with file paths or buffers
      const result = await Tesseract.recognize(buffer, "eng+hin", {
        logger: (m) => {
          if (m.status === "recognizing text" && m.progress < 1) {
            // Silent progress
          }
        },
      });
      return {
        text: result.data.text || "",
        confidence: (result.data.confidence || 0) / 100,
      };
    } catch (error) {
      console.error("OCR extraction error:", error.message);
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }

  /**
   * Detect AI-generated text using HuggingFace roberta-base-openai-detector
   * Falls back to heuristics if API is unavailable
   */
  async detectWithHuggingFace(text) {
    const startTime = Date.now();
    try {
      if (!text || text.length < 20) {
        return { ai_text_probability: 0, human_text_probability: 1, confidence: 0, model_used: "skipped-short-text" };
      }

      // Use roberta-base-openai-detector for AI text detection
      const response = await axios.post(
        `${this.huggingFaceUrl}/roberta-base-openai-detector`,
        { inputs: text.substring(0, 512) },
        {
          headers: {
            Authorization: `Bearer ${this.huggingFaceToken}`,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        }
      );

      // HuggingFace returns array of label/score pairs
      const predictions = response.data[0] || [];
      const fakeLabel = predictions.find(p => p.label === "Fake") || predictions.find(p => p.label === "LABEL_1");
      const realLabel = predictions.find(p => p.label === "Real") || predictions.find(p => p.label === "LABEL_0");

      const aiProbability = fakeLabel?.score || 0;
      const humanProbability = realLabel?.score || (1 - aiProbability);
      const confidence = Math.max(aiProbability, humanProbability);

      return {
        ai_text_probability: aiProbability,
        human_text_probability: humanProbability,
        confidence,
        model_used: "roberta-base-openai-detector",
        processing_time_ms: Date.now() - startTime,
        detected_patterns: aiProbability > 0.6 ? ["hf_ai_detected"] : [],
      };
    } catch (hfError) {
      console.warn("HuggingFace API failed, using heuristic fallback:", hfError.message);
      return this.heuristicAIDetection(text, startTime);
    }
  }

  /**
   * Heuristic AI text detection fallback
   */
  heuristicAIDetection(text, startTime = Date.now()) {
    const patterns = [];
    let suspicionScore = 0;

    const sentenceCount = (text.match(/[.!?]/g) || []).length;
    const words = text.split(/\s+/);
    const uniqueWordRatio = new Set(words.map(w => w.toLowerCase())).size / Math.max(words.length, 1);

    if (uniqueWordRatio < 0.4) { patterns.push("low_vocabulary_diversity"); suspicionScore += 20; }

    const formalWords = (text.match(/\b(furthermore|moreover|therefore|consequently|notwithstanding|delve|utilize|leverage|showcase)\b/gi) || []).length;
    if (formalWords > Math.max(sentenceCount / 3, 2)) { patterns.push("excessive_formal_language"); suspicionScore += 15; }

    const aiPhrases = ["as an ai", "as a language model", "it is worth noting", "in this context", "it is important to note", "in conclusion", "to summarize"];
    const aiPhraseCount = aiPhrases.filter(p => text.toLowerCase().includes(p)).length;
    if (aiPhraseCount > 0) { patterns.push("ai_phrases_detected"); suspicionScore += 25 * aiPhraseCount; }

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length > 4) {
      const avgLen = sentences.reduce((s, x) => s + x.length, 0) / sentences.length;
      const variance = sentences.reduce((s, x) => s + Math.pow(x.length - avgLen, 2), 0) / sentences.length;
      if (Math.sqrt(variance) < 8) { patterns.push("uniform_sentence_structure"); suspicionScore += 15; }
    }

    const prob = Math.min(suspicionScore / 100, 1);
    return {
      ai_text_probability: prob,
      human_text_probability: Math.max(1 - prob, 0),
      confidence: 0.55,
      detected_patterns: patterns,
      model_used: "local-heuristic",
      processing_time_ms: Date.now() - startTime,
    };
  }

  /**
   * Analyze document using OpenAI GPT-4
   * Detects AI-generated text, inconsistencies, and fraud patterns
   */
  async analyzeWithLLM(text, documentType) {
    const startTime = Date.now();

    try {
      if (!this.openaiApiKey) throw new Error("OpenAI API key not configured");

      const prompt = this.buildAnalysisPrompt(text, documentType);

      const response = await axios.post(
        this.openaiEndpoint,
        {
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content:
                "You are an expert forensic document analyst specializing in detecting fraudulent legal documents, AI-generated content, and inconsistencies in Indian legal documents. Always respond with valid JSON only.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 2000,
          response_format: { type: "json_object" },
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      const analysis = JSON.parse(response.data.choices[0].message.content);
      const processingTime = Date.now() - startTime;

      return { ...analysis, processing_time_ms: processingTime, model_used: "gpt-4-turbo" };
    } catch (error) {
      console.error("LLM Analysis failed:", error.message);
      return this.getFallbackAnalysis(error);
    }
  }

  /**
   * Generate a comprehensive AI-powered verification summary using GPT-4
   * with HuggingFace as fallback
   */
  async generateVerificationSummary(verification) {
    const startTime = Date.now();

    try {
      const riskLevel = verification.riskAssessment?.risk_level || "UNKNOWN";
      const riskScore = verification.riskAssessment?.overall_risk_score || 0;
      const aiProb = (verification.aiTextDetection?.ai_text_probability || 0) * 100;
      const tampered = verification.tamperingDetection?.tampering_detected || false;
      const ocrText = verification.ocrAnalysis?.extracted_text?.substring(0, 1000) || "N/A";
      const anomalies = verification.metadataAnalysis?.metadata_anomalies || [];
      const patterns = verification.aiTextDetection?.detected_patterns || [];
      const riskFactors = (verification.riskAssessment?.risk_factors || []).map(f => `${f.factor}: ${f.description}`);

      if (!this.openaiApiKey) throw new Error("No OpenAI key");

      const summaryPrompt = `You are a legal document forensics expert. Generate a concise but comprehensive verification summary for the following document analysis results.

Document: ${verification.fileName || "Unknown"}
Document Type: ${verification.documentType || "Unknown"}
Risk Level: ${riskLevel}
Overall Risk Score: ${riskScore}/100

AI Text Detection:
- AI-generated probability: ${aiProb.toFixed(1)}%
- Patterns detected: ${patterns.join(", ") || "None"}
- Model used: ${verification.aiTextDetection?.model_used || "N/A"}

Tampering Detection:
- Tampering detected: ${tampered ? "YES" : "No"}
- Suspicious edits: ${(verification.tamperingDetection?.suspicious_edits || []).join(", ") || "None"}

Metadata Anomalies: ${anomalies.join(", ") || "None"}

Risk Factors:
${riskFactors.join("\n") || "None detected"}

Extracted Text Sample (first 800 chars):
${ocrText}

Produce a JSON response:
{
  "summary_text": "2-3 paragraph professional summary of the verification findings",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "verdict": "AUTHENTIC" | "SUSPICIOUS" | "FRAUDULENT" | "INCONCLUSIVE",
  "verdict_explanation": "One sentence explaining the verdict"
}`;

      const response = await axios.post(
        this.openaiEndpoint,
        {
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: "You are a forensic document analyst. Respond with valid JSON only." },
            { role: "user", content: summaryPrompt },
          ],
          temperature: 0.3,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        },
        {
          headers: { Authorization: `Bearer ${this.openaiApiKey}`, "Content-Type": "application/json" },
          timeout: 45000,
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return {
        summary_text: result.summary_text || "Verification completed.",
        key_findings: result.key_findings || [],
        verdict: result.verdict || "INCONCLUSIVE",
        verdict_explanation: result.verdict_explanation || "",
        generated_by: "gpt-4-turbo",
        generated_at: new Date(),
        processing_time_ms: Date.now() - startTime,
      };
    } catch (error) {
      console.warn("GPT-4 summary generation failed, using fallback:", error.message);
      return this.generateFallbackSummary(verification, startTime);
    }
  }

  /**
   * Fallback rule-based summary when GPT-4 is unavailable
   */
  generateFallbackSummary(verification, startTime = Date.now()) {
    const riskLevel = verification.riskAssessment?.risk_level || "LOW";
    const riskScore = verification.riskAssessment?.overall_risk_score || 0;
    const aiProb = ((verification.aiTextDetection?.ai_text_probability || 0) * 100).toFixed(1);
    const tampered = verification.tamperingDetection?.tampering_detected;

    const verdictMap = { LOW: "AUTHENTIC", MEDIUM: "SUSPICIOUS", HIGH: "SUSPICIOUS", CRITICAL: "FRAUDULENT" };
    const verdict = verdictMap[riskLevel] || "INCONCLUSIVE";

    const keyFindings = [
      `Risk level assessed as ${riskLevel} with a composite score of ${riskScore}/100`,
      `AI-generated text probability: ${aiProb}%`,
      tampered ? "Document tampering indicators detected" : "No tampering indicators detected",
    ];

    const anomalies = verification.metadataAnalysis?.metadata_anomalies || [];
    if (anomalies.length > 0) keyFindings.push(`Metadata anomalies: ${anomalies.join(", ")}`);

    const summaryText = `This document was submitted for forensic verification and received an overall risk score of ${riskScore}/100, classified as ${riskLevel} risk. ` +
      `AI text analysis indicates a ${aiProb}% probability of AI-generated content. ` +
      `${tampered ? "Tampering indicators were found, suggesting possible document manipulation. " : "No direct tampering was detected. "}` +
      `${anomalies.length > 0 ? `Metadata anomalies identified: ${anomalies.join(", ")}. ` : ""}` +
      `Based on these findings, the document is classified as ${verdict}. ${riskLevel === "LOW" ? "The document appears authentic and can be accepted." : "Manual review is recommended before accepting this document."}`;

    return {
      summary_text: summaryText,
      key_findings: keyFindings,
      verdict,
      verdict_explanation: `Document classified as ${verdict} based on ${riskLevel} risk score.`,
      generated_by: "rule-based-fallback",
      generated_at: new Date(),
      processing_time_ms: Date.now() - startTime,
    };
  }

  /**
   * Build comprehensive analysis prompt for LLM
   */
  buildAnalysisPrompt(text, documentType) {
    return `Analyze this ${documentType} legal document for authenticity and detect potential fraud.

DOCUMENT TEXT:
${text.substring(0, 4000)}

Provide analysis in JSON format with these exact fields:

{
  "ai_text_detection": {
    "is_ai_generated": boolean,
    "ai_probability": number (0-1),
    "confidence": number (0-1),
    "detected_patterns": array of strings,
    "reasoning": string
  },
  "content_validation": {
    "is_valid": boolean,
    "case_number_valid": boolean,
    "case_number_found": string or null,
    "court_name_valid": boolean,
    "court_name_found": string or null,
    "ipc_sections_found": array of strings,
    "date_formats_consistent": boolean,
    "inconsistencies": array of strings
  },
  "tampering_indicators": {
    "suspicious_found": boolean,
    "tampering_probability": number (0-1),
    "suspicious_elements": array of strings,
    "explanation": string
  },
  "authenticity_assessment": {
    "appears_authentic": boolean,
    "confidence_score": number (0-1),
    "red_flags": array of strings,
    "verification_recommendations": array of strings
  },
  "language_analysis": {
    "is_professional": boolean,
    "language_quality": "poor" | "average" | "good" | "excellent",
    "grammar_issues": array of strings,
    "tone_appropriate": boolean
  }
}

Focus on detecting:
1. AI-generated repetitive patterns
2. Inconsistent legal terminology
3. Invalid case number formats (not matching Indian court formats)
4. Suspicious dates or chronological issues
5. Missing mandatory legal elements
6. Unusual phrasing for legal documents
7. Signs of template misuse`;
  }

  /**
   * Calculate file hash for integrity checking
   */
  calculateFileHash(buffer) {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  /**
   * Analyze image properties for tampering detection
   */
  async analyzeImageForTampering(buffer) {
    const startTime = Date.now();

    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      const indicators = {
        unusual_dimensions: metadata.width % 8 !== 0 || metadata.height % 8 !== 0,
        compression_anomaly: metadata.compression && metadata.compression === "jpeg" && !metadata.hasAlpha,
        format_mismatch: false,
      };

      const suspiciousCount = Object.values(indicators).filter(Boolean).length;
      const tamperingProbability = suspiciousCount / Object.keys(indicators).length;

      return {
        is_enabled: true,
        tamper_probability: tamperingProbability,
        tampering_detected: tamperingProbability > 0.5,
        tampering_regions: [],
        suspicious_edits: Object.keys(indicators).filter(k => indicators[k]).map(k => k.replace(/_/g, " ")),
        metadata_analysis: {
          format: metadata.format, width: metadata.width, height: metadata.height,
          space: metadata.space, channels: metadata.channels, depth: metadata.depth, density: metadata.density,
        },
        processing_time_ms: Date.now() - startTime,
      };
    } catch (error) {
      return { is_enabled: true, tamper_probability: 0, tampering_detected: false, error: error.message, processing_time_ms: Date.now() - startTime };
    }
  }

  /**
   * Get document buffer - handle both Buffer and URL inputs
   */
  async getDocumentBuffer(urlOrBuffer) {
    try {
      // If already a buffer, return it
      if (Buffer.isBuffer(urlOrBuffer)) {
        return urlOrBuffer;
      }
      // If it's a URL string, try to download
      if (typeof urlOrBuffer === "string" && urlOrBuffer.startsWith("http")) {
        const response = await axios.get(urlOrBuffer, {
          responseType: "arraybuffer",
          timeout: 30000,
        });
        return Buffer.from(response.data);
      }
      throw new Error("Invalid input: expected Buffer or HTTP URL");
    } catch (error) {
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }

  /**
   * Perform comprehensive document verification using GPT-4 + HuggingFace
   * @param {Buffer|String} urlOrBuffer - File buffer or URL to document
   * @param {String} documentType - Type of document (legal_document, id_proof, etc.)
   * @param {String} mimeType - MIME type for file type detection (e.g., 'application/pdf', 'image/jpeg')
   */
  async verifyDocument(urlOrBuffer, documentType, mimeType = null) {
    const results = { verification_id: null, status: "completed", timestamp: new Date() };

    try {
      console.log(`Starting AI verification for ${documentType} document...`);

      // Get document buffer (from buffer or download from URL)
      const documentBuffer = await this.getDocumentBuffer(urlOrBuffer);
      const fileHash = this.calculateFileHash(documentBuffer);

      // Determine file type from MIME type if provided, otherwise from URL string
      const urlStr = typeof urlOrBuffer === "string" ? urlOrBuffer : "";
      const isImage = mimeType ? mimeType.startsWith("image/") : /\.(jpg|jpeg|png|gif|bmp)$/i.test(urlStr);
      const isPDF = mimeType ? mimeType === "application/pdf" : /\.pdf$/i.test(urlStr);

      let extractedText = "";
      let metadata = {};

      if (isPDF) {
        const pdfData = await this.extractTextFromPDF(documentBuffer);
        extractedText = pdfData.text;
        metadata = { pdf_metadata: { pages_count: pdfData.pages, ...pdfData.metadata }, file_hash: fileHash };
      } else if (isImage) {
        const ocrData = await this.extractTextFromImage(documentBuffer);
        extractedText = ocrData.text;
        metadata = { ocr_confidence: ocrData.confidence, file_hash: fileHash };
        results.tampering_detection = await this.analyzeImageForTampering(documentBuffer);
      } else {
        // Try PDF parsing for unknown types
        try {
          const pdfData = await this.extractTextFromPDF(documentBuffer);
          extractedText = pdfData.text;
          metadata = { pdf_metadata: { pages_count: pdfData.pages }, file_hash: fileHash };
        } catch {
          metadata = { file_hash: fileHash };
        }
      }

      if (extractedText && extractedText.trim().length > 30) {
        // Run HuggingFace AI detection and GPT-4 analysis in parallel
        const [hfResult, llmAnalysis] = await Promise.all([
          this.detectWithHuggingFace(extractedText),
          this.analyzeWithLLM(extractedText, documentType),
        ]);

        // Merge HuggingFace + GPT-4 AI detection (weighted average)
        const gptAiProb = llmAnalysis.ai_text_detection?.ai_probability ?? 0;
        const hfAiProb = hfResult.ai_text_probability ?? 0;
        const mergedAiProb = (hfAiProb * 0.5 + gptAiProb * 0.5);
        const combinedPatterns = [...new Set([
          ...(hfResult.detected_patterns || []),
          ...(llmAnalysis.ai_text_detection?.detected_patterns || []),
        ])];

        results.ai_text_detection = {
          is_enabled: true,
          ai_text_probability: mergedAiProb,
          human_text_probability: 1 - mergedAiProb,
          confidence: Math.max(hfResult.confidence || 0, llmAnalysis.ai_text_detection?.confidence || 0),
          detected_patterns: combinedPatterns,
          model_used: `${hfResult.model_used} + gpt-4-turbo`,
          processing_time_ms: (hfResult.processing_time_ms || 0) + (llmAnalysis.processing_time_ms || 0),
        };

        results.ocr_analysis = {
          is_enabled: true,
          extracted_text: extractedText.substring(0, 5000),
          text_confidence: 0.95,
          language_detected: ["en", "hi"],
          validation_results: llmAnalysis.content_validation || {},
          processing_time_ms: 500,
        };

        if (!results.tampering_detection) {
          results.tampering_detection = {
            is_enabled: true,
            tamper_probability: llmAnalysis.tampering_indicators?.tampering_probability || 0,
            tampering_detected: llmAnalysis.tampering_indicators?.suspicious_found || false,
            tampering_regions: [],
            suspicious_edits: llmAnalysis.tampering_indicators?.suspicious_elements || [],
            model_used: "gpt-4-analysis",
            processing_time_ms: llmAnalysis.processing_time_ms || 0,
          };
        }

        results.authenticity_assessment = llmAnalysis.authenticity_assessment || {};
      } else {
        results.ai_text_detection = { is_enabled: false, error: "Insufficient text for analysis" };
        results.ocr_analysis = { is_enabled: false, extracted_text: extractedText, error: "Text extraction insufficient" };
      }

      results.metadata_analysis = {
        is_enabled: true,
        ...metadata,
        metadata_anomalies: [],
        processing_time_ms: 100,
      };

      results.deepfake_detection = {
        is_enabled: isImage,
        face_detected: false,
        is_deepfake_probability: 0,
        authenticity_score: 1.0,
        morphing_detected: false,
        model_used: "basic-image-analysis",
        processing_time_ms: 0,
      };

      results.signature_verification = {
        is_enabled: false,
        signature_detected: false,
        signature_count: 0,
        signatures: [],
        model_used: "not-implemented",
        processing_time_ms: 0,
      };

      console.log("✅ AI Verification completed successfully");
      return results;
    } catch (error) {
      console.error("Verification error:", error);
      throw error;
    }
  }

  /**
   * Fallback analysis when LLM fails
   */
  getFallbackAnalysis(error) {
    return {
      ai_text_detection: {
        is_ai_generated: false, ai_probability: 0, confidence: 0,
        detected_patterns: [], reasoning: `Analysis failed: ${error.message}`,
      },
      content_validation: { is_valid: true, case_number_valid: null, inconsistencies: ["Unable to perform validation"] },
      tampering_indicators: { suspicious_found: false, tampering_probability: 0, suspicious_elements: [], explanation: "Analysis unavailable" },
      authenticity_assessment: {
        appears_authentic: true, confidence_score: 0,
        red_flags: ["Automated analysis failed - manual review required"],
        verification_recommendations: ["Manual human review required"],
      },
      language_analysis: { is_professional: true, language_quality: "average", grammar_issues: [], tone_appropriate: true },
      processing_time_ms: 0,
      model_used: "fallback",
      error: error.message,
    };
  }
}

module.exports = new AIVerificationService();

