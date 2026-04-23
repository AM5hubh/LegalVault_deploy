import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

const SecurityVerification = ({ onVerificationSuccess, onCancel }) => {
  const [step, setStep] = useState('pin'); // 'pin' or 'questions'
  const [adminPin, setAdminPin] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pinVerified, setPinVerified] = useState(false);

  useEffect(() => {
    if (step === 'questions') {
      fetchSecurityQuestions();
    }
  }, [step]);

  const fetchSecurityQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/backup/security-questions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
        // Initialize answers object
        const initialAnswers = {};
        data.questions.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      } else {
        setError('Failed to load security questions');
      }
    } catch {
      setError('Failed to load security questions');
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (!adminPin) {
      setError('Please enter your admin PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/backup/verify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminPin })
      });

      if (response.ok) {
        setPinVerified(true);
        setStep('questions');
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid admin PIN');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionsSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all questions are answered
    const unanswered = questions.filter(q => !answers[q.id] || answers[q.id].trim() === '');
    if (unanswered.length > 0) {
      setError('Please answer all security questions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const verificationData = {
        adminPin,
        securityAnswers: answers
      };

      onVerificationSuccess(verificationData);
    } catch {
      setError('Verification failed. Please try again.');
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Security Verification Required
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {step === 'pin' 
                    ? 'Step 1: Enter your admin PIN to proceed'
                    : 'Step 2: Answer security questions to complete verification'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Progress indicator */}
          <div className="flex items-center mb-6">
            <div className={`flex items-center ${pinVerified ? 'text-green-600' : 'text-blue-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                pinVerified ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {pinVerified ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <span className="ml-2 text-sm font-medium">Admin PIN</span>
            </div>
            
            <div className={`flex-1 h-0.5 mx-4 ${pinVerified ? 'bg-green-200' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center ${step === 'questions' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'questions' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Security Questions</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {step === 'pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your admin PIN"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={loading || !adminPin}
                >
                  {loading ? 'Verifying...' : 'Continue'}
                </button>
              </div>
            </form>
          )}

          {step === 'questions' && (
            <form onSubmit={handleQuestionsSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Security Verification</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Please answer all security questions to complete the verification process.
                      Your responses will be logged for security auditing purposes.
                    </p>
                  </div>
                </div>
              </div>

              {questions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(question.severity)}`}>
                      {question.severity}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {index + 1}. {question.question}
                      </label>
                      <textarea
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="Enter your answer..."
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Complete Verification'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityVerification;