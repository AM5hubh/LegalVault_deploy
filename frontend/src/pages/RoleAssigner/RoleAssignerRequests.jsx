import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Search,
  Shield,
  Scale,
  Brain,
  Database,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Award
} from 'lucide-react';
import axios from 'axios';

const RoleAssignerRequests = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isMyVerifications = location.pathname === '/role-assigner/my-verifications';
  
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    role: 'all',
    search: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, requests]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isMyVerifications 
        ? `${import.meta.env.VITE_API_URL}/role-assigner/my-verifications`
        : `${import.meta.env.VITE_API_URL}/role-assigner/requests`;
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 }
      });

      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'police': return Shield;
      case 'lawyer': return Scale;
      case 'forensic_expert': return Brain;
      case 'judge': return Database;
      default: return FileText;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'police': return 'bg-blue-100 text-blue-800';
      case 'lawyer': return 'bg-green-100 text-green-800';
      case 'forensic_expert': return 'bg-purple-100 text-purple-800';
      case 'judge': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'under_review':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Under Review
          </span>
        );
      case 'verified':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Verified
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                {isMyVerifications && <Award className="w-8 h-8 text-green-600" />}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {isMyVerifications ? 'My Verifications' : 'Role Requests'}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {isMyVerifications 
                      ? 'Roles you have verified and approved' 
                      : 'Review and verify role access requests'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/role-assigner/dashboard')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className={`grid gap-4 ${isMyVerifications ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'}`}>
            {/* Search */}
            <div className={isMyVerifications ? 'w-full' : 'md:col-span-2'}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or organization..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                />
              </div>
            </div>

            {!isMyVerifications && (
              <>
                {/* Status Filter */}
                <div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="verified">Verified</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    <option value="police">Police</option>
                    <option value="forensic_expert">Forensic Expert</option>
                    <option value="lawyer">Lawyer</option>
                    <option value="judge">Judge</option>
                  </select>
                </div>
              </>
            )}

            {isMyVerifications && (
              <>
                {/* Status Filter for My Verifications */}
                <div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  >
                    <option value="all">All My Verifications</option>
                    <option value="verified">Verified</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="under_review">Under Review</option>
                  </select>
                </div>

                {/* Role Filter for My Verifications */}
                <div>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    <option value="police">Police</option>
                    <option value="forensic_expert">Forensic Expert</option>
                    <option value="lawyer">Lawyer</option>
                    <option value="judge">Judge</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredRequests.length}</span> of{' '}
            <span className="font-semibold">{requests.length}</span> requests
          </p>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No requests found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => {
                    const RoleIcon = getRoleIcon(request.requestedRole);
                    return (
                      <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{request.fullName}</div>
                            <div className="text-sm text-gray-500">{request.email}</div>
                            {request.phone && (
                              <div className="text-sm text-gray-400">{request.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <RoleIcon className="w-5 h-5 text-gray-600" />
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(request.requestedRole)}`}>
                              {request.requestedRole.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{request.organizationName}</div>
                            <div className="text-sm text-gray-500">{request.designation}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(request.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/role-assigner/requests/${request._id}`)}
                            className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignerRequests;
