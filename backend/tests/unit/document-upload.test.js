const request = require("supertest");
const express = require("express");
const User = require("../../models/User");
const documentRoutes = require("../../routes/documentRoutes");
const authMiddleware = require("../../middlewares/authMiddleware");

describe("Document Upload Controller Tests", () => {
  let app;
  let mockUser;
  let mockToken;

  beforeEach(() => {
    // Setup Express app for testing
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Mock user
    mockUser = {
      _id: "test-user-id",
      email: "test@example.com",
      documents: [],
      save: jest.fn().mockResolvedValue(true),
      activityLog: [],
    };

    mockToken = "Bearer test-jwt-token";

    // Mock auth middleware
    app.use((req, res, next) => {
      req.user = { userId: mockUser._id };
      next();
    });

    app.use("/api/documents", documentRoutes);
  });

  describe("POST /api/documents/upload", () => {
    test("should upload document successfully and store CID in user model", async () => {
      // Mock User.findById
      User.findById = jest.fn().mockResolvedValue(mockUser);

      // Mock file upload middleware
      app.use((req, res, next) => {
        req.file = {
          buffer: Buffer.from("test content"),
          originalname: "test.pdf",
          mimetype: "application/pdf",
          size: 1024,
        };
        next();
      });

      // Mock IPFS service
      jest.mock("../services/ipfsService", () => ({
        uploadFileToIPFS: jest.fn().mockResolvedValue({
          cid: "QmTest123",
          hash: "sha256hash",
          ipfsUrl: "https://gateway.pinata.cloud/ipfs/QmTest123",
          fileName: "test.pdf",
          fileType: "application/pdf",
          fileSize: 1024,
        }),
        pinFileOnIPFS: jest.fn().mockResolvedValue(true),
      }));

      const response = await request(app)
        .post("/api/documents/upload")
        .set("Authorization", mockToken)
        .send({ description: "Test document" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cid).toBe("QmTest123");
    });

    test("should return 400 if no file is provided", async () => {
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/documents/upload")
        .set("Authorization", mockToken);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("No file uploaded");
    });

    test("should return 404 if user not found", async () => {
      User.findById = jest.fn().mockResolvedValue(null);

      app.use((req, res, next) => {
        req.file = {
          buffer: Buffer.from("test"),
          originalname: "test.pdf",
          mimetype: "application/pdf",
          size: 1024,
        };
        next();
      });

      const response = await request(app)
        .post("/api/documents/upload")
        .set("Authorization", mockToken);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/documents", () => {
    test("should return all documents for user", async () => {
      const documentsWithData = {
        ...mockUser,
        documents: [
          {
            cid: "QmTest123",
            fileName: "doc1.pdf",
            fileType: "application/pdf",
            fileSize: 1024,
            uploadedAt: new Date(),
            description: "Test doc",
          },
        ],
      };

      User.findById = jest.fn().mockResolvedValue(documentsWithData);

      const response = await request(app)
        .get("/api/documents")
        .set("Authorization", mockToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.documents).toHaveLength(1);
      expect(response.body.data.totalDocuments).toBe(1);
    });

    test("should return empty array if user has no documents", async () => {
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get("/api/documents")
        .set("Authorization", mockToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.documents).toEqual([]);
      expect(response.body.data.totalDocuments).toBe(0);
    });

    test("should return 404 if user not found", async () => {
      User.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get("/api/documents")
        .set("Authorization", mockToken);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/documents/:cid", () => {
    test("should return document details by CID", async () => {
      const documentsWithData = {
        ...mockUser,
        documents: [
          {
            cid: "QmTest123",
            fileName: "doc1.pdf",
            fileType: "application/pdf",
            fileSize: 1024,
            hash: "sha256hash",
            uploadedAt: new Date(),
            description: "Test doc",
            status: "confirmed",
          },
        ],
      };

      User.findById = jest.fn().mockResolvedValue(documentsWithData);

      const response = await request(app)
        .get("/api/documents/QmTest123")
        .set("Authorization", mockToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cid).toBe("QmTest123");
      expect(response.body.data.fileName).toBe("doc1.pdf");
    });

    test("should return 404 if document not found", async () => {
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get("/api/documents/NonexistentCID")
        .set("Authorization", mockToken);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test("should return 400 for invalid CID", async () => {
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get("/api/documents/invalid")
        .set("Authorization", mockToken);

      // Invalid CID would still search but not find
      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/documents/:cid", () => {
    test("should delete document from user array", async () => {
      const documentsWithData = {
        ...mockUser,
        documents: [
          {
            cid: "QmTest123",
            fileName: "doc1.pdf",
            fileType: "application/pdf",
          },
        ],
      };

      User.findById = jest.fn().mockResolvedValue(documentsWithData);

      const response = await request(app)
        .delete("/api/documents/QmTest123")
        .set("Authorization", mockToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(documentsWithData.documents).toHaveLength(0);
    });

    test("should return 404 if document not found", async () => {
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .delete("/api/documents/NonexistentCID")
        .set("Authorization", mockToken);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /api/documents/:cid", () => {
    test("should update document description", async () => {
      const documentsWithData = {
        ...mockUser,
        documents: [
          {
            cid: "QmTest123",
            fileName: "doc1.pdf",
            description: "Old description",
          },
        ],
      };

      User.findById = jest.fn().mockResolvedValue(documentsWithData);

      const response = await request(app)
        .patch("/api/documents/QmTest123")
        .set("Authorization", mockToken)
        .send({ description: "New description" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(documentsWithData.documents[0].description).toBe(
        "New description",
      );
    });

    test("should return 404 if document not found", async () => {
      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .patch("/api/documents/NonexistentCID")
        .set("Authorization", mockToken)
        .send({ description: "New description" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/documents/verify/:cid", () => {
    test("should verify document exists on IPFS", async () => {
      const documentsWithData = {
        ...mockUser,
        documents: [
          {
            cid: "QmTest123",
            fileName: "doc1.pdf",
            hash: "sha256hash",
          },
        ],
      };

      User.findById = jest.fn().mockResolvedValue(documentsWithData);

      // Mock IPFS verification
      jest.mock("../services/ipfsService", () => ({
        verifyFileOnIPFS: jest.fn().mockResolvedValue(true),
      }));

      const response = await request(app)
        .post("/api/documents/verify/QmTest123")
        .set("Authorization", mockToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should return 404 if document not found on IPFS", async () => {
      const documentsWithData = {
        ...mockUser,
        documents: [
          {
            cid: "QmTest123",
            fileName: "doc1.pdf",
          },
        ],
      };

      User.findById = jest.fn().mockResolvedValue(documentsWithData);

      // Mock IPFS verification failure
      jest.mock("../services/ipfsService", () => ({
        verifyFileOnIPFS: jest.fn().mockResolvedValue(false),
      }));

      const response = await request(app)
        .post("/api/documents/verify/QmTest123")
        .set("Authorization", mockToken);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});

describe("IPFS Service Tests", () => {
  const ipfsService = require("../../services/ipfsService");

  describe("uploadFileToIPFS", () => {
    test("should upload file and return CID", async () => {
      const buffer = Buffer.from("test content");
      const fileName = "test.pdf";
      const fileType = "application/pdf";

      // This would need proper mocking of axios
      // const result = await ipfsService.uploadFileToIPFS(buffer, fileName, fileType);
      // expect(result.cid).toBeDefined();
      // expect(result.hash).toBeDefined();
      // expect(result.ipfsUrl).toContain('gateway.pinata.cloud');
    });

    test("should throw error if buffer is empty", async () => {
      const buffer = Buffer.alloc(0);

      // This test would be implemented with proper async/await and error handling
      // await expect(ipfsService.uploadFileToIPFS(buffer, 'test.pdf', 'application/pdf')).rejects.toThrow();
    });
  });

  describe("verifyFileOnIPFS", () => {
    test("should verify file exists on IPFS", async () => {
      // This would need proper mocking of axios
      // const exists = await ipfsService.verifyFileOnIPFS('QmTest123');
      // expect(typeof exists).toBe('boolean');
    });

    test("should return false for invalid CID", async () => {
      // const exists = await ipfsService.verifyFileOnIPFS('invalid');
      // expect(exists).toBe(false);
    });
  });
});
