/**
 * Blockchain Integration Examples
 * Shows how to use wallet connection with smart contracts in LEGALVAULT
 */

import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import {
  //   signDocumentWithWallet,
  storeEvidenceOnBlockchain,
  createCaseOnBlockchain,
  getEvidenceFromBlockchain,
  verifyEvidenceAuthenticity,
} from "../services/blockchainService";
import { client } from "../utils/thirdwebClient";
import { DEFAULT_CHAIN } from "../utils/thirdwebConfig";
import useWalletConnection from "../hooks/useWalletConnection";

/**
 * Example 1: Initialize Contract Instance
 * Can be used to get the smart contract for operations
 */
export async function initializeContract(contractAddress, contractABI) {
  try {
    const contract = await getContract({
      client,
      address: contractAddress,
      chain: DEFAULT_CHAIN,
      abi: contractABI,
    });
    return contract;
  } catch (error) {
    console.error("Failed to initialize contract:", error);
    throw error;
  }
}

/**
 * Example 2: Sign a Document (React Component)
 * Shows how to use wallet connection in a component
 */
export function SignDocumentExample() {
  const account = useActiveAccount();
  const { isEligible, formatAddress } = useWalletConnection();

  const handleSignDocument = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Example document hash (would be generated from file)
      const documentHash = "0x" + "a".repeat(64); // 32 bytes

      // Store sign action in your backend first
      const response = await fetch("/api/documents/prepare-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentHash,
          userAddress: account.address,
        }),
      });

      if (!response.ok) throw new Error("Failed to prepare document");

      const { transaction } = await response.json();

      // Sign with wallet
      // This is a conceptual example - actual signing depends on contract implementation
      console.log("Document signed by", formatAddress(account.address));
      console.log("Transaction:", transaction);

      alert("Document signed successfully!");
    } catch (error) {
      alert(`Error signing document: ${error.message}`);
    }
  };

  if (!isEligible) return null;

  return (
    <button
      onClick={handleSignDocument}
      disabled={!account}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {account ? "Sign Document" : "Connect Wallet to Sign"}
    </button>
  );
}

/**
 * Example 3: Store Evidence on Blockchain
 */
export async function storeEvidenceExample(
  contractInstance,
  evidenceData,
  currentAccount,
) {
  try {
    if (!currentAccount) {
      throw new Error("Wallet not connected");
    }

    // Prepare evidence metadata
    const metadata = JSON.stringify({
      title: evidenceData.title,
      description: evidenceData.description,
      uploadedBy: currentAccount.address,
      uploadedAt: new Date().toISOString(),
      caseId: evidenceData.caseId,
      evidenceType: evidenceData.type,
    });

    // Store on blockchain
    const result = await storeEvidenceOnBlockchain(
      contractInstance,
      evidenceData.hash,
      metadata,
      currentAccount,
    );

    return {
      success: true,
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber,
      message: "Evidence stored successfully on blockchain!",
    };
  } catch (error) {
    console.error("Failed to store evidence:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Example 4: Create Case Record on Blockchain
 */
export async function createCaseExample(
  contractInstance,
  caseData,
  currentAccount,
) {
  try {
    if (!currentAccount) {
      throw new Error("Wallet not connected");
    }

    const caseMetadata = JSON.stringify({
      caseNumber: caseData.caseNumber,
      title: caseData.title,
      createdBy: currentAccount.address,
      createdAt: new Date().toISOString(),
      status: "OPEN",
      jurisdiction: caseData.jurisdiction,
    });

    const result = await createCaseOnBlockchain(
      contractInstance,
      caseData.id,
      caseMetadata,
      currentAccount,
    );

    return {
      success: true,
      transactionHash: result.transactionHash,
      message: "Case created on blockchain!",
    };
  } catch (error) {
    console.error("Failed to create case:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Example 5: Retrieve Evidence from Blockchain
 */
export async function retrieveEvidenceExample(contractInstance, evidenceHash) {
  try {
    const result = await getEvidenceFromBlockchain(
      contractInstance,
      evidenceHash,
    );

    if (result.success) {
      return {
        success: true,
        evidence: result.evidence,
        message: "Evidence retrieved successfully",
      };
    }
  } catch (error) {
    console.error("Failed to retrieve evidence:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Example 6: Batch Operations - Sign Multiple Documents
 */
export async function batchSignDocuments(
  contractInstance,
  documents,
  currentAccount,
) {
  try {
    if (!currentAccount) {
      throw new Error("Wallet not connected");
    }

    const results = [];

    for (const doc of documents) {
      try {
        // Each signing operation would be a separate transaction
        console.log(`Signing document: ${doc.name}`);

        results.push({
          documentId: doc.id,
          name: doc.name,
          status: "signed",
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        results.push({
          documentId: doc.id,
          name: doc.name,
          status: "failed",
          error: err.message,
        });
      }
    }

    return {
      success: true,
      results,
      totalSigned: results.filter((r) => r.status === "signed").length,
      totalFailed: results.filter((r) => r.status === "failed").length,
    };
  } catch (error) {
    console.error("Batch signing failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Example 7: Verify Evidence Chain
 */
export async function verifyEvidenceChain(
  contractInstance,
  evidenceHash,
  signature,
) {
  try {
    const result = await verifyEvidenceAuthenticity(
      contractInstance,
      evidenceHash,
      signature,
    );

    if (result.isAuthentic) {
      return {
        success: true,
        isValid: true,
        message: "Evidence authenticity verified",
        timestamp: result.timestamp,
      };
    } else {
      return {
        success: true,
        isValid: false,
        message: "Evidence authenticity could not be verified",
      };
    }
  } catch (error) {
    console.error("Verification failed:", error);
    return {
      success: false,
      isValid: false,
      error: error.message,
    };
  }
}

/**
 * Example 8: Component Hook Usage
 * Shows how to use the wallet connection hook in a component
 */
export function WalletStatusComponent({ user }) {
  const {
    isEligible,
    isConnected,
    walletAddress,
    formatAddress,
    getStoredWallet,
  } = useWalletConnection(user?.role);

  const storedWallet = getStoredWallet();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-bold mb-3">Wallet Status</h3>

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Eligible:</span>{" "}
          <span className={isEligible ? "text-green-600" : "text-red-600"}>
            {isEligible ? "Yes" : "No"}
          </span>
        </p>

        <p>
          <span className="font-medium">Connected:</span>{" "}
          <span className={isConnected ? "text-green-600" : "text-red-600"}>
            {isConnected ? "Yes" : "No"}
          </span>
        </p>

        {walletAddress && (
          <p>
            <span className="font-medium">Address:</span>{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {formatAddress(walletAddress)}
            </code>
          </p>
        )}

        {storedWallet && (
          <p>
            <span className="font-medium">Last Connected:</span>{" "}
            {new Date(storedWallet.timestamp).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default {
  initializeContract,
  SignDocumentExample,
  storeEvidenceExample,
  createCaseExample,
  retrieveEvidenceExample,
  batchSignDocuments,
  verifyEvidenceChain,
  WalletStatusComponent,
};
