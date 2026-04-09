const WorkerApplication = require('../models/Workerposting');

exports.Creatapplication = async (req, res) => {
  try {

    // ── Extract fields from request body ──
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      nationality,

      email,
      phone,
      emergencyContact,

      jobTitle,
      jobDuration,
      employmentType,
      numberOfWorkers,
      location,
      salaryRange,
      experienceRequired,
      availableFrom,

      skills,
      description
    } = req.body;

    // ✅ NEW: Check if this user already has a profile
    const existing = await WorkerApplication.findOne({ worker: req.user._id });

    let newapplication;

    if (existing) {
      // ✅ NEW: If profile exists → UPDATE instead of creating new
      newapplication = await WorkerApplication.findOneAndUpdate(
        { worker: req.user._id }, // find by same user

        {
          // overwrite with new data (edit profile)
          worker: req.user._id,

          firstName,
          lastName,
          dateOfBirth,
          gender,
          nationality,

          email,
          phone,
          emergencyContact,

          jobTitle,
          jobDuration,
          employmentType,
          numberOfWorkers,
          location,
          salaryRange,
          experienceRequired,
          availableFrom,

          skills,
          description
        },

        { new: true } // return updated document
      );

    } else {
      // ✅ OLD LOGIC: First time → CREATE
      newapplication = await WorkerApplication.create({
        worker: req.user._id,

        firstName,
        lastName,
        dateOfBirth,
        gender,
        nationality,

        email,
        phone,
        emergencyContact,

        jobTitle,
        jobDuration,
        employmentType,
        numberOfWorkers,
        location,
        salaryRange,
        experienceRequired,
        availableFrom,

        skills,
        description
      });
    }

    // ── Success response ──
    res.status(201).json({
      success: true,
      message: "Application saved successfully", // works for both create + update
      data: newapplication
    });

    // ⚠️ FIX: correct user id logging
    console.log("USER ID:", req.user._id);

  } catch (error) {
    console.error("CREATE JOB ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};