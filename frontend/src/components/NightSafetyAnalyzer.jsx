import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMoon, FiShield, FiAlertTriangle, FiSearch, FiZap, FiActivity, FiEye, FiNavigation, FiInfo } from "react-icons/fi";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://greenpath-3.onrender.com";

const NightSafetyAnalyzer = ({ onAnalyze }) => {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyzeNightSafety = async () => {
    if (!location) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const resp = await axios.post(`${API_URL}/api/night-safety`, { location });
      setResult(resp.data);
      if (onAnalyze) onAnalyze(resp.data);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to analyze this region");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-24 border-t border-slate-800/80 pt-24 pb-12 select-none">
      
      {/* Title & Icon Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl text-amber-400 shadow-amber-500/5">
          <FiMoon size={28} className="animate-pulse" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
          Night Safety <span className="text-emerald-400">Analyzer</span>
        </h2>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest max-w-xl">
          AI-powered night risk analysis using historical transit metrics and safety telemetry.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        
        {/* Futuristic Search Field */}
        <div className="flex flex-col sm:flex-row bg-[#070b13]/65 glass-panel p-3 rounded-[1.8rem] border border-slate-800 shadow-2xl gap-4 mb-12">
          <div className="flex-1 flex items-center px-4 gap-3 bg-[#030509]/60 rounded-2xl border border-slate-900">
            <FiSearch className="text-slate-500" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter regional terminal (e.g. Delhi, Noida, Mumbai...)"
              className="bg-transparent py-4 outline-none w-full text-xs font-black uppercase tracking-wider text-white placeholder-slate-550"
              onKeyPress={(e) => e.key === 'Enter' && analyzeNightSafety()}
            />
          </div>
          <button
            onClick={analyzeNightSafety}
            disabled={loading || !location}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 border border-emerald-500/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <FiZap />
            )}
            {loading ? "Optimizing..." : "Analyze Risk Matrix"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Scanning Animation */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel rounded-[2rem] p-12 text-center border border-slate-800 shadow-2xl flex flex-col items-center justify-center"
            >
              <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiActivity className="text-emerald-400 animate-pulse" size={26} />
                </div>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">Scanning Night Safety Trajectories</h3>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Deconstructive risk analysis for {location}...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-400 font-bold text-xs uppercase tracking-wider"
            >
              <FiAlertTriangle size={20} />
              {error}
            </motion.div>
          )}

          {/* Analysis Result Card */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8"
            >
              {/* Score Indicator */}
              <div className="md:col-span-5 bg-[#070b13]/65 glass-panel rounded-[2.2rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div 
                  className="absolute top-0 right-0 w-28 h-28 blur-[70px] opacity-15 pointer-events-none group-hover:opacity-25 transition-opacity"
                  style={{ backgroundColor: result.color }}
                />
                
                <div className="flex flex-col items-center text-center">
                   <div 
                    className="w-36 h-36 rounded-full flex flex-col items-center justify-center mb-8 relative border-4"
                    style={{ borderColor: `${result.color}15` }}
                   >
                     {/* Dynamic filling water level */}
                     <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${result.score}%` }}
                        className="absolute bottom-0 left-0 right-0 opacity-5"
                        style={{ backgroundColor: result.color }}
                     />
                     <span className="text-5xl font-black tracking-tighter" style={{ color: result.color }}>{result.score}</span>
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Lux Score</span>
                   </div>

                   <div 
                    className="px-5 py-2 rounded-full font-black text-[9px] tracking-[0.2em] uppercase mb-4"
                    style={{ backgroundColor: `${result.color}15`, color: result.color }}
                   >
                     {result.status} Threat Level
                   </div>
                   
                   <p className="text-slate-400 font-bold text-xs leading-relaxed uppercase tracking-wider">
                     {result.recommendation}
                   </p>
                </div>
              </div>

              {/* Advanced Risk Slider Indicators */}
              <div className="md:col-span-7 bg-[#070b13]/65 glass-panel rounded-[2.2rem] p-10 border border-slate-800 shadow-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-slate-850 pb-4">
                    <FiShield className="text-emerald-400" />
                    AI Risk Coefficient Matrix
                  </h4>
                  
                  <div className="space-y-6">
                    {[
                      { label: "Regional Illumination", val: result.details.street_lighting, icon: FiZap },
                      { label: "Police Shield Proximity", val: result.details.police_presence, icon: FiShield },
                      { label: "Pedestrian Flow Ratio", val: result.details.crowd_density, icon: FiEye },
                      { label: "Transit Port Access", val: result.details.transport_access, icon: FiNavigation }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <span className="flex items-center gap-2"><item.icon className="text-emerald-400" /> {item.label}</span>
                          <span>{item.val * 10}%</span>
                        </div>
                        <div className="h-1.5 bg-[#030509] rounded-full overflow-hidden border border-slate-900">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.val * 10}%` }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: result.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend & Confidence Summary */}
                <div className="mt-8 pt-8 border-t border-slate-850 flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-center text-slate-400">
                       <FiInfo />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Calculated Precision</p>
                      <p className="text-xs font-bold text-slate-350">92% Neural Telemetry Match</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2.5 select-none opacity-80">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full border border-slate-900 bg-slate-800" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default NightSafetyAnalyzer;
