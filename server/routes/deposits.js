const express = require("express");
const multer = require("multer");
const path = require("path");
const Deposit = require("../models/Deposit");
const MerchantAccount = require("../models/MerchantAccount");
const User = require("../models/User");
const telegramService = require("../services/telegram");

const router = express.Router();

// Package price map
// const packagePrices = {
//   "7th Stock Package": 192000,
//   "6th Stock Package": 96000,
//   "5th Stock Package": 48000,
//   "4th Stock Package": 24000,
//   "3rd Stock Package": 12000,
//   "2nd Stock Package": 6000,
//   "1st Stock Package": 3000,
// };
const packagePrices = {
  "8th Stock Package": 320000,
  "7th Stock Package": 160000,
  "6th Stock Package": 80000,
  "5th Stock Package": 40000,
  "4th Stock Package": 20000,
  "3rd Stock Package": 10000,
  "2nd Stock Package": 5000,
  "1st Stock Package": 2500,
};

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads", "receipts"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "receipt-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files (JPEG, JPG, PNG, GIF) and PDF files are allowed",
        ),
      );
    }
  },
});

// GET merchant accounts
router.get("/merchant-accounts", async (req, res) => {
  try {
    const { forUpgrade } = req.query;
    const user = await User.findById(req.user._id).populate("referredBy");
    let merchantAccounts = [];

    // For upgrades, always show admin accounts
    if (forUpgrade === "true") {
      const adminUsers = await User.find({
        role: { $in: ["admin", "transaction_admin", "super_admin"] },
      }).select("_id");
      const adminIds = adminUsers.map((admin) => admin._id);
      merchantAccounts = await MerchantAccount.find({
        user: { $in: adminIds },
        isActive: true,
      });
    } else {
      // For initial deposits, try referrer first, then admin fallback
      if (user && user.referredBy) {
        merchantAccounts = await MerchantAccount.find({
          user: user.referredBy._id,
          isActive: true,
        });
      }

      if (!merchantAccounts.length) {
        const adminUsers = await User.find({
          role: { $in: ["admin", "transaction_admin", "super_admin"] },
        }).select("_id");
        const adminIds = adminUsers.map((admin) => admin._id);
        merchantAccounts = await MerchantAccount.find({
          user: { $in: adminIds },
          isActive: true,
        });
      }
    }

    res.json({ merchantAccounts });
  } catch (error) {
    console.error("Get merchant accounts error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching merchant accounts" });
  }
});

// GET all user deposits
router.get("/", async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user._id })
      .populate("merchantAccount")
      .populate("upgradedTo")
      .populate("upgradedFrom")
      .sort({ createdAt: -1 });
    res.json({ deposits });
  } catch (error) {
    console.error("Get deposits error:", error);
    res.status(500).json({ message: "Server error fetching deposits" });
  }
});

// POST create new deposit
router.post("/", upload.single("receipt"), async (req, res) => {
  try {
    const {
      amount,
      package: packageName,
      paymentMethod,
      merchantAccountId,
      transactionReference,
    } = req.body;
    const userId = req.user._id;

    if (
      !packagePrices[packageName] ||
      parseInt(amount) !== packagePrices[packageName]
    ) {
      return res.status(400).json({ message: "Invalid package or amount" });
    }
    const merchantAccount = await MerchantAccount.findById(merchantAccountId);
    if (!merchantAccount || !merchantAccount.isActive) {
      return res
        .status(400)
        .json({ message: "Invalid merchant account selected" });
    }
    const deposit = new Deposit({
      user: userId,
      amount: parseInt(amount),
      totalAmount: parseInt(amount),
      package: packageName,
      paymentMethod,
      merchantAccount: merchantAccountId,
      receiptUrl: req.file ? `/uploads/receipts/${req.file.filename}` : null,
      transactionReference,
      status: "pending", // always start as pending!
      isUpgraded: false,
    });
    await deposit.save();

    // Get user with referredBy populated
    const user = await User.findById(userId).populate("referredBy");

    // Telegram notification to parent for initial deposits
    if (user.referredBy && user.referredBy.telegramChatId) {
      await telegramService.sendMessage(
        user.referredBy.telegramChatId,
        `💰 New deposit request from your referral:\n` +
          `User: ${user.fullName}\n` +
          `Package: ${packageName}\n` +
          `Amount: ${amount.toLocaleString()} ETB\n` +
          `Payment: ${paymentMethod}\n` +
          `Merchant: ${merchantAccount.name}\n` +
          `Reference: ${transactionReference || "N/A"}`,
      );
    } else {
      // If no referrer, send to admin
      await telegramService.sendToAdmin(
        `💰 New deposit request (no referrer):\n` +
          `User: ${req.user.fullName}\n` +
          `Package: ${packageName}\n` +
          `Amount: ${amount.toLocaleString()} ETB\n` +
          `Payment: ${paymentMethod}\n` +
          `Merchant: ${merchantAccount.name}\n` +
          `Reference: ${transactionReference || "N/A"}`,
      );
    }

    // Also send to admin for monitoring
    await telegramService.sendToAdmin(
      `💰 New deposit request (initial):\n` +
        `User: ${req.user.fullName}\n` +
        `Package: ${packageName}\n` +
        `Amount: ${amount.toLocaleString()} ETB\n` +
        `Payment: ${paymentMethod}\n` +
        `Merchant: ${merchantAccount.name}\n` +
        `Reference: ${transactionReference || "N/A"}`,
    );
    res
      .status(201)
      .json({ message: "Deposit request created successfully", deposit });
  } catch (error) {
    console.error("Create deposit error:", error);
    res.status(500).json({ message: "Server error creating deposit" });
  }
});

// POST upgrade latest eligible deposit to higher package
router.post(
  "/upgrade/:depositId",
  upload.single("receipt"),
  async (req, res) => {
    try {
      const { depositId } = req.params;
      const {
        newPackage, // string
        newAmount, // string, should be upgrade difference
        paymentMethod,
        merchantAccountId,
        transactionReference,
      } = req.body;
      const userId = req.user._id;

      // Validate depositId format
      if (!depositId || !depositId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid deposit ID format" });
      }

      // Always require upgrade on latest eligible deposit (not on old/partially upgraded chains)
      const latestDeposit = await Deposit.findOne({
        _id: depositId,
        user: userId,
        status: "completed",
        isUpgraded: false,
      }).populate("user");

      if (!latestDeposit) {
        // Could be already upgraded, not completed, or not user's deposit
        return res
          .status(404)
          .json({ message: "No eligible deposit found for upgrade!" });
      }

      // Validate target new package
      if (!packagePrices[newPackage]) {
        return res.status(400).json({ message: "Invalid package selected" });
      }
      const newPkgPrice = packagePrices[newPackage];
      const currentTotal = latestDeposit.totalAmount;

      // Must upgrade only "upwards"
      if (newPkgPrice <= currentTotal) {
        return res.status(400).json({
          message:
            "You can only upgrade to a higher value package than your current investment.",
        });
      }

      // Validate newAmount is the full new package price
      if (parseInt(newAmount) !== newPkgPrice) {
        return res.status(400).json({
          message: `Upgrade amount must be exactly ${newPkgPrice} ETB for this package.`,
        });
      }

      const requiredUpgradeAmount = newPkgPrice - currentTotal;

      // Validate merchant account
      const merchantAccount = await MerchantAccount.findById(merchantAccountId);
      if (!merchantAccount || !merchantAccount.isActive) {
        return res
          .status(400)
          .json({ message: "Invalid merchant account selected" });
      }

      // Create new "upgrade" deposit, chaining from latestDeposit
      const upgradeDeposit = new Deposit({
        user: userId,
        amount: newPkgPrice,
        totalAmount: newPkgPrice,
        package: newPackage,
        paymentMethod,
        merchantAccount: merchantAccountId,
        receiptUrl: req.file ? `/uploads/receipts/${req.file.filename}` : null,
        transactionReference,
        upgradedFrom: latestDeposit._id,
        status: "pending",
        isUpgraded: false,
      });
      await upgradeDeposit.save();

      // Mark original latestDeposit as upgraded and link
      latestDeposit.isUpgraded = true;
      latestDeposit.upgradedTo = upgradeDeposit._id;
      await latestDeposit.save();

      // Telegram for admin
      await telegramService.sendToAdmin(
        `📈 Package upgrade request:\n` +
          `User: ${req.user.fullName}\n` +
          `Original: ${latestDeposit.package} (${currentTotal.toLocaleString()} ETB)\n` +
          `Upgrade to: ${newPackage} (${newPkgPrice.toLocaleString()} ETB)\n` +
          `Package price: ${newPkgPrice.toLocaleString()} ETB\n` +
          `Payment: ${paymentMethod}\n` +
          `Reference: ${transactionReference || "N/A"}`,
      );
      res.status(201).json({
        message: "Package upgrade request submitted successfully",
        upgradeDeposit,
        previousDeposit: latestDeposit,
        packagePrice: newPkgPrice,
      });
    } catch (error) {
      console.error("Upgrade deposit error:", error);
      res
        .status(500)
        .json({ message: "Server error processing upgrade request" });
    }
  },
);

// GET latest eligible deposit for upgrade and valid targets
router.get("/upgradeable", async (req, res) => {
  try {
    // Only latest deposit: completed, not upgraded
    const latestDeposit = await Deposit.findOne({
      user: req.user._id,
      status: "completed",
      isUpgraded: false,
    })
      .populate("merchantAccount")
      .sort({ createdAt: -1 });

    let validUpgradePackages = [];
    if (latestDeposit) {
      validUpgradePackages = Object.entries(packagePrices)
        .filter(([name, price]) => price > latestDeposit.totalAmount)
        .map(([name, price]) => ({ name, price }));
    }
    res.json({
      upgradeableDeposit: latestDeposit,
      validUpgradePackages,
    });
  } catch (error) {
    console.error("Get upgradeable deposit error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching upgradeable deposit" });
  }
});

module.exports = router;
