const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  type: {
    type: String,
    enum: ['deposit', 'earning'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  sourceTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'sourceModel'
  },
  sourceModel: {
    type: String,
    enum: ['Deposit', 'MonthlyEarning']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Commission', commissionSchema);