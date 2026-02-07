import { motion } from "framer-motion";
import { FaLeaf } from "react-icons/fa";

export default function WelcomeEcoModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
    >
      <div className="bg-[#1b2b34] text-white p-8 rounded-2xl w-[420px] text-center">
        <FaLeaf className="text-green-400 mx-auto mb-3" size={40} />
        <h2 className="text-2xl font-bold mb-2">Welcome to GreenRoute 🌍</h2>
        <p className="text-gray-300 text-sm">
          Choose cleaner routes, reduce CO₂, and travel smarter with real-time AQI.
        </p>
        <button
          onClick={onClose}
          className="mt-5 px-5 py-2 bg-green-500 rounded-lg font-semibold hover:bg-green-400"
        >
          Start Exploring
        </button>
      </div>
    </motion.div>
  );
}
