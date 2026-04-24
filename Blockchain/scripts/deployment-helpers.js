import * as fs from "fs";
import * as path from "path";

const DEPLOYMENT_FILE = path.resolve("./deployments.json");

/**
 * Get deployment addresses for a specific network
 * @param {string} network - Network name (sepolia, localhost, etc.)
 * @returns {object} Deployment addresses
 */
export function getDeploymentAddresses(network = "sepolia") {
  if (!fs.existsSync(DEPLOYMENT_FILE)) {
    throw new Error(`Deployment file not found: ${DEPLOYMENT_FILE}`);
  }

  const data = fs.readFileSync(DEPLOYMENT_FILE, "utf8");
  const deployments = JSON.parse(data);

  if (!deployments[network]) {
    throw new Error(`No deployment found for network: ${network}`);
  }

  return deployments[network];
}

/**
 * Get specific contract address
 * @param {string} contractName - Name of contract (documentRegistry, documentAuditTrail, etc.)
 * @param {string} network - Network name
 * @returns {string} Contract address
 */
export function getContractAddress(contractName, network = "sepolia") {
  const deployments = getDeploymentAddresses(network);

  const addressKey = Object.keys(deployments).find((key) =>
    key.toLowerCase().includes(contractName.toLowerCase()),
  );

  if (!addressKey) {
    throw new Error(`Contract not found: ${contractName}`);
  }

  return deployments[addressKey];
}

/**
 * Get all deployments
 * @returns {object} All deployments
 */
export function getAllDeployments() {
  if (!fs.existsSync(DEPLOYMENT_FILE)) {
    return {};
  }

  const data = fs.readFileSync(DEPLOYMENT_FILE, "utf8");
  return JSON.parse(data);
}

/**
 * Check if a contract is deployed
 * @param {string} network - Network name
 * @returns {boolean} True if deployment exists
 */
export function isDeployed(network = "sepolia") {
  if (!fs.existsSync(DEPLOYMENT_FILE)) {
    return false;
  }

  const data = fs.readFileSync(DEPLOYMENT_FILE, "utf8");
  const deployments = JSON.parse(data);

  return !!deployments[network];
}

/**
 * Print deployment info to console
 * @param {string} network - Network name
 */
export function printDeploymentInfo(network = "sepolia") {
  try {
    const deployment = getDeploymentAddresses(network);

    console.log(
      "\n═══════════════════════════════════════════════════════════",
    );
    console.log(`📦 DEPLOYMENT INFO (${network})`);
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`Deployer:             ${deployment.deployer}`);
    if (deployment.accessControl)
      console.log(`AccessControl:        ${deployment.accessControl}`);
    if (deployment.caseRegistry)
      console.log(`CaseRegistry:         ${deployment.caseRegistry}`);
    if (deployment.evidenceRegistry)
      console.log(`EvidenceRegistry:     ${deployment.evidenceRegistry}`);
    if (deployment.chainOfCustody)
      console.log(`ChainOfCustody:       ${deployment.chainOfCustody}`);
    if (deployment.documentRegistry)
      console.log(`DocumentRegistry:     ${deployment.documentRegistry}`);
    if (deployment.documentAuditTrail)
      console.log(`DocumentAuditTrail:   ${deployment.documentAuditTrail}`);
    console.log(`Timestamp:            ${deployment.timestamp}`);
    console.log(
      "═══════════════════════════════════════════════════════════\n",
    );

    if (network === "sepolia") {
      console.log("🔗 Etherscan Links:");
      if (deployment.accessControl)
        console.log(
          `   AccessControl: https://sepolia.etherscan.io/address/${deployment.accessControl}`,
        );
      if (deployment.caseRegistry)
        console.log(
          `   CaseRegistry:  https://sepolia.etherscan.io/address/${deployment.caseRegistry}`,
        );
      if (deployment.evidenceRegistry)
        console.log(
          `   EvidenceRegistry: https://sepolia.etherscan.io/address/${deployment.evidenceRegistry}`,
        );
      if (deployment.chainOfCustody)
        console.log(
          `   ChainOfCustody:   https://sepolia.etherscan.io/address/${deployment.chainOfCustody}`,
        );
      if (deployment.documentRegistry)
        console.log(
          `   DocumentRegistry:https://sepolia.etherscan.io/address/${deployment.documentRegistry}`,
        );
      if (deployment.documentAuditTrail)
        console.log(
          `   AuditTrail:    https://sepolia.etherscan.io/address/${deployment.documentAuditTrail}\n`,
        );
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Example usage
if (process.argv[1].includes("deployment-helpers")) {
  const network = process.argv[2] || "sepolia";

  try {
    printDeploymentInfo(network);
  } catch (error) {
    console.error(`\n❌ ${error.message}`);
    process.exit(1);
  }
}
