import User from "../Models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendMail } from "../Utils/Mailer.js";
import { signUpValidator, signInValidator, formatZodError } from "../Validators/AuthValidator.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerUser = async (req, res) => {
  try {
    const validation = signUpValidator.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: formatZodError(validation.error.issues) });
    }

    const { firstname, lastname, email, password, phoneNumber } = validation.data;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phoneNumber,
      otp,
      otpExpiry,
    });

    // Use a well-styled email template with the OTP displayed
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f4f4f4;">
  
  <!-- Header -->
  <div style="text-align: center; background: linear-gradient(135deg, #007bff, #0056b3); padding: 20px; border-radius: 10px 10px 0 0;">
    <h2 style="color: #fff; margin: 0; font-size: 24px;">Welcome to <span style="color: #ffd700;">Ticketa</span> 🎟️</h2>
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
    <p style="font-size: 16px; font-weight: bold; color: #007bff;">Ticketa Team</p>

    <!-- Footer -->
    <div style="margin-top: 20px; font-size: 12px; color: #aaa; text-align: center;">
      <p>&copy; 2025 Ticketa. All rights reserved.</p>
    </div>
  </div>
</div>
 `;

    await sendMail(email, "Verify Your Account - Ticketa", emailTemplate);

    res.status(201).json({ message: "User registered successfully. Check your email for OTP." });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
          <h2 style="color: #fff; margin: 0; font-size: 24px;">Ticketa - OTP Resend 🎟️</h2>
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
          <p style="font-size: 16px; font-weight: bold; color: #007bff;">Ticketa Team</p>

          <!-- Footer -->
          <div style="margin-top: 20px; font-size: 12px; color: #aaa; text-align: center;">
            <p>&copy; 2025 Ticketa. All rights reserved.</p>
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
  try {
    const validation = signInValidator.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: formatZodError(validation.error.issues) });
    }

    const { email, password } = validation.data;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

    res.status(200).json({
      message: "User logged in successfully",
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
