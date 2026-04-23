const mongoose = require('mongoose');

const chainOfCustodySchema = new mongoose.Schema({
  evidenceId: {
    type: String, // Blockchain-generated ID
    required: true,
  },
  actionId: {
    type: String, // Blockchain transaction hash
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['upload', 'view', 'enhance', 'kyc_verify', 'password_reset', 'delete'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: Object, // e.g., { kycResponse: 'verified' }
  },
});

chainOfCustodySchema.index({ evidenceId: 1 });
chainOfCustodySchema.index({ userId: 1 });
chainOfCustodySchema.index({ action: 1 });

module.exports = mongoose.model('ChainOfCustody', chainOfCustodySchema);

