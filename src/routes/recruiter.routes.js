
const { Router } = require("express");

const verifyJWT = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const recruiterController = require("../controllers/recruiter.controller");

const router = Router();

router.post(
    "/jobs",
    verifyJWT,
    authorizeRoles("recruiter"),
    recruiterController.createJob,
);

router.get(
    "/jobs",
    verifyJWT,
    recruiterController.getAllJobs
);

router.get(
    "/my-jobs",
    verifyJWT,
    authorizeRoles("recruiter"),
    recruiterController.getMyJobs
);

router.get(
    "/jobs/:jobId",
    verifyJWT,
    authorizeRoles("recruiter"),
    recruiterController.getJobById
);

router.patch(
    "/jobs/:jobId",
    verifyJWT,
    authorizeRoles("recruiter"),
    recruiterController.updateJob
);

router.patch(
    "/jobs/:jobId/close",
    verifyJWT,
    authorizeRoles("recruiter"),
    recruiterController.closeJob
);

module.exports = router;

