import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Loader,
  Download,
  X,
  TrendingDown,
  Eye,
} from "lucide-react";
import "./VerificationResults.css";

const VerificationResults = ({ verificationId, onClose }) => {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedState, setExpandedState] = useState({
    aiDetection: true,
    metadata: false,
    ocr: false,
  });

  useEffect(() => {
    if (verificationId) {
      pollVerificationStatus();
    }
  }, [verificationId]);

  const pollVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/verifications/${verificationId}`
      );

      if (response.data.success) {
        setVerification(response.data.data);

        // Poll until verification is completed
        if (response.data.data.verificationStatus === "pending" || response.data.data.verificationStatus === "in_progress") {
          setTimeout(pollVerificationStatus, 2000);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      setError("Failed to fetch verification results");
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case "LOW":
        return "#10b981";
      case "MEDIUM":
        return "#f59e0b";
      case "HIGH":
        return "#ef4444";
      case "CRITICAL":
        return "#7c3aed";
      default:
        return "#6b7280";
    }
  };

  const getRiskLevelIcon = (riskLevel) => {
    switch (riskLevel) {
      case "LOW":
        return <CheckCircle size={24} />;
      case "MEDIUM":
        return <AlertCircle size={24} />;
      case "HIGH":
        return <AlertTriangle size={24} />;
      case "CRITICAL":
        return <AlertTriangle size={24} />;
      default:
        return null;
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/verifications/${verificationId}/export`
      );

      const reportData = JSON.stringify(response.data.data, null, 2);
      const blob = new Blob([reportData], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `verification-report-${verificationId}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export report");
    }
  };

  const toggleSection = (section) => {
    setExpandedState((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading && !verification) {
    return (
      <div className="results-modal">
        <div className="results-overlay" onClick={onClose}></div>
        <div className="results-card">
          <div className="loading-state">
            <Loader size={48} className="spinner" />
            <p>Analyzing your document...</p>
            <div className="progress-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-modal">
        <div className="results-overlay" onClick={onClose}></div>
        <div className="results-card">
          <div className="error-state">
            <AlertCircle size={48} />
            <p>{error}</p>
            <button onClick={onClose} className="btn-close-error">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!verification) return null;

  const riskAssessment = verification.riskAssessment || {};
  const aiTextDetection = verification.aiTextDetection || {};
  const metadataAnalysis = verification.metadataAnalysis || {};
  const ocrAnalysis = verification.ocrAnalysis || {};

  return (
    <div className="results-modal">
      <div className="results-overlay" onClick={onClose}></div>
      <div className="results-card">
        {/* Header */}
        <div className="results-header">
          <h2>Verification Results</h2>
          <button onClick={onClose} className="btn-close">
            <X size={24} />
          </button>
        </div>

        {/* Risk Score Banner */}
        <div
          className="risk-score-banner"
          style={{ borderLeftColor: getRiskLevelColor(riskAssessment.risk_level) }}
        >
          <div className="risk-score-left">
            <div className="risk-icon" style={{ color: getRiskLevelColor(riskAssessment.risk_level) }}>
              {getRiskLevelIcon(riskAssessment.risk_level)}
            </div>
            <div className="risk-info">
              <h3>Risk Level: {riskAssessment.risk_level}</h3>
              <p>Score: {riskAssessment.overall_risk_score || 0}/100</p>
            </div>
          </div>
          <div className="risk-score-circle" style={{ borderColor: getRiskLevelColor(riskAssessment.risk_level) }}>
            {riskAssessment.overall_risk_score || 0}%
          </div>
        </div>

        {/* Status Messages */}
        {verification.verificationStatus === "completed" && (
          <div className="status-message success">
            ✓ Verification completed successfully
          </div>
        )}
        {verification.verificationStatus === "in_progress" && (
          <div className="status-message info">
            <Loader size={16} className="spinner" /> Verification in progress...
          </div>
        )}

        {/* Risk Factors */}
        {riskAssessment.risk_factors && riskAssessment.risk_factors.length > 0 && (
          <div className="section">
            <h4>Risk Factors</h4>
            <div className="risk-factors-list">
              {riskAssessment.risk_factors.map((factor, idx) => (
                <div key={idx} className={`factor-item severity-${factor.severity}`}>
                  <div className="factor-header">
                    <span className="factor-name">{factor.factor}</span>
                    <span className="factor-score">{Math.round(factor.score)}%</span>
                  </div>
                  <p className="factor-description">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {riskAssessment.recommendations && (
          <div className="section">
            <h4>Recommendations</h4>
            <ul className="recommendations-list">
              {riskAssessment.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Text Detection */}
        <div className="collapsible-section">
          <button
            className="section-toggle"
            onClick={() => toggleSection("aiDetection")}
          >
            <span>AI Text Detection</span>
            <span className={`toggle-icon ${expandedState.aiDetection ? "open" : ""}`}>
              ▼
            </span>
          </button>
          {expandedState.aiDetection && (
            <div className="section-content">
              <div className="stat-row">
                <span className="stat-label">AI Probability:</span>
                <span className="stat-value">
                  {Math.round((aiTextDetection.ai_text_probability || 0) * 100)}%
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Confidence:</span>
                <span className="stat-value">
                  {Math.round((aiTextDetection.confidence || 0) * 100)}%
                </span>
              </div>
              {aiTextDetection.detected_patterns && (
                <div className="stat-row">
                  <span className="stat-label">Patterns Found:</span>
                  <div className="patterns-list">
                    {aiTextDetection.detected_patterns.map((pattern, idx) => (
                      <span key={idx} className="pattern-badge">
                        {pattern.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metadata Analysis */}
        <div className="collapsible-section">
          <button
            className="section-toggle"
            onClick={() => toggleSection("metadata")}
          >
            <span>Metadata Analysis</span>
            <span className={`toggle-icon ${expandedState.metadata ? "open" : ""}`}>
              ▼
            </span>
          </button>
          {expandedState.metadata && (
            <div className="section-content">
              {metadataAnalysis.metadata_anomalies && metadataAnalysis.metadata_anomalies.length > 0 ? (
                <div>
                  <p className="warning-text">Anomalies detected:</p>
                  <ul className="anomalies-list">
                    {metadataAnalysis.metadata_anomalies.map((anomaly, idx) => (
                      <li key={idx}>{anomaly.replace(/_/g, " ")}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="success-text">✓ No metadata anomalies detected</p>
              )}
              {metadataAnalysis.file_hash && (
                <div className="stat-row">
                  <span className="stat-label">File Hash:</span>
                  <code className="hash-code">
                    {metadataAnalysis.file_hash.substring(0, 32)}...
                  </code>
                </div>
              )}
            </div>
          )}
        </div>

        {/* OCR Analysis */}
        <div className="collapsible-section">
          <button
            className="section-toggle"
            onClick={() => toggleSection("ocr")}
          >
            <span>Document Content Analysis</span>
            <span className={`toggle-icon ${expandedState.ocr ? "open" : ""}`}>
              ▼
            </span>
          </button>
          {expandedState.ocr && (
            <div className="section-content">
              <div className="stat-row">
                <span className="stat-label">Text Confidence:</span>
                <span className="stat-value">
                  {Math.round((ocrAnalysis.text_confidence || 0) * 100)}%
                </span>
              </div>
              {ocrAnalysis.extracted_text && (
                <div className="extracted-text-preview">
                  <p className="preview-label">Extracted Text Preview:</p>
                  <div className="text-preview">
                    {ocrAnalysis.extracted_text.substring(0, 500)}...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <button onClick={handleExportReport} className="btn-export">
            <Download size={18} />
            Export Report
          </button>
          <button onClick={onClose} className="btn-done">
            Done
          </button>
        </div>

        {/* Document Info Footer */}
        <div className="document-info-footer">
          <p>
            <strong>File:</strong> {verification.fileName}
          </p>
          <p>
            <strong>Type:</strong> {verification.documentType}
          </p>
          <p>
            <strong>Verified:</strong>{" "}
            {new Date(verification.verificationCompletedAt || new Date()).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationResults;
