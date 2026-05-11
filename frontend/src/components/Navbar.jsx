import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
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
    navigate("/login");
  };

  return (
    <nav className={`fixed top-0 left-0 w-full h-[70px] bg-white/90 backdrop-blur-md z-50 transition-all duration-300 ${scrolled ? "shadow-md" : "border-b border-gray-100"}`}>
      <div className="max-w-7xl mx-auto h-full flex justify-between items-center px-6 text-[#0F172A]">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <span className="font-bold text-white text-sm">GP</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-[#0F172A]">
            GreenPath
          </span>
        </Link>

        {/* LINKS */}
        <div className="hidden md:flex gap-8">
          {[
            { name: "Home", path: "/home" },
            { name: "Dashboard", path: "/dashboard" },
            { name: "Route Safety", path: "/route-safety" },
            { name: "Comparison", path: "/comparison" },
            { name: "About", path: "/about" },
          ].map((link) => (
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

        {/* ACTION */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/profile" className="text-[#475569] hover:text-[#0F172A] font-bold text-sm hidden sm:block px-4">
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-50 text-red-600 border border-red-100 px-5 py-2 rounded-xl font-bold text-sm hover:bg-red-100 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[#475569] hover:text-[#0F172A] font-bold text-sm hidden sm:block px-4">
                Login
              </Link>
              <Link to="/signup" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-105 active:scale-95 transition-all duration-300">
                Join Now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

