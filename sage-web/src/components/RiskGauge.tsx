"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number;
  level: string;
  totalFindings: number;
}

function getColor(score: number) {
  if (score >= 70) return { stroke: "#EF4444", glow: "rgba(239,68,68,0.4)", label: "text-red-400" };
  if (score >= 40) return { stroke: "#F97316", glow: "rgba(249,115,22,0.4)", label: "text-orange-400" };
  if (score >= 20) return { stroke: "#EAB308", glow: "rgba(234,179,8,0.4)", label: "text-yellow-400" };
  return { stroke: "#22C55E", glow: "rgba(34,197,94,0.4)", label: "text-emerald-400" };
}

export function RiskGauge({ score, level, totalFindings }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const colors = getColor(score);

  // Animate the number counting up
  useEffect(() => {
    let frame: number;
    const duration = 1500;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * score) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center gap-4"
    >
      <div className="relative w-52 h-52">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          {/* Background track */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="12"
          />
          {/* Animated score arc */}
          <motion.circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 8px ${colors.glow})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-black tabular-nums ${colors.label}`}>
            {animatedScore}
          </span>
          <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            / 100
          </span>
        </div>
      </div>

      {/* Labels */}
      <div className="text-center space-y-1">
        <span className={`text-lg font-bold font-mono ${colors.label}`}>
          {level} Risk
        </span>
        <p className="text-sm text-zinc-500 font-mono">
          {totalFindings} finding{totalFindings !== 1 ? "s" : ""} detected
        </p>
      </div>
    </motion.div>
  );
}
