 const express = require("express");
const Withdrawal = require("../models/Withdrawal");
const WithdrawalSchedule = require("../models/WithdrawalSchedule");
const User = require("../models/User");
const telegramService = require("../services/telegram");

const router = express.Router();

// VAT rate (15%)
const VAT_RATE = 0.15;

// Predefined withdrawal packages
const WITHDRAWAL_PACKAGES = [
  { id: "basic", amount: 200, label: "Basic Package" },
  { id: "starter", amount: 700, label: "Starter Package" },
  { id: "standard", amount: 2000, label: "Standard Package" },
  { id: "premium", amount: 7000, label: "Premium Package" },
  { id: "advanced", amount: 20000, label: "Advanced Package" },
  { id: "professional", amount: 70000, label: "Professional Package" },
  { id: "enterprise", amount: 200000, label: "Enterprise Package" },
  { id: "elite", amount: 700000, label: "Elite Package" },
];

// Check withdrawal schedule for Nairobi timezone and 10AM-5PM
const isWithdrawalAllowed = async () => {
  try {
    // Only allow Africa/Nairobi timezone
    const schedule = await WithdrawalSchedule.findOne({
      isActive: true,
      timezone: "Africa/Nairobi",
    });
    // If no schedule set, allow withdrawals (optional: you may want to disallow if not set)
    if (!schedule) return true;

    const now = new Date();
    // Get Nairobi time
    const nairobiTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Africa/Nairobi" })
    );
    const currentHour = nairobiTime.getHours();
    const dayOfWeek = nairobiTime.getDay(); // 0 = Sunday

    // Disallow withdrawals on Sundays
    // if (dayOfWeek === 0 && dayOfWeek ===6) {//
    //   return { allowed: false, reason: "Withdrawals are not allowed on Sundays" };
    // }
    // Disallow withdrawals on Saturdays and Sundays
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        allowed: false,
        reason: "Withdrawals are not allowed on Saturday and Sunday",
      };
    }
console.log("current day of week:", dayOfWeek, "current hour:", currentHour);
    // Only allow between 10AM and 5PM (inclusive)
    if (currentHour < 10 || currentHour >= 17) {
      return {
        allowed: false,
        reason:
          "Withdrawals are only allowed between 10:00 and 17:00 Nairobi time",
        startHour: 10,
        endHour: 17,
      };
    }

    // Optionally, you can check schedule.startHour and schedule.endHour if you want to allow admin to change them
    return { allowed: true };
  } catch (error) {
    console.error("Withdrawal schedule check error:", error);
    return { allowed: false, reason: "Internal server error" };
  }
};

// Check if user has already withdrawn today (in Nairobi time)
const hasWithdrawnToday = async (userId) => {
  const now = new Date();
  const nairobiNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Africa/Nairobi" })
  );
  // Set to start of Nairobi day
  nairobiNow.setHours(0, 0, 0, 0);
  const nairobiTomorrow = new Date(nairobiNow);
  nairobiTomorrow.setDate(nairobiTomorrow.getDate() + 1);

  const todayWithdrawal = await Withdrawal.findOne({
    user: userId,
    createdAt: {
      $gte: nairobiNow,
      $lt: nairobiTomorrow,
    },
  });

  return !!todayWithdrawal;
};

// Validate package
const validatePackage = (packageId) => {
  return WITHDRAWAL_PACKAGES.find((pkg) => pkg.id === packageId);
};

// Get withdrawal schedule
router.get("/schedule", async (req, res) => {
  try {
    const schedule = await WithdrawalSchedule.findOne({ isActive: true, timezone: "Africa/Nairobi" });
    res.json({ schedule });
  } catch (error) {
    console.error("Get withdrawal schedule error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching withdrawal schedule" });
  }
});

// Get user withdrawals
router.get("/", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ withdrawals });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    res.status(500).json({ message: "Server error fetching withdrawals" });
  }
});

// Create withdrawal request
router.post("/", async (req, res) => {
  try {
    const scheduleCheck = await isWithdrawalAllowed();
    if (!scheduleCheck.allowed) {
      return res.status(400).json({
        message: scheduleCheck.reason ||
          `Withdrawals are only allowed between ${scheduleCheck.startHour || 10}:00 and ${scheduleCheck.endHour || 17}:00 Nairobi time`,
      });
    }

    // Use Nairobi time for day of week check
    const now = new Date();
    const nairobiNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Africa/Nairobi" })
    );
    const dayOfWeek = nairobiNow.getDay();

    // Skip Sundays (already checked in isWithdrawalAllowed, but double check)
    if (dayOfWeek === 0) {
      return res
        .status(400)
        .json({ message: "Withdrawals are not allowed on Sundays" });
    }

    const { packageId, amount, paymentMethod, accountDetails } = req.body;
    const userId = req.user._id;

    // Validate package
    const packageData = validatePackage(packageId);
    if (!packageData) {
      return res
        .status(400)
        .json({ message: "Invalid withdrawal package selected" });
    }

    // Verify amount matches package
    if (amount !== packageData.amount) {
      return res
        .status(400)
        .json({ message: "Amount does not match selected package" });
    }

    // Check if user has already withdrawn today (in Nairobi time)
    const alreadyWithdrawn = await hasWithdrawnToday(userId);
    if (alreadyWithdrawn) {
      return res.status(400).json({
        message: "You can only make one withdrawal per day",
      });
    }

    // Validate minimum amount
    if (amount < 200) {
      return res
        .status(400)
        .json({ message: "Minimum withdrawal amount is 200 ETB" });
    }

    if (amount > req.user.balance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Calculate VAT and net amount
    const vatAmount = amount * VAT_RATE;
    const netAmount = amount - vatAmount;

    // Validate account details
    if (paymentMethod === "bank") {
      if (!accountDetails.accountNumber || !accountDetails.bankName) {
        return res
          .status(400)
          .json({ message: "Bank account details are required" });
      }
    } else if (paymentMethod === "telebirr") {
      if (!accountDetails.phoneNumber) {
        return res
          .status(400)
          .json({ message: "Phone number is required for TeleBirr" });
      }
    }

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      user: userId,
      packageId,
      packageLabel: packageData.label,
      amount,
      vatAmount,
      netAmount,
      paymentMethod,
      accountDetails,
    });

    await withdrawal.save();

    // Deduct amount from user balance (pending withdrawal)
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: -amount },
    });

    // Send notification to admin
    await telegramService.sendToAdmin(
      `💸 New withdrawal request:\n` +
        `User: ${req.user.fullName}\n` +
        `Package: ${packageData.label}\n` +
        `Gross Amount: ${amount.toLocaleString()} ETB\n` +
        `VAT (15%): ${vatAmount.toLocaleString()} ETB\n` +
        `Net Amount: ${netAmount.toLocaleString()} ETB\n` +
        `Method: ${paymentMethod}\n` +
        `Details: ${JSON.stringify(accountDetails, null, 2)}`
    );

    res.status(201).json({
      message: "Withdrawal request submitted successfully",
      withdrawal: {
        ...withdrawal.toObject(),
        vatAmount,
        netAmount,
      },
    });
  } catch (error) {
    console.error("Create withdrawal error:", error);
    res
      .status(500)
      .json({ message: "Server error creating withdrawal request" });
  }
});

module.exports = router;
