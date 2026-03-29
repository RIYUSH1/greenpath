import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

// ================== PAGES ==================
import Home from "./pages/Home/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import Comparison from "./pages/ComparisonAnalysis/Comparison";
import About from "./pages/About";
import Profile from "./pages/Profile";
import RoutePage from "./pages/RoutePage";
import RouteComparison from "./pages/RouteComparison/RouteComparison";


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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      <div className={`flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-[#0a0f18] dark:via-[#111827] dark:to-[#0d1627] text-gray-900 dark:text-gray-100 transition-colors duration-700 overflow-x-hidden`}>
        
        {/* SIDEBAR COMPONENT */}
        <Sidebar 
          isDark={isDark} 
          toggleTheme={() => setIsDark(!isDark)} 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* MOBILE OVERLAY */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64">
          {/* MOBILE NAVBAR */}
          <header className="lg:hidden flex items-center justify-between p-4 sticky top-0 z-30 bg-white/10 dark:bg-black/80 backdrop-blur-lg border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                <span className="font-bold text-white text-xs">G</span>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
                Greenpath
              </span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </header>

          <div className="flex-1 w-full max-w-full overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/route" element={<RoutePage />} />
              <Route path="/route-comparison" element={<RouteComparison />} />

              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
