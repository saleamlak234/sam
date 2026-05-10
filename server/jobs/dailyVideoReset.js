const cron = require("node-cron");
const Video = require("../models/Video");
const VideoWatch = require("../models/VideoWatch");

const resetDailyVideoStats = async () => {
  try {
    // Reset daily views for all videos
    await Video.updateMany({}, { dailyViews: 0, lastResetDate: new Date() });

    console.log("Daily video stats reset completed");
  } catch (error) {
    console.error("Daily video reset error:", error);
  }
};

// Schedule to run daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily video stats reset...");
  await resetDailyVideoStats();
});

console.log(
  "dailyVideoReset job loaded and scheduled to run daily at midnight",
);

module.exports = { resetDailyVideoStats };
