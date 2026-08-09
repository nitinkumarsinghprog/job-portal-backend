const bcrypt = require("bcrypt");

const AsyncHandler = require("../utils/AsyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const User = require("../models/user.model");

const registerUser = AsyncHandler(async (req, res) => {

    const { name, email, password, role } = req.body;

    const userRole = role?.trim() || "candidate";

    // 1. Validate required fields
    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // 2. Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(
            409,
            "User with this email already exists"
        );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: userRole
    });

    // 5. Fetch user without password
    const createdUser = await User
        .findById(user._id)
        .select("-password");

    if (!createdUser) {
        throw new ApiError(500, "User not created");
    }

    console.log("========== Response ==========");
    console.log(JSON.stringify(createdUser, null, 2));

    // 6. Send response
    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User created successfully"
        )
    );
});

module.exports = registerUser;