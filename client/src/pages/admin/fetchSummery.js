// Transaction summary by period (daily, weekly, monthly, all)
router.get(
  "/transaction-summary",
  checkAdminPermission("admin"),
  async (req, res) => {
    try {
      const { period = "all" } = req.query;
      let dateFilter = {};
      const now = new Date();

      if (period === "today" || period === "day") {
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        };
      } else if (period === "week") {
        const weekStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - now.getDay()
        );
        dateFilter = {
          createdAt: {
            $gte: weekStart,
            $lt: new Date(),
          },
        };
      } else if (period === "month") {
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        };
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
  }
);
