import { useRef, useEffect } from "react";
import {
  FiShield,
  FiMap,
  FiMoon,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiCpu,
  FiNavigation,
  FiActivity,
  FiPlay,
  FiSearch
} from "react-icons/fi";
import { motion } from "framer-motion";

/* =========================
   VIDEOS & IMAGES (Preserved)
   ========================= */
import heroVideo from "../../assets/greenpath2.mp4";
import introVideo from "../../assets/intro.mp4";
import endVideo from "../../assets/greenpath3.mp4";
import safetyVideo from "../../assets/greenpath4.mp4";

import greenPathImg from "../../assets/greenpath.jpeg";
import smartCityImg from "../../assets/smartcityimg.jpeg";
import nature3Img from "../../assets/nature3.jpeg";
import safetyImg from "../../assets/safety.jpeg";

export default function Home() {
  const heroRef = useRef(null);
  const introRef = useRef(null);
  const safetyVideoRef = useRef(null);
  const endVideoRef = useRef(null);

  useEffect(() => {
    if (heroRef.current) heroRef.current.muted = true;
    if (introRef.current) introRef.current.muted = true;
    if (safetyVideoRef.current) safetyVideoRef.current.muted = true;
    if (endVideoRef.current) endVideoRef.current.muted = true;
  }, []);



  const flashCards = [
    { title: "Safety Score", value: "98%", icon: FiShield, highlight: "from-cyan-500 to-blue-500", text: "text-cyan-400" },
    { title: "AI Confidence", value: "High", icon: FiCpu, highlight: "from-purple-500 to-indigo-500", text: "text-purple-400" },
    { title: "Night Risk", value: "Low", icon: FiMoon, highlight: "from-blue-400 to-cyan-400", text: "text-blue-400" },
    { title: "Safe Areas", value: "12 Nearby", icon: FiMap, highlight: "from-indigo-400 to-purple-400", text: "text-indigo-400" },
  ];

  return (
    <div className="w-full relative z-10 pt-4 pb-24">
      
      {/* ================= BACKGROUND BLOBS ================= */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse pointer-events-none"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[40rem] left-1/3 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 pointer-events-none" style={{ animationDelay: '4s' }}></div>

      {/* ================= HERO SECTION ================= */}
      <section className="max-w-7xl mx-auto px-6 mt-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative bg-white/5 dark:bg-[#0f172a]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(34,211,238,0.15)] transition-all duration-700"
        >
          <div className="relative rounded-[2rem] overflow-hidden h-[60vh] md:h-[70vh] group">
            
            {/* Background Video */}
            <video
              ref={heroRef}
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] contrast-125 saturate-150 transition-transform duration-1000 group-hover:scale-105"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/80 to-transparent w-2/3" />

            {/* Smart Navigation Overlay Graphics */}
            <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 w-64 h-64 border-2 border-cyan-400/30 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 w-48 h-48 border border-purple-400/40 rounded-full animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />

            {/* Animated Icons Floating */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-1/4 right-[30%] bg-[#0a0f18]/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3"
            >
              <div className="p-2 bg-cyan-500/20 rounded-full"><FiCheckCircle className="text-cyan-400 w-5 h-5"/></div>
              <span className="text-sm font-semibold text-white pr-2">Safe Route</span>
            </motion.div>

            <motion.div 
              animate={{ y: [10, -10, 10] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute top-[40%] right-[15%] bg-[#0a0f18]/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3"
            >
              <div className="p-2 bg-purple-500/20 rounded-full"><FiCpu className="text-purple-400 w-5 h-5"/></div>
              <span className="text-sm font-semibold text-white pr-2">AI Analyzing</span>
            </motion.div>

            <motion.div 
              animate={{ y: [-8, 8, -8] }} 
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute bottom-1/3 right-[35%] bg-[#0a0f18]/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3 opacity-80"
            >
              <div className="p-2 bg-red-500/20 rounded-full"><FiAlertTriangle className="text-red-400 w-5 h-5"/></div>
              <span className="text-sm font-semibold text-gray-300 pr-2">Avoid Zone</span>
            </motion.div>

            {/* Hero Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-10 md:px-20 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-cyan-300 text-sm font-semibold tracking-wide uppercase">AI-Powered Navigation</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6 drop-shadow-2xl">
                  Intelligent <br/>
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-transparent bg-clip-text">Safety Routing.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-300 max-w-xl font-light leading-relaxed mb-10">
                 
                </p>

                <button className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]">
                  <span className="relative z-10 flex items-center gap-2">
                    <FiNavigation className="w-5 h-5" />
                    Start Safe Journey
                  </span>
                  <div className="absolute inset-0 block bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
              </motion.div>
            </div>
            
          </div>
        </motion.div>
      </section>

      {/* ================= FLASH INFO CARDS ================= */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="group relative bg-[#111827]/80 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl hover:-translate-y-3 hover:scale-105 hover:bg-[#1e293b]/90 hover:shadow-[0_15px_50px_rgba(34,211,238,0.2)] transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.highlight} opacity-50 group-hover:opacity-100 transition-opacity`} />
              
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  <card.icon className={`w-6 h-6 ${card.text} drop-shadow-[0_0_8px_currentColor]`} />
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-400/10 px-2 py-1 rounded-md">
                  <FiTrendingUp /> +2.4%
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-gray-400 group-hover:text-white transition-colors text-sm font-medium mb-1">{card.title}</h3>
                <p className={`text-3xl font-bold text-white tracking-tight group-hover:${card.text} transition-colors`}>{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= INTRO + MAP (RESTORED) ================= */}
      <section className="max-w-7xl mx-auto px-6 mt-24 mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Intro Video */}
          <div
            className="group relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 dark:border-white/5 aspect-video hover:-translate-y-3 hover:scale-105 hover:shadow-[0_15px_50px_rgba(168,85,247,0.3)] hover:border-purple-500/50 transition-all duration-500 cursor-pointer"

          >
            <video
              ref={introRef}
              src={introVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.8] contrast-125 saturate-150"
            />
          </div>

          {/* GreenPath Map Image */}
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-white/5 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 dark:border-white/5 p-3 hover:-translate-y-3 hover:scale-105 hover:bg-[#1e293b]/90 hover:border-cyan-500/50 hover:shadow-[0_15px_50px_rgba(6,182,212,0.3)] transition-all duration-500 cursor-pointer">
            <img
              src={greenPathImg}
              alt="GreenPath Map"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </motion.div>
      </section>

      {/* ================= CONTENT & SEARCH BAR (RESTORED) ================= */}
      <section className="max-w-7xl mx-auto px-6 mb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-8">
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-lg"
            >
              Navigate with Purpose. <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                Breathe with Ease.
              </span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-gray-300 text-lg leading-relaxed max-w-md"
            >
              GreenWays predicts safer night routes using AI-based safety,
              lighting, activity, and environmental data. Your journey, optimized for well-being.
            </motion.p>
            
            {/* Nature Image */}
            <div className="h-[240px] rounded-3xl overflow-hidden border border-white/10 shadow-xl group border-t-cyan-500/30">
              <img
                src={nature3Img}
                alt="Eco Nature"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-90 saturate-150"
              />
            </div>
          </div>

          <div className="space-y-8 flex flex-col justify-center">
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex bg-[#0f172a]/80 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-1 group hover:border-cyan-500/50 transition-colors"
            >
              <input
                placeholder="Where are you going today?"
                className="flex-1 bg-transparent px-6 py-4 outline-none text-white placeholder-gray-500 text-sm md:text-base"
              />
              <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <FiSearch /> Search
              </button>
            </motion.div>
            
            {/* Second Smart City Image Map Preview */}
            <div className="h-[260px] rounded-3xl overflow-hidden border border-white/10 shadow-xl group border-t-purple-500/30">
              <img
                src={smartCityImg}
                alt="Smart City Dashboard"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-90 contrast-125"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= DASHBOARD ELEMENTS ================= */}
      <section className="max-w-7xl mx-auto px-6 mt-24 mb-20 relative z-10">
        
        {/* ROW 1: Quick Stats & Route Comparison */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          
          {/* 1. Quick Stats Panel */}
          <div className="w-full md:w-1/3 flex flex-col gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl group hover:-translate-y-3 hover:scale-[1.03] hover:bg-[#1e293b]/90 hover:border-cyan-500/50 hover:shadow-[0_15px_50px_rgba(34,211,238,0.2)] transition-all duration-500 h-full cursor-pointer"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <FiActivity className="text-purple-400" /> Quick Stats Panel
              </h3>
              <div className="space-y-6">
                <div className="group/item">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400 group-hover/item:text-cyan-300 transition-colors">Lighting Density</span>
                    <span className="text-white font-semibold">85%</span>
                  </div>
                  <div className="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 w-[85%] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                  </div>
                </div>
                <div className="group/item">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400 group-hover/item:text-purple-300 transition-colors">Incident Reports</span>
                    <span className="text-white font-semibold">Low (2)</span>
                  </div>
                  <div className="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 w-[15%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                  </div>
                </div>
                <div className="group/item">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400 group-hover/item:text-blue-300 transition-colors">Pedestrian Activity</span>
                    <span className="text-white font-semibold">Moderate</span>
                  </div>
                  <div className="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[60%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 2. Route Comparison Cards */}
          <div className="w-full md:w-2/3">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-full bg-white/5 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl group hover:-translate-y-3 hover:scale-[1.03] hover:bg-[#1e293b]/90 hover:border-indigo-500/50 hover:shadow-[0_15px_50px_rgba(99,102,241,0.2)] transition-all duration-500 flex flex-col justify-between cursor-pointer"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <FiMap className="text-indigo-400" /> Route Comparison Cards
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* Route A */}
                <div className="bg-[#1e293b]/50 p-4 rounded-2xl border border-white/5 hover:border-cyan-400/50 transition-colors cursor-pointer group/card relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-400/10 rounded-bl-full filter blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">Main St. Path</span>
                    <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg">Recommended</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">Time: 12 min</div>
                  <div className="text-sm text-gray-400 mb-3">Safety: 98%</div>
                  <div className="h-1.5 w-full bg-[#0f172a] rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 w-[98%]" />
                  </div>
                </div>

                {/* Route B */}
                <div className="bg-[#1e293b]/50 p-4 rounded-2xl border border-white/5 hover:border-yellow-400/50 transition-colors cursor-pointer group/card relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/10 rounded-bl-full filter blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">Park Alley</span>
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg">Caution</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">Time: 9 min</div>
                  <div className="text-sm text-gray-400 mb-3">Safety: 65%</div>
                  <div className="h-1.5 w-full bg-[#0f172a] rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 w-[65%]" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* ROW 2: Alerts & Recommendations */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* 3. Recent Safety Alerts */}
          <div className="w-full md:w-1/2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl h-full group hover:-translate-y-3 hover:scale-[1.03] hover:bg-[#1e293b]/90 hover:border-red-500/50 hover:shadow-[0_15px_50px_rgba(239,68,68,0.2)] transition-all duration-500 cursor-pointer"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <FiAlertTriangle className="text-red-400" /> Recent Safety Alerts
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                  <div className="p-2 bg-red-500/20 rounded-lg shrink-0">
                    <FiAlertTriangle className="text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-semibold">Streetlight Outage</h4>
                    <p className="text-gray-400 text-xs mt-1">5th Ave crossing has reported low visibility. Route diverted.</p>
                    <span className="text-[10px] text-gray-500 mt-2 block">10 mins ago</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 hover:bg-yellow-500/10 transition-colors">
                  <div className="p-2 bg-yellow-500/20 rounded-lg shrink-0">
                    <FiAlertTriangle className="text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-semibold">Heavy Traffic Zone</h4>
                    <p className="text-gray-400 text-xs mt-1">Downtown construction causing pedestrian delays.</p>
                    <span className="text-[10px] text-gray-500 mt-2 block">32 mins ago</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 4. Smart Recommendations */}
          <div className="w-full md:w-1/2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl h-full group hover:-translate-y-3 hover:scale-[1.03] hover:bg-[#1e293b]/90 hover:border-emerald-500/50 hover:shadow-[0_15px_50px_rgba(16,185,129,0.2)] transition-all duration-500 relative overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />
              
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <FiCheckCircle className="text-emerald-400" /> Smart Recommendations
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
                  <h4 className="text-emerald-300 text-sm font-semibold mb-1">Optimal Departure Time</h4>
                  <p className="text-gray-300 text-sm">Leave in 15 mins to avoid incoming rain and benefit from well-lit paths.</p>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
                  <h4 className="text-blue-300 text-sm font-semibold mb-1">Companion Mode Suggested</h4>
                  <p className="text-gray-300 text-sm">Your upcoming route has empty segments. Enable live location sharing.</p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ================= NIGHT SAFETY COMPARISON (RESTORED) ================= */}
      <section className="max-w-7xl mx-auto px-6 mb-32 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-16 flex items-center justify-center gap-4 text-white drop-shadow-xl"
        >
          <span className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <FiShield />
          </span>
          Night Safety Comparison
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Comparison Image */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 dark:bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] shadow-2xl hover:-translate-y-3 hover:scale-105 hover:bg-[#1e293b]/90 hover:border-cyan-500/50 hover:shadow-[0_15px_50px_rgba(6,182,212,0.3)] transition-all duration-500 group cursor-pointer"
          >
            <img
              src={safetyImg}
              alt="Safety Comparison"
              className="w-full h-[350px] object-cover rounded-2xl filter brightness-[0.8] contrast-125 saturate-150 transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>

          {/* Comparison Video */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 dark:bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] shadow-2xl hover:-translate-y-3 hover:scale-105 hover:bg-[#1e293b]/90 hover:border-purple-500/50 hover:shadow-[0_15px_50px_rgba(168,85,247,0.3)] transition-all duration-500 group overflow-hidden cursor-pointer"
          >
            <video
              ref={safetyVideoRef}
              src={safetyVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[350px] rounded-2xl object-cover filter brightness-[0.8] contrast-[1.25] saturate-150 transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
        </div>
      </section>

      {/* ================= END VIDEO (RESTORED) ================= */}
      <section className="max-w-7xl mx-auto px-6 relative z-10 mb-10">
        <div className="relative w-full h-[60vh] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
          <video
            ref={endVideoRef}
            src={endVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.6] contrast-[1.15] saturate-[1.2] transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617]"></div>
          
          <div className="absolute bottom-16 left-0 right-0 text-center z-10 space-y-8">
            <h3 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Ready to experience <span className="text-cyan-400">GreenWays?</span>
            </h3>
            <button className="relative group/btn overflow-hidden bg-white/10 backdrop-blur-md border border-cyan-500/50 text-cyan-50 px-10 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] text-lg uppercase tracking-wider">
              <span className="relative z-10">Start Your Journey</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
