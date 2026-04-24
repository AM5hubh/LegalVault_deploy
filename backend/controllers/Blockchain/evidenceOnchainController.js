const { ethers } = require("ethers");
const logger = require("../../utils/logger");

const deployments = require("../../../Blockchain/deployments.json");
const EvidenceRegistryArtifact = require("../../../Blockchain/artifacts/contracts/EvidenceRegistry.sol/EvidenceRegistry.json");

const resolveNetwork = () =>
  process.env.HARDHAT_NETWORK ||
  process.env.NETWORK ||
  Object.keys(deployments)[0];

const resolveContractAddress = () => {
  const envAddress = process.env.EVIDENCE_REGISTRY_ADDRESS;
  if (envAddress) return envAddress;
  const net = resolveNetwork();
  return deployments[net]?.evidenceRegistry;
};

const getProvider = () =>
  new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");

const getContractRead = () => {
  const address = resolveContractAddress();
  if (!address) throw new Error("EvidenceRegistry address not configured");
  return new ethers.Contract(
    address,
    EvidenceRegistryArtifact.abi,
    getProvider(),
  );
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

const formatEvidence = (ev) => ({
  ipfsCID: ev.ipfsCID,
  fileHash: ev.fileHash,
  evidenceType: ev.evidenceType,
  uploader: ev.uploader,
  timestamp: Number(ev.timestamp),
});

exports.getAllEvidenceOnchain = async (_req, res) => {
  try {
    const contract = getContractRead();
    const [caseIds, evidences] = await contract.getAllEvidence();

    const cases = caseIds.map((caseId, idx) => ({
      caseId,
      evidence: (evidences[idx] || []).map(formatEvidence),
    }));

    res.json({ success: true, cases });
  } catch (error) {
    logger.error("getAllEvidenceOnchain failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

exports.addEvidenceOnchain = async (req, res) => {
  try {
    const { caseId, ipfsCID, fileHash, evidenceType, from } = req.body;
    if (!ipfsCID || !fileHash || !evidenceType) {
      return res
        .status(400)
        .json({ message: "ipfsCID, fileHash, evidenceType required" });
    }

    const address = resolveContractAddress();
    if (!address) throw new Error("EvidenceRegistry address not configured");

    const cid = normalizeCaseId(caseId);
    const iface = new ethers.Interface(EvidenceRegistryArtifact.abi);
    const data = iface.encodeFunctionData("addEvidence", [
      cid,
      ipfsCID,
      fileHash,
      evidenceType,
    ]);

    const chainId = await resolveChainId();

    const tx = {
      to: address,
      data,
      value: "0",
      chainId,
    };

    // Optional gas estimate if caller supplies from address
    if (from) {
      try {
        const gas = await getProvider().estimateGas({ ...tx, from });
        tx.gasLimit = gas.toString();
      } catch (err) {
        logger.warn("Gas estimate failed", { error: err.message });
      }
    }

    res
      .status(200)
      .json({ success: true, tx, contract: address, requiresSignature: true });
  } catch (error) {
    logger.error("addEvidenceOnchain failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

exports.freezeEvidenceOnchain = async (req, res) => {
  try {
    const { caseId, from } = req.body;
    const address = resolveContractAddress();
    if (!address) throw new Error("EvidenceRegistry address not configured");

    const cid = normalizeCaseId(caseId);
    const iface = new ethers.Interface(EvidenceRegistryArtifact.abi);
    const data = iface.encodeFunctionData("freezeEvidence", [cid]);
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
    logger.error("freezeEvidenceOnchain failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

exports.getCaseEvidenceOnchain = async (req, res) => {
  try {
    const { caseId } = req.params;
    const contract = getContractRead();
    const cid = normalizeCaseId(caseId);

    const evidenceList = await contract.getEvidence(cid);
    const normalized = evidenceList.map(formatEvidence);
    res.json({ success: true, evidence: normalized });
  } catch (error) {
    logger.error("getCaseEvidenceOnchain failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};
