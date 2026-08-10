const AsyncHandler = require("../utils/AsyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const Job = require("../models/job.model");

// Get all open jobs + search/filter
const getAllJobs = AsyncHandler(async (req, res) => {
  const { search, location, jobType, minSalary, maxSalary, experience, skill } =
    req.query;

  const filter = {
    status: "open",
  };

  // Search by job title or company
  if (search) {
    filter.$or = [
      {
        title: {
          $regex: search,
          $options: "i",
        },
      },
      {
        company: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // Location filter
  if (location) {
    filter.location = {
      $regex: location,
      $options: "i",
    };
  }

  // Job type filter
  if (jobType) {
    filter.jobType = jobType.trim().toLowerCase();
  }

  // Salary filter
  if (minSalary || maxSalary) {
    filter.salary = {};

    if (minSalary) {
      filter.salary.$gte = Number(minSalary);
    }

    if (maxSalary) {
      filter.salary.$lte = Number(maxSalary);
    }
  }

  // Experience filter
  if (experience) {
    filter.experience = {
      $regex: experience,
      $options: "i",
    };
  }

  // Skill filter
  if (skill) {
    filter.skills = {
      $regex: skill,
      $options: "i",
    };
  }

  const jobs = await Job.find(filter)
    .populate("postedBy", "name email role")
    .sort({
      createdAt: -1,
    });

  const response = new ApiResponse(200, jobs, "Jobs fetched successfully");

  console.log("========== Get All Jobs ==========");

  console.log(JSON.stringify(response, null, 2));

  return res.status(200).json(response);
});

// Get single job
const getJobById = AsyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId).populate("postedBy", "name email role");

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const response = new ApiResponse(200, job, "Job fetched successfully");

  console.log("========== Get Job By ID ==========");

  console.log(JSON.stringify(response, null, 2));

  return res.status(200).json(response);
});

module.exports = {
  getAllJobs,
  getJobById,
};
