const axios = require("axios");
const Route = require("../models/Route.js");

/**
 * Compare transit routes and calculate CO2 emissions.
 */
const compareTransitRoutes = async (req, res) => {
  try {
    const { origin, destination, mode } = req.body;

    if (!origin || !destination || !mode) {
      return res.status(400).json({ error: "Origin, destination, and mode are required." });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${apiKey}`;

    // Fetch route data from Google Directions API
    const response = await axios.get(url);
    const routeData = response.data.routes[0]?.legs[0];

    if (!routeData) {
      return res.status(404).json({ message: "No route found for the given input." });
    }

    // Calculate distance, duration, and CO2 emission
    const distanceKm = routeData.distance.value / 1000;
    const duration = routeData.duration.text;

    // Example CO2 emission factors (kg/km)
    const EMISSION_FACTORS = {
      driving: 0.120,
      transit: 0.065,
      bicycling: 0.0,
      walking: 0.0,
    };

    const co2Emission = distanceKm * (EMISSION_FACTORS[mode] ?? 0.1);

    // Save route data to MongoDB
    const newRoute = await Route.create({
      origin,
      destination,
      mode,
      distance: distanceKm,
      duration,
      co2: co2Emission,
    });

    return res.status(200).json({
      message: "Comparison successful.",
      route: newRoute,
    });
  } catch (err) {
    console.error("Error in compareTransitRoutes:", err);
    res.status(500).json({ error: "Server error while comparing routes." });
  }
};

module.exports = { compareTransitRoutes };
