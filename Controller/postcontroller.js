const Job = require('../models/jobposting');

exports.createJob = async (req, res) => {
  try {
    const {
      
      title,
      duration,
      employmentType,
      workersNeeded,
      location,
      salary,
      experienceRequired,
      deadline,
      description
    } = req.body;

    const newJob = await Job.create({
      provider: req.user._id,
      title,
      duration,
      employmentType,
      workersNeeded,
      location,
      salary,
      experienceRequired,
      deadline,
      description
    });

    res.status(201).json(newJob);

  } catch (error) {
  console.error("CREATE JOB ERROR:");
  console.error(error);
  console.error(error.message);
  res.status(500).json({ message: error.message });
}
};