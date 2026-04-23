import React, { useState, useRef } from "react";
import { prepareTransaction } from "thirdweb";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader,
  X,
  File,
  Music,
  Video,
  Image,
  FileJson,
  Wallet,
} from "lucide-react";
import { DEFAULT_CHAIN } from "../../utils/thirdwebConfig";
import { client } from "../../utils/thirdwebClient";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const PoliceEvidenceUploadIPFS = () => {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadedData, setUploadedData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [blockchainStep, setBlockchainStep] = useState("idle"); // idle | uploading | signing | confirming
  const fileInputRef = useRef(null);

  const activeAccount = useActiveAccount();
  const { mutateAsync: sendTransaction } = useSendTransaction();

  const [formData, setFormData] = useState({
    file: null,
    caseId: "",
    evidenceType: "digital",
    description: "",
  });

  const SUPPORTED_FORMATS = {
    images: {
      types: ["image/jpeg", "image/png"],
      extensions: ["jpg", "jpeg", "png"],
      label: "Photos",
      icon: Image,
    },
    videos: {
      types: ["video/mp4"],
      extensions: ["mp4"],
      label: "Videos",
      icon: Video,
    },
    documents: {
      types: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ],
      extensions: ["pdf", "doc", "docx", "xls", "xlsx", "txt"],
      label: "Documents (PDF, DOC, DOCX, XLS, XLSX, TXT)",
      icon: FileText,
    },
    audio: {
      types: ["audio/mpeg", "audio/wav"],
      extensions: ["mp3", "wav"],
      label: "Audio",
      icon: Music,
    },
    archives: {
      types: ["application/zip", "application/x-rar-compressed"],
      extensions: ["zip", "rar"],
      label: "Archives",
      icon: File,
    },
  };

  const EVIDENCE_TYPES = [
    { value: "FIR", label: "FIR (First Information Report)" },
    { value: "charge_sheet", label: "Charge Sheet" },
    { value: "photo", label: "Crime Scene Photo" },
    { value: "video", label: "Surveillance Footage" },
    { value: "audio", label: "Audio Recording" },
    { value: "document", label: "Supporting Document" },
    { value: "digital", label: "Other Digital Evidence" },
  ];

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const getFileIcon = (mimeType) => {
    for (const [, format] of Object.entries(SUPPORTED_FORMATS)) {
      if (format.types.includes(mimeType)) {
        const IconComponent = format.icon;
        return <IconComponent className="w-8 h-8 text-orange-600" />;
      }
    }
    return <File className="w-8 h-8 text-gray-600" />;
  };

  const isValidFileType = (file) => {
    const allAllowedTypes = Object.values(SUPPORTED_FORMATS).flatMap(
      (f) => f.types,
    );
    return allAllowedTypes.includes(file.type);
  };

  const isValidFileSize = (file) => {
    return file.size <= MAX_FILE_SIZE;
  };

  const notifyError = (message) => toast.error(message);
  const notifySuccess = (message) => toast.success(message);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes, k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file type
    if (!isValidFileType(file)) {
      setErrorMessage(
        "Invalid file type. Please upload: Photos (JPEG, PNG), Videos (MP4), Documents (PDF, DOC, DOCX, etc.), Audio (MP3, WAV), or Archives (ZIP, RAR)",
      );
      setShowError(true);
      notifyError(
        "Invalid file type. Allowed: JPEG, PNG, MP4, PDF/DOC/DOCX, XLS/XLSX/TXT, MP3/WAV, ZIP/RAR.",
      );
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    // Validate file size
    if (!isValidFileSize(file)) {
      setErrorMessage(
        `File size exceeds 100MB limit. Your file is ${formatFileSize(file.size)}`,
      );
      setShowError(true);
      notifyError(
        `File size exceeds 100MB limit. Your file is ${formatFileSize(file.size)}`,
      );
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      file: file,
    }));
    setShowError(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.file) {
      setErrorMessage("Please select a file to upload");
      setShowError(true);
      notifyError("Please select a file to upload");
      return;
    }

    if (formData.file.size === 0) {
      setErrorMessage(
        "Selected file is empty. Please choose a non-empty file.",
      );
      setShowError(true);
      notifyError("Selected file is empty. Please choose a non-empty file.");
      return;
    }

    if (!formData.caseId.trim()) {
      setErrorMessage("Please enter a case ID");
      setShowError(true);
      notifyError("Please enter a case ID");
      return;
    }

    if (!formData.evidenceType.trim()) {
      setErrorMessage("Please select an evidence type");
      setShowError(true);
      notifyError("Please select an evidence type");
      return;
    }

    if (!activeAccount?.address) {
      setErrorMessage("Please connect your wallet before uploading.");
      setShowError(true);
      notifyError("Please connect your wallet before uploading.");
      return;
    }

    try {
      setIsLoading(true);
      setUploadProgress(0);
      setBlockchainStep("uploading");

      const uploadFormData = new FormData();
      uploadFormData.append("evidence", formData.file);
      uploadFormData.append("caseId", formData.caseId);
      uploadFormData.append("evidenceType", formData.evidenceType);
      uploadFormData.append("description", formData.description);

      // Step 1: Upload to IPFS (reuse existing endpoint)
      const uploadResponse = await fetch(
        `${API_BASE_URL}/evidence/upload/ipfs`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: uploadFormData,
        },
      );

      if (!uploadResponse.ok) {
        const err = await uploadResponse.json().catch(() => ({}));
        throw new Error(err.message || "IPFS upload failed");
      }

      const uploadResult = await uploadResponse.json();
      const { ipfsData } = uploadResult;

      if (!ipfsData?.cid || !ipfsData?.hash) {
        throw new Error("Missing IPFS data from server response");
      }

      setUploadProgress(45);
      setBlockchainStep("signing");
      setSuccessMessage(
        "Evidence uploaded to IPFS. Preparing transaction for signature...",
      );
      setShowSuccess(true);
      notifySuccess("Evidence uploaded to IPFS. Preparing transaction...");

      // Step 2: Ask backend for unsigned tx targeting EvidenceRegistry
      const onchainResponse = await fetch(
        `${API_BASE_URL}/evidence/onchain/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify({
            caseId: formData.caseId,
            ipfsCID: ipfsData.cid,
            fileHash: ipfsData.hash,
            evidenceType: formData.evidenceType,
            from: activeAccount.address,
          }),
        },
      );

      if (!onchainResponse.ok) {
        const err = await onchainResponse.json().catch(() => ({}));
        throw new Error(
          err.message || "Failed to prepare on-chain transaction",
        );
      }

      const onchainResult = await onchainResponse.json();
      const { tx, contract } = onchainResult || {};

      if (!tx?.to || !tx?.data) {
        throw new Error("Invalid transaction payload from server");
      }

      setUploadProgress(65);

      // Step 3: Sign and send transaction with connected wallet
      const preparedTx = prepareTransaction({
        client,
        chain: DEFAULT_CHAIN,
        to: tx.to,
        data: tx.data,
        value: tx.value ? BigInt(tx.value) : 0n,
        gas: tx.gasLimit ? BigInt(tx.gasLimit) : undefined,
        from: activeAccount.address,
      });

      const txResult = await sendTransaction(preparedTx);
      const txHash = txResult?.transactionHash || txResult?.hash || txResult;

      if (!txHash) {
        throw new Error("Failed to obtain transaction hash from wallet");
      }

      setUploadProgress(100);
      setBlockchainStep("idle");
      setUploadedData({
        cid: ipfsData.cid,
        ipfsUrl: ipfsData.ipfsUrl,
        evidenceId: formData.caseId,
        hash: ipfsData.hash,
        txHash: txHash.toString(),
        contract,
      });
      setSuccessMessage(
        `Evidence transaction submitted!\nTransaction: ${txHash}\nIPFS CID: ${ipfsData.cid}`,
      );
      setShowSuccess(true);
      notifySuccess("Evidence transaction submitted to the network.");

      setFormData({
        file: null,
        caseId: "",
        evidenceType: "digital",
        description: "",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadProgress(0);
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(
        error?.message || "An error occurred during upload. Please try again.",
      );
      setShowError(true);
      setBlockchainStep("idle");
      notifyError(
        error?.message || "An error occurred during upload. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFile = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Upload Digital Evidence to IPFS
          </h1>
          <p className="text-gray-600 mt-2">
            Securely upload digital evidence (photos, videos, documents, audio,
            FIRs, charge sheets) to decentralized IPFS storage with blockchain
            verification.
          </p>
        </div>

        {/* Alert Messages */}
        {showError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1 whitespace-pre-line">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => setShowError(false)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {showSuccess && uploadedData && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">
                  Upload Successful!
                </h3>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
                <div className="mt-4 bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 break-all">
                  <strong>IPFS CID:</strong> {uploadedData.cid}
                  <br />
                  <strong>IPFS URL:</strong> {uploadedData.ipfsUrl}
                  <br />
                  <strong>Evidence ID:</strong> {uploadedData.evidenceId}
                  <br />
                  <strong>File Hash:</strong> {uploadedData.hash}
                </div>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleUpload} className="space-y-8">
            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-4">
                Select Evidence File *
              </label>

              {/* Drag and Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive
                    ? "border-orange-600 bg-orange-50"
                    : "border-gray-300 hover:border-gray-400 bg-gray-50"
                } ${formData.file ? "hidden" : ""}`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">
                  Drag and drop your evidence file here
                </p>
                <p className="text-sm text-gray-600 mt-2">or</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  className="hidden"
                  accept={Object.values(SUPPORTED_FORMATS)
                    .flatMap((f) => f.types)
                    .join(",")}
                />
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <p className="text-xs text-gray-600 mb-3">
                    <strong>Supported Formats:</strong>
                  </p>
                  <div className="space-y-2">
                    {Object.values(SUPPORTED_FORMATS).map((format, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-center"
                      >
                        <format.icon className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-600">
                          {format.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    <strong>Maximum file size:</strong> 100 MB
                  </p>
                </div>
              </div>

              {/* Selected File Display */}
              {formData.file && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getFileIcon(formData.file.type)}
                      <div>
                        <p className="font-medium text-gray-900 break-all">
                          {formData.file.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Size: {formatFileSize(formData.file.size)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Type: {formData.file.type}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Upload Progress */}
                  {isLoading && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">
                          Uploading to IPFS...
                        </p>
                        <p className="text-sm font-medium text-orange-600">
                          {uploadProgress}%
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Case ID */}
            <div>
              <label
                htmlFor="caseId"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Case ID *
              </label>
              <input
                type="text"
                id="caseId"
                name="caseId"
                value={formData.caseId}
                onChange={handleInputChange}
                placeholder="e.g., CASE-2024-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Enter the case ID this evidence is associated with
              </p>
            </div>

            {/* Evidence Type */}
            <div>
              <label
                htmlFor="evidenceType"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Evidence Type *
              </label>
              <select
                id="evidenceType"
                name="evidenceType"
                value={formData.evidenceType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none"
                disabled={isLoading}
                required
              >
                {EVIDENCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">
                Select the type of evidence you are uploading
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add any relevant details about this evidence..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none resize-none"
                disabled={isLoading}
              ></textarea>
              <p className="text-xs text-gray-600 mt-1">
                Provide context or additional information about the evidence
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col space-y-4">
              {activeAccount ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
                  <Wallet className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
                  <div className="text-sm text-green-800 break-all">
                    Wallet connected: {activeAccount.address}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start">
                  <Wallet className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                  <div className="text-sm text-yellow-800">
                    Connect your wallet to sign the blockchain transaction.
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading || !formData.file}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      {blockchainStep === "uploading" && "Uploading to IPFS..."}
                      {blockchainStep === "signing" &&
                        "Waiting for Signature..."}
                      {blockchainStep === "confirming" && "Confirming..."}
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Evidence
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      file: null,
                      caseId: "",
                      evidenceType: "digital",
                      description: "",
                    });
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="shrink-0">
                  <FileJson className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Why IPFS?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Decentralized storage for enhanced security</li>
                      <li>Immutable records with SHA-256 hashing</li>
                      <li>Blockchain verification for tamper detection</li>
                      <li>Full audit trail with timestamp verification</li>
                      <li>Complete regulatory compliance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* KYC Alert */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                KYC Verification Required
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your account must be KYC verified to upload evidence. Please
                ensure your KYC status is verified before attempting uploads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceEvidenceUploadIPFS;
