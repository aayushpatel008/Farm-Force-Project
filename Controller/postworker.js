const WorkerApplication = require('../models/Workerposting');

exports.Creatapplication = async (req, res) => {
  try {
    // ── Extract fields from request body (UPDATED to match frontend) ──
    const {
      // ── Personal Details ──
      firstName,
      lastName,
      dateOfBirth,
      gender,
      nationality,

      // ── Contact Information ──
      email,
      phone,
      emergencyContact,

      // ── Job Details ──
      jobTitle,
      jobDuration,
      employmentType,
      numberOfWorkers,
      location,
      salaryRange,
      experienceRequired,
      availableFrom,

      // ── Other ──
      skills,
      description
    } = req.body;

    // ── Create new application ──
    const newapplication = await WorkerApplication.create({
      worker: req.user._id,

      // ── Personal Details ──
      firstName,
      lastName,
      dateOfBirth,
      gender,
      nationality,

      // ── Contact Info ──
      email,
      phone,
      emergencyContact,

      // ── Job Details ──
      jobTitle,
      jobDuration,
      employmentType,
      numberOfWorkers,
      location,
      salaryRange,
      experienceRequired,
      availableFrom,

      // ── Other ──
      skills,
      description
    });

    // ── Success response ──
    res.status(201).json({
      success: true,
      message: "Application created successfully",
      data: newapplication
      
    });
    console.log("USER ID:", req.user_id);

  } catch (error) {
    console.error("CREATE JOB ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};