const mongoose = require("mongoose");

const UserStatsSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  ecoPoints: { type: Number, default: 0 },
  totalCO2Saved: { type: Number, default: 0 },
});

// ✅ Ensure one stats doc per user
UserStatsSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("UserStats", UserStatsSchema);
