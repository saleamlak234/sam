
const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageId: {
      type: String,
      required: true,
      enum: [
        "basic",
        "starter",
        "standard",
        "premium",
        "advanced",
        "professional",
        "enterprise",
        "elite",
      ],
    },
    packageLabel: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      enum: [200, 700, 2000, 7000, 20000, 70000, 200000, 700000],
    },
    vatAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["bank", "telebirr"],
    },
    accountDetails: {
      accountNumber: String,
      bankName: String,
      phoneNumber: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);