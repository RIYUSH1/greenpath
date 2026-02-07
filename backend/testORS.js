const axios = require("axios");
require("dotenv").config();

const apiKey = process.env.ORS_API_KEY;

async function testORS() {
  try {
    const res = await axios.get(
      `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=Chandigarh`
    );
    console.log("✅ API working:", res.data.features[0].geometry.coordinates);
  } catch (err) {
    console.error("❌ API error:", err.response?.data || err.message);
  }
}

testORS();
