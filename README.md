this is the first project that i lounched

    
use admin

db.createUser({
  user: "sahamplc",
  pwd: "@sourcecode123",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" } // Or other roles as needed
  ]
})
 cd /var/www/saham_repo/client/
 // const cron = require("node-cron");
// const Deposit = require("../models/Deposit");
// const User = require("../models/User");

// const PACKAGES = [
//   { name: "7th Stock Package", price: 192000, dailyReturn: 3200 },
//   { name: "6th Stock Package", price: 96000, dailyReturn: 1600 },
//   { name: "5th Stock Package", price: 48000, dailyReturn: 800 },
//   { name: "4th Stock Package", price: 24000, dailyReturn: 400 },
//   { name: "3rd Stock Package", price: 12000, dailyReturn: 200 },
//   { name: "2nd Stock Package", price: 6000, dailyReturn: 100 },
//   { name: "1st Stock Package", price: 3000, dailyReturn: 50 },
// ];

// //const DAILY_RETURN_COMMISSIONS = [0.08, 0.04, 0.02, 0.01];
// //async function distributeDailyReturnCommissions(user, dailyReturn) {
// //let currentReferrerId = user.referrer; // Assuming 'referrer' field stores the parent user ID
// //for (let level = 0; level < DAILY_RETURN_COMMISSIONS.length; level++) {
// //if (!currentReferrerId) break;
// // const referrer = await User.findById(currentReferrerId);
// // if (!referrer) break;

// //const commission = dailyReturn * DAILY_RETURN_COMMISSIONS[level];
// //referrer.commissions = (referrer.commissions || 0) + commission;
// //referrer.balance = (referrer.balance || 0) + commission;
// // await referrer.save();

// //currentReferrerId = referrer.referrer; // Move up the referral chain
// //}
// //}

// let isRunning = false;

// // Schedule the cron job to run every 3 minutes
// cron.schedule(
//   "0/1 * * * *",
//   async () => {
//     console.log("Test run at:", new Date().toISOString());
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
//       const deposits = await Deposit.find({ status: "completed" });

//       for (const deposit of deposits) {
//         // Use deposit.user or deposit.userID depending on your schema
//         const userId = deposit.userID || deposit.user;
//         const user = await User.findById(userId);

//         if (!user) {
//           console.warn(
//             `User not found for deposit ID: ${deposit._id}, userID: ${userId}`
//           );
//           continue; // Skip this deposit if user is missing
//         }

//         const packageDetails = PACKAGES.find(
//           (pkg) => pkg.price === deposit.totalAmount
//         );

//         if (packageDetails) {
//           const dailyReturn = packageDetails.dailyReturn;

//           // Update user balance
//           user.balance = (user.balance || 0) + dailyReturn;

//           // // Optionally, add to commissions
//           // user.commissions = (user.commissions || 0) + dailyReturn * 0.1; // Example: 10% commission

//           await user.save();
//           //await distributeDailyReturnCommissions(user, dailyReturn);
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
//     // timezone: "Africa/Nairobi", // Explicitly set timezone to UTC
//     //timezone: "UTC"
//     scheduled: true,
//     timezone: "Africa/Nairobi",
//   }
// );

// const cron = require("node-cron");
// const Deposit = require("../models/Deposit");
// const User = require("../models/User");

// const PACKAGES = [
//   { name: "7th Stock Package", price: 192000, dailyReturn: 3200 },
//   { name: "6th Stock Package", price: 96000, dailyReturn: 1600 },
//   { name: "5th Stock Package", price: 48000, dailyReturn: 800 },
//   { name: "4th Stock Package", price: 24000, dailyReturn: 400 },
//   { name: "3rd Stock Package", price: 12000, dailyReturn: 200 },
//   { name: "2nd Stock Package", price: 6000, dailyReturn: 100 },
//   { name: "1st Stock Package", price: 3000, dailyReturn: 50 },
// ];

// let isRunning = false;

// // Schedule the cron job to run every day at a specific time (e.g., 00:01)
// cron.schedule(
//   "1 0 * * *",
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
//       // 1. Get all users
//       const users = await User.find({});

//       for (const user of users) {
//         // 2. Sum all completed deposits for this user
//         const deposits = await Deposit.find({
//           status: "completed",
//           $or: [{ userID: user._id }, { user: user._id }],
//         });

//         const totalDeposit = deposits.reduce(
//           (sum, dep) => sum + (dep.totalAmount || 0),
//           0
//         );

//         // 3. Find the highest package that fits the total deposit
//         const packageDetails = PACKAGES.slice()
//           .reverse()
//           .find((pkg) => totalDeposit >= pkg.price);

//         if (packageDetails) {
//           const dailyReturn = packageDetails.dailyReturn;

//           // 4. Update user balance
//           user.balance = (user.balance || 0) + dailyReturn;

//           await user.save();

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
// const cron = require("node-cron");
// const Deposit = require("../models/Deposit");
// const User = require("../models/User");
// // const Commission = require("../models/Commission"); // Uncomment if you have a Commission model
// // const telegramService = require("../services/telegramService"); // Uncomment if you use Telegram notifications

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
//  * Distribute referral commissions up the tree for daily returns.
//  * Each referrer gets a percentage of the user's daily return, credited to their balance and totalCommissions.
//  * @param {Object} user - The user who received the daily return.
//  * @param {number} dailyReturn - The daily return amount.
//  */
// async function distributeDailyReturnCommissions(user, dailyReturn) {
//   let currentUser = await User.findById(user.referredBy); // Assumes 'referredBy' field stores the parent user ID
//   let level = 1;

//   while (currentUser && level <= COMMISSION_RATES.length) {
//     const commissionAmount = dailyReturn * COMMISSION_RATES[level - 1];

//     // Optionally, create a commission record
//     // const commission = new Commission({
//     //   user: currentUser._id,
//     //   fromUser: user._id,
//     //   amount: commissionAmount,
//     //   level,
//     //   type: "dailyReturn",
//     //   description: `Level ${level} commission from ${user.fullName}'s daily return`,
//     //   sourceTransaction: null,
//     //   sourceModel: "DailyReturn",
//     // });
//     // await commission.save();

//     // Update user balance and commission total
//     await User.findByIdAndUpdate(currentUser._id, {
//       $inc: {
//         balance: commissionAmount,
//         totalCommissions: commissionAmount,
//       },
//     });

//     // Optionally, send notification
//     // if (currentUser.telegramChatId) {
//     //   await telegramService.sendMessage(
//     //     currentUser.telegramChatId,
//     //     `💰 Commission earned!\n` +
//     //       `Amount: ${commissionAmount.toLocaleString()} ETB\n` +
//     //       `Level: ${level}\n` +
//     //       `From: ${user.fullName}'s daily return`
//     //   );
//     // }

//     // Move to next level
//     currentUser = await User.findById(currentUser.referredBy);
//     level++;
//   }
// }

// // Schedule the cron job to run every day at 00:01
// cron.schedule(
//   "1 0 * * *",
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
//       // 1. Get all users
//       const users = await User.find({});

//       for (const user of users) {
//         // 2. Sum all completed deposits for this user
//         const deposits = await Deposit.find({
//           status: "completed",
//           $or: [{ userID: user._id }, { user: user._id }],
//         });

//         const totalDeposit = deposits.reduce(
//           (sum, dep) => sum + (dep.totalAmount || 0),
//           0
//         );

//         // 3. Find the highest package that fits the total deposit
//         const packageDetails = PACKAGES.slice()
//           .reverse()
//           .find((pkg) => totalDeposit >= pkg.price);

//         if (packageDetails) {
//           const dailyReturn = packageDetails.dailyReturn;

//           // 4. Update user balance
//           user.balance = (user.balance || 0) + dailyReturn;
//           await user.save();

//           // 5. Distribute referral commissions up to 4 levels
//           await distributeDailyReturnCommissions(user, dailyReturn);

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