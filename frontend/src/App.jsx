import React, { useState, useRef } from "react";
import axios from "axios";
import "./index.css";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  const processImage = async () => {
    if (!image) {
      alert("Please select or capture an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      // ✔ Correct backend URL with fallback
     const backendURL = import.meta.env.VITE_BACKEND_URL;

      if (!backendURL) {
        console.error("❌ VITE_BACKEND_URL is missing!");
        alert("Backend URL not configured");
        return;
      }

      const res = await axios.post(`${backendURL}/api/scan/file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error processing image");
    }
  };

  return (
    <div className="app-container">
      <header className="header">Resi-Scan</header>

      <div className="content">
        
        {preview && (
          <img src={preview} alt="preview" className="preview-image" />
        )}

        {result && (
          <div className="result-box">
            <p><strong>Bands:</strong> {result.band1_color} {result.band2_color} {result.multiplier_color} {result.tolerance_color}</p>
            <p><strong>Value:</strong> {(result.resistance_ohms / 1000).toFixed(3)} kΩ</p>
            <p><strong>Tolerance:</strong> {result.tolerance_percentage}</p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          ref={fileInputRef}
          style={{ display: "none" }}
        />

        <div className="button-row">
          <button className="btn purple" onClick={openFilePicker}>
            Select or Capture Image
          </button>
        </div>

        <button className="btn green" onClick={processImage}>
          PROCESS IMAGE
        </button>
      </div>
    </div>
  );
}

export default App;
