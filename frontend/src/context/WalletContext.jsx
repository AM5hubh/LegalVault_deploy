import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useActiveAccount } from "thirdweb/react";
import { WALLET_CONNECTED_ROLES } from "../utils/thirdwebConfig";
import { walletAuthService } from "../services/walletAuthService";
import { useAuth } from "./AuthContext";

/**
 * WalletContext centralizes wallet connection + linking state so components can
 * share eligibility, active address, and linked wallet metadata.
 */
const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const { user, token } = useAuth();
  const activeAccount = useActiveAccount();
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [linkedWallets, setLinkedWallets] = useState([]);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState(null);

  const isWalletEligible = Boolean(
    user && WALLET_CONNECTED_ROLES.includes(user.role),
  );

  // Keep state in sync with thirdweb active account
  useEffect(() => {
    if (!activeAccount) {
      setWalletAddress(null);
      setIsConnected(false);
      return;
    }

    setWalletAddress(activeAccount.address);
    setIsConnected(true);
    localStorage.setItem(
      "userWallet",
      JSON.stringify({
        address: activeAccount.address,
        timestamp: new Date().toISOString(),
        role: user?.role,
      }),
    );
  }, [activeAccount, user?.role]);

  // Load linked wallets when the user is eligible
  useEffect(() => {
    if (!isWalletEligible) {
      setLinkedWallets([]);
      return;
    }
    refreshLinkedWallets();
  }, [isWalletEligible]);

  const refreshLinkedWallets = async () => {
    if (!isWalletEligible) return [];
    try {
      const wallets = await walletAuthService.getLinkedWallets(token);
      setLinkedWallets(wallets || []);
      return wallets || [];
    } catch (err) {
      setError(err.message || "Failed to load linked wallets");
      return [];
    }
  };

  const linkActiveWallet = async () => {
    if (!activeAccount) {
      setError("No wallet connected. Please connect your wallet first.");
      return null;
    }

    try {
      setIsLinking(true);
      setError(null);

      const payload = await walletAuthService.generateVerificationMessage(
        activeAccount.address,
        token,
      );
      const signature = await activeAccount.signMessage({
        message: payload.message,
      });

      const result = await walletAuthService.addWalletToAccount(
        activeAccount.address,
        signature,
        payload.message,
        null,
        token,
      );

      await refreshLinkedWallets();
      return result;
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Failed to link wallet";
      setError(message);
      throw err;
    } finally {
      setIsLinking(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    localStorage.removeItem("userWallet");
  };

  const formatAddress = (address, chars = 4) => {
    if (!address) return "";
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
  };

  const value = useMemo(
    () => ({
      walletAddress,
      isConnected,
      linkedWallets,
      isLinking,
      error,
      isWalletEligible,
      activeAccount,
      refreshLinkedWallets,
      linkActiveWallet,
      disconnectWallet,
      formatAddress,
    }),
    [
      walletAddress,
      isConnected,
      linkedWallets,
      isLinking,
      error,
      isWalletEligible,
      activeAccount,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
};
