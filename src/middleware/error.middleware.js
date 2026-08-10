const ApiError = require("../utils/ApiError");
const removeTempFile = require("../utils/removeTempFile");

const errorHandler = async (err, req, res, next) => {

    // Multer writes the resume before later route validation runs. Always remove
    // it when the request ends with an error (including validation failures).
    await removeTempFile(req.file?.path);

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
