const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");
const router = express.Router();

const csvPath = path.join(__dirname, "../data/night_safety.csv");

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

router.post("/", async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) return res.status(400).json({ error: "Location is required" });

    // Geocode location
    let coords;
    try {
      const mtRes = await axios.get(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(
          location
        )}.json?key=${process.env.MAPTILER_KEY}`
      );
      if (mtRes.data.features && mtRes.data.features.length) {
        coords = mtRes.data.features[0].geometry.coordinates;
      }
    } catch (err) {
      console.warn(`[NightSafety] MapTiler failed for "${location}":`, err.message);
    }

    // Fallback to Nominatim if MapTiler failed or returned no results
    if (!coords) {
      try {
        const osmRes = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            location
          )}`,
          { headers: { "User-Agent": "GreenPath/1.0" } }
        );
        if (osmRes.data && osmRes.data.length) {
          coords = [parseFloat(osmRes.data[0].lon), parseFloat(osmRes.data[0].lat)];
          console.log(`[NightSafety] Nominatim found coordinates for "${location}":`, coords);
        }
      } catch (fErr) {
        console.error("[NightSafety] Nominatim fallback failed:", fErr.message);
      }
    }

    if (!coords) return res.status(404).json({ error: "Unable to analyze this region" });

    const [lng, lat] = coords;

    // Load CSV and find nearest points
    let safetyPoints = [];
    if (fs.existsSync(csvPath)) {
      const content = fs.readFileSync(csvPath, "utf8");
      const results = Papa.parse(content, { 
        header: true, 
        dynamicTyping: true,
        skipEmptyLines: true
      });
      safetyPoints = results.data.filter(p => p.latitude && p.longitude);
    }

    // Find nearest 5 points
    let nearestPoints = safetyPoints
      .map(p => ({ ...p, dist: getDistance(lat, lng, p.latitude, p.longitude) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5);

    // If no points within 100km, use a default estimation
    let data;
    if (nearestPoints.length > 0 && nearestPoints[0].dist < 100) {
      // Average the nearest points
      const count = nearestPoints.length;
      data = {
        street_lighting: nearestPoints.reduce((acc, p) => acc + (p.street_lighting || 5), 0) / count,
        police_presence: nearestPoints.reduce((acc, p) => acc + (p.police_presence || 5), 0) / count,
        crowd_density: nearestPoints.reduce((acc, p) => acc + (p.crowd_density || 5), 0) / count,
        transport_access: nearestPoints.reduce((acc, p) => acc + (p.transport_access || 5), 0) / count,
        women_safety_reports: nearestPoints.reduce((acc, p) => acc + (p.women_safety_reports || 5), 0) / count,
        crime_rate: nearestPoints.reduce((acc, p) => acc + (p.crime_rate || 5), 0) / count,
      };
    } else {
      data = {
        street_lighting: 5,
        police_presence: 4,
        crowd_density: 5,
        transport_access: 5,
        women_safety_reports: 5,
        crime_rate: 6,
      };
    }

    // ML weighted prediction logic
    // nightScore = (lighting*0.25 + police*0.2 + crowd*0.15 + transport*0.15 + women*0.1 - crime*0.15)
    const scoreRaw = 
        data.street_lighting * 0.25 +
        data.police_presence * 0.20 +
        data.crowd_density * 0.15 +
        data.transport_access * 0.15 +
        data.women_safety_reports * 0.10 -
        data.crime_rate * 0.15;
    
    // Normalize [-1.5, 8.5] to [0, 100] -> (val + 1.5) * 10
    let finalScore = Math.round((scoreRaw + 1.5) * 10);
    finalScore = Math.min(100, Math.max(0, finalScore));

    let status = "MODERATE";
    let color = "#f59e0b"; // Orange
    let recommendation = "Area has moderate nighttime safety factors. Exercise caution.";

    if (finalScore >= 75) {
      status = "SAFE";
      color = "#10b981"; // Green
      recommendation = "Area has good nighttime safety. Well-lit and monitored.";
    } else if (finalScore < 45) {
      status = "RISKY";
      color = "#ef4444"; // Red
      recommendation = "Area has elevated nighttime risk. Avoid isolated paths.";
    }

    res.json({
      location,
      score: finalScore,
      status,
      recommendation,
      lat,
      lng,
      color,
      factors: {
        lighting: Math.round(data.street_lighting),
        policePresence: Math.round(data.police_presence),
        crowdDensity: Math.round(data.crowd_density),
        transportAccess: Math.round(data.transport_access)
      },
      details: {
        street_lighting: Math.round(data.street_lighting),
        police_presence: Math.round(data.police_presence),
        crowd_density: Math.round(data.crowd_density),
        transport_access: Math.round(data.transport_access)
      }
    });
  } catch (err) {
    console.error("Night safety API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
