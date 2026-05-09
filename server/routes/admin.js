const express = require("express");
const User = require("../models/User");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");
const WithdrawalSchedule = require("../models/WithdrawalSchedule");
const MerchantAccount = require("../models/MerchantAccount");
const Commission = require("../models/Commission");
const telegramService = require("../services/telegram");

const router = express.Router();

// Admin middleware to check permissions
const checkAdminPermission = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (requiredRole === "super_admin" && userRole !== "super_admin") {
      return res.status(403).json({ message: "Super admin access required" });
    }

    if (
      requiredRole === "transaction_admin" &&
      !["super_admin", "admin", "transaction_admin"].includes(userRole)
    ) {
      return res
        .status(403)
        .json({ message: "Transaction admin access required" });
    }

    if (
      requiredRole === "admin" &&
      !["super_admin", "admin"].includes(userRole)
    ) {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  };
};

// Get admin dashboard statistics
router.get("/stats", checkAdminPermission("admin"), async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Helper to get start and end of day/week/month
    function getPeriodRange(period) {
      const now = new Date();
      let start, end;
      if (period === "day") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (period === "week") {
        const day = now.getDay();
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - day,
        );
        end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + (7 - day),
        );
      } else if (period === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }
      return { start, end };
    }

    async function getTotals(period) {
      const { start, end } = getPeriodRange(period);
      const [depositResult] = await Deposit.aggregate([
        {
          $match: {
            status: "completed",
            completedAt: { $gte: start, $lt: end },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const [withdrawalResult] = await Withdrawal.aggregate([
        {
          $match: {
            status: "completed",
            completedAt: { $gte: start, $lt: end },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const totalDeposit = depositResult ? depositResult.total : 0;
      const totalWithdrawal = withdrawalResult ? withdrawalResult.total : 0;
      const revenue = totalDeposit - totalWithdrawal;
      return { totalDeposit, totalWithdrawal, revenue };
    }

    // Get totals for each period
    const daily = await getTotals("day");
    const weekly = await getTotals("week");
    const monthly = await getTotals("month");

    // Financial statistics (all time)
    const totalDepositsResult = await Deposit.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalWithdrawalsResult = await Withdrawal.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalCommissionsResult = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Pending transactions
    const pendingDeposits = await Deposit.countDocuments({ status: "pending" });
    const pendingWithdrawals = await Withdrawal.countDocuments({
      status: "pending",
    });

    // Recent transactions
    const recentTransactions = await Deposit.find()
      .populate("user", "fullName email")
      .populate("merchantAccount", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentWithdrawals = await Withdrawal.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5);

    // Combine transactions
    const allRecentTransactions = [
      ...recentTransactions.map((t) => ({
        id: t._id,
        type: "deposit",
        amount: t.amount,
        status: t.status,
        user: t.user,
        merchantAccount: t.merchantAccount,
        createdAt: t.createdAt,
      })),
      ...recentWithdrawals.map((t) => ({
        id: t._id,
        type: "withdrawal",
        amount: t.amount,
        status: t.status,
        user: t.user,
        createdAt: t.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Recent users
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      activeUsers,
      totalDeposits: totalDepositsResult[0]?.total || 0,
      totalWithdrawals: totalWithdrawalsResult[0]?.total || 0,
      totalCommissions: totalCommissionsResult[0]?.total || 0,
      pendingDeposits,
      pendingWithdrawals,
      // monthlyRevenue: monthlyRevenueResult[0]?.total || 0,
      recentTransactions: allRecentTransactions,
      recentUsers,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ message: "Server error fetching admin statistics" });
  }
});

// Get all users (Super Admin only)
router.get("/users", checkAdminPermission("super_admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// Update user status (Super Admin only)
router.put(
  "/users/:userId/status",
  checkAdminPermission("super_admin"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true },
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Send notification to user
      if (user.telegramChatId) {
        const message = isActive
          ? "✅ Your account has been activated!"
          : "❌ Your account has been deactivated. Please contact support.";

        await telegramService.sendMessage(user.telegramChatId, message);
      }

      res.json({ message: "User status updated successfully", user });
    } catch (error) {
      console.error("Update user status error:", error);
      res.status(500).json({ message: "Server error updating user status" });
    }
  },
);

// Get all transactions
router.get(
  "/transactions",
  checkAdminPermission("transaction_admin"),
  async (req, res) => {
    try {
      const deposits = await Deposit.find()
        .populate("user", "fullName email")
        .populate("merchantAccount", "name type")
        .sort({ createdAt: -1 });

      const withdrawals = await Withdrawal.find()
        .populate("user", "fullName email")
        .sort({ createdAt: -1 });

      // Combine and format transactions
      const transactions = [
        ...deposits.map((d) => ({
          id: d._id,
          type: "deposit",
          amount: d.amount,
          status: d.status,
          paymentMethod: d.paymentMethod,
          user: d.user,
          merchantAccount: d.merchantAccount,
          receiptUrl: d.receiptUrl,
          transactionReference: d.transactionReference,
          rejectionReason: d.rejectionReason,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })),
        ...withdrawals.map((w) => ({
          id: w._id,
          type: "withdrawal",
          amount: w.amount,
          status: w.status,
          paymentMethod: w.paymentMethod,
          user: w.user,
          accountDetails: w.accountDetails,
          rejectionReason: w.rejectionReason,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({ transactions });
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Server error fetching transactions" });
    }
  },
);

// Update transaction status
router.put(
  "/transactions/:transactionId",
  checkAdminPermission("transaction_admin"),
  async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { action, rejectionReason } = req.body;

      // Find transaction in deposits or withdrawals
      let transaction = await Deposit.findById(transactionId).populate("user");
      let isDeposit = true;

      if (!transaction) {
        transaction = await Withdrawal.findById(transactionId).populate("user");
        isDeposit = false;
      }

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.status !== "pending") {
        return res.status(400).json({ message: "Transaction is not pending" });
      }

      // Restrict deposit approval logic
      const newStatus = action === "approve" ? "completed" : "rejected";
      transaction.status = newStatus;
      transaction.processedBy = req.user._id;
      transaction.processedAt = new Date();

      if (action === "reject" && rejectionReason) {
        transaction.rejectionReason = rejectionReason;
      }

      // Deposit approval logic
      if (isDeposit && action === "approve") {
        if (transaction.upgradedFrom) {
          // Upgrade deposits can be approved by admin
          await transaction.save();
          await processDepositApproval(transaction);
        } else if (
          transaction.user._id.toString() === req.user._id.toString()
        ) {
          // Admin can approve their own deposits
          await transaction.save();
          await processDepositApproval(transaction);
        } else if (
          transaction.user.referredBy &&
          transaction.user.referredBy.toString() === req.user._id.toString()
        ) {
          // Admin can approve initial deposits from their direct referrals
          await transaction.save();
          await processDepositApproval(transaction);
        } else {
          return res.status(400).json({
            message:
              "Initial deposits must be approved by the user's direct referrer or the user themselves if they are an admin.",
          });
        }
      } else if (!isDeposit) {
        // Process withdrawal
        await transaction.save();
        await processWithdrawal(transaction, action);
      } else {
        // For rejected deposits, just save
        await transaction.save();
      }

      // Send notification to user
      if (transaction.user.telegramChatId) {
        const message = isDeposit
          ? action === "approve"
            ? `✅ Your deposit of ${transaction.amount.toLocaleString()} ETB has been approved!`
            : `❌ Your deposit has been rejected. Reason: ${rejectionReason || "Not specified"}`
          : action === "approve"
            ? `✅ Your withdrawal of ${transaction.amount.toLocaleString()} ETB has been processed!`
            : `❌ Your withdrawal has been rejected. Reason: ${rejectionReason || "Not specified"}`;

        await telegramService.sendMessage(
          transaction.user.telegramChatId,
          message,
        );
      }

      res.json({ message: "Transaction updated successfully", transaction });
    } catch (error) {
      console.error("Update transaction error:", error);
      res.status(500).json({ message: "Server error updating transaction" });
    }
  },
);

// Merchant Account Management (Super Admin only)
router.get(
  "/merchant-accounts",
  checkAdminPermission("super_admin"),
  async (req, res) => {
    try {
      const merchantAccounts = await MerchantAccount.find().sort({
        createdAt: -1,
      });
      res.json({ merchantAccounts });
    } catch (error) {
      console.error("Get merchant accounts error:", error);
      res
        .status(500)
        .json({ message: "Server error fetching merchant accounts" });
    }
  },
);

router.post(
  "/merchant-accounts",
  checkAdminPermission("super_admin"),
  async (req, res) => {
    try {
      const merchantAccount = new MerchantAccount(req.body);
      await merchantAccount.save();
      res.status(201).json({
        message: "Merchant account created successfully",
        merchantAccount,
      });
    } catch (error) {
      console.error("Create merchant account error:", error);
      res
        .status(500)
        .json({ message: "Server error creating merchant account" });
    }
  },
);

router.put(
  "/merchant-accounts/:id",
  checkAdminPermission("super_admin"),
  async (req, res) => {
    try {
      const merchantAccount = await MerchantAccount.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      res.json({
        message: "Merchant account updated successfully",
        merchantAccount,
      });
    } catch (error) {
      console.error("Update merchant account error:", error);
      res
        .status(500)
        .json({ message: "Server error updating merchant account" });
    }
  },
);

// Withdrawal Schedule Management (Super Admin only)
router.get(
  "/withdrawal-schedule",
  checkAdminPermission("super_admin"),
  async (req, res) => {
    try {
      const schedule = await WithdrawalSchedule.findOne({ isActive: true });
      res.json({ schedule });
    } catch (error) {
      console.error("Get withdrawal schedule error:", error);
      res
        .status(500)
        .json({ message: "Server error fetching withdrawal schedule" });
    }
  },
);

router.put(
  "/withdrawal-schedule",
  checkAdminPermission("super_admin"),
  async (req, res) => {
    try {
      const { startHour, endHour } = req.body;

      let schedule = await WithdrawalSchedule.findOne({ isActive: true });
      if (schedule) {
        schedule.startHour = startHour;
        schedule.endHour = endHour;
        await schedule.save();
      } else {
        schedule = new WithdrawalSchedule({ startHour, endHour });
        await schedule.save();
      }

      res.json({
        message: "Withdrawal schedule updated successfully",
        schedule,
      });
    } catch (error) {
      console.error("Update withdrawal schedule error:", error);
      res
        .status(500)
        .json({ message: "Server error updating withdrawal schedule" });
    }
  },
);

async function processDepositApproval(deposit) {
  try {
    // Update user's total deposits
    await User.findByIdAndUpdate(deposit.user._id, {
      $inc: { totalDeposits: deposit.amount },
    });

    // Set up daily returns for the user

    // Process commissions
    await processDepositCommissions(deposit);
  } catch (error) {
    console.error("Process deposit approval error:", error);
  }
}
async function processWithdrawal(withdrawal, action) {
  try {
    if (action === "approve") {
      // Update user's total withdrawals
      await User.findByIdAndUpdate(withdrawal.user._id, {
        $inc: { totalWithdrawals: withdrawal.amount },
      });
    } else {
      // Return amount to user balance if rejected
      await User.findByIdAndUpdate(withdrawal.user._id, {
        $inc: { balance: withdrawal.amount },
      });
    }
  } catch (error) {
    console.error("Process withdrawal error:", error);
  }
}

async function getPlatformAdmin() {
  let adminUser = await User.findOne({ role: "super_admin" });
  if (!adminUser) adminUser = await User.findOne({ role: "transaction_admin" });
  if (!adminUser) adminUser = await User.findOne({ role: "admin" });
  return adminUser;
}

// Process commission for approved deposit
async function processDepositCommissions(deposit) {
  try {
    const user = await User.findById(deposit.user).populate("referredBy");
    if (!user) return;

    const adminUser = await getPlatformAdmin();

    // Upgrade deposits: admin-only distribution, no parent/upline commission
    if (deposit.upgradedFrom) {
      if (!adminUser) return;

      const commissionAmount = deposit.totalAmount;
      const commission = new Commission({
        user: adminUser._id,
        fromUser: deposit.user,
        // amount: commissionAmount,
        level: 0,
        type: "deposit",
        description: `Admin revenue from upgrade deposit for ${user.fullName}`,
        sourceTransaction: deposit._id,
        sourceModel: "Deposit",
      });

      await commission.save();
      await User.findByIdAndUpdate(adminUser._id, {
        $inc: {
          // balance: commissionAmount,
          totalDeposits: commissionAmount,
        },
      });

      if (adminUser.telegramChatId) {
        await telegramService.sendMessage(
          adminUser.telegramChatId,
          `💰 Upgrade deposit approved. Admin recorded ${commissionAmount.toLocaleString()} ETB as total deposit revenue from ${user.fullName}.`,
        );
      }
      return;
    }

    // Initial deposits: distribute commissions to referral chain, but each user only gets commissions from their first 3 direct children
    if (user.referredBy) {
      let currentUser = user;
      const commissionRates = [0.08, 0.06, 0.04]; // 8%, 6%, 4%
      let level = 1;

      while (currentUser && currentUser.referredBy && level <= 3) {
        const referrer = await User.findById(currentUser.referredBy._id);

        // Check if this user is within the first 3 children of the referrer
        const allChildren = await User.find({ referredBy: referrer._id }).sort({
          createdAt: 1,
        });
        const childIndex = allChildren.findIndex(
          (child) => child._id.toString() === currentUser._id.toString(),
        );

        let commissionRecipient = referrer;
        let recipientDescription = `${level === 1 ? "direct child" : level === 2 ? "grandchild" : "great-grandchild"}`;

        // If this is the 4th or later child, give full deposit to admin instead
        if (childIndex >= 3) {
          commissionRecipient = adminUser;
          recipientDescription = `4th+ ${level === 1 ? "direct child" : level === 2 ? "grandchild" : "great-grandchild"} (admin commission)`;
        }

        let commissionAmount = 0;

        // For 4th+ children, admin gets full deposit; otherwise get commission percentage
        if (childIndex >= 3) {
          commissionAmount = deposit.amount;
        } else {
          commissionAmount = deposit.amount * commissionRates[level - 1];
        }

        if (commissionAmount > 0) {
          const commission = new Commission({
            user: commissionRecipient._id,
            fromUser: deposit.user._id,
            amount: commissionAmount,
            level: level,
            type: "deposit",
            description: `Commission for ${recipientDescription} deposit approval`,
            sourceTransaction: deposit._id,
            sourceModel: "Deposit",
          });

          await commission.save();

          await User.findByIdAndUpdate(commissionRecipient._id, {
            $inc: {
              balance: commissionAmount,
              totalCommissions: commissionAmount,
            },
          });

          // Send notification to the recipient (referrer or admin)
          const recipientForNotification = commissionRecipient;
          if (recipientForNotification.telegramChatId) {
            const notificationMessage =
              childIndex >= 3
                ? `💰 Admin commission earned!\n` +
                  `Amount: ${commissionAmount.toLocaleString()} ETB (${(commissionRates[level - 1] * 100).toFixed(0)}%)\n` +
                  `From ${user.fullName}'s deposit (4th+ child commission)`
                : `💰 Commission earned!\n` +
                  `Amount: ${commissionAmount.toLocaleString()} ETB (${(commissionRates[level - 1] * 100).toFixed(0)}%)\n` +
                  `From ${user.fullName}'s deposit`;

            await telegramService.sendMessage(
              recipientForNotification.telegramChatId,
              notificationMessage,
            );
          }
        }

        // Move to next level
        currentUser = referrer;
        level++;
      }
    }
  } catch (error) {
    console.error("Commission processing error:", error);
  }
}

// Get transaction summary by period
router.get(
  "/transaction-summary",
  checkAdminPermission("admin"),
  async (req, res) => {
    try {
      const { period = "all" } = req.query;
      let dateFilter = {};
      const now = new Date();

      switch (period) {
        case "today":
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
              $lt: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1,
              ),
            },
          };
          break;
        case "week":
          const weekStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - now.getDay(),
          );
          dateFilter = {
            createdAt: {
              $gte: weekStart,
              $lt: new Date(),
            },
          };
          break;
        case "month":
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth(), 1),
              $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
            },
          };
          break;
      }

      // Aggregate deposits
      const [depositResult] = await Deposit.aggregate([
        { $match: { status: "completed", ...dateFilter } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      // Aggregate withdrawals
      const [withdrawalResult] = await Withdrawal.aggregate([
        { $match: { status: "completed", ...dateFilter } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const totalDeposit = depositResult ? depositResult.total : 0;
      const totalWithdrawal = withdrawalResult ? withdrawalResult.total : 0;
      const revenue = totalDeposit - totalWithdrawal;

      res.json({ totalDeposit, totalWithdrawal, revenue });
    } catch (error) {
      console.error("Get transaction summary error:", error);
      res
        .status(500)
        .json({ message: "Server error fetching transaction summary" });
    }
  },
);

module.exports = router;
