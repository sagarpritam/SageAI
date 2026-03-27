"use client";

import { useState, useEffect } from "react";
import { TrendingUp, PieChart, Loader2 } from "lucide-react";
import axios from "axios";

interface TrendPoint {
  date: string;
  count: number;
  avgRisk: number;
}

interface AnalyticsData {
  trend: TrendPoint[];
  severityCounts: { Critical: number; High: number; Medium: number; Low: number };
  totalCompleted: number;
}

const sevColors: Record<string, string> = {
  Critical: "bg-red-600",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-emerald-500",
};

export function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/analytics")
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const maxCount = Math.max(...data.trend.map((t) => t.count), 1);
  const maxRisk = 100;
  const total = Object.values(data.severityCounts).reduce((a, b) => a + b, 0);

  // SVG chart dimensions
  const chartW = 500;
  const chartH = 160;
  const barW = chartW / data.trend.length;

  // Build risk line path
  const riskPoints = data.trend
    .map((t, i) => {
      const x = i * barW + barW / 2;
      const y = chartH - (t.avgRisk / maxRisk) * chartH;
      return `${x},${y}`;
    })
    .join(" ");

  // Donut chart
  const donutR = 60;
  const donutStroke = 16;
  const circumference = 2 * Math.PI * donutR;
  let offset = 0;

  return (
    <div className="space-y-6">
      {/* Scan Trend + Risk Line */}
      <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> 7-Day Scan Trend
        </h3>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full max-w-[600px]" preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
              <line
                key={pct}
                x1={0} y1={chartH - pct * chartH}
                x2={chartW} y2={chartH - pct * chartH}
                stroke="#27272a" strokeWidth={1}
              />
            ))}

            {/* Bars — scan count */}
            {data.trend.map((t, i) => {
              const barH = (t.count / maxCount) * chartH;
              return (
                <g key={i}>
                  <rect
                    x={i * barW + barW * 0.15}
                    y={chartH - barH}
                    width={barW * 0.7}
                    height={barH}
                    rx={4}
                    fill="url(#barGrad)"
                    opacity={0.8}
                  />
                  {/* Count label */}
                  {t.count > 0 && (
                    <text
                      x={i * barW + barW / 2}
                      y={chartH - barH - 6}
                      textAnchor="middle"
                      fill="#10b981"
                      fontSize={11}
                      fontWeight="bold"
                    >
                      {t.count}
                    </text>
                  )}
                  {/* Date label */}
                  <text
                    x={i * barW + barW / 2}
                    y={chartH + 16}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize={10}
                  >
                    {t.date.slice(5)}
                  </text>
                </g>
              );
            })}

            {/* Risk line overlay */}
            <polyline
              points={riskPoints}
              fill="none"
              stroke="#f97316"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {data.trend.map((t, i) => (
              <circle
                key={`dot-${i}`}
                cx={i * barW + barW / 2}
                cy={chartH - (t.avgRisk / maxRisk) * chartH}
                r={t.avgRisk > 0 ? 4 : 0}
                fill="#f97316"
                stroke="#18181b"
                strokeWidth={2}
              />
            ))}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="flex items-center gap-6 mt-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Scan Count</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-orange-500 inline-block" /> Avg Risk Score</span>
        </div>
      </div>

      {/* Severity Donut */}
      <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <PieChart className="w-4 h-4 text-emerald-400" /> Severity Distribution
        </h3>
        <div className="flex items-center gap-8 flex-wrap">
          <svg width={160} height={160} viewBox="0 0 160 160">
            {total === 0 ? (
              <circle cx={80} cy={80} r={donutR} fill="none" stroke="#27272a" strokeWidth={donutStroke} />
            ) : (
              Object.entries(data.severityCounts).map(([level, count]) => {
                const pct = count / total;
                const dash = pct * circumference;
                const segment = (
                  <circle
                    key={level}
                    cx={80} cy={80} r={donutR}
                    fill="none"
                    stroke={sevColors[level]}
                    strokeWidth={donutStroke}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                  />
                );
                offset += dash;
                return segment;
              })
            )}
            <text x={80} y={76} textAnchor="middle" fill="white" fontSize={24} fontWeight="bold">
              {total}
            </text>
            <text x={80} y={94} textAnchor="middle" fill="#71717a" fontSize={11}>
              scans
            </text>
          </svg>

          <div className="space-y-2">
            {Object.entries(data.severityCounts).map(([level, count]) => (
              <div key={level} className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${sevColors[level]}`} />
                <span className="text-sm text-zinc-300 w-16">{level}</span>
                <span className="text-sm font-bold text-white">{count}</span>
                <span className="text-xs text-zinc-500">({total ? Math.round((count / total) * 100) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
