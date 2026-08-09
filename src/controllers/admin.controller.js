const AsyncHandler = require("../utils/AsyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");

const getAdminDashboard = AsyncHandler(async (req, res) => {

    const response =  new ApiResponse(
            200,
            {
                user: req.user,
                message: "Welcome to Admin Dashboard"
            },
            "Admin dashboard fetched successfully"
        );

    console.log("========== Get Current User Response ==========");
    console.lop(JSON.stringify(user, null, 2));

    return res.status(200).json(response);
});

const createRecruiter = AsyncHandler(async (req, res) => {

    const { name, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
        throw new ApiError(
            400,
            "Name, email and password are required"
        );
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(
            409,
            "User with this email already exists"
        );
    }

    // 3. Create recruiter
    const recruiter = await User.create({
        name,
        email,
        password,
        role: "recruiter"
    });

    // 4. Remove password from response
    const createdRecruiter = await User
        .findById(recruiter._id)
        .select("-password -refreshToken");

    if (!createdRecruiter) {
        throw new ApiError(
            500,
            "Recruiter was not created"
        );
    }

    const response =  new ApiResponse(
            201,
            createdRecruiter,
            "Recruiter created successfully"
        );

    console.log("========== Response of create Recruiter ==========");
    console.lop(JSON.stringify(user, null, 2));

    // 5. Response
    return res.status(201).json(response);
});

const getAllUsers = AsyncHandler(async (req, res) => {

    const users = await User
        .find()
        .select("-password -refreshToken");

    const response =  new ApiResponse(
            200,
            users,
            "Users fetched successfully"
        );

    console.log("========== Response of all user ==========");
    console.lop(JSON.stringify(user, null, 2));

    return res.status(200).json(response);
});

const getUserById = AsyncHandler(async (req,res) => {

    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -refreshToken");

    if(!user) {
        throw new ApiError(404, "User not Found");
    };

    const response = new ApiResponse(200, user, "User fetch successfully");

    console.log("========== Response of get User By ID ==========");
    console.log(JSON.stringify(user, null, 2));

    return res.status(200).json(response);
});

module.exports = {
    getAdminDashboard,
    createRecruiter,
    getAllUsers,
    getUserById,
};