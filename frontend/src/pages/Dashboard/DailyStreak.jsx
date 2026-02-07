import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DailyStreak() {
  const [streak, setStreak] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setStreak((prev) => (prev < 10 ? prev + 1 : prev));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="backdrop-blur-md bg-white/10 p-6 rounded-2xl shadow-lg border border-purple-400/20 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-semibold text-purple-300 mb-4">🔥 Daily Streak</h2>

      <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-purple-700 stroke-current"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-purple-400 stroke-current"
            strokeWidth="4"
            strokeDasharray={`${streak * 10}, 100`}
            fill="none"
            strokeLinecap="round"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="absolute text-3xl font-bold text-purple-200">{streak}🔥</span>
      </div>

      <AnimatePresence>
        <motion.p
          key={streak}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-purple-100"
        >
          {streak < 10 ? `Keep going!` : `Streak Master! 🏆`}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}
