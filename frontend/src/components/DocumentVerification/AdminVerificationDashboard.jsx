import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader,
} from "lucide-react";
import "./AdminVerificationDashboard.css";

const AdminVerificationDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [highRiskDocs, setHighRiskDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [manualReviewStatus, setManualReviewStatus] = useState("");

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, analyticsRes, highRiskRes] = await Promise.all([
        axios.get("http://localhost:5000/api/verifications/stats"),
        axios.get("http://localhost:5000/api/verifications/analytics"),
        axios.get("http://localhost:5000/api/verifications/high-risk"),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (highRiskRes.data.success) setHighRiskDocs(highRiskRes.data.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const handleManualReview = async (status, notes) => {
    if (!selectedDoc) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/verifications/${selectedDoc._id}/review`,
        { status, notes }
      );

      if (response.data.success) {
        setManualReviewStatus("Review submitted successfully");
        setSelectedDoc(null);
        setTimeout(() => {
          setManualReviewStatus("");
          fetchDashboardData();
        }, 2000);
      }
    } catch (err) {
      setManualReviewStatus("Error submitting review");
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <Loader size={48} className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard error">
        <AlertCircle size={48} />
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Evidence Verification Dashboard</h1>
        <p>Monitor document authenticity and fraud detection</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <CheckCircle size={32} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Verifications</p>
            <h3>{stats?.total_verifications || 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={32} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending Review</p>
            <h3>{stats?.pending_manual_review || 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon critical">
            <AlertTriangle size={32} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Critical Risk</p>
            <h3>{stats?.risk_breakdown?.critical || 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon high">
            <AlertCircle size={32} />
          </div>
          <div className="stat-content">
            <p className="stat-label">High Risk</p>
            <h3>{stats?.risk_breakdown?.high || 0}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Risk Distribution Chart */}
        <div className="chart-container">
          <h2>Risk Distribution</h2>
          <div className="risk-distribution">
            <div className="risk-bar">
              <div className="risk-segment low">
                <span>{stats?.risk_breakdown?.low || 0}</span>
              </div>
              <div className="risk-segment medium">
                <span>{stats?.risk_breakdown?.medium || 0}</span>
              </div>
              <div className="risk-segment high">
                <span>{stats?.risk_breakdown?.high || 0}</span>
              </div>
              <div className="risk-segment critical">
                <span>{stats?.risk_breakdown?.critical || 0}</span>
              </div>
            </div>
          </div>
          <div className="risk-legend">
            <div className="legend-item">
              <span className="legend-color low"></span> Low
            </div>
            <div className="legend-item">
              <span className="legend-color medium"></span> Medium
            </div>
            <div className="legend-item">
              <span className="legend-color high"></span> High
            </div>
            <div className="legend-item">
              <span className="legend-color critical"></span> Critical
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="analytics-container">
          <h2>Verification Analytics</h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <h4>Total Processed (30 days)</h4>
              <p className="analytics-value">{analytics?.total_processed || 0}</p>
            </div>
            <div className="analytics-card">
              <h4>Average Risk Score</h4>
              <p className="analytics-value">{Math.round(analytics?.average_risk_score || 0)}</p>
            </div>
            <div className="analytics-card">
              <h4>AI Detected</h4>
              <p className="analytics-value">{analytics?.detection_breakdown?.ai_detected_count || 0}</p>
            </div>
            <div className="analytics-card">
              <h4>Avg Processing Time</h4>
              <p className="analytics-value">{Math.round(analytics?.processing_time_stats?.average_time_seconds || 0)}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* High Risk Documents Table */}
      <div className="high-risk-section">
        <h2>
          <AlertTriangle size={24} /> High Risk Documents
          {stats?.flagged_for_review > 0 && (
            <span className="badge">{stats.flagged_for_review}</span>
          )}
        </h2>

        {highRiskDocs.length > 0 ? (
          <div className="table-responsive">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Risk Level</th>
                  <th>Risk Score</th>
                  <th>Uploaded By</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {highRiskDocs.map((doc) => (
                  <tr key={doc._id} className={`risk-${doc.riskAssessment?.risk_level?.toLowerCase()}`}>
                    <td className="file-name">{doc.fileName}</td>
                    <td>{doc.documentType}</td>
                    <td>
                      <span className={`risk-badge ${doc.riskAssessment?.risk_level?.toLowerCase()}`}>
                        {doc.riskAssessment?.risk_level}
                      </span>
                    </td>
                    <td className="risk-score">{doc.riskAssessment?.overall_risk_score || 0}%</td>
                    <td>{doc.uploadedBy?.fullName || "Unknown"}</td>
                    <td>
                      <span className={`status-badge ${doc.manualVerificationStatus || "pending"}`}>
                        {doc.manualVerificationStatus || "Pending"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="btn-review"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <CheckCircle size={48} />
            <p>No high-risk documents at this time</p>
          </div>
        )}
      </div>

      {/* Manual Review Modal */}
      {selectedDoc && (
        <ManualReviewModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onSubmit={handleManualReview}
          statusMessage={manualReviewStatus}
        />
      )}
    </div>
  );
};

// Manual Review Modal Component
const ManualReviewModal = ({ document, onClose, onSubmit, statusMessage }) => {
  const [status, setStatus] = useState("rejected");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert("Please enter review notes");
      return;
    }
    onSubmit(status, notes);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manual Review</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="document-info">
            <h3>{document.fileName}</h3>
            <p>
              <strong>Type:</strong> {document.documentType}
            </p>
            <p>
              <strong>Risk Level:</strong>
              <span
                className={`risk-badge ${document.riskAssessment?.risk_level?.toLowerCase()}`}
              >
                {document.riskAssessment?.risk_level}
              </span>
            </p>
          </div>

          <div className="risk-factors-review">
            <h4>Risk Factors:</h4>
            {document.riskAssessment?.risk_factors?.map((factor, idx) => (
              <div key={idx} className="factor-item">
                <span className="factor-name">{factor.factor}</span>
                <span className="factor-severity">{factor.severity}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="status">Decision *</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select"
              >
                <option value="rejected">Reject Document</option>
                <option value="approved">Approve Document</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Review Notes *</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter your review notes and findings..."
                rows={6}
                className="form-textarea"
              />
            </div>

            {statusMessage && (
              <div className={`message ${statusMessage.includes("Error") ? "error" : "success"}`}>
                {statusMessage}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminVerificationDashboard;
