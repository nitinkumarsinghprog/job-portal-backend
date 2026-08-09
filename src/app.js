const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Job Portal API is running",
  });
});

module.exports = app;