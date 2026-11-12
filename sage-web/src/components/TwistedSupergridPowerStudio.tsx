'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, Cpu, AlertTriangle, Sparkles } from 'lucide-react';

interface AndreevArray {
  array_id: string;
  location: string;
  default_twist_millideg: number;
  chern_flat_band: number;
  base_output_gw: number;
  base_efficiency_pct: number;
  status: string;
}

interface HarvestResult {
  array_id: string;
  location: string;
  chern_flat_band: number;
  twist_angle_millideg: number;
  quantum_metric_gain: number;
  conversion_efficiency_pct: number;
  net_grid_output_gw: number;
  magic_angle_pairing_locked: boolean;
  zero_fossil_carbon: boolean;
  zero_fissile_waste: boolean;
  status: string;
  timestamp: number;
}

export default function TwistedSupergridPowerStudio() {
  const [arrays, setArrays] = useState<AndreevArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>('MATTG-ANDREEV-ARRAY-01');
  const [twistAngle, setTwistAngle] = useState<number>(1560);
  const [metricGain, setMetricGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HarvestResult | null>(null);

  const fetchArrays = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/twisted-bilayer-supergrid/arrays');
      const data = (await res.json().catch(() => ({}))) as {
        arrays?: AndreevArray[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load twisted-trilayer Andreev arrays');
      }
      if (data.arrays) {
        setArrays(data.arrays);
        if (data.arrays.length > 0) {
          setSelectedArray((prev) => prev || data.arrays![0].array_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to load twisted-trilayer Andreev arrays'
      );
    }
  }, []);

  useEffect(() => {
    fetchArrays();
  }, [fetchArrays]);

  const handleHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/twisted-bilayer-supergrid/harvest-andreev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          array_id: selectedArray,
          twist_angle_millideg: twistAngle,
          quantum_metric_gain: metricGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HarvestResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Andreev supergrid harvest failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Andreev supergrid harvest failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-300">
              Option B Wave 41: Planetary Magic-Angle Twisted-Trilayer Andreev Supergrid
            </h2>
            <p className="text-sm text-slate-400">
              Flat-band quantum-metric pairing &amp; zero-dissipation Andreev retro-reflection HVDC corridors
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchArrays}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Arrays</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {arrays.map((a) => (
          <button
            type="button"
            key={a.array_id}
            onClick={() => setSelectedArray(a.array_id)}
            aria-pressed={selectedArray === a.array_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedArray === a.array_id
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-cyan-400">
                {a.array_id}
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                {a.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{a.location}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                ChernBand={a.chern_flat_band} | Twist={a.default_twist_millideg} mdeg
              </div>
              <div>Base Efficiency: {a.base_efficiency_pct}%</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Magic-Angle Twist (millideg)
            </label>
            <input
              type="number"
              min={900}
              max={2400}
              step={10}
              value={twistAngle}
              onChange={(e) => setTwistAngle(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Quantum-Metric Pairing Gain
            </label>
            <input
              type="number"
              min={0.8}
              max={2.5}
              step={0.05}
              value={metricGain}
              onChange={(e) => setMetricGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleHarvest}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-cyan-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {loading
              ? 'Synchronizing Andreev Supergrid...'
              : 'Harvest Twisted-Trilayer Andreev Supergrid Baseload'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-cyan-950/20 border border-cyan-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/50 pb-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Andreev Supergrid Telemetry ({telemetry.array_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Net Baseload Output</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.net_grid_output_gw} GW
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Conversion Efficiency</div>
              <div className="text-base font-bold text-blue-300">
                {telemetry.conversion_efficiency_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Chern Flat Band</div>
              <div className="text-base font-bold text-emerald-300">
                C={telemetry.chern_flat_band}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Zero Carbon / Waste</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.zero_fossil_carbon && telemetry.zero_fissile_waste ? 'VERIFIED' : 'CHECK'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

