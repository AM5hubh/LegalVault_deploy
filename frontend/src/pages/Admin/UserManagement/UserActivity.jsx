import React, { useState, useEffect } from 'react';
import { 
  Download,
  Filter,
  Search,
  Calendar,
  AlertTriangle,
  Activity,
  Clock,
  Globe,
  MapPin,
  FileText,
  User,
  Shield,
  CheckCircle,
  Ban,
  Unlock,
  Edit,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const UserActivity = ({ user, onExportActivity, onRefresh }) => {
  const [activityFilter, setActivityFilter] = useState('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityDateFilter, setActivityDateFilter] = useState('all');
  const [activityCategory, setActivityCategory] = useState('all');
  const [activitySeverity, setActivitySeverity] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentActivityPage, setCurrentActivityPage] = useState(1);
  const [activitiesPerPage] = useState(15);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  // Enhanced activity filtering function with better performance
  const getFilteredActivities = () => {
    if (!user?.activityLog || !Array.isArray(user.activityLog)) return [];

    let filtered = user.activityLog.filter(activity => {
      // Text search filter - case insensitive and more comprehensive
      if (activitySearch.trim()) {
        const searchLower = activitySearch.toLowerCase();
        const searchableText = [
          activity.action,
          activity.details,
          activity.ipAddress,
          activity.userAgent,
          activity.category,
          activity.severity
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      // Action filter
      if (activityFilter !== 'all' && activity.action !== activityFilter) {
        return false;
      }

      // Category filter
      if (activityCategory !== 'all' && activity.category !== activityCategory) {
        return false;
      }

      // Severity filter
      if (activitySeverity !== 'all' && activity.severity !== activitySeverity) {
        return false;
      }

      // Enhanced date filter
      if (activityDateFilter !== 'all') {
        const activityDate = new Date(activity.timestamp);
        const now = new Date();
        const diffMinutes = (now - activityDate) / (1000 * 60);
        
        switch (activityDateFilter) {
          case '5m':
            return diffMinutes <= 5;
          case '15m':
            return diffMinutes <= 15;
          case '1h':
            return diffMinutes <= 60;
          case '6h':
            return diffMinutes <= 360;
          case '24h':
            return diffMinutes <= 1440;
          case '7d':
            return diffMinutes <= 10080;
          case '30d':
            return diffMinutes <= 43200;
          case '90d':
            return diffMinutes <= 129600;
          default:
            return true;
        }
      }

      return true;
    });

    // Enhanced sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
          break;
        case 'action':
          aValue = a.action;
          bValue = b.action;
          break;
        case 'severity':
          const severityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
          aValue = severityOrder[a.severity] || 0;
          bValue = severityOrder[b.severity] || 0;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  // Get paginated activities with enhanced metadata
  const getPaginatedActivities = () => {
    const filtered = getFilteredActivities();
    const startIndex = (currentActivityPage - 1) * activitiesPerPage;
    const endIndex = startIndex + activitiesPerPage;
    
    return {
      activities: filtered.slice(startIndex, endIndex),
      totalPages: Math.ceil(filtered.length / activitiesPerPage),
      totalActivities: filtered.length,
      currentPage: currentActivityPage,
      hasNextPage: endIndex < filtered.length,
      hasPrevPage: startIndex > 0
    };
  };

  // Enhanced activity statistics
  const getActivityStats = () => {
    const activities = user?.activityLog || [];
    const now = new Date();
    const last24h = activities.filter(a => (now - new Date(a.timestamp)) / (1000 * 60 * 60) <= 24);
    const last7d = activities.filter(a => (now - new Date(a.timestamp)) / (1000 * 60 * 60 * 24) <= 7);
    
    const severityCounts = activities.reduce((acc, activity) => {
      acc[activity.severity || 'low'] = (acc[activity.severity || 'low'] || 0) + 1;
      return acc;
    }, {});

    const categoryCounts = activities.reduce((acc, activity) => {
      acc[activity.category || 'system'] = (acc[activity.category || 'system'] || 0) + 1;
      return acc;
    }, {});

    return {
      total: activities.length,
      last24h: last24h.length,
      last7d: last7d.length,
      loginCount: user?.loginCount || 0,
      uniqueIPs: user?.ipAddresses?.length || 0,
      severityCounts,
      categoryCounts,
      lastActivity: activities.length > 0 ? activities[0].timestamp : null
    };
  };

  // Enhanced activity icon with better mapping
  const getActivityIcon = (action, severity) => {
    const icons = {
      'login': Activity,
      'logout': Activity,
      'register': User,
      'role_updated': Shield,
      'account_banned': Ban,
      'account_unbanned': Unlock,
      'admin_note_added': FileText,
      'profile_updated': Edit,
      'password_changed': Shield,
      'kyc_updated': CheckCircle,
      'evidence_uploaded': Plus,
      'case_created': Plus,
      'case_updated': Edit,
      'case_deleted': AlertTriangle,
      'evidence_deleted': AlertTriangle,
      'view_user_details': Eye,
      'update_user_role': Shield,
      'update_user_status': CheckCircle,
      'ban_user': Ban,
      'add_admin_note': FileText,
      'security_alert': AlertTriangle,
      'system_error': AlertCircle,
      'default': Activity
    };

    const BaseIcon = icons[action] || icons.default;
    
    // Add severity indicator for high priority items
    if (severity === 'critical' || severity === 'high') {
      return ({ className }) => (
        <div className="relative">
          <BaseIcon className={className} />
          <AlertTriangle className="w-2 h-2 absolute -top-1 -right-1 text-red-600" />
        </div>
      );
    }
    
    return BaseIcon;
  };

  // Enhanced activity color coding
  const getActivityColor = (action, severity, category) => {
    // Priority: Severity > Category > Action
    const severityColors = {
      'critical': 'bg-red-100 text-red-700 border-red-200',
      'high': 'bg-orange-100 text-orange-700 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'low': 'bg-gray-100 text-gray-700 border-gray-200'
    };

    const categoryColors = {
      'security': 'bg-red-50 text-red-600 border-red-100',
      'authentication': 'bg-green-50 text-green-600 border-green-100',
      'admin': 'bg-purple-50 text-purple-600 border-purple-100',
      'profile': 'bg-indigo-50 text-indigo-600 border-indigo-100',
      'system': 'bg-gray-50 text-gray-600 border-gray-100'
    };

    const actionColors = {
      'login': 'bg-green-50 text-green-600 border-green-100',
      'logout': 'bg-gray-50 text-gray-600 border-gray-100',
      'register': 'bg-blue-50 text-blue-600 border-blue-100',
      'account_banned': 'bg-red-50 text-red-600 border-red-100',
      'account_unbanned': 'bg-green-50 text-green-600 border-green-100',
      'default': 'bg-gray-50 text-gray-600 border-gray-100'
    };

    // Severity takes highest priority
    if (severity && severityColors[severity]) {
      return `${severityColors[severity]} border`;
    }

    // Then category
    if (category && categoryColors[category]) {
      return `${categoryColors[category]} border`;
    }

    // Finally action
    return `${actionColors[action] || actionColors.default} border`;
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
      'security_alert': 'Security Alert',
      'system_error': 'System Error'
    };
    
    return actionNames[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get relative time with better formatting
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffSeconds = Math.floor((now - activityTime) / 1000);
    
    if (diffSeconds < 10) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    
    return activityTime.toLocaleDateString();
  };

  const stats = getActivityStats();
  const { activities, totalPages, totalActivities, hasNextPage, hasPrevPage } = getPaginatedActivities();

  return (
    <div className="p-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">User Activity Log</h3>
        <div className="flex space-x-2">
          
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              showAdvancedFilters ? 'bg-orange-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={onExportActivity}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
      
      {/* Enhanced Activity Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Last 24h</p>
              <p className="text-2xl font-bold text-blue-600">{stats.last24h}</p>
            </div>
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
        </div>


        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Total Activities</p>
              <p className="text-2xl font-bold text-orange-600">{stats.total}</p>
            </div>
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">High Priority</p>
              <p className="text-2xl font-bold text-red-600">
                {(stats.severityCounts.high || 0) + (stats.severityCounts.critical || 0)}
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Last 7 days</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.last7d}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border">
          <h4 className="text-md font-medium text-gray-900 mb-4">Advanced Filters & Search</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Activities</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search actions, details, IP addresses..."
                  value={activitySearch}
                  onChange={(e) => {
                    setActivitySearch(e.target.value);
                    setCurrentActivityPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
              <select
                value={activityFilter}
                onChange={(e) => {
                  setActivityFilter(e.target.value);
                  setCurrentActivityPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="register">Registration</option>
                <option value="profile_updated">Profile Updated</option>
                <option value="password_changed">Password Changed</option>
                <option value="role_updated">Role Updated</option>
                <option value="kyc_updated">KYC Updated</option>
                <option value="account_banned">Account Banned</option>
                <option value="account_unbanned">Account Unbanned</option>
                <option value="admin_note_added">Admin Note Added</option>
                <option value="evidence_uploaded">Evidence Uploaded</option>
                <option value="case_created">Case Created</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={activityDateFilter}
                onChange={(e) => {
                  setActivityDateFilter(e.target.value);
                  setCurrentActivityPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Time</option>
                <option value="5m">Last 5 Minutes</option>
                <option value="15m">Last 15 Minutes</option>
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={activityCategory}
                onChange={(e) => {
                  setActivityCategory(e.target.value);
                  setCurrentActivityPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Categories</option>
                <option value="authentication">Authentication</option>
                <option value="profile">Profile</option>
                <option value="admin">Administrative</option>
                <option value="system">System</option>
                <option value="security">Security</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
              <select
                value={activitySeverity}
                onChange={(e) => {
                  setActivitySeverity(e.target.value);
                  setCurrentActivityPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Sort and Clear Options */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="timestamp">Time</option>
                  <option value="action">Action</option>
                  <option value="severity">Severity</option>
                  <option value="category">Category</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={() => {
                setActivitySearch('');
                setActivityFilter('all');
                setActivityDateFilter('all');
                setActivityCategory('all');
                setActivitySeverity('all');
                setSortBy('timestamp');
                setSortOrder('desc');
                setCurrentActivityPage(1);
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Activity List Header */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium text-gray-900">
          Activity Log ({totalActivities} {totalActivities === 1 ? 'entry' : 'entries'})
        </h4>
        <div className="text-sm text-gray-500">
          Page {currentActivityPage} of {totalPages}
        </div>
      </div>
      
      {/* Activity List */}
      {activities.length > 0 ? (
        <>
          <div className="space-y-3 mb-6">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.action, activity.severity);
              const colorClasses = getActivityColor(activity.action, activity.severity, activity.category);
              
              return (
                <div 
                  key={`${activity.timestamp}-${index}`} 
                  className={`rounded-lg p-4 hover:shadow-sm transition-all duration-200 ${colorClasses}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Action Header with Badges */}
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="text-sm font-semibold text-gray-900">
                              {formatActionName(activity.action)}
                            </h5>
                            
                            {activity.category && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                {activity.category}
                              </span>
                            )}
                            
                            {activity.severity && activity.severity !== 'low' && (
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                activity.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                activity.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {activity.severity.toUpperCase()}
                              </span>
                            )}
                          </div>
                          
                          {/* Activity Details */}
                          {activity.details && (
                            <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                              {activity.details}
                            </p>
                          )}
                          
                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span className="font-mono">{activity.ipAddress || 'Unknown IP'}</span>
                            </div>
                            
                            {activity.userAgent && activity.userAgent !== 'Unknown' && activity.userAgent !== 'System' && (
                              <div className="flex items-center max-w-xs">
                                <Globe className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate" title={activity.userAgent}>
                                  {activity.userAgent.length > 50 ? 
                                    activity.userAgent.substring(0, 50) + '...' : 
                                    activity.userAgent
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Timestamp */}
                        <div className="flex flex-col items-end text-right ml-4">
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            {getRelativeTime(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-700">
                Showing {((currentActivityPage - 1) * activitiesPerPage) + 1} to {
                  Math.min(currentActivityPage * activitiesPerPage, totalActivities)
                } of {totalActivities} entries
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentActivityPage(1)}
                  disabled={currentActivityPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  First
                </button>
                
                <button
                  onClick={() => setCurrentActivityPage(prev => Math.max(prev - 1, 1))}
                  disabled={!hasPrevPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentActivityPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentActivityPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentActivityPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentActivityPage(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          currentActivityPage === pageNum
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentActivityPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={!hasNextPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50 flex items-center"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
                
                <button
                  onClick={() => setCurrentActivityPage(totalPages)}
                  disabled={currentActivityPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h5 className="text-lg font-medium text-gray-900 mb-2">No activities found</h5>
          <p className="text-gray-600">
            {totalActivities === 0 
              ? "This user hasn't performed any activities yet." 
              : "No activities match your current filter criteria."
            }
          </p>
          {totalActivities > 0 && (
            <button
              onClick={() => {
                setActivitySearch('');
                setActivityFilter('all');
                setActivityDateFilter('all');
                setActivityCategory('all');
                setActivitySeverity('all');
                setCurrentActivityPage(1);
              }}
              className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* IP Address History Section */}
      {user?.ipAddresses && user.ipAddresses.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            IP Address History ({user.ipAddresses.length} unique addresses)
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {user.ipAddresses.map((ip, index) => (
                <div key={`${ip}-${index}`} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2 text-gray-400" />
                    <span className="font-mono text-gray-700">{ip}</span>
                  </div>
                  {index === 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Most Recent
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivity;