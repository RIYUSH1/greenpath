import React from "react";
import { motion } from "framer-motion";
import { FaChartBar } from "react-icons/fa";

export default function Stats() {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-lg border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
        <FaChartBar /> Personalized Stats
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-purple-600/30 rounded-xl text-center">
          <h3 className="text-lg">🌿 CO₂ Saved</h3>
          <p className="text-3xl font-bold mt-2">28.5 kg</p>
        </div>
        <div className="p-6 bg-purple-600/30 rounded-xl text-center">
          <h3 className="text-lg">🚶‍♂️ Steps Walked</h3>
          <p className="text-3xl font-bold mt-2">12,340</p>
        </div>
        <div className="p-6 bg-purple-600/30 rounded-xl text-center">
          <h3 className="text-lg">🚴 Distance Traveled</h3>
          <p className="text-3xl font-bold mt-2">6.2 km</p>
        </div>
      </div>
    </motion.div>
  );
}
