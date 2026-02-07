// backend/routes/external_ors.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const ORS_API_KEY = process.env.ORS_API_KEY;

const profileMap = {
  car: "driving-car",
  bus: "driving-hgv",
  bike: "cycling-regular",
  walk: "foot-walking",
};

router.post("/ors-route", async (req, res) => {
  try {
    const { origin, destination, profile = "car" } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: "origin and destination required" });
    }

    const orsProfile = profileMap[profile.toLowerCase()];
    if (!orsProfile) {
      return res.status(400).json({ error: "Invalid profile" });
    }

    const normalizePlace = (p) =>
      p.toLowerCase().includes("india") ? p : `${p}, india`;

    const geo = async (place) => {
      const r = await axios.get(
        "https://api.openrouteservice.org/geocode/search",
        {
          params: { text: place, size: 1 },
          headers: { Authorization: ORS_API_KEY },
        }
      );

      const features = r?.data?.features;

      if (!features || features.length === 0) {
        throw new Error(`Location not found: ${place}`);
      }

      return features[0].geometry.coordinates;
    };

    const originCoords = await geo(normalizePlace(origin));
    const destinationCoords = await geo(normalizePlace(destination));

    const response = await axios.post(
      `https://api.openrouteservice.org/v2/directions/${orsProfile}`,
      {
        coordinates: [originCoords, destinationCoords],
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const routeFeatures = response?.data?.features;
    if (!routeFeatures || routeFeatures.length === 0) {
      throw new Error("No route returned from ORS");
    }

    const route = routeFeatures[0];
    const summary = route.properties.summary;

    res.json({
      distance_km: (summary.distance / 1000).toFixed(2),
      duration_min: (summary.duration / 60).toFixed(2),
      geometry: route.geometry.coordinates,
    });
  } catch (error) {
    console.error("ORS ERROR:", error.message);

    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
