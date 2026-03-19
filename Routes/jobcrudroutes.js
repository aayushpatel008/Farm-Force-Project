const express = require("express");
const router = express.Router();
const jobcrudcontroller = require("../Controller/jobcrud");

// update job
router.patch("/jobs/:id", jobcrudcontroller.updateJob);

// delete job
router.delete("/jobs/:id", jobcrudcontroller.deleteJob);

module.exports = router;