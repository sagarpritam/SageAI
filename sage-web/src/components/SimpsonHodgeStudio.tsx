"use client";

import React, { useState, useEffect } from "react";
import { Layers, Activity, RefreshCw, Zap, Lock, AlertTriangle, Shield } from "lucide-react";

interface HiggsBundle {
  bundle_id: string;
  bundle_type: string;
  base_manifold: string;
  gauge_group: string;
  spectral_curve_genus: number;
  higgs_field_norm: number;
  base_hodge_fidelity_pct: number;
  status: string;
}

interface HodgeTelemetry {
  bundle_id: string;
  status: string;
  curvature_norm_f_h: number;
  harmonic_metric_residual: number;
  hitchin_simpson_solvable: boolean;
  spectral_cutoff: number;
  simpson_shield_strength_pev: number;
  curvature_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function SimpsonHodgeStudio() {
  const [bundles, setBundles] = useState<HiggsBundle[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<string>("");
  const [harmonicDamping, setHarmonicDamping] = useState<number>(0.05);
  const [spectralCutoff, setSpectralCutoff] = useState<number>(4);
  const [hodgeGain, setHodgeGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<HodgeTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBundles = async () => {
    try {
      const res = await fetch("/api/simpson-nonabelian-hodge/bundles");
      if (!res.ok) throw new Error("Failed to fetch Higgs bundle configurations");
      const data = await res.json();
      setBundles(data.bundles || []);
      if (data.bundles?.length > 0 && !selectedBundle) {
        setSelectedBundle(data.bundles[0].bundle_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching bundles");
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const handleSolveHitchinSimpson = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/simpson-nonabelian-hodge/solve-hitchin-simpson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundle_id: selectedBundle,
          harmonic_damping: harmonicDamping,
          spectral_cutoff: spectralCutoff,
          hodge_gain: hodgeGain,
        }),
      });
      if (!res.ok) throw new Error("Failed to solve Hitchin-Simpson equations");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error solving harmonic metric");
    } finally {
      setLoading(false);
    }
  };

  const currentBundle = bundles.find((b) => b.bundle_id === selectedBundle);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg text-fuchsia-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Simpson Nonabelian Hodge Correspondence &amp; Higgs Shield
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-medium">
                Capability 185
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Carlos Simpson &amp; Nigel Hitchin harmonic metric F_H + [theta, theta*] = 0 &amp; nonabelian Hodge equivalence
            </p>
          </div>
        </div>
        <button
          onClick={fetchBundles}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Bundles
        </button>
      </div>

      {error && (
        <div className="p-4 bg-fuchsia-950/50 border border-fuchsia-800 rounded-lg text-fuchsia-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-fuchsia-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Higgs Bundle Configuration
          </label>
          <select
            value={selectedBundle}
            onChange={(e) => setSelectedBundle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          >
            {bundles.map((b) => (
              <option key={b.bundle_id} value={b.bundle_id}>
                {b.bundle_id} ({b.gauge_group})
              </option>
            ))}
          </select>
          {currentBundle && (
            <p className="text-xs text-slate-500 italic mt-1">{currentBundle.bundle_type}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Harmonic Damping: {harmonicDamping}
          </label>
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={harmonicDamping}
            onChange={(e) => setHarmonicDamping(parseFloat(e.target.value))}
            className="w-full accent-fuchsia-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.01 (Tight Residual)</span>
            <span>0.2 (Relaxed Damping)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Nonabelian Hodge Gain: {hodgeGain}x
          </label>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.25"
            value={hodgeGain}
            onChange={(e) => setHodgeGain(parseFloat(e.target.value))}
            className="w-full accent-fuchsia-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.5x</span>
            <span>3.0x</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSolveHitchinSimpson}
          disabled={loading || !selectedBundle}
          className="flex items-center gap-2 px-6 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-fuchsia-950/50 transition cursor-pointer"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Enforce Simpson Nonabelian Hodge Shield
        </button>
      </div>

      {telemetry && (
        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-fuchsia-400" />
              Nonabelian Hodge Telemetry
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Curvature Norm |F_H|</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.curvature_norm_f_h}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Metric Residual</p>
              <p className="text-lg font-bold text-fuchsia-400 mt-0.5">{telemetry.harmonic_metric_residual}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Shield Strength</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.simpson_shield_strength_pev} PeV</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Curvature Suppression</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">+{telemetry.curvature_suppression_db} dB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpsonHodgeStudio;
