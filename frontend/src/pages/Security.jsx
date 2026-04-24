import React, { useState } from 'react';
import { Shield, Key, AlertTriangle, Eye, EyeOff, Save } from 'lucide-react';

const Security = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // TODO: API call to change password
    console.log('Password change submitted');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account security and access</p>
        </div>

        <div className="space-y-8">
          {/* Password Change */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <Key className="w-6 h-6 text-orange-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </form>
          </div>

          {/* Security Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Security Status</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Account Verified</p>
                    <p className="text-sm text-green-600">Your account has been verified and is secure</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">✓</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <Key className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Strong Password</p>
                    <p className="text-sm text-green-600">Your password meets security requirements</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">✓</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-900">Two-Factor Authentication</p>
                    <p className="text-sm text-yellow-600">Consider enabling 2FA for additional security</p>
                  </div>
                </div>
                <button className="text-orange-600 hover:text-orange-700 font-medium">
                  Enable
                </button>
              </div>
            </div>
          </div>

          {/* Recent Security Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <AlertTriangle className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Recent Security Activity</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { action: 'Successful login', location: 'Delhi, India', time: '2 hours ago', status: 'success' },
                { action: 'Password changed', location: 'Delhi, India', time: '2 days ago', status: 'success' },
                { action: 'Login attempt', location: 'Mumbai, India', time: '1 week ago', status: 'blocked' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.location} • {activity.time}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    activity.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {activity.status === 'success' ? 'Success' : 'Blocked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;