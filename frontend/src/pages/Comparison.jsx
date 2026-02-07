// Comparison.jsx
import React from "react";
import { FaBus, FaBicycle, FaTrain } from "react-icons/fa";

const Comparison = () => {
  const data = [
    { mode: "Bus", co2: 20, icon: <FaBus className="text-yellow-400 text-3xl"/> },
    { mode: "Train", co2: 15, icon: <FaTrain className="text-green-400 text-3xl"/> },
    { mode: "Bike", co2: 5, icon: <FaBicycle className="text-blue-400 text-3xl"/> },
  ];

  return (
    <section className="p-6 bg-purple-600 text-white rounded-2xl shadow-xl m-4">
      <h2 className="text-3xl font-bold mb-6 text-yellow-300">Comparison</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((item) => (
          <div
            key={item.mode}
            className="bg-purple-800 p-4 rounded-xl text-center hover:scale-105 transition-transform"
          >
            <div className="flex justify-center mb-2">{item.icon}</div>
            <h3 className="text-xl font-semibold">{item.mode}</h3>
            <p className="mt-2">CO₂ Emission: {item.co2} kg/km</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Comparison;
