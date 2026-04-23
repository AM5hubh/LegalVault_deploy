import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log(
    "Deploying all contracts (cases, evidence, docs, custody, access)...\n",
  );

  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with:", deployer.address);
    console.log("Balance:", (await deployer.getBalance()).toString());

    // AccessControl
    console.log("1) Deploying AccessControl...");
    const AccessControl = await hre.ethers.getContractFactory("AccessControl");
    const accessControl = await AccessControl.deploy();
    await accessControl.waitForDeployment();
    const accessControlAddress = await accessControl.getAddress();
    console.log("   ↪", accessControlAddress);

    // CaseRegistry
    console.log("2) Deploying CaseRegistry...");
    const CaseRegistry = await hre.ethers.getContractFactory("CaseRegistry");
    const caseRegistry = await CaseRegistry.deploy();
    await caseRegistry.waitForDeployment();
    const caseRegistryAddress = await caseRegistry.getAddress();
    console.log("   ↪", caseRegistryAddress);

    // EvidenceRegistry (needs case registry)
    console.log("3) Deploying EvidenceRegistry...");
    const EvidenceRegistry =
      await hre.ethers.getContractFactory("EvidenceRegistry");
    const evidenceRegistry = await EvidenceRegistry.deploy(caseRegistryAddress);
    await evidenceRegistry.waitForDeployment();
    const evidenceRegistryAddress = await evidenceRegistry.getAddress();
    console.log("   ↪", evidenceRegistryAddress);

    // ChainOfCustody
    console.log("4) Deploying ChainOfCustody...");
    const ChainOfCustody =
      await hre.ethers.getContractFactory("ChainOfCustody");
    const chainOfCustody = await ChainOfCustody.deploy();
    await chainOfCustody.waitForDeployment();
    const chainOfCustodyAddress = await chainOfCustody.getAddress();
    console.log("   ↪", chainOfCustodyAddress);

    // DocumentRegistry
    console.log("5) Deploying DocumentRegistry...");
    const DocumentRegistry =
      await hre.ethers.getContractFactory("DocumentRegistry");
    const documentRegistry = await DocumentRegistry.deploy();
    await documentRegistry.waitForDeployment();
    const documentRegistryAddress = await documentRegistry.getAddress();
    console.log("   ↪", documentRegistryAddress);

    // DocumentAuditTrail (needs document registry)
    console.log("6) Deploying DocumentAuditTrail...");
    const DocumentAuditTrail =
      await hre.ethers.getContractFactory("DocumentAuditTrail");
    const documentAuditTrail = await DocumentAuditTrail.deploy(
      documentRegistryAddress,
    );
    await documentAuditTrail.waitForDeployment();
    const documentAuditTrailAddress = await documentAuditTrail.getAddress();
    console.log("   ↪", documentAuditTrailAddress);

    const deploymentInfo = {
      accessControl: accessControlAddress,
      caseRegistry: caseRegistryAddress,
      evidenceRegistry: evidenceRegistryAddress,
      chainOfCustody: chainOfCustodyAddress,
      documentRegistry: documentRegistryAddress,
      documentAuditTrail: documentAuditTrailAddress,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      network: hre.network.name,
    };

    console.log("\n=== Deployment Complete ===");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    const deploymentsPath = path.join(__dirname, "../deployments.json");
    let existingDeployments = {};
    if (fs.existsSync(deploymentsPath)) {
      existingDeployments = JSON.parse(
        fs.readFileSync(deploymentsPath, "utf8"),
      );
    }
    existingDeployments[hre.network.name] = deploymentInfo;
    fs.writeFileSync(
      deploymentsPath,
      JSON.stringify(existingDeployments, null, 2),
    );
    console.log("\nDeployment addresses saved to deployments.json");

    // Quick smoke tests
    console.log("\n=== Smoke Tests ===");
    try {
      const caseId = hre.ethers.id("case-smoke");
      await (await caseRegistry.createCase(caseId, "CASE-SMOKE", [])).wait();
      await (
        await evidenceRegistry.addEvidence(
          caseId,
          "ipfs://smoke",
          "0xhash",
          "doc",
        )
      ).wait();
      console.log("✓ Case & evidence path ok");
    } catch (err) {
      console.log("⚠️  Case/Evidence smoke failed:", err.message);
    }

    try {
      const docTx = await documentRegistry.registerDocument("QmSmoke", "0xdoc");
      const receipt = await docTx.wait();
      const log = receipt.logs
        .map((l) => {
          try {
            return documentRegistry.interface.parseLog(l);
          } catch (e) {
            return null;
          }
        })
        .find((e) => e && e.name === "DocumentRegistered");
      if (log) {
        await (
          await documentAuditTrail.logEvent(log.args[0], 0, "smoke upload")
        ).wait();
        console.log("✓ Document registry/audit path ok");
      }
    } catch (err) {
      console.log("⚠️  Document smoke failed:", err.message);
    }

    try {
      await (
        await chainOfCustody.addCustodyEntry(
          hre.ethers.id("evidence-smoke"),
          0,
          "registrar",
          "smoke",
          "sig",
        )
      ).wait();
      console.log("✓ ChainOfCustody path ok");
    } catch (err) {
      console.log("⚠️  Custody smoke failed:", err.message);
    }
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

main();
