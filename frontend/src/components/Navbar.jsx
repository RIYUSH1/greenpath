import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiUser, FiLogOut } from "react-icons/fi";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Route Safety", path: "/route-safety" },
    { name: "Comparison", path: "/comparison" },
    { name: "About", path: "/about" },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full h-[70px] bg-white/90 backdrop-blur-md z-50 transition-all duration-300 ${scrolled ? "shadow-md" : "border-b border-gray-100"}`}>
        <div className="max-w-[1550px] mx-auto h-full flex justify-between items-center px-6 md:px-12 text-[#0F172A]">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="font-bold text-white text-sm">GP</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-[#0F172A]">
              GreenPath
            </span>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="relative group py-2 text-sm font-bold text-[#475569] hover:text-[#16A34A] transition-colors"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#16A34A] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* DESKTOP ACTION & HAMBURGER */}
          <div className="flex items-center gap-4">
            
            {/* Desktop profile/action block */}
            <div className="hidden sm:flex items-center gap-4">
              {user ? (
                <>
                  <Link to="/profile" className="text-[#475569] hover:text-[#0F172A] font-bold text-sm px-4">
                    Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-50 text-red-600 border border-red-100 px-5 py-2 rounded-xl font-bold text-sm hover:bg-red-100 transition-all active:scale-[0.98]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-[#475569] hover:text-[#0F172A] font-bold text-sm px-4">
                    Login
                  </Link>
                  <Link to="/signup" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-105 active:scale-95 transition-all duration-300">
                    Join Now
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-slate-50 transition-colors focus:outline-none"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER PORTAL */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Translucent Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] md:hidden"
            />

            {/* Slide-in Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="fixed top-0 right-0 w-[300px] h-screen bg-white/95 backdrop-blur-lg shadow-2xl z-[60] border-l border-slate-100 flex flex-col p-8 md:hidden"
            >
              {/* Header drawer block */}
              <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-5">
                <span className="font-bold text-lg text-[#0F172A] tracking-tight">GP Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-[#475569] hover:bg-slate-50 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Navigation links stack */}
              <div className="flex flex-col gap-5 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-bold text-[#475569] hover:text-[#16A34A] px-4 py-3 rounded-xl hover:bg-green-50/50 transition-all"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Profile / Auth section stack in drawer */}
              <div className="border-t border-slate-100 pt-6 mt-auto space-y-4">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-sm font-bold text-[#475569] hover:text-[#0F172A] px-4 py-3 rounded-xl hover:bg-slate-50 transition-all"
                    >
                      <FiUser /> Profile Control
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 px-5 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition-all"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 border border-slate-200 text-[#475569] px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md shadow-green-500/10 hover:shadow-green-500/20 transition-all"
                    >
                      Join Now
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
