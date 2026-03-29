// Profile.jsx
import React from "react";

const Profile = () => {
  return (
    <section className="p-6 md:p-12 bg-white/5 dark:bg-[#0f172a]/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl m-4 md:m-10">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-10 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Your Profile</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 p-8 rounded-2xl text-center shadow-lg border border-white/10 hover:border-yellow-500/50 hover:bg-white/10 transition-all duration-300 group">
          <h3 className="text-xl font-semibold mb-4 text-gray-300 group-hover:text-yellow-400">Eco Wallet 💰</h3>
          <p className="text-3xl font-bold dark:text-white">1500 GreenPoints</p>
        </div>
        <div className="bg-white/5 p-8 rounded-2xl text-center shadow-lg border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300 group">
          <h3 className="text-xl font-semibold mb-4 text-gray-300 group-hover:text-emerald-400">Daily Streak 🔥</h3>
          <p className="text-3xl font-bold dark:text-white">12 Days</p>
        </div>
        <div className="bg-white/5 p-8 rounded-2xl text-center shadow-lg border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-300 group">
          <h3 className="text-xl font-semibold mb-4 text-gray-300 group-hover:text-cyan-400">CO₂ Saved 🌿</h3>
          <p className="text-3xl font-bold dark:text-white">75 kg</p>
        </div>
      </div>
    </section>
  );
};

export default Profile;
