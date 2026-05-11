import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// ================== PAGES ==================
import Intro from "./pages/Intro";
import Home from "./pages/Home/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import Comparison from "./pages/Comparison";
import About from "./pages/About";
import Profile from "./pages/Profile";
import RoutePage from "./pages/RoutePage";
import RouteComparison from "./pages/RouteComparison/RouteComparison";
import RouteSafety from "./pages/RouteSafety";

import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppContent() {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] font-sans selection:bg-green-100 transition-colors duration-500">
      {/* TOP NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT WRAPPER */}
      <div className="pt-20 px-6 max-w-7xl mx-auto">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Routes key={location.pathname} location={location}>
              {/* Intro Page Route */}
              <Route path="/" element={<Intro />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/route" element={<RoutePage />} />
              <Route path="/route-comparison" element={<RouteComparison />} />
              <Route path="/route-safety" element={<RouteSafety />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Fallback */}
              <Route path="*" element={<Home />} />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}




