// routes/transit.js
const express = require('express');
const router = express.Router();
const Transit = require('../models/Transit');
const authMiddleware = require('../middleware/auth');

// Get all transit entries
router.get('/', authMiddleware, async (req, res) => {
  try {
    const transit = await Transit.find();
    res.json(transit);
  } catch (error) {
    console.error('Error fetching transit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new transit entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, route, time } = req.body;
    const newTransit = await Transit.create({ type, route, time });
    res.status(201).json(newTransit);
  } catch (error) {
    console.error('Error creating transit entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
