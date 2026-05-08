const Application = require('../models/ApplicationModel');
const Job = require('../models/jobposting');
const workerapplication = require('../models/Workerposting');
const Workspace = require('../models/Workspace');


// ─────────────────────────────────────────────
// 1. APPLY JOB (Worker)
// Worker applies to a job
// ─────────────────────────────────────────────
exports.applyJob = async (req, res) => {
  console.log('API HIT applyJob', req.method, req.originalUrl);

  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // 🔥 Get worker profile
    const workerprofile = await workerapplication.findOne({
      worker: req.user._id
    });
    console.log("Worker Profile Found:", workerprofile);

    if (!workerprofile) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    // 🔥 Check duplicate
    const existingApplication = await Application.findOne({
      job: jobId,
      worker: workerprofile._id, // ✅ FIXED
      initiatedBy: 'worker'
    });

    if (existingApplication) {
      return res.status(409).json({ message: 'Already applied to this job' });
    }

    // 🔥 Create application with workerprofile ID
    const application = await Application.create({
      job: jobId,
      worker: workerprofile._id, // ✅ FIXED
      provider: job.provider,
      initiatedBy: 'worker',
      status: 'pending'
    });

    // 🔥 Populate before sending response
    const populatedApplication = await Application.findById(application._id)
      .populate('worker')   // ✅ full worker details
      .populate('job');

    return res.status(201).json({
      message: 'Application submitted successfully',
      application: populatedApplication
    });

  } catch (error) {
    console.error('applyJob ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// 2. INVITE WORKER (Provider)
// Provider invites a worker to a job
// ─────────────────────────────────────────────
exports.inviteWorker = async (req, res) => {
  console.log('API HIT inviteWorker', req.method, req.originalUrl);

  try {
    const { jobId, workerId } = req.body;

    if (!jobId || !workerId) {
      return res.status(400).json({ message: 'jobId and workerId are required' });
    }

    console.log("Incoming workerId:", workerId);

    // 🔹 Check job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // 🔹 Auth check
    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the provider can invite workers for this job'
      });
    }

    // 🔥 HANDLE BOTH CASES (IMPORTANT FINAL FIX)
    const workerprofile = await workerapplication.findOne({
      $or: [
        { worker: workerId },  // if frontend sends USER ID
        { _id: workerId }      // if frontend sends workerProfile ID
      ]
    });

    if (!workerprofile) {
      console.log("❌ Worker profile NOT FOUND for:", workerId);
      return res.status(404).json({ message: "Worker profile not found" });
    }

    console.log("✅ Worker Profile:", workerprofile._id);

    // 🔥 Prevent duplicate
    const existingInvite = await Application.findOne({
      job: jobId,
      worker: workerprofile._id,
      provider: req.user._id,
      initiatedBy: 'provider'
    });

    if (existingInvite) {
      return res.status(409).json({
        message: 'Worker already invited for this job'
      });
    }

    // 🔥 Create invite
    const invitation = await Application.create({
      job: jobId,
      worker: workerprofile._id,   // ALWAYS store workerProfile ID
      provider: req.user._id,
      initiatedBy: 'provider',
      status: 'pending'
    });

    // 🔥 Populate FULL DATA (VERY IMPORTANT)
    const populatedInvitation = await Application.findById(invitation._id)
      .populate({
        path: 'worker',
        select: '-__v'
      })
      .populate({
        path: 'job',
        populate: {
          path: 'provider',
          model: 'User',
          select: 'name email'
        }
      });

    return res.status(201).json({
      message: 'Worker invited successfully',
      invitation: populatedInvitation
    });

  } catch (error) {
    console.error('inviteWorker ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// 3. GET MY APPLICATIONS (Worker)
// Get jobs where worker applied
// ─────────────────────────────────────────────
exports.getMyApplications = async (req, res) => {
  console.log('API HIT getMyApplications', req.method, req.originalUrl);

  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 🔥 STEP 1: get worker profile
    const workerprofile = await workerapplication.findOne({
      worker: req.user._id
    });

    if (!workerprofile) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    // 🔥 STEP 2: use workerprofile._id
    const applications = await Application.find({
      worker: workerprofile._id,
      initiatedBy: 'worker'   // optional but recommended
    })
      .populate({
        path: "job",
        populate: {
          path: "provider",
          model: "User",
          select: "name email role"
        }
      });

    console.log('RESPONSE SENT getMyApplications');
    return res.status(200).json(applications);

  } catch (error) {
    console.error('getMyApplications ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};
// ─────────────────────────────────────────────
// 4. GET INVITATIONS (Worker)
// Get jobs where worker is invited
// ─────────────────────────────────────────────
exports.getInvitations = async (req, res) => {
  console.log('API HIT getInvitations', req.method, req.originalUrl);

  try {
    // ✅ Safety check
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // ✅ Find worker profile
    const workerprofile = await workerapplication.findOne({
      worker: req.user._id
    });

    if (!workerprofile) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    console.log("Worker Profile ID:", workerprofile._id);

    // ✅ Fetch invitations with deep populate
    const invites = await Application.find({
      worker: workerprofile._id,
      initiatedBy: "provider"
    })
      .populate({
        path: "job",
        populate: {
          path: "provider",
          model: "User",
          select: "name email role"
        }
      });

    console.log("Logged user:", req.user._id);
    console.log('RESPONSE SENT getInvitations');

    return res.status(200).json(invites);

  } catch (error) {
    console.error('getInvitations ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// 5. GET APPLICANTS (Provider)
// Get workers who applied to a job
// ─────────────────────────────────────────────
exports.getMyApplicants = async (req, res) => {
  console.log('API HIT getMyApplicants', req.method, req.originalUrl);

  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 🔥 Step 1: Get all jobs of this provider
    const jobs = await Job.find({ provider: req.user._id });

    // 🔥 Step 2: Extract job IDs
    const jobIds = jobs.map(job => job._id);

    // 🔥 Step 3: Get all applications (workers applied)
    const applications = await Application.find({
      job: { $in: jobIds },
      initiatedBy: 'worker'
    })
    
      .populate('worker')
      .populate('job');
      
    
    return res.status(200).json(applications);

  } catch (error) {
    console.error('getMyApplicants ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// 6. GET INVITED WORKERS (Provider)
// Get workers invited by provider
// ─────────────────────────────────────────────
exports.getMyInvitedWorkers = async (req, res) => {
  console.log('API HIT getMyInvitedWorkers', req.method, req.originalUrl);

  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 🔥 Step 1: Get all jobs of this provider
    const jobs = await Job.find({ provider: req.user._id });

    // 🔥 Step 2: Extract job IDs
    const jobIds = jobs.map(job => job._id);

    // 🔥 Step 3: Get all invites (provider invited)
    const invites = await Application.find({
      job: { $in: jobIds },
      initiatedBy: 'provider'
    })
      .populate('worker')
      .populate('job');

    return res.status(200).json(invites);

  } catch (error) {
    console.error('getMyInvitedWorkers ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// 7. UPDATE STATUS (Accept / Reject)
// Used by both Worker & Provider
// ─────────────────────────────────────────────
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be accepted or rejected'
      });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // ✅ FIXED AUTH LOGIC
    const isProvider =
      application.provider.toString() === req.user._id.toString();

    const workerprofile = await workerapplication.findOne({
      worker: req.user._id
    });

    const isWorker =
      workerprofile &&
      application.worker.toString() === workerprofile._id.toString();

    if (!isProvider && !isWorker) {
      return res.status(403).json({
        message: 'Not authorized to update this application'
      });
    }

    application.status = status;
    await application.save();

    // ✅ CREATE WORKSPACE AFTER ACCEPT
    if (status === "accepted") {

        // check existing workspace
        const existingWorkspace =
        await Workspace.findOne({
            application: application._id
        });

        // prevent duplicate workspace
        if (!existingWorkspace) {

            await Workspace.create({

              application: application._id,

              job: application.job,

              worker: application.worker,

              provider: application.provider

            });

        }

      }


    return res.status(200).json(application);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};