import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

const { ethers } = await hre.network.connect();

// Configuration
const DEPLOYMENT_FILE = "./deployments.json";
const NETWORK_NAME = hre.network.name;

console.log(NETWORK_NAME);

// Helper function to save deployment addresses
function saveDeployment(addresses) {
  const deploymentsPath = path.resolve(DEPLOYMENT_FILE);
  let deployments = {};

  if (fs.existsSync(deploymentsPath)) {
    const data = fs.readFileSync(deploymentsPath, "utf8");
    deployments = JSON.parse(data);
  }

  deployments[NETWORK_NAME] = {
    ...deployments[NETWORK_NAME],
    ...addresses,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log(`✅ Deployment addresses saved to ${deploymentsPath}`);
}

async function main() {
  console.log(`\n🚀 Starting deployment on network: ${NETWORK_NAME}\n`);

  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const deployerBalance = await ethers.provider.getBalance(deployer.address);

    console.log(`📋 Deployer Account: ${deployer.address}`);
    console.log(
      `💰 Account Balance: ${ethers.formatEther(deployerBalance)} ETH\n`,
    );

    if (deployerBalance === 0n) {
      throw new Error(
        "❌ Deployer account has no balance. Please fund the account with test ETH.",
      );
    }

    // ===== Deploy AccessControl =====
    console.log("🛡️  Deploying AccessControl...");
    const AccessControl = await ethers.getContractFactory("AccessControl");
    const accessControl = await AccessControl.deploy();
    await accessControl.waitForDeployment();
    const accessControlAddress = await accessControl.getAddress();
    console.log(`✅ AccessControl deployed at: ${accessControlAddress}\n`);

    // ===== Deploy CaseRegistry =====
    console.log("📂 Deploying CaseRegistry...");
    const CaseRegistry = await ethers.getContractFactory("CaseRegistry");
    const caseRegistry = await CaseRegistry.deploy();
    await caseRegistry.waitForDeployment();
    const caseRegistryAddress = await caseRegistry.getAddress();
    console.log(`✅ CaseRegistry deployed at: ${caseRegistryAddress}\n`);

    // ===== Deploy EvidenceRegistry (needs CaseRegistry) =====
    console.log("🧾 Deploying EvidenceRegistry...");
    const EvidenceRegistry =
      await ethers.getContractFactory("EvidenceRegistry");
    const evidenceRegistry = await EvidenceRegistry.deploy(caseRegistryAddress);
    await evidenceRegistry.waitForDeployment();
    const evidenceRegistryAddress = await evidenceRegistry.getAddress();
    console.log(
      `✅ EvidenceRegistry deployed at: ${evidenceRegistryAddress}\n`,
    );

    // ===== Deploy ChainOfCustody =====
    console.log("🔗 Deploying ChainOfCustody...");
    const ChainOfCustody = await ethers.getContractFactory("ChainOfCustody");
    const chainOfCustody = await ChainOfCustody.deploy();
    await chainOfCustody.waitForDeployment();
    const chainOfCustodyAddress = await chainOfCustody.getAddress();
    console.log(`✅ ChainOfCustody deployed at: ${chainOfCustodyAddress}\n`);

    // ===== Deploy DocumentRegistry =====
    console.log("📝 Deploying DocumentRegistry...");
    const DocumentRegistry =
      await ethers.getContractFactory("DocumentRegistry");
    const documentRegistry = await DocumentRegistry.deploy();
    await documentRegistry.waitForDeployment();
    const registryAddress = await documentRegistry.getAddress();
    console.log(`✅ DocumentRegistry deployed at: ${registryAddress}\n`);

    // ===== Deploy DocumentAuditTrail =====
    console.log("📝 Deploying DocumentAuditTrail...");
    const DocumentAuditTrail =
      await ethers.getContractFactory("DocumentAuditTrail");
    const documentAuditTrail = await DocumentAuditTrail.deploy(registryAddress);
    await documentAuditTrail.waitForDeployment();
    const auditAddress = await documentAuditTrail.getAddress();
    console.log(`✅ DocumentAuditTrail deployed at: ${auditAddress}\n`);

    // ===== Basic sanity checks =====
    console.log("🔍 Running basic checks...");

    // DocumentRegistry round-trip
    const testCID = "QmTest123";
    const testHash = "0x1234567890abcdef";
    try {
      const tx = await documentRegistry.registerDocument(testCID, testHash);
      const receipt = await tx.wait();
      const log = receipt.logs
        .map((entry) => {
          try {
            return documentRegistry.interface.parseLog(entry);
          } catch (err) {
            return null;
          }
        })
        .find((e) => e && e.name === "DocumentRegistered");

      if (log) {
        console.log("✅ DocumentRegistry: registration event emitted");
        const docId = log.args[0];
        const doc = await documentRegistry.getDocument(docId);
        console.log(`   ↪ Stored CID: ${doc.cid}`);
      }
    } catch (error) {
      console.log(`⚠️  DocumentRegistry test failed: ${error.message}`);
    }

    // CaseRegistry + EvidenceRegistry path
    try {
      const caseId = ethers.id("case-1");
      const createTx = await caseRegistry.createCase(caseId, "CASE-001", []);
      await createTx.wait();
      console.log("✅ CaseRegistry: case created");

      const addEvTx = await evidenceRegistry.addEvidence(
        caseId,
        "ipfs://cid",
        "0xhash",
        "photo",
      );
      await addEvTx.wait();
      console.log("✅ EvidenceRegistry: evidence added");
    } catch (error) {
      console.log(`⚠️  Case/Evidence test failed: ${error.message}`);
    }

    // ChainOfCustody append
    try {
      const evidenceId = ethers.id("evidence-1");
      const tx = await chainOfCustody.addCustodyEntry(
        evidenceId,
        0, // Uploaded
        "registrar",
        "initial upload",
        "sig-hash",
      );
      await tx.wait();
      console.log("✅ ChainOfCustody: entry logged");
    } catch (error) {
      console.log(`⚠️  ChainOfCustody test failed: ${error.message}`);
    }

    // ===== Save Deployment Info =====
    const deploymentInfo = {
      accessControl: accessControlAddress,
      caseRegistry: caseRegistryAddress,
      evidenceRegistry: evidenceRegistryAddress,
      chainOfCustody: chainOfCustodyAddress,
      documentRegistry: registryAddress,
      documentAuditTrail: auditAddress,
      deployer: deployer.address,
      network: NETWORK_NAME,
      blockExplorer:
        NETWORK_NAME === "sepolia"
          ? "https://sepolia.etherscan.io"
          : "https://etherscan.io",
    };

    saveDeployment(deploymentInfo);

    // ===== Display Summary =====
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📦 DEPLOYMENT SUMMARY");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`Network:              ${NETWORK_NAME}`);
    console.log(`Deployer:             ${deployer.address}`);
    console.log(`AccessControl:        ${accessControlAddress}`);
    console.log(`CaseRegistry:         ${caseRegistryAddress}`);
    console.log(`EvidenceRegistry:     ${evidenceRegistryAddress}`);
    console.log(`ChainOfCustody:       ${chainOfCustodyAddress}`);
    console.log(`DocumentRegistry:     ${registryAddress}`);
    console.log(`DocumentAuditTrail:   ${auditAddress}`);
    console.log(
      "═══════════════════════════════════════════════════════════\n",
    );

    if (NETWORK_NAME === "sepolia") {
      console.log("🔗 Verify on Etherscan:");
      console.log(
        `   AccessControl:   https://sepolia.etherscan.io/address/${accessControlAddress}`,
      );
      console.log(
        `   CaseRegistry:    https://sepolia.etherscan.io/address/${caseRegistryAddress}`,
      );
      console.log(
        `   EvidenceRegistry:https://sepolia.etherscan.io/address/${evidenceRegistryAddress}`,
      );
      console.log(
        `   ChainOfCustody:  https://sepolia.etherscan.io/address/${chainOfCustodyAddress}`,
      );
      console.log(
        `   DocumentRegistry:https://sepolia.etherscan.io/address/${registryAddress}`,
      );
      console.log(
        `   AuditTrail:      https://sepolia.etherscan.io/address/${auditAddress}\n`,
      );
    }

    console.log("✅ Deployment completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("   1. Update your .env file with these addresses");
    console.log("   2. Verify contracts on Etherscan (optional)");
    console.log("   3. Integrate contracts with your backend/frontends\n");

    return deploymentInfo;
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    process.exit(1);
  }
}

main();
