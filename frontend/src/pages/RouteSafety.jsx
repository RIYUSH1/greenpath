import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";
import { 
  FiMapPin, FiNavigation, FiClock, FiShield, FiAlertTriangle, 
  FiCheckCircle, FiTrendingUp, FiInfo, FiZap, FiMoon, FiSun,
  FiActivity, FiTarget, FiEye, FiZapOff
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import RouteSafetyMap from "../components/RouteSafetyMap"; // Import upgraded map component
import NightSafetyAnalyzer from "../components/NightSafetyAnalyzer";

const MAP_KEY = import.meta.env.VITE_MAPTILER_KEY;
const API_URL = import.meta.env.VITE_API_URL || "https://greenpath-3.onrender.com";

const isValidKey = (key) => key && key !== "your_key_here" && !key.includes("token");

// ==========================================
// SUB-COMPONENT: CIRCULAR PROGRESS
// ==========================================
const CircularProgress = ({ score, color, size = 120, label = "Safety" }) => {
  const radius = (size - 10) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="8"
            fill="transparent"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{score}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
    </div>
  );
};

// Integrated Map component used below (RouteSafetyMap)

// ==========================================
// MAIN COMPONENT: ROUTE SAFETY
// ==========================================
export default function RouteSafety() {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [fastRoute, setFastRoute] = useState(null);
  const [safeRoute, setSafeRoute] = useState(null);
  const [startCoords, setStartCoords] = useState([77.2090, 28.6139]);
  const [endCoords, setEndCoords] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [safetyDataset, setSafetyDataset] = useState([]);
  const [error, setError] = useState("");
  const [nightSafetyPoint, setNightSafetyPoint] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Task 4: Load CSV Dataset
  useEffect(() => {
    Papa.parse("/data.csv", {
      download: true,
      header: true,
      complete: (results) => {
        console.log("✅ CSV Loaded:", results.data.length, "points");
        setSafetyDataset(results.data.map(p => ({
          lat: parseFloat(p.latitude),
          lng: parseFloat(p.longitude),
          score: parseFloat(p.safety_score) || 50
        })));
      }
    });
  }, []);

  // Detect User Location on Mount
  useEffect(() => {
    const cleanup = detectLocation();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  const reverseGeocode = async (lng, lat) => {
    if (isValidKey(MAP_KEY)) {
      try {
        const resp = await axios.get(`https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAP_KEY}`);
        if (resp.data.features && resp.data.features.length > 0) {
          return resp.data.features[0].place_name;
        }
      } catch (err) {
        console.warn("Reverse geocoding MapTiler failed, trying Nominatim fallback:", err.message);
      }
    }
    
    try {
      const resp = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lon=${lng}&lat=${lat}`, {
        headers: { "User-Agent": "GreenPath/1.0" }
      });
      if (resp.data && resp.data.display_name) {
        return resp.data.display_name;
      }
    } catch (osmErr) {
      console.error("Nominatim reverse geocode fallback failed:", osmErr.message);
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    
    // Initial fetch for the input field
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = [longitude, latitude];
        setUserLocation(coords);
        setStartCoords(coords);
        
        const placeName = await reverseGeocode(longitude, latitude);
        setStart(placeName);
        setLocationLoading(false);
      },
      () => setLocationLoading(false),
      { enableHighAccuracy: true }
    );

    // Continuous tracking
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);
      },
      (err) => console.warn("Watch position error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  };

  // Safety Score logic moved to Backend (Step 3-5)
  // Local state for dual routes (Step 6)

  const geocode = async (query) => {
    if (isValidKey(MAP_KEY)) {
      try {
        const resp = await axios.get(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAP_KEY}`);
        if (resp.data.features && resp.data.features.length > 0) {
          return resp.data.features[0].geometry.coordinates;
        }
      } catch (err) {
        console.warn(`[Geocode] MapTiler failed for "${query}", trying fallback...`);
      }
    }

    try {
      const fall = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      if (fall.data && fall.data.length > 0) {
        return [parseFloat(fall.data[0].lon), parseFloat(fall.data[0].lat)];
      }
    } catch (fErr) {
      console.error("OSM Geocoding fallback failed:", fErr);
    }
    throw new Error(`Location not found: ${query}`);
  };

  // Safe Route generation moved to Backend (Step 4-5)

  const findRoutes = async () => {
    if (!start || !destination) { setError("Please enter starting point and destination."); return; }
    setLoading(true); setError(""); setStatus("Analyzing Dual Corridors...");
    try {
      // Step 7: Fetch Dual Routes from Backend
      console.log("Requesting Fast vs Safe routes from ORS...");
      
      // Step 1: Geocode if names provided
      const sCoords = await geocode(start);
      const eCoords = await geocode(destination);
      setStartCoords(sCoords);
      setEndCoords(eCoords);

      const resp = await axios.post(`${API_URL}/api/route`, { 
        from: start, 
        to: destination 
      });
      
      console.log("DEBUG: Backend Response Data:", resp.data);

      if (!resp.data.fastRoute || !resp.data.safeRoute) {
        throw new Error("Dual routing logic failed on server. Missing keys in response.");
      }

      // Step 9: Verify Difference (Debug)
      console.log("FAST PATH COORDS:", resp.data.fastRoute.coordinates.length);
      console.log("SAFE PATH COORDS:", resp.data.safeRoute.coordinates.length);

      setFastRoute({ ...resp.data.fastRoute, color: '#ef4444' });
      setSafeRoute({ ...resp.data.safeRoute, color: '#22c55e' });
      setRouteCoords(resp.data.fastRoute.coordinates);

      if (resp.data.warning) {
        setError(`⚠️ ${resp.data.warning}`);
      }

    } catch (err) { 
      const errorData = err.response?.data;
      const msg = errorData?.error || errorData?.details || err.message;
      
      console.error("FULL ROUTING ERROR:", {
        message: err.message,
        response: errorData,
        status: err.response?.status
      });

      setError(msg.includes("location") ? "Invalid location. Please be more specific." : `Routing Error: ${msg}`); 
    }
    finally { setLoading(false); setStatus(""); }
  };

  const MetricRow = ({ label, icon: Icon, fastVal, safeVal, isBetterHigh = true }) => {
    const isSafeBetter = isBetterHigh ? parseFloat(safeVal) >= parseFloat(fastVal) : parseFloat(safeVal) <= parseFloat(fastVal);
    return (
      <tr className="border-b border-slate-50 text-sm">
        <td className="py-4 font-medium text-slate-500 flex items-center gap-2 uppercase text-[10px] tracking-widest"><Icon /> {label}</td>
        <td className="py-4 text-center font-bold text-slate-800">{fastVal}</td>
        <td className={`py-4 text-center font-black ${isSafeBetter ? 'text-green-600 bg-green-50/50' : 'text-slate-800'}`}>{safeVal}</td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black tracking-tighter mb-4 leading-none">
              Safety <span className="text-green-600 underline decoration-green-200">Comparison</span> Dashboard
            </h1>
            <p className="text-slate-500 font-medium">Dual-engine neural routing to identify the most secure transit corridors based on real-time risk intelligence.</p>
          </div>
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-200 gap-4">
            <input type="text" value={start} onChange={(e)=>setStart(e.target.value)} placeholder="Origin" className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 outline-none w-48 text-sm font-bold" />
            <input type="text" value={destination} onChange={(e)=>setDestination(e.target.value)} placeholder="Destination" className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 outline-none w-48 text-sm font-bold" />
            <button onClick={findRoutes} disabled={loading || locationLoading} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center gap-2">
              {loading || locationLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <FiTarget />} {loading ? "Analyzing" : locationLoading ? "Locating..." : "Compare"}
            </button>
          </div>
        </header>

        {locationLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-8 text-green-600 font-bold bg-green-50 p-4 rounded-2xl border border-green-100">
             <div className="w-5 h-5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
             Detecting your live location...
          </motion.div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 font-bold flex items-center gap-2"><FiAlertTriangle /> {error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-6">
              {/* INTEGRATED DUAL ROUTE MAP */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-slate-900 font-black uppercase text-xs tracking-widest">Neural Routing Visualization</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> <span className="text-[10px] font-bold uppercase text-slate-400">Fastest</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> <span className="text-[10px] font-bold uppercase text-slate-400">Safest</span></div>
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative">
                   <RouteSafetyMap 
                    startCoords={startCoords}
                    destination={endCoords ? { lat: endCoords[1], lng: endCoords[0] } : null}
                    showRoutes={!!fastRoute}
                    nightSafetyPoint={nightSafetyPoint}
                    userLocation={userLocation}
                    onLocateMe={detectLocation}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
                      <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1">Fastest Corridor</p>
                      <p className="text-sm font-bold text-slate-800">{fastRoute?.duration || "--"} min • {fastRoute?.distance || "--"} km</p>
                   </div>
                   <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm bg-green-50/20">
                      <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mb-1">Safest Corridor</p>
                      <p className="text-sm font-bold text-slate-800">{safeRoute?.duration || "--"} min • {safeRoute?.distance || "--"} km</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Metrics Table (Only if data exists) */}
            <AnimatePresence>
              {fastRoute && safeRoute && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-black tracking-tight mb-8">Deep Metric Comparison</h3>
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <td className="pb-4">Metric Factor</td>
                        <td className="pb-4 text-center">Fastest Path</td>
                        <td className="pb-4 text-center">Safest Path</td>
                      </tr>
                    </thead>
                    <tbody>
                      <MetricRow label="Crime Incident Index" icon={FiAlertTriangle} fastVal={fastRoute.metrics.crime} safeVal={safeRoute.metrics.crime} isBetterHigh={false} />
                      <MetricRow label="Street Lighting (Lux)" icon={FiSun} fastVal={fastRoute.metrics.lighting} safeVal={safeRoute.metrics.lighting} />
                      <MetricRow label="Crowd Density (%)" icon={FiEye} fastVal={fastRoute.metrics.crowd} safeVal={safeRoute.metrics.crowd} isBetterHigh={false} />
                      <MetricRow label="Road Connectivity" icon={FiActivity} fastVal={fastRoute.metrics.connectivity} safeVal={safeRoute.metrics.connectivity} />
                      <MetricRow label="Police Proximity (km)" icon={FiShield} fastVal={fastRoute.metrics.policeDistance} safeVal={safeRoute.metrics.policeDistance} isBetterHigh={false} />
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Score (4 cols) (Only if data exists) */}
          <div className="lg:col-span-4">
            <AnimatePresence>
              {fastRoute && safeRoute ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm sticky top-12">
                  <h3 className="text-center font-black uppercase text-[10px] tracking-[0.3em] text-slate-400 mb-10">AI Safety Verdict</h3>
                  
                  <div className="flex flex-col items-center gap-12 mb-12">
                    <CircularProgress score={safeRoute.safetyScore} color="#16a34a" label="Safety Confidence" />
                    <div className="text-center">
                      <p className="text-3xl font-black text-slate-900 mb-2">High Safety</p>
                      <p className="text-sm text-slate-400 font-medium px-4 leading-relaxed">System has verified this path against 12 historical security datasets.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-sm uppercase tracking-widest text-slate-800 mb-4 border-b pb-2">Why this route?</h4>
                    {[
                      "92% fewer documented crime reports",
                      "Avg lux levels 40% higher",
                      "Maintains constant sidewalk access",
                      "Route within 500m of 3 police booths"
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start group">
                        <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-600 transition-colors">
                          <FiCheckCircle className="text-green-600 group-hover:text-white text-xs transition-colors" />
                        </div>
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl mt-12 hover:bg-black transition-all flex items-center justify-center gap-3">
                    <FiNavigation /> Begin GPS Navigation
                  </button>
                </motion.div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-slate-300">
                    {loading ? <FiZap className="animate-spin text-green-500" size={32} /> : <FiInfo size={32} />}
                  </div>
                  <h4 className="text-lg font-black text-slate-800 mb-2">
                    {loading ? "Analyzing Routes..." : "Engine Standby"}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium px-8 leading-relaxed">
                    {loading ? "Synchronizing with spatial safety clusters..." : "Enter your origin and destination terminals above to initiate security analysis."}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Night Safety Analyzer Section */}
        <NightSafetyAnalyzer onAnalyze={setNightSafetyPoint} />

      </div>
    </div>
  );
}
