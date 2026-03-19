const Job = require('../models/jobposting');
exports.ActiveJobPosting = async (req, res) => {
  try {

    console.log(req.user); // check if user exists

    const jobs = await Job.find().sort({ createdAt: -1 });

    res.json(jobs);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};