const AsyncHandler = require("../utils/AsyncHandler");
const ApiResponse = require("../utils/ApiResponse");

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
    console.dir(response);

    return res.status(200).json(response);
});

module.exports = {
    getAdminDashboard
};