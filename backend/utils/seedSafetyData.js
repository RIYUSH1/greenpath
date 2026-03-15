const mongoose = require('mongoose');
const SafetyData = require('../models/SafetyData');
require('dotenv').config({ path: '../.env' });

const cities = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 }
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/greenpath');
    console.log('Connected to MongoDB for seeding...');

    await SafetyData.deleteMany({}); // Clear existing data
    console.log('Existing safety data cleared.');

    const dataset = [];
    for (let i = 0; i < 1000; i++) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      // Randomize coordinates within ~50km of city center
      const lat = city.lat + (Math.random() - 0.5) * 0.5;
      const lng = city.lng + (Math.random() - 0.5) * 0.5;

      const streetlightDensity = Math.floor(Math.random() * 101);
      const policeProximity = parseFloat((Math.random() * 5).toFixed(2)); // 0 to 5 km
      const accidentHistory = Math.floor(Math.random() * 101);
      const womenSafetyScore = Math.floor(Math.random() * 101);

      // Simple weighted formula to simulate a "trained" relationship
      // High streetlight + low police dist + low accidents + high women safety = High Score
      const calculatedScore = (
        (streetlightDensity * 0.3) +
        ((5 - policeProximity) * 20 * 0.3) + // scaling 0-5km to 0-100
        ((100 - accidentHistory) * 0.2) +
        (womenSafetyScore * 0.2)
      ) / 10; // Resulting in 0-10 scale

      dataset.push({
        locationName: `${city.name} Zone ${i}`,
        lat,
        lng,
        streetlightDensity,
        policeProximity,
        accidentHistory,
        womenSafetyScore,
        calculatedScore: parseFloat(calculatedScore.toFixed(1))
      });
    }

    await SafetyData.insertMany(dataset);
    console.log('Successfully seeded 1000 safety data points!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
