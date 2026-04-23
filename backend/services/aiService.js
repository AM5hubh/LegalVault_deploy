// const tf = require('@tensorflow/tfjs-node');
// const sharp = require('sharp');
// const { uploadFile } = require('./cloudinaryService');

// // Enhance image (super-resolution or noise reduction)
// async function enhanceImage(buffer, publicId, type) {
//   try {
//     let enhancedBuffer;
//     if (type === 'super-resolution') {
//       // Load pre-trained ESRGAN model (adjust path as needed)
//       const model = await tf.loadLayersModel('file://path/to/esrgan/model.json');
//       const tensor = tf.node.decodeImage(buffer);
//       const enhanced = model.predict(tensor);
//       enhancedBuffer = await tf.node.encodePng(enhanced);
//       tensor.dispose();
//       enhanced.dispose();
//     } else if (type === 'noise-reduction') {
//       enhancedBuffer = await sharp(buffer)
//         .modulate({ brightness: 1, saturation: 1, hue: 0 })
//         .png()
//         .toBuffer();
//     } else {
//       throw new Error('Invalid enhancement type');
//     }

//     // Upload enhanced image to Cloudinary
//     const result = await uploadFile(enhancedBuffer, `${publicId}_enhanced`, 'image/png');
//     return {
//       enhancedPublicId: result.publicId,
//       enhancedUrl: result.url,
//     };
//   } catch (error) {
//     throw new Error(`AI enhancement failed: ${error.message}`);
//   }
// }

// module.exports = {
//   enhanceImage,
// };

