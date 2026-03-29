import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiHome,
  FiPieChart,
  FiLayers,
  FiMap,
  FiInfo,
  FiUser,
  FiMoon,
  FiSun,
  FiX,
  FiActivity,
} from "react-icons/fi";


export default function Sidebar({ isDark, toggleTheme, isOpen, setIsOpen }) {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: FiHome },
    { name: "Dashboard", path: "/dashboard", icon: FiPieChart },
    { name: "Eco Compare", path: "/route-comparison", icon: FiActivity },

    { name: "Comparison", path: "/comparison", icon: FiLayers },

    { name: "Route Safety", path: "/route", icon: FiMap },
    { name: "About", path: "/about", icon: FiInfo },
    { name: "Profile", path: "/profile", icon: FiUser },
  ];

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location, setIsOpen]);

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 z-50 
        bg-white/95 dark:bg-[#0a0f18]/95 backdrop-blur-2xl border-r border-white/30 dark:border-white/5
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)]
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        flex flex-col`}
    >
      {/* Logo Header */}
      <div className="flex items-center h-20 px-6 overflow-hidden shrink-0 mt-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
          <span className="font-bold text-white leading-none">G</span>
        </div>
        <span 
          className="ml-4 text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent whitespace-nowrap"
        >
          Greenpath
        </span>

        {/* Close button for mobile */}
        {isOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            className="ml-auto lg:hidden p-2 text-gray-500 hover:text-cyan-500 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center h-12 px-3 rounded-xl transition-all duration-300 group
              ${isActive ? "bg-black/5 dark:bg-white/5" : "hover:bg-black/5 dark:hover:bg-white/[0.04]"}`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active/Hover sliding indicator */}
                <div 
                  className={`absolute left-0 w-1 h-6 rounded-r-full transition-all duration-300
                    ${isActive ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] dark:bg-cyan-400 dark:shadow-[0_0_10px_rgba(34,211,238,0.8)]" : "bg-transparent group-hover:bg-purple-400"}`}
                />
                
                {/* Active Glow Background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 dark:from-cyan-400/10 to-transparent rounded-xl pointer-events-none" />
                )}

                <item.icon 
                  className={`w-6 h-6 shrink-0 transition-transform duration-300 
                  ${isActive ? "text-cyan-600 dark:text-cyan-400 scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "text-gray-600 dark:text-gray-400 group-hover:scale-110 group-hover:text-purple-600 dark:group-hover:text-purple-400"}
                  ml-1`} 
                />
                
                <span 
                  className={`ml-4 font-medium transition-all duration-300 whitespace-nowrap
                  ${isActive ? "text-cyan-700 dark:text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.2)] dark:drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]" : "text-gray-700 dark:text-gray-400 group-hover:text-purple-700 dark:group-hover:text-purple-400"}`}
                >
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Controls */}
      <div className="p-4 shrink-0 overflow-hidden mb-2">
        <button
          onClick={toggleTheme}
          className="flex items-center w-full h-12 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/[0.04] transition-colors duration-300 group"
        >
          {isDark ? (
            <FiSun className="w-6 h-6 shrink-0 text-yellow-400 ml-1 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
          ) : (
            <FiMoon className="w-6 h-6 shrink-0 text-blue-600 ml-1 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
          )}
          
          <span 
            className="ml-4 font-medium text-gray-700 dark:text-gray-400 whitespace-nowrap transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-yellow-400"
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
      </div>
    </aside>
  );
}
