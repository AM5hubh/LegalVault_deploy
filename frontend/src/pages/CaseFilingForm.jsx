import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText,
  Calendar,
  MapPin,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader,
  Scale,
  Shield,
  Home,
  Users,
  Briefcase,
  ShoppingCart,
  Building,
  X,
} from 'lucide-react';

const CaseFilingForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    caseTitle: '',
    caseDescription: '',
    incidentCategory: '',
    incidentDate: '',
    incidentLocation: {
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  const [documents, setDocuments] = useState([]);

  const categories = [
    { value: 'criminal', label: 'Criminal Case', icon: Shield, color: 'red' },
    { value: 'civil', label: 'Civil Case', icon: Scale, color: 'blue' },
    { value: 'cyber', label: 'Cyber Crime', icon: AlertCircle, color: 'purple' },
    { value: 'property', label: 'Property Dispute', icon: Home, color: 'green' },
    { value: 'family', label: 'Family Law', icon: Users, color: 'pink' },
    { value: 'corporate', label: 'Corporate Law', icon: Building, color: 'indigo' },
    { value: 'labor', label: 'Labor Law', icon: Briefcase, color: 'orange' },
    { value: 'consumer', label: 'Consumer Rights', icon: ShoppingCart, color: 'teal' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      incidentLocation: { ...prev.incidentLocation, [name]: value }
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (documents.length + files.length > 10) {
      setError('Maximum 10 files allowed');
      return;
    }
    setDocuments(prev => [...prev, ...files]);
    setError('');
  };

  const removeFile = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const submitData = new FormData();
      submitData.append('caseTitle', formData.caseTitle);
      submitData.append('caseDescription', formData.caseDescription);
      submitData.append('incidentCategory', formData.incidentCategory);
      
      if (formData.incidentDate) {
        submitData.append('incidentDate', formData.incidentDate);
      }
      
      submitData.append('incidentLocation', JSON.stringify(formData.incidentLocation));
      
      documents.forEach(file => {
        submitData.append('documents', file);
      });

      const response = await axios.post(
        'http://localhost:5000/api/cases/submit',
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/case-report/${response.data.data._id}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting case:', err);
      setError(err.response?.data?.message || 'Failed to submit case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Case Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your case has been analyzed using AI. Redirecting to case report...
          </p>
          <div className="flex justify-center">
            <Loader className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Scale className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">File a Legal Case</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Describe your legal situation and our AI will analyze it to provide you with applicable laws, 
            potential punishments, lawyer recommendations, and cost estimates.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Case Title */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Case Title *
            </label>
            <input
              type="text"
              name="caseTitle"
              value={formData.caseTitle}
              onChange={handleInputChange}
              required
              placeholder="Brief title for your case"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Category Selection */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Select Case Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = formData.incidentCategory === category.value;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, incidentCategory: category.value }))}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? `border-${category.color}-500 bg-${category.color}-50 shadow-md`
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? `text-${category.color}-600` : 'text-gray-400'}`} />
                    <p className={`text-xs font-medium text-center ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                      {category.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Case Description */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Detailed Case Description *
            </label>
            <textarea
              name="caseDescription"
              value={formData.caseDescription}
              onChange={handleInputChange}
              required
              rows={8}
              placeholder="Describe your legal situation in detail. Include what happened, when it happened, who was involved, and any other relevant information..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            />
            <p className="mt-2 text-xs text-gray-500">
              Provide as much detail as possible for accurate AI analysis
            </p>
          </div>

          {/* Incident Date */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Incident Date
            </label>
            <input
              type="date"
              name="incidentDate"
              value={formData.incidentDate}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Incident Location */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              <MapPin className="w-4 h-4 inline mr-2" />
              Incident Location
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="address"
                  value={formData.incidentLocation.address}
                  onChange={handleLocationChange}
                  placeholder="Street Address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <input
                type="text"
                name="city"
                value={formData.incidentLocation.city}
                onChange={handleLocationChange}
                placeholder="City"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <input
                type="text"
                name="state"
                value={formData.incidentLocation.state}
                onChange={handleLocationChange}
                placeholder="State"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <input
                type="text"
                name="pincode"
                value={formData.incidentLocation.pincode}
                onChange={handleLocationChange}
                placeholder="Pincode"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              <Upload className="w-4 h-4 inline mr-2" />
              Supporting Documents (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <label className="cursor-pointer">
                <span className="text-orange-600 font-medium hover:text-orange-700">
                  Click to upload
                </span>
                <span className="text-gray-600"> or drag and drop</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                PDF, Images, Word documents (Max 10 files)
              </p>
            </div>

            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.incidentCategory || !formData.caseTitle || !formData.caseDescription}
              className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Submit & Analyze Case</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Legal Disclaimer */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Legal Disclaimer</h3>
              <p className="text-sm text-gray-700">
                This platform provides legal information based on AI analysis, not professional legal advice. 
                The analysis is for informational purposes only. For legal decisions, please consult a licensed 
                attorney who can review your specific situation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseFilingForm;
