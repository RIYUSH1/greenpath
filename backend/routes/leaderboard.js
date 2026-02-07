const express = require("express");
const router = express.Router();
const UserStats = require("../models/UserStats");
const User = require("../models/User");

// ✅ GET TOP 10 LEADERBOARD
router.get("/", async (req, res) => {
  try {
    const leaderboard = await UserStats.find()
      .sort({ ecoPoints: -1 })
      .limit(10)
      .populate("user", "name email"); // shows username & email

    res.json(leaderboard);
  } catch (err) {
    console.error("GET leaderboard error:", err);
    res.status(500).json({ error: "Server error fetching leaderboard" });
  }
});

// ✅ UPDATE USER ECO POINTS (Points = CO₂ Saved)
router.post("/update", async (req, res) => {
  try {
    const { userId, co2Saved } = req.body;

    // 🔍 Validate
    if (!userId || co2Saved === undefined) {
      return res.status(400).json({ error: "userId and co2Saved are required" });
    }

    const savedAmount = Number(co2Saved);
    if (isNaN(savedAmount)) {
      return res.status(400).json({ error: "co2Saved must be a valid number" });
    }

    // 🎯 Convert CO2 to Eco Points (you can change the multiplier)
    const pointsEarned = Math.round(savedAmount * 10); // 1kg = 10 points

    // 🗂 Update or create user stats document
    const stats = await UserStats.findOneAndUpdate(
      { user: userId },
      { $inc: { ecoPoints: pointsEarned, totalCO2Saved: savedAmount } },
      { new: true, upsert: true }
    ).populate("user", "name email");

    // Return updated stats
    res.json({
      message: "Eco points updated successfully ✅",
      updatedStats: stats,
    });

  } catch (err) {
    console.error("POST leaderboard update error:", err);
    res.status(500).json({ error: "Server error updating points" });
  }
});

module.exports = router;
