const AsyncHandler = require("../utils/AsyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const Job = require("../models/job.model");


const createJob = AsyncHandler(async (req, res) => {

    const {
        title,
        description,
        company,
        location,
        salary,
        jobType,
        experience,
        skills
    } = req.body;

    // 1. Validate required fields
    if (
        !title ||
        !description ||
        !company ||
        !location ||
        !salary ||
        !jobType ||
        !experience ||
        !skills
    ) {
        throw new ApiError(
            400,
            "All job fields are required"
        );
    }

    // 2. Validate skills
    if (!Array.isArray(skills) || skills.length === 0) {
        throw new ApiError(
            400,
            "At least one skill is required"
        );
    }

    // 3. Create Job
    const job = await Job.create({
        title,
        description,
        company,
        location,
        salary,
        jobType,
        experience,
        skills,
        postedBy: req.user._id  // Recruiter automatically comes from JWT
    });

    // 4. Get created job with recruiter details
    const createdJob = await Job
        .findById(job._id)
        .populate(
            "postedBy",
            "name email role"
    );

    if (!createdJob) {
        throw new ApiError(
            500,
            "Job was not created"
        );
    }

    // 5. Response
    const response = new ApiResponse(
        201,
        createdJob,
        "Job created successfully"
    );

    console.log("========== Create Job Response ==========");
    console.log(JSON.stringify(response, null, 2));

    return res.status(201).json(response);
});

const getAllJobs = AsyncHandler(async (req, res) => {

    const jobs = await Job
        .find({ status: "open" })
        .populate("postedBy", "name email role")
        .sort({ createdAt: -1 });

    const response = new ApiResponse(
        200,
        jobs,
        "Jobs fetched successfully"
    );

    console.log("========== Get All Jobs ==========");
    console.log(JSON.stringify(response, null, 2));

    return res
        .status(200)
        .json(response);
});

const getMyJobs = AsyncHandler(async (req, res) => {

    const jobs = await Job
        .find({
            postedBy: req.user._id
        })
        .populate("postedBy", "name email role")
        .sort({ createdAt: -1 });

    const response = new ApiResponse(
        200,
        jobs,
        "Your jobs fetched successfully"
    );

    console.log("========== Get My Jobs ==========");
    console.log(JSON.stringify(response, null, 2));

    return res
        .status(200)
        .json(response);
});


module.exports = {
    createJob,
    getAllJobs,
    getMyJobs,
};