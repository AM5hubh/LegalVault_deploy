/**
 * useWalletConnection Hook
 * Provides wallet connection utilities and state management
 * Simplifies wallet interaction throughout the application
 */

import { useActiveAccount, useConnection } from "thirdweb/react";
import { useState, useEffect } from "react";
import { WALLET_CONNECTED_ROLES } from "../utils/thirdwebConfig";

export const useWalletConnection = (userRole) => {
  const [isEligible, setIsEligible] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const activeAccount = useActiveAccount();
  const { client } = useConnection();

  // Check if user role is eligible for wallet connection
  useEffect(() => {
    if (userRole && WALLET_CONNECTED_ROLES.includes(userRole)) {
      setIsEligible(true);
    } else {
      setIsEligible(false);
    }
  }, [userRole]);

  // Update wallet status when active account changes
  useEffect(() => {
    if (activeAccount) {
      setWalletAddress(activeAccount.address);
      setIsConnected(true);
      setConnectionError(null);
    } else {
      setWalletAddress(null);
      setIsConnected(false);
    }
  }, [activeAccount]);

  /**
   * Get stored wallet information from localStorage
   */
  const getStoredWallet = () => {
    const stored = localStorage.getItem("userWallet");
    return stored ? JSON.parse(stored) : null;
  };

  /**
   * Clear wallet connection
   */
  const clearWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    localStorage.removeItem("userWallet");
  };

  /**
   * Verify wallet is still connected
   */
  const verifyConnection = () => {
    if (!activeAccount) {
      setIsConnected(false);
      return false;
    }
    setIsConnected(true);
    return true;
  };

  /**
   * Format wallet address for display
   */
  const formatAddress = (address, chars = 4) => {
    if (!address) return "";
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
  };

  /**
   * Check if address matches current connected wallet
   */
  const isCurrentWallet = (address) => {
    return walletAddress?.toLowerCase() === address?.toLowerCase();
  };

  return {
    // State
    isEligible,
    walletAddress,
    isConnected,
    connectionError,
    activeAccount,
    client,

    // Methods
    getStoredWallet,
    clearWallet,
    verifyConnection,
    formatAddress,
    isCurrentWallet,
  };
};

export default useWalletConnection;
