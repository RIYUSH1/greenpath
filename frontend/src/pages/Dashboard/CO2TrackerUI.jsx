import React, { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { FaCar, FaWalking, FaHome, FaBook, FaChartBar, FaCog } from 'react-icons/fa';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

const CO2_PER_KM = 120; // grams

const CO2TrackerUI = () => {
  const [activeTab, setActiveTab] = useState('Weekly');
  
  // STEP 1: PREPARE ROUTE DATA (Mocking the load)
  const fastRoute = { distance: 12.4, time: 28 };
  const safeRoute = { distance: 15.8, time: 36 };

  // STEP 2: CALCULATE CO2
  const calculateCO2 = (distance) => distance * CO2_PER_KM;

  const fastCO2 = calculateCO2(fastRoute.distance);
  const safeCO2 = calculateCO2(safeRoute.distance);

  // STEP 3: CALCULATE SAVINGS
  // Note: Usually safe route might be longer but safer, or eco-friendly.
  // The user's rule: "Use safe route CO2 as primary metric. Fast route used for comparison."
  const savings = fastCO2 - safeCO2;

  // STEP 5: GENERATE WEEKLY DATA
  const generateWeeklyData = (base) => {
    return [
      base * 0.8,
      base * 1.1,
      base * 0.9,
      base * 1.2,
      base * 1.0,
      base * 1.3,
      base * 0.95
    ];
  };

  // STEP 4 & 6 & 7: CREATE STATE & INITIALIZE
  const [co2Data, setCo2Data] = useState({
    total: safeCO2,
    weekly: generateWeeklyData(safeCO2),
    activities: [
      {
        type: "Car ride (Fastest)",
        duration: "28 mins",
        co2: fastCO2,
        icon: <FaCar className="text-orange-500" />
      },
      {
        type: "Safe Route",
        duration: "36 mins",
        co2: safeCO2,
        icon: <FaWalking className="text-green-500" />
      }
    ]
  });

  // STEP 11: FORMAT CO2 DISPLAY
  const formatCO2 = (g) => {
    return (g / 1000).toFixed(1) + " kg";
  };

  // Doughnut Chart Data (Step 8)
  const doughnutData = {
    datasets: [
      {
        data: [co2Data.total, 20000 - co2Data.total],
        backgroundColor: ['#22c55e', '#e2e8f0'],
        borderWidth: 0,
        circumference: 360,
        rotation: 0,
        cutout: '75%',
      },
    ],
  };

  const doughnutOptions = {
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    maintainAspectRatio: false,
  };

  // Line Chart Data (Step 9)
  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'CO2 Emission',
        data: co2Data.weekly,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#22c55e',
        borderWidth: 3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => `Emitted: ${formatCO2(context.raw)}`
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { 
          color: '#94a3b8', 
          font: { size: 10 },
          callback: (value) => (value / 1000).toFixed(0) + 'k'
        },
      },
    },
  };

  return (
    <div className="flex justify-center items-center p-4 bg-slate-50 min-h-screen font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border border-slate-100">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-2xl font-bold text-slate-800">Hi, User 👋</h1>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
              U
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            Total emissions: <span className="text-green-600 font-semibold">{formatCO2(co2Data.total)}</span>
          </p>
        </div>

        {/* Donut Chart Section */}
        <div className="relative h-64 flex items-center justify-center">
          <div className="w-48 h-48">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
            <span className="text-slate-400 text-xs font-medium tracking-wider uppercase">CO2</span>
            <span className="text-3xl font-bold text-slate-800">{formatCO2(co2Data.total)}</span>
            <span className="text-slate-400 text-[10px]">Primary Metric</span>
          </div>
        </div>

        {/* Toggles */}
        <div className="px-8 mb-6">
          <div className="bg-slate-100 p-1 rounded-2xl flex">
            {['Weekly', 'Monthly', 'Yearly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === tab 
                    ? 'bg-green-500 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <div className="px-6 mb-8 h-40">
          <Line data={lineData} options={lineOptions} />
        </div>

        {/* Route Impact Section */}
        <div className="px-8 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-800">Route Comparison</h2>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Formula: 120g/km
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 group hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Fastest</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-slate-800">{(fastCO2 / 1000).toFixed(1)}</span>
                <span className="text-[10px] text-slate-500 font-medium">kg</span>
              </div>
              <div className="mt-2 h-1 w-full bg-orange-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 w-[100%]"></div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-3xl border border-green-100 group hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Safest</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-slate-800">{(safeCO2 / 1000).toFixed(1)}</span>
                <span className="text-[10px] text-slate-500 font-medium">kg</span>
              </div>
              <div className="mt-2 h-1 w-full bg-green-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[80%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities (Step 10) */}
        <div className="px-8 pb-24 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-800">Activity Logs</h2>
          </div>
          <div className="space-y-4">
            {co2Data.activities.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{item.type}</h3>
                    <p className="text-[10px] text-slate-400">{item.duration}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold text-slate-600`}>
                  {item.co2.toFixed(0)} g CO2
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-4">
          <NavIcon icon={<FaHome />} label="Home" active />
          <NavIcon icon={<FaBook />} label="Learn" />
          <NavIcon icon={<FaChartBar />} label="Stats" />
          <NavIcon icon={<FaCog />} label="Settings" />
        </div>
      </div>
    </div>
  );
};

const NavIcon = ({ icon, label, active }) => (
  <button className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-green-500' : 'text-slate-300 hover:text-slate-500'}`}>
    <span className="text-lg">{icon}</span>
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default CO2TrackerUI;
