const dotenv = require("dotenv");
const connectDB = require("../db");
const User = require("../models/user.model");

dotenv.config({
    path: ".env"
});

const createAdmin = async () => {

    try {

        await connectDB();

        const adminName = process.env.ADMIN_NAME;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        const existingAdmin = await User.findOne({
            email: adminEmail
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }

        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: "admin"
        });

        console.log("========== ADMIN CREATED ==========");
        console.log({
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        });

        process.exit(0);

    } catch (error) {

        console.error("Error creating admin:", error);

        process.exit(1);
    }
};

createAdmin();