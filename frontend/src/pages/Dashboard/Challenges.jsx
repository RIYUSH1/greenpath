import React from "react";
import { motion } from "framer-motion";
import { FaTree, FaBicycle, FaRecycle, FaWater } from "react-icons/fa";

export default function Challenges() {
  const challenges = [
    {
      id: 1,
      title: "Plant 5 Trees 🌱",
      icon: <FaTree className="text-green-400 text-3xl" />,
      progress: 70,
      description: "Contribute to reforestation and earn eco points!",
      reward: "+150 Eco Points",
    },
    {
      id: 2,
      title: "Cycle to Work 🚴‍♂️",
      icon: <FaBicycle className="text-yellow-400 text-3xl" />,
      progress: 45,
      description: "Avoid fuel emissions for at least 3 days this week.",
      reward: "+200 Eco Points",
    },
    {
      id: 3,
      title: "Recycle Plastic ♻️",
      icon: <FaRecycle className="text-blue-400 text-3xl" />,
      progress: 90,
      description: "Recycle at least 2kg of plastic waste this week.",
      reward: "+100 Eco Points",
    },
    {
      id: 4,
      title: "Save Water 💧",
      icon: <FaWater className="text-cyan-400 text-3xl" />,
      progress: 60,
      description: "Limit water use to under 150L per day.",
      reward: "+80 Eco Points",
    },
  ];

  return (
    <motion.div
      className="backdrop-blur-md bg-white/10 p-6 rounded-2xl shadow-lg border border-purple-400/20"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-purple-300">🌿 Eco Challenges</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {challenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            className="p-5 rounded-2xl bg-purple-800/40 border border-purple-500/30 hover:bg-purple-700/40 transition cursor-pointer"
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-center gap-4 mb-3">
              {challenge.icon}
              <div>
                <h3 className="text-lg font-semibold text-purple-100">{challenge.title}</h3>
                <p className="text-sm text-purple-200">{challenge.description}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-purple-900/50 rounded-full h-3 mt-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full"
                style={{ width: `${challenge.progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${challenge.progress}%` }}
                transition={{ duration: 1 }}
              ></motion.div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <p className="text-sm text-purple-200">
                Progress: {challenge.progress}%
              </p>
              <span className="text-xs bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full">
                {challenge.reward}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
