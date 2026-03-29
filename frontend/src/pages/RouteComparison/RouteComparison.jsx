import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiMapPin, 
  FiNavigation, 
  FiRefreshCw, 
  FiTrendingUp, 
  FiUser, 
  FiUsers, 
  FiActivity,
  FiZap,
  FiBell,
  FiSettings,
  FiChevronDown,
  FiClock,
  FiShield
} from "react-icons/fi";
import { FaCar, FaBus, FaBicycle, FaWalking } from "react-icons/fa";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useRef } from "react";


// ================== REUSABLE UI COMPONENTS ==================

const GlassCard = ({ children, className = "", hover = true }) => (
  <motion.div 
    whileHover={hover ? { y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" } : {}}
    className={`glassmorphism rounded-[2rem] p-4 md:p-6 shadow-xl border border-white/10 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const LoadingSkeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
);

const InputField = ({ icon: Icon, placeholder, value, onChange }) => (
  <div className="relative group w-full">
    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-cyan-400 transition-colors">
      <Icon className="w-5 h-5" />
    </div>
    <input
      type="text"
      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all text-sm md:text-base"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

const ModeButton = ({ icon: Icon, label, active, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl border transition-all duration-300 ${
      active 
        ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
    }`}
  >
    <Icon className="w-5 h-5 md:w-6 md:h-6 mb-2" />
    <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">{label}</span>
  </motion.button>
);

const AnalyticsBar = ({ label, percentage, colorClass, delay = 0 }) => (
  <div className="mb-6">
    <div className="flex justify-between text-xs md:text-sm mb-2">
      <span className="text-gray-400 font-medium">{label}</span>
      <span className="text-white font-bold">{percentage}%</span>
    </div>
    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut", delay }}
        className={`h-full rounded-full ${colorClass} shadow-[0_0_15px_rgba(0,0,0,0.3)]`}
      />
    </div>
  </div>
);

// ================== MAIN PAGE COMPONENT ==================

export default function RouteComparison() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState("car");
  const [loading, setLoading] = useState(true);
  const [showWakingMessage, setShowWakingMessage] = useState(false);
  const loadingTimerRef = useRef(null);


  useEffect(() => {
    // Simulate initial loading for "production" feel
    const timer = setTimeout(() => {
      setLoading(false);
      setShowWakingMessage(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCompare = () => {
     setLoading(true);
     setShowWakingMessage(false);
     
     // Timer to show waking message
     loadingTimerRef.current = setTimeout(() => {
       setShowWakingMessage(true);
     }, 4000);

     // This would be your actual fetch, simulating for now
     setTimeout(() => {
        setLoading(false);
        setShowWakingMessage(false);
        if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
     }, 3000); // Simulate response
  };


  const transportModes = [
    { id: "car", icon: FaCar, label: "Car" },
    { id: "bus", icon: FaBus, label: "Bus" },
    { id: "cycling", icon: FaBicycle, label: "Cycling" },
    { id: "walking", icon: FaWalking, label: "Walking" },
  ];

  return (
    <div className="min-h-screen bg-transparent p-3 md:p-6 lg:p-10 text-white font-sans overflow-x-hidden">
      {loading && (
        <LoadingOverlay 
          message={showWakingMessage ? "Starting AI Prediction..." : "Analyzing Travel Route..."} 
          showWakingMessage={showWakingMessage} 
        />
      )}

      
      {/* HEADER & USER PROFILE SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center md:text-left"
        >
          <h1 className="text-3xl md:text-5xl font-black mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Route & Eco Comparison
          </h1>
          <p className="text-gray-400 text-sm md:text-lg font-light tracking-wide">
            Real-time insights for CO₂, AQI, traffic & predictive safety
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 bg-white/5 p-2 pr-4 rounded-full border border-white/10 backdrop-blur-md"
        >
          <div className="flex gap-2 mr-2 border-r border-white/10 pr-4">
             <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
               <FiBell />
               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
             </button>
             <button className="p-2 text-gray-400 hover:text-white transition-colors">
               <FiSettings />
             </button>
          </div>
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center p-0.5 shadow-lg group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full rounded-full bg-[#0a0f18] flex items-center justify-center overflow-hidden">
                <FiUser className="text-cyan-400" />
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-white">Alex Rivera</p>
              <p className="text-[10px] text-emerald-400 font-medium">Eco Warrior</p>
            </div>
            <FiChevronDown className="text-gray-500 group-hover:text-white transition-colors" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Input & Selection (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="relative overflow-hidden !p-6 md:!p-8">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-4 mb-8">
              <InputField 
                icon={FiMapPin} 
                placeholder="Start Location" 
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
              
              <div className="flex justify-center -my-2 relative z-10">
                <motion.button 
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-[#1e293b] hover:bg-cyan-500/20 rounded-full border border-white/10 hover:border-cyan-500/50 text-gray-400 hover:text-cyan-400 transition-all shadow-xl"
                >
                  <FiRefreshCw className="w-5 h-5" />
                </motion.button>
              </div>

              <InputField 
                icon={FiNavigation} 
                placeholder="Where to?" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4 mb-8">
              {transportModes.map((m) => (
                <ModeButton 
                  key={m.id}
                  icon={m.icon}
                  label={m.label}
                  active={mode === m.id}
                  onClick={() => setMode(m.id)}
                />
              ))}
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCompare}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white font-black rounded-[1.2rem] shadow-2xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-3 text-lg md:text-xl"
            >

              <FiActivity className="w-6 h-6" />
              Compare Routes
            </motion.button>
          </GlassCard>

          {/* Selected Modes (Stack on mobile, side-by-side on tablet/desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <GlassCard className="!p-5 hover:border-cyan-500/40 relative group overflow-hidden">
               {/* Label */}
              <div className="absolute -top-1 -right-1">
                <div className="bg-cyan-500 py-1 px-4 rounded-bl-2xl text-[10px] uppercase font-black tracking-widest shadow-lg">Route Alpha</div>
              </div>

              <div className="flex items-center gap-5">
                <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 group-hover:scale-110 transition-transform">
                  <FaCar className="text-cyan-400 w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight uppercase tracking-tight">Personal Hybrid</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400"><FiMapPin className="text-cyan-500" /> 12.4 km</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><FiClock className="text-cyan-500" /> 18 min</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="!p-5 hover:border-emerald-500/40 relative group overflow-hidden">
              {/* Label */}
              <div className="absolute -top-1 -right-1">
                <div className="bg-emerald-500 py-1 px-4 rounded-bl-2xl text-[10px] uppercase font-black tracking-widest shadow-lg">Route Green</div>
              </div>

              <div className="flex items-center gap-5">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <FaBus className="text-emerald-400 w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight uppercase tracking-tight">Eco Transit</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400"><FiMapPin className="text-emerald-500" /> 11.8 km</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><FiClock className="text-emerald-500" /> 24 min</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* RIGHT COLUMN: Analytics & Map (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Emission Dashboard */}
            <GlassCard className="relative overflow-hidden !p-7">
               <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
                <FiTrendingUp className="text-cyan-400 w-6 h-6" /> Transport Analysis
               </h3>
               <AnimatePresence mode="wait">
                 {loading ? (
                   <div className="space-y-6">
                     <LoadingSkeleton className="h-10 w-full" />
                     <LoadingSkeleton className="h-10 w-full" />
                     <LoadingSkeleton className="h-10 w-full" />
                   </div>
                 ) : (
                   <div className="space-y-2">
                     <AnalyticsBar label="Carbon Footprint" percentage={84} colorClass="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400" delay={0.1} />
                     <AnalyticsBar label="AQI Risk Level" percentage={32} colorClass="bg-gradient-to-r from-emerald-500 to-teal-400" delay={0.2} />
                     <AnalyticsBar label="Safety Confidence" percentage={96} colorClass="bg-gradient-to-r from-cyan-400 to-blue-500" delay={0.3} />
                   </div>
                 )}
               </AnimatePresence>
            </GlassCard>

            {/* CO2 Comparison Graph */}
            <GlassCard className="relative !p-7 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FiZap className="w-24 h-24" />
              </div>
              
              <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">CO₂ Impact Comparison</h3>
              
              {loading ? (
                <LoadingSkeleton className="h-32 w-full" />
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="flex items-end justify-center gap-8 h-32 mb-6">
                    <div className="flex flex-col items-center gap-2">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ duration: 1, ease: "backOut" }}
                        className="w-10 md:w-14 bg-red-500/40 rounded-t-xl border-x border-t border-red-500/30"
                      />
                      <span className="text-[10px] font-black uppercase text-red-400 tracking-widest">Car</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: "35%" }}
                        transition={{ duration: 1, ease: "backOut", delay: 0.2 }}
                        className="w-10 md:w-14 bg-emerald-500/40 rounded-t-xl border-x border-t border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      />
                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Bus</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-emerald-400 tracking-tighter">-65.2% CO₂</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Savings detected on Route Green</p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Social Stats / Community */}
          <GlassCard className="bg-gradient-to-r from-cyan-500/10 via-[#0a0f18] to-purple-500/10 !p-6 md:!p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-2xl p-0.5">
                    <div className="w-full h-full rounded-[1.4rem] bg-[#0a0f18] flex items-center justify-center">
                      <FiUsers className="w-10 h-10 text-cyan-400" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">RANK #12</div>
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Global Impact Score</h3>
                  <p className="text-gray-400 text-sm md:text-base max-w-md">You've saved enough CO₂ this month to plant <span className="text-emerald-400 font-bold">14 trees</span>. Top 3% of city residents.</p>
                </div>
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                <div className="flex-1 md:flex-none text-center px-6 py-4 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-colors">
                  <div className="text-cyan-400 text-2xl font-black tabular-nums">1.48t</div>
                  <div className="text-[9px] uppercase text-gray-500 font-black tracking-widest mt-1">Life Savings</div>
                </div>
                <div className="flex-1 md:flex-none text-center px-6 py-4 bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-colors">
                  <div className="text-purple-400 text-2xl font-black tabular-nums">842kg</div>
                  <div className="text-[9px] uppercase text-gray-500 font-black tracking-widest mt-1">Comm. Avg</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Interactive Map Section */}
          <GlassCard className="!p-0 overflow-hidden relative group border-2 border-white/5 hover:border-cyan-500/20">
            {/* Map Controls Floating */}
            <div className="absolute top-6 left-6 z-20 space-y-3">
              <div className="bg-black/80 backdrop-blur-xl px-5 py-2.5 rounded-[1.2rem] border border-white/10 flex items-center gap-3 shadow-2xl">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-white">Neural Net: Route Active</span>
              </div>
              <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2 group-hover:opacity-100 opacity-60 transition-opacity">
                <FiShield className="text-cyan-400 text-sm" />
                <span className="text-[10px] font-bold text-gray-300">Safety Sensors Online</span>
              </div>
            </div>
            
            <div className="w-full h-[350px] md:h-[550px] bg-[#0d1117] relative flex items-center justify-center group/map overflow-hidden">
               {/* Advanced Animation Layer */}
               <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -ms-[400px] -mt-[400px] w-[800px] h-[800px] border border-cyan-500/10 rounded-full animate-[spin_40s_linear_infinite]" />
                  <div className="absolute top-1/2 left-1/2 -ms-[300px] -mt-[300px] w-[600px] h-[600px] border border-purple-500/10 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
                  <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
               </div>

               {loading ? (
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(6,182,212,0.3)]" />
                    <p className="text-cyan-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Map Matrix...</p>
                 </div>
               ) : (
                 <div className="relative z-10 flex flex-col items-center">
                    <motion.div 
                      animate={{ y: [0, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="w-16 h-16 bg-cyan-500/20 rounded-3xl flex items-center justify-center border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.4)] relative"
                    >
                      <FiNavigation className="text-cyan-400 w-8 h-8" />
                      <div className="absolute -bottom-2 w-4 h-4 bg-cyan-400 blur-sm animate-ping" />
                    </motion.div>
                    <p className="mt-8 text-gray-500 text-xs font-black uppercase tracking-[0.5em]">Responsive Vector Engine Live</p>
                 </div>
               )}

              {/* Interaction Hint */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/map:opacity-100 transition-all translate-y-4 group-hover/map:translate-y-0 duration-500 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Pinch or Scroll to Explore</span>
              </div>
            </div>

            {/* Bottom Right Zoom */}
            <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-3">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-12 h-12 bg-black/80 backdrop-blur-xl text-white rounded-2xl border border-white/10 hover:border-cyan-500/50 flex items-center justify-center text-xl font-bold shadow-2xl">+</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-12 h-12 bg-black/80 backdrop-blur-xl text-white rounded-2xl border border-white/10 hover:border-cyan-500/50 flex items-center justify-center text-xl font-bold shadow-2xl">-</motion.button>
            </div>
          </GlassCard>

          {/* Tips Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white/5 p-6 rounded-[1.5rem] border border-white/10 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
               <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 group-hover:scale-110 transition-transform"><FiZap /></div>
               <h4 className="font-bold text-sm uppercase tracking-widest">Real-time Traffic</h4>
               <p className="text-gray-500 text-[11px]">AI-powered traffic prediction models updated every 30 seconds.</p>
             </div>
             <div className="bg-white/5 p-6 rounded-[1.5rem] border border-white/10 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
               <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform"><FiShield /></div>
               <h4 className="font-bold text-sm uppercase tracking-widest">Safety Matrix</h4>
               <p className="text-gray-500 text-[11px]">Route safety scores based on historical data and lighting density.</p>
             </div>
             <div className="bg-white/5 p-6 rounded-[1.5rem] border border-white/10 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
               <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform"><FiClock /></div>
               <h4 className="font-bold text-sm uppercase tracking-widest">Breathe Maps</h4>
               <p className="text-gray-500 text-[11px]">Air quality index integration to help you avoid highly polluted areas.</p>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
