// models/Trip.js
const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  from: { type: String },
  to: { type: String },
  mode: {
    type: String,
    enum: ["bike", "walk", "car", "bus", "train", "ev"],
    default: "car",
  },
  distance: { type: Number },
  duration_min: { type: Number },
  co2Saved: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Trip", TripSchema);

