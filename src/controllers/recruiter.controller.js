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

const getJobById = AsyncHandler(async (req, res) => {

    const { jobId } = req.params;

    const job = await Job
        .findById(jobId)
        .populate("postedBy", "name email role");

    if (!job) {
        throw new ApiError(
            404,
            "Job not found"
        );
    }

    const response = new ApiResponse(
        200,
        job,
        "Job fetched successfully"
    );

    console.log("========== Get Job By ID ==========");
    console.log(JSON.stringify(response, null, 2));

    return res
        .status(200)
        .json(response);
});

const updateJob = AsyncHandler(async (req, res) => {

    const { jobId } = req.params;

    const {
        title,
        description,
        company,
        location,
        salary,
        jobType,
        experience,
        skills,
        status
    } = req.body;

    // 1. Find job
    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(
            404,
            "Job not found"
        );
    }

    // 2. Check job ownership
    if (job.postedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not allowed to update this job"
        );
    }

    // 3. At least one field should be provided
    if (
        title === undefined &&
        description === undefined &&
        company === undefined &&
        location === undefined &&
        salary === undefined &&
        jobType === undefined &&
        experience === undefined &&
        skills === undefined &&
        status === undefined
    ) {
        throw new ApiError(
            400,
            "At least one field is required to update"
        );
    }

    // 4. Validate skills
    if (
        skills !== undefined &&
        (!Array.isArray(skills) || skills.length === 0)
    ) {
        throw new ApiError(
            400,
            "Skills must contain at least one skill"
        );
    }

    // 5. Update only provided fields
    if (title !== undefined) {
        job.title = title.trim();
    }

    if (description !== undefined) {
        job.description = description.trim();
    }

    if (company !== undefined) {
        job.company = company.trim();
    }

    if (location !== undefined) {
        job.location = location.trim();
    }

    if (salary !== undefined) {
        job.salary = salary;
    }

    if (jobType !== undefined) {
        job.jobType = jobType.trim().toLowerCase();
    }

    if (experience !== undefined) {
        job.experience = experience.trim();
    }

    if (skills !== undefined) {
        job.skills = skills;
    }

    if (status !== undefined) {
        job.status = status.trim().toLowerCase();
    }

    // 6. Save updated job
    await job.save();

    // 7. Populate recruiter details
    const updatedJob = await Job
        .findById(job._id)
        .populate("postedBy", "name email role");

    const response = new ApiResponse(
        200,
        updatedJob,
        "Job updated successfully"
    );

    console.log("========== Update Job Response ==========");
    console.log(JSON.stringify(response, null, 2));

    return res
        .status(200)
        .json(response);
});

const closeJob = AsyncHandler(async (req, res) => {

    const { jobId } = req.params;

    // 1. Find job
    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(
            404,
            "Job not found"
        );
    }

    // 2. Check ownership
    if (
        job.postedBy.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not allowed to close this job"
        );
    }

    // 3. Check already closed
    if (job.status === "closed") {
        throw new ApiError(
            400,
            "Job is already closed"
        );
    }

    // 4. Close job
    job.status = "closed";

    await job.save();

    // 5. Get updated job with recruiter details
    const updatedJob = await Job
        .findById(job._id)
        .populate("postedBy", "name email role");

    const response = new ApiResponse(
        200,
        updatedJob,
        "Job closed successfully"
    );

    console.log("========== Close Job Response ==========");
    console.log(JSON.stringify(response, null, 2));

    return res
        .status(200)
        .json(response);
});


module.exports = {
    createJob,
    getAllJobs,
    getMyJobs,
    getJobById,
    updateJob,
    closeJob,
};