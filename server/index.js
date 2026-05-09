const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");

// Ensure upload directories exist
const createUploadDirs = () => {
  const uploadDirs = [
    path.join(__dirname, "uploads"),
    path.join(__dirname, "uploads", "receipts"),
    path.join(__dirname, "uploads", "documents"),
    path.join(__dirname, "uploads", "avatars"),
  ];

  uploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Create upload directories on startup
createUploadDirs();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const depositRoutes = require("./routes/deposits");
const withdrawalRoutes = require("./routes/withdrawals");
const commissionRoutes = require("./routes/commissions");
const mlmRoutes = require("./routes/mlm");
const dashboardRoutes = require("./routes/dashboard");
const adminRoutes = require("./routes/admin");
const vipRoutes = require("./routes/vip");

// Import middleware
const authMiddleware = require("./middleware/auth");
const adminMiddleware = require("./middleware/admin");

// Import jobs
require("./jobs/monthlyEarnings");
require("./jobs/vipBonuses");
require("./jobs/dailyReturns");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://www.sahamtradingplc.com",
      "http://sahamtradingplc.com",
      "https://sahamtradingplc.com",
      "https://www.sahamtradingplc.com",
      "http://31.97.125.62:3000",
      "http://31.97.125.62:5000",
      "http://localhost:3000",
    ],
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Security middleware
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create receipts subdirectory
const receiptsDir = path.join(__dirname, "uploads", "receipts");
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}
// Serve static files
app.use("/uploads", express.static(uploadsDir));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/deposits", authMiddleware, depositRoutes);
app.use("/api/withdrawals", authMiddleware, withdrawalRoutes);
app.use("/api/commissions", authMiddleware, commissionRoutes);
app.use("/api/mlm", authMiddleware, mlmRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/vip", authMiddleware, vipRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
