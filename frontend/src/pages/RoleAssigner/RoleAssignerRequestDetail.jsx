import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Scale,
  Brain,
  Database,
  FileText,
  MapPin,
  Building,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  Eye
} from 'lucide-react';
import axios from 'axios';

const RoleAssignerRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/role-assigner/requests/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setRequest(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      alert('Failed to fetch request details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/role-assigner/requests/${id}/verify`,
        { verificationNotes },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('Request verified successfully! Admin will review it for final approval.');
        navigate('/role-assigner/dashboard');
      }
    } catch (error) {
      console.error('Error verifying request:', error);
      alert(error.response?.data?.message || 'Failed to verify request');
    } finally {
      setActionLoading(false);
      setShowVerifyModal(false);
    }
  };

  const handleReturn = async () => {
    if (!returnReason.trim()) {
      alert('Please provide a reason for returning the request');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/role-assigner/requests/${id}/return`,
        { reason: returnReason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('Request returned for more information');
        navigate('/role-assigner/dashboard');
      }
    } catch (error) {
      console.error('Error returning request:', error);
      alert(error.response?.data?.message || 'Failed to return request');
    } finally {
      setActionLoading(false);
      setShowReturnModal(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'police': return Shield;
      case 'lawyer': return Scale;
      case 'forensic_expert': return Brain;
      case 'judge': return Database;
      default: return FileText;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'police': return 'text-blue-600 bg-blue-100';
      case 'lawyer': return 'text-green-600 bg-green-100';
      case 'forensic_expert': return 'text-purple-600 bg-purple-100';
      case 'judge': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">Request not found</p>
          <button
            onClick={() => navigate('/role-assigner/dashboard')}
            className="mt-4 text-orange-600 hover:text-orange-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(request.requestedRole);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/role-assigner/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-lg ${getRoleColor(request.requestedRole)}`}>
                  <RoleIcon className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{request.fullName}</h1>
                  <p className="text-gray-600">{request.email}</p>
                  <p className="text-sm text-gray-500 mt-1">Request ID: {request._id}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'verified' ? 'bg-green-100 text-green-800' :
                  request.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{request.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{request.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Organization</p>
                    <p className="font-medium text-gray-900">{request.organizationName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Designation</p>
                    <p className="font-medium text-gray-900">{request.designation}</p>
                  </div>
                </div>
                {request.departmentId && (
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Department ID</p>
                      <p className="font-medium text-gray-900">{request.departmentId}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Submitted On</p>
                    <p className="font-medium text-gray-900">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Address */}
            {request.officeAddress && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Office Address
                </h2>
                <div className="space-y-2 text-gray-700">
                  {request.officeAddress.street && <p>{request.officeAddress.street}</p>}
                  {request.officeAddress.city && <p>{request.officeAddress.city}, {request.officeAddress.state} {request.officeAddress.pincode}</p>}
                  {request.officeAddress.country && <p>{request.officeAddress.country}</p>}
                </div>
              </div>
            )}

            {/* Purpose and Case Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Purpose & Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Purpose of Request</p>
                  <p className="text-gray-900">{request.purpose}</p>
                </div>
                {request.caseDetails && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Case Details</p>
                    <p className="text-gray-900">{request.caseDetails}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Uploaded Documents</h2>
              <div className="space-y-3">
                {request.documents.idProof && (
                  <DocumentItem label="ID Proof" document={request.documents.idProof} />
                )}
                {request.documents.authorizationLetter && (
                  <DocumentItem label="Authorization Letter" document={request.documents.authorizationLetter} />
                )}
                {request.documents.registrationCertificate && (
                  <DocumentItem label="Registration Certificate" document={request.documents.registrationCertificate} />
                )}
                {request.documents.professionalLicense && (
                  <DocumentItem label="Professional License" document={request.documents.professionalLicense} />
                )}
                {request.documents.securityClearance && (
                  <DocumentItem label="Security Clearance" document={request.documents.securityClearance} />
                )}
                {request.documents.additionalDocuments && request.documents.additionalDocuments.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Additional Documents</p>
                    {request.documents.additionalDocuments.map((doc, index) => (
                      <DocumentItem key={index} label={`Document ${index + 1}`} document={doc} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            {(request.status === 'pending' || request.status === 'under_review') && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Verify Request
                  </button>
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Return for Info
                  </button>
                </div>
              </div>
            )}

            {/* Verification Info */}
            {request.status === 'verified' && request.verifiedBy && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-green-900 mb-2">Verified</h3>
                <p className="text-sm text-green-800">
                  Verified by {request.verifiedBy.fullName || request.verifiedBy.email}
                </p>
                {request.verifiedAt && (
                  <p className="text-sm text-green-700 mt-1">
                    {new Date(request.verifiedAt).toLocaleString()}
                  </p>
                )}
                {request.verificationWatermark && (
                  <div className="mt-3 p-3 bg-white rounded border border-green-200">
                    <p className="text-xs text-gray-600 font-mono">{request.verificationWatermark}</p>
                  </div>
                )}
                {request.verificationNotes && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-green-900">Notes:</p>
                    <p className="text-sm text-green-800 mt-1">{request.verificationNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Technical Requirements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Requirements</h2>
              <div className="space-y-2">
                {Object.entries(request.technicalRequirements || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {value ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Request Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3">
                <TimelineItem
                  date={request.createdAt}
                  label="Request Submitted"
                  icon={FileText}
                />
                {request.verifiedAt && (
                  <TimelineItem
                    date={request.verifiedAt}
                    label="Verified"
                    icon={CheckCircle}
                  />
                )}
                {request.reviewedAt && (
                  <TimelineItem
                    date={request.reviewedAt}
                    label="Admin Reviewed"
                    icon={Eye}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verify Modal */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Verify Request</h3>
              <p className="text-gray-600 mb-4">
                By verifying this request, you confirm that all documents and information have been reviewed and are authentic.
                The request will be sent to admin for final approval.
              </p>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Add verification notes (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent mb-4"
                rows="4"
              ></textarea>
              <div className="flex gap-3">
                <button
                  onClick={handleVerify}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {actionLoading ? 'Verifying...' : 'Confirm Verification'}
                </button>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Return for More Information</h3>
              <p className="text-gray-600 mb-4">
                Provide a reason for returning this request. The applicant will be notified.
              </p>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Reason for returning (required)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent mb-4"
                rows="4"
                required
              ></textarea>
              <div className="flex gap-3">
                <button
                  onClick={handleReturn}
                  disabled={actionLoading || !returnReason.trim()}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition-colors"
                >
                  {actionLoading ? 'Returning...' : 'Return Request'}
                </button>
                <button
                  onClick={() => setShowReturnModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const DocumentItem = ({ label, document }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-3">
      <FileText className="w-5 h-5 text-gray-400" />
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{document.filename}</p>
      </div>
    </div>
    <div className="flex gap-2">
      <a
        href={document.url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View"
      >
        <Eye className="w-5 h-5" />
      </a>
      <a
        href={document.url}
        download
        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        title="Download"
      >
        <Download className="w-5 h-5" />
      </a>
    </div>
  </div>
);

const TimelineItem = ({ date, label, icon: Icon }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-orange-100 rounded-full">
      <Icon className="w-4 h-4 text-orange-600" />
    </div>
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-500">{new Date(date).toLocaleString()}</p>
    </div>
  </div>
);

export default RoleAssignerRequestDetail;
