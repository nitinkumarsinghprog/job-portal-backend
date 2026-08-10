const AsyncHandler = require("../utils/AsyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const Job = require("../models/job.model");
const Application = require("../models/application.model");

const uploadFile = require("../utils/uploadFile");

const applyForJob = AsyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const {
    workExperience,
    currentLocation,
    noticePeriod,
    currentSalary,
    expectedSalary,
    currentDesignation,
    coverLetter,
  } = req.body;

  // 1. Resume check
  if (!req.file) {
    throw new ApiError(400, "Resume is required");
  }

  // 2. Job check
  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  // 3. Job status check
  if (job.status !== "open") {
    throw new ApiError(400, "This job is no longer accepting applications");
  }

  // 4. Already applied check
  const existingApplication = await Application.findOne({
    candidate: req.user._id,
    job: jobId,
  });

  if (existingApplication) {
    throw new ApiError(409, "You have already applied for this job");
  }

  // 5. Upload resume
  const uploadedResume = await uploadFile(req.file.path);

  if (!uploadedResume) {
    throw new ApiError(500, "Resume upload failed");
  }

  // 6. Create application
  const application = await Application.create({
    candidate: req.user._id,
    job: jobId,
    resume: uploadedResume.secure_url,
    workExperience: Number(workExperience),
    currentLocation,
    noticePeriod: Number(noticePeriod),
    currentSalary: Number(currentSalary),
    expectedSalary: Number(expectedSalary),
    currentDesignation,
    coverLetter,
  });

  // 7. Populate response
  const createdApplication = await Application.findById(application._id)
    .populate("candidate", "name email role")
    .populate("job", "title company location salary jobType");

  const response = new ApiResponse(
    201,
    createdApplication,
    "Job application submitted successfully",
  );

  console.log("========== Apply For Job Response ==========");
  console.log(JSON.stringify(response, null, 2));

  return res.status(201).json(response);
});

const getMyApplications = AsyncHandler(async (req, res) => {
  const applications = await Application.find({
    candidate: req.user._id,
  })
    .populate("job", "title company location salary jobType status")
    .populate("candidate", "name email role")
    .sort({
      createdAt: -1,
    });

  const response = new ApiResponse(
    200,
    applications,
    "Applications fetched successfully",
  );

  console.log("========== My Applications ==========");
  console.log(JSON.stringify(response, null, 2));

  return res.status(200).json(response);
});

module.exports = {
  applyForJob,
  getMyApplications,
};
