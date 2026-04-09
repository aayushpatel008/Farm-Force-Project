const express = require("express");
const router = express.Router();

const { protect } = require("../Middleware/Jobpostmiddleware");
const controller = require("../Controller/applicationController");


// ─────────────────────────────────────────────
// 1. WORKER → APPLY TO A JOB
// Endpoint: POST /api/applications/apply/:jobId
// Used when worker clicks "Apply"
// ─────────────────────────────────────────────
router.post("/apply/:jobId", protect, controller.applyJob);


// ─────────────────────────────────────────────
// 2. PROVIDER → INVITE WORKER
// Endpoint: POST /api/applications/invite
// Used when provider clicks "Hire / Invite"
// Body: { jobId, workerId }
// ─────────────────────────────────────────────
router.post("/invite", protect, controller.inviteWorker);


// ─────────────────────────────────────────────
// 3. WORKER → GET APPLIED JOBS
// Endpoint: GET /api/applications/my
// Shows jobs where worker applied
// ─────────────────────────────────────────────
router.get("/my", protect, controller.getMyApplications);


// ─────────────────────────────────────────────
// 4. WORKER → GET INVITATIONS
// Endpoint: GET /api/applications/invitations
// Shows jobs where provider invited worker
// ─────────────────────────────────────────────
router.get("/invitations", protect, controller.getInvitations);


// ─────────────────────────────────────────────
// 5. PROVIDER → GET APPLICANTS FOR A JOB
// Endpoint: GET /api/applications/job/:jobId
// Shows workers who applied to a job
// ─────────────────────────────────────────────
router.get("/job/:jobId", protect, controller.getApplicantsForJob);


// ─────────────────────────────────────────────
// 6. PROVIDER → GET INVITED WORKERS
// Endpoint: GET /api/applications/job/:jobId/invited
// Shows workers invited by provider
// ─────────────────────────────────────────────
router.get("/job/:jobId/invited", protect, controller.getInvitedWorkers);


// ─────────────────────────────────────────────
// 7. UPDATE STATUS (ACCEPT / REJECT)
// Endpoint: PUT /api/applications/:id/status
// Used by:
//   - Provider → accept/reject applicant
//   - Worker → accept/reject invitation
// Body: { status: "accepted" | "rejected" }
// ─────────────────────────────────────────────
router.put("/:id/status", protect, controller.updateApplicationStatus);


module.exports = router;