import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  // Sidebar open / close
  const [isOpen, setIsOpen] = useState(false);

  // Night mode
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Sync theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Auto close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white">

      <Sidebar
        isOpen={isOpen}
        toggle={() => setIsOpen(!isOpen)}
        isDark={isDark}
        toggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main content */}
      <main
        className={`transition-all duration-300 ease-in-out p-6
        ${isOpen ? "ml-56" : "ml-16"} md:ml-${isOpen ? "56" : "16"}`}
      >
        {children}
      </main>
    </div>
  );
}
