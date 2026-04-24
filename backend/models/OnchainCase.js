const mongoose = require("mongoose");

const onchainCaseSchema = new mongoose.Schema(
  {
    caseId: { type: String, required: false, unique: true },
    caseNumber: { type: String, required: true },
  },
  { timestamps: true },
);

onchainCaseSchema.index({ caseId: 1 }, { unique: true });

module.exports = mongoose.model("OnchainCase", onchainCaseSchema);
