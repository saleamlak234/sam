const express = require("express");
const User = require("../models/User");
const Deposit = require("../models/Deposit");
const Commission = require("../models/Commission");
const MerchantAccount = require("../models/MerchantAccount");
const telegramService = require("../services/telegram");

const router = express.Router();

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { fullName, phoneNumber },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// Link Telegram account
router.post("/link-telegram", async (req, res) => {
  try {
    const { telegramChatId } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { telegramChatId },
      { new: true },
    ).select("-password");

    res.json({
      message: "Telegram account linked successfully",
      user,
    });
  } catch (error) {
    console.error("Link Telegram error:", error);
    res.status(500).json({ message: "Server error linking Telegram account" });
  }
});

// Get user's merchant accounts
router.get("/merchant-accounts", async (req, res) => {
  try {
    const userId = req.user._id;
    const merchantAccounts = await MerchantAccount.find({
      user: userId,
      isActive: true,
    });
    res.json({ merchantAccounts });
  } catch (error) {
    console.error("Get merchant accounts error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching merchant accounts" });
  }
});

// Add merchant account
router.post("/merchant-accounts", async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      type,
      accountNumber,
      accountName,
      bankName,
      phoneNumber,
      instructions,
    } = req.body;

    const account = new MerchantAccount({
      user: userId,
      name,
      type,
      accountNumber,
      accountName,
      bankName: type === "bank" ? bankName : undefined,
      phoneNumber: type === "mobile_money" ? phoneNumber : undefined,
      instructions: instructions || "",
    });

    await account.save();
    res
      .status(201)
      .json({ message: "Merchant account added successfully", account });
  } catch (error) {
    console.error("Add merchant account error:", error);
    res.status(500).json({ message: "Server error adding merchant account" });
  }
});

// Update merchant account
router.put("/merchant-accounts/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const updates = req.body;

    const account = await MerchantAccount.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true },
    );

    if (!account) {
      return res.status(404).json({ message: "Merchant account not found" });
    }

    res.json({ message: "Merchant account updated successfully", account });
  } catch (error) {
    console.error("Update merchant account error:", error);
    res.status(500).json({ message: "Server error updating merchant account" });
  }
});

// Delete merchant account
router.delete("/merchant-accounts/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const account = await MerchantAccount.findOneAndUpdate(
      { _id: id, user: userId },
      { isActive: false },
      { new: true },
    );

    if (!account) {
      return res.status(404).json({ message: "Merchant account not found" });
    }

    res.json({ message: "Merchant account deleted successfully" });
  } catch (error) {
    console.error("Delete merchant account error:", error);
    res.status(500).json({ message: "Server error deleting merchant account" });
  }
});

// Get pending initial deposits from direct referrals
router.get("/referral-deposits", async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all direct referrals
    const referrals = await User.find({ referredBy: userId }).select("_id");

    if (referrals.length === 0) {
      return res.json({ deposits: [] });
    }

    const referralIds = referrals.map((r) => r._id);

    // Get pending initial deposits (not upgrades) from these referrals
    const deposits = await Deposit.find({
      user: { $in: referralIds },
      status: "pending",
      upgradedFrom: null, // Only initial deposits
    })
      .populate("user", "fullName level")
      .populate("merchantAccount")
      .sort({ createdAt: -1 });

    res.json({ deposits });
  } catch (error) {
    console.error("Get referral deposits error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching referral deposits" });
  }
});

// Approve or reject referral initial deposit
router.post("/referral-deposits/:depositId", async (req, res) => {
  try {
    const { depositId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'
    const userId = req.user._id;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    // Find the deposit
    const deposit = await Deposit.findById(depositId).populate("user");
    if (!deposit) {
      return res.status(404).json({ message: "Deposit not found" });
    }

    if (deposit.status !== "pending" || deposit.upgradedFrom) {
      return res
        .status(400)
        .json({ message: "Deposit is not a pending initial deposit" });
    }

    // Check if the deposit is from a direct referral
    if (deposit.user.referredBy.toString() !== userId.toString()) {
      return res.status(403).json({
        message:
          "You can only approve initial deposits from your direct referrals",
      });
    }

    // Update deposit
    deposit.status = action === "approve" ? "completed" : "rejected";
    deposit.processedBy = userId;
    deposit.processedAt = new Date();
    if (action === "reject" && rejectionReason) {
      deposit.rejectionReason = rejectionReason;
    }
    deposit.completedAt = action === "approve" ? new Date() : null;
    await deposit.save();

    if (action === "approve") {
      // Update user's total deposits
      await User.findByIdAndUpdate(deposit.user._id, {
        $inc: { totalDeposits: deposit.amount },
      });

      // Distribute commissions to entire referral chain: 8% parent, 6% grandparent, 4% great-grandparent
      let currentUser = await User.findById(deposit.user._id).populate(
        "referredBy",
      );
      const commissionRates = [0.08, 0.06, 0.04]; // 8%, 6%, 4%
      let level = 1;

      while (currentUser && currentUser.referredBy && level <= 3) {
        const referrer = await User.findById(currentUser.referredBy._id);
        const commissionAmount = deposit.amount * commissionRates[level - 1];

        if (commissionAmount > 0) {
          // Create commission record
          const commission = new Commission({
            user: referrer._id,
            fromUser: deposit.user._id,
            amount: commissionAmount,
            level: level,
            type: "deposit",
            description: `Commission for ${level === 1 ? "direct child" : level === 2 ? "grandchild" : "great-grandchild"} deposit approval`,
            sourceTransaction: deposit._id,
            sourceModel: "Deposit",
          });

          await commission.save();

          // Update referrer's balance and commission total
          await User.findByIdAndUpdate(referrer._id, {
            $inc: {
              balance: commissionAmount,
              totalCommissions: commissionAmount,
            },
          });

          // Send notification to referrer
          if (referrer.telegramChatId) {
            await telegramService.sendMessage(
              referrer.telegramChatId,
              `💰 Commission earned!\n` +
                `Amount: ${commissionAmount.toLocaleString()} ETB (${(commissionRates[level - 1] * 100).toFixed(0)}%)\n` +
                `From ${deposit.user.fullName}'s deposit`,
            );
          }
        }

        // Move to next level
        currentUser = referrer;
        level++;
      }
    }

    // Send notification to the child
    if (deposit.user.telegramChatId) {
      const message =
        action === "approve"
          ? `✅ Your initial deposit has been approved by your referrer!`
          : `❌ Your initial deposit has been rejected. Reason: ${rejectionReason || "Not specified"}`;
      await telegramService.sendMessage(deposit.user.telegramChatId, message);
    }

    res.json({ message: `Deposit ${action}d successfully`, deposit });
  } catch (error) {
    console.error("Process referral deposit error:", error);
    res.status(500).json({ message: "Server error processing deposit" });
  }
});

module.exports = router;
