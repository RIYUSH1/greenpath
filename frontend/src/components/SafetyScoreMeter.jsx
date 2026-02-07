import { useEffect, useState } from "react";

export default function SafetyScoreMeter({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score
  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += 0.1;
      if (start >= score) {
        start = score;
        clearInterval(interval);
      }
      setAnimatedScore(Number(start.toFixed(1)));
    }, 20);

    return () => clearInterval(interval);
  }, [score]);

  // Circle calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 10) * circumference;

  // Color logic
  let color = "#22c55e"; // green
  let label = "SAFE";

  if (score < 7 && score >= 4) {
    color = "#facc15"; // yellow
    label = "MODERATE";
  } else if (score < 4) {
    color = "#ef4444"; // red
    label = "UNSAFE";
  }

  return (
    <div className="flex flex-col items-center bg-green-950/60 backdrop-blur-xl p-6 rounded-2xl border border-green-700 shadow-xl">
      <h3 className="text-xl font-bold mb-4">
        🌙 AI Night Safety Score
      </h3>

      <svg width="180" height="180">
        {/* Background Circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="#064e3b"
          strokeWidth="14"
          fill="none"
        />

        {/* Progress Circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke={color}
          strokeWidth="14"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
        />
      </svg>

      <div className="text-center -mt-28">
        <p className="text-4xl font-extrabold">
          {animatedScore}
        </p>
        <p className="text-sm text-green-300">out of 10</p>
      </div>

      <span
        className="mt-4 px-4 py-1 rounded-full font-semibold"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
    </div>
  );
}
