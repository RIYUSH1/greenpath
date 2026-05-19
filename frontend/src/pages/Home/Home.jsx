import { useEffect, useState, useRef } from "react";

// Fallback AnimatedNumber component since react-countup might not be installed yet
function AnimatedNumber({ end, duration = 2, decimals = 0 }) {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);

  useEffect(() => {
    let frame;
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / (duration * 1000), 1);
      setCount(progress * end);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);

  return <>{count.toFixed(decimals)}</>;
}
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import greenPathImg from "../../assets/greenpath.jpeg";
import smartCityImg from "../../assets/smartcityimg.jpeg";
import nature3Img from "../../assets/nature3.jpeg";
import safetyImg from "../../assets/safety.jpeg";
import greenHero from "../../assets/green1.png";

import CursorParticles from "../../components/CursorParticles";
import {
  FiShield,
  FiMap,
  FiMoon,
  FiSun,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiCpu,
  FiNavigation,
  FiActivity,
  FiSearch,
  FiHome,
  FiSettings
} from "react-icons/fi";

// Helper functions for dynamic greeting
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getMessage() {
  const hour = new Date().getHours();
  if (hour < 12) return "Start your day with a safe journey 🚀";
  if (hour < 18) return "Stay safe while moving across the city 🛡️";
  return "Travel smart and stay secure tonight 🌙";
}

// Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

export default function Home() {
  const navigate = useNavigate();

  const flashCards = [
    { title: "Safety Score", value: "98%", icon: FiShield, text: "text-green-600" },
    { title: "AI Confidence", value: "High", icon: FiCpu, text: "text-green-600" },
    { title: "Night Risk", value: "Low", icon: FiMoon, text: "text-green-600" },
    { title: "Safe Areas", value: "12 Nearby", icon: FiMap, text: "text-green-600" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full bg-[#F8FAFC] min-h-screen text-[#0F172A] selection:bg-green-100 overflow-x-hidden transition-colors duration-500"
    >
      <CursorParticles />

      {/* ================= PREMIUM CINEMATIC HERO SECTION ================= */}
      <section className="relative max-w-[1550px] mx-auto px-8 md:px-16 xl:px-24 min-h-[90vh] flex items-center py-28 lg:py-44 overflow-hidden">
        {/* Ambient Background Elements */}
        <div className="absolute top-20 right-0 w-[420px] h-[420px] bg-green-200/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-10 left-0 w-[380px] h-[380px] bg-emerald-100/30 rounded-full blur-[140px] -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.95fr] gap-16 xl:gap-24 items-center w-full">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="space-y-10 relative z-10 text-left"
          >
            <div className="space-y-6">
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-800"
              >
                Hi Riyush 👋
              </motion.h3>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] font-black leading-[1.05] tracking-tight text-gray-900"
              >
                Fast. Safe. <br />
                <span className="text-green-600 drop-shadow-[0_4px_12px_rgba(22,163,74,0.15)]">Green.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-500 text-xl md:text-2xl font-medium max-w-xl leading-relaxed"
              >
                Navigate your city with purpose. Experience the next generation of eco-friendly and safe urban navigation.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-6 pt-2"
            >
              <button
                onClick={() => navigate("/route-comparison")}
                className="bg-green-600 hover:bg-green-700 text-white px-12 py-5.5 rounded-2xl font-black text-lg shadow-2xl shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
              >
                Start Journey
              </button>
              <button className="bg-white border-2 border-gray-100 text-gray-500 hover:text-gray-900 px-12 py-5.5 rounded-2xl font-black text-lg hover:bg-gray-50 hover:border-gray-200/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-md">
                Learn More
              </button>
            </motion.div>

            {/* Quick Feature Pills */}
            <div className="flex gap-4 pt-6">
              {["AI Safety", "CO2 Tracking", "Live Map"].map((pill, i) => (
                <span key={i} className="bg-green-50 text-green-700 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-green-100/80 shadow-sm">
                  {pill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right Hero Image (Cinema-Scaled Visuals) */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Soft Ambient Glow backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400 opacity-20 blur-[100px] rounded-full -z-10"></div>
            
            <div className="relative w-full max-w-xl lg:max-w-2xl xl:max-w-3xl flex justify-center">
              <motion.img
                src={greenHero}
                alt="GreenPath AI Hero"
                className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:scale-[1.03] transition duration-500 cursor-pointer animate-[float_4s_ease-in-out_infinite]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= SPACIOUS STATS SECTION ================= */}
      <section className="bg-[#ECFDF5]/40 py-28 relative overflow-hidden border-y border-green-100/40">
        <div className="max-w-[1550px] mx-auto px-8 md:px-16 xl:px-24 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12"
          >
            {flashCards.map((card, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white border border-gray-100/70 p-12 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-3.5 hover:scale-[1.03] transition-all duration-500 group cursor-pointer"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-6 rounded-2xl bg-green-50 ${card.text} mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-inner`}>
                    <card.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-[#475569] text-xs font-black uppercase tracking-[0.25em] mb-2.5">{card.title}</h3>
                  <p className="text-4xl font-black text-[#0F172A]">{card.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= REALTIME PATH ANALYSIS (SPACIOUS IMAGES) ================= */}
      <section className="max-w-[1550px] mx-auto px-8 md:px-16 xl:px-24 py-36">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 text-[#0F172A] tracking-tight">Real-time Path Analysis</h2>
          <p className="text-[#475569] text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-wide">Our AI detects environmental hazards before you reach them, ensuring a seamless journey every time.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 xl:gap-20">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative rounded-[3rem] overflow-hidden shadow-xl border-4 border-white bg-white p-2.5"
          >
            <div className="aspect-video overflow-hidden rounded-[2.5rem]">
              <img src={nature3Img} alt="Unsafe route" className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" />
            </div>
            <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md text-red-600 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">High Risk Area</div>
            <div className="p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-2 text-[#0F172A]">Standard Urban Route</h3>
              <p className="text-[#475569] font-bold text-sm uppercase tracking-wide">Heavy pollution detection - 85% risk score</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative rounded-[3rem] overflow-hidden shadow-xl border-4 border-white bg-white p-2.5"
          >
            <div className="aspect-video overflow-hidden rounded-[2.5rem]">
              <img src={smartCityImg} alt="Safe route" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
            </div>
            <div className="absolute top-8 left-8 bg-green-600 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">Safe Verified</div>
            <div className="p-10">
              <h3 className="text-2xl md:text-3xl font-black mb-2 text-[#0F172A]">GreenPath Eco Route</h3>
              <p className="text-green-600 font-black text-sm uppercase tracking-wider">Optimized Air Quality - 12% risk score</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= FINAL CINEMATIC CTA ================= */}
      <section className="max-w-[1550px] mx-auto px-8 md:px-16 xl:px-24 py-36">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-[5rem] p-16 md:p-28 text-center text-white relative overflow-hidden shadow-2xl shadow-green-500/20"
        >
          {/* Decorative CTA Background */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px]" />

          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black mb-10 leading-none tracking-tight">
              Ready to Upgrade Your <br />
              <span className="text-green-200">Urban Experience?</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={() => navigate("/route-comparison")}
                className="bg-white text-green-700 px-14 py-6 rounded-[2rem] font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Join Now Free
              </button>
              <button className="bg-transparent border-2 border-white/30 text-white px-14 py-6 rounded-[2rem] font-black text-2xl hover:bg-white/10 transition-all duration-300">
                Contact Sales
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-20">
        <div className="max-w-[1550px] mx-auto px-8 md:px-16 xl:px-24 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4 group">
            <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center text-white font-black group-hover:rotate-12 transition-transform text-lg shadow-md shadow-green-500/10">G</div>
            <span className="font-black text-2xl text-[#0F172A] tracking-tighter">GreenPath</span>
          </div>

          <div className="flex gap-12 text-sm font-black uppercase tracking-widest text-[#475569]">
            <a href="#" className="hover:text-green-600 transition-colors">Safety</a>
            <a href="#" className="hover:text-green-600 transition-colors">Company</a>
            <a href="#" className="hover:text-green-600 transition-colors">Privacy</a>
          </div>

          <div className="text-gray-400 font-bold text-sm">
            © 2026 GreenPath AI. All rights reserved. Built for Pioneers.
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

function StatCard({ icon, label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 group transition-all duration-300 hover:shadow-lg"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl group-hover:bg-green-50 group-hover:text-green-500 transition-colors">
          {icon}
        </div>
        <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 tracking-tight group-hover:text-green-600 transition-colors">
        {value}
      </div>
    </motion.div>
  );
}

function NavIcon({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-1 transition-all duration-305 text-gray-400 hover:text-green-500"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}
