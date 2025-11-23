const express = require("express");
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/file", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });

  const imgPath = req.file.path;

  const python = spawn("python", [
    path.join(__dirname, "..", "inference", "inference.py"),
    "--model",
    path.join(__dirname, "..", "model", "model.tflite"),
    "--image",
    imgPath,
  ]);

  let output = "";
  let error = "";

  python.stdout.on("data", (data) => (output += data.toString()));
  python.stderr.on("data", (data) => (error += data.toString()));

  python.on("close", (code) => {
    fs.unlinkSync(imgPath);

    if (code !== 0) {
      return res.status(500).json({ error: "Python error", details: error });
    }

    try {
      return res.json(JSON.parse(output));
    } catch (e) {
      return res.status(500).json({ error: "Invalid JSON", raw: output });
    }
  });
});

module.exports = router;
