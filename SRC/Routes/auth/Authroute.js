import express from "express";
import { registerUser, verifyOTP, loginUser, resendOTP } from "../../Controllers/AuthController.js";
import protectRoute from "../../Middlewares/ProtectRoute.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP); // New route to resend OTP
router.post("/login", loginUser);

export default router;
