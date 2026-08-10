const mongoose = require("mongoose");
const { Schema } = mongoose;

const jobSchema = new Schema (
    {
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true
        },

        description: {
            type: String,
            required: [true, "Job description is required"],
            trim: true
        },

        company: {
            type: String,
            required: [true, "Company name is required"],
            trim: true
        },

        location: {
            type: String,
            required: [true, "Job location is required"],
            trim: true
        },

        salary: {
            type: Number,
            required: [true, "Salary is required"],
            min: [0, "Salary cannot be negative"]
        },

        jobType: {
            type: String,
            enum: ["full-time", "part-time", "contract", "internship"],
            required: [true, "Job type is required"],
            lowercase: true,
            trim: true
        },

        experience: {
            type: String,
            required: [true, "Experience is required"],
            trim: true
        },

        skills: {
            type: [String],
            required: [true, "At least one skill is required"]
        },

        postedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open"
        }
    },
    {timestamps:true}
);

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;