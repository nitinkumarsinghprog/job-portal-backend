
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

module.exports = router;

