import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Download,
  Eye,
  RefreshCw,
  FileWarning,
  Shield,
  TrendingUp,
  Bot,
  Fingerprint,
  BookOpen
} from 'lucide-react';

const EvidenceVerification = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [verifications, setVerifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [highRiskDocs, setHighRiskDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [verifyingStatus, setVerifyingStatus] = useState(null); // 'polling' | 'completed' | null
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    document: null,
    documentType: 'legal_document',
    caseId: ''
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
      fetchHighRiskDocuments();
    } else if (activeTab === 'history') {
      fetchVerifications();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/verification/admin/analytics/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHighRiskDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/verification/admin/analytics/high-risk`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHighRiskDocs(response.data.data?.documents || []);
    } catch (error) {
      console.error('Error fetching high-risk documents:', error);
    }
  };

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // This would need a new endpoint to fetch all verifications
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/verification/admin/analytics/detailed`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVerifications(response.data.data?.allVerifications || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadForm({ ...uploadForm, document: file });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.document) {
      setError('Please select a document');
      return;
    }

    if (!uploadForm.documentType) {
      setError('Please select a document type');
      return;
    }

    try {
      setError(null);
      setUploadLoading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('document', uploadForm.document);
      formData.append('documentType', uploadForm.documentType);
      if (uploadForm.caseId) {
        formData.append('caseId', uploadForm.caseId);
      }

      console.log('📤 Uploading document:', {
        name: uploadForm.document.name,
        type: uploadForm.document.type,
        size: uploadForm.document.size,
        documentType: uploadForm.documentType
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/verification/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('✅ Upload successful:', response.data.data);
      setSuccess('✅ Document uploaded successfully! AI verification is in progress...');
      setUploadForm({ document: null, documentType: 'legal_document', caseId: '' });
      setVerifyingStatus('polling');
      
      // Poll for verification status using correct ID field
      pollVerificationStatus(response.data.data.verificationId);
    } catch (error) {
      console.error('❌ Error uploading document:', error);
      
      // Provide specific error messages
      let errorMessage = 'Error uploading document';
      
      if (error.response?.status === 400) {
        const msg = error.response?.data?.message;
        if (msg?.includes('Invalid file type')) {
          errorMessage = '❌ Invalid file type. Only PDF and JPEG/PNG images are allowed.';
        } else if (msg?.includes('No file uploaded')) {
          errorMessage = '❌ No file was selected. Please choose a file.';
        } else {
          errorMessage = `❌ ${msg}`;
        }
      } else if (error.response?.status === 500) {
        errorMessage = '❌ Server error while processing document. Please try again.';
      } else if (error.message === 'Network Error') {
        errorMessage = '❌ Network error. Please check your connection and try again.';
      } else {
        errorMessage = `❌ ${error.response?.data?.message || error.message || errorMessage}`;
      }
      
      setError(errorMessage);
    } finally {
      setUploadLoading(false);
    }
  };

  const pollVerificationStatus = async (verificationId) => {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/verification/${verificationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const verification = response.data.data;
        
        if (verification.verificationStatus === 'completed') {
          console.log('✅ Verification completed:', verification);
          setSelectedDocument(verification);
          setVerifyingStatus('completed');
          setSuccess('✅ Verification completed! Results are ready.');
          setActiveTab('results');
        } else if (verification.verificationStatus === 'failed') {
          console.error('❌ Verification failed:', verification);
          const errorMsg = verification.errors?.[0]?.error_message || 'Verification failed for unknown reason';
          setError(`❌ Verification failed: ${errorMsg}`);
          setVerifyingStatus(null);
          setSelectedDocument(verification);
        } else if (attempts < maxAttempts) {
          attempts++;
          console.log(`⏳ Verification in progress... (${attempts}/${maxAttempts})`);
          setTimeout(checkStatus, 2000);
        } else {
          console.warn('⚠️ Verification timed out');
          setVerifyingStatus(null);
          setError('⚠️ Verification is taking longer than expected. You can check the status in the History tab.');
        }
      } catch (error) {
        console.error('❌ Error polling verification status:', error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 2000);
        } else {
          setVerifyingStatus(null);
          setError('❌ Unable to fetch verification status. Please check History tab or try refreshing.');
        }
      }
    };

    checkStatus();
  };

  const getRiskBadge = (riskLevel) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800'
    };
    
    const icons = {
      LOW: <CheckCircle className="h-4 w-4" />,
      MEDIUM: <AlertTriangle className="h-4 w-4" />,
      HIGH: <FileWarning className="h-4 w-4" />,
      CRITICAL: <XCircle className="h-4 w-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[riskLevel] || colors.MEDIUM}`}>
        {icons[riskLevel]}
        {riskLevel}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      manual_review: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const exportReport = async (verificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/verification/${verificationId}/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `verification-report-${verificationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report');
    }
  };

  const filteredVerifications = verifications.filter(v => {
    const matchesSearch = (v.fileName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === '' || v.riskAssessment?.risk_level === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="h-full bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-orange-600" />
            Evidence Verification System
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            AI-powered document authenticity verification using GPT-4 and advanced analysis
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'upload', label: 'Upload Document', icon: Upload },
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'history', label: 'Verification History', icon: FileText },
              { id: 'results', label: 'Results', icon: Eye, hidden: !selectedDocument }
            ].map(tab => (
              !tab.hidden && (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              )
            ))}
          </nav>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Document for Verification</h2>
              
              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="mt-1 text-xs text-red-600 hover:text-red-700 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800">{success}</p>
                    {verifyingStatus === 'polling' && (
                      <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Polling for results...
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleUpload} className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document File <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-orange-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, JPG, PNG, DOC up to 10MB
                      </p>
                      {uploadForm.document && (
                        <p className="text-sm text-green-600 font-medium mt-2">
                          Selected: {uploadForm.document.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={uploadForm.documentType}
                    onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                  >
                    <option value="legal_document">Legal Document</option>
                    <option value="id_proof">ID Proof (Aadhaar / PAN)</option>
                    <option value="court_order">Court Order</option>
                    <option value="fir">FIR (First Information Report)</option>
                    <option value="contract">Contract / Agreement</option>
                    <option value="affidavit">Affidavit</option>
                    <option value="stamp_duty">Stamp Duty Document</option>
                    <option value="license">License / Certificate</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Case ID (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadForm.caseId}
                    onChange={(e) => setUploadForm({ ...uploadForm, caseId: e.target.value })}
                    placeholder="Link to existing case"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={uploadLoading || !uploadForm.document}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Uploading & Verifying...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Upload & Verify Document
                    </>
                  )}
                </button>
              </form>

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Verification Process Includes:</h3>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• <strong>AI-Generated Text Detection</strong> — HuggingFace RoBERTa + GPT-4 Analysis</li>
                  <li>• <strong>Document Tampering Detection</strong> — Image forensics & metadata checks</li>
                  <li>• <strong>OCR Extraction</strong> — English + Hindi text recognition</li>
                  <li>• <strong>Content Validation</strong> — Case numbers, court names, IPC sections</li>
                  <li>• <strong>Metadata & Digital Forensics</strong> — File integrity & anomaly detection</li>
                  <li>• <strong>GPT-4 Verification Summary</strong> — Verdict & key findings report</li>
                </ul>
              </div>

              {/* Polling State */}
              {verifyingStatus === 'polling' && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 animate-spin text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Verification in progress...</p>
                    <p className="text-sm text-yellow-600">GPT-4 & HuggingFace are analyzing your document. This may take 15–30 seconds.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 animate-spin mx-auto text-orange-600" />
                <p className="mt-4 text-gray-600">Loading dashboard...</p>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                {stats && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      title="Total Verifications"
                      value={stats.totalVerifications}
                      icon={FileText}
                      color="blue"
                    />
                    <StatCard
                      title="High Risk"
                      value={stats.highRiskCount}
                      icon={XCircle}
                      color="red"
                    />
                    <StatCard
                      title="Verified Safe"
                      value={stats.lowRiskCount}
                      icon={CheckCircle}
                      color="green"
                    />
                    <StatCard
                      title="Avg Risk Score"
                      value={stats.averageRiskScore?.toFixed(1) + '%'}
                      icon={TrendingUp}
                      color="orange"
                    />
                  </div>
                )}

                {/* High Risk Documents Table */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      High Risk Documents
                    </h3>
                    <button
                      onClick={fetchHighRiskDocuments}
                      className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Document
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Risk Level
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Risk Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {highRiskDocs.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                              No high-risk documents found
                            </td>
                          </tr>
                        ) : (
                          highRiskDocs.map(doc => (
                            <tr key={doc._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {doc.fileName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getRiskBadge(doc.riskAssessment?.risk_level)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.riskAssessment?.overall_risk_score?.toFixed(1)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedDocument(doc);
                                    setActiveTab('results');
                                  }}
                                  className="text-orange-600 hover:text-orange-900"
                                >
                                  <Eye className="h-5 w-5 inline" />
                                </button>
                                <button
                                  onClick={() => exportReport(doc._id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Download className="h-5 w-5 inline" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by filename..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
                <option value="CRITICAL">Critical Risk</option>
              </select>
              <button
                onClick={fetchVerifications}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {/* Verifications List */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 animate-spin mx-auto text-orange-600" />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredVerifications.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No verifications found
                        </td>
                      </tr>
                    ) : (
                      filteredVerifications.map(v => (
                        <tr key={v._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{v.fileName}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{v.documentType?.replace('_', ' ')}</td>
                          <td className="px-6 py-4">{getStatusBadge(v.verificationStatus)}</td>
                          <td className="px-6 py-4">{v.riskAssessment ? getRiskBadge(v.riskAssessment.risk_level) : '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(v.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 space-x-2">
                            <button
                              onClick={() => {
                                setSelectedDocument(v);
                                setActiveTab('results');
                              }}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              <Eye className="h-5 w-5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && selectedDocument && (
          <VerificationResults
            verification={selectedDocument}
            onClose={() => {
              setSelectedDocument(null);
              setActiveTab('history');
            }}
            onExport={() => exportReport(selectedDocument._id)}
          />
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

// Verification Results Component
const VerificationResults = ({ verification, onClose, onExport }) => {
  const risk = verification.riskAssessment || {};
  const riskLevel = risk.risk_level || 'LOW';
  const riskScore = risk.overall_risk_score || 0;
  const summary = verification.verificationSummary;

  const riskColors = {
    LOW: 'bg-green-100 text-green-800 border-green-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  };

  const verdictColors = {
    AUTHENTIC: 'bg-green-100 text-green-900 border-green-300',
    SUSPICIOUS: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    FRAUDULENT: 'bg-red-100 text-red-900 border-red-300',
    INCONCLUSIVE: 'bg-gray-100 text-gray-900 border-gray-300',
  };

  const verdictIcons = {
    AUTHENTIC: <CheckCircle className="h-6 w-6 text-green-600" />,
    SUSPICIOUS: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
    FRAUDULENT: <XCircle className="h-6 w-6 text-red-600" />,
    INCONCLUSIVE: <FileWarning className="h-6 w-6 text-gray-600" />,
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6 text-orange-600" />
          Verification Results — {verification.fileName}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={onExport} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" /> Export Report
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Close</button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Top KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Risk Level</p>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${riskColors[riskLevel]}`}>
              {riskLevel}
            </span>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Risk Score</p>
            <p className="text-2xl font-bold text-gray-900">{riskScore}<span className="text-sm font-normal text-gray-500">/100</span></p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">AI Generated</p>
            <p className={`text-lg font-bold ${(verification.aiTextDetection?.ai_text_probability || 0) > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
              {(((verification.aiTextDetection?.ai_text_probability || 0) * 100).toFixed(1))}%
            </p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Document Type</p>
            <p className="text-sm font-medium text-gray-700 capitalize">{(verification.documentType || 'N/A').replace(/_/g, ' ')}</p>
          </div>
        </div>

        {/* ── AI Verification Summary ── */}
        {summary ? (
          <div className={`border-2 rounded-xl p-5 ${verdictColors[summary.verdict] || 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-start gap-3 mb-4">
              {verdictIcons[summary.verdict] || <Bot className="h-6 w-6 text-gray-600" />}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold">AI Verification Verdict</h3>
                  <span className={`px-3 py-0.5 rounded-full text-sm font-bold border ${verdictColors[summary.verdict]}`}>
                    {summary.verdict}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">via {summary.generated_by}</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{summary.summary_text}</p>
              </div>
            </div>
            {summary.key_findings && summary.key_findings.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <BookOpen className="h-4 w-4" /> Key Findings
                </h4>
                <ul className="space-y-1">
                  {summary.key_findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-white bg-opacity-60 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-xl p-5 text-center text-sm text-gray-500">
            <Bot className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            Summary not yet generated — please wait for verification to complete.
          </div>
        )}

        {/* Risk Factors */}
        {risk.risk_factors && risk.risk_factors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-base font-semibold text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Risk Factors Detected
            </h3>
            <div className="space-y-2">
              {risk.risk_factors.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className={`shrink-0 inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                    factor.severity === 'high' ? 'bg-red-600 text-white' : factor.severity === 'medium' ? 'bg-orange-500 text-white' : 'bg-yellow-400 text-gray-900'
                  }`}>{factor.severity?.toUpperCase()}</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{factor.factor}</p>
                    <p className="text-xs text-gray-600">{factor.description} — Score: {factor.score?.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Analysis */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-orange-500" /> Detailed Analysis
            </h3>
          </div>
          <div className="p-4 divide-y divide-gray-100 space-y-0">
            {/* AI Text Detection */}
            {verification.aiTextDetection && (
              <div className="py-4 first:pt-0">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                  <Bot className="h-4 w-4 text-purple-500" /> AI Text Detection
                  <span className="ml-2 text-xs text-gray-400">({verification.aiTextDetection.model_used})</span>
                </h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">AI Probability</p>
                    <p className={`font-bold ${(verification.aiTextDetection.ai_text_probability || 0) > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                      {((verification.aiTextDetection.ai_text_probability || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Human Score</p>
                    <p className="font-bold text-blue-600">{((verification.aiTextDetection.humanWritingScore || verification.aiTextDetection.human_text_probability || 0) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Confidence</p>
                    <p className="font-bold text-gray-700">{((verification.aiTextDetection.confidence || 0) * 100).toFixed(1)}%</p>
                  </div>
                </div>
                {(verification.aiTextDetection.detectedPatterns || verification.aiTextDetection.detected_patterns || []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(verification.aiTextDetection.detectedPatterns || verification.aiTextDetection.detected_patterns || []).map((p, i) => (
                      <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{p.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tampering Detection */}
            {verification.tamperingDetection && (
              <div className="py-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Tampering Detection</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Tampered</p>
                    <p className={`font-bold ${(verification.tamperingDetection.isTampered || verification.tamperingDetection.tampering_detected) ? 'text-red-600' : 'text-green-600'}`}>
                      {(verification.tamperingDetection.isTampered || verification.tamperingDetection.tampering_detected) ? 'YES' : 'No'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Integrity Score</p>
                    <p className="font-bold text-gray-700">
                      {((1 - (verification.tamperingDetection.tamper_probability || 0)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                {(verification.tamperingDetection.inconsistencies || verification.tamperingDetection.suspicious_edits || []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(verification.tamperingDetection.inconsistencies || verification.tamperingDetection.suspicious_edits || []).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">{s.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Deepfake & Authenticity Detection */}
            {(verification.deepfake_detection || verification.deepfakeDetection) && (
              <div className="py-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">🎬 Deepfake & Authenticity Detection</h4>
                <div className="space-y-4">
                  {/* Overall Authenticity Badge */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Overall Status</p>
                      <div className="flex gap-2">
                        {(verification.deepfake_detection?.authenticity_score || 0.8) >= 0.7 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-bold">
                            <CheckCircle className="h-4 w-4" /> Legit Document
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-bold">
                            <AlertTriangle className="h-4 w-4" /> Tampering Detected
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Authenticity</p>
                      <p className="text-2xl font-bold text-gray-900">{((verification.deepfake_detection?.authenticity_score || 0.8) * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* Deepfake Probability Gauge */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Deepfake Probability</p>
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              (verification.deepfake_detection?.is_deepfake_probability || 0) < 0.3
                                ? 'bg-green-500'
                                : (verification.deepfake_detection?.is_deepfake_probability || 0) < 0.7
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${((verification.deepfake_detection?.is_deepfake_probability || 0) * 100)}%` }}
                          />
                        </div>
                        <p className="text-sm font-bold text-gray-700 w-12 text-right">
                          {((verification.deepfake_detection?.is_deepfake_probability || 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Low Risk</span>
                        <span>High Risk</span>
                      </div>
                    </div>
                  </div>

                  {/* Face & Morphing Detection */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs text-gray-500">Face Detected</p>
                      <p className={`font-bold ${verification.deepfake_detection?.face_detected ? 'text-orange-600' : 'text-gray-600'}`}>
                        {verification.deepfake_detection?.face_detected ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs text-gray-500">Morphing Detected</p>
                      <p className={`font-bold ${verification.deepfake_detection?.morphing_detected ? 'text-red-600' : 'text-green-600'}`}>
                        {verification.deepfake_detection?.morphing_detected ? 'Yes ⚠️' : 'No ✅'}
                      </p>
                    </div>
                  </div>

                  {/* Detection Info */}
                  <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                    <p>Model: {verification.deepfake_detection?.model_used || 'Image Analysis'}</p>
                    <p>Processing Time: {verification.deepfake_detection?.processing_time_ms || 0}ms</p>
                  </div>
                </div>
              </div>
            )}

            {/* OCR & Text Analysis */}
            {verification.ocrAnalysis && (verification.ocrAnalysis.extractedText || verification.ocrAnalysis.extracted_text) && (
              <div className="py-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">OCR Analysis</h4>
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Language</p>
                    <p className="font-medium">{verification.ocrAnalysis.language || (verification.ocrAnalysis.language_detected || ['en'])[0]}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Text Quality</p>
                    <p className="font-medium capitalize">{verification.ocrAnalysis.textQuality || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Confidence</p>
                    <p className="font-medium">{(((verification.ocrAnalysis.confidence || verification.ocrAnalysis.text_confidence || 0) * 100)).toFixed(1)}%</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">Extracted Text (first 500 chars)</p>
                  <p className="text-xs text-gray-700 font-mono leading-relaxed">
                    {(verification.ocrAnalysis.extractedText || verification.ocrAnalysis.extracted_text || '').substring(0, 500)}
                    {(verification.ocrAnalysis.extractedText || verification.ocrAnalysis.extracted_text || '').length > 500 && '…'}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata Analysis */}
            {verification.metadataAnalysis && (
              <div className="py-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Metadata Analysis</h4>
                {(verification.metadataAnalysis.suspiciousFlags || verification.metadataAnalysis.metadata_anomalies || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {(verification.metadataAnalysis.suspiciousFlags || verification.metadataAnalysis.metadata_anomalies || []).map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">{f.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> No metadata anomalies detected</p>
                )}
                {verification.metadataAnalysis.file_hash && (
                  <p className="text-xs text-gray-400 mt-2 font-mono">SHA-256: {verification.metadataAnalysis.file_hash}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {risk.recommendations && risk.recommendations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-base font-semibold text-blue-900 mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {risk.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-blue-800">{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceVerification;

     