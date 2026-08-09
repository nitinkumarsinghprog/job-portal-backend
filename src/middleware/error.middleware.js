const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {

    const statusCode =
        err instanceof ApiError
            ? err.statusCode
            : 500;

    const response = {
        success: false,
        statusCode,
        message: err.message || "Internal Server Error"
    };
    
    console.log("================ Error ==============");
    console.log(response)

    return res.status(statusCode).json(response);
};

module.exports = errorHandler;