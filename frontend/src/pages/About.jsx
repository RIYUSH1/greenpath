// About.jsx
import React from "react";

const About = () => {
  return (
    <section className="p-8 bg-gradient-to-r from-purple-700 to-purple-500 text-white rounded-2xl shadow-xl m-4">
      <h2 className="text-3xl font-bold mb-4 text-yellow-300">About GreenWays</h2>
      <p className="text-lg mb-4">
        GreenWays is your ultimate eco-friendly transit companion! 🌱  
        Track real-time buses, trains, and bikes, calculate your carbon savings, 
        and participate in challenges to make your daily commute greener.
      </p>
      <p className="text-lg">
        Our platform combines live transit data with gamification and eco-wallet rewards, 
        helping you make smarter, sustainable travel choices while reducing your carbon footprint.
      </p>
    </section>
  );
};

export default About;
