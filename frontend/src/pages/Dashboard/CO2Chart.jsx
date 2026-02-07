import React from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function CO2Chart() {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "CO₂ Saved (kg)",
        data: [2, 3.4, 4.2, 5.6, 6.8, 7.5, 8.1],
        borderColor: "#c084fc",
        backgroundColor: "rgba(192, 132, 252, 0.25)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: { color: "#d8b4fe" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#e9d5ff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "#e9d5ff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <motion.div
      className="backdrop-blur-md bg-white/10 rounded-2xl p-6 shadow-lg border border-purple-400/20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-purple-300">CO₂ Impact Chart</h2>
      <Line data={data} options={options} />
      <p className="mt-4 text-purple-200 text-sm">
        📈 You’ve reduced your emissions by 18% this week. Keep going!
      </p>
    </motion.div>
  );
}
