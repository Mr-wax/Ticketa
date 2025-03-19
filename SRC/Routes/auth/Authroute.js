import express from "express";
import { registerUser, verifyOTP, loginUser, resendOTP,forgotPassword,resetPassword, updatePassword, logoutUser} from "../../Controllers/AuthController.js";
import protectRoute from "../../Middlewares/ProtectRoute.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP); // New route to resend OTP
router.post("/login", loginUser);
router.put("/updatePassword", protectRoute, updatePassword);
router.post("/logout", protectRoute, logoutUser);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);



export default router;
