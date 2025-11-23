const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// FIXED ROUTE LOADING
app.use("/api/scan", require(path.join(__dirname, "routes", "scan")));

app.get("/", (req, res) => {
  res.send("Resistor Scanner Backend Running");
});

// IMPORTANT: USE RENDER PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
