// KYC API Service
// Handles all Aadhaar KYC authentication API calls

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const kycService = {
  /**
   * Generate OTP for Aadhaar KYC
   * @param {string} aadhaarNumber - 12-digit Aadhaar number
   * @param {string} consent - User consent (Y/y)
   * @param {string} reason - Reason for verification
   * @returns {Promise<Object>} Response with transactionId and referenceId
   */
  generateOtp: async (aadhaarNumber, consent = 'Y', reason = 'kyc_verification') => {
    try {
      const response = await fetch(`${API_URL}/kyc/generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aadhaarNumber,
          consent,
          reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate OTP');
      }

      return await response.json();
    } catch (error) {
      console.error('Generate OTP Error:', error);
      throw error;
    }
  },

  /**
   * Verify OTP and complete KYC verification
   * @param {string} transactionId - Transaction ID from OTP generation
   * @param {number} referenceId - Reference ID from OTP generation
   * @param {string} otp - 6-digit OTP entered by user
   * @returns {Promise<Object>} Response with user data and verification status
   */
  verifyOtp: async (transactionId, referenceId, otp) => {
    try {
      const response = await fetch(`${API_URL}/kyc/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          referenceId,
          otp,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'OTP verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Verify OTP Error:', error);
      throw error;
    }
  },

  /**
   * Get KYC status for authenticated user
   * @param {string} token - JWT authentication token
   * @returns {Promise<Object>} KYC status and expiry information
   */
  getKycStatus: async (token) => {
    try {
      const response = await fetch(`${API_URL}/kyc/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch KYC status');
      }

      return await response.json();
    } catch (error) {
      console.error('Get KYC Status Error:', error);
      throw error;
    }
  },

  /**
   * Get all KYC requests (Admin only)
   * @param {string} token - JWT authentication token
   * @param {Object} params - Query parameters {page, limit, status}
   * @returns {Promise<Object>} List of KYC requests
   */
  getKycRequests: async (token, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_URL}/kyc/requests${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch KYC requests');
      }

      return await response.json();
    } catch (error) {
      console.error('Get KYC Requests Error:', error);
      throw error;
    }
  },

  /**
   * Update KYC status (Admin only)
   * @param {string} token - JWT authentication token
   * @param {string} userId - User ID to update
   * @param {string} status - New status (verified|rejected|expired)
   * @param {string} reason - Reason for change
   * @returns {Promise<Object>} Update confirmation
   */
  updateKycStatus: async (token, userId, status, reason = '') => {
    try {
      const response = await fetch(`${API_URL}/kyc/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          status,
          reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update KYC status');
      }

      return await response.json();
    } catch (error) {
      console.error('Update KYC Status Error:', error);
      throw error;
    }
  },

  /**
   * Validate Aadhaar format
   * @param {string} aadhaarNumber - Aadhaar number to validate
   * @returns {boolean} True if valid format
   */
  validateAadhaarFormat: (aadhaarNumber) => {
    const cleaned = aadhaarNumber.replace(/\D/g, '');
    return cleaned.length === 12 && /^\d+$/.test(cleaned);
  },

  /**
   * Validate OTP format
   * @param {string} otp - OTP to validate
   * @returns {boolean} True if valid format
   */
  validateOtpFormat: (otp) => {
    const cleaned = otp.replace(/\D/g, '');
    return cleaned.length === 6 && /^\d+$/.test(cleaned);
  },

  /**
   * Mask Aadhaar number for display
   * @param {string} aadhaarNumber - Full Aadhaar number
   * @returns {string} Masked Aadhaar (XXXX XXXX 1234)
   */
  maskAadhaar: (aadhaarNumber) => {
    const last4 = aadhaarNumber.slice(-4);
    return `XXXX XXXX ${last4}`;
  },
};

export default kycService;
