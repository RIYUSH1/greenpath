// routes/dashboard.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Badge = require('../models/Badge');

// Get user dashboard stats
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const trips = await Trip.find({ user: userId });
    const totalCO2Saved = trips.reduce((acc, trip) => acc + (trip.co2Saved || 0), 0);
    const badges = await Badge.find({ user: userId });

    res.json({
      user,
      totalTrips: trips.length,
      totalCO2Saved: totalCO2Saved.toFixed(2),
      badgesEarned: badges.length,
      trips,
      badges,
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

// Leaderboard: top 10 users by CO2 saved
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Trip.aggregate([
      { $group: { _id: '$user', totalCO2Saved: { $sum: '$co2Saved' } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      { $project: { _id: 0, name: '$userInfo.name', email: '$userInfo.email', totalCO2Saved: 1 } },
      { $sort: { totalCO2Saved: -1 } },
      { $limit: 10 },
    ]);

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// User progress over time
router.get('/progress/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await Trip.aggregate([
      { $match: { user: userId } },
      { $group: { _id: { $month: '$date' }, monthlyCO2Saved: { $sum: '$co2Saved' } } },
      { $sort: { '_id': 1 } },
    ]);

    res.json(progress);
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({ message: 'Error fetching progress data' });
  }
});

module.exports = router;
