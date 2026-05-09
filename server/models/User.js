const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin", "transaction_admin", "super_admin"],
      default: "user",
    },
    referralCode: {
      type: String,
      unique: true,
      required: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    balance: {
      type: Number,
      default: 0,
    },
    totalDeposits: {
      type: Number,
      default: 0,
    },
    totalWithdrawals: {
      type: Number,
      default: 0,
    },
    totalCommissions: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    directReferrals: {
      type: Number,
      default: 0,
    },
    totalTeamSize: {
      type: Number,
      default: 0,
    },
    // VIP System
    vipLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 6,
    },
    vipBadge: {
      type: String,
      enum: [
        "none",
        "bronze",
        "silver",
        "gold",
        "platinum",
        "diamond",
        "master",
      ],
      default: "none",
    },
    vipMonthlyBonus: {
      type: Number,
      default: 0,
    },
    lastVipUpdate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    telegramChatId: {
      type: String,
      default: null,
    },
    preferredLanguage: {
      type: String,
      enum: ["am", "ti", "or", "en"],
      default: "am",
    },
  },
  {
    timestamps: true,
  },
);

// Virtual for checking if account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Update VIP level based on direct referrals
userSchema.methods.updateVipLevel = function () {
  const directReferrals = this.directReferrals;
  const totalTeamSize = this.totalTeamSize;
  let newVipLevel = 0;
  let newVipBadge = "none";
  let newVipMonthlyBonus = 0;

  if (directReferrals >= 40 && totalTeamSize >= 1000) {
    newVipLevel = 6;
    newVipBadge = "master";
    newVipMonthlyBonus = 150000;
  } else if (directReferrals >= 40 && totalTeamSize >= 540) {
    // 40 direct + 500 team (B+C)
    newVipLevel = 5;
    newVipBadge = "diamond";
    newVipMonthlyBonus = 80000;
  } else if (directReferrals >= 40) {
    newVipLevel = 4;
    newVipBadge = "platinum";
    newVipMonthlyBonus = 35000;
  } else if (directReferrals >= 30) {
    newVipLevel = 3;
    newVipBadge = "gold";
    newVipMonthlyBonus = 25000;
  } else if (directReferrals >= 20) {
    newVipLevel = 2;
    newVipBadge = "silver";
    newVipMonthlyBonus = 17000;
  } else if (directReferrals >= 10) {
    newVipLevel = 1;
    newVipBadge = "bronze";
    newVipMonthlyBonus = 10000;
  }

  this.vipLevel = newVipLevel;
  this.vipBadge = newVipBadge;
  this.vipMonthlyBonus = newVipMonthlyBonus;
  this.lastVipUpdate = new Date();

  return this.save();
};

// Generate referral code
userSchema.methods.generateReferralCode = function () {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = mongoose.model("User", userSchema);
