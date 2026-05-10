const express = require("express");
const multer = require("multer");
const path = require("path");
const Video = require("../models/Video");
const VideoWatch = require("../models/VideoWatch");
const User = require("../models/User");
const telegramService = require("../services/telegram");

const router = express.Router();

// Multer configuration for videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads", "videos"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "video-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
});

// Admin middleware
const checkAdminPermission = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (requiredRole === "super_admin" && userRole !== "super_admin") {
      return res.status(403).json({ message: "Super admin access required" });
    }
    if (
      requiredRole === "admin" &&
      !["super_admin", "admin"].includes(userRole)
    ) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };
};

// GET all videos (Admin only)
router.get("/", checkAdminPermission("admin"), async (req, res) => {
  try {
    const videos = await Video.find()
      .populate("uploadedBy", "fullName email")
      .sort({ createdAt: -1 });
    res.json({ videos });
  } catch (error) {
    console.error("Get videos error:", error);
    res.status(500).json({ message: "Server error fetching videos" });
  }
});

// POST upload video (Admin only)
router.post(
  "/",
  checkAdminPermission("admin"),
  upload.single("video"),
  async (req, res) => {
    try {
      const { title, description, duration, rewardAmount } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "Video file is required" });
      }

      const video = new Video({
        title,
        description,
        videoUrl: `/uploads/videos/${req.file.filename}`,
        duration: parseInt(duration),
        rewardAmount: parseInt(rewardAmount) || 20,
        uploadedBy: req.user._id,
      });

      await video.save();
      res.status(201).json({ message: "Video uploaded successfully", video });
    } catch (error) {
      console.error("Upload video error:", error);
      res.status(500).json({ message: "Server error uploading video" });
    }
  },
);

// PUT update video (Admin only)
router.put("/:videoId", checkAdminPermission("admin"), async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description, isActive, rewardAmount } = req.body;

    const video = await Video.findByIdAndUpdate(
      videoId,
      { title, description, isActive, rewardAmount },
      { new: true },
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json({ message: "Video updated successfully", video });
  } catch (error) {
    console.error("Update video error:", error);
    res.status(500).json({ message: "Server error updating video" });
  }
});

// DELETE video (Admin only)
router.delete("/:videoId", checkAdminPermission("admin"), async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({ message: "Server error deleting video" });
  }
});

// POST track video watch start
router.post("/:videoId/watch", async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Check if user already watched this video today
    const existingWatch = await VideoWatch.findOne({
      user: userId,
      video: videoId,
      watchDate: today,
    });

    if (existingWatch) {
      return res.json({
        message: "Already watched today",
        watch: existingWatch,
      });
    }

    // Create new watch record
    const watch = new VideoWatch({
      user: userId,
      video: videoId,
      watchDate: today,
    });

    await watch.save();
    res.json({ message: "Watch started", watch });
  } catch (error) {
    console.error("Start watch error:", error);
    res.status(500).json({ message: "Server error starting watch" });
  }
});

// PUT update video watch progress
router.put("/:videoId/watch/:watchId", async (req, res) => {
  try {
    const { videoId, watchId } = req.params;
    const { watchDuration, completed } = req.body;
    const userId = req.user._id;

    const watch = await VideoWatch.findOne({
      _id: watchId,
      user: userId,
      video: videoId,
    });

    if (!watch) {
      return res.status(404).json({ message: "Watch record not found" });
    }

    watch.watchDuration = watchDuration;
    watch.completed = completed;

    // Check if it's a full watch
    const video = await Video.findById(videoId);
    if (video && watchDuration >= video.duration && !watch.fullWatch) {
      watch.fullWatch = true;

      // Give reward if not already given
      if (!watch.rewardGiven) {
        watch.rewardGiven = true;

        // Update user balance
        await User.findByIdAndUpdate(userId, {
          $inc: { balance: video.rewardAmount },
        });

        // Update video stats
        await Video.findByIdAndUpdate(videoId, {
          $inc: { totalViews: 1, dailyViews: 1 },
        });

        // Send notification
        const user = await User.findById(userId);
        if (user && user.telegramChatId) {
          await telegramService.sendMessage(
            user.telegramChatId,
            `🎥 Video reward earned!\n` +
              `Amount: ${video.rewardAmount.toLocaleString()} ETB\n` +
              `From watching: ${video.title}`,
          );
        }
      }
    }

    await watch.save();
    res.json({ message: "Watch updated", watch });
  } catch (error) {
    console.error("Update watch error:", error);
    res.status(500).json({ message: "Server error updating watch" });
  }
});

// GET user's video watch history
router.get("/history", async (req, res) => {
  try {
    const watches = await VideoWatch.find({ user: req.user._id })
      .populate("video", "title rewardAmount")
      .sort({ watchedAt: -1 });
    res.json({ watches });
  } catch (error) {
    console.error("Get watch history error:", error);
    res.status(500).json({ message: "Server error fetching watch history" });
  }
});

// GET today's video rewards for user
router.get("/rewards/today", async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const watches = await VideoWatch.find({
      user: userId,
      watchDate: today,
      rewardGiven: true,
    }).populate("video", "rewardAmount");

    const todayRewards = watches.reduce((total, watch) => {
      return total + (watch.video?.rewardAmount || 0);
    }, 0);

    res.json({ todayRewards });
  } catch (error) {
    console.error("Get today's rewards error:", error);
    res.status(500).json({ message: "Server error fetching today's rewards" });
  }
});

module.exports = router;
