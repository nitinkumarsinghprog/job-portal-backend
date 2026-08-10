const { Router } = require("express");

const jobsController = require("../controllers/job.controller");

const router = Router();

// Get all open jobs + search/filter
router.get("/", jobsController.getAllJobs);

// Get single job
router.get("/:jobId", jobsController.getJobById);

module.exports = router;
