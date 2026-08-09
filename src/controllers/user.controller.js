const jwt = require("jsonwebtoken");

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

const logoutUser = AsyncHandler (async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    const response = new ApiResponse(
        200,
        {},
        "User logged out successfully"
    );

    console.log("========== Logout Response ==========");
    console.dir(response, { depth: null });

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(response);
});

const refreshAccessToken = AsyncHandler (async (req, res) =>{

    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is missing");
    };

    try {

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if(!user){
            throw new ApiError(401, "Invalid Refresh Token");
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is not valid");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

         const response = new ApiResponse(
                    200,
                    {
                        accessToken: accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access token refreshed successfully"
                )

        console.log("========== Refresh Access Token Response ==========");
        console.dir(response, { depth: null });

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json( response );

    } catch (error) {
        console.log("========== REFRESH TOKEN ERROR ==========");
        console.log(error);
        throw new ApiError(
            401,
            error.message || "Invalid or expired refresh token"
        );
        }
});

const changeCurrentPassword = AsyncHandler (async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    // 1. Validate input
    if (!oldPassword || !newPassword) {
        throw new ApiError(
            400,
            "Old password and new password are required"
        );
    }

    // 2. Find current user
    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    // 3. Verify old password
    const isPasswordCorrect =
        await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(
            401,
            "Old password is incorrect"
        );
    }

    // 4. Set new password
    user.password = newPassword;

    // 5. pre("save") will hash the password
    await user.save();

    const response = new ApiResponse(
        200, {}, "Password changed successfully"
    )

    console.log("========== Change Password Response ==========");
    console.dir(response, { depth: null });

    // 6. Response
    return res.status(200).json(response);
    
});

const getCurrentUser = AsyncHandler (async (req, res) => {

    const response =  new ApiResponse(200, req.user, "Current user fetched successfully")

    console.log("========== Get Current User Response ==========");
    console.dir(response, { depth: null });

    return res.status(200).json(response);
});

const deleteCurrentUser = AsyncHandler(async (req, res) => {

    const user = await User.findByIdAndDelete(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production"
            ? "none"
            : "lax"
    };

    const response =  new ApiResponse(200, req.user, "User account deleted successfully")

    console.log("========== Get Current User Response ==========");
    console.dir(response, { depth: null });

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(response);
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    deleteCurrentUser,
};