/**
 * Evidence Service - API calls for evidence management
 */

import { authHeaders, jsonAuthHeaders } from "../utils/authHeaders";

const API_BASE_URL = "/api/evidence";

export const evidenceService = {
  /**
   * Upload evidence to IPFS
   * @param {FormData} formData - Form data containing evidence file and metadata
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} - Upload response with IPFS details
   */
  uploadEvidenceToIPFS: async (formData, token, onProgress = null) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 201 || xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error("Failed to parse response", { cause: error }));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || "Upload failed"));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"));
      });

      // Start upload
      xhr.open("POST", `${API_BASE_URL}/upload/ipfs`);
      const headers = authHeaders(token);
      if (headers.Authorization) {
        xhr.setRequestHeader("Authorization", headers.Authorization);
      }
      xhr.send(formData);
    });
  },

  /**
   * Upload evidence to Cloudinary (existing method)
   * @param {FormData} formData - Form data containing evidence file and metadata
   * @returns {Promise<Object>} - Upload response
   */
  uploadEvidence: async (formData, token) => {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: authHeaders(token),
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return await response.json();
  },

  /**
   * Get evidence by ID
   * @param {string} evidenceId - Evidence ID
   * @returns {Promise<Object>} - Evidence details
   */
  getEvidence: async (evidenceId, token) => {
    const response = await fetch(`${API_BASE_URL}/${evidenceId}`, {
      headers: authHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch evidence");
    }

    return await response.json();
  },

  /**
   * Update evidence
   * @param {string} evidenceId - Evidence ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated evidence
   */
  updateEvidence: async (evidenceId, updateData, token) => {
    const response = await fetch(`${API_BASE_URL}/${evidenceId}`, {
      method: "PUT",
      headers: jsonAuthHeaders(token),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error("Failed to update evidence");
    }

    return await response.json();
  },

  /**
   * Delete evidence
   * @param {string} evidenceId - Evidence ID
   * @returns {Promise<Object>} - Deletion response
   */
  deleteEvidence: async (evidenceId, token) => {
    const response = await fetch(`${API_BASE_URL}/${evidenceId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Failed to delete evidence");
    }

    return await response.json();
  },

  /**
   * Get all evidence (admin only)
   * @param {Object} filters - Filter options (page, limit, status, uploaderId, caseId)
   * @returns {Promise<Object>} - Evidence list
   */
  getAllEvidence: async (filters = {}, token) => {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}?${queryParams}`, {
      headers: authHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch evidence");
    }

    return await response.json();
  },

  /**
   * Search evidence by case ID
   * @param {string} caseId - Case ID
   * @returns {Promise<Object>} - Evidence list for case
   */
  getEvidenceByCase: async (caseId, token) => {
    const response = await fetch(`${API_BASE_URL}?caseId=${caseId}`, {
      headers: authHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch evidence");
    }

    return await response.json();
  },

  /**
   * Verify evidence on blockchain
   * @param {string} evidenceId - Evidence ID
   * @returns {Promise<Object>} - Verification result
   */
  verifyEvidence: async (evidenceId, token) => {
    const response = await fetch(`${API_BASE_URL}/${evidenceId}/verify`, {
      headers: authHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Verification failed");
    }

    return await response.json();
  },

  /**
   * Download evidence from IPFS
   * @param {string} ipfsUrl - IPFS URL
   * @returns {Promise<Blob>} - File blob
   */
  downloadFromIPFS: async (ipfsUrl) => {
    const response = await fetch(ipfsUrl);
    if (!response.ok) {
      throw new Error("Failed to download file");
    }
    return await response.blob();
  },

  /**
   * Get IPFS gateway URL from evidence
   * @param {string} ipfsCID - IPFS Content Identifier
   * @returns {string} - Full IPFS URL
   */
  getIPFSUrl: (ipfsCID) => {
    return `https://gateway.pinata.cloud/ipfs/${ipfsCID}`;
  },
};

export default evidenceService;
