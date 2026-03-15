const mongoose = require('mongoose');

const SafetyDataSchema = new mongoose.Schema({
  locationName: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  streetlightDensity: { type: Number, min: 0, max: 100 }, // 0 to 100%
  policeProximity: { type: Number, min: 0 }, // distance in km
  accidentHistory: { type: Number, min: 0, max: 100 }, // 0 to 100 risk score
  womenSafetyScore: { type: Number, min: 0, max: 100 }, // 0 to 100 survey score
  calculatedScore: { type: Number }, // The target value for "training"
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SafetyData', SafetyDataSchema);
