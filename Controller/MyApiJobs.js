// GET /api/jobs/my
const Job = require('../models/jobposting');
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ provider: req.user._id });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};