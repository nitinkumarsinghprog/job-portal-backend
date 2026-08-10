const mongoose = require("mongoose");

const { Schema } = mongoose;

const applicationSchema = new Schema(
    {
        candidate: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        job: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },

        resume: {
            type: String,
            required: [true, "Resume is required"],
            trim: true
        },

        workExperience: {
            type: Number,
            required: [true, "Work experience is required"],
            min: 0
        },

        currentLocation: {
            type: String,
            required: [true, "Current location is required"],
            trim: true
        },

        noticePeriod: {
            type: Number,
            required: [true, "Notice period is required"],
            min: 0
        },

        currentSalary: {
            type: Number,
            required: [true, "Current salary is required"],
            min: 0
        },

        expectedSalary: {
            type: Number,
            required: [true, "Expected salary is required"],
            min: 0
        },

        currentDesignation: {
            type: String,
            required: [true, "Current designation is required"],
            trim: true
        },

        coverLetter: {
            type: String,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "applied",
                "shortlisted",
                "rejected",
                "hired"
            ],
            default: "applied"
        },

        appliedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Same candidate same job par dobara apply nahi kar sakta
applicationSchema.index(
    {
        candidate: 1,
        job: 1
    },
    {
        unique: true
    }
);

const Application = mongoose.model(
    "Application",
    applicationSchema
);

module.exports = Application;