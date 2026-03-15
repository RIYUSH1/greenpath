import { useState } from "react";
import { API_BASE_URL } from "../api/config";

export default function NightSafety() {
  const [place, setPlace] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkSafety = async () => {
    if (!place.trim()) {
      setError("Please enter a place name");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // ✅ Using Centralized API Base URL
      const res = await fetch(`${API_BASE_URL}/api/night-safety`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ place })
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch night safety score");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "420px" }}>
      <h2>🌙 Night Safety Checker</h2>

      <input
        type="text"
        placeholder="Enter place name (India)"
        value={place}
        onChange={(e) => setPlace(e.target.value)}
        style={{ padding: "8px", width: "100%" }}
      />

      <br /><br />

      <button onClick={checkSafety} disabled={loading}>
        {loading ? "Checking..." : "Check Safety"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Night Safety Score: {result.night_safety_score}</h3>

          <p>📍 Place: {result.input?.place}</p>
          <p>🚓 Police Distance: {result.details?.police_distance_m} m</p>
          <p>⚠️ Accidents: {result.details?.accidents}</p>
          <p>💡 Streetlights: {result.details?.streetlights}</p>
        </div>
      )}
    </div>
  );
}
