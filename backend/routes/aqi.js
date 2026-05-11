// backend/routes/aqi.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

function getAQICategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Poor";
  if (aqi <= 300) return "Very Poor";
  return "Hazardous";
}

router.get("/city", async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: "Missing city query parameter" });

  try {
    const API_KEY = process.env.WAQI_API_KEY || process.env.OPENWEATHER_KEY || "demo";

    // 1) Fetch Air quality using WAQI API
    const waqiUrl = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${API_KEY}`;
    const response = await axios.get(waqiUrl, { timeout: 5000 });

    console.log(`[AQI Route] Real WAQI API response for ${city}:`, response.data);

    if (response.data && response.data.status === "ok") {
      const aqi = response.data.data.aqi;
      return res.json({
        city: response.data.data.city.name || city,
        aqi: aqi,
        category: getAQICategory(aqi),
        timestamp: response.data.data.time?.s || new Date().toISOString()
      });
    } else {
      // API responded but status not ok (e.g., unknown city)
      console.warn(`[AQI Route] WAQI API issue for ${city}:`, response.data);
      return res.status(404).json({ error: true, message: response.data?.data || "AQI data unavailable for this city" });
    }

  } catch (err) {
    console.error("[AQI Route] AQI proxy error:", err?.response?.data || err.message || err);
    return res.status(500).json({ error: true, message: "Failed to fetch AQI data" });
  }
});

module.exports = router;
