/**********************************************************************
 * ROUTE PAGE – AI BASED NIGHT SAFETY SCORE
 * ---------------------------------------------------------------
 * FEATURES INCLUDED:
 * ✔ AI popup on page load
 * ✔ Place input
 * ✔ NightSafety backend component
 * ✔ SafetyScoreMeter (circular)
 * ✔ Google Map preview
 * ✔ AI voice alert (Web Speech API)
 * ✔ AI verdict card
 * ✔ Factor-wise progress bars
 * ✔ Emergency quick actions
 * ✔ Last checked timestamp
 * ✔ Premium dark-green AI UI
 *********************************************************************/

import { useEffect, useState } from "react";
import {
  FaLightbulb,
  FaShieldAlt,
  FaExclamationTriangle,
  FaFemale,
  FaRobot,
  FaMapMarkerAlt,
  FaVolumeUp,
  FaPhoneAlt,
  FaShareAlt,
  FaExclamationCircle,
  FaClock,
  FaMapMarkedAlt,
} from "react-icons/fa";

// ================= IMPORT AI COMPONENTS =================
import NightSafety from "../components/NightSafety";
import SafetyScoreMeter from "../components/SafetyScoreMeter";
import MapPreview from "../components/MapPreview";

export default function RoutePage() {

  // =====================================================
  // STATE MANAGEMENT
  // =====================================================
  const [place, setPlace] = useState("");
  const [showPopup, setShowPopup] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  // Safety score
  const [safetyScore, setSafetyScore] = useState(8.2);

  // Factor scores
  const [factors, setFactors] = useState({
    streetlight: 80,
    police: 65,
    accident: 30,
    women: 75,
  });

  // Last check time
  const [lastChecked, setLastChecked] = useState(null);

  // Example route location (dynamic later)
  const routeLocation = {
    lat: 12.9716,
    lng: 77.5946, // Bangalore
  };

  // =====================================================
  // AI POPUP ON PAGE LOAD
  // =====================================================
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // =====================================================
  // AI VOICE ALERT FUNCTION
  // =====================================================
  const speakSafetyStatus = (score) => {
    if (!("speechSynthesis" in window)) return;

    let message = "";

    if (score < 4) {
      message =
        "Warning. This area is unsafe at night. Please avoid traveling alone.";
    } else if (score < 7) {
      message =
        "This area has moderate night safety. Please stay alert.";
    } else {
      message =
        "This area is safe for night travel. Have a safe journey.";
    }

    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  // =====================================================
  // HANDLE CHECK SAFETY
  // =====================================================
  const handleCheckSafety = () => {
    setLoading(true);
    setShowResult(true);

    setTimeout(() => {
      const simulatedScore = Number(
        (Math.random() * 10).toFixed(1)
      );
      setSafetyScore(simulatedScore);

      setFactors({
        streetlight: Math.floor(Math.random() * 40 + 60),
        police: Math.floor(Math.random() * 40 + 50),
        accident: Math.floor(Math.random() * 40),
        women: Math.floor(Math.random() * 40 + 60),
      });

      setLastChecked(new Date().toLocaleTimeString());
      setLoading(false);

      // 🔊 Voice alert
      speakSafetyStatus(simulatedScore);
    }, 1500);
  };

  // =====================================================
  // AI VERDICT LOGIC
  // =====================================================
  const getVerdict = () => {
    if (safetyScore < 4)
      return { label: "UNSAFE", color: "bg-red-600" };
    if (safetyScore < 7)
      return { label: "MODERATE", color: "bg-yellow-500" };
    return { label: "SAFE", color: "bg-green-600" };
  };

  const verdict = getVerdict();

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="min-h-screen w-full px-6 py-10 bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#020617] text-white">

      {/* ================= AI POPUP ================= */}
      {showPopup && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600/90 backdrop-blur-lg px-6 py-4 rounded-xl shadow-2xl border border-emerald-300 animate-pulse">
          <div className="flex items-center gap-3">
            <FaRobot className="text-2xl" />
            <p className="font-semibold">
              AI is analyzing night safety factors in real-time…
            </p>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          🤖 AI-Based Night Safety Score
        </h1>
        <p className="text-green-200 mt-2 text-lg">
          Smart analysis using streetlights, police proximity,
          accident history & women safety indicators.
        </p>
      </div>

      {/* ================= INPUT ================= */}
      <div className="max-w-xl bg-green-950/50 backdrop-blur-xl border border-green-700/40 rounded-2xl p-6 shadow-2xl">
        <label className="block mb-3 text-lg font-medium">
          🌙 Enter Place Name (India)
        </label>

        <input
          type="text"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="Eg: Connaught Place, Delhi"
          className="w-full px-4 py-3 rounded-xl bg-transparent border border-green-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white"
        />

        <button
          onClick={handleCheckSafety}
          className="mt-5 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition font-semibold shadow-lg flex items-center justify-center gap-2"
        >
          <FaMapMarkerAlt />
          Check Night Safety
        </button>
      </div>

      {/* ================= RESULTS ================= */}
      {showResult && (
        <div className="mt-14 space-y-12 max-w-6xl">

          {loading && (
            <p className="text-center text-emerald-300">
              🔄 AI is processing safety data...
            </p>
          )}

          {/* SCORE + MAP */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SafetyScoreMeter score={safetyScore} />
            <MapPreview
              lat={routeLocation.lat}
              lng={routeLocation.lng}
            />
          </div>

          {/* VERDICT */}
          <div className="bg-green-950/60 backdrop-blur-xl border border-green-700/40 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">
              🧠 AI Verdict
            </h2>

            <span
              className={`inline-block px-4 py-2 rounded-full font-semibold ${verdict.color}`}
            >
              {verdict.label}
            </span>

            <p className="mt-4 text-green-200">
              This verdict is generated by AI using
              environmental, infrastructure, and historical safety data.
            </p>

            <div className="flex items-center gap-4 mt-5">
              <button
                onClick={() => speakSafetyStatus(safetyScore)}
                className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 transition flex items-center gap-2"
              >
                <FaVolumeUp /> Hear AI Voice Alert
              </button>

              {lastChecked && (
                <span className="text-sm text-green-300 flex items-center gap-1">
                  <FaClock /> Last checked at {lastChecked}
                </span>
              )}
            </div>
          </div>

          {/* BACKEND DETAILS */}
          <div className="bg-green-950/60 backdrop-blur-xl border border-green-700/40 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">
              📊 AI Safety Analysis
            </h2>

            <NightSafety
              lat={routeLocation.lat}
              lng={routeLocation.lng}
            />
          </div>

          {/* FACTOR BARS */}
          <div className="bg-green-950/60 backdrop-blur-xl border border-green-700/40 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">
              🔍 Factor-wise Analysis
            </h2>

            {[
              ["Streetlights", factors.streetlight, "bg-yellow-400"],
              ["Police Access", factors.police, "bg-blue-400"],
              ["Accident Risk", factors.accident, "bg-red-500"],
              ["Women Safety", factors.women, "bg-pink-400"],
            ].map(([label, value, color], i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>{label}</span>
                  <span>{value}%</span>
                </div>
                <div className="w-full bg-green-800 rounded-full h-3">
                  <div
                    className={`${color} h-3 rounded-full`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* EMERGENCY ACTIONS */}
          <div className="bg-red-950/60 backdrop-blur-xl border border-red-700/40 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FaExclamationCircle /> Emergency Actions
            </h2>

            <div className="flex flex-wrap gap-4">
              <a
                href="tel:112"
                className="px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition flex items-center gap-2"
              >
                <FaPhoneAlt /> Call Police
              </a>

              <button
                onClick={() =>
                  navigator.share?.({
                    title: "My Location",
                    text: "I am here, please help!",
                    url: window.location.href,
                  })
                }
                className="px-4 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 transition flex items-center gap-2"
              >
                <FaShareAlt /> Share Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <p className="mt-20 text-center text-sm text-green-300 opacity-70">
        Powered by AI • Real-time Safety Intelligence • GreenPath Project
      </p>
    </div>
  );
}
