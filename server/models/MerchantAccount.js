const mongoose = require("mongoose");

const merchantAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["bank", "mobile_money"],
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    bankName: {
      type: String,
      required: function () {
        return this.type === "bank";
      },
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: function () {
        return this.type === "mobile_money";
      },
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    instructions: {
      type: String,
      default: "",
    },
    // qrCodeUrl: {
    //   type: String,
    //   default: null
    // }
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("MerchantAccount", merchantAccountSchema);
