import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMoon, FiShield, FiAlertTriangle, FiSearch, FiZap, FiActivity, FiEye, FiNavigation, FiInfo } from "react-icons/fi";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    <section className="mt-24 border-t border-slate-200 pt-24 pb-12">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl text-yellow-400">
          <FiMoon size={32} />
        </div>
        <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
          Night Safety <span className="text-green-600">Analyzer</span>
        </h2>
        <p className="text-slate-500 max-w-xl font-medium">
          AI-powered night risk analysis for a selected region using neural patterns and historical transit safety metrics.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex bg-white p-3 rounded-3xl shadow-2xl border border-slate-200 gap-4 mb-12">
          <div className="flex-1 flex items-center px-4 gap-3 bg-slate-50 rounded-2xl border border-slate-100">
            <FiSearch className="text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location (e.g. Delhi, Mumbai, Noida...)"
              className="bg-transparent py-4 outline-none w-full text-sm font-bold text-slate-800"
              onKeyPress={(e) => e.key === 'Enter' && analyzeNightSafety()}
            />
          </div>
          <button
            onClick={analyzeNightSafety}
            disabled={loading || !location}
            className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <FiZap />
            )}
            {loading ? "Analyzing..." : "Analyze Risk"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center"
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 border-4 border-green-100 border-t-green-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiActivity className="text-green-600 animate-pulse" size={32} />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Neural Pattern Scanning</h3>
              <p className="text-slate-400 font-medium italic animate-pulse">Analyzing nighttime risk patterns in {location}...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 text-red-600 font-bold"
            >
              <FiAlertTriangle size={24} />
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8"
            >
              {/* Score Card */}
              <div className="md:col-span-5 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl relative overflow-hidden group">
                <div 
                  className="absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 pointer-events-none"
                  style={{ backgroundColor: result.color }}
                />
                
                <div className="flex flex-col items-center text-center">
                   <div 
                    className="w-40 h-40 rounded-full flex flex-col items-center justify-center mb-8 relative border-8"
                    style={{ borderColor: `${result.color}20` }}
                   >
                     <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${result.score}%` }}
                        className="absolute bottom-0 left-0 right-0 opacity-10"
                        style={{ backgroundColor: result.color }}
                     />
                     <span className="text-6xl font-black tracking-tighter" style={{ color: result.color }}>{result.score}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safety Score</span>
                   </div>

                   <div 
                    className="px-6 py-2 rounded-full font-black text-xs tracking-[0.2em] uppercase mb-4"
                    style={{ backgroundColor: `${result.color}15`, color: result.color }}
                   >
                     {result.status} Status
                   </div>
                   
                   <p className="text-slate-500 font-medium text-sm leading-relaxed">
                     {result.recommendation}
                   </p>
                </div>
              </div>

              {/* Insights Card */}
              <div className="md:col-span-7 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-black mb-8 flex items-center gap-3">
                    <FiShield className="text-green-600" />
                    AI Risk Factor Analysis
                  </h4>
                  
                  <div className="space-y-6">
                    {[
                      { label: "Street Lighting", val: result.details.street_lighting, icon: FiZap },
                      { label: "Police Presence", val: result.details.police_presence, icon: FiShield },
                      { label: "Crowd Density", val: result.details.crowd_density, icon: FiEye },
                      { label: "Transport Access", val: result.details.transport_access, icon: FiNavigation }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className="flex items-center gap-2"><item.icon className="text-green-500" /> {item.label}</span>
                          <span>{item.val * 10}%</span>
                        </div>
                        <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
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

                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                       <FiInfo />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Data Confidence</p>
                      <p className="text-xs font-bold text-slate-700">92% Precision Neural Match</p>
                    </div>
                  </div>
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
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
