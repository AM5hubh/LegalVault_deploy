import React, { useState, useRef, useEffect } from 'react';
import { X, Loader, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const KYCModal = ({ isOpen, onClose, onSuccess, requiresKyc = false }) => {
  const [step, setStep] = useState('aadhaar'); // 'aadhaar' | 'otp' | 'success'
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [aadhaarLastFour, setAadhaarLastFour] = useState('');
  const [resendTimeout, setResendTimeout] = useState(0);
  const otpInputs = useRef([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    let interval;
    if (resendTimeout > 0) {
      interval = setInterval(() => {
        setResendTimeout((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimeout]);

  // Handle Aadhaar input
  const handleAadhaarChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaarNumber(value);
    setError('');
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '').slice(0, 1);
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Validate Aadhaar format
  const isAadhaarValid = aadhaarNumber.length === 12;

  // Generate OTP
  const handleGenerateOtp = async () => {
    if (!isAadhaarValid) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/kyc/generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aadhaarNumber,
          consent: 'Y',
          reason: 'kyc_verification',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTransactionId(data.transactionId);
        setReferenceId(data.referenceId);
        setAadhaarLastFour(data.aadhaarLastFour);
        setResendTimeout(60); // 60 seconds before can resend
        setStep('otp');
        setSuccess('OTP sent to your registered mobile number');
      } else {
        setError(data.message || 'Failed to generate OTP');
      }
    } catch (error) {
      console.error('Generate OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    if (!referenceId) {
      setError('Session expired. Please start over.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/kyc/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referenceId,
          otp: otpValue,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('success');
        setSuccess('KYC verification successful!');
        
        // Call success callback with complete user data from response
        setTimeout(() => {
          // Pass the complete user object or kycData from the response
          const userData = data.user || data.kycData || data;
          console.log('KYC Success - User Data:', userData);
          onSuccess(userData);
        }, 1500);
      } else {
        setError(data.message || 'OTP verification failed');
        // Reset OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        otpInputs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (resendTimeout > 0) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/kyc/generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aadhaarNumber,
          consent: 'Y',
          reason: 'kyc_verification',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTransactionId(data.transactionId);
        setReferenceId(data.referenceId);
        setResendTimeout(60);
        setOtp(['', '', '', '', '', '']);
        setSuccess('New OTP sent to your registered mobile number');
        otpInputs.current[0]?.focus();
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setStep('aadhaar');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccess('');
    otpInputs.current[0]?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Aadhaar KYC Verification
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'aadhaar' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Enter your 12-digit Aadhaar number to proceed with verification.
              </p>

              {error && (
                <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Number
                </label>
                <input
                  id="aadhaar"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 12-digit Aadhaar"
                  value={aadhaarNumber}
                  onChange={handleAadhaarChange}
                  maxLength={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {aadhaarNumber.length}/12 digits
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Your Aadhaar number will be verified against UIDAI records. Only a hash is stored in our system.
                </p>
              </div>

              <button
                onClick={handleGenerateOtp}
                disabled={!isAadhaarValid || loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Generating OTP...</span>
                  </>
                ) : (
                  <span>Generate OTP</span>
                )}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Enter the 6-digit OTP sent to your registered mobile number ending with {aadhaarLastFour}.
              </p>

              {error && (
                <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{success}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  OTP Code
                </label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ))}
                </div>
              </div>

              {resendTimeout > 0 && (
                <div className="flex items-center justify-center space-x-2 text-amber-600 bg-amber-50 p-2 rounded-md">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Resend OTP in {resendTimeout}s</span>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleGoBack}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Go Back
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.join('').length !== 6 || loading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify OTP</span>
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600">
                  Didn't receive the OTP?{' '}
                  <button
                    onClick={handleResendOtp}
                    disabled={resendTimeout > 0 || loading}
                    className="text-orange-600 hover:text-orange-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Resend
                  </button>
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                KYC Verification Successful!
              </h3>
              <p className="text-gray-600 text-sm">
                Your Aadhaar verification has been completed successfully.
              </p>
              <p className="text-xs text-gray-500">
                Redirecting...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCModal;
