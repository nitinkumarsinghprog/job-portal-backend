const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error.middleware");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const recruiterRoutes = require("./routes/recruiter.routes");
const candidateRoutes = require("./routes/candidate.routes");

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Job Portal API is running",
  });
});

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/recruiter", recruiterRoutes);
app.use("/api/v1/candidate", candidateRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;