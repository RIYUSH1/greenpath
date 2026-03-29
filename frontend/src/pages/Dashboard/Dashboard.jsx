import { useEffect, useState } from "react";
import {
  FaLeaf,
  FaFire,
  FaMedal,
  FaTree,
  FaBolt,
  FaChartLine,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useRef } from "react";


/* ================= MOCK API ================= */

const fetchEcoData = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        carbon: 60.29,
        points: 1420,
        streak: 7,
        trees: 5,
        energy: 18.2,
        rank: "Gold",
        weekly: [
          { day: "Mon", co2: 4.2 },
          { day: "Tue", co2: 5.1 },
          { day: "Wed", co2: 6.0 },
          { day: "Thu", co2: 6.8 },
          { day: "Fri", co2: 7.2 },
          { day: "Sat", co2: 8.1 },
          { day: "Sun", co2: 8.6 },
        ],
      });
    }, 1200);
  });

/* ================= CONFETTI ================= */

function Confetti() {
  useEffect(() => {
    const canvas = document.getElementById("confetti");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 6 + 2,
      speed: Math.random() * 3 + 1,
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#34d399";
      pieces.forEach((p) => {
        ctx.fillRect(p.x, p.y, p.size, p.size);
        p.y += p.speed;
        if (p.y > canvas.height) p.y = 0;
      });
      frame = requestAnimationFrame(draw);
    };
    draw();

    setTimeout(() => cancelAnimationFrame(frame), 2500);
  }, []);

  return (
    <canvas
      id="confetti"
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}

/* ================= MAIN ================= */
export default function EcoDashboard() {
  const [data, setData] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWakingMessage, setShowWakingMessage] = useState(false);
  const loadingTimerRef = useRef(null);


  useEffect(() => {
    setShowWakingMessage(false);
    loadingTimerRef.current = setTimeout(() => {
      setShowWakingMessage(true);
    }, 5000);

    fetchEcoData().then((res) => {
      setData(res);
      setShowWakingMessage(false);
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);

      if (res.streak >= 7) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    });

    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);


  if (!data) {
    return (
      <LoadingOverlay 
        message={showWakingMessage ? "Waking Server... Preparing Dashboard" : "Syncing Sustainability Data..."} 
        showWakingMessage={showWakingMessage} 
      />
    );
  }


  return (
    <>
      {showConfetti && <Confetti />}

      <div className="min-h-screen transition-all duration-500
        bg-transparent text-gray-900 dark:text-white px-4 md:px-6 py-6 md:py-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 md:mb-10">
          <h1 className="text-xl md:text-3xl font-extrabold flex items-center gap-2">
            🌱 Eco Dashboard
          </h1>
        </div>


        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Stat icon={<FaLeaf />} title="Carbon Saved" value={`${data.carbon} kg`} />
          <Stat icon={<FaMedal />} title="Eco Points" value={data.points} />
          <Stat icon={<FaFire />} title="Streak" value={`${data.streak} Days 🔥`} />
          <Stat icon={<FaTree />} title="Trees Equivalent" value={`${data.trees} 🌳`} />
          <Stat icon={<FaBolt />} title="Energy Saved" value={`${data.energy} kWh ⚡`} />
          <Stat icon={<FaChartLine />} title="Eco Rank" value={`${data.rank} 🏆`} />
        </div>

        {/* CHART */}
        <div className="bg-white/20 dark:bg-white/10 backdrop-blur-lg
          rounded-[2rem] p-4 md:p-8 shadow-xl mb-10 overflow-hidden">
          <h2 className="text-lg md:text-xl font-bold mb-6">
            Weekly CO₂ Savings
          </h2>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weekly} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#34d399' }}
                />
                <Line
                  type="monotone"
                  dataKey="co2"
                  stroke="#34d399"
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#34d399', strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* GOALS */}
        <div className="bg-white/20 dark:bg-white/10 backdrop-blur-lg
          rounded-[2rem] p-6 md:p-8 shadow-xl mb-10">
          <h2 className="text-lg md:text-xl font-bold mb-6">
            Monthly Goals
          </h2>
          <Progress label="Reduce CO₂" percent={75} />
          <Progress label="Eco Routes Used" percent={60} />
          <Progress label="Night Safe Routes" percent={90} />
        </div>


        {/* TIP */}
        <div className="bg-white/20 dark:bg-white/10 backdrop-blur-lg
          rounded-3xl p-6 shadow-xl text-center">
          <h3 className="font-bold mb-2">
            💡 Eco Tip
          </h3>
          <p className="text-sm opacity-90">
            Using well-lit routes at night improves safety and reduces emergency
            fuel usage.
          </p>
        </div>
      </div>
    </>
  );
}

/* ================= COMPONENTS ================= */

function Stat({ icon, title, value }) {
  return (
    <div className="
      bg-white/20 dark:bg-white/10 backdrop-blur-lg
      rounded-2xl p-6 shadow-lg
      hover:scale-105 transition
    ">
      <div className="text-emerald-200 text-3xl mb-3">{icon}</div>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function Progress({ label, percent }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1 text-sm">
        <span>{label}</span>
        <span className="font-semibold">{percent}%</span>
      </div>
      <div className="w-full h-3 bg-white/30 rounded-full">
        <div
          className="h-full bg-emerald-300 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
