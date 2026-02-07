// routes/trips.js
const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const authMiddleware = require('../middleware/auth');

// Get all trips of logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id });
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new trip
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { from, to, distance, co2Saved } = req.body;

    const trip = await Trip.create({
      user: req.user._id,
      from,
      to,
      distance,
      co2Saved,
      date: new Date(),
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
