const { Router } = require("express");

const verifyJWT = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const adminController = require("../controllers/admin.controller");

const router = Router();

// Admin Dashboard
router.get(
    "/dashboard",
    verifyJWT,
    authorizeRoles("admin"),
    adminController.getAdminDashboard
);

// Create Recruiter
router.post(
    "/recruiters",
    verifyJWT,
    authorizeRoles("admin"),
    adminController.createRecruiter
);

// Get All User
router.get(
    "/users",
    verifyJWT,
    authorizeRoles("admin"),
    adminController.getAllUsers
);

// Get User by ID
router.get(
    "/users/:userId",
    verifyJWT,
    authorizeRoles("admin"),
    adminController.getUserById
);

module.exports = router;