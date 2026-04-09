const Application = require('../models/ApplicationModel');
const Job = require('../models/jobposting');
const workerapplication = require('../models/Workerposting');


// ─────────────────────────────────────────────
// 1. APPLY JOB (Worker)
// Worker applies to a job
// ─────────────────────────────────────────────
exports.applyJob = async (req, res) => {
  console.log('API HIT applyJob', req.method, req.originalUrl);
  try {
    // 🔹 Extract jobId from URL params
    const { jobId } = req.params;

    // 🔹 Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      console.log('RESPONSE SENT applyJob NOT FOUND');
      return res.status(404).json({ message: 'Job not found' });
    }

    // 🔹 Check if worker already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      worker: req.user._id,
      initiatedBy: 'worker'
    });

    if (existingApplication) {
      console.log('RESPONSE SENT applyJob DUPLICATE');
      return res.status(409).json({ message: 'Already applied to this job' });
    }

    // 🔹 Create new application
    const application = await Application.create({
      job: jobId,
      worker: req.user._id,
      provider: job.provider,
      initiatedBy: 'worker',
      status: 'pending'
    });

    console.log('RESPONSE SENT applyJob');
    return res.status(201).json({
      message: 'Application submitted successfully',
      application
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

    // 🔹 Validate input
    if (!jobId || !workerId) {
      return res.status(400).json({ message: 'jobId and workerId are required' });
    }

    // 🔹 Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      console.log('RESPONSE SENT inviteWorker JOB NOT FOUND');
      return res.status(404).json({ message: 'Job not found' });
    }

    // 🔹 Authorization: only provider can invite
    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the provider can invite workers for this job'
      });
    }

    // 🔹 Prevent duplicate invite
    const existingInvite = await Application.findOne({
      job: jobId,
      worker: workerId,
      provider: req.user._id,
      initiatedBy: 'provider'
    });

    if (existingInvite) {
      console.log('RESPONSE SENT inviteWorker ALREADY INVITED');
      return res.status(409).json({
        message: 'Worker already invited for this job'
      });
    }

    // 🔹 Create invitation
    const invitation = await Application.create({
      job: jobId,
      worker: workerId,
      provider: req.user._id,
      initiatedBy: 'provider',
      status: 'pending'
    });
    console.log("Invited workerId:", workerId);
    console.log('RESPONSE SENT inviteWorker');
    return res.status(201).json({
      message: 'Worker invited successfully',
      invitation
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
    // 🔹 Find all applications for logged-in worker
    const applications = await Application.find({
      worker: req.user._id
    }).populate('job provider', 'title name email role');

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
//   main function to get invitations for logged-in worker
  const workerprofile = await workerapplication.findOne({ worker: req.user._id });
  try {
    // 🔹 Fetch only provider-initiated applications
    const invites = await Application.find({
      worker: workerprofile._id,
      initiatedBy: "provider"
    }).populate('job provider', 'title name email role');
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
exports.getApplicantsForJob = async (req, res) => {
  console.log('API HIT getApplicantsForJob', req.method, req.originalUrl);
  try {
    const { jobId } = req.params;

    // 🔹 Validate job
    const job = await Job.findById(jobId);
    if (!job) {
      console.log('RESPONSE SENT getApplicantsForJob JOB NOT FOUND');
      return res.status(404).json({ message: 'Job not found' });
    }

    // 🔹 Authorization
    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to view applicants for this job'
      });
    }

    // 🔹 Get worker applications
    const applications = await Application.find({
      job: jobId,
      initiatedBy: 'worker'
    }).populate('worker', 'name email role');

    console.log('RESPONSE SENT getApplicantsForJob');
    return res.status(200).json(applications);

  } catch (error) {
    console.error('getApplicantsForJob ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// 6. GET INVITED WORKERS (Provider)
// Get workers invited by provider
// ─────────────────────────────────────────────
exports.getInvitedWorkers = async (req, res) => {
  console.log('API HIT getInvitedWorkers', req.method, req.originalUrl);
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      console.log('RESPONSE SENT getInvitedWorkers JOB NOT FOUND');
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to view invited workers for this job'
      });
    }

    // 🔹 Fetch invited workers
    const invites = await Application.find({
      job: jobId,
      initiatedBy: 'provider'
    }).populate('worker', 'name email role');

    console.log('RESPONSE SENT getInvitedWorkers');
    return res.status(200).json(invites);

  } catch (error) {
    console.error('getInvitedWorkers ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// 7. UPDATE STATUS (Accept / Reject)
// Used by both Worker & Provider
// ─────────────────────────────────────────────
exports.updateApplicationStatus = async (req, res) => {
  console.log('API HIT updateApplicationStatus', req.method, req.originalUrl);
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 🔹 Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be accepted or rejected'
      });
    }

    // 🔹 Find application
    const application = await Application.findById(id);
    if (!application) {
      console.log('RESPONSE SENT updateApplicationStatus NOT FOUND');
      return res.status(404).json({ message: 'Application not found' });
    }

    // 🔹 Authorization check
    const isProvider = application.provider.toString() === req.user._id.toString();
    const isWorker = application.worker.toString() === req.user._id.toString();

    if (!isProvider && !isWorker) {
      return res.status(403).json({
        message: 'Not authorized to update this application'
      });
    }

    // 🔹 Update status
    application.status = status;
    await application.save();

    console.log('RESPONSE SENT updateApplicationStatus');
    return res.status(200).json(application);

  } catch (error) {
    console.error('updateApplicationStatus ERROR:', error);
    return res.status(500).json({ message: error.message });
  }
};