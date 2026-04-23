import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit, 
  Ban, 
  Unlock,
  Plus,
  FileText,
  Activity,
  MapPin,
  Globe,
  Eye,
  EyeOff,
  Trash2,
  Save,
  X,
  RefreshCw
} from 'lucide-react';

// Import the separate UserActivity component
import UserActivity from './UserActivity';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showBanModal, setShowBanModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Network error while fetching user details');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!banReason.trim()) {
      setError('Please provide a reason for banning/unbanning the user');
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          banned: !user.banned,
          reason: banReason
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setShowBanModal(false);
        setBanReason('');
        setError('');
        // Show success message
        const action = !user.banned ? 'banned' : 'unbanned';
        alert(`User ${action} successfully!`);
        // Refresh user details to get updated activity log
        setTimeout(fetchUserDetails, 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update ban status');
      }
    } catch (error) {
      console.error('Error updating ban status:', error);
      setError('Network error while updating ban status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      setError('Please enter a note');
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          note: newNote
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setShowNoteModal(false);
        setNewNote('');
        setError('');
        alert('Admin note added successfully!');
        // Refresh user details to get updated activity log
        setTimeout(fetchUserDetails, 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add admin note');
      }
    } catch (error) {
      console.error('Error adding admin note:', error);
      setError('Network error while adding admin note');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}/activity/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${user?.email}_activity_log_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to export activity log');
      }
    } catch (error) {
      console.error('Error exporting activity:', error);
      setError('Network error while exporting activity log');
    }
  };

  const handleRefreshUserData = () => {
    fetchUserDetails();
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'admin': 'Administrator',
      'police': 'Police Officer',
      'lawyer': 'Legal Counsel',
      'judge': 'Judge',
      'forensic_expert': 'Forensic Expert',
      'user': 'User'
    };
    return roleMap[role] || role;
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${statusStyles[status]}`}>
        {status === 'verified' ? (
          <CheckCircle className="w-3 h-3" />
        ) : status === 'rejected' ? (
          <XCircle className="w-3 h-3" />
        ) : null}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  const getBanBadge = (banned) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
        {banned ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
        <span>{banned ? 'Banned' : 'Active'}</span>
      </span>
    );
  };

  // Format action name for better readability
  const formatActionName = (action) => {
    const actionNames = {
      'login': 'User Login',
      'logout': 'User Logout',
      'register': 'Account Registration',
      'role_updated': 'Role Changed',
      'account_banned': 'Account Banned',
      'account_unbanned': 'Account Restored',
      'admin_note_added': 'Admin Note Added',
      'profile_updated': 'Profile Modified',
      'password_changed': 'Password Updated',
      'kyc_updated': 'KYC Status Changed',
      'evidence_uploaded': 'Evidence Uploaded',
      'case_created': 'Case Created',
      'case_updated': 'Case Modified',
      'case_deleted': 'Case Deleted',
      'evidence_deleted': 'Evidence Removed',
      'view_user_details': 'User Profile Viewed',
      'update_user_role': 'User Role Updated',
      'update_user_status': 'User Status Updated',
      'ban_user': 'User Ban Action',
      'add_admin_note': 'Admin Note Created',
      'export_activity_log': 'Activity Log Exported'
    };
    
    return actionNames[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-2 text-gray-600">Loading user details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-x-3">
                <button 
                  onClick={fetchUserDetails}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => navigate('/admin/users-management')}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                >
                  Back to Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'notes', label: 'Admin Notes', icon: FileText },
    { id: 'activity', label: 'Activity Log', icon: Activity }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/users-management')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
              <p className="text-gray-600 mt-2">{user?.email}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefreshUserData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowNoteModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Note</span>
            </button>
            <button
              onClick={() => setShowBanModal(true)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                user?.banned 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {user?.banned ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
              <span>{user?.banned ? 'Unban User' : 'Ban User'}</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - User Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email[0].toUpperCase()}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{user?.fullName || 'Name not provided'}</h3>
                <p className="text-gray-600 mb-2">{getRoleDisplayName(user?.role)}</p>
                <div className="space-y-2">
                  {getStatusBadge(user?.kycStatus)}
                  {getBanBadge(user?.banned)}
                </div>
              </div>
              
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-mono text-xs">{user?._id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Joined:</span>
                  <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Login:</span>
                  <span className="text-xs">
                    {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Login Count:</span>
                  <span className="font-semibold">{user?.loginCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Unique IPs:</span>
                  <span>{user?.ipAddresses?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Activities:</span>
                  <span>{user?.activityLog?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {tab.label}
                      {tab.id === 'activity' && user?.activityLog?.length > 0 && (
                        <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                          {user.activityLog.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-900">{user?.fullName || 'Not provided'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-900">{user?.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-900">{user?.phone || 'Not provided'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Agency/Organization</label>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-900">{user?.agency || 'Not specified'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-900">{user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <span className="text-gray-900">
                        {user?.gender === 'M' ? 'Male' : user?.gender === 'F' ? 'Female' : user?.gender === 'O' ? 'Other' : 'Not provided'}
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                        <div>
                          {user?.address ? (
                            <>
                              <div>{user.address.line1}</div>
                              {user.address.line2 && <div>{user.address.line2}</div>}
                              <div>{user.address.city}, {user.address.state} - {user.address.pinCode}</div>
                            </>
                          ) : (
                            <span className="text-gray-900">Not provided</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KYC Information */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4">KYC Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status</label>
                        {getStatusBadge(user?.kycStatus)}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">KYC Verified At</label>
                        <span className="text-gray-900">
                          {user?.kycVerifiedAt ? new Date(user.kycVerifiedAt).toLocaleString() : 'Not verified'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">KYC Expiry</label>
                        <span className="text-gray-900">
                          {user?.kycExpiry ? new Date(user.kycExpiry).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                        {getBanBadge(user?.banned)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">User History</h3>
                  
                  {/* Role History */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Role Changes</h4>
                    {user?.roleHistory && user.roleHistory.length > 0 ? (
                      <div className="space-y-3">
                        {user.roleHistory.map((roleChange, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm">
                                  <span className="font-medium">Role changed from </span>
                                  <span className="text-red-600">{getRoleDisplayName(roleChange.oldRole)}</span>
                                  <span className="font-medium"> to </span>
                                  <span className="text-green-600">{getRoleDisplayName(roleChange.newRole)}</span>
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Updated by: {roleChange.updatedBy?.fullName || roleChange.updatedBy?.email || 'Unknown'}
                                </p>
                                {roleChange.reason && (
                                  <p className="text-xs text-gray-600 mt-1">Reason: {roleChange.reason}</p>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(roleChange.updatedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No role changes recorded</p>
                    )}
                  </div>

                  {/* Status History */}
                  <div className="mb-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Status Changes</h4>
                    {user?.statusHistory && user.statusHistory.length > 0 ? (
                      <div className="space-y-3">
                        {user.statusHistory.map((statusChange, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm">
                                  <span className="font-medium">Status changed from </span>
                                  <span className="text-red-600">{statusChange.oldStatus}</span>
                                  <span className="font-medium"> to </span>
                                  <span className="text-green-600">{statusChange.newStatus}</span>
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Updated by: {statusChange.updatedBy?.fullName || statusChange.updatedBy?.email || 'Unknown'}
                                </p>
                                {statusChange.reason && (
                                  <p className="text-xs text-gray-600 mt-1">Reason: {statusChange.reason}</p>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(statusChange.updatedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No status changes recorded</p>
                    )}
                  </div>

                  {/* Ban History */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Ban History</h4>
                    {user?.banHistory && user.banHistory.length > 0 ? (
                      <div className="space-y-3">
                        {user.banHistory.map((banChange, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm">
                                  <span className="font-medium">User </span>
                                  <span className={banChange.newStatus ? 'text-red-600' : 'text-green-600'}>
                                    {banChange.newStatus ? 'banned' : 'unbanned'}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Updated by: {banChange.updatedBy?.fullName || banChange.updatedBy?.email || 'Unknown'}
                                </p>
                                {banChange.reason && (
                                  <p className="text-xs text-gray-600 mt-1">Reason: {banChange.reason}</p>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(banChange.updatedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No ban history recorded</p>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes Tab */}
              {activeTab === 'notes' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Admin Notes</h3>
                    <button
                      onClick={() => setShowNoteModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Note</span>
                    </button>
                  </div>
                  
                  {user?.adminNotes && user.adminNotes.length > 0 ? (
                    <div className="space-y-4">
                      {user.adminNotes.map((note, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-gray-600">
                              Added by: {note.addedBy?.fullName || note.addedBy?.email || 'Unknown Admin'}
                            </p>
                            <span className="text-xs text-gray-500">
                              {new Date(note.addedAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-900">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No admin notes available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Activity Tab - Using Separate Component */}
              {activeTab === 'activity' && (
                <UserActivity 
                  user={user}
                  onExportActivity={handleExportActivity}
                  onRefresh={handleRefreshUserData}
                />
              )}
            </div>
          </div>
        </div>

        {/* Ban/Unban Modal */}
        {showBanModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {user?.banned ? 'Unban User' : 'Ban User'}
                </h3>
                <button
                  onClick={() => setShowBanModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    {user?.banned 
                      ? 'Are you sure you want to unban this user? They will regain access to the system.'
                      : 'Are you sure you want to ban this user? They will lose access to the system.'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for {user?.banned ? 'unbanning' : 'banning'}
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter reason..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowBanModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBanUser}
                    disabled={updating || !banReason.trim()}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 flex items-center ${
                      user?.banned
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {user?.banned ? 'Unbanning...' : 'Banning...'}
                      </>
                    ) : (
                      <>
                        {user?.banned ? <Unlock className="w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                        {user?.banned ? 'Unban User' : 'Ban User'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Note Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Admin Note</h3>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter admin note..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowNoteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNote}
                    disabled={updating || !newNote.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Add Note
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
