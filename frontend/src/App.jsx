/******************************************************************
 * APP.JSX
 * ---------------------------------------------------------------
 * NOTE:
 * - No code removed
 * - Existing sidebar preserved
 * - Layout.jsx now controls spacing
 ******************************************************************/

import React, { useState } from "react";
import Layout from "./components/Layout";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import {
  FaUser,
  FaInfoCircle,
  FaChartBar,
  FaHome,
  FaBalanceScale,
  FaRoute,
} from "react-icons/fa";

// ================== PAGES ==================
import Home from "./pages/Home/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import Comparison from "./pages/Comparison/Comparison";
import About from "./pages/About";
import Profile from "./pages/Profile";
import RoutePage from "./pages/RoutePage";

// ================== INTRO ==================
import Intro from "./components/Intro";

export default function App() {
  // ================= INTRO STATE =================
  const [showIntro, setShowIntro] = useState(
    !localStorage.getItem("introSeen")
  );

  const finishIntro = () => {
    localStorage.setItem("introSeen", "true");
    setShowIntro(false);
  };

  // ================= SHOW INTRO FIRST =================
  if (showIntro) {
    return <Intro onFinish={finishIntro} />;
  }

  // ================= MAIN APPLICATION =================
  return (
    <Router>

      {/* ===================================================
          LAYOUT WRAPPER (NEW – DOES NOT REMOVE ANY CODE)
         =================================================== */}
      <Layout>

        <div className="flex min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white">

          {/* ================= SIDEBAR (PRESERVED) ================= */}
          <nav className="w-64 bg-green-950/40 backdrop-blur-md p-6 flex flex-col justify-between border-r border-green-700/40 shadow-xl">
            <div>
              <h1 className="text-3xl font-extrabold text-green-300 mb-10 text-center">
                🌿 GreenWays
              </h1>

              <ul className="space-y-5">
                <li>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                        isActive
                          ? "bg-green-600 text-white shadow-lg"
                          : "text-green-200 hover:bg-green-700/40"
                      }`
                    }
                  >
                    <FaHome /> Home
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                        isActive
                          ? "bg-green-600 text-white shadow-lg"
                          : "text-green-200 hover:bg-green-700/40"
                      }`
                    }
                  >
                    <FaChartBar /> Dashboard
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/comparison"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                        isActive
                          ? "bg-green-600 text-white shadow-lg"
                          : "text-green-200 hover:bg-green-700/40"
                      }`
                    }
                  >
                    <FaBalanceScale /> Comparison
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/route"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                        isActive
                          ? "bg-green-600 text-white shadow-lg"
                          : "text-green-200 hover:bg-green-700/40"
                      }`
                    }
                  >
                    <FaRoute /> Route Safety
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                        isActive
                          ? "bg-green-600 text-white shadow-lg"
                          : "text-green-200 hover:bg-green-700/40"
                      }`
                    }
                  >
                    <FaInfoCircle /> About
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                        isActive
                          ? "bg-green-600 text-white shadow-lg"
                          : "text-green-200 hover:bg-green-700/40"
                      }`
                    }
                  >
                    <FaUser /> Profile
                  </NavLink>
                </li>
              </ul>
            </div>

            <div className="mt-10 text-center text-green-300 text-sm opacity-80">
              <p>© 2025 GreenWays</p>
              <p className="text-xs italic">
                EcoSmart Travel & Sustainability
              </p>
            </div>
          </nav>

          {/* ================= MAIN CONTENT ================= */}
          <main className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/route" element={<RoutePage />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>

        </div>
      </Layout>
    </Router>
  );
}
