const { Router } = require("express");

const verifyJWT = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const adminController = require("../controllers/admin.controller");

const router = Router();

router.get(
    "/dashboard",
    verifyJWT,
    authorizeRoles("admin"),
    adminController.getAdminDashboard
);

module.exports = router;