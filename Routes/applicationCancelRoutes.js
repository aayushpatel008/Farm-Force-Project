const express = require("express");
const router = express.Router();

const {
  cancelApplication,
  getMyAppliedJobs,
  revokeHire,        // ✅ NEW
  getHiredWorkers    // ✅ NEW
} = require("../Controller/applicationCancelController");

const { protect } = require("../Middleware/Jobpostmiddleware");

// ─────────────────────────────
// WORKER ROUTES
// ─────────────────────────────
router.delete("/cancel/:jobId", protect, cancelApplication);
router.get("/my-applied", protect, getMyAppliedJobs);

// ─────────────────────────────
// PROVIDER ROUTES (NEW)
// ─────────────────────────────
router.delete("/revoke", protect, revokeHire);
router.get("/my-hires", protect, getHiredWorkers);

module.exports = router;