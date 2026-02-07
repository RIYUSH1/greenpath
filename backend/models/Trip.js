// models/Trip.js
const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  origin: String,
  destination: String,
  mode: {
    type: String,
    enum: ["bike", "walk", "car", "bus", "train", "ev"],
    default: "car",
  },
  distance_km: Number,
  duration_min: Number,
  co2_saved_kg: Number, // when user chooses greener route than baseline
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Trip", TripSchema);
