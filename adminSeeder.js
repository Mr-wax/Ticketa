import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "./SRC/Models/UserModel.js";
import connectDB from "./SRC/Database/Db.js";

dotenv.config();
connectDB();

const seedAdmin = async () => {
  try {
    // 🔹 Hash password using crypto
    const hashedPassword = crypto.createHash("sha256").update("Admin@123").digest("hex");

    const admin = new User({
      firstname: "Admin",
      lastname: "User",
      email: "admin@tixhub.com",
      password: hashedPassword,
      phoneNumber: "1234567890",
      role: "admin",
      isVerified: true,
    });

    await admin.save();
    console.log("✅ Admin user created successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
