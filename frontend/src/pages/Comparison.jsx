import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bar, Radar, Line } from "react-chartjs-2";
import "chart.js/auto";
import { 
  FaTrophy, 
  FaLeaf, 
  FaChartBar, 
  FaUser, 
  FaWind, 
  FaMapMarkedAlt, 
  FaMapPin, 
  FaRoute, 
  FaSearch 
} from "react-icons/fa";
import { FiActivity } from "react-icons/fi";
import fetchAQIProxy from "../utils/fetchAQI_via_proxy";
import EcoPreferenceSelector from "../components/EcoPreferenceSelector";
import { getEcoPreferences } from "../utils/ecoPreferences";
import { nodeClient } from "../api/apiClient";
import LoadingOverlay from "../components/LoadingOverlay";

/* ===================== EMISSION FACTORS ===================== */
const EMISSION_FACTORS = {
  car: 0.21,
  motorcycle: 0.11,
  bus: 0.09,
  train: 0.04,
  bicycle: 0.0,
  walking: 0.0,
};

function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

const fetchRoutes = async (origin, destination, profile) => {
  try {
    const response = await nodeClient.post("/api/external/ors-route", {
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

const googleModeMap = {
  car: "DRIVING",
  bus: "TRANSIT",
  train: "TRANSIT",
  bicycle: "BICYCLING",
  walking: "WALKING",
};

const computeBadgeFromPoints = (points = 0) => {
  if (points >= 500) return "🦅 Earth Saver Legend";
  if (points >= 200) return "🌍 Green Guardian";
  if (points >= 50) return "🚲 Eco Rider";
  return "🌱 Beginner Eco Walker";
};

const aqiLabel = (v, cat) => {
  if (cat === "Good" || (v >= 0 && v <= 50)) return { label: "Good", color: "text-green-600", bg: "bg-green-50", tip: "Air quality is good. Enjoy outdoor activities." };
  if (cat === "Moderate" || (v > 50 && v <= 100)) return { label: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50", tip: "Moderate pollution — consider reducing prolonged outdoor exertion." };
  if (cat === "Unhealthy for Sensitive Groups" || (v > 100 && v <= 150)) return { label: "Fair / Unhealthy (Sensitive)", color: "text-orange-600", bg: "bg-orange-50", tip: "Sensitive individuals should be cautious." };
  if (cat === "Poor" || (v > 150 && v <= 200)) return { label: "Poor", color: "text-red-600", bg: "bg-red-50", tip: "Poor air quality — avoid heavy outdoor exercise." };
  if (cat === "Very Poor" || cat === "Hazardous" || v > 200) return { label: "Very Poor / Hazardous", color: "text-red-700", bg: "bg-red-100", tip: "Very poor air quality — stay indoors if possible." };
  return { label: "Unknown", color: "text-gray-400", bg: "bg-gray-50", tip: "Air quality data unavailable." };
};

function StatCard({ title, value, sub, icon }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="text-3xl text-green-600 bg-green-50 p-3 rounded-xl">{icon}</div>
        <div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{title}</div>
          <div className="text-xl font-extrabold text-[#0F172A]">{value}</div>
          {sub && <div className="text-xs font-bold text-green-600 mt-1">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function AQICard({ place, aqiData }) {
  if (!aqiData || aqiData.error) {
    return (
      <div className="p-8 rounded-2xl border border-red-100 bg-red-50 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-red-500 uppercase tracking-widest font-bold mb-1">{place}</div>
            <div className="text-2xl font-black text-red-900">AQI data unavailable</div>
            <div className="text-sm font-bold mt-1 text-red-600">Service unreachable</div>
          </div>
          <div className="text-5xl text-red-400">⚠️</div>
        </div>
        <div className="text-sm p-4 rounded-xl leading-relaxed font-medium mb-6 bg-white text-red-700 border border-red-100">
          <span className="font-black uppercase text-[10px] block mb-1">Status:</span> 
          {aqiData?.message || "Failed to load air quality index from server."}
        </div>
      </div>
    );
  }

  const numeric = aqiData?.aqi ?? null;
  const categoryStr = aqiData?.category ?? null;
  const components = aqiData?.components ?? null;
  const lbl = aqiLabel(numeric, categoryStr);

  return (
    <div className={`p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{aqiData?.city || place}</div>
          <div className="text-2xl font-black text-[#0F172A]">{numeric !== null ? `AQI ${numeric}` : "AQI N/A"}</div>
          <div className={`text-sm font-bold mt-1 ${lbl.color}`}>{categoryStr || lbl.label}</div>
        </div>
        <div className={`text-5xl ${lbl.color}`}>{numeric !== null ? (numeric <= 50 ? "😊" : numeric <= 150 ? "😐" : "😷") : "—"}</div>
      </div>

      {components && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
             <span className="text-gray-500 block text-[10px] font-black uppercase">PM2.5</span>
             <span className="font-extrabold text-[#0F172A]">{components.pm2_5 ?? "—"} µg/m³</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
             <span className="text-gray-500 block text-[10px] font-black uppercase">PM10</span>
             <span className="font-extrabold text-[#0F172A]">{components.pm10 ?? "—"} µg/m³</span>
          </div>
        </div>
      )}

      <div className={`text-sm p-4 rounded-xl leading-relaxed font-medium mb-6 ${lbl.bg} ${lbl.color} border border-green-100/50`}>
         <span className="font-black uppercase text-[10px] block mb-1">Health Insight:</span> {lbl.tip}
      </div>

      <button
        className="w-full py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm hover:bg-gray-100 transition-all font-bold text-[#475569]"
        onClick={() => {
          const summary = `${aqiData?.city || place} — ${numeric !== null ? `AQI ${numeric} (${categoryStr || lbl.label})` : "AQI N/A"}`;
          navigator.clipboard?.writeText(summary);
        }}
      >
        Copy Air Quality Data
      </button>
    </div>
  );
}

export default function Comparison() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [modeA, setModeA] = useState("car");
  const [modeB, setModeB] = useState("bus");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [username, setUsername] = useState(() => localStorage.getItem("ecoUserName") || "Riyush Kumar");
  const [ecoPrefs, setEcoPrefs] = useState(getEcoPreferences());
  const [showWakingMessage, setShowWakingMessage] = useState(false);
  const loadingTimerRef = useRef(null);

  const [aqiOrigin, setAqiOrigin] = useState(null);
  const [aqiDest, setAqiDest] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const [showAQIChart, setShowAQIChart] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await nodeClient.get("/api/leaderboard");
      setLeaderboard(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err.response?.data || err.message);
    }
  };

  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") return reject(new Error("No window"));
      if (window.google && window.google.maps) return resolve();
      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!key) return reject(new Error("VITE_GOOGLE_MAPS_API_KEY not set in .env"));

      if (document.querySelector('script[data-google-maps]')) {
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 200);
        return;
      }

      const script = document.createElement("script");
      script.setAttribute("data-google-maps", "true");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps script"));
      document.head.appendChild(script);
    });
  };

  const drawTwoRoutesOnMap = async (o, d, mA, mB) => {
    setMapError(null);
    try {
      await loadGoogleMaps();
    } catch (err) {
      setMapError(err.message);
      return;
    }

    if (!mapInstance.current && mapRef.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 28.6139, lng: 77.209 },
        mapTypeId: "roadmap", // roadmap for cleaner SaaS feel, can be hybrid too
        gestureHandling: "greedy",
        styles: [
          {
            "featureType": "poi",
            "stylers": [{ "visibility": "off" }]
          }
        ]
      });
    }

    const directionsService = new window.google.maps.DirectionsService();
    const rendererA = new window.google.maps.DirectionsRenderer({
      map: mapInstance.current,
      polylineOptions: { strokeColor: "#16A34A", strokeWeight: 6 },
    });
    const rendererB = new window.google.maps.DirectionsRenderer({
      map: mapInstance.current,
      polylineOptions: { strokeColor: "#EF4444", strokeWeight: 6 },
    });

    const toGoogleMode = (mode) => googleModeMap[mode] || "DRIVING";

    directionsService.route({ origin: o, destination: d, travelMode: toGoogleMode(mA) }, (res, status) => {
      if (status === "OK") rendererA.setDirections(res);
    });

    directionsService.route({ origin: o, destination: d, travelMode: toGoogleMode(mB) }, (res, status) => {
      if (status === "OK") rendererB.setDirections(res);
    });
  };

  async function compare() {
    if (!origin || !destination) return alert("Please enter both origin and destination.");
    setLoading(true);
    setResults(null);
    setShowWakingMessage(false);
    loadingTimerRef.current = setTimeout(() => setShowWakingMessage(true), 5000);

    try {
      const [respA, respB] = await Promise.all([
        fetchRoutes(origin, destination, modeA),
        fetchRoutes(origin, destination, modeB),
      ]);

      if (respA && respB) {
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

        // AQI
        const [aqi1, aqi2] = await Promise.all([fetchAQIProxy(origin), fetchAQIProxy(destination)]);
        setAqiOrigin(aqi1 || null);
        setAqiDest(aqi2 || null);

        // Leaderboard
        const userId = localStorage.getItem("userId");
        const co2_saved = Math.max(0, Math.abs(computed.a.co2_kg - computed.b.co2_kg));
        if (userId && co2_saved >= 0.01) {
          await nodeClient.post("/api/leaderboard/update", { userId, co2Saved: co2_saved });
          fetchLeaderboard();
        }

        await drawTwoRoutesOnMap(origin, destination, modeA, modeB);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setShowWakingMessage(false);
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    }
  }

  const transportData = {
    labels: ["Car", "Bus", "Bicycle", "Walking"],
    datasets: [{
      label: "CO₂ Emissions (kg) baseline",
      data: [42, 15, 0, 0],
      backgroundColor: ["#16A34A", "#22C55E", "#86EFAC", "#DCFCE7"],
      borderRadius: 10,
    }],
  };

  const co2ChartData = results ? {
    labels: [results.a.mode.toUpperCase(), results.b.mode.toUpperCase()],
    datasets: [{
      label: "CO₂ Emissions (kg)",
      data: [results.a.co2_kg, results.b.co2_kg],
      backgroundColor: ["#16A34A", "#EF4444"],
      borderRadius: 8,
    }],
  } : null;

  const aqiTrendData = (aqiO, aqiD) => {
    const makeSeries = (v) => v ? [v, v + 1, v, Math.max(1, v - 1), v + 1, v, v] : Array(7).fill(null);
    return {
      labels: ["-6d", "-5d", "-4d", "-3d", "-2d", "-1d", "Today"],
      datasets: [
        { label: "Origin AQI", data: makeSeries(aqiO), borderColor: "#16A34A", tension: 0.3 },
        { label: "Destination AQI", data: makeSeries(aqiD), borderColor: "#EF4444", tension: 0.3 },
      ],
    };
  };

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen text-[#0F172A] py-16">
      {loading && <LoadingOverlay message={showWakingMessage ? "Waking Servers..." : "Analyzing Routes..."} showWakingMessage={showWakingMessage} />}
      
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-[#0F172A]">
            Route & <span className="text-[#16A34A]">Eco Comparison</span>
          </h1>
          <p className="text-[#475569] text-xl font-medium max-w-2xl">
            Real-time insights for CO₂, AQI, traffic & predictive safety. Compare and choose the greenest path.
          </p>
        </div>

        <EcoPreferenceSelector onChange={setEcoPrefs} />

        {/* Comparison Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black mb-6 uppercase tracking-wider text-[#0F172A]">Journey Details</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Start Location</label>
                  <div className="relative">
                    <FaMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" />
                    <input 
                      value={origin} 
                      onChange={(e) => setOrigin(e.target.value)} 
                      placeholder="e.g. New York" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-100 focus:border-green-600 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Destination</label>
                  <div className="relative">
                    <FaRoute className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" />
                    <input 
                      value={destination} 
                      onChange={(e) => setDestination(e.target.value)} 
                      placeholder="e.g. Brooklyn" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-100 focus:border-green-600 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Mode A</label>
                    <select value={modeA} onChange={(e) => setModeA(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold focus:border-green-600 outline-none">
                      {Object.keys(EMISSION_FACTORS).map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Mode B</label>
                    <select value={modeB} onChange={(e) => setModeB(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold focus:border-green-600 outline-none">
                      {Object.keys(EMISSION_FACTORS).map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={compare} 
                  disabled={loading}
                  className="w-full py-5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-2xl font-black text-lg transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <FaSearch />}
                  {loading ? "Comparing..." : "Compare Routes"}
                </button>
              </div>
            </div>

            {/* Quick Stats Column under inputs */}
            <div className="grid grid-cols-1 gap-4">
              <StatCard title="Target Area" value={destination || "N/A"} sub="Predicted Safety: High" icon={<FiActivity className="p-0"/>} />
            </div>
          </div>

          {/* Right Panel: Results & Map */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Map Preview */}
            <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden h-[400px]">
              <div ref={mapRef} className="w-full h-full rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-400">
                {!results && <p className="font-bold flex items-center gap-2"><FaMapMarkedAlt /> Map Preview will appear here</p>}
              </div>
            </div>

            {/* Results Display */}
            {results && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* CO2 Comparison Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm col-span-1">
                    <p className="text-xs font-black text-gray-400 mb-2 uppercase">Analysis Result</p>
                    <h3 className="text-2xl font-black text-[#0F172A] mb-4">CO₂ Impact</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl">
                        <span className="font-bold text-gray-600">{modeA.toUpperCase()}</span>
                        <span className="font-black text-[#0F172A]">{results.a.co2_kg} kg</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl">
                        <span className="font-bold text-gray-600">{modeB.toUpperCase()}</span>
                        <span className="font-black text-[#0F172A]">{results.b.co2_kg} kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-8 rounded-3xl border border-green-100 shadow-sm col-span-1 md:col-span-2">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-xs font-black text-green-700 mb-2 uppercase">Eco Savings</p>
                        <h3 className="text-3xl font-black text-green-900">
                          {Math.abs(results.a.co2_kg - results.b.co2_kg).toFixed(3)} kg Saved
                        </h3>
                      </div>
                      <div className="p-4 bg-green-600 text-white rounded-2xl shadow-sm">
                        <FaLeaf className="w-8 h-8" />
                      </div>
                    </div>
                    <p className="text-green-800 font-medium text-lg leading-relaxed mb-6">
                      Savings detected on the greener route! That's equivalent to the CO₂ absorbed by <span className="font-black">{(Math.abs(results.a.co2_kg - results.b.co2_kg) * 0.1).toFixed(2)} trees</span> today.
                    </p>
                    <div className="w-full h-3 bg-green-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 transition-all duration-1000" style={{ width: '85%' }} />
                    </div>
                  </div>
                </div>

                {/* AQI Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AQICard place={origin} aqiData={aqiOrigin} />
                  <AQICard place={destination} aqiData={aqiDest} />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-3"><FaChartBar className="text-green-600" /> Emission Breakdown</h3>
                    <Bar data={co2ChartData} options={{ maintainAspectRatio: true }} />
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-3"><FaWind className="text-green-600" /> AQI Weekly Context</h3>
                    <Line data={aqiTrendData(aqiOrigin?.aqi, aqiDest?.aqi)} options={{ maintainAspectRatio: true }} />
                  </div>
                </div>

              </motion.div>
            )}

          </div>
        </div>

        {/* Global Impact & Leaderboard */}
        <section className="bg-white py-20 rounded-[3rem] border border-gray-100 shadow-sm px-8 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
               <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#0F172A]">Community <span className="text-[#16A34A]">Heroes</span></h2>
               <p className="text-[#475569] text-xl font-medium max-w-xl">Every kilogram of CO₂ saved contributes to our global leaderboard. Join the movement.</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 font-black">Total Trees</p>
                 <p className="text-3xl font-black text-[#16A34A]">1,248</p>
              </div>
              <div className="w-px h-12 bg-gray-100" />
              <div className="text-center">
                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 font-black">CO₂ Avoided</p>
                 <p className="text-3xl font-black text-[#0F172A]">4.8 Tons</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {leaderboard.slice(0, 4).map((entry, idx) => (
              <div key={idx} className="p-8 bg-gray-50 rounded-3xl border border-gray-100 text-center hover:scale-105 transition-all group">
                <div className="text-5xl mb-6">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🎖️"}</div>
                <h4 className="text-xl font-black text-[#0F172A] mb-2">{entry.name || entry.user?.name || "Eco Hero"}</h4>
                <p className="text-green-600 font-bold text-sm mb-4">{Number(entry.ecoPoints || entry.points || 0).toFixed(0)} Points</p>
                <div className="p-3 bg-white rounded-xl text-xs font-black text-gray-500 uppercase tracking-tighter border border-gray-100 group-hover:border-green-200 transition-colors">
                  {entry.badge || computeBadgeFromPoints(entry.ecoPoints || entry.points || 0)}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}


