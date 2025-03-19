import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./SRC/Models/UserModel.js";
import connectDB from "./SRC/Database/Db.js"

dotenv.config();
connectDB();

const seedAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = new User({
      firstname: "Admin",
      lastname: "User",
      email: "admin@ticketa.com",
      password: hashedPassword,
      phoneNumber: "1234567890",
      role: "admin",
      isVerified: true,
    });

    await admin.save();
    console.log("Admin user created successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
