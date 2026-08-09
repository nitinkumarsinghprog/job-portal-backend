const ApiError = require("../utils/ApiError");

const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        // verifyJWT middleware se req.user aana chahiye
        if (!req.user) {
            throw new ApiError(
                401,
                "Unauthorized request"
            );
        }

        // Check whether user's role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                "You do not have permission to access this resource"
            );
        }

        // User has required role
        next();
    };
};

module.exports = authorizeRoles;