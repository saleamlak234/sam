const mongoose = require("mongoose");
const User = require("../models/User");
const MerchantAccount = require("../models/MerchantAccount");
const WithdrawalSchedule = require("../models/WithdrawalSchedule");
const dotenv = require("dotenv");
require("dotenv").config();

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await MerchantAccount.deleteMany({});
    await WithdrawalSchedule.deleteMany({});
    console.log("Cleared existing data");

    const superAdmin = new User({
      fullName: "Minychil Belay",
      email: "menyichlbelay3@gmail.com",
      phoneNumber: "+251910109040",
      password: "superadmin123",
      role: "super_admin",
      referralCode: "SUPER001",
      isActive: true,
    });
    await superAdmin.save();
    console.log("Super Admin created:", superAdmin.email);

    // Create Main Admin
    //  const adminPassword = bcrypt.hash("admin123", 10);
    const admin = new User({
      fullName: "derejaw beteseha",
      email: "derejawbetseha916@gmail.com",
      phoneNumber: "+251998458102",
      password: "admin123",
      role: "admin",
      referralCode: "ADMIN001",
      isActive: true,
    });
    await admin.save();
    console.log("Main Admin created:", admin.email);

    const transactionAdmin = new User({
      fullName: "source  dev",
      email: "sourcecodedev34@gmail.com",
      phoneNumber: "+251963722423",
      password: "transadmin123",
      role: "transaction_admin",
      referralCode: "TRANS001",
      isActive: true,
    });
    await transactionAdmin.save();
    console.log("Transaction Admin created:", transactionAdmin.email);

    // Create sample users

    // Create merchant accounts
    const merchantAccounts = [
      {
        name: "CBE Main Account",
        type: "bank",
        accountNumber: "1000703059598 ",
        accountName: "tigist Muche",
        bankName: "Commercial Bank of Ethiopia",
        instructions:
          "Transfer to this account and upload receipt with transaction reference",
        isActive: true,
      },
      {
        name: "cbe Bank Account",
        type: "bank",
        accountNumber: "1000628017356 ",
        accountName: "sisay zelalem",
        bankName: "cbe Bank",
        instructions:
          "Transfer to this account and provide transaction reference",
        isActive: true,
      },
      {
        name: "TeleBirr Main",
        type: "mobile_money",
        accountNumber: "092 934 3646",
        accountName: "tigist Muche",
        phoneNumber: "092 934 3646",
        instructions:
          "Send money to this TeleBirr number and provide transaction ID",
        isActive: true,
      },
      {
        name: "M-Birr Account",
        type: "mobile_money",
        accountNumber: "09080 839 0000",
        accountName: "sisay zelalem",
        phoneNumber: "09080 839 0000",
        instructions: "Send money to this M-Birr number and provide reference",
        isActive: true,
      },
      {
        name: "M-Birr Account",
        type: "mobile_money",
        accountNumber: "099 257 2774 ",
        accountName: "daniel emru",
        phoneNumber: "099 257 2774",
        instructions: "Send money to this M-Birr number and provide reference",
        isActive: true,
      },
    ];

    for (const accountData of merchantAccounts) {
      const account = new MerchantAccount({
        ...accountData,
        user: admin._id,
      });
      await account.save();
      console.log("Merchant account created:", account.name);
    }

    // Create withdrawal schedule (4 AM to 11 AM)
    const withdrawalSchedule = new WithdrawalSchedule({
      startHour: 10,
      endHour: 17,
      isActive: true,
      timezone: "Africa/Nairobi",
    });
    await withdrawalSchedule.save();
    console.log("Withdrawal schedule created: 4:00 AM - 11:00 AM");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seedDatabase();
