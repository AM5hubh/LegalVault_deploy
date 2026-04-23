const cloudinary = require('../config/cloudinary');
const crypto = require('crypto');

// Upload file to Cloudinary and return metadata
async function uploadFile(buffer, originalName, fileType) {
  try {
    // Compute SHA-256 hash of file
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'evidence',
          public_id: `evidence_${Date.now()}_${originalName.replace(/\s+/g, '_')}`,
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      uploadStream.end(buffer);
    });

    return {
      hash,
      publicId: result.public_id,
      url: result.secure_url,
      fileType,
      size: buffer.length,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
}

// Retrieve file URL from Cloudinary with optional transformations
async function getFileUrl(publicId, transformations = {}) {
  try {
    const url = cloudinary.url(publicId, {
      resource_type: 'auto',
      ...transformations,
    });
    return url;
  } catch (error) {
    throw new Error(`Cloudinary URL generation failed: ${error.message}`);
  }
}

// Delete file from Cloudinary
async function deleteFile(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
}

module.exports = {
  uploadFile,
  getFileUrl,
  deleteFile,
};

