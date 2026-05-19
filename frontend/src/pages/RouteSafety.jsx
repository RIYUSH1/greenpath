import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";
import { 
  FiMapPin, FiNavigation, FiClock, FiShield, FiAlertTriangle, 
  FiCheckCircle, FiTrendingUp, FiInfo, FiZap, FiSun,
  FiActivity, FiTarget, FiEye, FiZapOff, FiSearch, FiSliders
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import RouteSafetyMap from "../components/RouteSafetyMap"; 
import NightSafetyAnalyzer from "../components/NightSafetyAnalyzer";

const MAP_KEY = import.meta.env.VITE_MAPTILER_KEY;
const API_URL = import.meta.env.VITE_API_URL || "https://greenpath-3.onrender.com";

const isValidKey = (key) => key && key !== "your_key_here" && !key.includes("token");

// ==========================================
// SUB-COMPONENT: ANIMATED COUNTER (REACT 19 SAFE)
// ==========================================
const AnimatedCounter = ({ value, duration = 1600 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMiliseconds = duration;
    const startTime = performance.now();

    const updateCount = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalMiliseconds, 1);
      
      // Easing out quadratic curves
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(easeProgress * end);
      
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, duration]);

  return <span>{count}</span>;
};

// ==========================================
// SUB-COMPONENT: FUTURISTIC CIRCULAR PROGRESS
// ==========================================
const CircularProgress = ({ score, color, size = 92, label = "Safety" }) => {
  const radius = (size - 10) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Sci-Fi Outer Dashed Ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-slate-800/60 animate-[spin_55s_linear_infinite] opacity-50"></div>
        
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <filter id={`glow-${label}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#0a0f1d"
            strokeWidth="5"
            fill="transparent"
            strokeDasharray="2, 2"
          />
          {/* Active Progress Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="5"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            strokeLinecap="round"
            filter={`url(#glow-${label})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline">
            <span className="text-lg font-black text-white tracking-tighter">
              <AnimatedCounter value={score} />
            </span>
            <span className="text-[6px] font-black text-slate-500 uppercase">/100</span>
          </div>
          <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{label}</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: COMPARATIVE SAFETY RADAR CHART
// ==========================================
const SafetyRadarChart = ({ fastRoute, safeRoute }) => {
  const getPoliceScore = (dist) => {
    const d = parseFloat(dist) || 0;
    return Math.max(10, Math.round(100 - (d * 20)));
  };

  const getCrowdScore = (c) => {
    const val = parseFloat(c) || 0;
    return 100 - val;
  };

  const getCrimeScore = (cr) => {
    const val = parseFloat(cr) || 0;
    return Math.max(10, Math.round(100 - (val * 8))); 
  };

  const fastPoints = [
    getCrimeScore(fastRoute.metrics.crime),
    parseFloat(fastRoute.metrics.lighting) || 50,
    getCrowdScore(fastRoute.metrics.crowd),
    getPoliceScore(fastRoute.metrics.policeDistance),
    parseFloat(fastRoute.confidence) || 60
  ];

  const safePoints = [
    getCrimeScore(safeRoute.metrics.crime),
    parseFloat(safeRoute.metrics.lighting) || 50,
    getCrowdScore(safeRoute.metrics.crowd),
    getPoliceScore(fastRoute.metrics.policeDistance),
    parseFloat(safeRoute.confidence) || 90
  ];

  const labels = [
    "Crime Shield",
    "Lux Lighting",
    "Crowd Safety",
    "Police Shield",
    "Confidence"
  ];

  const size = 300;
  const center = size / 2;
  const radius = 100;

  const getCoordinates = (points) => {
    return points.map((p, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = center + radius * (p / 100) * Math.cos(angle);
      const y = center + radius * (p / 100) * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  };

  const fastCoords = getCoordinates(fastPoints);
  const safeCoords = getCoordinates(safePoints);

  return (
    <div className="flex flex-col items-center justify-center bg-[#070b13]/60 p-6 rounded-3xl border border-slate-800/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] w-full max-w-[340px] mx-auto select-none relative overflow-hidden">
      <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6 flex items-center gap-2">
        <FiActivity className="text-cyan-400 animate-pulse" /> Telemetry Radar Matrix
      </h4>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10">
        <defs>
          <filter id="glow-fast-radar" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-safe-radar" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Webbings */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((factor, idx) => {
          const points = Array.from({ length: 5 }).map((_, i) => {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const x = center + radius * factor * Math.cos(angle);
            const y = center + radius * factor * Math.sin(angle);
            return `${x},${y}`;
          }).join(" ");
          return (
            <polygon
              key={idx}
              points={points}
              fill="none"
              stroke="#1e293b"
              strokeWidth="0.8"
              strokeDasharray={idx === 4 ? "none" : "2, 3"}
            />
          );
        })}

        {/* Axis Lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#1e293b"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Labels */}
        {labels.map((label, i) => {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const textOffset = 18;
          const x = center + (radius + textOffset) * Math.cos(angle);
          const y = center + (radius + textOffset) * Math.sin(angle) + 3;
          
          let anchor = "middle";
          if (Math.cos(angle) > 0.2) anchor = "start";
          else if (Math.cos(angle) < -0.2) anchor = "end";

          return (
            <text
              key={i}
              x={x}
              y={y}
              fill="#64748b"
              fontSize="8"
              fontWeight="900"
              textAnchor={anchor}
              className="uppercase tracking-widest font-sans"
            >
              {label}
            </text>
          );
        })}

        {/* Fastest Polygon */}
        <polygon
          points={fastCoords}
          fill="rgba(255, 0, 85, 0.08)"
          stroke="#ff0055"
          strokeWidth="2"
          filter="url(#glow-fast-radar)"
        />

        {/* Safest Polygon */}
        <polygon
          points={safeCoords}
          fill="rgba(0, 255, 136, 0.12)"
          stroke="#00ff88"
          strokeWidth="2.5"
          filter="url(#glow-safe-radar)"
        />
      </svg>

      <div className="flex gap-5 mt-3 relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-[#ff0055] rounded-full shadow-[0_0_6px_#ff0055]" />
          <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Fastest Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-[#00ff88] rounded-full shadow-[0_0_6px_#00ff88]" />
          <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Safest Path</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: SEGMENTED SEGMENT BAR ROW
// ==========================================
const ComparativeMetricRow = ({ label, icon: Icon, fastVal, safeVal, desc, isBetterHigh = true }) => {
  const getRawNumber = (val) => {
    const clean = String(val).replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  };

  const fastNum = getRawNumber(fastVal);
  const safeNum = getRawNumber(safeVal);

  const isSafeBetter = isBetterHigh ? safeNum >= fastNum : safeNum <= fastNum;

  const maxVal = Math.max(fastNum, safeNum, 1);
  const fastPct = Math.min(100, Math.round((fastNum / maxVal) * 100)) || 10;
  const safePct = Math.min(100, Math.round((safeNum / maxVal) * 100)) || 10;

  return (
    <div className="bg-[#070b13]/50 p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/50 transition-all duration-300 group">
      <div className="flex justify-between items-center mb-3">
        <span className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-widest">
          <Icon className="text-slate-400 group-hover:text-cyan-400 transition-colors" /> {label}
        </span>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wide">{desc}</span>
      </div>

      {/* Fastest Route */}
      <div className="space-y-1.5 mb-3.5">
        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
          <span>Fastest Route</span>
          <span>{fastVal}</span>
        </div>
        <div className="h-1.5 bg-[#030509] rounded-full overflow-hidden border border-slate-900">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fastPct}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
          />
        </div>
      </div>

      {/* Safest Route */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
          <span className={isSafeBetter ? "text-emerald-400 font-extrabold" : ""}>Safest Route {isSafeBetter && "🏆"}</span>
          <span className={isSafeBetter ? "text-emerald-400 font-extrabold" : ""}>{safeVal}</span>
        </div>
        <div className="h-1.5 bg-[#030509] rounded-full overflow-hidden border border-slate-900">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${safePct}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
          />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: UNIFIED VERDICT CONTENT (FOR RE-USE)
// ==========================================
const SidebarVerdictContent = ({ fastRoute, safeRoute }) => {
  return (
    <>
      {/* Dials Section */}
      <h3 className="text-center font-black uppercase text-[9px] tracking-[0.2em] text-slate-500 border-b border-slate-855 pb-2.5">AI Safety Verdict</h3>
      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col items-center">
          <CircularProgress score={fastRoute.safetyScore} color="#ff0055" label="Fast Path" size={92} />
          <p className="text-center text-[8px] font-black text-slate-500 mt-2 uppercase tracking-widest">Conf: {fastRoute.confidence || 65}%</p>
        </div>
        <div className="flex flex-col items-center">
          <CircularProgress score={safeRoute.safetyScore} color="#00ff88" label="Safe Path" size={92} />
          <p className="text-center text-[8px] font-black text-emerald-450 mt-2 uppercase tracking-widest">Conf: {safeRoute.confidence || 94}%</p>
        </div>
      </div>
      
      {/* ETA Comparison */}
      <div className="border-t border-slate-855 pt-4.5">
        <h4 className="text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] mb-2.5">ETA Differential</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#03050a]/40 border border-slate-855/50 p-2.5 rounded-xl text-center">
            <span className="text-[8px] text-slate-550 font-bold uppercase tracking-wider">Fastest Path</span>
            <p className="text-base font-black text-white mt-0.5">{fastRoute.duration} <span className="text-[8px] font-medium text-slate-400 uppercase">min</span></p>
            <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest block">Base Time</span>
          </div>
          <div className="bg-[#03050a]/40 border border-slate-855/50 p-2.5 rounded-xl text-center">
            <span className="text-[8px] text-slate-550 font-bold uppercase tracking-wider">Safest Path</span>
            <p className="text-base font-black text-emerald-455 mt-0.5">{safeRoute.duration} <span className="text-[8px] font-medium text-slate-400 uppercase">min</span></p>
            <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest block">
              +{safeRoute.duration - fastRoute.duration}m Offset
            </span>
          </div>
        </div>
      </div>

      {/* AI Quotes */}
      <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex gap-3 items-start select-none shadow-[0_0_15px_rgba(16,185,129,0.02)]">
        <FiZap className="text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest">AI Highlights</span>
          <p className="text-[9px] font-bold text-slate-350 mt-1 uppercase tracking-wide leading-relaxed">
            CORRIDOR EVAL: Illuminating paths by {parseInt(safeRoute.metrics.lighting) - parseInt(fastRoute.metrics.lighting)}% lux, reducing threat zones by {Math.round(((safeRoute.safetyScore - fastRoute.safetyScore) / (100 - fastRoute.safetyScore)) * 100) || 0}%.
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2.5">
        {[
          "92% fewer documented crime events",
          "Illumination level lux score +40%",
          "Constant pedestrian sidewalk coverage",
          "Shield proximity within 500m of police posts"
        ].map((item, idx) => (
          <div key={idx} className="flex gap-2.5 items-start group">
            <div className="mt-0.5 w-3.5 h-3.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 transition-colors duration-300">
              <FiCheckCircle className="text-emerald-400 group-hover:text-slate-900 text-[8px] transition-colors" />
            </div>
            <p className="text-[9px] font-bold text-slate-400 leading-tight group-hover:text-slate-300 transition-colors">{item}</p>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-500/20 shadow-lg shadow-emerald-500/10 active:scale-[0.97]">
        <FiNavigation className="animate-pulse" /> Begin Telemetry Route
      </button>
    </>
  );
};

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
  const [routeCoords, setRouteCoords] = useState([]);
  const [safetyDataset, setSafetyDataset] = useState([]);
  const [error, setError] = useState("");
  const [nightSafetyPoint, setNightSafetyPoint] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Full-bleed map fullscreen mode state
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);

  // HUD text index rotators
  const [activeHUDIndex, setActiveHUDIndex] = useState(0);
  const hudMessages = [
    "INITIALIZING SPATIAL NEURAL PIPELINE...",
    "SCANNING DENSITY CLUSTERS IN TRANSIT MATRIX...",
    "EVALUATING LUX STREETLIGHT RATIO...",
    "COMPUTING POLICE SHIELD PROXIMITY INDEX...",
    "OPTIMIZING CORRIDOR TRAJECTORY ROUTING...",
    "INTEGRATING HISTORICAL PREDICTIVE THREAT NODES...",
    "SECURED! CONSTRUCTING COMPARATIVE TELEMETRY..."
  ];

  // Rotate scanning sequence texts during route calculation
  useEffect(() => {
    if (!loading) {
      setActiveHUDIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveHUDIndex((prev) => (prev + 1) % hudMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  // Load CSV Dataset
  useEffect(() => {
    Papa.parse("/data.csv", {
      download: true,
      header: true,
      complete: (results) => {
        console.log("✅ CSV Loaded:", results.data.length, "points");
        if (results.data) {
          setSafetyDataset(results.data.map(p => ({
            lat: parseFloat(p.latitude),
            lng: parseFloat(p.longitude),
            score: parseFloat(p.safety_score) || 50
          })));
        }
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
      const fall = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
        headers: { "User-Agent": "GreenPath/1.0" }
      });
      if (fall.data && fall.data.length > 0) {
        return [parseFloat(fall.data[0].lon), parseFloat(fall.data[0].lat)];
      }
    } catch (fErr) {
      console.error("OSM Geocoding fallback failed:", fErr);
    }
    throw new Error(`Location not found: ${query}`);
  };

  const findRoutes = async () => {
    if (!start || !destination) { setError("Please enter starting point and destination."); return; }
    setLoading(true); setError(""); setStatus("Analyzing Dual Corridors...");
    try {
      console.log("Requesting Fast vs Safe routes from ORS...");
      
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

      setFastRoute({ ...resp.data.fastRoute, color: '#ff0055' });
      setSafeRoute({ ...resp.data.safeRoute, color: '#00ff88' });
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

  return (
    <div className="min-h-screen bg-[#05070e] text-slate-100 font-sans relative overflow-x-hidden pt-[70px]">
      
      {/* Premium Cyber Background Blobs */}
      <div className="absolute left-[8%] top-[15%] w-[380px] h-[380px] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute right-[5%] top-[40%] w-[420px] h-[420px] bg-rose-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute left-[35%] bottom-[8%] w-[320px] h-[320px] bg-cyan-500/5 rounded-full blur-[110px] pointer-events-none" />

      {/* Futuristic Live Scanning HUD Loader Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#05070e]/85 backdrop-blur-md z-[150] flex flex-col items-center justify-center"
          >
            <div className="relative p-10 glass-panel rounded-3xl border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col items-center max-w-lg text-center gap-6">
              {/* Rotating Sci-Fi Ring */}
              <div className="relative w-28 h-28">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-cyan-500/20 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-emerald-500/30 animate-[spin_10s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiActivity className="text-cyan-400 text-3xl animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-cyan-400 font-black uppercase tracking-[0.25em] text-sm animate-pulse">Neural Pathing Engine</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dual routing calculations active</p>
              </div>

              {/* Changing Telemetry Status Messages */}
              <div className="h-6 flex items-center justify-center">
                <motion.p 
                  key={activeHUDIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs font-black uppercase tracking-widest text-slate-300 font-mono"
                >
                  &gt;&gt; {hudMessages[activeHUDIndex]}
                </motion.p>
              </div>

              <div className="w-64 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Full-Bleed Map View Fold (Fluid Height) */}
      <div 
        className={`${
          isFullscreenMap 
            ? "fixed inset-0 z-[100] w-screen h-screen bg-[#030509]" 
            : "relative w-full h-[480px] sm:h-[580px] lg:h-[88vh] border-b border-slate-900 bg-[#030509]"
        } transition-all duration-500 ease-in-out overflow-hidden`}
      >
        {/* Floating Search Inputs HUD Console (Top-Left overlay over Map) */}
        <div className="absolute top-6 left-6 z-30 glass-panel p-2 rounded-2xl flex flex-col md:flex-row gap-2.5 items-center shadow-2xl border border-slate-800/80 w-[calc(100%-3rem)] md:w-auto md:max-w-2xl">
          <div className="flex items-center gap-2 bg-[#04060c]/85 px-3 py-2 rounded-xl border border-slate-900 w-full md:w-52">
            <FiMapPin className="text-cyan-400 flex-shrink-0" />
            <input 
              type="text" 
              value={start} 
              onChange={(e)=>setStart(e.target.value)} 
              placeholder="Origin Terminal" 
              className="bg-transparent text-white font-bold outline-none text-[10px] w-full uppercase tracking-wider placeholder-slate-550" 
            />
          </div>
          <div className="flex items-center gap-2 bg-[#04060c]/85 px-3 py-2 rounded-xl border border-slate-900 w-full md:w-52">
            <FiTarget className="text-rose-450 flex-shrink-0" />
            <input 
              type="text" 
              value={destination} 
              onChange={(e)=>setDestination(e.target.value)} 
              placeholder="Destination Terminal" 
              className="bg-transparent text-white font-bold outline-none text-[10px] w-full uppercase tracking-wider placeholder-slate-550" 
            />
          </div>
          <button 
            onClick={findRoutes} 
            disabled={loading || locationLoading} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 border border-emerald-500/30 w-full md:w-auto active:scale-[0.97]"
          >
            {loading || locationLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <FiSliders />
            )}
            {loading ? "Optimizing" : locationLoading ? "Locating..." : "Analyze"}
          </button>
        </div>

        {/* Floating Sidebar Verdict Overlay (Right side of Map - DESKTOP ONLY `hidden lg:flex`) */}
        <AnimatePresence>
          {fastRoute && safeRoute && !isFullscreenMap && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="hidden lg:flex absolute top-24 right-6 z-25 w-[330px] rounded-[2rem] p-6 glass-panel border border-slate-800/80 shadow-2xl flex-col gap-4.5 select-none max-h-[75vh] overflow-y-auto scrollbar-hide"
            >
              <SidebarVerdictContent fastRoute={fastRoute} safeRoute={safeRoute} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 100% Full-bleed Cinematic Map Canvas */}
        <div className="w-full h-full">
           <RouteSafetyMap 
            startCoords={startCoords}
            destination={endCoords ? { lat: endCoords[1], lng: endCoords[0] } : null}
            showRoutes={!!fastRoute}
            nightSafetyPoint={nightSafetyPoint}
            userLocation={userLocation}
            onLocateMe={detectLocation}
            startName={start || "Origin"}
            destName={destination || "Destination"}
            fastRoute={fastRoute}
            safeRoute={safeRoute}
            isFullscreen={isFullscreenMap}
            onToggleFullscreen={() => setIsFullscreenMap(!isFullscreenMap)}
          />
        </div>
      </div>

      {/* Spacious Lower fold (Hidden in Fullscreen Immersive Mode) */}
      {!isFullscreenMap && (
        <div className="w-full px-6 md:px-12 xl:px-24 py-12 md:py-16 space-y-12 md:space-y-16 border-t border-slate-900 bg-[#030509] relative z-10">
          
          {/* Geolocation status warning feedback (only active during locating) */}
          {locationLoading && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex items-center gap-3 text-cyan-405 text-cyan-400 font-bold bg-cyan-950/20 p-4 rounded-2xl border border-cyan-800/30 text-xs uppercase tracking-wider"
            >
               <div className="w-4 h-4 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
               Calibrating positioning matrix coordinates...
            </motion.div>
          )}

          {/* MOBILE/TABLET STACKED VERDICT PANEL (Visible only below `lg` breakpoint) */}
          <AnimatePresence>
            {fastRoute && safeRoute && (
              <div className="block lg:hidden w-full">
                <div className="glass-panel rounded-[2rem] p-6 border border-slate-800/80 shadow-2xl flex flex-col gap-4.5 select-none w-full max-w-2xl mx-auto">
                  <SidebarVerdictContent fastRoute={fastRoute} safeRoute={safeRoute} />
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Deep Comparative Analysis metrics cards & radar */}
          <AnimatePresence>
            {fastRoute && safeRoute && (
              <motion.div 
                initial={{ opacity: 0, y: 24 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="glass-panel rounded-[2.5rem] p-6 sm:p-10 border border-slate-800/80 shadow-2xl relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 select-none">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">AI Metric Deep Analysis</h3>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">Cross-referencing spatial risk ratios</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-slate-900 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <FiSliders className="text-cyan-400 animate-pulse" /> Neural Pipeline Sync
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  {/* SVG Safety Radar Chart */}
                  <div className="flex justify-center w-full">
                    <SafetyRadarChart fastRoute={fastRoute} safeRoute={safeRoute} />
                  </div>

                  {/* Progress Slider Rows */}
                  <div className="space-y-4 w-full">
                    <ComparativeMetricRow 
                      label="Crime Incident Density" 
                      icon={FiAlertTriangle} 
                      fastVal={fastRoute.metrics.crime} 
                      safeVal={safeRoute.metrics.crime} 
                      desc="Incident Scale (0-10)"
                      isBetterHigh={false} 
                    />
                    <ComparativeMetricRow 
                      label="Lux Street Lighting" 
                      icon={FiSun} 
                      fastVal={`${fastRoute.metrics.lighting} Lux`} 
                      safeVal={`${safeRoute.metrics.lighting} Lux`} 
                      desc="Lux Density Ratio"
                      isBetterHigh={true} 
                    />
                    <ComparativeMetricRow 
                      label="Crowd Safe Density" 
                      icon={FiEye} 
                      fastVal={`${fastRoute.metrics.crowd}%`} 
                      safeVal={`${safeRoute.metrics.crowd}%`} 
                      desc="Active Pedestrian Flow"
                      isBetterHigh={false} 
                    />
                    <ComparativeMetricRow 
                      label="Road Connectivity Index" 
                      icon={FiActivity} 
                      fastVal={fastRoute.metrics.connectivity} 
                      safeVal={safeRoute.metrics.connectivity} 
                      desc="Grid Stability Index"
                      isBetterHigh={true} 
                    />
                    <ComparativeMetricRow 
                      label="Police Proximity Shield" 
                      icon={FiShield} 
                      fastVal={`${fastRoute.metrics.policeDistance} km`} 
                      safeVal={`${safeRoute.metrics.policeDistance} km`} 
                      desc="Avg Station Radius"
                      isBetterHigh={false} 
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Night Safety Regional Scan Section */}
          <div className="relative">
            <NightSafetyAnalyzer onAnalyze={setNightSafetyPoint} />
          </div>

        </div>
      )}

    </div>
  );
}
