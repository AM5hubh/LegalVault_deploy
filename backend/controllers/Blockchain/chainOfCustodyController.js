const { ethers } = require("ethers");
const logger = require("../../utils/logger");

const deployments = require("../../../Blockchain/deployments.json");
const ChainOfCustodyArtifact = require("../../../Blockchain/artifacts/contracts/ChainOfCustody.sol/ChainOfCustody.json");

const resolveNetwork = () =>
  process.env.HARDHAT_NETWORK || process.env.NETWORK || Object.keys(deployments)[0];

const resolveContractAddress = () => {
  const envAddress = process.env.CHAIN_OF_CUSTODY_ADDRESS;
  if (envAddress) return envAddress;
  const net = resolveNetwork();
  return deployments[net]?.chainOfCustody;
};

const getProvider = () =>
  new ethers.JsonRpcProvider(
    process.env.BLOCKCHAIN_RPC_URL || process.env.RPC_URL || "http://localhost:8545",
  );

const getContractRead = () => {
  const address = resolveContractAddress();
  if (!address) throw new Error("ChainOfCustody address not configured");
  return new ethers.Contract(address, ChainOfCustodyArtifact.abi, getProvider());
};

const resolveChainId = async () => {
  const envChain = process.env.BLOCKCHAIN_CHAIN_ID || process.env.CHAIN_ID;
  if (envChain) return envChain.toString();
  const net = await getProvider().getNetwork();
  return net.chainId.toString();
};

const normalizeEvidenceId = (raw) => {
  if (!raw) throw new Error("evidenceId is required");
  return raw.startsWith("0x") ? raw : ethers.id(raw);
};

const formatEntry = (entry) => ({
  actor: entry.actor,
  actorRole: entry.actorRole,
  actionType: Number(entry.actionType),
  timestamp: Number(entry.timestamp),
  remarks: entry.remarks,
  signatureHash: entry.signatureHash,
});

// Prepare unsigned tx for addCustodyEntry(bytes32 evidenceId, ActionType actionType, string actorRole, string remarks, string signatureHash)
exports.addCustodyEntryTx = async (req, res) => {
  try {
    const { evidenceId, actionType = 0, actorRole = "", remarks = "", signatureHash, from } = req.body;
    if (!signatureHash || !signatureHash.trim()) {
      return res.status(400).json({ message: "signatureHash is required" });
    }

    const address = resolveContractAddress();
    if (!address) throw new Error("ChainOfCustody address not configured");

    const eid = normalizeEvidenceId(evidenceId);
    const iface = new ethers.Interface(ChainOfCustodyArtifact.abi);
    const data = iface.encodeFunctionData("addCustodyEntry", [
      eid,
      actionType,
      actorRole,
      remarks,
      signatureHash,
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
    logger.error("addCustodyEntryTx failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

// Read custody logs for an evidenceId
exports.getCustodyLogs = async (req, res) => {
  try {
    const { evidenceId } = req.params;
    const eid = normalizeEvidenceId(evidenceId);
    const contract = getContractRead();
    const logs = await contract.getCustodyLogs(eid);
    res.json({ success: true, logs: logs.map(formatEntry) });
  } catch (error) {
    logger.error("getCustodyLogs failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

// Read custody log count for an evidenceId
exports.getCustodyLogCount = async (req, res) => {
  try {
    const { evidenceId } = req.params;
    const eid = normalizeEvidenceId(evidenceId);
    const contract = getContractRead();
    const count = await contract.getCustodyLogCount(eid);
    res.json({ success: true, count: Number(count) });
  } catch (error) {
    logger.error("getCustodyLogCount failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};
