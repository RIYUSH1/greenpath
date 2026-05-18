const Trip = require("../models/Trip.js");

/**
 * Save a new trip record
 * POST /api/trips
 */
const createTrip = async (req, res) => {
  try {
    const { userId, origin, destination, mode, distance, duration, co2Saved } = req.body;

    if (!userId || !origin || !destination || !mode) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    const trip = await Trip.create({
      userId,
      origin,
      destination,
      mode,
      distance,
      duration,
      co2Saved,
    });

    res.status(201).json({
      message: "Trip saved successfully.",
      trip,
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ error: "Server error while creating trip." });
  }
};

/**
 * Get all trips for a specific user
 * GET /api/trips/:userId
 */
const getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;

    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ error: "Server error while fetching trips." });
  }
};

/**
 * Get total CO2 saved and trip stats
 * GET /api/trips/:userId/stats
 */
const getUserTripStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const trips = await Trip.find({ userId });
    const totalTrips = trips.length;
    const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalCO2Saved = trips.reduce((sum, t) => sum + (t.co2Saved || 0), 0);

    res.status(200).json({
      totalTrips,
      totalDistance: totalDistance.toFixed(2),
      totalCO2Saved: totalCO2Saved.toFixed(2),
    });
  } catch (error) {
    console.error("Error calculating trip stats:", error);
    res.status(500).json({ error: "Server error while calculating trip stats." });
  }
};

module.exports = {
  createTrip,
  getUserTrips,
  getUserTripStats,
};
