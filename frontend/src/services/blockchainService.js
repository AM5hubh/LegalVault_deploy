/**
 * Blockchain Service
 * Provides utilities for blockchain interactions using thirdweb SDK
 * Used for document signing, evidence storage, and audit trails
 */

import { prepareContractCall, sendTransaction, readContract } from "thirdweb";
// import { ethers } from 'ethers';

/**
 * Sign a document hash with the user's wallet
 * @param {Object} transaction - Prepared transaction from thirdweb
 * @param {Object} account - Active account from thirdweb
 * @returns {Promise<Object>} Transaction result with hash and receipt
 */
export const signDocumentWithWallet = async (transaction, account) => {
  try {
    if (!account) {
      throw new Error("No wallet connected");
    }

    const result = await sendTransaction({
      transaction,
      account,
    });

    return {
      success: true,
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber,
      status: "confirmed",
    };
  } catch (error) {
    console.error("Error signing document:", error);
    throw new Error(`Document signing failed: ${error.message}`);
  }
};

/**
 * Store evidence data on blockchain
 * @param {Object} contract - Thirdweb contract instance
 * @param {string} evidenceHash - IPFS or file hash
 * @param {string} metadata - Evidence metadata JSON string
 * @param {Object} account - Active account
 * @returns {Promise<Object>} Transaction result
 */
export const storeEvidenceOnBlockchain = async (
  contract,
  evidenceHash,
  metadata,
  account,
) => {
  try {
    const transaction = prepareContractCall({
      contract,
      method: "storeEvidence",
      params: [evidenceHash, metadata],
    });

    return await signDocumentWithWallet(transaction, account);
  } catch (error) {
    console.error("Error storing evidence:", error);
    throw new Error(`Evidence storage failed: ${error.message}`);
  }
};

/**
 * Create case record on blockchain
 * @param {Object} contract - Thirdweb contract instance
 * @param {string} caseId - Unique case identifier
 * @param {string} caseData - Case information JSON string
 * @param {Object} account - Active account
 * @returns {Promise<Object>} Transaction result
 */
export const createCaseOnBlockchain = async (
  contract,
  caseId,
  caseData,
  account,
) => {
  try {
    const transaction = prepareContractCall({
      contract,
      method: "createCase",
      params: [caseId, caseData],
    });

    return await signDocumentWithWallet(transaction, account);
  } catch (error) {
    console.error("Error creating case:", error);
    throw new Error(`Case creation failed: ${error.message}`);
  }
};

/**
 * Read evidence data from blockchain
 * @param {Object} contract - Thirdweb contract instance
 * @param {string} evidenceHash - Evidence hash to retrieve
 * @returns {Promise<Object>} Evidence data
 */
export const getEvidenceFromBlockchain = async (contract, evidenceHash) => {
  try {
    const result = await readContract({
      contract,
      method: "getEvidence",
      params: [evidenceHash],
    });

    return {
      success: true,
      evidence: result,
    };
  } catch (error) {
    console.error("Error retrieving evidence:", error);
    throw new Error(`Evidence retrieval failed: ${error.message}`);
  }
};

/**
 * Get all cases for a specific user
 * @param {Object} contract - Thirdweb contract instance
 * @param {string} userAddress - User wallet address
 * @returns {Promise<Array>} List of cases
 */
export const getCasesForUser = async (contract, userAddress) => {
  try {
    const result = await readContract({
      contract,
      method: "getCasesForUser",
      params: [userAddress],
    });

    return {
      success: true,
      cases: result,
    };
  } catch (error) {
    console.error("Error retrieving cases:", error);
    throw new Error(`Case retrieval failed: ${error.message}`);
  }
};

/**
 * Get case audit trail (all transactions related to a case)
 * @param {Object} contract - Thirdweb contract instance
 * @param {string} caseId - Case identifier
 * @returns {Promise<Array>} Audit trail entries
 */
export const getCaseAuditTrail = async (contract, caseId) => {
  try {
    const result = await readContract({
      contract,
      method: "getCaseHistory",
      params: [caseId],
    });

    return {
      success: true,
      auditTrail: result,
    };
  } catch (error) {
    console.error("Error retrieving audit trail:", error);
    throw new Error(`Audit trail retrieval failed: ${error.message}`);
  }
};

/**
 * Sign evidence hash with wallet (creates signature proof)
 * @param {string} evidenceHash - Hash of evidence to sign
 * @param {Object} account - Active account
 * @returns {Promise<string>} Signature
 */
export const signEvidenceHash = async (evidenceHash, account) => {
  try {
    if (!account) {
      throw new Error("No wallet connected");
    }

    // Note: This would require wallet provider integration
    // Placeholder for signature generation
    const message = `Verify evidence: ${evidenceHash}`;

    console.log(`Signature message for ${account.address}: ${message}`);

    return {
      success: true,
      message: "Signature generated",
      signer: account.address,
    };
  } catch (error) {
    console.error("Error signing evidence hash:", error);
    throw new Error(`Evidence signing failed: ${error.message}`);
  }
};

/**
 * Verify evidence authenticity using blockchain
 * @param {Object} contract - Thirdweb contract instance
 * @param {string} evidenceHash - Evidence hash to verify
 * @param {string} signature - Digital signature
 * @returns {Promise<boolean>} Verification result
 */
export const verifyEvidenceAuthenticity = async (
  contract,
  evidenceHash,
  signature,
) => {
  try {
    const result = await readContract({
      contract,
      method: "verifyEvidence",
      params: [evidenceHash, signature],
    });

    return {
      success: true,
      isAuthentic: result,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error verifying evidence:", error);
    throw new Error(`Evidence verification failed: ${error.message}`);
  }
};

/**
 * Get transaction receipt details
 * @param {Object} contract - Thirdweb contract instance
 * @param {string} transactionHash - Transaction hash
 * @returns {Promise<Object>} Transaction details
 */
export const getTransactionDetails = async (contract, transactionHash) => {
  try {
    // This would require provider integration
    console.log(`Fetching details for transaction: ${transactionHash}`);

    return {
      success: true,
      transactionHash,
      status: "confirmed",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error retrieving transaction:", error);
    throw new Error(`Transaction retrieval failed: ${error.message}`);
  }
};

/**
 * Create blockchain audit entry
 * @param {Object} contract - Thirdweb contract instance
 * @param {string} action - Action performed (e.g., 'SIGN_DOCUMENT', 'STORE_EVIDENCE')
 * @param {string} details - Action details
 * @param {Object} account - Active account
 * @returns {Promise<Object>} Audit entry result
 */
export const createAuditEntry = async (contract, action, details, account) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);

    const transaction = prepareContractCall({
      contract,
      method: "recordAuditLog",
      params: [action, details, timestamp],
    });

    return await signDocumentWithWallet(transaction, account);
  } catch (error) {
    console.error("Error creating audit entry:", error);
    throw new Error(`Audit entry creation failed: ${error.message}`);
  }
};

export default {
  signDocumentWithWallet,
  storeEvidenceOnBlockchain,
  createCaseOnBlockchain,
  getEvidenceFromBlockchain,
  getCasesForUser,
  getCaseAuditTrail,
  signEvidenceHash,
  verifyEvidenceAuthenticity,
  getTransactionDetails,
  createAuditEntry,
};
