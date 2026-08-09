const jwt = require("jsonwebtoken");

const AsyncHandler = require("../utils/AsyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");

const verifyJWT = AsyncHandler(async (req, res, next) => {

    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id)
        .select("-password -refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    req.user = user;

    next();
});

module.exports = verifyJWT;