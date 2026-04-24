import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Scale,
  Shield,
  Users,
  Building
} from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const categories = [
    { value: 'technical_support', label: 'Technical Support' },
    { value: 'legal_inquiry', label: 'Legal Inquiry' },
    { value: 'evidence_submission', label: 'Evidence Submission' },
    { value: 'account_issues', label: 'Account Issues' },
    { value: 'kyc_verification', label: 'KYC Verification' },
    { value: 'general_inquiry', label: 'General Inquiry' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return false;
    }
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Message is required');
      return false;
    }
    if (formData.message.trim().length < 10) {
      setError('Message must be at least 10 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          category: '',
          priority: 'medium',
          message: ''
        });
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setError('Network error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Scale className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contact LEGALVAULT</h1>
              <p className="text-gray-600">Government of India | Ministry of Law & Justice</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-gray-600 text-lg">
                We're here to help you with any questions about LEGALVAULT, 
                our blockchain-based evidence management system.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
                    <p className="text-gray-600 mb-2">Get help via email</p>
                    <a href="mailto:support@legalvault.gov.in" className="text-orange-600 hover:text-orange-700">
                      support@legalvault.gov.in
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Phone Support</h3>
                    <p className="text-gray-600 mb-2">Call us for immediate assistance</p>
                    <a href="tel:+911800123456" className="text-green-600 hover:text-green-700">
                      1800-123-456 (Toll Free)
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Office Address</h3>
                    <p className="text-gray-600">
                      Ministry of Law & Justice<br />
                      Shastri Bhawan, New Delhi - 110001<br />
                      India
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Support Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                      Saturday: 9:00 AM - 1:00 PM IST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-4">
                <a href="/help" className="flex items-center text-gray-600 hover:text-orange-600">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Help Center
                </a>
                <a href="/docs" className="flex items-center text-gray-600 hover:text-orange-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Documentation
                </a>
                <a href="/training" className="flex items-center text-gray-600 hover:text-orange-600">
                  <Users className="h-4 w-4 mr-2" />
                  Training
                </a>
                <a href="/compliance" className="flex items-center text-gray-600 hover:text-orange-600">
                  <Building className="h-4 w-4 mr-2" />
                  Compliance
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">{success}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="10-digit phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Brief description of your inquiry"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Please provide detailed information about your inquiry..."
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/2000 characters
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    id="privacy"
                    name="privacy"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="privacy" className="ml-2 block text-sm text-gray-900">
                    I agree that my information may be used to respond to my inquiry in accordance with the{' '}
                    <a href="/privacy" className="text-orange-600 hover:text-orange-500">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              For urgent matters or technical emergencies, please call our 24/7 helpline or 
              use the emergency contact options below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Emergency Hotline</h3>
              <p className="text-red-400 text-xl font-bold">1800-LEGAL-HELP</p>
              <p className="text-gray-400 text-sm">Available 24/7</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
              <p className="text-blue-400">Available Mon-Fri</p>
              <p className="text-gray-400 text-sm">9 AM - 6 PM IST</p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Priority Email</h3>
              <p className="text-green-400">urgent@legalvault.gov.in</p>
              <p className="text-gray-400 text-sm">Response within 2 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;