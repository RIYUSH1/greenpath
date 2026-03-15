// backend/routes/external_ors.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const ORS_API_KEY = process.env.ORS_API_KEY;

if (!ORS_API_KEY) {
  console.error("❌ ORS_API_KEY is missing in .env");
}

/* =====================================================
   ORS PROFILE + MODE MAPPING
   ===================================================== */
// Frontend may send: car, bus, bike, walk, train
// ORS supports only these profiles
const profileMap = {
  car: "driving-car",
  bus: "driving-car",   // simulate bus
  bike: "cycling-regular",
  walk: "foot-walking",
  train: "driving-car" // simulate train
};

/* =====================================================
   CO₂ EMISSION FACTORS (g CO₂ per km)
   ===================================================== */
const EMISSION_FACTORS = {
  car: 120,
  bus: 68,
  bike: 0,
  walk: 0,
  train: 41 // average rail per passenger-km
};

/* =====================================================
   HELPERS
   ===================================================== */
const normalizePlace = (place) =>
  place.toLowerCase().includes("india") ? place : `${place}, India`;

const geocodePlace = async (place) => {
  const r = await axios.get(
    "https://api.openrouteservice.org/geocode/search",
    {
      params: { text: place, size: 1 },
      headers: { Authorization: ORS_API_KEY },
      timeout: 8000,
    }
  );

  const features = r?.data?.features;
  if (!features || features.length === 0) return null;

  // ORS format: [lng, lat]
  return features[0].geometry.coordinates;
};

/* =====================================================
   ROUTE ENDPOINT
   ===================================================== */
router.post("/ors-route", async (req, res) => {
  try {
    let { origin, destination, profile = "car" } = req.body;

    // ---- Input sanitization ----
    origin = origin?.trim();
    destination = destination?.trim();

    if (!origin || !destination) {
      return res.status(400).json({
        error: "Origin and destination are required",
      });
    }

    const mode = profile.toLowerCase();
    const orsProfile = profileMap[mode];

    if (!orsProfile) {
      return res.status(400).json({
        error: "Unsupported transport mode",
      });
    }

    // ---- Geocoding ----
    const originCoords = await geocodePlace(normalizePlace(origin));
    const destinationCoords = await geocodePlace(
      normalizePlace(destination)
    );

    if (!originCoords || !destinationCoords) {
      return res.status(400).json({
        error: "Location not found. Try a nearby city or landmark.",
      });
    }

    const coordinates = [originCoords, destinationCoords];

    // ---- Routing (safe fallback always works) ----
    const routeResponse = await axios.post(
      `https://api.openrouteservice.org/v2/directions/${orsProfile}/geojson`,
      { coordinates },
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const routes = routeResponse?.data?.features;
    if (!routes || routes.length === 0) {
      return res.status(502).json({
        error: "Routing service returned no route",
      });
    }

    const route = routes[0];
    const summary = route.properties.summary;

    const distanceKm = summary.distance / 1000;
    const durationMin = summary.duration / 60;

    // ---- CO₂ Calculation ----
    const emissionFactor = EMISSION_FACTORS[mode] ?? 0;
    const co2Kg = (distanceKm * emissionFactor) / 1000;

    return res.json({
      mode,
      routing_profile_used: orsProfile,
      distance_km: distanceKm.toFixed(2),
      duration_min: durationMin.toFixed(2),
      co2_kg: co2Kg.toFixed(2),
      geometry: route.geometry.coordinates,
    });
  } catch (err) {
    console.error("ORS ERROR:", err.message);

    return res.status(500).json({
      error: "Failed to fetch route information",
    });
  }
});

module.exports = router;
