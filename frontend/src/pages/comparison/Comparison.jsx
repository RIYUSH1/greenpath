// Comparison.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bar, Radar, Line } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";
import { FaTrophy, FaLeaf, FaChartBar, FaUser, FaWind, FaLeaf as LeafIcon } from "react-icons/fa";
import fetchAQIProxy from "../../utils/fetchAQI_via_proxy";


/**
 * Comparison.jsx
 *
 * Enhanced Route & Eco Comparison component
 * - Compares two travel modes using ORS (backend) for distance/time
 * - Renders both routes on a single Google hybrid map (satellite + labels)
 * - Adds Traffic layer
 * - Computes CO₂ using emission factors
 * - Submits eco-savings to leaderboard API when user is logged-in
 * - **AQI** integration using a backend proxy to OpenWeather
 *   - shows numeric AQI (1..5), components (pm2_5, pm10, no2...), and health tips
 * - Several charts: CO₂ comparison, transport baseline, AQI trend (mocked)
 * - Visual improvements and many helpful inline comments
 *
 * Notes:
 * - Make sure backend provides /api/external/ors-route and /api/leaderboard/update and /api/aqi/city
 * - Keep your actual OpenWeather key on the backend (.env)
 */

/* ===================== EMISSION FACTORS ===================== */
const EMISSION_FACTORS = {
  car: 0.21,
  motorcycle: 0.11,
  bus: 0.09,
  train: 0.04,
  bicycle: 0.0,
  walking: 0.0,
};

/* ===================== Helper: Formatting ===================== */
function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

/* ===================== Backend ORS Fetch ===================== */
const fetchRoutes = async (origin, destination, profile) => {
  try {
    const response = await axios.post("http://localhost:5000/api/external/ors-route", {
      origin,
      destination,
      profile,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching ORS route:", error.response?.data || error.message);
    return null;
  }
};

/* ===================== Google travel mode mapping ===================== */
const googleModeMap = {
  car: "DRIVING",
  bus: "TRANSIT",
  train: "TRANSIT",
  bicycle: "BICYCLING",
  walking: "WALKING",
};

/* ===================== Helper: Badge (client fallback) ===================== */
const computeBadgeFromPoints = (points = 0) => {
  if (points >= 500) return "🦅 Earth Saver Legend";
  if (points >= 200) return "🌍 Green Guardian";
  if (points >= 50) return "🚲 Eco Rider";
  return "🌱 Beginner Eco Walker";
};

/* ===================== AQI Helpers ===================== */
/**
 * aqiLabel
 * Map OpenWeather AQI number (1..5) to label and tailwind color class
 */
const aqiLabel = (v) => {
  if (v === 1) return { label: "Good", color: "text-green-400", bg: "bg-green-900/30", tip: "Air quality is good. Enjoy outdoor activities." };
  if (v === 2) return { label: "Fair", color: "text-lime-300", bg: "bg-lime-900/30", tip: "Air quality is fair. Sensitive individuals should be cautious." };
  if (v === 3) return { label: "Moderate", color: "text-yellow-300", bg: "bg-yellow-900/30", tip: "Moderate pollution — consider reducing prolonged outdoor exertion." };
  if (v === 4) return { label: "Poor", color: "text-orange-400", bg: "bg-orange-900/30", tip: "Poor air quality — avoid heavy outdoor exercise and consider masks." };
  if (v === 5) return { label: "Very Poor", color: "text-red-400", bg: "bg-red-900/30", tip: "Very poor air quality — stay indoors and use an air purifier if possible." };
  return { label: "Unknown", color: "text-gray-300", bg: "bg-gray-900/20", tip: "Air quality data unavailable." };
};

/* ===================== Small UI Subcomponents ===================== */

/**
 * StatCard — small reusable card to show a stat
 */
function StatCard({ title, value, sub, icon }) {
  return (
    <div className="p-4 bg-white/6 rounded-lg border border-white/10">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <div className="text-sm text-gray-300">{title}</div>
          <div className="text-lg font-semibold">{value}</div>
          {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

/**
 * AQICard — shows AQI numeric, label, components and a tip
 */
function AQICard({ place, aqiData /* { aqi, components, lat, lon } */ }) {
  const numeric = aqiData?.aqi ?? null;
  const components = aqiData?.components ?? null;
  const lbl = aqiLabel(numeric);

  return (
    <div className={`p-4 rounded-lg border ${lbl.bg} border-white/10`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-300">{place}</div>
          <div className="text-xl font-bold">{numeric ? `AQI ${numeric} — ${lbl.label}` : "AQI — N/A"}</div>
        </div>
        <div className={`text-3xl ${lbl.color}`}>{numeric ? (numeric <= 2 ? "😊" : numeric === 3 ? "😐" : "😷") : "—"}</div>
      </div>

      {components ? (
        <div className="text-sm mb-3">
          <div>PM2.5: {components.pm2_5 ?? "—"} µg/m³</div>
          <div>PM10: {components.pm10 ?? "—"} µg/m³</div>
          <div>NO₂: {components.no2 ?? "—"} µg/m³</div>
        </div>
      ) : (
        <div className="text-sm text-gray-400 mb-3">Components not available</div>
      )}

      <div className="text-xs text-gray-200 mb-2">{lbl.tip}</div>

      <div>
        <button
          className="px-3 py-1 rounded bg-white/6 text-sm hover:bg-white/8"
          onClick={() => {
            // copy quick summary to clipboard
            const summary = `${place} — ${numeric ? `AQI ${numeric} (${lbl.label})` : "AQI N/A"}`;
            navigator.clipboard?.writeText(summary).then(() => {
              // user feedback could be added; keep simple
            });
          }}
        >
          Copy summary
        </button>
      </div>
    </div>
  );
}

/* ===================== Main Component ===================== */

export default function Comparison() {
  // Inputs & state
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [modeA, setModeA] = useState("car");
  const [modeB, setModeB] = useState("bus");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // stores computed route stats
  const [mapError, setMapError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [username, setUsername] = useState(() => localStorage.getItem("ecoUserName") || "Riyush Kumar");

  // store full AQI objects returned by proxy
  const [aqiOrigin, setAqiOrigin] = useState(null); // { aqi, components, lat, lon }
  const [aqiDest, setAqiDest] = useState(null);

  // map refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // small UX toggles
  const [showComponents, setShowComponents] = useState(true);
  const [showAQIChart, setShowAQIChart] = useState(true);

  useEffect(() => {
    // initial fetch of leaderboard (if any)
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===================== Fetch Leaderboard ===================== */
  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaderboard");
      // backend may return array or { data: [] } depending on implementation
      setLeaderboard(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err.response?.data || err.message);
    }
  };

  /* ---------------------- Dynamic Google Maps loader ---------------------- */
  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") return reject(new Error("No window"));
      if (window.google && window.google.maps) return resolve();
      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!key) return reject(new Error("VITE_GOOGLE_MAPS_API_KEY not set in .env"));

      // prevent adding multiple script tags
      if (document.querySelector('script[data-google-maps]')) {
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 200);
        setTimeout(() => {
          clearInterval(checkInterval);
          if (window.google && window.google.maps) resolve();
          else reject(new Error("Google Maps load timeout"));
        }, 12000);
        return;
      }

      const script = document.createElement("script");
      script.setAttribute("data-google-maps", "true");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google && window.google.maps) resolve();
        else reject(new Error("Google Maps loaded but window.google not found"));
      };
      script.onerror = (e) => {
        reject(new Error("Failed to load Google Maps script"));
      };
      document.head.appendChild(script);
    });
  };

  /* ---------------------- Draw two routes on single map ---------------------- */
  const drawTwoRoutesOnMap = async (o, d, mA, mB) => {
    setMapError(null);
    try {
      await loadGoogleMaps();
    } catch (err) {
      console.error("Google Maps load error:", err);
      setMapError(err.message);
      return;
    }

    if (!mapRef.current) {
      setMapError("Map container not available");
      return;
    }

    // initialize map if not initialized
    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 28.6139, lng: 77.209 }, // fallback center
        mapTypeId: "hybrid", // hybrid gives satellite + labels
        gestureHandling: "greedy",
      });

      // add traffic layer
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(mapInstance.current);
    } else {
      // reset center/zoom if desired
      mapInstance.current.setCenter({ lat: 28.6139, lng: 77.209 });
      mapInstance.current.setZoom(12);
    }

    // DirectionsService and two renderers
    const directionsService = new window.google.maps.DirectionsService();

    // create separate renderers so we can style them
    const rendererA = new window.google.maps.DirectionsRenderer({
      map: mapInstance.current,
      preserveViewport: false,
      polylineOptions: { strokeColor: "#00c853", strokeWeight: 6 }, // green
      suppressMarkers: false,
    });
    const rendererB = new window.google.maps.DirectionsRenderer({
      map: mapInstance.current,
      preserveViewport: false,
      polylineOptions: { strokeColor: "#ff1744", strokeWeight: 6 }, // red
      suppressMarkers: false,
    });

    // helper to convert our mode -> google travel mode
    const toGoogleMode = (mode) => googleModeMap[mode] || "DRIVING";

    // run both route requests (they will render on callbacks)
    directionsService.route(
      {
        origin: o,
        destination: d,
        travelMode: toGoogleMode(mA),
        provideRouteAlternatives: false,
      },
      (result, status) => {
        if (status === "OK") {
          rendererA.setDirections(result);
          // optionally fit bounds to the returned route
          try {
            const dr = result.routes[0].bounds;
            mapInstance.current.fitBounds(dr);
          } catch (e) {
            /* ignore fit error */
          }
        } else {
          console.error("DirectionsService A error:", status);
        }
      }
    );

    directionsService.route(
      {
        origin: o,
        destination: d,
        travelMode: toGoogleMode(mB),
        provideRouteAlternatives: false,
      },
      (result, status) => {
        if (status === "OK") {
          rendererB.setDirections(result);
          // optionally fit bounds to include both routes (we try to union bounds)
          try {
            const boundsA = rendererA.getDirections()?.routes?.[0]?.bounds;
            const boundsB = result.routes[0].bounds;
            if (boundsA && boundsB) {
              const union = boundsA.union(boundsB);
              mapInstance.current.fitBounds(union);
            } else {
              mapInstance.current.fitBounds(result.routes[0].bounds);
            }
          } catch (e) {
            /* ignore */
          }
        } else {
          console.error("DirectionsService B error:", status);
        }
      }
    );
  };

  /* ===================== Compare handler ===================== */
  async function compare() {
    if (!origin || !destination) {
      alert("Please enter both origin and destination.");
      return;
    }

    setLoading(true);
    setResults(null);
    setMapError(null);
    setAqiOrigin(null);
    setAqiDest(null);

    try {
      // Call ORS backend for both modes to get distance/duration
      const [respA, respB] = await Promise.all([
        fetchRoutes(origin, destination, modeA),
        fetchRoutes(origin, destination, modeB),
      ]);

      if (!respA || !respB) {
        alert("Failed to fetch route information from backend. Check server logs.");
        setLoading(false);
        return;
      }

      // Normalize and store results (distance_km and duration_min expected)
      const aDistance = parseFloat(respA.distance_km || 0);
      const aTimeMin = parseFloat(respA.duration_min || 0);
      const bDistance = parseFloat(respB.distance_km || 0);
      const bTimeMin = parseFloat(respB.duration_min || 0);

      const computed = {
        a: {
          mode: modeA,
          distance_km: +aDistance.toFixed(2),
          duration_min: +aTimeMin.toFixed(2),
          co2_kg: +((EMISSION_FACTORS[modeA] || 0) * aDistance).toFixed(3),
        },
        b: {
          mode: modeB,
          distance_km: +bDistance.toFixed(2),
          duration_min: +bTimeMin.toFixed(2),
          co2_kg: +((EMISSION_FACTORS[modeB] || 0) * bDistance).toFixed(3),
        },
      };

      setResults(computed);

      // calculate CO2 saved if user chooses greener option:
      // saved = higher_co2 - lower_co2
      const higher = Math.max(computed.a.co2_kg, computed.b.co2_kg);
      const lower = Math.min(computed.a.co2_kg, computed.b.co2_kg);
      const co2_saved = parseFloat((higher - lower).toFixed(3)); // kg

      // Fetch AQI for both origin and destination in parallel using proxy utility
      try {
        const [aqi1, aqi2] = await Promise.all([fetchAQIProxy(origin), fetchAQIProxy(destination)]);
        setAqiOrigin(aqi1 || null);
        setAqiDest(aqi2 || null);
      } catch (aqiErr) {
        console.warn("AQI fetch failed:", aqiErr);
      }

      // Post to leaderboard if there's meaningful saving (OFFSET applied)
      const userId = localStorage.getItem("userId");
      if (userId && co2_saved >= 0.01) {
        try {
          await axios.post("http://localhost:5000/api/leaderboard/update", {
            userId,
            co2Saved: co2_saved,
          });
          fetchLeaderboard();
        } catch (err) {
          console.error("Failed to post leaderboard update:", err.response?.data || err.message);
        }
      }

      // Draw both routes on a single Google map (satellite + traffic)
      await drawTwoRoutesOnMap(origin, destination, modeA, modeB);
    } catch (err) {
      console.error("Compare error:", err);
      alert("Error while comparing routes — check console for details.");
    } finally {
      setLoading(false);
    }
  }

  /* ===================== Chart data (kept as before) ===================== */
  const transportData = {
    labels: ["Car", "Bus", "Bicycle", "Walking"],
    datasets: [
      {
        label: "CO₂ Emissions (kg) baseline",
        data: [42, 15, 0, 0],
        backgroundColor: ["#9333ea", "#a855f7", "#22c55e", "#10b981"],
        borderRadius: 10,
      },
    ],
  };

  const radarData = {
    labels: ["Transport", "Recycling", "Energy", "Water", "Waste"],
    datasets: [
      {
        label: "You",
        data: [85, 70, 75, 60, 80],
        backgroundColor: "rgba(168,85,247,0.4)",
        borderColor: "#a855f7",
        pointBackgroundColor: "#9333ea",
      },
      {
        label: "Community Avg",
        data: [70, 60, 65, 55, 70],
        backgroundColor: "rgba(16,185,129,0.3)",
        borderColor: "#10b981",
        pointBackgroundColor: "#22c55e",
      },
    ],
  };

  const co2ChartData = results
    ? {
        labels: [results.a.mode.toUpperCase(), results.b.mode.toUpperCase()],
        datasets: [
          {
            label: "CO₂ Emissions (kg)",
            data: [results.a.co2_kg, results.b.co2_kg],
            backgroundColor: ["#10b981", "#ef4444"],
            borderRadius: 8,
          },
        ],
      }
    : null;

  /* ===================== AQI Chart (mock trend) ===================== */
  // If real historical AQI series is not available, show a small mocked trend for visual context.
  const aqiTrendData = (aqiO, aqiD) => {
    // create small synthetic 7-day arrays around current value (if available) for visual
    const makeSeries = (v) => {
      if (!v) return Array(7).fill(null);
      // jitter +/- 1 around v for 7 days
      return [v, v + 1, v, Math.max(1, v - 1), v + 1, v, v];
    };
    return {
      labels: ["-6d", "-5d", "-4d", "-3d", "-2d", "-1d", "Today"],
      datasets: [
        {
          label: "Origin AQI",
          data: makeSeries(aqiO),
          fill: false,
          tension: 0.3,
          borderColor: "#60a5fa",
          pointBackgroundColor: "#3b82f6",
        },
        {
          label: "Destination AQI",
          data: makeSeries(aqiD),
          fill: false,
          tension: 0.3,
          borderColor: "#fb7185",
          pointBackgroundColor: "#ef4444",
        },
      ],
    };
  };

  /* ===================== Render ===================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white p-8">
      <motion.div className="max-w-7xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <FaChartBar className="text-green-400" /> Route & Eco Comparison
            </h1>
            <p className="text-gray-300 mt-2">Compare two routes, see CO₂ & live Google satellite + traffic — plus AQI at origin & destination.</p>
          </div>

          {/* small username control */}
          <div className="flex items-center gap-2">
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                localStorage.setItem("ecoUserName", e.target.value);
              }}
              className="px-3 py-2 rounded bg-white/10 text-white border"
              placeholder="Your name"
              style={{ width: 220 }}
            />
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white/10 p-6 rounded-2xl shadow-lg mb-8">
          <div className="grid md:grid-cols-4 gap-3 mb-4">
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Origin (city or place)" className="p-3 rounded-lg bg-purple-800/40 border border-purple-500/40" />
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination (city or place)" className="p-3 rounded-lg bg-purple-800/40 border border-purple-500/40" />
            <select value={modeA} onChange={(e) => setModeA(e.target.value)} className="p-3 rounded-lg bg-purple-800/40 border border-purple-500/40">
              <option value="car">Car</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="bicycle">Bicycle</option>
              <option value="walking">Walking</option>
            </select>
            <select value={modeB} onChange={(e) => setModeB(e.target.value)} className="p-3 rounded-lg bg-purple-800/40 border border-purple-500/40">
              <option value="car">Car</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="bicycle">Bicycle</option>
              <option value="walking">Walking</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button disabled={loading} onClick={compare} className="px-5 py-3 bg-green-500 rounded-lg font-semibold hover:bg-green-400 transition disabled:opacity-60">
              {loading ? "Comparing..." : "Compare Routes"}
            </button>

            <button
              onClick={() => {
                // swap origin/destination
                const o = origin;
                setOrigin(destination);
                setDestination(o);
              }}
              className="px-4 py-2 bg-white/6 rounded hover:bg-white/8"
            >
              Swap
            </button>

            <div className="ml-auto flex items-center gap-3">
              <label className="text-sm text-gray-300">Show AQI components</label>
              <input type="checkbox" checked={showComponents} onChange={() => setShowComponents(!showComponents)} className="scale-125" />
            </div>
          </div>
          {mapError && <div className="text-red-300 mt-3">Map: {mapError}</div>}
        </div>

        {/* Top small stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard title="Selected Mode A" value={modeA.toUpperCase()} sub={`${results?.a?.distance_km ?? "—"} km`} icon={<FaLeaf />} />
          <StatCard title="Selected Mode B" value={modeB.toUpperCase()} sub={`${results?.b?.distance_km ?? "—"} km`} icon={<FaWind />} />
          <StatCard title="You" value={username} sub={computeBadgeFromPoints(leaderboard[0]?.ecoPoints || 0)} icon={<FaUser />} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <motion.div className="bg-white/10 p-6 rounded-2xl shadow-xl border border-white/20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FaLeaf className="text-green-400" /> Transport Emission Comparison
            </h2>
            <Bar data={transportData} />
          </motion.div>

          <motion.div className="bg-white/10 p-6 rounded-2xl shadow-xl border border-white/20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FaChartBar className="text-green-400" /> CO₂ — Selected Routes
            </h2>
            {co2ChartData ? <Bar data={co2ChartData} /> : <div className="text-gray-300">Run a comparison to see CO₂ chart</div>}
          </motion.div>

          <motion.div className="bg-white/10 p-6 rounded-2xl shadow-xl border border-white/20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FaUser className="text-green-400" /> You vs Community
            </h2>
            <Radar data={radarData} />
          </motion.div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-white/10 p-6 rounded-2xl shadow-xl mb-10">
            <h3 className="text-xl font-semibold mb-3">CO₂ Comparison & Savings</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-purple-800/30 rounded">
                <strong>{results.a.mode.toUpperCase()}</strong>
                <div>Distance: {results.a.distance_km} km</div>
                <div>Time: {formatDuration(results.a.duration_min * 60)}</div>
                <div>CO₂: {results.a.co2_kg} kg</div>
              </div>

              <div className="p-4 bg-purple-800/30 rounded">
                <strong>{results.b.mode.toUpperCase()}</strong>
                <div>Distance: {results.b.distance_km} km</div>
                <div>Time: {formatDuration(results.b.duration_min * 60)}</div>
                <div>CO₂: {results.b.co2_kg} kg</div>
              </div>

              <div className="p-4 bg-purple-800/30 rounded">
                <strong>Summary</strong>
                <div>Greenest: {results.a.co2_kg < results.b.co2_kg ? results.a.mode : results.b.mode}</div>
                <div>Fastest: {results.a.duration_min < results.b.duration_min ? results.a.mode : results.b.mode}</div>
              </div>
            </div>

            {/* quick action: copy or create offset suggestion */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const text = `Comparing ${origin} → ${destination}: ${results.a.mode.toUpperCase()} ${results.a.co2_kg}kg vs ${results.b.mode.toUpperCase()} ${results.b.co2_kg}kg CO₂`;
                  navigator.clipboard?.writeText(text);
                }}
                className="px-3 py-2 rounded bg-white/6 hover:bg-white/8"
              >
                Copy summary
              </button>

              <button
                onClick={() => {
                  // generate a human-friendly offset suggestion
                  const green = results.a.co2_kg < results.b.co2_kg ? results.a : results.b;
                  const other = results.a.co2_kg < results.b.co2_kg ? results.b : results.a;
                  const saved = (other.co2_kg - green.co2_kg).toFixed(3);
                  alert(`If you choose ${green.mode.toUpperCase()} you save ~${saved} kg CO₂ for this trip. Consider planting a tree or donating to a verified carbon offset program.`);
                }}
                className="px-3 py-2 rounded bg-amber-500 text-black font-semibold hover:bg-amber-400"
              >
                Offset suggestion
              </button>
            </div>
          </div>
        )}

        {/* AQI Section (added) */}
        {(aqiOrigin !== null || aqiDest !== null) && (
          <div className="bg-white/10 p-6 rounded-2xl shadow-xl mb-6">
            <h3 className="text-xl font-semibold mb-3">Air Quality (AQI)</h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <AQICard place={origin || "Origin"} aqiData={aqiOrigin} />
              <AQICard place={destination || "Destination"} aqiData={aqiDest} />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-sm text-gray-300">AQI Chart</div>
              <label className="text-sm ml-auto text-gray-300">Show trend</label>
              <input type="checkbox" checked={showAQIChart} onChange={() => setShowAQIChart(!showAQIChart)} className="scale-125" />
            </div>

            {showAQIChart && <Line data={aqiTrendData(aqiOrigin?.aqi, aqiDest?.aqi)} />}
          </div>
        )}

        {/* NEW CO₂ Chart (duplicated lower for layout continuity) */}
        {results && (
          <div className="bg-white/10 p-6 rounded-xl mb-6">
            <h2 className="text-2xl mb-3">Actual Route Comparison</h2>
            <Bar data={co2ChartData} />
          </div>
        )}

        {/* Map */}
        <h2 className="text-2xl font-semibold mb-3">Live Satellite Map (two routes + traffic)</h2>
        <div ref={mapRef} style={{ height: "480px", width: "100%" }} className="mb-10 rounded-2xl shadow-lg border border-white/20"></div>

        {/* Leaderboard Section (dynamic) */}
        <motion.div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <FaTrophy className="text-yellow-400" /> Top Eco Heroes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaderboard.length === 0 ? (
              <div className="text-gray-300">No leaderboard data yet.</div>
            ) : (
              leaderboard.map((entry, index) => (
                <div key={index} className="bg-purple-800/60 border border-purple-400/50 rounded-lg p-4 flex flex-col items-center hover:bg-purple-700/60 transition-all">
                  <span className="text-4xl mb-2">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`}</span>
                  <h3 className="text-lg font-semibold">{entry.user?.name || entry.name || "Unknown"}</h3>
                  <p className="text-sm text-gray-300">{Number(entry.ecoPoints || entry.points || 0).toFixed(2)} Eco Points</p>

                  {/* Badge - use backend badge if present, otherwise compute locally */}
                  <p className="text-sm mt-1 font-bold">{entry.badge || computeBadgeFromPoints(entry.ecoPoints || entry.points || 0)}</p>

                  <p className="text-xs text-gray-400">{Number(entry.totalCO2Saved || entry.total_co2_saved || 0).toFixed(3)} kg CO₂ saved</p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Extra section: Troubleshooting & developer notes (useful when testing locally) */}
        <div className="mt-8 p-6 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-300">
          <h4 className="font-semibold mb-2">Developer Notes</h4>
          <ul className="list-disc pl-5">
            <li>Make sure backend is running and has <code>/api/external/ors-route</code>, <code>/api/leaderboard/update</code> and <code>/api/aqi/city</code>.</li>
            <li>OpenWeather API key must be stored on backend as <code>OPENWEATHER_KEY</code> (server .env) and you must restart server after setting it.</li>
            <li>Frontend uses the local proxy helper <code>src/utils/fetchAQI_via_proxy.js</code> — call that instead of OpenWeather directly.</li>
            <li>If AQI returns null, try more specific place names like "Chandigarh,IN" or a well-known city name.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
