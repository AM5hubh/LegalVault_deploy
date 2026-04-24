import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  Shield,
  Clock,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  FileText,
  Lock,
  Unlock,
  Trash2,
  Eye,
  Archive,
  Key,
  AlertCircle
} from 'lucide-react';
import SecurityVerification from './SecurityVerification';

import SecurityLogs from './SecurityLogs';

const DatabaseBackup = () => {
  const [backups, setBackups] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showSecurityVerification, setShowSecurityVerification] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('logs'); // 'backups', 'logs', 'config'

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Check if admin is already verified for this session
    const verified = sessionStorage.getItem('admin_backup_verified');
    if (verified === 'true') {
      setIsVerified(true);
      fetchBackupData();
    } else {
      setLoading(false);
    }
  }, []);

  // Clear success/error messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchBackupData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [backupsResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/backup/list`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/backup/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (backupsResponse.ok) {
        const backupsData = await backupsResponse.json();
        setBackups(backupsData.backups || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData);
      }
    } catch {
      setError('Failed to load backup data');
    } finally {
      setLoading(false);
    }
  };

  const requireSecurityVerification = (action) => {
    setPendingAction(action);
    setShowSecurityVerification(true);
  };

  const handleSecurityVerificationSuccess = async (verificationDataReceived) => {
    setVerificationData(verificationDataReceived);
    setShowSecurityVerification(false);
    setIsVerified(true);
    sessionStorage.setItem('admin_backup_verified', 'true');

    // Execute the pending action
    if (pendingAction) {
      try {
        await executePendingAction(verificationDataReceived);
      } catch {
        setError('Failed to execute action after verification');
      }
      setPendingAction(null);
    } else {
      // If no pending action, just load the backup data
      fetchBackupData();
    }
  };

  const handleSecurityVerificationCancel = () => {
    setShowSecurityVerification(false);
    setPendingAction(null);
  };

  const executePendingAction = async (verificationDataReceived) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    switch (pendingAction.type) {
      case 'CREATE_BACKUP':
        await executeCreateBackup(headers, verificationDataReceived);
        break;
      case 'RESTORE_BACKUP':
        await executeRestoreBackup(headers, verificationDataReceived);
        break;
      case 'DELETE_BACKUP':
        await executeDeleteBackup(headers, verificationDataReceived);
        break;
      default:
        break;
    }
  };

  const executeCreateBackup = async (headers, verificationDataReceived) => {
    setBackupLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/backup/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          verificationCode: verificationDataReceived.adminPin,
          securityQuestions: verificationDataReceived.securityAnswers
        })
      });

      if (response.ok) {
        setSuccess('Backup created successfully');
        fetchBackupData();
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to create backup');
      }
    } finally {
      setBackupLoading(false);
    }
  };

  const executeRestoreBackup = async (headers, verificationDataReceived) => {
    setRestoreLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/backup/restore/${pendingAction.backupId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          verificationCode: verificationDataReceived.adminPin,
          securityQuestions: verificationDataReceived.securityAnswers
        })
      });

      if (response.ok) {
        setSuccess('Database restored successfully');
        setShowRestoreModal(false);
        fetchBackupData();
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to restore backup');
      }
    } finally {
      setRestoreLoading(false);
    }
  };

  const executeDeleteBackup = async (headers, verificationDataReceived) => {
    try {
      const response = await fetch(`${API_BASE_URL}/backup/${pendingAction.backupId}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          verificationCode: verificationDataReceived.adminPin,
          securityQuestions: verificationDataReceived.securityAnswers
        })
      });

      if (response.ok) {
        setSuccess('Backup deleted successfully');
        fetchBackupData();
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to delete backup');
      }
    } catch {
      setError('Failed to delete backup');
    }
  };

  const handleCreateBackup = () => {
    if (!isVerified) {
      requireSecurityVerification({ type: 'CREATE_BACKUP' });
      return;
    }
    
    executeCreateBackup({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }, verificationData);
  };

  const handleRestoreBackup = (backupId) => {
    if (!isVerified) {
      requireSecurityVerification({ type: 'RESTORE_BACKUP', backupId });
      return;
    }

    setSelectedBackup(backupId);
    setShowRestoreModal(true);
  };

  const confirmRestore = () => {
    if (!selectedBackup) return;
    
    executeRestoreBackup({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }, verificationData);
  };

  const handleDeleteBackup = (backupId) => {
    if (!isVerified) {
      requireSecurityVerification({ type: 'DELETE_BACKUP', backupId });
      return;
    }

    if (window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      executeDeleteBackup({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }, verificationData);
    }
  };

  const clearVerification = () => {
    setIsVerified(false);
    setVerificationData(null);
    sessionStorage.removeItem('admin_backup_verified');
    setSuccess('Admin verification cleared');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // If not verified and not loading, show access request
  if (!isVerified && !loading && !showSecurityVerification) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Database Backup Management</h1>
                <p className="text-red-100 mt-1">Secure backup operations and data management</p>
              </div>
            </div>
          </div>

          <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <Lock className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Security Verification Required
              </h2>
              <p className="text-gray-600 mb-4">
                Access to database backup operations requires multi-factor admin verification.
                This includes PIN verification and security question validation.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <strong>Security Notice:</strong> All backup operations are logged with immutable audit trails for compliance purposes.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => requireSecurityVerification(null)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Shield className="h-5 w-5" />
              <span>Request Access</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Security Verification Modal */}
      {showSecurityVerification && (
        <SecurityVerification
          onVerificationSuccess={handleSecurityVerificationSuccess}
          onCancel={handleSecurityVerificationCancel}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Database Backup Management</h1>
                <p className="text-blue-100 mt-1">Secure backup operations and data management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isVerified && (
                <div className="flex items-center space-x-2 bg-green-500 bg-opacity-20 px-3 py-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-100" />
                  <span className="text-sm text-green-100">Verified Admin</span>
                </div>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-blue-100 hover:text-white hover:bg-blue-600 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        {showSettings && (
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('backups')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'backups'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Backup Management
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'logs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Security Logs
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'config'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Configuration
              </button>
            </nav>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'logs' && showSettings && (
          <div className="p-6">
            <SecurityLogs />
          </div>
        )}

        {activeTab === 'config' && showSettings && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Backup Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Retention Period (Days)</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Backup Interval (Hours)</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="24"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show backup content when not in settings mode or when backups tab is active */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreateBackup}
              disabled={backupLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {backupLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              <span>{backupLoading ? 'Creating...' : 'Create Backup'}</span>
            </button>

            <button
              onClick={fetchBackupData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {isVerified && (
              <button
                onClick={clearVerification}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Unlock className="h-4 w-4" />
                <span>Clear Verification</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {(success || error) && (
          <div className="p-4 border-b border-gray-200">
            {success && (
              <div className="flex items-center space-x-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}
            {error && (
              <div className="flex items-center space-x-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Backups</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalBackups || 0}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Backup</p>
                <p className="text-lg font-semibold text-gray-900">
                  {statistics.lastBackup ? formatDate(statistics.lastBackup) : 'Never'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage Type</p>
                <p className="text-lg font-semibold text-gray-900">{statistics.storageType || 'MongoDB'}</p>
              </div>
              <HardDrive className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Service Status</p>
                <p className="text-lg font-semibold text-green-600">
                  {statistics.serviceActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Backups List */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Backup History</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading backup data...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="p-8 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No backups found</p>
            <button
              onClick={handleCreateBackup}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Archive className="h-4 w-4" />
              <span>Create First Backup</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Backup ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {backup._id.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(backup.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(backup.metadata?.originalSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {backup.metadata?.type || 'Full'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        backup.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : backup.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleRestoreBackup(backup._id)}
                        disabled={restoreLoading}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Add download functionality if needed
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-medium text-gray-900">Confirm Restore</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to restore this backup? This will replace all current data 
                and cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRestore}
                  disabled={restoreLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {restoreLoading ? 'Restoring...' : 'Restore'}
                </button>
              </div>
            </div>
          </div>
      </div>
      )}
    </div>  
  );
};

export default DatabaseBackup;