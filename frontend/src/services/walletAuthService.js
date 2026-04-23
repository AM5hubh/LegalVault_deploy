/**
 * Wallet Auth Service
 * Handles wallet authentication and linking for the frontend
 * Communicates with backend wallet API endpoints
 */

import axios from "axios";
import { authHeaders } from "../utils/authHeaders";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const walletAuthService = {
  /**
   * Generate verification message for wallet owner to sign
   * @param {string} walletAddress - Wallet address to verify
   * @returns {Promise<Object>} Verification data with message and nonce
   */
  async generateVerificationMessage(walletAddress, token) {
    try {
      if (!token) throw new Error("Authentication required");
      const response = await axios.post(
        `${API_BASE_URL}/wallet/generate-verification`,
        { walletAddress },
        { headers: authHeaders(token) },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to generate verification message",
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Error generating verification message:", error);
      throw error;
    }
  },

  /**
   * Check if a wallet address is linked to current user
   * @param {string} walletAddress - Wallet address to check
   * @returns {Promise<boolean>} Whether wallet is linked
   */
  async isWalletLinked(walletAddress, token) {
    try {
      if (!token) {
        return false;
      }

      const response = await axios.get(
        `${API_BASE_URL}/wallet/linked-wallets`,
        { headers: authHeaders(token) },
      );

      if (!response.data.success) {
        return false;
      }

      const linkedWallets = response.data.data.linkedWallets || [];
      return linkedWallets.some(
        (w) => w.address.toLowerCase() === walletAddress.toLowerCase(),
      );
    } catch (error) {
      console.error("Error checking wallet link status:", error);
      return false;
    }
  },

  /**
   * Link a wallet to the current user account
   * @param {string} walletAddress - Wallet address to link
   * @param {string} signature - Signed message signature
   * @param {string} message - Original message that was signed
   * @param {string} label - Optional label for the wallet
   * @returns {Promise<Object>} Link result
   */
  async addWalletToAccount(
    walletAddress,
    signature,
    message,
    label = null,
    token,
  ) {
    try {
      console.log("Linking wallet with:", {
        walletAddress,
        signature: signature?.slice(0, 20) + "...",
        message: message?.slice(0, 50) + "...",
        label,
      });

      const response = await axios.post(
        `${API_BASE_URL}/wallet/link`,
        {
          walletAddress,
          signature,
          message,
          label,
        },
        { headers: authHeaders(token) },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to link wallet");
      }

      return response.data;
    } catch (error) {
      console.error("Error linking wallet:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  /**
   * Get all linked wallets for current user
   * @returns {Promise<Array>} Array of linked wallets
   */
  async getLinkedWallets(token) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/wallet/linked-wallets`,
        { headers: authHeaders(token) },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to retrieve linked wallets",
        );
      }

      return response.data.data.linkedWallets || [];
    } catch (error) {
      console.error("Error retrieving linked wallets:", error);
      return [];
    }
  },

  /**
   * Unlink a wallet from user account
   * @param {string} walletAddress - Wallet address to unlink
   * @returns {Promise<Object>} Unlink result
   */
  async unlinkWallet(walletAddress, token) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/wallet/unlink/${walletAddress}`,
        { headers: authHeaders(token) },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to unlink wallet");
      }

      return response.data;
    } catch (error) {
      console.error("Error unlinking wallet:", error);
      throw error;
    }
  },

  /**
   * Set a wallet as the primary wallet for the user
   * @param {string} walletAddress - Wallet address to set as primary
   * @returns {Promise<Object>} Result
   */
  async setPrimaryWallet(walletAddress, token) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/wallet/set-primary`,
        { walletAddress },
        { headers: authHeaders(token) },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to set primary wallet",
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error setting primary wallet:", error);
      throw error;
    }
  },

  /**
   * Verify wallet ownership using signature (for wallet login flow)
   * This is called for wallet-based authentication without email password
   * @param {string} address - Wallet address
   * @param {string} signature - Signed message
   * @param {string} message - Original message
   * @returns {Promise<Object>} Auth result with token and user info
   */
  async verifyWalletOwnership(address, signature, message) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/wallet/verify-ownership`,
        { address, signature, message },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Wallet verification failed");
      }

      // Store the token if provided
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error("Error verifying wallet ownership:", error);
      throw error;
    }
  },

  /**
   * Generate a login message for the user to sign with their wallet
   * Used in standalone wallet login flow (not linked to email account)
   * @param {string} userEmail - User email (if known)
   * @param {string} walletAddress - Wallet address to verify
   * @returns {Promise<Object>} Login message to sign
   */
  async generateLoginMessage(userEmail, walletAddress) {
    try {
      const nonce = Math.random().toString(36).substring(2, 15);
      const timestamp = new Date().toISOString();

      const message = `
Connect to LegalVault with Wallet

${userEmail ? `Email: ${userEmail}` : ""}
Wallet: ${walletAddress}
Nonce: ${nonce}
Timestamp: ${timestamp}

By signing this message, you confirm ownership of this wallet.
This is a one-time authentication request and does not incur any gas fees.
      `.trim();

      return {
        message,
        nonce,
        timestamp,
        address: walletAddress.toLowerCase(),
      };
    } catch (error) {
      console.error("Error generating login message:", error);
      throw error;
    }
  },
};

export { walletAuthService };
