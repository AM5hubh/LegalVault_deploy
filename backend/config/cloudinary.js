const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  // Test the configuration
  cloudinary.api.ping((error, result) => {
    if (error) {
      logger.error('❌ Cloudinary connection failed:', error.message);
    } else {
      logger.info('✅ Cloudinary connected successfully');
    }
  });

} catch (error) {
  logger.error('❌ Cloudinary configuration error:', error.message);
}

module.exports = cloudinary;

