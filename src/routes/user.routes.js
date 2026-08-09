const { Router } = require("express");

const verifyJWT = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

const router = Router();

// Public Routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/refresh_token", userController.refreshAccessToken);


// Secure Routes
router.post("/logout", verifyJWT, userController.logoutUser);
router.post("/change_password", verifyJWT, userController.changeCurrentPassword);
router.get("/me", verifyJWT, userController.getCurrentUser);
router.delete("/me", verifyJWT, userController.deleteCurrentUser);

module.exports = router;