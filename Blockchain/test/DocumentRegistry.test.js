import { expect } from "chai";
import hre from "hardhat";

const { ethers, networkHelpers } = await hre.network.connect();

describe("DocumentRegistry", function () {
  let documentRegistry;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    const DocumentRegistry =
      await ethers.getContractFactory("DocumentRegistry");
    documentRegistry = await DocumentRegistry.deploy();
    await documentRegistry.waitForDeployment();

    [owner, user1, user2] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await documentRegistry.getAddress()).to.be.properAddress;
    });
  });

  describe("registerDocument", function () {
    it("Should register a document with valid CID and hash", async function () {
      const cid = "QmTest123";
      const fileHash = "0x1234567890abcdef";

      const tx = await documentRegistry
        .connect(user1)
        .registerDocument(cid, fileHash);
      const receipt = await tx.wait();

      expect(tx).to.emit(documentRegistry, "DocumentRegistered");
    });

    it("Should reject empty CID", async function () {
      const cid = "";
      const fileHash = "0x1234567890abcdef";

      await expect(
        documentRegistry.connect(user1).registerDocument(cid, fileHash),
      ).to.be.revertedWith("CID required");
    });

    it("Should reject empty file hash", async function () {
      const cid = "QmTest123";
      const fileHash = "";

      await expect(
        documentRegistry.connect(user1).registerDocument(cid, fileHash),
      ).to.be.revertedWith("Hash required");
    });

    it("Should allow same document content at different times", async function () {
      const cid = "QmTest123";
      const fileHash = "0x1234567890abcdef";

      const doc1Tx = await documentRegistry
        .connect(user1)
        .registerDocument(cid, fileHash);
      const doc1Receipt = await doc1Tx.wait();
      const doc1Event = doc1Receipt.logs
        .map((log) => documentRegistry.interface.parseLog(log))
        .find((e) => e?.name === "DocumentRegistered");
      const docId1 = doc1Event.args[0];

      // Mine a new block to change timestamp
      await ethers.provider.send("evm_mine", []);

      const doc2Tx = await documentRegistry
        .connect(user1)
        .registerDocument(cid, fileHash);
      const doc2Receipt = await doc2Tx.wait();
      const doc2Event = doc2Receipt.logs
        .map((log) => documentRegistry.interface.parseLog(log))
        .find((e) => e?.name === "DocumentRegistered");
      const docId2 = doc2Event.args[0];

      // Different timestamps result in different docIds
      expect(docId1).to.not.equal(docId2);
    });

    it("Should return a unique docId for each document", async function () {
      const cid1 = "QmTest123";
      const fileHash1 = "0x1111111111111111";

      const tx1 = await documentRegistry
        .connect(user1)
        .registerDocument(cid1, fileHash1);
      const receipt1 = await tx1.wait();
      const event1 = receipt1.logs
        .map((log) => documentRegistry.interface.parseLog(log))
        .find((e) => e?.name === "DocumentRegistered");

      const cid2 = "QmTest456";
      const fileHash2 = "0x2222222222222222";

      const tx2 = await documentRegistry
        .connect(user2)
        .registerDocument(cid2, fileHash2);
      const receipt2 = await tx2.wait();
      const event2 = receipt2.logs
        .map((log) => documentRegistry.interface.parseLog(log))
        .find((e) => e?.name === "DocumentRegistered");

      expect(event1.args[0]).to.not.equal(event2.args[0]);
    });

    it("Should set correct uploader address", async function () {
      const cid = "QmTest123";
      const fileHash = "0x1234567890abcdef";

      const tx = await documentRegistry
        .connect(user1)
        .registerDocument(cid, fileHash);
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log) => documentRegistry.interface.parseLog(log))
        .find((e) => e?.name === "DocumentRegistered");

      expect(event.args.uploader).to.equal(user1.address);
    });

    it("Should emit DocumentRegistered event with correct parameters", async function () {
      const cid = "QmTest123";
      const fileHash = "0x1234567890abcdef";

      await expect(
        documentRegistry.connect(user1).registerDocument(cid, fileHash),
      )
        .to.emit(documentRegistry, "DocumentRegistered")
        .withArgs(
          (docId) => typeof docId === "string",
          cid,
          fileHash,
          user1.address,
          (timestamp) => typeof timestamp === "bigint",
        );
    });
  });

  describe("getDocument", function () {
    let docId;

    beforeEach(async function () {
      const cid = "QmTest123";
      const fileHash = "0x1234567890abcdef";

      const tx = await documentRegistry
        .connect(user1)
        .registerDocument(cid, fileHash);
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log) => documentRegistry.interface.parseLog(log))
        .find((e) => e?.name === "DocumentRegistered");

      docId = event.args[0];
    });

    it("Should retrieve registered document", async function () {
      const doc = await documentRegistry.getDocument(docId);

      expect(doc.cid).to.equal("QmTest123");
      expect(doc.fileHash).to.equal("0x1234567890abcdef");
      expect(doc.uploader).to.equal(user1.address);
    });

    it("Should include correct timestamp", async function () {
      const doc = await documentRegistry.getDocument(docId);

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);

      expect(doc.timestamp).to.be.closeTo(block.timestamp, 10);
    });

    it("Should throw for non-existent document", async function () {
      const fakeDocId = ethers.ZeroHash;

      await expect(documentRegistry.getDocument(fakeDocId)).to.be.revertedWith(
        "Not found",
      );
    });
  });

  describe("exists", function () {
    let docId;

    beforeEach(async function () {
      const cid = "QmTest123";
      const fileHash = "0x1234567890abcdef";

      const tx = await documentRegistry
        .connect(user1)
        .registerDocument(cid, fileHash);
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log) => documentRegistry.interface.parseLog(log))
        .find((e) => e?.name === "DocumentRegistered");

      docId = event.args[0];
    });

    it("Should return true for existing document", async function () {
      const exists = await documentRegistry.exists(docId);
      expect(exists).to.be.true;
    });

    it("Should return false for non-existent document", async function () {
      const fakeDocId = ethers.ZeroHash;
      const exists = await documentRegistry.exists(fakeDocId);
      expect(exists).to.be.false;
    });
  });

  describe("Multiple documents", function () {
    it("Should handle multiple documents from same user", async function () {
      const doc1Result = await documentRegistry
        .connect(user1)
        .registerDocument("QmDoc1", "0x1111111111111111");
      const receipt1 = await doc1Result.wait();
      const event1 = receipt1.logs
        .map((log) => documentRegistry.interface.parseLog(log))
        .find((e) => e?.name === "DocumentRegistered");
      const docId1 = event1.args[0];

      const doc2Result = await documentRegistry
        .connect(user1)
        .registerDocument("QmDoc2", "0x2222222222222222");
      const receipt2 = await doc2Result.wait();
      const event2 = receipt2.logs
        .map((log) => documentRegistry.interface.parseLog(log))
        .find((e) => e?.name === "DocumentRegistered");
      const docId2 = event2.args[0];

      expect(docId1).to.not.equal(docId2);

      const retrievedDoc1 = await documentRegistry.getDocument(docId1);
      const retrievedDoc2 = await documentRegistry.getDocument(docId2);

      expect(retrievedDoc1.cid).to.equal("QmDoc1");
      expect(retrievedDoc2.cid).to.equal("QmDoc2");
    });

    it("Should allow same CID from different users", async function () {
      const sameCid = "QmSame123";

      const doc1Result = await documentRegistry
        .connect(user1)
        .registerDocument(sameCid, "0x1111111111111111");
      const doc1Receipt = await doc1Result.wait();
      expect(doc1Receipt).to.not.be.null;

      const doc2Result = await documentRegistry
        .connect(user2)
        .registerDocument(sameCid, "0x2222222222222222");
      const doc2Receipt = await doc2Result.wait();
      expect(doc2Receipt).to.not.be.null;
    });
  });
});
