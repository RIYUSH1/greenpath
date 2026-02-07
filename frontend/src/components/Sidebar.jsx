import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaChartBar,
  FaBalanceScale,
  FaRoute,
  FaInfoCircle,
  FaUser,
  FaBars,
  FaMoon,
  FaSun,
} from "react-icons/fa";

export default function Sidebar({
  isOpen,
  toggle,
  isDark,
  toggleTheme,
}) {
  const linkClass =
    "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-700 transition-all";

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-50
      bg-green-900/95 backdrop-blur-md shadow-xl
      transition-all duration-300
      ${isOpen ? "w-56" : "w-16"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-green-700">
        {isOpen && <h1 className="font-bold text-lg">🌿 GreenWays</h1>}
        <button onClick={toggle}>
          <FaBars />
        </button>
      </div>

      {/* Nav */}
      <nav className="mt-6 space-y-2">
        <NavLink to="/" className={linkClass}>
          <FaHome />
          {isOpen && "Home"}
        </NavLink>

        <NavLink to="/dashboard" className={linkClass}>
          <FaChartBar />
          {isOpen && "Dashboard"}
        </NavLink>

        <NavLink to="/comparison" className={linkClass}>
          <FaBalanceScale />
          {isOpen && "Comparison"}
        </NavLink>

        <NavLink to="/route" className={linkClass}>
          <FaRoute />
          {isOpen && "Route Safety"}
        </NavLink>

        <NavLink to="/about" className={linkClass}>
          <FaInfoCircle />
          {isOpen && "About"}
        </NavLink>

        <NavLink to="/profile" className={linkClass}>
          <FaUser />
          {isOpen && "Profile"}
        </NavLink>
      </nav>

      {/* Bottom controls */}
      <div className="absolute bottom-4 w-full px-4 space-y-3">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-green-700"
        >
          {isDark ? <FaSun /> : <FaMoon />}
          {isOpen && (isDark ? "Light Mode" : "Night Mode")}
        </button>

        {isOpen && (
          <p className="text-center text-xs text-green-300 opacity-70">
            © 2025 GreenWays
          </p>
        )}
      </div>
    </aside>
  );
}
