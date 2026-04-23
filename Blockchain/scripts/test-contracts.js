import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

const { ethers } = await hre.network.connect();
const DEPLOYMENT_FILE = "./deployments.json";
const NETWORK_NAME = hre.network.name;

async function main() {
  console.log(`\n🧪 Testing contracts on network: ${NETWORK_NAME}\n`);

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

    const [signer] = await ethers.getSigners();

    // Get contract instances
    const DocumentRegistry =
      await ethers.getContractFactory("DocumentRegistry");
    const registry = DocumentRegistry.attach(deployment.documentRegistry);

    const DocumentAuditTrail =
      await ethers.getContractFactory("DocumentAuditTrail");
    const auditTrail = DocumentAuditTrail.attach(deployment.documentAuditTrail);

    console.log("📣 Running contract tests...\n");

    // Test 1: Register a document
    console.log("Test 1️⃣ : Register a document on DocumentRegistry");
    const testCID = "QmExampleCID123456789";
    const testHash =
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd";

    try {
      const tx = await registry.registerDocument(testCID, testHash);
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log) => {
          try {
            return registry.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e) => e?.name === "DocumentRegistered");

      if (event) {
        const docId = event.args[0];
        console.log(`   ✅ Document registered successfully`);
        console.log(`   📄 Document ID: ${docId}`);
        console.log(`   📍 CID: ${testCID}`);
        console.log(`   🔐 Hash: ${testHash}\n`);

        // Test 2: Log an audit event
        console.log("Test 2️⃣ : Log an audit event on DocumentAuditTrail");
        try {
          const auditTx = await auditTrail.logEvent(
            docId,
            0, // Action: Uploaded
            "Document uploaded and verified",
          );
          const auditReceipt = await auditTx.wait();
          console.log(`   ✅ Audit event logged successfully\n`);

          // Test 3: Retrieve events
          console.log("Test 3️⃣ : Retrieve audit events");
          const eventCount = await auditTrail.getEventsCount(docId);
          console.log(`   ✅ Event count: ${eventCount}`);

          const events = await auditTrail.getEvents(docId);
          console.log(`   ✅ Retrieved ${events.length} event(s):`);
          events.forEach((evt, idx) => {
            console.log(`      Event ${idx + 1}:`);
            console.log(`        - Action: ${evt.action}`);
            console.log(`        - Actor: ${evt.actor}`);
            console.log(`        - Details: ${evt.details}`);
          });
          console.log();

          // Test 4: Retrieve document
          console.log("Test 4️⃣ : Retrieve document from registry");
          const doc = await registry.getDocument(docId);
          console.log(`   ✅ Document retrieved successfully:`);
          console.log(`        - CID: ${doc.cid}`);
          console.log(`        - Hash: ${doc.fileHash}`);
          console.log(`        - Uploader: ${doc.uploader}`);
          console.log(`        - Timestamp: ${doc.timestamp}`);
          console.log();

          // Test 5: Check existence
          console.log("Test 5️⃣ : Check document existence");
          const exists = await registry.exists(docId);
          console.log(`   ✅ Document exists: ${exists}\n`);

          console.log(
            "═══════════════════════════════════════════════════════════",
          );
          console.log("✅ All tests passed successfully!");
          console.log(
            "═══════════════════════════════════════════════════════════\n",
          );
        } catch (auditError) {
          console.log(`   ❌ Audit event test failed: ${auditError.message}\n`);
        }
      } else {
        console.log(`   ❌ No DocumentRegistered event found\n`);
      }
    } catch (registryError) {
      console.log(`   ❌ Registration test failed: ${registryError.message}\n`);
    }
  } catch (error) {
    console.error("\n❌ Contract test failed:");
    console.error(error.message);
    process.exit(1);
  }
}

main();
