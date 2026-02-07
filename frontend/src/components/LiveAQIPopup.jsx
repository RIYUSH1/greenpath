import { useEffect } from "react";
import { motion } from "framer-motion";
import { FaWind } from "react-icons/fa";

export default function LiveAQIPopup({ city, aqi, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!aqi) return null;

  const color =
    aqi <= 2 ? "bg-green-600" :
    aqi === 3 ? "bg-yellow-500" :
    "bg-red-600";

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed top-6 right-6 z-50 ${color} text-black p-5 rounded-xl shadow-xl w-80`}
    >
      <div className="flex items-center gap-3">
        <FaWind size={28} />
        <div>
          <h3 className="font-bold">Live AQI Alert</h3>
          <p className="text-sm">{city}</p>
          <p className="text-lg font-semibold">AQI: {aqi}</p>
        </div>
      </div>
    </motion.div>
  );
}
