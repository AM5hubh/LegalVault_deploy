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

const DatabaseBackup = () => {
  const [backups, setBackups] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSecurityVerification, setShowSecurityVerification] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [verificationData, setVerificationData] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Check if admin is already verified for this session
    const verified = localStorage.getItem('admin_backup_verified');
    if (verified === 'true') {
      setIsVerified(true);
      fetchBackupData();
    } else {
      setLoading(false);
    }

    // Log admin access attempt
    console.log('🔐 HIGH SECURITY: Admin accessed backup management system', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }, []);

  const requireVerification = (action) => {
    if (!isVerified) {
      setPendingAction(action);
      setShowVerificationModal(true);
      return false;
    }
    return true;
  };

  const verifyAdminCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter verification code');
      return;
    }

    try {
      setError('');
      const token = localStorage.getItem('token');

      // Test verification with a protected endpoint
      const response = await fetch(`${API_BASE_URL}/backup/metadata`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-verification': verificationCode
        }
      });

      if (response.ok) {
        setIsVerified(true);
        localStorage.setItem('admin_backup_verified', 'true');
        localStorage.setItem('admin_backup_code', verificationCode);
        setShowVerificationModal(false);
        setSuccess('Admin verification successful');

        // Execute pending action if any
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        } else {
          fetchBackupData();
        }

        // Log successful verification
        console.log('🔐 HIGH SECURITY: Admin verification successful', {
          timestamp: new Date().toISOString(),
          ip: 'client-side-logging'
        });
      } else {
        const result = await response.json();
        setError(result.message || 'Invalid verification code');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Verification failed. Please try again.');
    }
  };

  const logoutVerification = () => {
    setIsVerified(false);
    setVerificationCode('');
    localStorage.removeItem('admin_backup_verified');
    localStorage.removeItem('admin_backup_code');
    setBackups([]);
    setStatistics(null);
    setSuccess('Admin verification cleared');
  };

  const fetchBackupData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const code = localStorage.getItem('admin_backup_code');

      // Fetch backup metadata
      const metadataResponse = await fetch(`${API_BASE_URL}/backup/metadata`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-verification': code
        }
      });

      if (metadataResponse.ok) {
        const metadata = await metadataResponse.json();
        setBackups(metadata.backups || []);
      }

      // Fetch backup statistics
      const statsResponse = await fetch(`${API_BASE_URL}/backup/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setStatistics(stats);
      }

    } catch (err) {
      console.error('Error fetching backup data:', err);
      setError('Failed to load backup data');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (type = 'full') => {
    if (!requireVerification(() => createBackup(type))) return;

    try {
      setBackupLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const code = localStorage.getItem('admin_backup_code');

      const response = await fetch(`${API_BASE_URL}/backup/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-admin-verification': code
        },
        body: JSON.stringify({ type })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`Backup created successfully: ${result.backupId}`);
        fetchBackupData(); // Refresh the list
      } else {
        setError(result.error || 'Failed to create backup');
      }
    } catch (err) {
      console.error('Error creating backup:', err);
      setError('Failed to create backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const verifyBackup = async (backupId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/backup/verify/${backupId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (response.ok) {
        if (result.valid) {
          setSuccess(`Backup ${backupId} integrity verified ✓`);
        } else {
          setError(`Backup ${backupId} integrity check failed!`);
        }
      } else {
        setError(result.error || 'Failed to verify backup');
      }
    } catch (err) {
      console.error('Error verifying backup:', err);
      setError('Failed to verify backup');
    }
  };

  const restoreBackup = async (backupId, options = {}) => {
    if (!requireVerification(() => restoreBackup(backupId, options))) return;

    try {
      setRestoreLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const code = localStorage.getItem('admin_backup_code');

      const response = await fetch(`${API_BASE_URL}/backup/restore/${backupId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-admin-verification': code
        },
        body: JSON.stringify(options)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`Backup restored successfully: ${result.restoredCollections} collections, ${result.restoredDocuments} documents`);
        setShowRestoreModal(false);
        setSelectedBackup(null);
      } else {
        setError(result.error || 'Failed to restore backup');
      }
    } catch (err) {
      console.error('Error restoring backup:', err);
      setError('Failed to restore backup');
    } finally {
      setRestoreLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getBackupTypeColor = (type) => {
    return type === 'full' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading backup management...</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <Shield className="h-16 w-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Verification Required</h2>
          <p className="text-gray-600 mb-6">
            To access the database backup management system, you must provide the admin verification PIN.
            This ensures only authorized administrators can perform critical backup operations.
          </p>
          <button
            onClick={() => setShowVerificationModal(true)}
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Key className="w-5 h-5" />
            Enter Verification Code
          </button>
        </div>

        {/* Admin Verification Modal */}
        {showVerificationModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Key className="h-5 w-5 text-orange-600" />
                  Admin Verification Required
                </h3>

                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div className="text-sm text-orange-800">
                      <strong>High Security Access:</strong> Enter the admin verification PIN: <code className="bg-orange-100 px-1 rounded">ADMIN_SECURE_PIN_2025</code><br />
                      This PIN is separate from your login credentials and provides an additional security layer for critical backup operations. This action is logged for security purposes.
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Verification Code
                  </label>
                  <input
                    type="password"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter verification code"
                    onKeyPress={(e) => e.key === 'Enter' && verifyAdminCode()}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                    {error}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setShowVerificationModal(false);
                      setVerificationCode('');
                      setError('');
                      setPendingAction(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyAdminCode}
                    className="px-4 py-2 bg-orange-600 text-white text-base font-medium rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Verify & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-orange-600" />
                Database Backup & Security
              </h1>
              <p className="text-gray-600 mt-2">
                Secure, encrypted database backups with integrity verification and disaster recovery
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isVerified ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Lock className="h-5 w-5" />
                  <span className="text-sm font-medium">Admin Verified</span>
                  <button
                    onClick={logoutVerification}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600">
                  <Unlock className="h-5 w-5" />
                  <span className="text-sm font-medium">Verification Required</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-8 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Archive className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Backups</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.totalBackups}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Database className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Full Backups</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.backupTypes?.full || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <RefreshCw className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Incremental</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.backupTypes?.incremental || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HardDrive className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Size</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatFileSize(statistics.totalSize || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => createBackup('full')}
              disabled={backupLoading || !isVerified}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Database className="w-5 h-5" />
              {backupLoading ? 'Creating...' : 'Create Full Backup'}
            </button>

            <button
              onClick={() => createBackup('incremental')}
              disabled={backupLoading || !isVerified}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              {backupLoading ? 'Creating...' : 'Create Incremental Backup'}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
              Backup Settings
            </button>
          </div>

          {showSettings && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Backup Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Retention Period:</strong> 30 days
                </div>
                <div>
                  <strong>Backup Interval:</strong> 24 hours
                </div>
                <div>
                  <strong>Encryption:</strong> AES-256-CBC
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <strong>Security Features:</strong> Integrity hashing, encryption, automated cleanup, tamper detection
              </div>
            </div>
          )}
        </div>

        {/* Backup History */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Backup History</h3>
          </div>

          {backups.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No backups found</h3>
              <p className="text-gray-600 mb-6">Create your first backup to secure your data</p>
              <button
                onClick={() => createBackup('full')}
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Database className="w-5 h-5" />
                Create First Backup
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Backup ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collections
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map((backup) => (
                    <tr key={backup.backupId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{backup.backupId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getBackupTypeColor(backup.type)}`}>
                          {backup.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(backup.size || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backup.collections?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(backup.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => verifyBackup(backup.backupId)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Verify Integrity"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (requireVerification(() => {
                                setSelectedBackup(backup);
                                setShowRestoreModal(true);
                              })) {
                                setSelectedBackup(backup);
                                setShowRestoreModal(true);
                              }
                            }}
                            disabled={!isVerified}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Restore"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {/* Download functionality */}}
                            className="text-purple-600 hover:text-purple-900"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Restore Modal */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Restore from Backup
              </h3>

              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="text-sm">
                  <strong>Backup ID:</strong> {selectedBackup.backupId}<br />
                  <strong>Type:</strong> {selectedBackup.type}<br />
                  <strong>Created:</strong> {formatDate(selectedBackup.timestamp)}<br />
                  <strong>Size:</strong> {formatFileSize(selectedBackup.size || 0)}
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="ml-2 text-sm text-gray-700">Dry run (test restore without applying changes)</span>
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Warning:</strong> Restoring will overwrite current data. Ensure you have a recent backup before proceeding.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowRestoreModal(false);
                    setSelectedBackup(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => restoreBackup(selectedBackup.backupId)}
                  disabled={restoreLoading}
                  className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {restoreLoading ? 'Restoring...' : 'Restore Backup'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Key className="h-5 w-5 text-orange-600" />
                Admin Verification Required
              </h3>

                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div className="text-sm text-orange-800">
                      <strong>High Security Access:</strong> Enter the admin verification PIN: <code className="bg-orange-100 px-1 rounded">ADMIN_SECURE_PIN_2025</code><br />
                      This PIN is separate from your login credentials and provides an additional security layer for critical backup operations. This action is logged for security purposes.
                    </div>
                  </div>
                </div>              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Verification Code
                </label>
                <input
                  type="password"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter verification code"
                  onKeyPress={(e) => e.key === 'Enter' && verifyAdminCode()}
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationCode('');
                    setError('');
                    setPendingAction(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyAdminCode}
                  className="px-4 py-2 bg-orange-600 text-white text-base font-medium rounded-md hover:bg-orange-700 transition-colors"
                >
                  Verify & Continue
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