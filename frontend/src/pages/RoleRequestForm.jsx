import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Shield,
    Brain,
    Scale,
    Database,
    Upload,
    CheckCircle,
    AlertCircle,
    FileText,
    Building,
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    ArrowLeft,
    Send
} from 'lucide-react';

const RoleRequestForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        phone: '',
        requestedRole: '',
        organizationName: '',
        designation: '',
        departmentId: '',
        officeAddress: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        },
        purpose: '',
        caseDetails: '',
        technicalRequirements: {
            internetSpeed: false,
            systemSpecs: false,
            secureDevice: false,
            vpnCapability: false,
            twoFactorAuth: false
        },
        acceptedTerms: false
    });

    const [documents, setDocuments] = useState({
        idProof: null,
        authorizationLetter: null,
        registrationCertificate: null,
        professionalLicense: null,
        securityClearance: null,
        additionalDocuments: []
    });

    const roleOptions = [
        { value: 'police', label: 'Law Enforcement Officer', icon: Shield, color: 'blue' },
        { value: 'forensic_expert', label: 'Forensic Expert', icon: Brain, color: 'purple' },
        { value: 'lawyer', label: 'Legal Practitioner', icon: Scale, color: 'green' },
        { value: 'judge', label: 'Judicial Authority', icon: Database, color: 'orange' }
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        
        if (name === 'additionalDocuments') {
            setDocuments(prev => ({
                ...prev,
                additionalDocuments: Array.from(files)
            }));
        } else {
            setDocuments(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Create FormData for file upload
            const submitData = new FormData();
            
            // Append text fields
            Object.keys(formData).forEach(key => {
                if (typeof formData[key] === 'object' && !Array.isArray(formData[key])) {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else {
                    submitData.append(key, formData[key]);
                }
            });

            // Append files
            Object.keys(documents).forEach(key => {
                if (key === 'additionalDocuments') {
                    documents[key].forEach(file => {
                        submitData.append('additionalDocuments', file);
                    });
                } else if (documents[key]) {
                    submitData.append(key, documents[key]);
                }
            });

            const response = await axios.post(
                'http://localhost:5000/api/role-requests/submit',
                submitData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 4));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
                    <p className="text-gray-600 mb-4">
                        Your role request has been submitted successfully. You will receive a confirmation email shortly.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Our team will review your application within 3-5 business days.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Home
                    </button>
                    
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center">
                            <Scale className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Role Access Request</h1>
                            <p className="text-gray-600">Apply for authorized access to LEGALVAULT</p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mt-6">
                        {[1, 2, 3, 4].map((step) => (
                            <React.Fragment key={step}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        currentStep >= step ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {step}
                                    </div>
                                    <span className="text-xs mt-2 text-gray-600">
                                        {step === 1 && 'Personal Info'}
                                        {step === 2 && 'Organization'}
                                        {step === 3 && 'Documents'}
                                        {step === 4 && 'Review'}
                                    </span>
                                </div>
                                {step < 4 && (
                                    <div className={`flex-1 h-1 mx-2 ${
                                        currentStep > step ? 'bg-orange-600' : 'bg-gray-200'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
                    {/* Step 1: Personal Information & Role Selection */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
                            
                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Select Requested Role *
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {roleOptions.map((role) => {
                                        const Icon = role.icon;
                                        return (
                                            <div
                                                key={role.value}
                                                onClick={() => setFormData(prev => ({ ...prev, requestedRole: role.value }))}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    formData.requestedRole === role.value
                                                        ? 'border-orange-600 bg-orange-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className={`w-6 h-6 text-${role.color}-600`} />
                                                    <span className="font-medium text-gray-900">{role.label}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-2" />
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                    placeholder="+91 XXXXXXXXXX"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!formData.requestedRole || !formData.fullName || !formData.email || !formData.phone}
                                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Organization Details */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Organization Details</h3>
                            
                            {/* Organization Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Building className="w-4 h-4 inline mr-2" />
                                    Organization Name *
                                </label>
                                <input
                                    type="text"
                                    name="organizationName"
                                    value={formData.organizationName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                    placeholder="Enter organization name"
                                />
                            </div>

                            {/* Designation */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Briefcase className="w-4 h-4 inline mr-2" />
                                    Designation *
                                </label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                    placeholder="Your designation/position"
                                />
                            </div>

                            {/* Department ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    Department/Employee ID
                                </label>
                                <input
                                    type="text"
                                    name="departmentId"
                                    value={formData.departmentId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                    placeholder="Optional"
                                />
                            </div>

                            {/* Office Address */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Office Address *
                                </label>
                                
                                <input
                                    type="text"
                                    name="officeAddress.street"
                                    value={formData.officeAddress.street}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                    placeholder="Street Address"
                                />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="officeAddress.city"
                                        value={formData.officeAddress.city}
                                        onChange={handleInputChange}
                                        required
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                        placeholder="City"
                                    />
                                    <input
                                        type="text"
                                        name="officeAddress.state"
                                        value={formData.officeAddress.state}
                                        onChange={handleInputChange}
                                        required
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                        placeholder="State"
                                    />
                                </div>
                                
                                <input
                                    type="text"
                                    name="officeAddress.pincode"
                                    value={formData.officeAddress.pincode}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                    placeholder="Pincode"
                                />
                            </div>

                            {/* Purpose */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Purpose for Access *
                                </label>
                                <textarea
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleInputChange}
                                    required
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                    placeholder="Explain why you need access to LEGALVAULT system..."
                                />
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!formData.organizationName || !formData.designation || !formData.purpose}
                                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Document Upload */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Documents</h3>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> All documents must be in PDF, JPG, or PNG format. Maximum file size: 10MB per document.
                                </p>
                            </div>

                            {/* ID Proof */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Upload className="w-4 h-4 inline mr-2" />
                                    Government ID Proof * (Police ID / Court ID / Professional License)
                                </label>
                                <input
                                    type="file"
                                    name="idProof"
                                    onChange={handleFileChange}
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                />
                            </div>

                            {/* Authorization Letter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Upload className="w-4 h-4 inline mr-2" />
                                    Authorization Letter * (From Department Head)
                                </label>
                                <input
                                    type="file"
                                    name="authorizationLetter"
                                    onChange={handleFileChange}
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                />
                            </div>

                            {/* Registration Certificate */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Upload className="w-4 h-4 inline mr-2" />
                                    Registration Certificate * (Organization)
                                </label>
                                <input
                                    type="file"
                                    name="registrationCertificate"
                                    onChange={handleFileChange}
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                />
                            </div>

                            {/* Professional License */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Upload className="w-4 h-4 inline mr-2" />
                                    Professional License (If applicable)
                                </label>
                                <input
                                    type="file"
                                    name="professionalLicense"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                />
                            </div>

                            {/* Security Clearance */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Upload className="w-4 h-4 inline mr-2" />
                                    Security Clearance Certificate (If available)
                                </label>
                                <input
                                    type="file"
                                    name="securityClearance"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                />
                            </div>

                            {/* Additional Documents */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Upload className="w-4 h-4 inline mr-2" />
                                    Additional Documents (Optional, Max 5)
                                </label>
                                <input
                                    type="file"
                                    name="additionalDocuments"
                                    onChange={handleFileChange}
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                />
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!documents.idProof || !documents.authorizationLetter || !documents.registrationCertificate}
                                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review & Submit */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Review & Submit</h3>
                            
                            {/* Technical Requirements */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-4">Technical Requirements Confirmation</h4>
                                <div className="space-y-3">
                                    {[
                                        { key: 'internetSpeed', label: 'I have high-speed internet (50+ Mbps)' },
                                        { key: 'systemSpecs', label: 'My system meets minimum specifications (8GB RAM, 256GB SSD)' },
                                        { key: 'secureDevice', label: 'I have antivirus and security software installed' },
                                        { key: 'vpnCapability', label: 'I have VPN capability for secure connections' },
                                        { key: 'twoFactorAuth', label: 'I can use two-factor authentication' }
                                    ].map((req) => (
                                        <label key={req.key} className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name={`technicalRequirements.${req.key}`}
                                                checked={formData.technicalRequirements[req.key]}
                                                onChange={handleInputChange}
                                                className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                            />
                                            <span className="text-sm text-gray-700">{req.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Terms & Conditions */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="acceptedTerms"
                                        checked={formData.acceptedTerms}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                    />
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-900 mb-2">
                                            I accept the terms and conditions *
                                        </p>
                                        <ul className="text-gray-700 space-y-1 text-xs">
                                            <li>• All information provided is accurate and truthful</li>
                                            <li>• I understand that false information may result in permanent blacklisting</li>
                                            <li>• I agree to comply with all LEGALVAULT security protocols</li>
                                            <li>• I understand that unauthorized access is a punishable offense</li>
                                            <li>• All my activities will be monitored and logged</li>
                                        </ul>
                                    </div>
                                </label>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !formData.acceptedTerms}
                                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Submit Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default RoleRequestForm;
