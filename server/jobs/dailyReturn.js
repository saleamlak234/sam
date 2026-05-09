
// const cron = require("node-cron");
// const Deposit = require("../models/Deposit");
// const User = require("../models/User");
// const Commission = require("../models/Commission"); // Now enabled!
// const telegramService = require("../services/telegramService"); // Uncomment if used

// const PACKAGES = [
//   { name: "7th Stock Package", price: 192000, dailyReturn: 3200 },
//   { name: "6th Stock Package", price: 96000, dailyReturn: 1600 },
//   { name: "5th Stock Package", price: 48000, dailyReturn: 800 },
//   { name: "4th Stock Package", price: 24000, dailyReturn: 400 },
//   { name: "3rd Stock Package", price: 12000, dailyReturn: 200 },
//   { name: "2nd Stock Package", price: 6000, dailyReturn: 100 },
//   { name: "1st Stock Package", price: 3000, dailyReturn: 50 },
// ];
// // Referral commission rates for 4 levels: 8%, 4%, 2%, 1%
// const COMMISSION_RATES = [0.08, 0.04, 0.02, 0.01];

// let isRunning = false;

// /**
//  * Checks if a daily return has already been processed for this user today.
//  * This prevents double-crediting.
//  */
// async function alreadyCreditedToday(userId, date = new Date()) {
//   // Find if Commission (for type "dailyReturn") for this user, for 'today', already exists
//   const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
//   const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
//   // Check for "dailyReturn" commission record for this user created today
//   const existing = await Commission.findOne({
//     user: userId,
//     type: "dailyReturn",
//     createdAt: { $gte: startOfDay, $lt: endOfDay }
//   });
//   return !!existing;
// }

// /**
//  * Distribute commissions up the referral chain and record a Commission document for each.
//  * Defensive against missing/inactive parents.
//  */
// async function distributeDailyReturnCommissions(user, dailyReturn, todayDate) {
//   let currentUser = await User.findById(user.referredBy);
//   let level = 1;
//   while (currentUser && level <= COMMISSION_RATES.length) {
//     if (!currentUser.isActive) {
//       // skip inactive referrers (if your business requires)
//       currentUser = await User.findById(currentUser.referredBy);
//       level++;
//       continue;
//     }

//     const commissionAmount = dailyReturn * COMMISSION_RATES[level - 1];

//     // Record commission transaction
//     const commission = new Commission({
//       user: currentUser._id,
//       fromUser: user._id,
//       amount: commissionAmount,
//       level,
//       type: "dailyReturn",
//       description: `Level ${level} commission from ${user.fullName || user._id}'s daily return`,
//       sourceTransaction: null,
//       sourceModel: "DailyReturn",
//       createdAt: todayDate // ensures accurate "day"
//     });
//     await commission.save();

//     // Atomic, defensive: increment user fields
//     await User.findByIdAndUpdate(currentUser._id, {
//       $inc: {
//         balance: commissionAmount,
//         totalCommissions: commissionAmount,
//       },
//     });

//     console.log(
//       `Distributed ${commissionAmount.toLocaleString()} ETB to user ${currentUser._id} (level ${level}) from ${user.fullName || user._id}`
//     );
//     // Optional notification
//     if (currentUser.telegramChatId && telegramService) {
//       await telegramService.sendMessage(
//         currentUser.telegramChatId,
//         `💰 Commission earned!\n` +
//           `Amount: ${commissionAmount.toLocaleString()} ETB\n` +
//           `Level: ${level}\n` +
//           `From: ${user.fullName || user._id}'s daily return`
//       );
//     }
//     // Step up chain
//     currentUser = currentUser.referredBy ? await User.findById(currentUser.referredBy) : null;
//     level++;
//   }
// }

// function getHighestPackage(totalDeposit) {
//   // Always select highest qualifying package
//   // (Loop reverse to start from most expensive)
//   for (let i = 0; i < PACKAGES.length; i++) {
//     if (totalDeposit >= PACKAGES[i].price) {
//       return PACKAGES[i];
//     }
//   }
//   return null;
// }

// cron.schedule(
//   "0 0 * * *",
//   async () => {
//     console.log("Daily returns job run at:", new Date().toISOString());
//     if (isRunning) {
//       console.log("Skipping job: Previous instance is still running.");
//       return;
//     }
//     isRunning = true;

//     const today = new Date();
//     const dayOfWeek = today.getDay(); // Sunday is 0
//     if (dayOfWeek === 0) {
//       console.log("Skipping daily returns on Sunday");
//       isRunning = false;
//       return;
//     }
//     try {
//       // Get all 'active' users (optional: only process active accounts)
//       const users = await User.find({ isActive: true });

//       for (const user of users) {
//         // Only process if NOT already credited today
//         if (await alreadyCreditedToday(user._id, today)) {
//           console.log(`Already credited daily return for user ${user._id} today.`);
//           continue;
//         }

//         // Find highest qualifying deposit (sum all if desired, or use latest as before)
//         // We'll sum all completed deposits for package qualification
//         const deposits = await Deposit.find({
//           status: "completed",
//           $or: [{ userID: user._id }, { user: user._id }]
//         });
//         const totalDeposit = deposits.reduce((acc, d) => acc + (d.totalAmount || 0), 0);

//         if (!totalDeposit || totalDeposit < PACKAGES[PACKAGES.length - 1].price) {
//           // Less than lowest package price, skip
//           console.log(`User ${user._id} does not qualify for any package. Total deposit: ${totalDeposit}`);
//           continue;
//         }

//         // Get highest eligible package
//         const packageDetails = getHighestPackage(totalDeposit);

//         if (!packageDetails) {
//           console.log(`User ${user._id} total deposit ${totalDeposit} does not qualify for any package.`);
//           continue;
//         }

//         const dailyReturn = packageDetails.dailyReturn;

//         // Credit daily return, record commission (always atomic increment)
//         await User.findByIdAndUpdate(user._id, {
//           $inc: { balance: dailyReturn }
//         });

//         // Record user "dailyReturn" commission (to prevent double-credits)
//         const ownCommission = new Commission({
//           user: user._id,
//           fromUser: user._id,
//           amount: dailyReturn,
//           level: 0,
//           type: "dailyReturn",
//           description: `Base daily return for own deposit`,
//           sourceTransaction: null,
//           sourceModel: "DailyReturn",
//           createdAt: today
//         });
//         await ownCommission.save();

//         // Distribute referral commissions, record for upline
//         await distributeDailyReturnCommissions(user, dailyReturn, today);

//         console.log(
//           `Added daily return of ${dailyReturn} ETB to user ${user._id} (total deposit: ${totalDeposit})`
//         );
//       }
//       console.log("Daily returns processed successfully");
//     } catch (error) {
//       console.error("Error processing daily returns:", error);
//     } finally {
//       isRunning = false;
//     }
//   },
//   {
//     scheduled: true,
//     timezone: "Africa/Nairobi",
//   }
// );
const cron = require("node-cron");
const Deposit = require("../models/Deposit");
const User = require("../models/User");

const PACKAGES = [
  { name: "7th Stock Package", price: 192000, dailyReturn: 3200 },
  { name: "6th Stock Package", price: 96000, dailyReturn: 1600 },
  { name: "5th Stock Package", price: 48000, dailyReturn: 800 },
  { name: "4th Stock Package", price: 24000, dailyReturn: 400 },
  { name: "3rd Stock Package", price: 12000, dailyReturn: 200 },
  { name: "2nd Stock Package", price: 6000, dailyReturn: 100 },
  { name: "1st Stock Package", price: 3000, dailyReturn: 50 },
];

// Referral commission rates for 4 levels: 8%, 4%, 2%, 1%
const COMMISSION_RATES = [0.08, 0.04, 0.02, 0.01];

let isRunning = false;


async function distributeDailyReturnCommissions(user, dailyReturn) {
  let currentUser = await User.findById(user.referredBy); // Assumes 'referredBy' field stores the parent user ID
  let level = 1;

  while (currentUser && level <= COMMISSION_RATES.length) {
    const commissionAmount = dailyReturn * COMMISSION_RATES[level - 1];

    

    // Update user balance and commission total
    await User.findByIdAndUpdate(currentUser._id, {
      $inc: {
        balance: commissionAmount,
        totalCommissions: commissionAmount,
      },
    });

    console.log(
      `Distributed ${commissionAmount.toLocaleString()} ETB to user ${currentUser._id} as level ${level} commission from ${user.fullName}'s daily return`
    );
    // Optionally, send notification
    

    // Move to next level
    currentUser = await User.findById(currentUser.referredBy);
    level++;
  }
}

// Schedule the cron job to run every day at 00:01
cron.schedule(
  "0 0 * * *",//
  async () => {
    console.log("Daily returns job run at:", new Date().toISOString());
    if (isRunning) {
      console.log("Skipping job: Previous instance is still running.");
      return;
    }
    isRunning = true;

    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday is 0

    if (dayOfWeek === 0) {
      console.log("Skipping daily returns on Sunday");
      isRunning = false;
      return;
    }

    try {
      // 1. Get all users
      const users = await User.find({});

      for (const user of users) {
        // 2. Get the latest completed deposit for this user
        const latestDeposit = await Deposit.findOne({
          status: "completed",
          isUpgraded: false,
          $or: [{ userID: user._id }, { user: user._id }],
        }).sort({ createdAt: -1 });

        // If no deposit, skip
        if (!latestDeposit || !latestDeposit.totalAmount || latestDeposit.totalAmount < 3000) {
          console.log(`User ${user._id} does not have any completed deposits.`);
          continue;
        }

        const totalDeposit = latestDeposit.totalAmount;

        // 3. Find the highest package that fits the total deposit
        const packageDetails = PACKAGES.slice().find(
          (pkg) => totalDeposit >= pkg.price
        );

        if (packageDetails) {
          const dailyReturn = packageDetails.dailyReturn;

          // 4. Update user balance
          user.balance = (user.balance || 0) +  dailyReturn;
          await user.save();

          // 5. Distribute referral commissions up to 4 levels
          await distributeDailyReturnCommissions(user, dailyReturn);

          console.log(
            `Added daily return of ${dailyReturn} to user ${user._id} (total deposit: ${totalDeposit})`
          );
        } else {
          console.log(
            `User ${user._id} does not qualify for any package (total deposit: ${totalDeposit})`
          );
        }
      }
      console.log("Daily returns processed successfully");
    } catch (error) {
      console.error("Error processing daily returns:", error);
    } finally {
      isRunning = false;
    }
  },
  {
    scheduled: true,
    timezone: "Africa/Nairobi",
  }
);
// const cron = require("node-cron");
// const Deposit = require("../models/Deposit");
// const User = require("../models/User");
// const Commission = require("../models/Commission"); // make sure this exists

// const PACKAGES = [
//   { name: "7th Stock Package", price: 192000, dailyReturn: 3200 },
//   { name: "6th Stock Package", price: 96000, dailyReturn: 1600 },
//   { name: "5th Stock Package", price: 48000, dailyReturn: 800 },
//   { name: "4th Stock Package", price: 24000, dailyReturn: 400 },
//   { name: "3rd Stock Package", price: 12000, dailyReturn: 200 },
//   { name: "2nd Stock Package", price: 6000, dailyReturn: 100 },
//   { name: "1st Stock Package", price: 3000, dailyReturn: 50 },
// ];

// const COMMISSION_RATES = [0.1, 0.04, 0.02, 0.01]; // 1st-4th level commissions

// let isRunning = false;

// // Commission distribution and transaction recording
// async function distributeDailyReturnCommissions(user, dailyReturn, deposit) {
//   let currentUpline = user.referredBy; // Assume this field is in User schema
//   for (let level = 1; level <= 4 && currentUpline; level++) {
//     const commissionRate = COMMISSION_RATES[level - 1];
//     const commissionAmt = Math.floor(dailyReturn * commissionRate);

//     if (commissionAmt > 0) {
//       const uplineUser = await User.findById(currentUpline);

//       if (uplineUser) {
//         // Credit commission to upline
//         uplineUser.balance = (uplineUser.balance || 0) + commissionAmt;
//         await uplineUser.save();

//         // Record the commission transaction:
//         await Commission.create({
//           user: uplineUser._id,
//           fromUser: user._id,
//           deposit: deposit._id,
//           amount: commissionAmt,
//           level,
//           type: "daily",
//         });

//         console.log(
//           `Credited commission of ${commissionAmt} to ${uplineUser.fullName} (level ${level}, from user ${user.fullName}).`
//         );

//         currentUpline = uplineUser.referredBy;
//       } else {
//         break;
//       }
//     } else {
//       break; // no more commission to pay at further levels
//     }
//   }
// }

// cron.schedule(
//   "0 0 * * 0-5", // Run at 00:00 Sunday (0) to Friday (5) only, NEVER on Saturday (6)
//   async () => {
//     if (isRunning) {
//       console.log("Skipping job: Previous instance is still running.");
//       return;
//     }
//     isRunning = true;

//     try {
//       const users = await User.find({});
//       for (const user of users) {
//         // Find the latest completed, *not upgraded*, deposit for this user:
//         const latestDeposit = await Deposit.findOne({
//           status: "completed",
//           isUpgraded: false,
//           user: user._id,
//         }).sort({ createdAt: -1 });

//         if (
//           !latestDeposit ||
//           !latestDeposit.totalAmount ||
//           latestDeposit.totalAmount < 3000
//         ) {
//           console.log(
//             `User ${user._id} does not have any completed deposits eligible for daily returns.`
//           );
//           continue;
//         }

//         const totalDeposit = latestDeposit.totalAmount;
//         // Highest package by deposit
//         const packageDetails = PACKAGES.find(
//           (pkg) => totalDeposit >= pkg.price
//         );

//         if (packageDetails) {
//           const dailyReturn = packageDetails.dailyReturn;

//           // Update user balance
//           user.balance = (user.balance || 0) + dailyReturn;
//           await user.save();

//           // Distribute commissions and add commission transactions
//           await distributeDailyReturnCommissions(
//             user,
//             dailyReturn,
//             latestDeposit
//           );

//           console.log(
//             `Added daily return of ${dailyReturn} to user ${user._id} (total deposit: ${totalDeposit})`
//           );
//         } else {
//           console.log(
//             `User ${user._id} does not qualify for any package (total deposit: ${totalDeposit})`
//           );
//         }
//       }
//       console.log("Daily returns processed successfully");
//     } catch (error) {
//       console.error("Error processing daily returns:", error);
//     } finally {
//       isRunning = false;
//     }
//   },
//   {
//     scheduled: true,
//     timezone: "Africa/Nairobi",
//   }
// );
