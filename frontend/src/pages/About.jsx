// About.jsx
import React from "react";

const About = () => {
  return (
    <section className="p-6 md:p-12 bg-white/5 dark:bg-[#0f172a]/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl m-4 md:m-10">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">About Greenpath</h2>
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <p className="text-base md:text-xl leading-relaxed">
          Greenpath is your ultimate eco-friendly transit companion! 🌱  
          Track real-time buses, trains, and bikes, calculate your carbon savings, 
          and participate in challenges to make your daily commute greener.
        </p>
        <p className="text-base md:text-xl leading-relaxed">
          Our platform combines live transit data with gamification and eco-wallet rewards, 
          helping you make smarter, sustainable travel choices while reducing your carbon footprint.
        </p>
      </div>
    </section>
  );
};

export default About;
