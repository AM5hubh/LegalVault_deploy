const { ethers } = require("ethers");
const logger = require("../utils/logger");

// Load DocumentRegistry ABI
const DocumentRegistryABI = require("../../Blockchain/ABI/DocumentRegistry.json");

// Load deployment addresses
const deployments = require("../../Blockchain/deployments.json");

// Helpers to resolve chain + contract from env first
const resolveChainId = () =>
  process.env.BLOCKCHAIN_CHAIN_ID || process.env.CHAIN_ID || "11155111";

const resolveContractAddress = () => {
  // Prefer explicit env overrides
  const envAddress =
    process.env.DOCUMENT_REGISTRY_ADDRESS ||
    process.env.EVIDENCE_REGISTRY_ADDRESS;
  if (envAddress) return envAddress;

  // Fallback to deployments.json (first entry)
  const networkKey = Object.keys(deployments)[0];
  return deployments[networkKey]?.documentRegistry;
};

/**
 * Evidence Blockchain Service
 * Handles blockchain interactions for document registration using DocumentRegistry contract
 * Uses client-side wallet signing for decentralization
 */

/**
 * Prepare transaction data for client-side signing
 * Returns unsigned transaction data that frontend will sign with wallet
 */
async function prepareEvidenceRegistration({ ipfsCid, ipfsHash }) {
  try {
    const contractAddress = resolveContractAddress();

    if (!contractAddress) {
      throw new Error("DocumentRegistry contract not deployed");
    }

    // Create contract interface for encoding
    const contractInterface = new ethers.Interface(DocumentRegistryABI.abi);

    // Encode function data for registerDocument(string cid, string fileHash)
    const txData = contractInterface.encodeFunctionData("registerDocument", [
      ipfsCid,
      ipfsHash,
    ]);

    logger.info("Prepared document registration transaction", {
      contractAddress,
      ipfsCid,
    });

    return {
      to: contractAddress,
      data: txData,
      value: "0", // No ETH value required
      chainId: resolveChainId(),
      contractAddress,
      functionName: "registerDocument",
      abi: DocumentRegistryABI.abi,
    };
  } catch (error) {
    logger.error("Failed to prepare document registration", {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Verify transaction receipt and extract document ID
 * Called after user signs and submits transaction
 */
async function verifyEvidenceTransaction(txHash, providerUrl) {
  try {
    // Connect to blockchain provider
    const provider = new ethers.JsonRpcProvider(
      providerUrl || process.env.BLOCKCHAIN_RPC_URL || "http://localhost:8545",
    );

    // Wait for transaction receipt (handles pending propagation)
    const receipt = await provider.waitForTransaction(txHash, 1, 60_000);

    if (!receipt) {
      throw new Error("Transaction not found");
    }

    if (receipt.status !== 1) {
      throw new Error("Transaction failed on blockchain");
    }

    // Get contract instance to parse logs
    const contractAddress = resolveContractAddress();
    const contract = new ethers.Contract(
      contractAddress,
      DocumentRegistryABI.abi,
      provider,
    );

    // Parse logs to extract DocumentRegistered event
    const logs = receipt.logs;
    let documentId = null;
    let eventData = null;

    for (const log of logs) {
      try {
        const parsedLog = contract.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });

        if (parsedLog && parsedLog.name === "DocumentRegistered") {
          documentId = parsedLog.args.docId;
          eventData = {
            docId: parsedLog.args.docId,
            cid: parsedLog.args.cid,
            fileHash: parsedLog.args.fileHash,
            uploader: parsedLog.args.uploader,
            timestamp: parsedLog.args.timestamp,
          };
          break;
        }
      } catch (parseError) {
        // Skip logs that don't match
        continue;
      }
    }

    if (!documentId) {
      throw new Error("DocumentRegistered event not found in transaction logs");
    }

    logger.info("Document transaction verified", {
      txHash,
      documentId,
      blockNumber: receipt.blockNumber,
    });

    return {
      success: true,
      txHash,
      blockNumber: receipt.blockNumber,
      documentId: documentId.toString(),
      gasUsed: receipt.gasUsed.toString(),
      eventData,
    };
  } catch (error) {
    logger.error("Failed to verify document transaction", {
      txHash,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get document from blockchain
 */
async function getDocumentFromBlockchain(documentId, providerUrl) {
  try {
    const provider = new ethers.JsonRpcProvider(
      providerUrl || process.env.BLOCKCHAIN_RPC_URL || "http://localhost:8545",
    );

    const networkKey = Object.keys(deployments)[0];
    const contractAddress = deployments[networkKey]?.documentRegistry;
    const contract = new ethers.Contract(
      contractAddress,
      DocumentRegistryABI.abi,
      provider,
    );

    const document = await contract.getDocument(documentId);

    return {
      cid: document.cid,
      fileHash: document.fileHash,
      uploader: document.uploader,
      timestamp: document.timestamp,
    };
  } catch (error) {
    logger.error("Failed to get document from blockchain", {
      documentId,
      error: error.message,
    });
    throw error;
  }
}

module.exports = {
  prepareEvidenceRegistration,
  verifyEvidenceTransaction,
  getDocumentFromBlockchain,
};
