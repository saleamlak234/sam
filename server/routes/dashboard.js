const express = require('express');
const User = require('../models/User');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const Commission = require('../models/Commission');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's current data
    const user = await User.findById(userId);

    // Get monthly earnings (current month)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const monthlyEarnings = await Commission.aggregate([
      {
        $match: {
          user: userId,
          createdAt: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get recent transactions (deposits, withdrawals, commissions)
    const recentDeposits = await Deposit.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentWithdrawals = await Withdrawal.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentCommissions = await Commission.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Combine and format transactions
    const allTransactions = [
      ...recentDeposits.map(d => ({
        id: d._id,
        type: 'deposit',
        amount: d.amount,
        status: d.status,
        createdAt: d.createdAt,
        description: `Deposit - ${d.package}`
      })),
      ...recentWithdrawals.map(w => ({
        id: w._id,
        type: 'withdrawal',
        amount: w.amount,
        status: w.status,
        createdAt: w.createdAt,
        description: `Withdrawal via ${w.paymentMethod}`
      })),
      ...recentCommissions.map(c => ({
        id: c._id,
        type: 'commission',
        amount: c.amount,
        status: 'completed',
        createdAt: c.createdAt,
        description: c.description
      }))
    ];

    // Sort by date and take latest 10
    const recentTransactions = allTransactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({
      totalBalance: user.balance,
      totalDeposits: user.totalDeposits,
      totalWithdrawals: user.totalWithdrawals,
      totalCommissions: user.totalCommissions,
      monthlyEarnings: monthlyEarnings[0]?.total || 0,
      directReferrals: user.directReferrals,
      totalTeamSize: user.totalTeamSize,
      recentTransactions
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard statistics' });
  }
});

module.exports = router;