// backend/utils/co2.js
// approximate emission factors (kg CO2 per km)
const FACTORS = {
  car: 0.192,    // ~192 g/km
  bus: 0.089,
  train: 0.041,
  bike: 0,
  walk: 0,
  ev: 0.075,     // example for electric vehicle (grid average)
  scooter: 0.06
};

function computeCO2(mode, distanceKm) {
  const factor = FACTORS[mode] ?? FACTORS.car;
  return +(factor * (distanceKm || 0)).toFixed(3);
}

module.exports = { computeCO2, FACTORS };
