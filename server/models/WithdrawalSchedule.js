// // const mongoose = require('mongoose');

// // const withdrawalScheduleSchema = new mongoose.Schema({
// //   startHour: {
// //     type: Number,
// //     required: true,
// //     min: 4,
// //     // max: 23
// //   },
// //   endHour: {
// //     type: Number,
// //     required: true,
// //     min: 11,
// //     // max: 23
// //   },
// //   isActive: {
// //     type: Boolean,
// //     default: true
// //   },
// //   timezone: {
// //     type: String,
// //     default: 'Africa/Addis_Ababa'
// //   }
// // }, {
// //   timestamps: true
// // });

// // module.exports = mongoose.model('WithdrawalSchedule', withdrawalScheduleSchema);
// const mongoose = require("mongoose");

// const withdrawalScheduleSchema = new mongoose.Schema(
//   {
//     startHour: {
//       type: Number,
//       required: true,
//       min: 4, // 4 AM (earliest allowed start)
//       max: 10, // 10 AM (latest allowed start to ensure at least 1 hour before end)
//     },
//     endHour: {
//       type: Number,
//       required: true,
//       min: 5, // 5 AM (earliest allowed end)
//       max: 11, // 11 AM (latest allowed end)
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     timezone: {
//       type: String,
//       default: "Africa/Addis_Ababa",
//       enum: ["Africa/Addis_Ababa"], // Restrict to only Addis Ababa timezone
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Add validation to ensure endHour is after startHour
// withdrawalScheduleSchema.pre("save", function (next) {
//   if (this.endHour <= this.startHour) {
//     throw new Error("End hour must be after start hour");
//   }
//   if (this.startHour < 4 || this.endHour > 11) {
//     throw new Error(
//       "Withdrawal window must be between 4 AM and 11 AM Addis Ababa time"
//     );
//   }
//   next();
// });

//module.exports = mongoose.model("WithdrawalSchedule", withdrawalScheduleSchema);
const mongoose = require("mongoose");

const withdrawalScheduleSchema = new mongoose.Schema(
  {
    startHour: {
      type: Number,
      required: true,
      min: 10,
      max: 10, // Only allow 10 AM as start
    },
    endHour: {
      type: Number,
      required: true,
      min: 17,
      max: 17, // Only allow 5 PM as end
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    timezone: {
      type: String,
      default: "Africa/Nairobi",
      enum: ["Africa/Nairobi"], // Restrict to only Nairobi timezone
    },
  },
  {
    timestamps: true,
  }
);

// Add validation to ensure startHour is 10 and endHour is 17
withdrawalScheduleSchema.pre("save", function (next) {
  if (this.startHour !== 10 || this.endHour !== 17) {
    return next(
      new Error(
        "Withdrawal window must start at 10 AM and end at 5 PM Nairobi time"
      )
    );
  }
  next();
});

module.exports = mongoose.model("WithdrawalSchedule", withdrawalScheduleSchema);
