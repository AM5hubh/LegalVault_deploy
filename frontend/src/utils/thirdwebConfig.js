/**
 * Thirdweb Configuration
 * Configures supported chains and wallets for blockchain integration
 */

import { defineChain } from "thirdweb";

// Supported chains for LEGALVAULT
const SEPOLIA_CHAIN_ID = Number(
  import.meta.env.VITE_THIRDWEB_CHAIN_ID || 11155111,
);

// Optional RPC override to avoid thirdweb default RPC (which needs a valid clientId)
const SEPOLIA_RPC_URL =
  import.meta.env.VITE_SEPOLIA_RPC_URL || import.meta.env.VITE_RPC_URL;

export const SUPPORTED_CHAINS = {
  sepolia: defineChain({
    id: SEPOLIA_CHAIN_ID,
    rpc: SEPOLIA_RPC_URL ? [SEPOLIA_RPC_URL] : undefined,
    name: "Sepolia",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  }), // Sepolia (configurable via env)
};

// Default chain (Sepolia only)
export const DEFAULT_CHAIN = SUPPORTED_CHAINS.sepolia;

// Thirdweb Client ID (should be set in environment variables)
export const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "";

// Roles allowed to connect wallet
export const WALLET_CONNECTED_ROLES = ["admin", "police", "judge", "lawyer"];

// Wallet connection configuration
export const WALLET_CONFIG = {
  // Display name for each role
  roleNames: {
    admin: "Administrator",
    police: "Police Officer",
    judge: "Judge",
    lawyer: "Legal Counsel",
  },

  // Required network for wallet connection
  requiredChain: DEFAULT_CHAIN,

  // Supported wallet types
  supportedWallets: [
    "metamask",
    "coinbase",
    "trust",
    "walletconnect",
    "injected",
  ],
};

export default {
  SUPPORTED_CHAINS,
  DEFAULT_CHAIN,
  THIRDWEB_CLIENT_ID,
  WALLET_CONNECTED_ROLES,
  WALLET_CONFIG,
};
