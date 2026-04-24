import React, { useState, useRef } from "react";
import axios from "axios";
import { Upload, AlertCircle, CheckCircle, Clock, Loader } from "lucide-react";
import "./DocumentUpload.css";

const DocumentUpload = ({ caseId, onVerificationStart }) => {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationId, setVerificationId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const documentTypes = [
    "Court Order",
    "FIR",
    "Identity Document",
    "Police Report",
    "Medical Report",
    "Contract",
    "Evidence Document",
    "Other",
  ];

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type and size
      const maxSize = 50 * 1024 * 1024; // 50MB
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Please upload a PDF or image file (JPEG, PNG)");
        return;
      }

      if (selectedFile.size > maxSize) {
        setError("File size exceeds 50MB limit");
        return;
      }

      setFile(selectedFile);
      setError("");
      setUploadStatus("");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (event) => {
    event.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove("drag-over");

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const maxSize = 50 * 1024 * 1024;
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

      if (!allowedTypes.includes(droppedFile.type)) {
        setError("Please drop a PDF or image file (JPEG, PNG)");
        return;
      }

      if (droppedFile.size > maxSize) {
        setError("File size exceeds 50MB limit");
        return;
      }

      setFile(droppedFile);
      setError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!documentType) {
      setError("Please select a document type");
      return;
    }

    setUploading(true);
    setUploadStatus("Uploading...");
    setError("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", documentType);
      if (caseId) {
        formData.append("caseId", caseId);
      }

      const response = await axios.post(
        "http://localhost:5000/api/verifications/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response.data.success) {
        setVerificationId(response.data.data.verificationId);
        setUploadStatus("pending");
        setFile(null);
        setDocumentType("");
        setUploadProgress(0);

        // Notify parent component
        if (onVerificationStart) {
          onVerificationStart(response.data.data.verificationId);
        }

        // Auto-reset form after 2 seconds
        setTimeout(() => {
          setUploadStatus("");
          setVerificationId(null);
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
      setUploadStatus("failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="document-upload-container">
      <div className="upload-card">
        <h2>Upload Document for Verification</h2>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {uploadStatus === "pending" && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <span>Document uploaded. Verification in progress...</span>
          </div>
        )}

        <form onSubmit={handleUpload}>
          {/* Document Type Selection */}
          <div className="form-group">
            <label htmlFor="documentType">Document Type *</label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              disabled={uploading}
              className="select-input"
            >
              <option value="">Select document type</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload Area */}
          <div className="file-upload-area" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={uploading}
              style={{ display: "none" }}
            />

            <div className="upload-content" onClick={() => fileInputRef.current?.click()}>
              <Upload size={48} />
              <h3>Drop your file here or click to browse</h3>
              <p>Supported formats: PDF, JPEG, PNG</p>
              <p className="file-size-info">Maximum file size: 50MB</p>
            </div>

            {file && (
              <div className="file-info">
                <p>
                  <strong>Selected:</strong> {file.name}
                </p>
                <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !file || !documentType}
            className="submit-btn"
          >
            {uploading ? (
              <>
                <Loader size={18} className="spinner" />
                Uploading...
              </>
            ) : (
              "Verify Document"
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="info-box">
          <h4>What happens next?</h4>
          <ul>
            <li>✓ Your document is uploaded and scanned</li>
            <li>✓ AI analysis checks for authenticity</li>
            <li>✓ Risk score is calculated</li>
            <li>✓ Results are available in seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
