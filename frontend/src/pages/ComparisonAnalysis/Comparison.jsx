
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bar, Radar, Line } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";
import { FaTrophy, FaLeaf, FaChartBar, FaUser, FaWind, FaMapMarkedAlt, FaLeaf as LeafIcon } from "react-icons/fa";
import fetchAQIProxy from "../../utils/fetchAQI_via_proxy";
import EcoPreferenceSelector from "../../components/EcoPreferenceSelector";
import { getEcoPreferences } from "../../utils/ecoPreferences";
import RouteMap from "../../components/RouteMap";
import { API_BASE_URL } from "../../api/config";




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
    const response = await axios.post(`${API_BASE_URL}/api/external/ors-route`, {
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
/**
 * StatCard — small reusable card to show a stat
 */
function StatCard({ title, value, sub, icon }) {
  return (
    <div className="p-4 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_15px_35px_rgba(0,0,0,0.35)] transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className="text-3xl text-gray-300 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-300 group-hover:scale-110">{icon}</div>
        <div>
          <div className="text-sm text-gray-400 font-medium group-hover:text-gray-200 transition-colors uppercase tracking-wide">{title}</div>
          <div className="text-xl font-bold text-white tracking-tight">{value}</div>
          {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function AQICard({ place, aqiData /* { aqi, components, lat, lon } */ }) {
  const numeric = aqiData?.aqi ?? null;
  const components = aqiData?.components ?? null;
  const lbl = aqiLabel(numeric);

  return (
    <div className={`p-6 rounded-xl border ${lbl.bg} border-white/10 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-300 uppercase tracking-wide font-medium">{place}</div>
          <div className="text-2xl font-bold mt-1 text-white">{numeric ? `AQI ${numeric} — ${lbl.label}` : "AQI — N/A"}</div>
        </div>
        <div className={`text-4xl drop-shadow-lg ${lbl.color}`}>{numeric ? (numeric <= 2 ? "😊" : numeric === 3 ? "😐" : "😷") : "—"}</div>
      </div>

      <div className="w-full h-px bg-white/10 my-4"></div>

      {components ? (
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="bg-black/20 p-2 rounded-lg">
             <span className="text-gray-400 block text-xs">PM2.5</span>
             <span className="font-medium text-white">{components.pm2_5 ?? "—"} µg/m³</span>
          </div>
          <div className="bg-black/20 p-2 rounded-lg">
             <span className="text-gray-400 block text-xs">PM10</span>
             <span className="font-medium text-white">{components.pm10 ?? "—"} µg/m³</span>
          </div>
          <div className="bg-black/20 p-2 rounded-lg">
             <span className="text-gray-400 block text-xs">NO₂</span>
             <span className="font-medium text-white">{components.no2 ?? "—"} µg/m³</span>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400 mb-4 bg-black/20 p-3 rounded-lg flex items-center justify-center">Components data unavailable</div>
      )}

      <div className="text-sm text-gray-200 mb-4 bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed">
         <span className="font-semibold text-white">Insight:</span> {lbl.tip}
      </div>

      <div>
        <button
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 font-medium"
          onClick={() => {
            const summary = `${place} — ${numeric ? `AQI ${numeric} (${lbl.label})` : "AQI N/A"}`;
            navigator.clipboard?.writeText(summary);
          }}
        >
          Copy Air Quality Data
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
  const [ecoPrefs, setEcoPrefs] = useState(getEcoPreferences());


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
      const res = await axios.get(`${API_BASE_URL}/api/leaderboard`);
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
          await axios.post(`${API_BASE_URL}/api/leaderboard/update`, {
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
    <div 
      className="min-h-screen text-white p-6 md:p-10 relative overflow-hidden font-sans"
      style={{
        background: 'linear-gradient(135deg, #0f172a, #111827, #1e293b, #020617)',
      }}
    >
      {/* Subtle radial highlight */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(56,189,248,0.15), transparent 70%)' }}></div>

      <motion.div className="max-w-7xl mx-auto relative z-10" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="group cursor-pointer">
            <h1 className="text-4xl md:text-5xl font-extrabold flex items-center gap-4 tracking-tight relative">
              <FaChartBar className="text-cyan-400 group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" /> 
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-sky-400 text-transparent bg-clip-text relative inline-block">
                Route & Eco Comparison
                <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-500 rounded-full"></span>
              </span>
            </h1>
            <p className="text-gray-400/80 mt-4 text-lg font-light">Compare two routes, see CO₂, live satellite + traffic, and AQI seamlessly.</p>
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
        <EcoPreferenceSelector onChange={setEcoPrefs} />


        {/* Input Section */}
        <div 
          className="p-8 rounded-[18px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] mb-10 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative group/input">
              <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Origin (city or place)" className="w-full p-4 rounded-xl bg-[#0f172a]/50 border border-white/5 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-300" />
            </div>
            <div className="relative group/input">
              <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination (city or place)" className="w-full p-4 rounded-xl bg-[#0f172a]/50 border border-white/5 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none text-white placeholder-gray-500 transition-all duration-300" />
            </div>
            <select value={modeA} onChange={(e) => setModeA(e.target.value)} className="w-full p-4 rounded-xl bg-[#0f172a]/50 border border-white/5 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 focus:outline-none text-white transition-all duration-300 appearance-none">
              <option value="car">Car</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="bicycle">Bicycle</option>
              <option value="walking">Walking</option>
            </select>
            <select value={modeB} onChange={(e) => setModeB(e.target.value)} className="w-full p-4 rounded-xl bg-[#0f172a]/50 border border-white/5 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 focus:outline-none text-white transition-all duration-300 appearance-none">
              <option value="car">Car</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="bicycle">Bicycle</option>
              <option value="walking">Walking</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              disabled={loading} 
              onClick={compare} 
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? "Comparing Routes..." : "Compare Routes"}
            </button>
            <button
              onClick={() => {
                const o = origin;
                setOrigin(destination);
                setDestination(o);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 font-medium"
            >
              Swap Points
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <motion.div 
            className="group p-6 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] bg-white/5 backdrop-blur-xl border border-white/10 relative overflow-hidden"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 10px 40px rgba(0,0,0,0.4)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 tracking-wide text-white">
              <FaLeaf className="text-cyan-400 group-hover:animate-pulse" /> Transport Emission Baseline
            </h2>
            <div className="relative z-10 opacity-90 group-hover:opacity-100 transition-opacity">
              <Bar data={transportData} options={{ maintainAspectRatio: true, responsive: true }}/>
            </div>
          </motion.div>

          <motion.div 
            className="group p-6 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] bg-white/5 backdrop-blur-xl border border-white/10 relative overflow-hidden"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 10px 40px rgba(0,0,0,0.4)' }}
          >
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 tracking-wide text-white">
              <FaChartBar className="text-purple-400 group-hover:rotate-6 transition-transform" /> CO₂ Selected Routes
            </h2>
            <div className="relative z-10 opacity-90 group-hover:opacity-100 transition-opacity">
              {co2ChartData ? <Bar data={co2ChartData} /> : <div className="text-gray-500 italic h-[200px] flex items-center justify-center border border-dashed border-gray-600/50 rounded-xl">Run comparison to see data</div>}
            </div>
          </motion.div>

          <motion.div 
            className="group p-6 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] bg-white/5 backdrop-blur-xl border border-white/10 relative overflow-hidden"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 10px 40px rgba(0,0,0,0.4)' }}
          >
             <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 tracking-wide text-white">
              <FaUser className="text-sky-400 group-hover:scale-110 transition-transform" /> You vs Community
            </h2>
            <div className="relative z-10 opacity-90 group-hover:opacity-100 transition-opacity">
              <Radar data={radarData} />
            </div>
          </motion.div>
        </div>

        {/* Results Section */}
        {results && (
          <div 
             className="bg-white/5 p-8 rounded-2xl shadow-xl mb-12 border border-white/10 relative overflow-hidden group/results"
             style={{ backdropFilter: 'blur(16px)' }}
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none opacity-50 group-hover/results:opacity-100 transition-opacity duration-700" />
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white tracking-wide">
               <FaWind className="text-cyan-400" /> CO₂ Comparison & Savings
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mb-8 relative z-10">
              <div className="p-6 bg-[#0f172a]/80 backdrop-blur-md rounded-xl border border-white/5 hover:border-cyan-500/30 hover:shadow-[0_10px_30px_rgba(34,211,238,0.15)] transition-all duration-300 transform hover:-translate-y-1">
                <strong className="block text-xl text-cyan-400 mb-4">{results.a.mode.toUpperCase()}</strong>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between"><span>Distance:</span> <span className="font-medium text-white">{results.a.distance_km} km</span></div>
                  <div className="flex justify-between"><span>Time:</span> <span className="font-medium text-white">{formatDuration(results.a.duration_min * 60)}</span></div>
                  <div className="flex justify-between"><span>CO₂:</span> <span className="font-medium text-white">{results.a.co2_kg} kg</span></div>
                </div>
              </div>

              <div className="p-6 bg-[#0f172a]/80 backdrop-blur-md rounded-xl border border-white/5 hover:border-purple-500/30 hover:shadow-[0_10px_30px_rgba(168,85,247,0.15)] transition-all duration-300 transform hover:-translate-y-1">
                <strong className="block text-xl text-purple-400 mb-4">{results.b.mode.toUpperCase()}</strong>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between"><span>Distance:</span> <span className="font-medium text-white">{results.b.distance_km} km</span></div>
                  <div className="flex justify-between"><span>Time:</span> <span className="font-medium text-white">{formatDuration(results.b.duration_min * 60)}</span></div>
                  <div className="flex justify-between"><span>CO₂:</span> <span className="font-medium text-white">{results.b.co2_kg} kg</span></div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-md rounded-xl border border-green-500/20 hover:border-emerald-500/50 hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)] transition-all duration-300 transform hover:-translate-y-1">
                <strong className="block text-xl text-emerald-400 mb-4 flex items-center gap-2"><FaTrophy /> Summary</strong>
                <div className="space-y-3 text-gray-200">
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                     <span>Greenest:</span> 
                     <span className="font-bold text-emerald-300 px-3 py-1 bg-emerald-500/20 rounded-md">
                        {results.a.co2_kg < results.b.co2_kg ? results.a.mode.toUpperCase() : results.b.mode.toUpperCase()}
                     </span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                     <span>Fastest:</span> 
                     <span className="font-bold text-blue-300 px-3 py-1 bg-blue-500/20 rounded-md">
                        {results.a.duration_min < results.b.duration_min ? results.a.mode.toUpperCase() : results.b.mode.toUpperCase()}
                     </span>
                  </div>
                </div>
              </div>
            </div>

            {/* quick action: copy or create offset suggestion */}
            <div className="flex items-center gap-4 relative z-10">
              <button
                onClick={() => {
                  const text = `Comparing ${origin} → ${destination}: ${results.a.mode.toUpperCase()} ${results.a.co2_kg}kg vs ${results.b.mode.toUpperCase()} ${results.b.co2_kg}kg CO₂`;
                  navigator.clipboard?.writeText(text);
                }}
                className="px-6 py-2.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 font-medium hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:-translate-y-0.5"
              >
                Copy Summary
              </button>

              <button
                onClick={() => {
                  // generate a human-friendly offset suggestion
                  const green = results.a.co2_kg < results.b.co2_kg ? results.a : results.b;
                  const other = results.a.co2_kg < results.b.co2_kg ? results.b : results.a;
                  const saved = (other.co2_kg - green.co2_kg).toFixed(3);
                  alert(`If you choose ${green.mode.toUpperCase()} you save ~${saved} kg CO₂ for this trip. Consider planting a tree or donating to a verified carbon offset program.`);
                }}
                className="px-6 py-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 flex items-center gap-2"
              >
                <FaLeaf /> Offset Suggestion
              </button>
            </div>
          </div>
        )}

        {/* AQI Section (added) */}
        {(aqiOrigin !== null || aqiDest !== null) && (
          <div 
             className="bg-white/5 p-8 rounded-2xl shadow-xl mb-12 border border-white/10"
             style={{ backdropFilter: 'blur(16px)' }}
          >
            <h3 className="text-2xl font-bold mb-6 text-white tracking-wide">Air Quality (AQI) Context</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="hover:-translate-y-1 transition-transform duration-300">
                 <AQICard place={origin || "Origin"} aqiData={aqiOrigin} />
              </div>
              <div className="hover:-translate-y-1 transition-transform duration-300">
                 <AQICard place={destination || "Destination"} aqiData={aqiDest} />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/5 inline-flex w-full md:w-auto">
              <div className="text-sm text-gray-300 font-medium">Historical AQI Chart</div>
              <label className="text-sm ml-auto text-gray-300 flex items-center gap-2 cursor-pointer">
                 Show trend
                 <input type="checkbox" checked={showAQIChart} onChange={() => setShowAQIChart(!showAQIChart)} className="w-4 h-4 rounded border-gray-600 focus:ring-cyan-500 focus:ring-2 cursor-pointer" />
              </label>
            </div>

            {showAQIChart && (
               <div className="bg-[#0f172a]/50 p-6 rounded-xl border border-white/5">
                  <Line data={aqiTrendData(aqiOrigin?.aqi, aqiDest?.aqi)} options={{ maintainAspectRatio: false }} height={250}/>
               </div>
            )}
          </div>
        )}

        {/* NEW CO₂ Chart (duplicated lower for layout continuity) */}
        {results && (
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl mb-12 border border-white/10 shadow-xl group hover:-translate-y-1 hover:border-white/20 transition-all duration-300">
            <h2 className="text-2xl font-bold mb-6 text-white tracking-wide flex items-center gap-2">
               <FaChartBar className="text-sky-400 group-hover:rotate-12 transition-transform" /> Detailed CO₂ Baseline
            </h2>
            <div className="bg-[#0f172a]/50 p-6 rounded-xl border border-white/5">
               <Bar data={co2ChartData} options={{ maintainAspectRatio: false }} height={300} />
            </div>
          </div>
        )}

        {/* Map */}
        <h2 className="text-2xl font-bold mb-6 text-white tracking-wide flex items-center gap-3">
           <FaMapMarkedAlt className="text-cyan-400" /> Live Hybrid Routing Base
        </h2>
        <div 
          ref={mapRef} 
          style={{ height: "550px", width: "100%" }} 
          className="mb-12 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden ring-1 ring-white/10 hover:ring-cyan-500/50 transition-all duration-500 bg-[#0f172a]/80 flex items-center justify-center"
        >
           {/* Loader if map is empty - purely visual fallback until google loads */}
           {!mapInstance.current && !results && <div className="text-gray-500 animate-pulse">Awaiting Route Data...</div>}
        </div>

        {/* Leaderboard Section (dynamic) */}
        <motion.div 
          className="bg-white/5 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden group/board hover:border-yellow-500/30 transition-all duration-500"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl group-hover/board:bg-yellow-500/20 transition-colors duration-700 pointer-events-none"></div>
          
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 tracking-wide text-white relative z-10">
            <FaTrophy className="text-yellow-400 group-hover/board:rotate-12 group-hover/board:scale-110 transition-all duration-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" /> Top Community Eco Heroes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 mx-auto lg:grid-cols-3 gap-6 relative z-10">
            {leaderboard.length === 0 ? (
              <div className="text-gray-400 col-span-full text-center py-10 bg-[#0f172a]/50 rounded-xl border border-white/5">No leaderboard data found. Complete a greener journey to place first!</div>
            ) : (
              leaderboard.map((entry, index) => (
                <div 
                  key={index} 
                  className="bg-[#0f172a]/60 backdrop-blur-md border border-white/5 rounded-xl p-6 flex flex-col items-center hover:bg-[#1e293b]/80 hover:-translate-y-2 hover:border-yellow-500/30 hover:shadow-[0_15px_30px_rgba(234,179,8,0.15)] transition-all duration-300"
                >
                  <span className="text-5xl mb-4 drop-shadow-md">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`}</span>
                  <h3 className="text-xl font-bold text-white mb-1">{entry.user?.name || entry.name || "Unknown Hero"}</h3>
                  <p className="text-sm text-yellow-500 font-semibold uppercase tracking-wider mb-3">{Number(entry.ecoPoints || entry.points || 0).toFixed(2)} Points</p>

                  <div className="w-full h-px bg-white/10 my-2"></div>

                  <p className="text-sm mt-2 font-bold text-gray-200">{entry.badge || computeBadgeFromPoints(entry.ecoPoints || entry.points || 0)}</p>
                  <p className="text-xs text-gray-400 mt-1">{Number(entry.totalCO2Saved || entry.total_co2_saved || 0).toFixed(3)} kg CO₂ avoided</p>
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