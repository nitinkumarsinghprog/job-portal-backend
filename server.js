const app = require("./src/app");
const dotenv = require("dotenv");
const connectDB = require("./src/db/index");

const PORT = process.env.PORT || 8000;

dotenv.config({
    path: ".env"
});

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        }); 
    })
    .catch((error) => {
         console.log("MongoDB connection error:", error);
    });
