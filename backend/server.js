const express = require("express");
const scanRouter = require("./routes/scan");
const path = require("path");
const cors = require("cors");

const app = express();

// Allow CORS (important for frontend)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/scan", scanRouter);

// Root route (Fix for Railway 502 error)
app.get("/", (req, res) => {
  res.send("Resistor Scanner Backend is running 🚀");
});

// Static upload folder (optional for debugging)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Must listen on Railway-assigned port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
