const express = require("express");
const router = express.Router();

const { getMyJobs } = require("../Controller/MyApiJobs"); // adjust path if needed
const { protect } = require("../Middleware/Jobpostmiddleware"); // your auth middleware

// 🔹 GET MY JOBS (only logged-in provider's jobs)
router.get("/jobs/my", protect, getMyJobs);

module.exports = router;