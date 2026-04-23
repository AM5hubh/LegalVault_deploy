// Load environment variables FIRST
require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/ContactRoute");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const kycRoutes = require("./routes/kycRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const casesRoutes = require("./routes/casesRoutes");
const blogRoutes = require("./routes/BlogsRoutes");
const backupRoutes = require("./routes/backupRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const documentRoutes = require("./routes/documentRoutes");
const roleRequestRoutes = require("./routes/roleRequestRoutes");
const roleAssignerRoutes = require("./routes/roleAssignerRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const walletRoutes = require("./routes/walletRoutes");
const evidenceRoutes = require("./routes/evidenceRoutes");
const evidenceOnchainRoutes = require("./routes/evidenceOnchainRoutes");
const caseOnchainRoutes = require("./routes/caseOnchainRoutes");
const chainOfCustodyRoutes = require("./routes/chainOfCustodyRoutes");
const { checkIPFSConnection } = require("./services/ipfsService");

// Import API Health Service
const ApiHealthService = require("./services/ApiHealth");

// Import Database Backup Service
const DatabaseBackupService = require("./services/DatabaseBackupService");

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (
      process.env.NODE_ENV !== "production" ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }

    return callback(new Error("CORS policy blocked this origin"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// app.options("*", cors(corsOptions));

// API rate limiter (Render/proxy safe)
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/kyc", kycRoutes);
// Register on-chain case routes before generic case routes to avoid
// the "/onchain" segment being misinterpreted as a MongoDB ObjectId.
app.use("/api/cases/onchain", caseOnchainRoutes);
app.use("/api/cases", casesRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/role-requests", roleRequestRoutes);
app.use("/api/role-assigner", roleAssignerRoutes);
app.use("/api/verification", verificationRoutes);

app.use("/api/wallet", walletRoutes);
// Register on-chain evidence routes before generic evidence routes so
// "/onchain" isn't treated as an evidenceId in the generic router.
app.use("/api/evidence/onchain", evidenceOnchainRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/custody", chainOfCustodyRoutes);
// Enhanced Health check endpoint with comprehensive API documentation
app.get("/api/health", (req, res) => {
  try {
    const healthInfo = ApiHealthService.getHealthInfo(req);
    res.status(200).json(healthInfo);
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// API Documentation endpoint (simplified for quick reference)
app.get("/api/docs", (req, res) => {
  try {
    const docsInfo = ApiHealthService.getQuickDocs(req);
    res.status(200).json(docsInfo);
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Documentation generation failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});


// API Status endpoint (lightweight health check)
app.get("/api/status", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "LEGALVAULT API",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    environment: process.env.NODE_ENV || "development",
  });
});

const frontendDistPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDistPath));

// SPA fallback for frontend routes only, never for API endpoints
app.get(/^\/(?!api).*/, (req, res, next) => {
  const indexPath = path.join(frontendDistPath, "index.html");

  if (req.method !== "GET") {
    return next();
  }

  return res.sendFile(indexPath, (error) => {
    if (error) {
      next();
    }
  });
});

// Error Handling
app.use(errorMiddleware);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    availableEndpoints: [
      "GET /",
      "GET /api/health",
      "GET /api/docs",
      "GET /api/status",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/profile",
      "POST /api/contact",
      "POST /api/cases",
    ],
    documentation: `${req.protocol}://${req.get("host")}/api/health`,
  });
});

// Database Connection with better error handling
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("🗄️  MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Initialize Database Backup Service
    try {
      const backupService = new DatabaseBackupService();
      await backupService.initialize();
      console.log("🔐 Database backup service initialized and ready");

      // Start automated backup scheduling
      backupService.startAutomatedBackups();
      console.log("⏰ Automated backup scheduling started");
    } catch (backupError) {
      console.error(
        "❌ Failed to initialize backup service:",
        backupError.message,
      );
    }

    // Check IPFS/Pinata connectivity on startup (non-fatal)
    try {
      const ipfsStatus = await checkIPFSConnection();
      if (!ipfsStatus.ok) {
        console.error("❌ IPFS connection check failed:", ipfsStatus.error);
      }
    } catch (ipfsError) {
      console.error(
        "❌ IPFS connection check threw an error:",
        ipfsError.message,
      );
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Graceful shutdown handling
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  try {
    await mongoose.connection.close();
    console.log("📊 MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  try {
    await mongoose.connection.close();
    console.log("📊 MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    process.exit(1);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 LEGALVAULT Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api/docs`);
  console.log(`⚡ Status check: http://localhost:${PORT}/api/status`);
  console.log(`🌐 Root endpoint: http://localhost:${PORT}/`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || "development"}`);
});
