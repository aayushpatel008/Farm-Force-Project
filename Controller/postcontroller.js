const Job = require('../models/jobposting');
 
// ── CREATE ─────────────────────────────────────────────────────────────────
exports.createJob = async (req, res) => {
  try {
    console.log("FULL BODY:", req.body);
    const {
      // Existing fields (unchanged)
      title,
      duration,
      employmentType,
      workersNeeded,
      location,
      salary,
      experienceRequired,
      deadline,
      description,
 
      // New fields
      jobCategory,
      farmName,
      payType,
      startDate,
      endDate,
      farmAddress,
      city,
      state,
    } = req.body;
 
    const newJob = await Job.create({
      provider: req.user._id,
 
      // Existing fields (unchanged)
      title,
      duration,
      employmentType,
      workersNeeded,
      location,
      salary,
      experienceRequired,
      deadline,
      description,
 
      // New fields
      jobCategory,
      farmName,
      payType,
      startDate,
      endDate,
      farmAddress,
      city,
      state,
    });
 
    res.status(201).json(newJob);
 
  } catch (error) {
    console.error('CREATE JOB ERROR:');
    console.error(error);
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};