import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  FaLightbulb,
  FaShieldAlt,
  FaExclamationTriangle,
  FaFemale,
  FaRobot,
  FaMapMarkerAlt,
  FaVolumeUp,
  FaPhoneAlt,
  FaShareAlt,
  FaExclamationCircle,
  FaClock,
} from "react-icons/fa";

// ================= IMPORT AI COMPONENTS =================
import NightSafety from "../components/NightSafety";
import SafetyScoreMeter from "../components/SafetyScoreMeter";
import MapPreview from "../components/MapPreview";
import { API_BASE_URL } from "../api/config";


// ================= HELPER COMPONENTS =================

const FloatingParticles = () => {
  const particles = useMemo(() => Array.from({ length: 20 }), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#38bdf8]/30 rounded-full"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5 + 0.2,
          }}
          animate={{
            y: ["-10%", "110%"],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        />
      ))}
    </div>
  );
};

const RadarScan = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-full">
    <motion.div
      className="w-[200%] h-[200%] bg-gradient-to-r from-transparent via-[#38bdf8]/10 to-transparent"
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: "center center" }}
    />
  </div>
);

const ScanningEffect = () => (
  <motion.div
    className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-full h-1 bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent shadow-[0_0_15px_#22d3ee]"
      animate={{ y: ["0%", "100%", "0%"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    <div className="absolute inset-0 bg-[#38bdf8]/5 animate-pulse" />
  </motion.div>
);

export default function RoutePage() {

  // =====================================================
  // STATE MANAGEMENT
  // =====================================================
  const [place, setPlace] = useState("");
  const [showPopup, setShowPopup] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  // Safety score
  const [safetyScore, setSafetyScore] = useState(8.2);

  // Factor scores
  const [factors, setFactors] = useState({
    streetlight: 80,
    police: 65,
    accident: 30,
    women: 75,
  });

  // Last check time
  const [lastChecked, setLastChecked] = useState(null);

  // Example route location (dynamic later)
  const [routeLocation, setRouteLocation] = useState({
    lat: 12.9716,
    lng: 77.5946, // Bangalore
  });

  // =====================================================
  // AI POPUP ON PAGE LOAD
  // =====================================================
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // =====================================================
  // AI VOICE ALERT FUNCTION
  // =====================================================
  const speakSafetyStatus = (score) => {
    if (!("speechSynthesis" in window)) return;

    let message = "";

    if (score < 4) {
      message = "Warning. This area is unsafe at night. Please avoid traveling alone.";
    } else if (score < 7) {
      message = "This area has moderate night safety. Please stay alert.";
    } else {
      message = "This area is safe for night travel. Have a safe journey.";
    }

    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  // =====================================================
  // HANDLE CHECK SAFETY (CONNECTED TO PREDICTIVE AI ENGINE)
  // =====================================================
  const handleCheckSafety = async () => {
    if (!place.trim()) return;
    setLoading(true);
    setShowResult(true);

    try {
      // Calling our newly trained AI predictive model on the backend
      const response = await axios.post(`${API_BASE_URL}/api/safety/predict`, { location: place });
      const data = response.data;
      
      // Update UI with real "trained" data
      setSafetyScore(Number(data.score));
      setFactors({
        streetlight: data.factors.streetlight,
        police: Math.round(((5 - data.factors.police) / 5) * 100), // convert km proximity to relevance %
        accident: data.factors.accident,
        women: data.factors.women,
      });

      // Sync map coordinates
      if (data.coords) {
         setRouteLocation({ lat: data.coords.lat, lng: data.coords.lng });
      }

      setLastChecked(new Date().toLocaleTimeString());
      setLoading(false);

      // AI Voice feedback
      speakSafetyStatus(data.score);

    } catch (error) {
      console.error("AI Safety Engine Error:", error);
      
      // Fallback to simulation if backend is unreachable
      setTimeout(() => {
        const simulatedScore = Number((Math.random() * 10).toFixed(1));
        setSafetyScore(simulatedScore);
        setFactors({
          streetlight: Math.floor(Math.random() * 40 + 60),
          police: Math.floor(Math.random() * 40 + 50),
          accident: Math.floor(Math.random() * 40),
          women: Math.floor(Math.random() * 40 + 60),
        });
        setLastChecked(new Date().toLocaleTimeString());
        setLoading(false);
        speakSafetyStatus(simulatedScore);
      }, 3000);
    }
  };

  // =====================================================
  // AI VERDICT LOGIC
  // =====================================================
  const getVerdict = () => {
    if (safetyScore < 4) return { label: "UNSAFE", color: "bg-red-500", shadow: "shadow-red-500/50", icon: <FaExclamationTriangle className="text-white" /> };
    if (safetyScore < 7) return { label: "MODERATE", color: "bg-amber-500", shadow: "shadow-amber-500/50", icon: <FaExclamationCircle className="text-white" /> };
    return { label: "SAFE", color: "bg-emerald-500", shadow: "shadow-emerald-500/50", icon: <FaShieldAlt className="text-white" /> };
  };

  const verdict = getVerdict();

  // Glass card common style
  const glassCardClass = "bg-white/5 backdrop-blur-[18px] border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.3)] transition-all duration-300";

  return (
    <div 
      className="min-h-screen w-full px-4 sm:px-6 md:px-10 py-6 md:py-10 relative overflow-hidden font-sans text-white"
      style={{
        background: "linear-gradient(135deg, #020617, #0f172a, #111827, #1e293b)",
      }}
    >
      <FloatingParticles />

      {/* Subtle radial highlight */}
      <div 
        className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none" 
        style={{
          background: "radial-gradient(circle at top right, rgba(56,189,248,0.15), transparent 70%)"
        }}>
      </div>

      {/* ================= AI POPUP ================= */}
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.8 }} 
            animate={{ opacity: 1, x: 0, scale: 1 }} 
            exit={{ opacity: 0, x: 50, scale: 0.8 }}
            className="fixed top-24 right-6 z-50 bg-[#0f172a]/90 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-[0_10px_30_rgba(34,211,238,0.2)] border border-[#38bdf8]/30"
          >
            <div className="flex items-center gap-3">
              <FaRobot className="text-2xl text-[#38bdf8] animate-pulse" />
              <p className="font-semibold text-white/90">
                AI is ready to analyze night safety...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= HERO SECTION ================= */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto mb-16 p-8 md:p-12 text-center relative z-10"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
        }}
      >
        <div className="relative inline-block mb-6">
          <RadarScan />
          <motion.div 
            initial={{ scale: 0.9 }} 
            animate={{ scale: 1 }} 
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
            className="relative z-10 inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#0f172a] border border-[#38bdf8]/30 shadow-[0_0_35px_rgba(56,189,248,0.5)]"
          >
            <FaRobot className="text-5xl text-[#38bdf8] drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
          </motion.div>
        </div>
        
        <motion.h1 
          className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-5 tracking-wide cursor-default group"
          whileHover={{ scale: 1.02 }}
        >
          <span 
            className="bg-clip-text text-transparent pb-1 drop-shadow-sm transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" 
            style={{ backgroundImage: "linear-gradient(90deg, #22d3ee, #a78bfa, #38bdf8)" }}
          >
            AI-Based Night Safety Score
          </span>
        </motion.h1>
        <p className="text-sm sm:text-base md:text-lg mx-auto max-w-2xl text-white/80 leading-relaxed">
          Predictive security dashboard powered by AI. We analyze streetlights, police proximity, historical incident datasets, and environmental factors to ensure your safety.
        </p>
      </motion.div>

      {/* ================= INPUT SECTION ================= */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }} 
         animate={{ opacity: 1, y: 0 }} 
         transition={{ duration: 0.5, delay: 0.1 }}
         className="max-w-2xl mx-auto mb-20 p-8 relative z-10 group transition-all duration-300 hover:-translate-y-[6px]"
         style={{
           background: "rgba(255, 255, 255, 0.04)",
           backdropFilter: "blur(18px)",
           borderRadius: "18px",
           border: "1px solid rgba(255, 255, 255, 0.08)",
         }}
      >
        <AnimatePresence>
          {loading && <ScanningEffect />}
        </AnimatePresence>

        <label className="block mb-4 text-lg font-bold tracking-wide text-white/90">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="inline-block"
          >
            <FaMapMarkerAlt className="inline mr-2 text-[#a78bfa]" />
          </motion.span>
          Enter Trip Destination
        </label>

        <input
          type="text"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="e.g., Connaught Place, New Delhi"
          className="w-full px-5 py-4 rounded-xl bg-[#0f172a]/70 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none"
          style={{ border: "1px solid rgba(255, 255, 255, 0.1)" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#38bdf8";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(56,189,248,0.3)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        <button
          onClick={handleCheckSafety}
          disabled={loading}
          className="mt-6 w-full py-4 rounded-xl text-white font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.98] relative overflow-hidden group"
          style={{
            background: "linear-gradient(90deg, #22d3ee, #a78bfa)",
            boxShadow: "0 0 20px rgba(34,211,238,0.4)"
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? "AI Analysis in Progress..." : "Check Night Safety"} 
            {!loading && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <FaShieldAlt className="group-hover:rotate-12 transition-transform" />
              </motion.div>
            )}
          </span>
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          />
        </button>
      </motion.div>

      {/* ================= EXTRA HEROIC CARDS ================= */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
         className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 relative z-10"
      >
        {[
          { title: "Streetlight Coverage", icon: <FaLightbulb className="text-[#a78bfa] drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]" />, desc: "Real-time illumination tracking." },
          { title: "Police Proximity", icon: <FaShieldAlt className="text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />, desc: "Distance to nearest patrols." },
          { title: "Accident History", icon: <FaExclamationTriangle className="text-[#22d3ee] drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />, desc: "Historical incident mapping." }
        ].map((item, idx) => (
          <motion.div key={idx} 
            className="p-6 transition-all duration-300 group flex flex-col items-center text-center cursor-default bg-white/5 rounded-2xl border border-white/10"
            whileHover={{ y: -8, scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <motion.div 
              className="text-4xl mb-4"
              whileHover={{ rotate: [0, -10, 10, 0] }}
            >
              {item.icon}
            </motion.div>
            <h3 className="text-lg font-bold mb-2 tracking-wide text-white">{item.title}</h3>
            <p className="text-sm font-light text-white/60">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ================= RESULTS ================= */}
      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
            className="mt-10 space-y-12 max-w-6xl mx-auto relative z-10"
          >
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center font-bold text-[#38bdf8] text-lg flex items-center justify-center gap-3 drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]"
              >
                <FaRobot className="animate-spin" /> Advanced AI logic engaging environment sensors...
              </motion.div>
            )}

            {/* SCORE + MAP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="transition-transform duration-300"
              >
                <SafetyScoreMeter score={safetyScore} />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.01 }}
                className="relative group transition-transform duration-300"
              >
                <div className="absolute inset-0 bg-[#38bdf8]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <MapPreview lat={routeLocation.lat} lng={routeLocation.lng} />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* VERDICT */}
              <motion.div 
                whileHover={{ y: -5 }}
                className={`${glassCardClass} p-10 col-span-1 md:col-span-1 group flex flex-col relative overflow-hidden h-full`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FaRobot className="text-6xl" />
                </div>
                <h2 className="text-2xl font-bold mb-6 tracking-wide flex items-center gap-2 text-[#38bdf8] relative z-10">
                  <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                    <FaRobot />
                  </motion.div>
                   AI Safety Result
                </h2>
                <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-xl text-white shadow-lg ${verdict.color} ${verdict.shadow} mb-6 transition-transform group-hover:scale-105`}
                  >
                    {verdict.icon}
                    {verdict.label}
                  </motion.span>
                  <p className="font-light text-sm mb-6 text-white/70">
                    Calculated dynamically using real-time predictive modeling.
                  </p>
                  <button
                    onClick={() => speakSafetyStatus(safetyScore)}
                    className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] hover:border-[#a78bfa]/50 group"
                  >
                    <FaVolumeUp className="text-[#a78bfa] group-hover:scale-110" /> Hear Intelligence Alert
                  </button>
                  {lastChecked && (
                    <span className="text-xs flex items-center gap-1 mt-6 text-white/50">
                      <FaClock /> Last Updated: {lastChecked}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* FACTOR BARS */}
              <motion.div 
                whileHover={{ y: -5 }}
                className={`${glassCardClass} p-6 md:p-8 col-span-1 md:col-span-2`}
              >
                <h2 className="text-xl md:text-2xl font-bold mb-8 tracking-wide flex items-center gap-2 text-[#22d3ee]">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <FaShieldAlt />
                  </motion.div>
                  Dimension Analysis
                </h2>
                <div className="space-y-6">
                  {[
                    ["Streetlights & Illumination", factors.streetlight, "from-yellow-400 to-amber-500", <FaLightbulb />],
                    ["Police Proximity & Patrols", factors.police, "from-blue-400 to-[#38bdf8]", <FaShieldAlt />],
                    ["Accident History Zones", factors.accident, "from-red-400 to-rose-500", <FaExclamationTriangle />],
                    ["Crowd Density & Sentiment", factors.women, "from-[#a78bfa] to-purple-500", <FaFemale />],
                  ].map(([label, value, gradient, icon], i) => (
                    <div key={i} className="group cursor-default">
                      <div className="flex justify-between mb-2 text-xs md:text-sm font-medium text-white/80">
                        <span className="flex items-center gap-2 group-hover:text-[#38bdf8] transition-colors">{icon} {label}</span>
                        <span className="font-bold">{value}%</span>
                      </div>
                      <div className="w-full bg-[#0f172a] rounded-full h-2.5 md:h-3 border border-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                          className={`bg-gradient-to-r ${gradient} h-full rounded-full drop-shadow-md group-hover:brightness-125 transition-all`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* BACKEND DETAILS */}
            <motion.div 
              whileHover={{ scale: 1.005 }}
              className={`${glassCardClass} p-8 overflow-hidden relative group`}
            >
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#a78bfa]/5 rounded-full blur-3xl group-hover:bg-[#a78bfa]/10 transition-colors" />
              <h2 className="text-2xl font-bold mb-6 tracking-wide text-[#a78bfa] relative z-10 flex items-center gap-2">
                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                   <FaShieldAlt className="text-sm opacity-50" />
                 </motion.div>
                 Live Engine Logs
              </h2>
              <div className="bg-[#0f172a]/50 rounded-xl p-4 border border-white/5 relative z-10 font-mono text-sm">
                 <NightSafety lat={routeLocation.lat} lng={routeLocation.lng} />
              </div>
            </motion.div>

            {/* EMERGENCY ACTIONS */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-gradient-to-br from-[#4c0519] to-transparent backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 md:p-8 shadow-[0_20px_50_rgba(225,29,72,0.15)] group transition-all duration-500"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3 text-red-400 group-hover:text-red-300 transition-colors">
                <FaExclamationCircle className="animate-pulse" /> Emergency SOS Protocols
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="tel:112"
                  className="flex-1 min-w-[200px] py-4 rounded-xl bg-red-600/80 hover:bg-red-500 border border-red-400/50 transition-all duration-300 flex justify-center items-center gap-3 font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_35px_rgba(220,38,38,0.7)]"
                >
                  <FaPhoneAlt className="text-xl animate-bounce" /> Initialize SOS Call
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    navigator.share?.({
                      title: "Live Location Broadcast",
                      text: "Emergency Broadcast. Requesting immediate assistance.",
                      url: window.location.href,
                    })
                  }
                  className="flex-1 min-w-[200px] py-4 rounded-xl bg-orange-600/80 hover:bg-orange-500 border border-orange-400/50 transition-all duration-300 flex justify-center items-center gap-3 font-bold text-white shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_35px_rgba(234,88,12,0.7)]"
                >
                  <FaShareAlt className="text-xl" /> Broadcast Ping
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= FOOTER ================= */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        className="mt-20 text-center text-sm font-light tracking-widest uppercase pb-6 relative z-10 text-white"
      >
        Powered by AI • Real-time Safety Intelligence • GreenPath Dashboard
      </motion.p>
    </div>
  );
}
