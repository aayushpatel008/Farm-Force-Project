const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    // ── Relationship ──────────────────────────────────────────
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── EXISTING FIELDS (unchanged) ───────────────────────────
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Seasonal'],
      default: 'Full-time',
    },
    workersNeeded: {
      type: Number,
      min: 1,
      default: 1,
    },
    location: {
      type: String,
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    experienceRequired: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
    },
    description: {
      type: String,
      trim: true,
    },

    // ── NEW FIELDS ────────────────────────────────────────────
    jobCategory: {
      type: String,
      trim: true,
    },
    farmName: {
      type: String,
      trim: true,
    },
    payType: {
      type: String,
      enum: ['Per Day', 'Per Hour', 'Per Task'],
      default: 'Per Day',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    farmAddress: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },

    // ── Status (unchanged if already present) ─────────────────
    status: {
      type: String,
      enum: ['open', 'filled', 'closed'],
      default: 'open',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model('Job', jobSchema);