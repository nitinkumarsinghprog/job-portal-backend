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
router.get("/get_user", verifyJWT, userController.getCurrentUser);
router.delete("/delete_user", verifyJWT, userController.deleteCurrentUser);

module.exports = router;