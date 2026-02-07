// Profile.jsx
import React from "react";

const Profile = () => {
  return (
    <section className="p-8 bg-gradient-to-r from-purple-800 to-purple-600 text-white rounded-2xl shadow-xl m-4">
      <h2 className="text-3xl font-bold mb-6 text-yellow-300">Your Profile</h2>
      <div className="flex flex-col md:flex-row justify-around items-center gap-6">
        <div className="bg-purple-700 p-4 rounded-xl w-64 text-center shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Eco Wallet 💰</h3>
          <p className="text-2xl font-bold">1500 GreenPoints</p>
        </div>
        <div className="bg-purple-700 p-4 rounded-xl w-64 text-center shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Daily Streak 🔥</h3>
          <p className="text-2xl font-bold">12 Days</p>
        </div>
        <div className="bg-purple-700 p-4 rounded-xl w-64 text-center shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">CO₂ Saved 🌿</h3>
          <p className="text-2xl font-bold">75 kg</p>
        </div>
      </div>
    </section>
  );
};

export default Profile;
