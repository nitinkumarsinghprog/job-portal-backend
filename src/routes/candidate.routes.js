const { Router } = require("express");

const verifyJWT = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const upload = require("../middleware/multer.middleware");

const candidateController = require("../controllers/candidate.controller");

const router = Router();

// Apply for the Job
router.post(
  "/jobs/:jobId/apply",
  verifyJWT,
  authorizeRoles("candidate"),
  upload.single("resume"),
  candidateController.applyForJob,
);

// My Applications
router.get(
  "/applications",
  verifyJWT,
  authorizeRoles("candidate"),
  candidateController.getMyApplications,
);

module.exports = router;
