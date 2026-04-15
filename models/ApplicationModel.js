const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },

  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WorkerApplication", // ✅ matches your worker model
    required: true,
  },

  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  initiatedBy: {
    type: String,
    enum: ["worker", "provider"],
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },

}, { timestamps: true });

/* 🔒 Prevent duplicate apply */
applicationSchema.index({ job: 1, worker: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);