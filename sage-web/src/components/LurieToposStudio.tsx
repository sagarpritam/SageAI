"use client";

import React, { useState, useEffect } from "react";
import { Layers, Activity, RefreshCw, Zap, Lock, AlertTriangle, Shield } from "lucide-react";

interface InfinityTopos {
  topos_id: string;
  name: string;
  category_type: string;
  homotopy_dimension: number;
  truncation_postnikov: number;
  hypercomplete: boolean;
  base_ring_spectrum: string;
  sheaf_cohomology_coherence_pct: number;
  status: string;
}

interface LurieTelemetry {
  topos_id: string;
  status: string;
  spectral_descent_residual: number;
  truncation_level: number;
  e_infinity_order: number;
  spectral_descent_verified: boolean;
  hypercomplete: boolean;
  lurie_shield_strength_pev: number;
  homological_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function LurieToposStudio() {
  const [topoi, setTopoi] = useState<InfinityTopos[]>([]);
  const [selectedTopos, setSelectedTopos] = useState<string>("");
  const [truncationLevel, setTruncationLevel] = useState<number>(4);
  const [eInfinityOrder, setEInfinityOrder] = useState<number>(8);
  const [shieldGain, setShieldGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<LurieTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopoi = async () => {
    try {
      const res = await fetch("/api/lurie-higher-topos-spectral/topoi");
      if (!res.ok) throw new Error("Failed to fetch infinity-topos configurations");
      const data = await res.json();
      setTopoi(data.topoi || []);
      if (data.topoi?.length > 0 && !selectedTopos) {
        setSelectedTopos(data.topoi[0].topos_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching topoi");
    }
  };

  useEffect(() => {
    fetchTopoi();
  }, []);

  const handleEvaluateSpectralDescent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lurie-higher-topos-spectral/evaluate-spectral-descent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topos_id: selectedTopos,
          truncation_level: truncationLevel,
          e_infinity_order: eInfinityOrder,
          shield_gain: shieldGain,
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate spectral sheaf descent");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating spectral descent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            Lurie Higher Topos Theory & Spectral Algebraic Geometry Studio
          </h2>
          <p className="text-sm text-zinc-400">
            Capability 188: Formalizes quasi-categories, structured sheaves of E_infinity-ring spectra, and hypercomplete spectral descent.
          </p>
        </div>
        <button
          onClick={fetchTopoi}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md border border-zinc-700 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Topoi
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-sm text-red-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-1 bg-zinc-900/50 p-5 rounded-xl border border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono">
            Infinity-Topos Configuration
          </h3>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Select Infinity-Topos</label>
            <select
              value={selectedTopos}
              onChange={(e) => setSelectedTopos(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            >
              {topoi.map((t) => (
                <option key={t.topos_id} value={t.topos_id}>
                  {t.topos_id} ({t.category_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Postnikov Truncation Level</label>
            <input
              type="number"
              min={1}
              max={16}
              value={truncationLevel}
              onChange={(e) => setTruncationLevel(parseInt(e.target.value) || 4)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">E_infinity Ring Spectrum Order</label>
            <input
              type="number"
              min={1}
              max={32}
              value={eInfinityOrder}
              onChange={(e) => setEInfinityOrder(parseInt(e.target.value) || 8)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Shield Gain: {shieldGain}x</label>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.05"
              value={shieldGain}
              onChange={(e) => setShieldGain(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <button
            onClick={handleEvaluateSpectralDescent}
            disabled={loading || !selectedTopos}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Enforce Spectral Descent
          </button>
        </div>

        <div className="space-y-4 md:col-span-2 bg-zinc-900/50 p-5 rounded-xl border border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono mb-3">
              Spectral Descents & Higher Topos Telemetry
            </h3>

            {telemetry ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Status</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                      <Lock className="h-3 w-3" />
                      {telemetry.status}
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Descent Residual</span>
                    <span className="text-xs font-bold text-indigo-300 font-mono mt-0.5 block">
                      {telemetry.spectral_descent_residual.toFixed(6)}
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Hypercomplete</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">
                      {telemetry.hypercomplete ? "TRUE (DESCENT VERIFIED)" : "FALSE"}
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Shield Strength</span>
                    <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                      {telemetry.lurie_shield_strength_pev.toFixed(1)} PeV
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Homological Suppr</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">
                      {telemetry.homological_suppression_db.toFixed(1)} dB
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Effective Fidelity</span>
                    <span className="text-xs font-bold text-violet-400 font-mono mt-0.5 block">
                      {telemetry.effective_fidelity_pct.toFixed(4)}%
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-800/40 rounded border border-zinc-700/40 text-xs font-mono text-zinc-300 space-y-1">
                  <div>• Topos ID: {telemetry.topos_id}</div>
                  <div>• Spectral Descent Verified: {telemetry.spectral_descent_verified ? "YES" : "NO"}</div>
                  <div>• E_infinity Sheaf Order: {telemetry.e_infinity_order}</div>
                  <div>• Truncation Postnikov: {telemetry.truncation_level}</div>
                </div>
              </div>
            ) : (
              <div className="h-48 border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-500 text-xs font-mono">
                <Activity className="h-8 w-8 mb-2 opacity-30 text-indigo-400" />
                Select an infinity-topos and execute spectral sheaf descent verification.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Shield className="h-3 w-3" />
              Lurie Spectral Shield Operational
            </span>
            <span>Centesimal Sovereign Era • v9.6.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LurieToposStudio;
