import React from "react";

export default function ResultCard({ result, preview }) {
  if (!result) {
    return (
      <div style={{ marginTop: 40, textAlign: "center", color: "#666" }}>
        <p style={{ fontSize: 18 }}>Results will be displayed here</p>
      </div>
    );
  }

  // convert ohms to human-friendly string
  const ohms = result?.resistance_ohms ?? null;
  const valueText = ohms >= 1000 ? `${(ohms / 1000).toLocaleString()} kΩ` : `${ohms} Ω`;

  return (
    <div style={{ marginTop: 20, textAlign: "center" }}>
      {preview && <img src={preview} alt="preview" className="preview" />}

      <div className="result-box">
        <p><strong>Bands:</strong> {result.band1_color} {result.band2_color} {result.multiplier_color} {result.tolerance_color}</p>
        <p><strong>Value:</strong> {valueText}</p>
        <p><strong>Tolerance:</strong> {result.tolerance_percentage}</p>
      </div>
    </div>
  );
}
