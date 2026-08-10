
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

module.exports = router;

