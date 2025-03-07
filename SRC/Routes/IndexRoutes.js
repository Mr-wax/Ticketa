import express from "express";
import authRoutes from "./auth/Authroute.js"; // Import the correct route

const router = express.Router(); // Fix capitalization

router.use("/auth", authRoutes); // Ensure you're using the correct variable name

export default router;
