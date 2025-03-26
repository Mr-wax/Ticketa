import User from "../Models/UserModel.js";
import mongoose from "mongoose";
import generateTokenAndSetCookie from "../Utils/generateTokenAndSetCookies.js";
import crypto from "crypto";
import { sendMail } from "../Utils/Mailer.js";
import { signUpValidator, signInValidator, formatZodError } from "../Validators/AuthValidator.js";



const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


export const registerUser = async (req, res) => {
  // Validate request body using Zod
  const registerResults = signUpValidator.safeParse(req.body);
  if (!registerResults.success) {
    return res.status(400).json(formatZodError(registerResults.error.issues));
  }

  try {
    const { firstname, lastname, email, password, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password using crypto
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    // Generate OTP and expiration time
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Create new user
    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phoneNumber,
      otp,
      otpExpiry,
      isVerified: false, // Ensures verification is required
    });

    await newUser.save();
    console.log("User registered successfully:", newUser);

    // Email template
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f4f4f4;">
  
  <!-- Header -->
  <div style="text-align: center; background: linear-gradient(135deg, #007bff, #0056b3); padding: 20px; border-radius: 10px 10px 0 0;">
    <h2 style="color: #fff; margin: 0; font-size: 24px;">Welcome to <span style="color: #ffd700;">Tixhub</span> 🎟️</h2>
  </div>
  
  <!-- Body -->
  <div style="padding: 20px; background-color: #fff; border-radius: 0 0 10px 10px; text-align: center;">
    <p style="font-size: 16px; color: #333;">Thank you for signing up! Use the OTP below to verify your email and access exciting events.</p>

    <!-- OTP Box -->
    <div style="font-size: 26px; font-weight: bold; color: #007bff; background-color: #f8f9fa; padding: 15px; border-radius: 8px; display: inline-block; margin: 20px auto; border: 2px dashed #007bff;">
      ${otp}
    </div>

    <p style="font-size: 14px; color: #555;">This OTP is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>

    <br/>
    <p style="font-size: 14px; color: #777;">Best regards,</p>
    <p style="font-size: 16px; font-weight: bold; color: #007bff;">Tixhub Team</p>

    <!-- Footer -->
    <div style="margin-top: 20px; font-size: 12px; color: #aaa; text-align: center;">
      <p>&copy; 2025 Tixhub. All rights reserved.</p>
    </div>
  </div>
</div>
 `;

    // Send verification email
    await sendMail(email, "Verify Your Account - Tixhub", emailTemplate);


    res.status(200).json({ message: "User registered successfully. Check your email for OTP.", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
    console.log("INTERNAL SERVER ERROR:", error.message);
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Debugging logs (remove in production)
    console.log("Stored OTP:", user.otp);
    console.log("Received OTP:", otp);
    console.log("Stored OTP Expiry:", user.otpExpiry);
    console.log("Current Time:", new Date());

    // Fix: Ensure correct OTP comparison and expiry check
    if (user.otp !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > new Date(user.otpExpiry).getTime()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists and is not already verified
    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
      return res.status(400).json({ message: "User not found or already verified" });
    }

    // Generate new OTP
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = newOTP;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // Styled HTML template for the OTP email
    const otpEmailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f4f4f4;">
        
        <!-- Header -->
        <div style="text-align: center; background: linear-gradient(135deg, #007bff, #0056b3); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: #fff; margin: 0; font-size: 24px;">Tixhub - OTP Resend 🎟️</h2>
        </div>

        <!-- Body -->
        <div style="padding: 20px; background-color: #fff; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="font-size: 16px; color: #333;">Here is your new OTP to verify your email:</p>

          <!-- OTP Box -->
          <div style="font-size: 26px; font-weight: bold; color: #007bff; background-color: #f8f9fa; padding: 15px; border-radius: 8px; display: inline-block; margin: 20px auto; border: 2px solid #007bff;">
            ${newOTP}
          </div>

          <p style="font-size: 14px; color: #555;">This OTP is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>

          <br/>
          <p style="font-size: 14px; color: #777;">Best regards,</p>
          <p style="font-size: 16px; font-weight: bold; color: #007bff;">Tixhub Team</p>

          <!-- Footer -->
          <div style="margin-top: 20px; font-size: 12px; color: #aaa; text-align: center;">
            <p>&copy; 2025 Tixhub. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    // Send the OTP via email with the styled template
    await sendMail(email, "Resend OTP", otpEmailTemplate);

    res.status(200).json({ message: "A new OTP has been sent to your email." });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const validation = signInValidator.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json(formatZodError(validation.error.issues));
  }

  try {
    const { email, password } = validation.data;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the provided password using crypto (assuming SHA-256)
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    console.log("Provided password:", password);
    console.log("Hashed provided password:", hashedPassword);
    console.log("Stored hashed password:", user.password);

    // Compare hashed passwords
    const isPasswordValid = user.password === hashedPassword;
    console.log("Password validation result:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

    // Generate token and set cookie
    const accessToken = generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      message: "User logged in successfully",
      accessToken,
      user,
    });

    console.log("User logged in successfully:", user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
    console.log("INTERNAL SERVER ERROR:", error.message);
  }
};
// Request Password Reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP for password reset
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = resetOTP;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // Email template for password reset
    const resetEmailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f4f4f4;">
        <div style="text-align: center; background: linear-gradient(135deg, #007bff, #0056b3); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: #fff; margin: 0;">Password Reset Request</h2>
        </div>
        <div style="padding: 20px; background-color: #fff; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="font-size: 16px; color: #333;">You requested a password reset. Use the OTP below to reset your password.</p>
          <div style="font-size: 26px; font-weight: bold; color: #007bff; background-color: #f8f9fa; padding: 15px; border-radius: 8px; display: inline-block; margin: 20px auto; border: 2px dashed #007bff;">
            ${resetOTP}
          </div>
          <p style="font-size: 14px; color: #555;">This OTP is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
          <p style="font-size: 14px; color: #777;">Best regards,</p>
          <p style="font-size: 16px; font-weight: bold; color: #007bff;">Tixhub Team</p>
        </div>
      </div>
    `;

    // Send OTP via email
    await sendMail(email, "Password Reset - Tixhub", resetEmailTemplate);

    res.status(200).json({ message: "OTP sent to your email for password reset." });
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP is valid
    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password using crypto
    const hashedPassword = crypto.createHash("sha256").update(newPassword).digest("hex");

    // Update user's password and clear OTP
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId; // Extracted from the authenticated user
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await User.findById(new mongoose.Types.ObjectId(userId));;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the current password for comparison
    const hashedCurrentPassword = crypto.createHash("sha256").update(currentPassword).digest("hex");

    // Check if the provided current password is correct
    if (user.password !== hashedCurrentPassword) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Hash the new password before updating
    const hashedNewPassword = crypto.createHash("sha256").update(newPassword).digest("hex");
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie('token'); 
  res.status(200).json({ message: 'User logged out successfully' });
};

