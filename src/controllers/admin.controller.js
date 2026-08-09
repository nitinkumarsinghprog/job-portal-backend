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
    console.log(JSON.stringify(user, null, 2));

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
    console.log(JSON.stringify(user, null, 2));

    // 5. Response
    return res.status(201).json(response);
});

const getAllUsers = AsyncHandler(async (req, res) => {

    const { role, search } = req.query;

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter
    const filter = {};

    // Role filter
    if (role) {
        filter.role = role.trim().toLowerCase();
    }

    // Search filter
    if (search) {
        filter.$or = [
            {
                name: {
                    $regex: search.trim(),
                    $options: "i"
                }
            },
            {
                email: {
                    $regex: search.trim(),
                    $options: "i"
                }
            }
        ];
    }

    // Fetch users
    const users = await User
        .find(filter)
        .select("-password -refreshToken")
        .skip(skip)
        .limit(limit);

    // Total users after filters
    const totalUsers = await User.countDocuments(filter);

    const totalPages = Math.ceil(totalUsers / limit);

    const response = new ApiResponse(
        200,
        {
            users,
            pagination: {
                currentPage: page,
                limit,
                totalUsers,
                totalPages
            }
        },
        "Users fetched successfully"
    );

    console.log("========== Response of all users ==========");
    console.log(JSON.stringify(response, null, 2));

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

const updateUser = AsyncHandler(async (req, res) => {

    const { userId } = req.params;
    const { name, email, role } = req.body;

    // At least one field required
    if (!name && !email && !role) {
        throw new ApiError(
            400,
            "At least one field is required to update"
        );
    }

    // Admin can assign only candidate or recruiter
    if (
        role &&
        !["candidate", "recruiter"].includes(
            role.trim().toLowerCase()
        )
    ) {
        throw new ApiError(
            403,
            "You cannot assign admin role"
        );
    }

    const updateData = {};

    if (name) {
        updateData.name = name.trim();
    }

    if (email) {
        updateData.email = email.trim().toLowerCase();
    }

    if (role) {
        updateData.role = role.trim().toLowerCase();
    }

    const updatedUser = await User
        .findByIdAndUpdate(
            userId,
            {
                $set: updateData
            },
            {
                new: true,
                runValidators: true
            }
        )
        .select("-password -refreshToken");

    if (!updatedUser) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    const response = new ApiResponse(
        200,
        updatedUser,
        "User updated successfully"
    );

    console.log("========== Response of update user ==========");
    console.log(JSON.stringify(response, null, 2));

    return res.status(200).json(response);
});

const toggleUserBlockStatus = AsyncHandler(async (req, res) => {

    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    // Admin ko block nahi karna
    if (user.role === "admin") {
        throw new ApiError(
            403,
            "Admin user cannot be blocked"
        );
    }

    user.isBlocked = !user.isBlocked;

    await user.save({
        validateBeforeSave: false
    });

    const updatedUser = await User
        .findById(user._id)
        .select("-password -refreshToken");

    const response = new ApiResponse(
        200,
        updatedUser,
        user.isBlocked
            ? "User blocked successfully"
            : "User unblocked successfully"
    );

    console.log("========== Block/Unblock User ==========");
    console.log(JSON.stringify(response, null, 2));

    return res.status(200).json(response);
});

const deleteUser = AsyncHandler(async (req, res) => {

    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    // Admin ko delete nahi karna
    if (user.role === "admin") {
        throw new ApiError(
            403,
            "Admin user cannot be deleted"
        );
    }

    await User.findByIdAndDelete(userId);

    const response = new ApiResponse(
        200,
        {},
        "User deleted successfully"
    );

    console.log("========== Delete User ==========");
    console.log(JSON.stringify(response, null, 2));

    return res.status(200).json(response);
});

const getAdminStatistics = AsyncHandler(async (req, res) => {

    const totalUsers = await User.countDocuments();

    const totalCandidates = await User.countDocuments({
        role: "candidate"
    });

    const totalRecruiters = await User.countDocuments({
        role: "recruiter"
    });

    const totalAdmins = await User.countDocuments({
        role: "admin"
    });

    const blockedUsers = await User.countDocuments({
        isBlocked: true
    });

    const activeUsers = await User.countDocuments({
        isBlocked: false
    });

    const statistics = {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalAdmins,
        blockedUsers,
        activeUsers
    };

    const response = new ApiResponse(
        200,
        statistics,
        "Admin statistics fetched successfully"
    );

    console.log("========== Admin Statistics ==========");
    console.log(JSON.stringify(response, null, 2));

    return res.status(200).json(response);
});

module.exports = {
    getAdminDashboard,
    createRecruiter,
    getAllUsers,
    getUserById,
    updateUser,
    toggleUserBlockStatus,
    deleteUser,
    getAdminStatistics,
};