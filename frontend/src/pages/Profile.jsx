import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Edit2, 
  Save, 
  X, 
  Shield, 
  MapPin, 
  Globe,
  Award,
  Lock,
  Key,
  Activity,
  FileText,
  Clock,
  Settings,
  Camera,
  Upload,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Briefcase,
  GraduationCap,
  Star,
  Bell
} from 'lucide-react';
import KYCModal from '../components/KYCModal';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    agency: '',
    role: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    designation: '',
    department: '',
    experience: '',
    qualification: '',
    specialization: '',
    languages: '',
    bio: '',
    website: '',
    linkedin: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    caseUpdates: true,
    systemAlerts: true,
    securityAlerts: true
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch user profile data from API
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token found');
        return;
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched user profile:', data);
        setUser(data.user || data);
        localStorage.setItem('user', JSON.stringify(data.user || data));
      } else if (response.status === 401) {
        console.log('Auth token expired');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        fullName: parsedUser.fullName || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        agency: parsedUser.agency || '',
        role: parsedUser.role || '',
        address: parsedUser.address || '',
        city: parsedUser.city || '',
        state: parsedUser.state || '',
        pincode: parsedUser.pincode || '',
        country: parsedUser.country || 'India',
        designation: parsedUser.designation || '',
        department: parsedUser.department || '',
        experience: parsedUser.experience || '',
        qualification: parsedUser.qualification || '',
        specialization: parsedUser.specialization || '',
        languages: parsedUser.languages || '',
        bio: parsedUser.bio || '',
        website: parsedUser.website || '',
        linkedin: parsedUser.linkedin || '',
        emergencyContact: parsedUser.emergencyContact || '',
        emergencyPhone: parsedUser.emergencyPhone || ''
      });
      setNotifications({
        emailNotifications: parsedUser.emailNotifications ?? true,
        smsNotifications: parsedUser.smsNotifications ?? false,
        caseUpdates: parsedUser.caseUpdates ?? true,
        systemAlerts: parsedUser.systemAlerts ?? true,
        securityAlerts: parsedUser.securityAlerts ?? true
      });
    }
    
    // Also fetch latest profile from API to get updated KYC data
    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, ...formData, ...notifications };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
      alert('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKycSuccess = (kycData) => {
    // Update local state with KYC data immediately
    const updatedUser = { ...user, ...kycData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setKycModalOpen(false);

    // Then fetch the latest user profile from API to ensure all data is synced
    setTimeout(() => {
      fetchUserProfile();
    }, 1000);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      agency: user?.agency || '',
      role: user?.role || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
      country: user?.country || 'India',
      designation: user?.designation || '',
      department: user?.department || '',
      experience: user?.experience || '',
      qualification: user?.qualification || '',
      specialization: user?.specialization || '',
      languages: user?.languages || '',
      bio: user?.bio || '',
      website: user?.website || '',
      linkedin: user?.linkedin || '',
      emergencyContact: user?.emergencyContact || '',
      emergencyPhone: user?.emergencyPhone || ''
    });
    setIsEditing(false);
  };

  const formatAddress = (addressData) => {
    if (!addressData) return 'Not provided';
    
    // If address is a string, return it directly
    if (typeof addressData === 'string') {
      return addressData;
    }
    
    // If address is an object (from KYC data), extract fullAddress or construct it
    if (typeof addressData === 'object') {
      // Check for fullAddress field from KYC
      if (addressData.fullAddress) {
        return addressData.fullAddress;
      }
      
      // Check for address.fullAddress nested structure
      if (addressData.full_address) {
        return addressData.full_address;
      }
      
      // Construct from individual fields
      const parts = [];
      if (addressData.house) parts.push(addressData.house);
      if (addressData.street) parts.push(addressData.street);
      if (addressData.line1) parts.push(addressData.line1);
      if (addressData.line2) parts.push(addressData.line2);
      if (addressData.city || addressData.district) parts.push(addressData.city || addressData.district);
      if (addressData.state) parts.push(addressData.state);
      if (addressData.pincode || addressData.pinCode) parts.push(addressData.pincode || addressData.pinCode);
      
      return parts.length > 0 ? parts.join(', ') : 'Not provided';
    }
    
    return 'Not provided';
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

  const getProfileCompleteness = () => {
    const fields = [
      formData.fullName, formData.phone, formData.agency, formData.address,
      formData.city, formData.state, formData.designation, formData.qualification
    ];
    const completed = fields.filter(field => {
      // Check if field exists and is not empty after conversion to string and trimming
      if (field === null || field === undefined) return false;
      const fieldStr = String(field).trim();
      return fieldStr !== '' && fieldStr !== '0';
    }).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'kyc', label: 'KYC & Aadhaar', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
            </div>
            {activeTab === 'personal' && !isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : activeTab === 'personal' && isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Profile Card */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </div>
                    <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{user.fullName || user.email}</h3>
                  <p className="text-gray-600">{getRoleDisplayName(user.role)}</p>
                  <span className="inline-block mt-2 px-3 py-1 text-sm font-medium text-orange-700 bg-orange-100 rounded-full">
                    Active
                  </span>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Joined {new Date().getFullYear()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 mr-2" />
                    <span>Verified Account</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2" />
                    <span>Profile {getProfileCompleteness()}% Complete</span>
                  </div>
                </div>

                {/* Profile Completeness */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Profile Completeness</span>
                    <span>{getProfileCompleteness()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProfileCompleteness()}%` }}
                    ></div>
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
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-gray-900">{user.fullName || 'Not provided'}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-900">{user.email}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        ) : (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        {isEditing ? (
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter your address"
                          />
                        ) : (
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                            <span className="text-gray-900">{formatAddress(user.address)}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter your city"
                          />
                        ) : (
                          <span className="text-gray-900">{user.city || 'Not provided'}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter your state"
                          />
                        ) : (
                          <span className="text-gray-900">{user.state || 'Not provided'}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PIN Code
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter PIN code"
                          />
                        ) : (
                          <span className="text-gray-900">{user.pincode || 'Not provided'}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        {isEditing ? (
                          <select
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="India">India</option>
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                            <option value="Canada">Canada</option>
                          </select>
                        ) : (
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-gray-900">{user.country || 'India'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Emergency Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="emergencyContact"
                              value={formData.emergencyContact}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Emergency contact name"
                            />
                          ) : (
                            <span className="text-gray-900">{user.emergencyContact || 'Not provided'}</span>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Phone
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              name="emergencyPhone"
                              value={formData.emergencyPhone}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Emergency contact phone"
                            />
                          ) : (
                            <span className="text-gray-900">{user.emergencyPhone || 'Not provided'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Professional Information Tab */}
                {activeTab === 'professional' && (
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Professional Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agency/Organization
                        </label>
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-900">{user.agency || 'Not provided'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-900">{getRoleDisplayName(user.role)}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Role cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Designation
                        </label>
                        <span className="text-gray-900">{user.designation || 'Not provided'}</span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <span className="text-gray-900">{user.department || 'Not provided'}</span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Experience
                        </label>
                        <span className="text-gray-900">{user.experience || 'Not provided'}</span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Qualification
                        </label>
                        <div className="flex items-center">
                          <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-900">{user.qualification || 'Not provided'}</span>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specialization
                        </label>
                        <span className="text-gray-900">{user.specialization || 'Not provided'}</span>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Languages Known
                        </label>
                        <span className="text-gray-900">{user.languages || 'Not provided'}</span>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Professional Bio
                        </label>
                        <p className="text-gray-900">{user.bio || 'Not provided'}</p>
                      </div>
                    </div>

                    {/* Professional Links */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Professional Links</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website
                          </label>
                          <span className="text-gray-900">{user.website || 'Not provided'}</span>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            LinkedIn
                          </label>
                          <span className="text-gray-900">{user.linkedin || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* KYC & Aadhaar Tab */}
                {activeTab === 'kyc' && (
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">KYC & Aadhaar Verification</h3>
                    
                    {/* KYC Status Card */}
                    <div className={`rounded-lg p-6 mb-6 ${
                      user.kycStatus === 'verified' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {user.kycStatus === 'verified' ? (
                            <Check className="w-6 h-6 text-green-600" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                          )}
                          <div>
                            <h4 className="text-lg font-semibold">
                              {user.kycStatus === 'verified' ? 'KYC Verified' : 'KYC Pending'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {user.kycStatus === 'verified' 
                                ? `Verified on 24/04/2026` 
                                : 'Please complete your KYC verification'}
                            </p>
                          </div>
                        </div>
                        {user.kycStatus === 'verified' && user.kycExpiry && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Expires on</p>
                            <p className="text-sm font-medium">
                              {new Date(user.kycExpiry).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {user.kycStatus === 'verified' && user.kycData ? (
                      <div className="space-y-6">
                        {/* Photo and Basic Info */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h4 className="text-md font-medium text-gray-900 mb-4">Aadhaar Information</h4>
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Aadhaar Photo */}
                            {user.kycData.photo && (
                              <div className="flex-shrink-0">
                                <img 
                                  src={`data:image/jpeg;base64,${user.kycData.photo}`}
                                  alt="Aadhaar Photo"
                                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                  Photo from Aadhaar
                                </p>
                              </div>
                            )}

                            {/* Personal Details */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Full Name
                                </label>
                                <p className="text-gray-900 font-medium">{user.fullName}</p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Date of Birth
                                </label>
                                <p className="text-gray-900">
                                  {user.dob ? new Date(user.dob).toLocaleDateString('en-IN') : 'Not provided'}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Gender
                                </label>
                                <p className="text-gray-900">
                                  {user.gender === 'M' ? 'Male' : user.gender === 'F' ? 'Female' : user.gender || 'Not provided'}
                                </p>
                              </div>

                              {user.kycData.yearOfBirth && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Year of Birth
                                  </label>
                                  <p className="text-gray-900">{user.kycData.yearOfBirth}</p>
                                </div>
                              )}

                              {user.kycData.careOf && (
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Care Of
                                  </label>
                                  <p className="text-gray-900">{user.kycData.careOf}</p>
                                </div>
                              )}

                              {user.kycData.aadhaarLastFour && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Aadhaar (Last 4 Digits)
                                  </label>
                                  <p className="text-gray-900 font-mono">XXXX XXXX {user.kycData.aadhaarLastFour}</p>
                                </div>
                              )}

                              {user.kycData.registrar && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Registrar
                                  </label>
                                  <p className="text-gray-900">{user.kycData.registrar}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Aadhaar Metadata */}
                        {(user.kycData?.issueDate || user.kycData?.expiryDate || user.kycData?.status || user.kycData?.aadhaarLastFour || user.kycData?.registrar) && (
                          <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h4 className="text-md font-medium text-gray-900 mb-4">Aadhaar Metadata</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {user.kycData?.aadhaarLastFour && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Aadhaar (Last 4 Digits)
                                  </label>
                                  <p className="text-gray-900 font-mono">XXXX XXXX {user.kycData.aadhaarLastFour}</p>
                                </div>
                              )}

                              {user.kycData?.registrar && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Registrar
                                  </label>
                                  <p className="text-gray-900">{user.kycData.registrar}</p>
                                </div>
                              )}

                              {user.kycData?.issueDate && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Issue Date
                                  </label>
                                  <p className="text-gray-900">
                                    {new Date(user.kycData.issueDate).toLocaleDateString('en-IN')}
                                  </p>
                                </div>
                              )}

                              {user.kycData?.expiryDate && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expiry Date
                                  </label>
                                  <p className="text-gray-900">
                                    {new Date(user.kycData.expiryDate).toLocaleDateString('en-IN')}
                                  </p>
                                </div>
                              )}

                              {user.kycData?.status && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Verification Status
                                  </label>
                                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                                    user.kycData.status === 'VALID' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {user.kycData.status}
                                  </span>
                                </div>
                              )}

                              {user.kycData?.shareCode && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Share Code
                                  </label>
                                  <p className="text-gray-900 font-mono text-sm">{user.kycData.shareCode}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Address Information */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                            Address Details
                          </h4>
                          <div className="space-y-3">
                            {user.address?.fullAddress && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900">{user.address.fullAddress}</p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {user.address?.line1 && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    House/Building
                                  </label>
                                  <p className="text-gray-900">{user.address.line1}</p>
                                </div>
                              )}

                              {user.address?.line2 && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Street
                                  </label>
                                  <p className="text-gray-900">{user.address.line2}</p>
                                </div>
                              )}

                              {user.address?.city && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City/District
                                  </label>
                                  <p className="text-gray-900">{user.address.city}</p>
                                </div>
                              )}

                              {user.address?.state && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State
                                  </label>
                                  <p className="text-gray-900">{user.address.state}</p>
                                </div>
                              )}

                              {user.address?.pinCode && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    PIN Code
                                  </label>
                                  <p className="text-gray-900">{user.address.pinCode}</p>
                                </div>
                              )}

                              {user.address?.country && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Country
                                  </label>
                                  <p className="text-gray-900">{user.address.country}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Additional Profile Information */}
                        {(user.kycData?.faceMatch !== undefined || user.kycData?.hasPhoto !== undefined || user.kycData?.mobileHash || user.kycData?.emailHash || user.kycData?.uid) && (
                          <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h4 className="text-md font-medium text-gray-900 mb-4">Additional Profile Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {user.kycData?.faceMatch !== undefined && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Face Match
                                  </label>
                                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                                    user.kycData.faceMatch 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {user.kycData.faceMatch ? 'Matched' : 'Not Matched'}
                                  </span>
                                </div>
                              )}

                              {user.kycData?.hasPhoto !== undefined && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Photo Available
                                  </label>
                                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                                    user.kycData.hasPhoto 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {user.kycData.hasPhoto ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              )}

                              {user.kycData?.mobileHash && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile Hash
                                  </label>
                                  <p className="text-gray-900 font-mono text-xs break-all">{user.kycData.mobileHash}</p>
                                </div>
                              )}

                              {user.kycData?.emailHash && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Hash
                                  </label>
                                  <p className="text-gray-900 font-mono text-xs break-all">{user.kycData.emailHash}</p>
                                </div>
                              )}

                              {user.kycData?.uid && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unique ID
                                  </label>
                                  <p className="text-gray-900 font-mono text-xs">{user.kycData.uid}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Verification Metadata */}
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                          <div className="flex items-start space-x-3">
                            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-blue-900 mb-2">
                                Security & Privacy
                              </h4>
                              <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Your Aadhaar number is securely hashed and never stored in plain text</li>
                                <li>• All KYC data is encrypted and stored securely</li>
                                <li>• Verification status: {user.kycData?.status || 'VALID'}</li>
                                <li>• Verified on: {user.kycVerifiedAt ? new Date(user.kycVerifiedAt).toLocaleDateString('en-IN') : 'N/A'}</li>
                                {user.kycData?.shareCode && (
                                  <li>• Share Code: {user.kycData.shareCode}</li>
                                )}
                                {user.kycData?.message && (
                                  <li>• Message: {user.kycData.message}</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          Complete Your KYC
                        </h4>
                        <p className="text-gray-600 mb-6">
                          Verify your identity using Aadhaar to access all features
                        </p>
                        <button 
                          onClick={() => setKycModalOpen(true)}
                          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                          Start KYC Verification
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
                    
                    {/* Password Change */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">Password</h4>
                          <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                        </div>
                        <button
                          onClick={() => setShowPasswordChange(!showPasswordChange)}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Change Password
                        </button>
                      </div>

                      {showPasswordChange && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <button
                              onClick={handlePasswordUpdate}
                              disabled={loading}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {loading ? 'Updating...' : 'Update Password'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </div>

                    {/* Login Sessions */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Active Sessions</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-600">Chrome on Windows • Mumbai, India</p>
                          </div>
                          <span className="text-green-600 text-sm">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={notifications.emailNotifications}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">SMS Notifications</h4>
                          <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                        </div>
                        <input
                          type="checkbox"
                          name="smsNotifications"
                          checked={notifications.smsNotifications}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">Case Updates</h4>
                          <p className="text-sm text-gray-600">Get notified about case status changes</p>
                        </div>
                        <input
                          type="checkbox"
                          name="caseUpdates"
                          checked={notifications.caseUpdates}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">System Alerts</h4>
                          <p className="text-sm text-gray-600">Important system announcements</p>
                        </div>
                        <input
                          type="checkbox"
                          name="systemAlerts"
                          checked={notifications.systemAlerts}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">Security Alerts</h4>
                          <p className="text-sm text-gray-600">Security-related notifications</p>
                        </div>
                        <input
                          type="checkbox"
                          name="securityAlerts"
                          checked={notifications.securityAlerts}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Recent Activity</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Profile updated successfully</p>
                          <p className="text-sm text-gray-600">2 hours ago</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Shield className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Login from new device</p>
                          <p className="text-sm text-gray-600">1 day ago</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-orange-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Case document uploaded</p>
                          <p className="text-sm text-gray-600">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Modal */}
      <KYCModal 
        isOpen={kycModalOpen} 
        onClose={() => setKycModalOpen(false)}
        onSuccess={handleKycSuccess}
      />
    </div>
  );
};

export default Profile;