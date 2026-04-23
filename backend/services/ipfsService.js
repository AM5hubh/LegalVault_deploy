const crypto = require("crypto");
const axios = require("axios");
const FormData = require("form-data");
const logger = require("../utils/logger");

// IPFS Configuration (Pinata-friendly)
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

const normalizeUrl = (url) => (url ? url.replace(/\/$/, "") : "");

const IPFS_API_URL =
  normalizeUrl(process.env.IPFS_API_URL) || "http://localhost:5001";
const IPFS_GATEWAY_URL =
  normalizeUrl(process.env.IPFS_GATEWAY_URL) ||
  "https://gateway.pinata.cloud/ipfs";

const buildAuthHeaders = () => {
  // Prefer JWT, fallback to key/secret headers
  if (PINATA_JWT) {
    return { Authorization: `Bearer ${PINATA_JWT}` };
  }
  if (PINATA_API_KEY && PINATA_API_SECRET) {
    return {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    };
  }
  return {};
};

/**
 * Upload a file to IPFS and return the CID
 * @param {Buffer} fileBuffer - The file content as buffer
 * @param {String} fileName - Original file name
 * @param {String} fileType - MIME type of the file
 * @returns {Promise<Object>} - { cid, hash, ipfsUrl, fileName, fileType, fileSize }
 */
async function uploadFileToIPFS(fileBuffer, fileName, fileType) {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("File buffer is empty");
    }

    // Calculate SHA-256 hash of the file
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const isPinata = IPFS_API_URL.includes("pinata.cloud");
    const authHeaders = buildAuthHeaders();

    // For Pinata, use their native pinning endpoint
    if (isPinata) {
      const formData = new FormData();
      formData.append("file", fileBuffer, { filename: fileName });

      const uploadUrl = `${IPFS_API_URL}/pinning/pinFileToIPFS`;

      logger.info("Uploading file to Pinata (native endpoint)", {
        fileName,
        fileSize: fileBuffer.length,
        uploadUrl,
      });

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          ...authHeaders,
        },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (!response.data || !response.data.IpfsHash) {
        throw new Error("Pinata upload response missing IpfsHash");
      }

      const cid = response.data.IpfsHash;
      const ipfsUrl = `${IPFS_GATEWAY_URL}/${cid}`;

      logger.info("File uploaded to Pinata successfully", {
        fileName,
        cid,
        hash,
        fileSize: fileBuffer.length,
      });

      return {
        cid,
        hash,
        ipfsUrl,
        fileName,
        fileType,
        fileSize: fileBuffer.length,
      };
    } else {
      // Standard IPFS node upload
      const formData = new FormData();
      formData.append("file", fileBuffer, { filename: fileName });

      const uploadUrl = `${IPFS_API_URL}/api/v0/add`;

      logger.info("Uploading file to IPFS (standard node)", {
        fileName,
        fileSize: fileBuffer.length,
        uploadUrl,
        hasAuth: Object.keys(authHeaders).length > 0,
      });

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          ...authHeaders,
        },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (!response.data || !response.data.Hash) {
        throw new Error("IPFS upload response missing CID");
      }

      const cid = response.data.Hash;
      const ipfsUrl = `${IPFS_GATEWAY_URL}/${cid}`;

      logger.info("File uploaded to IPFS successfully", {
        fileName,
        cid,
        hash,
        fileSize: fileBuffer.length,
      });

      return {
        cid,
        hash,
        ipfsUrl,
        fileName,
        fileType,
        fileSize: fileBuffer.length,
      };
    }
  } catch (error) {
    logger.error("IPFS upload failed", {
      error: error.message,
      fileName,
      stack: error.stack,
    });
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}

/**
 * Retrieve file from IPFS using CID
 * @param {String} cid - IPFS Content Identifier
 * @returns {Promise<Buffer>} - File content as buffer
 */
async function retrieveFileFromIPFS(cid) {
  try {
    if (!cid || typeof cid !== "string") {
      throw new Error("Invalid CID provided");
    }

    logger.info("Retrieving file from IPFS", { cid });

    const response = await axios.get(`${IPFS_GATEWAY_URL}/${cid}`, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    logger.info("File retrieved from IPFS successfully", { cid });

    return Buffer.from(response.data);
  } catch (error) {
    logger.error("IPFS retrieval failed", {
      error: error.message,
      cid,
      stack: error.stack,
    });
    throw new Error(`IPFS retrieval failed: ${error.message}`);
  }
}

/**
 * Verify file exists on IPFS
 * @param {String} cid - IPFS Content Identifier
 * @returns {Promise<Boolean>} - true if file exists, false otherwise
 */
async function verifyFileOnIPFS(cid) {
  try {
    if (!cid || typeof cid !== "string") {
      return false;
    }

    logger.info("Verifying file on IPFS", { cid });

    // Try to get file stats from IPFS
    const response = await axios.post(
      `${IPFS_API_URL}/api/v0/object/stat?arg=${cid}`,
      {},
      { timeout: 10000, headers: buildAuthHeaders() },
    );

    const exists = response.status === 200 && response.data.Hash === cid;

    logger.info("File verification result", { cid, exists });

    return exists;
  } catch (error) {
    logger.warn("File verification on IPFS failed", {
      error: error.message,
      cid,
    });
    return false;
  }
}

/**
 * Get file info from IPFS
 * @param {String} cid - IPFS Content Identifier
 * @returns {Promise<Object>} - File information { size, hash, etc }
 */
async function getFileInfo(cid) {
  try {
    if (!cid || typeof cid !== "string") {
      throw new Error("Invalid CID provided");
    }

    logger.info("Getting file info from IPFS", { cid });

    const response = await axios.post(
      `${IPFS_API_URL}/api/v0/object/stat?arg=${cid}`,
      {},
      { timeout: 10000, headers: buildAuthHeaders() },
    );

    const fileInfo = {
      cid: response.data.Hash,
      size: response.data.CumulativeSize,
      blocksCount: response.data.NumLinks,
    };

    logger.info("File info retrieved successfully", { cid, fileInfo });

    return fileInfo;
  } catch (error) {
    logger.error("Failed to get file info from IPFS", {
      error: error.message,
      cid,
      stack: error.stack,
    });
    throw new Error(`Failed to get file info: ${error.message}`);
  }
}

/**
 * Pin file on IPFS (for persistence)
 * @param {String} cid - IPFS Content Identifier
 * @returns {Promise<Boolean>} - true if successfully pinned
 */
async function pinFileOnIPFS(cid) {
  try {
    if (!cid || typeof cid !== "string") {
      throw new Error("Invalid CID provided");
    }

    logger.info("Pinning file on IPFS", { cid });

    const response = await axios.post(
      `${IPFS_API_URL}/api/v0/pin/add?arg=${cid}`,
      {},
      { timeout: 30000, headers: buildAuthHeaders() },
    );

    const isPinned =
      response.status === 200 &&
      response.data.Pins &&
      response.data.Pins.length > 0;

    logger.info("File pinning result", { cid, isPinned });

    return isPinned;
  } catch (error) {
    logger.warn("File pinning on IPFS failed", {
      error: error.message,
      cid,
    });
    // Don't throw error as pinning is optional
    return false;
  }
}

/**
 * Unpin file from IPFS
 * @param {String} cid - IPFS Content Identifier
 * @returns {Promise<Boolean>} - true if successfully unpinned
 */
async function unpinFileFromIPFS(cid) {
  try {
    if (!cid || typeof cid !== "string") {
      throw new Error("Invalid CID provided");
    }

    logger.info("Unpinning file from IPFS", { cid });

    const response = await axios.post(
      `${IPFS_API_URL}/api/v0/pin/rm?arg=${cid}`,
      {},
      { timeout: 10000, headers: buildAuthHeaders() },
    );

    const isUnpinned =
      response.status === 200 &&
      response.data.Pins &&
      response.data.Pins.length > 0;

    logger.info("File unpinning result", { cid, isUnpinned });

    return isUnpinned;
  } catch (error) {
    logger.warn("File unpinning from IPFS failed", {
      error: error.message,
      cid,
    });
    return false;
  }
}

/**
 * Generate IPFS gateway URL for a CID
 * @param {String} cid - IPFS Content Identifier
 * @returns {String} - Full IPFS gateway URL
 */
function getIPFSGatewayUrl(cid) {
  if (!cid || typeof cid !== "string") {
    throw new Error("Invalid CID provided");
  }
  return `${IPFS_GATEWAY_URL}/${cid}`;
}

/**
 * Check connectivity to IPFS (Pinata-friendly)
 * For Pinata, uses /data/testAuthentication; otherwise uses /api/v0/version.
 */
async function checkIPFSConnection() {
  const isPinata = IPFS_API_URL.includes("pinata.cloud");
  const url = isPinata
    ? `${IPFS_API_URL}/data/testAuthentication`
    : `${IPFS_API_URL}/api/v0/version`;

  try {
    const response = await axios.get(url, {
      headers: buildAuthHeaders(),
      timeout: 10000,
    });

    const info = isPinata
      ? { authenticated: true, user: response.data?.user || "unknown" }
      : {
          version:
            response.data?.Version || response.data?.version || "unknown",
        };

    logger.info("✅ IPFS service reachable", {
      provider: isPinata ? "pinata" : "ipfs-node",
      url,
      ...info,
    });

    return { ok: true, provider: isPinata ? "pinata" : "ipfs-node", ...info };
  } catch (error) {
    logger.error("❌ IPFS service unreachable", {
      provider: isPinata ? "pinata" : "ipfs-node",
      url,
      error: error.message,
    });
    return { ok: false, error: error.message };
  }
}

module.exports = {
  uploadFileToIPFS,
  retrieveFileFromIPFS,
  verifyFileOnIPFS,
  getFileInfo,
  pinFileOnIPFS,
  unpinFileFromIPFS,
  getIPFSGatewayUrl,
  checkIPFSConnection,
};
