import React from "react";
import { motion } from "framer-motion";

const LoadingOverlay = ({ message = "Analyzing routes...", showWakingMessage = false }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0f18]/80 backdrop-blur-xl">
    <div className="text-center p-8 bg-white/5 rounded-3xl border border-white/10 shadow-2xl max-w-sm w-full">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
        </motion.div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">{message}</h3>
      <div className="space-y-4">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
          />
        </div>
        
        {showWakingMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] animate-pulse"
          >
            Waking server... please wait ⏳
          </motion.p>
        )}
      </div>
      <p className="text-gray-500 text-[10px] mt-6 leading-relaxed">
        Render free tier can take 30-50 seconds to start after a long break. 
        Your journey is being prepared.
      </p>
    </div>
  </div>
);

export default LoadingOverlay;
