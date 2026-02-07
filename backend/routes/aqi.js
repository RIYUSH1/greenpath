// backend/routes/aqi.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/city", async (req, res) => {
  try {
    const { city } = req.query;
    const API_KEY = process.env.OPENWEATHER_KEY;
    if (!API_KEY) return res.status(500).json({ error: "OPENWEATHER_KEY not set on server" });
    if (!city) return res.status(400).json({ error: "Missing city query parameter" });

    // 1) Geocode
    const geo = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
      params: { q: city, limit: 1, appid: API_KEY },
    });
    if (!geo.data || !geo.data[0]) return res.status(404).json({ error: "Location not found" });

    const { lat, lon } = geo.data[0];

    // 2) Air pollution
    const aqiRes = await axios.get("https://api.openweathermap.org/data/2.5/air_pollution", {
      params: { lat, lon, appid: API_KEY },
    });

    const item = aqiRes.data?.list?.[0] || null;
    return res.json({
      lat,
      lon,
      aqi: item?.main?.aqi ?? null,
      components: item?.components ?? null,
    });
  } catch (err) {
    console.error("AQI proxy error:", err?.response?.data || err.message || err);
    return res.status(500).json({ error: "Failed to fetch AQI" });
  }
});

module.exports = router;
