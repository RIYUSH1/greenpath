import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Intro = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/login');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#F8FAFC] overflow-hidden relative font-sans selection:bg-green-100">
            {/* --- LAYERED BACKGROUND --- */}
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 via-white to-blue-50/40"></div>
            
            {/* Floating Blurred Blobs (Apple Style) */}
            <motion.div 
                animate={{ 
                    x: [0, 100, 0], 
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1] 
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-200/20 rounded-full blur-[100px] pointer-events-none"
            />
            <motion.div 
                animate={{ 
                    x: [0, -80, 0], 
                    y: [0, 120, 0],
                    scale: [1, 1.3, 1] 
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[120px] pointer-events-none"
            />

            {/* Floating Subtle Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-green-400/30 rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ 
                            opacity: [0, 0.5, 0],
                            y: [0, -100],
                            x: [0, (Math.random() - 0.5) * 50]
                        }}
                        transition={{ 
                            duration: Math.random() * 5 + 5, 
                            repeat: Infinity, 
                            delay: Math.random() * 5 
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`
                        }}
                    />
                ))}
            </div>

            {/* --- MAIN GLASS CARD --- */}
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-2xl mx-4"
            >
                <div className="bg-white/60 backdrop-blur-2xl border border-white/40 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden group">
                    
                    {/* AI Glow Effect behind text */}
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 bg-gradient-to-r from-green-300/40 via-cyan-300/40 to-emerald-300/40 blur-[80px] pointer-events-none rounded-full"
                    />

                    {/* Heading */}
                    <div className="relative z-10">
                        <motion.h1 
                            className="text-5xl md:text-6xl font-bold mb-8 tracking-tight text-[#0F172A]"
                        >
                            Start Journey with <br/>
                            <motion.span 
                                whileHover={{ scale: 1.02 }}
                                className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-500 bg-clip-text text-transparent inline-block pb-2 cursor-default transition-all duration-300 relative"
                            >
                                GreenPath
                                <div className="absolute inset-0 bg-green-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </motion.span>
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-gray-600/80 text-lg md:text-xl mb-12 font-medium"
                        >
                            Enjoy safest and fastest route
                        </motion.p>
                        
                        {/* Premium Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <motion.button
                                onClick={handleStart}
                                whileHover={{ 
                                    scale: 1.05,
                                    boxShadow: "0 20px 40px -15px rgba(16, 185, 129, 0.4)" 
                                }}
                                whileTap={{ scale: 0.96 }}
                                className="relative group px-14 py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-emerald-600 rounded-2xl font-bold text-xl text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] overflow-hidden transition-all duration-300"
                            >
                                <span className="flex items-center gap-3 relative z-10">
                                    Start Journey
                                    <motion.svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-6 w-6" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </motion.svg>
                                </span>
                                
                                {/* Button Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Subtle bottom detail */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-10 text-[#0F172A] text-xs font-semibold tracking-[0.2em] uppercase"
            >
                Designed for Safety & Efficiency
            </motion.div>
        </div>
    );
};

export default Intro;

