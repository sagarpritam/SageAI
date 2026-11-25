"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers } from "lucide-react";

interface GaugeConfig {
  connection_id: string;
  bundle_topology: string;
  base_manifold: string;
  instanton_number_k: number;
  base_curvature_norm: number;
  bubbling_scale_radius: number;
  sobolev_w2p_norm: number;
  base_compactness_fidelity_pct: number;
  status: string;
}

interface UhlenbeckTelemetry {
  connection_id: string;
  status: string;
  uhlenbeck_epsilon: number;
  removable_singularities_count: number;
  bubbling_radius_delta: number;
  uhlenbeck_shield_strength_pev: number;
  bubbling_suppression_db: number;
  effective_fidelity_pct: number;
  weak_compactness_verified: boolean;
  timestamp: number;
}

export function UhlenbeckCompactnessStudio() {
  const [configs, setConfigs] = useState<GaugeConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [curvatureThreshold, setCurvatureThreshold] = useState<number>(0.0001);
  const [bubblingRadius, setBubblingRadius] = useState<number>(0.02);
  const [sobolevGain, setSobolevGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<UhlenbeckTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      const res = await fetch("/api/uhlenbeck-gauge-compactness/configurations");
      if (!res.ok) throw new Error("Failed to fetch gauge configurations");
      const data = await res.json();
      setConfigs(data.configurations || []);
      if (data.configurations?.length > 0 && !selectedConfig) {
        setSelectedConfig(data.configurations[0].connection_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching configurations");
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleEnforceCompactness = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/uhlenbeck-gauge-compactness/enforce-compactness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: selectedConfig,
          curvature_threshold: curvatureThreshold,
          bubbling_radius_delta: bubblingRadius,
          sobolev_gain: sobolevGain,
        }),
      });
      if (!res.ok) throw new Error("Failed to enforce Uhlenbeck compactness");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error enforcing compactness");
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = configs.find((c) => c.connection_id === selectedConfig);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Uhlenbeck Gauge Compactness & Instanton Wall
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                Capability 179
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Karen Uhlenbeck epsilon-regularity, removable point singularities, and Sobolev W^(2,p) weak compactness
            </p>
          </div>
        </div>
        <button
          onClick={fetchConfigs}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Configurations
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Gauge Connection Configuration
          </label>
          <select
            value={selectedConfig}
            onChange={(e) => setSelectedConfig(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {configs.map((c) => (
              <option key={c.connection_id} value={c.connection_id}>
                {c.connection_id} ({c.base_manifold})
              </option>
            ))}
          </select>
          {currentConfig && (
            <p className="text-xs text-slate-500 italic mt-1">{currentConfig.bundle_topology}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Bubbling Radius Delta: {bubblingRadius}
          </label>
          <input
            type="range"
            min="0.005"
            max="0.08"
            step="0.005"
            value={bubblingRadius}
            onChange={(e) => setBubblingRadius(parseFloat(e.target.value))}
            className="w-full accent-rose-500"
          >
          </input>
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.005 (Concentrated)</span>
            <span>0.08 (Diffused)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sobolev Regularity Gain: {sobolevGain}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.25"
            value={sobolevGain}
            onChange={(e) => setSobolevGain(parseFloat(e.target.value))}
            className="w-full accent-rose-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.5x</span>
            <span>2.5x</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleEnforceCompactness}
          disabled={loading || !selectedConfig}
          className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-rose-950/50 transition cursor-pointer"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Enforce Uhlenbeck Compactness
        </button>
      </div>

      {telemetry && (
        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              Uhlenbeck Compactness Telemetry
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Uhlenbeck Epsilon</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.uhlenbeck_epsilon}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Removable Singularities</p>
              <p className="text-lg font-bold text-rose-400 mt-0.5">{telemetry.removable_singularities_count}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Shield Strength</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.uhlenbeck_shield_strength_pev} PeV</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Bubbling Suppression</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">+{telemetry.bubbling_suppression_db} dB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default UhlenbeckCompactnessStudio;
