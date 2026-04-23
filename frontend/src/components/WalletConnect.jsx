import React, { useEffect, useState } from "react";
import { Wallet, X, AlertCircle } from "lucide-react";
import { ConnectButton } from "thirdweb/react";
import { DEFAULT_CHAIN } from "../utils/thirdwebConfig.js";
import { client } from "../utils/thirdwebClient.js";
import { createWallet } from "thirdweb/wallets";
import { useWallet } from "../context/WalletContext";

/**
 * WalletConnect Component
 * Allows authenticated users with specific roles to connect their blockchain wallets
 * Integrated with wallet linking and hybrid auth (email + wallet)
 */
const WalletConnect = ({ isCompact = false }) => {
  const {
    walletAddress,
    isConnected,
    linkedWallets,
    isLinking,
    error,
    isWalletEligible,
    linkActiveWallet,
    refreshLinkedWallets,
    disconnectWallet,
  } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkError, setLinkError] = useState(null);
  useEffect(() => {
    if (isWalletEligible) {
      refreshLinkedWallets();
    }
  }, [isWalletEligible]);

  useEffect(() => {
    setLinkError(error || null);
  }, [error]);

  // Manual wallet linking - sign message directly with connected wallet
  const handleLinkWallet = async () => {
    try {
      setLinkError(null);
      const result = await linkActiveWallet();
      if (result?.success) {
        setLinkError(null);
      }
    } catch (error) {
      console.error("Error linking wallet:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to link wallet";
      setLinkError(errorMsg);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  if (!isWalletEligible) {
    return null;
  }

  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("io.zerion.wallet"),
  ];

  // Compact view for header
  if (isCompact) {
    return (
      <div className="relative border ">
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium ${
            isConnected
              ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
              : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isConnected
              ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`
              : "Connect Wallet"}
          </span>
          <span className="sm:hidden">
            {isConnected ? "Connected" : "Wallet"}
          </span>
        </button>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full z-50">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <span>Connect Wallet</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    Connect your blockchain wallet to sign legal documents and
                    store evidence on the blockchain.
                  </p>
                </div>

                {/* Error Message */}
                {linkError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-red-700">Error</p>
                      <p className="text-xs text-red-600 mt-1">{linkError}</p>
                    </div>
                  </div>
                )}

                {/* Linked Wallets List */}
                {linkedWallets.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-700 mb-2">
                      🔗 Linked Wallets ({linkedWallets.length})
                    </p>
                    <div className="space-y-1">
                      {linkedWallets.map((wallet) => (
                        <p
                          key={wallet.address}
                          className="text-xs font-mono text-green-900 truncate"
                        >
                          {wallet.label}: {wallet.address.slice(0, 6)}...
                          {wallet.address.slice(-4)} {wallet.isVerified && "✓"}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {!isConnected && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Click the button below to connect your blockchain wallet.
                    </p>
                  </div>
                )}

                {/* Current Connection Status */}
                {isConnected && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-700 mb-2">
                      Connected Wallet
                    </p>
                    <p className="text-sm font-mono text-green-900">
                      {walletAddress}
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Network: Sepolia Testnet
                    </p>
                  </div>
                )}

                {/* Connect Button - No Auth Config (manual linking instead) */}
                <div className="flex flex-col items-center gap-3 py-3">
                  <ConnectButton
                    theme="light"
                    client={client}
                    chain={DEFAULT_CHAIN}
                    supportedChains={[DEFAULT_CHAIN]}
                    wallets={wallets}
                    connectModal={{
                      size: "wide",
                      title: "Connect Wallet",
                      showThirdwebBranding: false,
                    }}
                  />

                  {/* Manual Link Wallet Button - appears after wallet connects */}
                  {isConnected && !isLinking && (
                    <button
                      onClick={handleLinkWallet}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Link Wallet to Account
                    </button>
                  )}
                </div>

                {isLinking && (
                  <div className="text-center text-sm text-gray-600">
                    Linking wallet...
                  </div>
                )}

                {/* Info Footer */}
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Your wallet is used to verify digital documents</p>
                  <p>• All transactions are recorded on {DEFAULT_CHAIN.name}</p>
                  <p>• Never share your private keys</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full view (if needed for dedicated page)
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-3">
          <Wallet className="w-6 h-6 text-blue-600" />
          <span>Wallet Connection</span>
        </h2>

        {isConnected ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-700 mb-2">
                ✓ Wallet Connected
              </p>
              <p className="text-lg font-mono text-green-900">
                {walletAddress}
              </p>
              <p className="text-sm text-green-600 mt-2">
                Network: {DEFAULT_CHAIN.name}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Connect your Web3 wallet to manage blockchain-based document
              verification and evidence storage.
            </p>

            {/* Connect Button - No Auth (manual linking) */}
            <div className="flex flex-col items-center gap-3 py-4">
              <ConnectButton
                client={client}
                chain={DEFAULT_CHAIN}
                supportedChains={[DEFAULT_CHAIN]}
                wallets={wallets}
              />

              {/* Manual Link Button */}
              {isConnected && !isLinking && (
                <button
                  onClick={handleLinkWallet}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Link Wallet to Account
                </button>
              )}

              {isLinking && (
                <p className="text-sm text-gray-600">Linking wallet...</p>
              )}

              {linkError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {linkError}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">
            Why Connect Your Wallet?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Securely sign legal documents with your wallet</li>
            <li>• Store evidence and case files on the blockchain</li>
            <li>• Create immutable audit trails for cases</li>
            <li>• Verify document authenticity and timestamps</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
