import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

// ================== PAGES ==================
import Home from "./pages/Home/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import Comparison from "./pages/Comparison/Comparison";
import About from "./pages/About";
import Profile from "./pages/Profile";
import RoutePage from "./pages/RoutePage";

// ================== INTRO ==================
import Intro from "./components/Intro";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [showIntro, setShowIntro] = useState(
    !localStorage.getItem("introSeen")
  );

  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark" || true // Defaulting to dark for modern SaaS feel
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const finishIntro = () => {
    localStorage.setItem("introSeen", "true");
    setShowIntro(false);
  };

  if (showIntro) {
    return <Intro onFinish={finishIntro} />;
  }

  return (
    <Router>
      <div className={`flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-[#0a0f18] dark:via-[#111827] dark:to-[#0d1627] text-gray-900 dark:text-gray-100 transition-colors duration-700`}>
        
        {/* SIDEBAR COMPONENT */}
        <Sidebar isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-x-hidden ml-20 transition-all duration-300">
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
    </Router>
  );
}
