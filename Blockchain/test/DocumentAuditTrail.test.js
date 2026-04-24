import { expect } from "chai";
import hre from "hardhat";

const { ethers, networkHelpers } = await hre.network.connect();

describe("DocumentAuditTrail", function () {
  let documentRegistry;
  let documentAuditTrail;
  let owner;
  let user1;
  let user2;
  let docId;

  beforeEach(async function () {
    // Deploy DocumentRegistry first
    const DocumentRegistry =
      await ethers.getContractFactory("DocumentRegistry");
    documentRegistry = await DocumentRegistry.deploy();
    await documentRegistry.waitForDeployment();

    // Deploy DocumentAuditTrail with registry address
    const DocumentAuditTrail =
      await ethers.getContractFactory("DocumentAuditTrail");
    documentAuditTrail = await DocumentAuditTrail.deploy(
      await documentRegistry.getAddress(),
    );
    await documentAuditTrail.waitForDeployment();

    [owner, user1, user2] = await ethers.getSigners();

    // Register a test document
    const tx = await documentRegistry
      .connect(user1)
      .registerDocument("QmTest123", "0x1234567890abcdef");
    const receipt = await tx.wait();
    const event = receipt.logs
      .map((log) => documentRegistry.interface.parseLog(log))
      .find((e) => e?.name === "DocumentRegistered");

    docId = event.args[0];
  });

  describe("Deployment", function () {
    it("Should deploy successfully with registry address", async function () {
      expect(await documentAuditTrail.getAddress()).to.be.properAddress;
    });

    it("Should reject zero address for registry", async function () {
      const DocumentAuditTrail =
        await ethers.getContractFactory("DocumentAuditTrail");

      await expect(
        DocumentAuditTrail.deploy(ethers.ZeroAddress),
      ).to.be.revertedWith("Registry required");
    });

    it("Should store correct registry address", async function () {
      const registryAddress = await documentAuditTrail.registry();
      expect(registryAddress).to.equal(await documentRegistry.getAddress());
    });
  });

  describe("logEvent", function () {
    it("Should log an event for registered document", async function () {
      const action = 0; // Uploaded
      const details = "Document uploaded successfully";

      await expect(
        documentAuditTrail.connect(user1).logEvent(docId, action, details),
      )
        .to.emit(documentAuditTrail, "AuditLogged")
        .withArgs(
          docId,
          action,
          user1.address,
          (timestamp) => typeof timestamp === "bigint",
          details,
        );
    });

    it("Should reject event for non-registered document", async function () {
      const fakeDocId = ethers.ZeroHash;
      const action = 0; // Uploaded
      const details = "Attempted upload";

      await expect(
        documentAuditTrail.connect(user1).logEvent(fakeDocId, action, details),
      ).to.be.revertedWith("Doc not registered");
    });

    it("Should log different action types", async function () {
      const actions = [
        { value: 0, name: "Uploaded" },
        { value: 1, name: "Viewed" },
        { value: 2, name: "Downloaded" },
        { value: 3, name: "Verified" },
        { value: 4, name: "Deleted" },
        { value: 5, name: "Custom" },
      ];

      for (const action of actions) {
        await expect(
          documentAuditTrail
            .connect(user1)
            .logEvent(docId, action.value, `Action: ${action.name}`),
        )
          .to.emit(documentAuditTrail, "AuditLogged")
          .withArgs(
            docId,
            action.value,
            user1.address,
            (timestamp) => typeof timestamp === "bigint",
            `Action: ${action.name}`,
          );
      }
    });

    it("Should allow multiple events from different actors", async function () {
      const action1 = 0; // Uploaded
      const action2 = 1; // Viewed

      await documentAuditTrail
        .connect(user1)
        .logEvent(docId, action1, "User1 uploaded");
      await documentAuditTrail
        .connect(user2)
        .logEvent(docId, action2, "User2 viewed");

      expect(await documentAuditTrail.getEventsCount(docId)).to.equal(2);
    });

    it("Should record actor address correctly", async function () {
      const action = 2; // Downloaded
      const details = "Downloaded by user1";

      const tx = await documentAuditTrail
        .connect(user1)
        .logEvent(docId, action, details);
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log) => documentAuditTrail.interface.parseLog(log))
        .find((e) => e?.name === "AuditLogged");

      expect(event.args.actor).to.equal(user1.address);
    });

    it("Should allow empty details string", async function () {
      const action = 0; // Uploaded
      const details = "";

      await expect(
        documentAuditTrail.connect(user1).logEvent(docId, action, details),
      )
        .to.emit(documentAuditTrail, "AuditLogged")
        .withArgs(
          docId,
          action,
          user1.address,
          (timestamp) => typeof timestamp === "bigint",
          details,
        );
    });

    it("Should handle long details string", async function () {
      const action = 5; // Custom
      const longDetails = "A".repeat(500);

      await expect(
        documentAuditTrail.connect(user1).logEvent(docId, action, longDetails),
      )
        .to.emit(documentAuditTrail, "AuditLogged")
        .withArgs(
          docId,
          action,
          user1.address,
          (timestamp) => typeof timestamp === "bigint",
          longDetails,
        );
    });
  });

  describe("getEvents", function () {
    it("Should return empty array for document with no events", async function () {
      const anotherDocTx = await documentRegistry
        .connect(user2)
        .registerDocument("QmAnother", "0xabcdefabcdef");
      const anotherDocReceipt = await anotherDocTx.wait();
      const anotherDocEvent = anotherDocReceipt.logs
        .map((log) => documentRegistry.interface.parseLog(log))
        .find((e) => e?.name === "DocumentRegistered");
      const anotherDocId = anotherDocEvent.args[0];

      const events = await documentAuditTrail.getEvents(anotherDocId);
      expect(events.length).to.equal(0);
    });

    it("Should return all logged events for a document", async function () {
      await documentAuditTrail.connect(user1).logEvent(docId, 0, "Uploaded");
      await documentAuditTrail.connect(user2).logEvent(docId, 1, "Viewed");
      await documentAuditTrail.connect(user1).logEvent(docId, 2, "Downloaded");

      const events = await documentAuditTrail.getEvents(docId);
      expect(events.length).to.equal(3);
    });

    it("Should preserve event order", async function () {
      const actions = [0, 1, 2, 3];

      for (const action of actions) {
        await documentAuditTrail
          .connect(user1)
          .logEvent(docId, action, `Action ${action}`);
      }

      const events = await documentAuditTrail.getEvents(docId);

      for (let i = 0; i < actions.length; i++) {
        expect(events[i].action).to.equal(actions[i]);
      }
    });

    it("Should include correct event details", async function () {
      const details = "Test document verification";
      await documentAuditTrail.connect(user1).logEvent(docId, 3, details);

      const events = await documentAuditTrail.getEvents(docId);

      expect(events[0].docId).to.equal(docId);
      expect(events[0].action).to.equal(3);
      expect(events[0].actor).to.equal(user1.address);
      expect(events[0].details).to.equal(details);
    });

    it("Should include correct timestamps", async function () {
      const blockNumberBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumberBefore);

      await documentAuditTrail.connect(user1).logEvent(docId, 0, "Test");

      const blockNumberAfter = await ethers.provider.getBlockNumber();
      const blockAfter = await ethers.provider.getBlock(blockNumberAfter);

      const events = await documentAuditTrail.getEvents(docId);

      expect(events[0].timestamp).to.be.greaterThanOrEqual(
        blockBefore.timestamp,
      );
      expect(events[0].timestamp).to.be.lessThanOrEqual(blockAfter.timestamp);
    });
  });

  describe("getEventsCount", function () {
    it("Should return 0 for document with no events", async function () {
      const anotherDocTx = await documentRegistry
        .connect(user2)
        .registerDocument("QmAnother", "0xabcdefabcdef");
      const anotherDocReceipt = await anotherDocTx.wait();
      const anotherDocEvent = anotherDocReceipt.logs
        .map((log) => documentRegistry.interface.parseLog(log))
        .find((e) => e?.name === "DocumentRegistered");
      const anotherDocId = anotherDocEvent.args[0];

      const count = await documentAuditTrail.getEventsCount(anotherDocId);
      expect(count).to.equal(0);
    });

    it("Should return correct event count", async function () {
      await documentAuditTrail.connect(user1).logEvent(docId, 0, "Event 1");
      await documentAuditTrail.connect(user1).logEvent(docId, 1, "Event 2");
      await documentAuditTrail.connect(user1).logEvent(docId, 2, "Event 3");

      const count = await documentAuditTrail.getEventsCount(docId);
      expect(count).to.equal(3);
    });

    it("Should update count after new events", async function () {
      expect(await documentAuditTrail.getEventsCount(docId)).to.equal(0);

      await documentAuditTrail.connect(user1).logEvent(docId, 0, "Event 1");
      expect(await documentAuditTrail.getEventsCount(docId)).to.equal(1);

      await documentAuditTrail.connect(user1).logEvent(docId, 1, "Event 2");
      expect(await documentAuditTrail.getEventsCount(docId)).to.equal(2);
    });

    it("Should handle large number of events", async function () {
      const eventCount = 100;

      for (let i = 0; i < eventCount; i++) {
        await documentAuditTrail
          .connect(user1)
          .logEvent(docId, i % 6, `Event ${i}`);
      }

      const count = await documentAuditTrail.getEventsCount(docId);
      expect(count).to.equal(eventCount);
    });
  });

  describe("Integration scenarios", function () {
    it("Should create complete audit trail for document lifecycle", async function () {
      // Simulate document lifecycle
      await documentAuditTrail
        .connect(user1)
        .logEvent(docId, 0, "Document uploaded to IPFS");
      await documentAuditTrail
        .connect(user2)
        .logEvent(docId, 1, "Document viewed");
      await documentAuditTrail
        .connect(user2)
        .logEvent(docId, 2, "Document downloaded");
      await documentAuditTrail
        .connect(user1)
        .logEvent(docId, 3, "Document verified by uploader");

      const events = await documentAuditTrail.getEvents(docId);
      const count = await documentAuditTrail.getEventsCount(docId);

      expect(count).to.equal(4);
      expect(events[0].action).to.equal(0); // Uploaded
      expect(events[1].action).to.equal(1); // Viewed
      expect(events[2].action).to.equal(2); // Downloaded
      expect(events[3].action).to.equal(3); // Verified
    });

    it("Should maintain separate audit trails for different documents", async function () {
      const doc2Tx = await documentRegistry
        .connect(user1)
        .registerDocument("QmDoc2", "0x5678567856785678");
      const doc2Receipt = await doc2Tx.wait();
      const doc2Event = doc2Receipt.logs
        .map((log) => documentRegistry.interface.parseLog(log))
        .find((e) => e?.name === "DocumentRegistered");
      const docId2 = doc2Event.args[0];

      // Log events for first document
      await documentAuditTrail
        .connect(user1)
        .logEvent(docId, 0, "Doc1 uploaded");
      await documentAuditTrail.connect(user1).logEvent(docId, 1, "Doc1 viewed");

      // Log events for second document
      await documentAuditTrail
        .connect(user2)
        .logEvent(docId2, 0, "Doc2 uploaded");

      const events1 = await documentAuditTrail.getEvents(docId);
      const events2 = await documentAuditTrail.getEvents(docId2);

      expect(events1.length).to.equal(2);
      expect(events2.length).to.equal(1);
    });
  });
});
