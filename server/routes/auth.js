const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const telegramService = require("../services/telegram");
const dotenv = require("dotenv");
const router = express.Router();
require("dotenv").config();
const sendEmail = require("../config/emailverification");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "30d",
  });
};

// Register
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      referralCode,
      paymentMethods,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Find referrer if referral code provided
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).json({ message: "Invalid referral code" });
      }
    }

    // Generate unique referral code
    let newReferralCode;
    let isUnique = false;
    while (!isUnique) {
      newReferralCode = generateReferralCode();
      const existing = await User.findOne({ referralCode: newReferralCode });
      if (!existing) isUnique = true;
    }

    // Create user
    const user = new User({
      fullName,
      email,
      phoneNumber,
      password,
      referralCode: newReferralCode,
      referredBy: referrer?._id,
      level: referrer ? referrer.level + 1 : 1,
    });

    await user.save();

    // Create merchant accounts if provided
    if (paymentMethods && Array.isArray(paymentMethods)) {
      const MerchantAccount = require("../models/MerchantAccount");
      for (const method of paymentMethods) {
        const account = new MerchantAccount({
          user: user._id,
          name: method.name,
          type: method.type,
          accountNumber: method.accountNumber,
          accountName: method.accountName,
          bankName: method.bankName,
          phoneNumber: method.phoneNumber,
          instructions: method.instructions || "",
        });
        await account.save();
      }
    }

    // Update referrer's direct referrals count
    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { directReferrals: 1, totalTeamSize: 1 },
      });

      // Update team sizes up the chain
      await updateTeamSizesUpChain(referrer._id);

      // Send welcome notification via Telegram
      if (referrer.telegramChatId) {
        await telegramService.sendMessage(
          referrer.telegramChatId,
          `🎉 New referral! ${fullName} just joined using your referral code.`,
        );
      }
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        message:
          "Account temporarily locked due to too many failed login attempts. Please try again later.",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Please contact support." });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Get current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetUrl = `http://www.sahamtradingplc.com/reset-password?token=${resetToken}`;
    const resetEmail = await sendEmail({
      sendTo: email,
      subject: "Password Reset Request",
      html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your Saham Trading account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>Saham Trading</p>
    `,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error sending reset email" });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error resetting password" });
  }
});

// Helper functions
function generateReferralCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function updateTeamSizesUpChain(userId) {
  const user = await User.findById(userId);
  if (user && user.referredBy) {
    await User.findByIdAndUpdate(user.referredBy, {
      $inc: { totalTeamSize: 1 },
    });
    await updateTeamSizesUpChain(user.referredBy);
  }
}

module.exports = router;
