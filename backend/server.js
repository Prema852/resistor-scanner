// backend/server.js
const express = require("express");
const scanRouter = require("./routes/scan");
const path = require("path");
const app = express();
const cors = require("cors");

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/scan", scanRouter);

// Serve uploaded files for debugging (optional)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// IMPORTANT: Use PORT provided by Railway
const PORT = process.env.PORT || 8080;

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
