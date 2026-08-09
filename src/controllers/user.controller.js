
const AsyncHandler = require("../utils/AsyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const User = require("../models/user.model");

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

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

    // 3. Create user
    const user = await User.create({
        name,
        email,
        password,
        role: userRole
    });

    // 4. Fetch user without password
    const createdUser = await User
        .findById(user._id)
        .select("-password");

    if (!createdUser) {
        throw new ApiError(500, "User not created");
    }

    console.log("========== Response ==========");
    console.log(JSON.stringify(createdUser, null, 2));

    // 5. Send response
    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User created successfully"
        )
    );
});

const loginUser = AsyncHandler (async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        throw new ApiError(
            400,
            "Email and password are required"
        );
    }

    const user = await User.findOne({email});

    if (!user) {
        throw new ApiError(401, "Invalid user credentials");
    };

    const isPassword = await user.isPasswordCorrect(password);

    if(!isPassword) {
        throw new ApiError(401, "Invalid user credentials");
    };

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    console.log("========== Response Login ==========");
    console.log(JSON.stringify(loggedInUser, null, 2));

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    // return the response
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    );

});

module.exports = {
    registerUser,
    loginUser
};