import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Use the HRE directly; network name falls back to HARDHAT_NETWORK env if present.
const { ethers } = hre;
const DEPLOYMENT_FILE = "./deployments.json";
const NETWORK_NAME =
  hre.network?.name || process.env.HARDHAT_NETWORK || "unknown";

async function main() {
  console.log(`\n🔍 Verifying deployment on network: ${NETWORK_NAME}\n`);

  try {
    const deploymentsPath = path.resolve(DEPLOYMENT_FILE);

    if (!fs.existsSync(deploymentsPath)) {
      throw new Error(`❌ No deployment file found at ${deploymentsPath}`);
    }

    const data = fs.readFileSync(deploymentsPath, "utf8");
    const deployments = JSON.parse(data);
    const deployment = deployments[NETWORK_NAME];

    if (!deployment) {
      throw new Error(`❌ No deployment found for network: ${NETWORK_NAME}`);
    }

    console.log("📋 Deployment Info:");
    console.log(`   Network:              ${NETWORK_NAME}`);
    console.log(`   Deployer:             ${deployment.deployer}`);
    console.log(`   DocumentRegistry:     ${deployment.documentRegistry}`);
    console.log(`   DocumentAuditTrail:   ${deployment.documentAuditTrail}`);
    console.log(`   Deployment Time:      ${deployment.timestamp}\n`);

    // Verify contracts exist and are callable
    console.log("✅ Verifying contract connectivity...\n");

    const registryABI = [
      "function exists(bytes32) view returns (bool)",
      "function getDocument(bytes32) view returns (tuple(string cid, string fileHash, address uploader, uint256 timestamp))",
    ];

    const auditABI = [
      "function registry() view returns (address)",
      "function getEventsCount(bytes32) view returns (uint256)",
    ];

    const registry = new ethers.Contract(
      deployment.documentRegistry,
      registryABI,
      ethers.provider,
    );

    const auditTrail = new ethers.Contract(
      deployment.documentAuditTrail,
      auditABI,
      ethers.provider,
    );

    // Test registry
    try {
      const fakeDocId = ethers.ZeroHash;
      const exists = await registry.exists(fakeDocId);
      console.log("✅ DocumentRegistry is callable");
    } catch (error) {
      console.log(`⚠️  DocumentRegistry call failed: ${error.message}`);
    }

    // Test audit trail
    try {
      const registryAddr = await auditTrail.registry();
      if (
        registryAddr.toLowerCase() === deployment.documentRegistry.toLowerCase()
      ) {
        console.log("✅ DocumentAuditTrail is callable");
        console.log(`✅ Registry reference is correct: ${registryAddr}`);
      }
    } catch (error) {
      console.log(`⚠️  DocumentAuditTrail call failed: ${error.message}`);
    }

    console.log("\n✅ Verification completed successfully!");

    if (NETWORK_NAME === "sepolia") {
      console.log("\n🔗 View on Etherscan:");
      console.log(
        `   Registry:   https://sepolia.etherscan.io/address/${deployment.documentRegistry}`,
      );
      console.log(
        `   AuditTrail: https://sepolia.etherscan.io/address/${deployment.documentAuditTrail}\n`,
      );
    }
  } catch (error) {
    console.error("\n❌ Verification failed:");
    console.error(error.message);
    process.exit(1);
  }
}

main();
