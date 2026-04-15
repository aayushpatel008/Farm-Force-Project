const Application = require("../models/ApplicationModel");
const workerapplication = require("../models/Workerposting");


// ❌ Cancel Application
exports.cancelApplication = async (req, res) => {
  try {
    const { jobId } = req.params;

    const workerprofile = await workerapplication.findOne({
      worker: req.user._id
    });

    if (!workerprofile) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    const deleted = await Application.findOneAndDelete({
      job: jobId,
      worker: workerprofile._id,
      initiatedBy: "worker"
    });

    if (!deleted) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application cancelled" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 📥 Get Applied Job IDs
exports.getMyAppliedJobs = async (req, res) => {
  try {
    const workerprofile = await workerapplication.findOne({
      worker: req.user._id
    });

    if (!workerprofile) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    const applications = await Application.find({
      worker: workerprofile._id,
      initiatedBy: "worker"
    }).select("job");

    const jobIds = applications.map(app => app.job.toString());

    res.json(jobIds);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Provider → Revoke Hire (cancel invite) - NEW

// ─────────────────────────────────────────────
// REVOKE HIRE / INVITE (Provider)
// ─────────────────────────────────────────────
exports.revokeHire = async (req, res) => {
  try {
    const { jobId, workerId } = req.body;

    const workerprofile = await workerapplication.findOne({
      $or: [
        { worker: workerId },
        { _id: workerId }
      ]
    });

    if (!workerprofile) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    const deleted = await Application.findOneAndDelete({
      job: jobId,
      worker: workerprofile._id,
      provider: req.user._id,
      initiatedBy: "provider"
    });

    if (!deleted) {
      return res.status(404).json({ message: "Hire not found" });
    }

    res.json({ message: "Hire revoked successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET HIRED WORKERS (Provider)
// ─────────────────────────────────────────────
exports.getHiredWorkers = async (req, res) => {
  try {
    const applications = await Application.find({
      provider: req.user._id,
      initiatedBy: "provider"
    }).select("job worker");

    const result = applications.map(app => ({
      jobId: app.job.toString(),
      workerId: app.worker.toString()
    }));

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};