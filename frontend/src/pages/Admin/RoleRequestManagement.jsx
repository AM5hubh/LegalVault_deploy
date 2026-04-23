import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Shield,
    Brain,
    Scale,
    Database,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    FileText,
    Mail,
    Phone,
    Building,
    User,
    Calendar,
    Download,
    Filter,
    Search
} from 'lucide-react';

const RoleRequestManagement = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        verified: 0,
        approved: 0,
        rejected: 0,
        byStatus: [],
        byRole: []
    });
    
    const [filters, setFilters] = useState({
        status: 'all',
        role: 'all',
        search: ''
    });

    const applyFilters = useCallback(() => {
        let filtered = [...requests];

        // Filter by status
        if (filters.status !== 'all') {
            filtered = filtered.filter(req => req.status === filters.status);
        }

        // Filter by role
        if (filters.role !== 'all') {
            filtered = filtered.filter(req => req.requestedRole === filters.role);
        }

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(req =>
                req.fullName.toLowerCase().includes(searchLower) ||
                req.email.toLowerCase().includes(searchLower) ||
                req.organizationName.toLowerCase().includes(searchLower)
            );
        }

        setFilteredRequests(filtered);
    }, [filters, requests]);

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, requests, applyFilters]);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/role-requests/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setRequests(response.data.data);
                setFilteredRequests(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/role-requests/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleUpdateStatus = async (requestId, status, rejectionReason = '') => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/role-requests/${requestId}/status`,
                { status, rejectionReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                await fetchRequests();
                await fetchStats();
                setShowModal(false);
                setSelectedRequest(null);
                alert(`Request ${status} successfully!`);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating request status');
        } finally {
            setActionLoading(false);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'police': return Shield;
            case 'forensic_expert': return Brain;
            case 'lawyer': return Scale;
            case 'judge': return Database;
            default: return User;
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'police': return 'bg-blue-100 text-blue-800';
            case 'forensic_expert': return 'bg-purple-100 text-purple-800';
            case 'lawyer': return 'bg-green-100 text-green-800';
            case 'judge': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending
                </span>;
            case 'verified':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified
                </span>;
            case 'approved':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Approved
                </span>;
            case 'rejected':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Rejected
                </span>;
            case 'under_review':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Under Review
                </span>;
            default:
                return status;
        }
    };

    const RequestDetailModal = () => {
        if (!selectedRequest) return null;

        const RoleIcon = getRoleIcon(selectedRequest.requestedRole);
        
        return (
            <div className="fixed inset-0  bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Role Request Details</h2>
                                <div className="flex items-center gap-2">
                                    <RoleIcon className="w-5 h-5" />
                                    <span className="text-sm opacity-90">{selectedRequest.requestedRole}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-orange-600" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Full Name</p>
                                    <p className="font-medium">{selectedRequest.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{selectedRequest.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">{selectedRequest.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Requested Role</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedRequest.requestedRole)}`}>
                                        {selectedRequest.requestedRole}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Organization Details */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Building className="w-5 h-5 text-orange-600" />
                                Organization Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Organization Name</p>
                                    <p className="font-medium">{selectedRequest.organizationName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Designation</p>
                                    <p className="font-medium">{selectedRequest.designation}</p>
                                </div>
                                {selectedRequest.departmentId && (
                                    <div>
                                        <p className="text-sm text-gray-600">Department ID</p>
                                        <p className="font-medium">{selectedRequest.departmentId}</p>
                                    </div>
                                )}
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600">Office Address</p>
                                    <p className="font-medium">
                                        {selectedRequest.officeAddress?.street}, {selectedRequest.officeAddress?.city}, {selectedRequest.officeAddress?.state} - {selectedRequest.officeAddress?.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Purpose */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-orange-600" />
                                Purpose for Access
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">{selectedRequest.purpose}</p>
                            </div>
                        </div>

                        {/* Verification Information - Formal Patent/Watermark Style */}
                        {(selectedRequest.verificationWatermark || selectedRequest.verifiedBy) && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    Verification Certificate
                                </h3>
                                
                                {/* Formal Watermark/Patent Style */}
                                <div className="relative border-4 border-green-600 rounded-xl p-8 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
                                    {/* Decorative background watermark */}
                                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-9xl font-bold text-green-600 transform -rotate-45">✓</div>
                                        </div>
                                    </div>
                                    
                                    {/* Main content */}
                                    <div className="relative z-10 space-y-6">
                                        {/* Header */}
                                        <div className="text-center border-b-2 border-green-200 pb-4">
                                            <p className="text-xs uppercase tracking-widest text-green-700 font-semibold mb-2">Official Verification</p>
                                            <p className="text-2xl font-bold text-green-900">Role Request Certificate</p>
                                        </div>
                                        
                                        {/* Certificate Details */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="text-center">
                                                <p className="text-xs uppercase text-green-700 font-semibold mb-1">Applicant Name</p>
                                                <p className="text-sm font-bold text-gray-800">{selectedRequest.fullName}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs uppercase text-green-700 font-semibold mb-1">Requested Role</p>
                                                <p className="text-sm font-bold text-gray-800 uppercase">{selectedRequest.requestedRole}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Watermark - Main Verification Signature */}
                                        {selectedRequest.verificationWatermark && (
                                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-6 text-center border-2 border-green-700">
                                                <p className="text-lg font-bold mb-2">VERIFICATION SIGNATURE</p>
                                                <p className="text-base font-mono tracking-wide">
                                                    {selectedRequest.verificationWatermark}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Verification Stamp */}
                                        <div className="border-t-2 border-b-2 border-green-200 py-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-xs uppercase text-green-700 font-semibold mb-2">Verified By</p>
                                                    <p className="text-sm font-bold text-green-900">
                                                        {selectedRequest.verifiedBy?.fullName || selectedRequest.verifiedBy?.email || 'Role Verification Officer'}
                                                    </p>
                                                    <p className="text-xs text-green-600 mt-1">Verification Officer</p>
                                                </div>
                                                {selectedRequest.verifiedAt && (
                                                    <div className="text-center">
                                                        <p className="text-xs uppercase text-green-700 font-semibold mb-2">Date</p>
                                                        <p className="text-sm font-bold text-gray-800">
                                                            {new Date(selectedRequest.verifiedAt).toLocaleDateString('en-IN', { 
                                                                year: 'numeric', 
                                                                month: '2-digit', 
                                                                day: '2-digit' 
                                                            })}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            {new Date(selectedRequest.verifiedAt).toLocaleTimeString('en-IN', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                second: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="text-right">
                                                    <p className="text-xs uppercase text-green-700 font-semibold mb-2">Status</p>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                        <p className="text-sm font-bold text-green-900">Verified</p>
                                                    </div>
                                                    <p className="text-xs text-green-600 mt-1">Official</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Verification Notes */}
                                        {selectedRequest.verificationNotes && (
                                            <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4">
                                                <p className="text-xs uppercase text-green-700 font-semibold mb-2 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    Verification Notes
                                                </p>
                                                <p className="text-sm text-green-900 font-medium">{selectedRequest.verificationNotes}</p>
                                            </div>
                                        )}
                                        
                                        {/* Footer - Official Seal Style */}
                                        <div className="text-center border-t-2 border-green-200 pt-4">
                                            <div className="inline-flex items-center justify-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <p className="text-xs uppercase tracking-widest text-green-700 font-bold">
                                                    Officially Verified & Certified
                                                </p>
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <p className="text-xs text-green-600 mt-2">This document certifies the official verification of the role request</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verifier Full Details */}
                        {selectedRequest.verifiedBy && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Verification Officer Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                                    <div>
                                        <p className="text-sm text-blue-600 font-semibold">Full Name</p>
                                        <p className="font-bold text-gray-800">{selectedRequest.verifiedBy.fullName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-600 font-semibold">Email</p>
                                        <p className="font-medium text-gray-800">{selectedRequest.verifiedBy.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-600 font-semibold">Phone</p>
                                        <p className="font-medium text-gray-800">{selectedRequest.verifiedBy.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-600 font-semibold">Role</p>
                                        <p className="font-medium text-gray-800">{selectedRequest.verifiedBy.role || 'N/A'}</p>
                                    </div>
                                    {selectedRequest.verifiedBy.agency && (
                                        <div>
                                            <p className="text-sm text-blue-600 font-semibold">Agency</p>
                                            <p className="font-medium text-gray-800">{selectedRequest.verifiedBy.agency}</p>
                                        </div>
                                    )}
                                    {selectedRequest.verifiedBy.designation && (
                                        <div>
                                            <p className="text-sm text-blue-600 font-semibold">Designation</p>
                                            <p className="font-medium text-gray-800">{selectedRequest.verifiedBy.designation}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Applicant Full Details */}
                        {selectedRequest.userId && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-purple-600" />
                                    Applicant Full Profile
                                </h3>
                                <div className="grid grid-cols-2 gap-4 bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                                    <div>
                                        <p className="text-sm text-purple-600 font-semibold">Full Name</p>
                                        <p className="font-bold text-gray-800">{selectedRequest.userId.fullName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-purple-600 font-semibold">Email</p>
                                        <p className="font-medium text-gray-800">{selectedRequest.userId.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-purple-600 font-semibold">Phone</p>
                                        <p className="font-medium text-gray-800">{selectedRequest.userId.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-purple-600 font-semibold">Current Role</p>
                                        <p className="font-medium text-gray-800">{selectedRequest.userId.role || 'N/A'}</p>
                                    </div>
                                    {selectedRequest.userId.agency && (
                                        <div>
                                            <p className="text-sm text-purple-600 font-semibold">Agency</p>
                                            <p className="font-medium text-gray-800">{selectedRequest.userId.agency}</p>
                                        </div>
                                    )}
                                    {selectedRequest.userId.kycStatus && (
                                        <div>
                                            <p className="text-sm text-purple-600 font-semibold">KYC Status</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                                selectedRequest.userId.kycStatus === 'completed' ? 'bg-green-200 text-green-800' :
                                                selectedRequest.userId.kycStatus === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                                'bg-gray-200 text-gray-800'
                                            }`}>
                                                {selectedRequest.userId.kycStatus}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        {selectedRequest.documents && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-orange-600" />
                                    Uploaded Documents
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(selectedRequest.documents).map(([key, doc]) => {
                                        if (key === 'additionalDocuments' && Array.isArray(doc)) {
                                            return doc.map((additionalDoc, idx) => (
                                                <a
                                                    key={`${key}-${idx}`}
                                                    href={additionalDoc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <span className="text-sm">Additional Document {idx + 1}</span>
                                                    <Download className="w-4 h-4 text-orange-600" />
                                                </a>
                                            ));
                                        } else if (doc && doc.url) {
                                            return (
                                                <a
                                                    key={key}
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <Download className="w-4 h-4 text-orange-600" />
                                                </a>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Request Status */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Current Status</h3>
                            <div className="flex items-center gap-3">
                                {getStatusBadge(selectedRequest.status)}
                                <span className="text-sm text-gray-600">
                                    Submitted {new Date(selectedRequest.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {(selectedRequest.status === 'verified' || selectedRequest.status === 'pending') && (
                            <div className="flex gap-4 pt-4 border-t">
                                <button
                                    onClick={() => handleUpdateStatus(selectedRequest._id, 'approved')}
                                    disabled={actionLoading}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    {selectedRequest.status === 'verified' ? 'Approve Verified Request' : 'Approve Request'}
                                </button>
                                <button
                                    onClick={() => {
                                        const reason = prompt('Enter rejection reason:');
                                        if (reason) {
                                            handleUpdateStatus(selectedRequest._id, 'rejected', reason);
                                        }
                                    }}
                                    disabled={actionLoading}
                                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Reject Request
                                </button>
                            </div>
                        )}
                        {selectedRequest.status === 'approved' && (
                            <div className="pt-4 border-t">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <p className="text-green-800 font-medium">This request has been approved</p>
                                    {selectedRequest.reviewedBy && (
                                        <p className="text-sm text-green-700 mt-1">
                                            Reviewed by {selectedRequest.reviewedBy.fullName || selectedRequest.reviewedBy.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        {selectedRequest.status === 'rejected' && (
                            <div className="pt-4 border-t">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800 font-medium">This request has been rejected</p>
                                    {selectedRequest.rejectionReason && (
                                        <p className="text-sm text-red-700 mt-2">Reason: {selectedRequest.rejectionReason}</p>
                                    )}
                                     {selectedRequest.reviewedBy && (
                                        <p className="text-sm text-red-700 mt-1">
                                            Reviewed by {selectedRequest.reviewedBy.fullName || selectedRequest.reviewedBy.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Request Management</h1>
                    <p className="text-gray-600">Review and manage role access requests</p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Requests</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <FileText className="w-10 h-10 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <Clock className="w-10 h-10 text-yellow-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Verified</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.verified || 0}</p>
                            </div>
                            <CheckCircle className="w-10 h-10 text-purple-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                            </div>
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rejected</p>
                                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                            </div>
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or organization..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="under_review">Under Review</option>
                            </select>
                        </div>

                        {/* Role Filter */}
                        <div>
                            <select
                                value={filters.role}
                                onChange={(e) => setFilters({...filters, role: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                            >
                                <option value="all">All Roles</option>
                                <option value="police">Police</option>
                                <option value="forensic_expert">Forensic Expert</option>
                                <option value="lawyer">Lawyer</option>
                                <option value="judge">Judge</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Requests Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No requests found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((request) => {
                                        const RoleIcon = getRoleIcon(request.requestedRole);
                                        return (
                                            <tr key={request._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{request.fullName}</p>
                                                        <p className="text-sm text-gray-500">{request.email}</p>
                                                        {request.status === 'verified' && request.verifiedBy && (
                                                            <div className="mt-1 text-xs">
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Verified by {typeof request.verifiedBy === 'object' ? request.verifiedBy.fullName || request.verifiedBy.email : 'RoleAssigner'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(request.requestedRole)}`}>
                                                        <RoleIcon className="w-4 h-4" />
                                                        {request.requestedRole}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-900">{request.organizationName}</p>
                                                    <p className="text-xs text-gray-500">{request.designation}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(request.status)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setShowModal(true);
                                                        }}
                                                        className="text-orange-600 hover:text-orange-800 font-medium text-sm flex items-center gap-1"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && <RequestDetailModal />}
        </div>
    );
};

export default RoleRequestManagement;
