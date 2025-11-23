import React, { useState, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";

/**
 Props:
   onResult(resultObject, previewUrl)  --> called when backend returns prediction
*/

const BACKEND_URL = "http://localhost:5000/api/scan/file";

export default function CameraCapture({ onResult }) {
  const [preview, setPreview] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const webcamRef = useRef(null);

  // handle gallery selection
  function handleFileChange(e) {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    sendToBackend(file, url);
  }

  // convert dataURL to File and send
  function captureFromCamera() {
    setErrorMsg(null);
    const dataUrl = webcamRef.current.getScreenshot();
    if (!dataUrl) {
      setErrorMsg("Unable to capture image. Try again.");
      return;
    }

    // fetch the dataURL then create a File
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setPreview(dataUrl);
        sendToBackend(file, dataUrl);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg("Capture failed.");
      })
      .finally(() => setCameraOn(false));
  }

  // send image File to backend
  async function sendToBackend(file, previewUrl) {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const form = new FormData();
      form.append("image", file);

      const res = await axios.post(BACKEND_URL, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000, // 30s
      });

      if (res?.data) {
        if (typeof onResult === "function") onResult(res.data, previewUrl);
      } else {
        setErrorMsg("Invalid response from server");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.error || err.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      {cameraOn ? (
        <div className="camera-box">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="camera-feed"
            videoConstraints={{
              facingMode: "environment",
            }}
          />
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={captureFromCamera}>Capture</button>
            <button className="btn-cancel" onClick={() => setCameraOn(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {/* preview */}
          {preview && (
            <div style={{ textAlign: "center" }}>
              <img src={preview} alt="preview" className="preview" />
            </div>
          )}

          {isLoading && <p style={{ marginTop: 12, fontWeight: 600 }}>Processing image...</p>}
          {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
            <label className="btn upload-btn" style={{ cursor: "pointer" }}>
              Select or Capture Image
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>

            <button className="btn" onClick={() => setCameraOn(true)}>Open Camera</button>
          </div>
        </>
      )}
    </div>
  );
}
