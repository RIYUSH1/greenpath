import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaLeaf, FaGift, FaCoins } from "react-icons/fa";

export default function EcoWallet() {
  const [ecoPoints, setEcoPoints] = useState(1250);
  const [carbonCredits, setCarbonCredits] = useState(42.3);

  return (
    <motion.div
      className="backdrop-blur-md bg-white/10 p-6 rounded-2xl shadow-lg border border-purple-400/20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-purple-300 flex items-center gap-2">
        <FaCoins /> Eco Wallet
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-purple-800/40 p-4 rounded-xl text-center border border-purple-500/30">
          <FaLeaf className="text-green-400 text-3xl mx-auto" />
          <p className="text-xl font-semibold mt-2">{ecoPoints} Points</p>
          <p className="text-sm text-purple-200 mt-1">Earned for eco actions</p>
        </div>

        <div className="bg-purple-800/40 p-4 rounded-xl text-center border border-purple-500/30">
          <FaGift className="text-yellow-300 text-3xl mx-auto" />
          <p className="text-xl font-semibold mt-2">{carbonCredits.toFixed(1)} kg CO₂</p>
          <p className="text-sm text-purple-200 mt-1">Carbon credits saved</p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        className="mt-6 w-full bg-gradient-to-r from-purple-600 to-indigo-500 py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-400 transition"
      >
        Redeem Rewards 🎁
      </motion.button>
    </motion.div>
  );
}
