const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");
const router = express.Router();

// ---- CSV Loading ----
let safetyDataPoints = [];
const csvPath = path.join(__dirname, "../ml/night_safety.csv");

const loadSafetyCSV = () => {
  try {
    if (fs.existsSync(csvPath)) {
      const content = fs.readFileSync(csvPath, "utf8");
      
      Papa.parse(content, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
          safetyDataPoints = [];
          results.data.forEach((row) => {
            if (
              row.latitude !== undefined && 
              row.longitude !== undefined && 
              row.crime_rate !== undefined && 
              row.lighting !== undefined && 
              row.crowd_density !== undefined && 
              row.police_distance !== undefined && 
              row.safety_score !== undefined
            ) {
              safetyDataPoints.push({
                lat: parseFloat(row.latitude),
                lng: parseFloat(row.longitude),
                crime: parseFloat(row.crime_rate),
                lighting: parseFloat(row.lighting),
                crowd: parseFloat(row.crowd_density),
                policeDistance: parseFloat(row.police_distance),
                connectivity: 7, // Fallback since connectivity is not in the CSV
                score: parseFloat(row.safety_score),
              });
            }
          });
          console.log("CSV Loaded:", safetyDataPoints.length, "points");
        }
      });
    } else {
      console.error("❌ CSV file not found at", csvPath);
    }
  } catch (err) {
    console.error("❌ Failed to load safety CSV:", err.message);
  }
};

loadSafetyCSV();

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getOverlapPercentage(route1, route2) {
  let overlapCount = 0;
  const maxLen = Math.max(route1.length, route2.length);
  if (maxLen === 0) return 0;

  const set2 = new Set(route2.map(c => `${c[0].toFixed(3)},${c[1].toFixed(3)}`));
  route1.forEach(c => {
      if (set2.has(`${c[0].toFixed(3)},${c[1].toFixed(3)}`)) overlapCount++;
  });
  return overlapCount / maxLen;
}

function calculateRouteSafety(coordinates, distanceKm = 0) {
  let totals = { crime: 0, lighting: 0, crowd: 0, policeDistance: 0, connectivity: 0 };
  let count = 0;

  if (!coordinates || !Array.isArray(coordinates)) return { avgScore: 50, metrics: {} };

  console.log("Starting safety analysis...");
  console.log("Matching nearest safety nodes...");

  const isLongRoute = distanceKm > 300;
  const step = isLongRoute ? 25 : 1;

  for (let i = 0; i < coordinates.length; i += step) {
    const [lng, lat] = coordinates[i];
    let nearest = null;
    let minDist = 1000; 

    if (safetyDataPoints && safetyDataPoints.length > 0) {
      safetyDataPoints.forEach((p) => {
        const d = getDistance(lat, lng, p.lat, p.lng);
        if (d < minDist) {
          minDist = d;
          nearest = p;
        }
      });
    }

    totals.crime += Number(nearest?.crime || 5);
    totals.lighting += Number(nearest?.lighting || 5);
    totals.crowd += Number(nearest?.crowd || 5);
    totals.policeDistance += Number(nearest?.policeDistance || 2);
    totals.connectivity += Number(nearest?.connectivity || 7);
    count++;
  }

  console.log("Calculating weighted score...");

  const countDiv = count || 1;
  const crimeAvg = totals.crime / countDiv;
  const lightingAvg = totals.lighting / countDiv;
  const crowdAvg = totals.crowd / countDiv;
  const policeDistanceAvg = totals.policeDistance / countDiv;
  const connectivityAvg = totals.connectivity / countDiv;

  const policeProximity = Math.max(0, 5 - policeDistanceAvg);

  const lighting100 = lightingAvg * 10;
  const policeProximity100 = policeProximity * 20; 
  const connectivity100 = connectivityAvg * 10;
  const crowd100 = crowdAvg * 10;
  const crime100 = crimeAvg * 10;

  console.log("Selecting safest route...");
  
  let safetyScore = 50;
  
  if (isLongRoute) {
    // Disable expensive ML operations for > 300km
    safetyScore = 50;
  } else {
    // crimeWeight = 0.45, lightingWeight = 0.25, policeWeight = 0.20, crowdWeight = 0.10
    // Penalize high crime heavily
    safetyScore = (
      (lighting100 * 0.25) +
      (policeProximity100 * 0.20) +
      (crowd100 * 0.10) +
      ((100 - crime100) * 0.45)
    );
  }
  
  safetyScore = Math.min(100, Math.max(10, Math.round(safetyScore) || 50));

  return {
    avgScore: safetyScore,
    metrics: {
      crime: Number(crimeAvg || 5).toFixed(1),
      lighting: Number(lighting100 || 50).toFixed(0),
      crowd: Number(crowd100 || 50).toFixed(0),
      connectivity: Number(connectivity100 || 70).toFixed(0),
      policeDistance: Number(policeDistanceAvg || 2).toFixed(2),
    }
  };
}

async function geocode(city) {
  try {
    const mtRes = await axios.get(`https://api.maptiler.com/geocoding/${encodeURIComponent(city)}.json?key=${process.env.MAPTILER_KEY}`);
    if (mtRes.data.features && mtRes.data.features.length) {
      return mtRes.data.features[0].geometry.coordinates;
    }
  } catch (err) {}
  try {
    const osmRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`, {
      headers: { 'User-Agent': 'GreenPath/1.0' }
    });
    if (osmRes.data && osmRes.data.length) {
      return [parseFloat(osmRes.data[0].lon), parseFloat(osmRes.data[0].lat)];
    }
  } catch (err) {}
  throw new Error(`Location not found: ${city}`);
}

router.post("/", async (req, res) => {
  try {
    let { from, to, coordinates } = req.body;
    if (from && to) {
      try {
        const start = await geocode(from);
        const end = await geocode(to);
        coordinates = [start, end];
      } catch (err) {
        return res.status(400).json({ error: "Invalid location", details: err.message });
      }
    }
    if (!coordinates || coordinates.length < 2) {
      return res.status(400).json({ error: "Start and end locations required" });
    }

    let finalFast = null;
    let finalSafe = null;
    let warning = undefined;

    // 1. Try ORS (for dual routes)
    try {
      const orsResponse = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        { 
          coordinates,
          preference: "fastest",
          alternative_routes: { target_count: 3, weight_factor: 1.8, share_factor: 0.6 } 
        },
        {
          headers: { Authorization: process.env.ORS_API_KEY, "Content-Type": "application/json" },
          timeout: 8000 
        }
      );

      const features = orsResponse.data.features;
      if (features && features.length > 0) {
        console.log("FAST ROUTE RECEIVED");
        console.log("SAFE ROUTE RECEIVED");
        let routes = features.map((f, idx) => {
          const distanceKm = f.properties.summary.distance / 1000;
          const safety = calculateRouteSafety(f.geometry.coordinates, distanceKm);
          return {
            id: idx,
            coordinates: f.geometry.coordinates,
            duration: Math.round(f.properties.summary.duration / 60),
            distance: distanceKm.toFixed(1),
            safetyScore: safety.avgScore,
            metrics: safety.metrics
          };
        });

        console.log("TOTAL ORS ROUTES RETURNED:", routes.length);
        routes.forEach(r => {
           console.log(`- Route ${r.id}: Duration ${r.duration}m, Score ${r.safetyScore}`);
        });

        finalFast = routes[0];
        let bestSafeRoute = routes[0];
        let maxScore = -1;

        routes.forEach(r => {
          const overlap = getOverlapPercentage(r.coordinates, finalFast.coordinates);
          
          if (r.id !== finalFast.id && overlap < 0.9) {
            if (r.safetyScore > maxScore) {
              maxScore = r.safetyScore;
              bestSafeRoute = r;
            }
          }
        });

        // If no alternative found that passes criteria, fallback to the next best
        if (maxScore === -1 && routes.length > 1) {
          bestSafeRoute = routes.find(r => r.id !== finalFast.id) || routes[0];
        } else if (routes.length === 1) {
          bestSafeRoute = routes[0];
        }

        finalSafe = bestSafeRoute;
        console.log(`SELECTED FAST: ${finalFast.id}`);
        console.log(`SELECTED SAFE: ${finalSafe.id}`);
      }
    } catch (err) {
      console.warn("ORS Dual Routing failed, trying ORS Single Route...", err.message);
      try {
        const orsSingle = await axios.post(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          { 
            coordinates,
            preference: "fastest"
          },
          {
            headers: { Authorization: process.env.ORS_API_KEY, "Content-Type": "application/json" },
            timeout: 8000 
          }
        );

        const route = orsSingle.data.features[0];
        if (route) {
          console.log("FAST ROUTE RECEIVED");
          const distanceKm = route.properties.summary.distance / 1000;
          const safety = calculateRouteSafety(route.geometry.coordinates, distanceKm);
          const data = {
            coordinates: route.geometry.coordinates,
            duration: Math.round(route.properties.summary.duration / 60),
            distance: distanceKm.toFixed(1),
            safetyScore: safety.avgScore,
            metrics: safety.metrics
          };
          finalFast = data;
          finalSafe = data;
          warning = "Advanced AI safe routing unavailable for long-distance route";
        }
      } catch (singleErr) {
        console.warn("ORS Single Routing failed too.", singleErr.message);
      }
    }

    // 2. Fallback to MapTiler (if ORS failed entirely)
    if (!finalFast) {
      try {
        const maptilerUrl = `https://api.maptiler.com/routes/v1/driving/${coordinates[0][0]},${coordinates[0][1]};${coordinates[1][0]},${coordinates[1][1]}.json?key=${process.env.MAPTILER_KEY}`;
        const mtResponse = await axios.get(maptilerUrl);
        const route = mtResponse.data.features[0];
        if (route) {
          console.log("FAST ROUTE RECEIVED");
          const distanceKm = route.properties.summary.distance / 1000;
          const safety = calculateRouteSafety(route.geometry.coordinates, distanceKm);
          const data = {
            coordinates: route.geometry.coordinates,
            duration: Math.round(route.properties.summary.duration / 60),
            distance: distanceKm.toFixed(1),
            safetyScore: safety.avgScore,
            metrics: safety.metrics
          };
          finalFast = data;
          finalSafe = data; // Same route as fallback
          warning = "Advanced AI safe routing unavailable for long-distance route";
        }
      } catch (err) {
        console.error("MapTiler Routing failed too:", err.message);
      }
    }

    if (!finalFast) {
      throw new Error("All routing engines failed. Please check API keys or ensure the route is possible.");
    }

    // Add backend debug logging
    console.log("FAST COORDS:", finalFast.coordinates.length);
    if (finalSafe && finalSafe !== finalFast) {
      console.log("SAFE COORDS:", finalSafe.coordinates.length);
    }
    console.log("CSV POINTS:", safetyDataPoints.length);

    res.json({
      fastRoute: finalFast,
      safeRoute: finalSafe || finalFast,
      warning: warning
    });

  } catch (err) {
    console.error("FULL BACKEND ROUTING ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;
