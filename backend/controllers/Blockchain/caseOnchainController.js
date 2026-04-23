const { ethers } = require("ethers");
const logger = require("../../utils/logger");
const OnchainCase = require("../../models/OnchainCase");

const deployments = require("../../../Blockchain/deployments.json");
const CaseRegistryArtifact = require("../../../Blockchain/artifacts/contracts/CaseRegistry.sol/CaseRegistry.json");

const resolveNetwork = () =>
  process.env.HARDHAT_NETWORK ||
  process.env.NETWORK ||
  Object.keys(deployments)[0];

const resolveContractAddress = () => {
  const envAddress = process.env.CASE_REGISTRY_ADDRESS;
  if (envAddress) return envAddress;
  const net = resolveNetwork();
  return deployments[net]?.caseRegistry;
};

const getProvider = () =>
  new ethers.JsonRpcProvider(
    process.env.BLOCKCHAIN_RPC_URL ||
      process.env.RPC_URL ||
      "http://localhost:8545",
  );

const getContractRead = () => {
  const address = resolveContractAddress();
  if (!address) throw new Error("CaseRegistry address not configured");
  return new ethers.Contract(address, CaseRegistryArtifact.abi, getProvider());
};

const resolveChainId = async () => {
  const envChain = process.env.BLOCKCHAIN_CHAIN_ID || process.env.CHAIN_ID;
  if (envChain) return envChain.toString();
  const net = await getProvider().getNetwork();
  return net.chainId.toString();
};

const normalizeCaseId = (raw) => {
  if (!raw) throw new Error("caseId is required");
  return raw.startsWith("0x") ? raw : ethers.id(raw);
};

const formatCase = (c) => ({
  caseId: c.caseId,
  caseNumber: c.caseNumber,
  status: Number(c.status),
  createdBy: c.createdBy,
  timestampCreated: Number(c.timestampCreated),
});

// Prepare unsigned tx for createCase(bytes32 caseId, string caseNumber, string[] initialAccessEmails)
exports.createCaseTx = async (req, res) => {
  try {
    const { caseId, caseNumber, initialAccessEmails = [], from } = req.body;
    if (!caseNumber || !caseNumber.trim()) {
      return res.status(400).json({ message: "caseNumber is required" });
    }

    const address = resolveContractAddress();
    if (!address) throw new Error("CaseRegistry address not configured");

    const cid = normalizeCaseId(caseId);
    const iface = new ethers.Interface(CaseRegistryArtifact.abi);
    const data = iface.encodeFunctionData("createCase", [
      cid,
      caseNumber,
      initialAccessEmails,
    ]);
    try {
      await OnchainCase.findOneAndUpdate(
        { caseId: cid },
        { caseId: cid, caseNumber },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    } catch (error) {
      logger.error("Failed to insert case into database", {
        error: error.message,
      });
    }
    const chainId = await resolveChainId();

    const tx = { to: address, data, value: "0", chainId };

    if (from) {
      try {
        const gas = await getProvider().estimateGas({ ...tx, from });
        tx.gasLimit = gas.toString();
      } catch (err) {
        logger.warn("Gas estimate failed", { error: err.message });
      }
    }

    res.json({ success: true, tx, contract: address, requiresSignature: true });
  } catch (error) {
    logger.error("createCaseTx failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

// Prepare unsigned tx for updateCaseStatus(bytes32 caseId, CaseStatus newStatus)
exports.updateCaseStatusTx = async (req, res) => {
  try {
    const { caseId, newStatus, from } = req.body;
    if (newStatus === undefined || newStatus === null) {
      return res.status(400).json({ message: "newStatus is required" });
    }

    const address = resolveContractAddress();
    if (!address) throw new Error("CaseRegistry address not configured");

    const cid = normalizeCaseId(caseId);
    const iface = new ethers.Interface(CaseRegistryArtifact.abi);
    const data = iface.encodeFunctionData("updateCaseStatus", [cid, newStatus]);
    const chainId = await resolveChainId();

    const tx = { to: address, data, value: "0", chainId };

    if (from) {
      try {
        const gas = await getProvider().estimateGas({ ...tx, from });
        tx.gasLimit = gas.toString();
      } catch (err) {
        logger.warn("Gas estimate failed", { error: err.message });
      }
    }

    res.json({ success: true, tx, contract: address, requiresSignature: true });
  } catch (error) {
    logger.error("updateCaseStatusTx failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

// Prepare unsigned tx for assignAccess(bytes32 caseId, string email, bool canAccess)
exports.assignAccessTx = async (req, res) => {
  try {
    const { caseId, email, canAccess = true, from } = req.body;
    if (!email || !email.trim())
      return res.status(400).json({ message: "email is required" });

    const address = resolveContractAddress();
    if (!address) throw new Error("CaseRegistry address not configured");

    const cid = normalizeCaseId(caseId);
    const iface = new ethers.Interface(CaseRegistryArtifact.abi);
    const data = iface.encodeFunctionData("assignAccess", [
      cid,
      email,
      canAccess,
    ]);
    const chainId = await resolveChainId();

    const tx = { to: address, data, value: "0", chainId };

    if (from) {
      try {
        const gas = await getProvider().estimateGas({ ...tx, from });
        tx.gasLimit = gas.toString();
      } catch (err) {
        logger.warn("Gas estimate failed", { error: err.message });
      }
    }

    res.json({ success: true, tx, contract: address, requiresSignature: true });
  } catch (error) {
    logger.error("assignAccessTx failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

// Read helper
exports.getCaseOnchain = async (req, res) => {
  try {
    const { caseId } = req.params;
    const cid = normalizeCaseId(caseId);
    const contract = getContractRead();
    const result = await contract.getCase(cid);
    res.json({ success: true, case: formatCase(result) });
  } catch (error) {
    logger.error("getCaseOnchain failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

// List all cases (requires new getAllCases in contract)
exports.getAllCasesOnchain = async (_req, res) => {
  try {
    const contract = getContractRead();
    const cases = await contract.getAllCases();
    const normalized = cases.map(formatCase);
    res.json({ success: true, cases: normalized, count: normalized.length });
  } catch (error) {
    // If the deployed contract is the older version without getAllCases/getCaseIds, surface a clear hint
    logger.error("getAllCasesOnchain failed", { error: error.message, hint });
    res.status(400).json({ message: `${error.message}. ${hint}` });
  }
};
