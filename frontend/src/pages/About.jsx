import React from "react";
import { motion } from "framer-motion";
import { FiShield, FiTrendingDown, FiWind, FiCheckCircle, FiUsers, FiMapPin } from "react-icons/fi";
import greenImg from "../assets/green.png";

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const features = [
    {
      icon: <FiShield className="text-3xl text-green-600" />,
      title: "AI Safety Routing",
      desc: "Our advanced algorithms analyze real-time safety data to provide you with the most secure routes at any time of day."
    },
    {
      icon: <FiTrendingDown className="text-3xl text-green-600" />,
      title: "CO₂ Tracking",
      desc: "Monitor your environmental impact with precise carbon footprint calculations for every journey you take."
    },
    {
      icon: <FiWind className="text-3xl text-green-600" />,
      title: "Live Environmental Data",
      desc: "Stay informed with real-time air quality, weather, and street-level environmental conditions along your path."
    }
  ];

  const stats = [
    { label: "Routes Analyzed", value: "500K+", icon: <FiMapPin /> },
    { label: "Safety Accuracy", value: "99.2%", icon: <FiCheckCircle /> },
    { label: "CO₂ Reduced", value: "12.5 Tons", icon: <FiTrendingDown /> }
  ];

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#0F172A] py-20 px-6 overflow-hidden relative">
      {/* Floating Decorative Elements */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-10 text-green-200 text-6xl opacity-20 pointer-events-none"
      >
        🍃
      </motion.div>
      <motion.div 
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -10, 0]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 left-10 text-emerald-200 text-5xl opacity-20 pointer-events-none"
      >
        🌿
      </motion.div>

      <div className="max-w-7xl mx-auto">
        {/* Heading Section */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Reimagining Urban Mobility
          </h1>
          <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto italic">
            "Combining safety intelligence with environmental consciousness for a better tomorrow."
          </p>
        </motion.div>

        {/* Hero Content Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          {/* Image Side */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-4 bg-green-500/20 rounded-[2.5rem] blur-2xl group-hover:bg-green-500/30 transition-all duration-500" />
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/50"
            >
              <img 
                src={greenImg} 
                alt="GreenPath Mission" 
                className="w-full h-full object-cover transform transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          </motion.div>

          {/* Text Side */}
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm tracking-wide">
              OUR MISSION
            </div>
            <h2 className="text-4xl font-black leading-tight">
              Leading the way to <span className="text-green-600">Smarter, Safer</span> Cities.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              GreenPath was born from a simple yet powerful idea: urban navigation should be more than just finding the fastest route. We believe it should be about finding the safest path for you and the cleanest path for our planet.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              By leveraging advanced AI and real-time environmental data, we empower thousands of daily commuters to make choices that protect themselves and their communities.
            </p>
            <div className="flex gap-6 pt-4">
              <div className="flex items-center gap-2 font-bold text-green-600">
                <FiCheckCircle /> 100% Data Driven
              </div>
              <div className="flex items-center gap-2 font-bold text-green-600">
                <FiCheckCircle /> Community First
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Cards Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8 mb-32"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 bg-green-50 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-green-600 group-hover:text-white transition-colors duration-500">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-green-600 rounded-[3.5rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl shadow-green-600/30"
        >
          {/* Abstract background shape */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="grid md:grid-cols-3 gap-12 text-center relative z-10">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-4">
                <div className="text-4xl opacity-80 flex justify-center">{stat.icon}</div>
                <div className="text-5xl font-black tracking-tight">{stat.value}</div>
                <div className="text-green-100 font-bold text-lg uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
