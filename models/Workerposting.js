const mongoose = require("mongoose");

const workerApplicationSchema = new mongoose.Schema({
   // ── Optional: link to user ──
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true // ✅ IMPORTANT (prevents multiple profiles)
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  // ── Personal Details ──
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String },
  nationality: { type: String },

  // ── Contact Information ──
  email: { type: String, required: true },
  phone: { type: String, required: true },
  emergencyContact: { type: String },

  // ── Job Details ──
  jobTitle: { type: String, required: true },
  jobDuration: { type: String },
  employmentType: { type: String },
  numberOfWorkers: { type: Number, default: 1 },
  location: { type: String, required: true },
  salaryRange: { type: String },
  experienceRequired: { type: String },
  availableFrom: { type: Date },

  // ── Description & Skills ──
  description: { type: String, required: true },
  skills: [{ type: String }],

 

}, { timestamps: true });

module.exports = mongoose.model("WorkerApplication", workerApplicationSchema);