const { Router } = require("express");
const verifyJWT = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

const router = Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Secure Routes
router.post("/logout", verifyJWT, userController.logoutUser);

module.exports = router;