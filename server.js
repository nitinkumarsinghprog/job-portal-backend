const dotenv = require("dotenv");

dotenv.config({
    path: ".env"
});

const app = require("./src/app");
const connectDB = require("./src/db/index");

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("❌ MongoDB connection error:", error);
    });