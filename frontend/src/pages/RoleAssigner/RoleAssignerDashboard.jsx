import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Scale,
  Brain,
  Database,
  Search,
  Eye,
  CheckSquare,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

const RoleAssignerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    verified: 0,
    approved: 0,
    rejected: 0,
    myVerifications: 0,
    recentRequests: 0,
    awaitingAction: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user has role_assigner role
      if (parsedUser.role !== 'role_assigner') {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }

    fetchStatistics();
    fetchRecentRequests();
  }, [navigate]);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/role-assigner/statistics`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/role-assigner/requests?limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setRecentRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching recent requests:', error);
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
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'under_review':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Under Review</span>;
      case 'verified':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified</span>;
      case 'approved':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all text-left w-full group"
    >
      <div className="flex items-start">
        <div className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );

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
              <h1 className="text-3xl font-bold text-gray-900">Role Assigner Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user?.fullName || user?.email}</p>
              <p className="text-sm text-gray-500 mt-1">Review and verify role access requests</p>
            </div>
            <button
              onClick={() => fetchStatistics()}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Awaiting Action"
            value={stats.awaitingAction}
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard
            title="Verified by Me"
            value={stats.myVerifications}
            icon={CheckSquare}
            color="bg-green-500"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={FileText}
            color="bg-blue-500"
          />
          <StatCard
            title="Recent Requests"
            value={stats.recentRequests}
            icon={TrendingUp}
            color="bg-purple-500"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved (Total)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected (Total)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionCard
              title="Review Requests"
              description="Review pending role requests"
              icon={Search}
              color="bg-blue-600"
              onClick={() => navigate('/role-assigner/requests')}
            />
            <QuickActionCard
              title="My Verifications"
              description="View your verification history"
              icon={CheckSquare}
              color="bg-green-600"
              onClick={() => navigate('/role-assigner/my-verifications')}
            />
            <QuickActionCard
              title="All Requests"
              description="View all role requests"
              icon={FileText}
              color="bg-purple-600"
              onClick={() => navigate('/role-assigner/requests?status=all')}
            />
          </div>
        </div>

        {/* Verified Roles Breakdown */}
        {stats.roleBreakdown && stats.roleBreakdown.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Requests by Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stats.roleBreakdown.map((roleData) => (
                <div key={roleData._id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-gray-600 capitalize">{roleData._id.replace('_', ' ')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{roleData.count}</p>
                  <p className="text-xs text-gray-500 mt-1">pending requests</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Requests Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
          </div>
          <div className="overflow-x-auto">
            {recentRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No recent requests</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentRequests.map((request) => {
                    const RoleIcon = getRoleIcon(request.requestedRole);
                    return (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{request.fullName}</div>
                            <div className="text-sm text-gray-500">{request.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <RoleIcon className="w-5 h-5 mr-2 text-gray-600" />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(request.requestedRole)}`}>
                              {request.requestedRole.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{request.organizationName}</td>
                        <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/role-assigner/requests/${request._id}`)}
                            className="text-orange-600 hover:text-orange-700 flex items-center gap-1"
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
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={() => navigate('/role-assigner/requests')}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              View all requests →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignerDashboard;
