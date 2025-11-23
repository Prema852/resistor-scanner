const express = require("express");
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

const router = express.Router();

// Use /tmp for Render (safe writable directory)
const uploadDir = "/tmp";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// IMPORTANT: Python3 on Render
const PYTHON_CMD = "python3";

router.post("/file", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });

  const imgPath = req.file.path;

  const modelPath = path.join(__dirname, "..", "model", "model.tflite");
  const inferenceScript = path.join(__dirname, "..", "inference", "inference.py");

  if (!fs.existsSync(modelPath)) {
    return res.status(500).json({
      error: "Model file not found",
      modelPath: modelPath,
    });
  }

  const python = spawn(PYTHON_CMD, [
    inferenceScript,
    "--model",
    modelPath,
    "--image",
    imgPath,
  ]);

  // IMPORTANT: log spawn errors so we can see why Python didn't start on Render
  python.on("error", (err) => {
    console.error("PYTHON SPAWN ERROR:", err);
  });

  let output = "";
  let errorOutput = "";

  python.stdout.on("data", (data) => (output += data.toString()));
  python.stderr.on("data", (data) => (errorOutput += data.toString()));

  python.on("close", (code) => {
    try { fs.unlinkSync(imgPath); } catch {}

    if (code !== 0) {
      return res.status(500).json({
        error: "Python error",
        details: errorOutput,
      });
    }

    try {
      return res.json(JSON.parse(output));
    } catch (e) {
      return res.status(500).json({
        error: "Invalid JSON output",
        raw: output,
      });
    }
  });
});

module.exports = router;
