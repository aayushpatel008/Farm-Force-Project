const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",       // MUST match your User model name
    required: true
  },

  title: {
    type: String,
    required: true
  },

  duration: {
    type: String,
    required: true
  },

  employmentType: {
    type: String,
    enum: ["Full-time", "Part-time", "Seasonal"],
    required: true
  },

  workersNeeded: {
    type: Number,
    required: true,
    min: 1
  },

  location: {
    type: String,
    required: true
  },

  salary: {
    type: String,
    required: true
  },

  experienceRequired: String,
  deadline: Date,
  description: String

}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);