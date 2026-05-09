const mongoose = require('mongoose');

const monthlyEarningSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deposit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deposit',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate earnings for same deposit/month/year
monthlyEarningSchema.index({ deposit: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyEarning', monthlyEarningSchema);