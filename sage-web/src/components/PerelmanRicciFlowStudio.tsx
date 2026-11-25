'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface RicciManifold {
  manifold_id: string;
  topology: string;
  dimension: number;
  initial_scalar_curvature_r0: number;
  surgery_scale_delta: number;
  thurston_geometry: string;
  base_geometric_fidelity_pct: number;
  status: string;
}

interface SurgeryResult {
  manifold_id: string;
  status: string;
  perelman_w_entropy: number;
  reduced_volume_l: number;
  canonical_surgeries_performed: number;
  surgery_cutoff: number;
  ricci_shield_strength_pev: number;
  topology_suppression_db: number;
  effective_fidelity_pct: number;
  thurston_geometrization_verified: boolean;
  timestamp: number;
}

export default function PerelmanRicciFlowStudio() {
  const [manifolds, setManifolds] = useState<RicciManifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>('PERELMAN-NECK-PINCH-S2xS1-01');
  const [flowTimeTau, setFlowTimeTau] = useState<number>(0.5);
  const [curvatureGain, setCurvatureGain] = useState<number>(1.25);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SurgeryResult | null>(null);

  const fetchManifolds = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/perelman-ricci-flow/manifolds');
      const data = (await res.json().catch(() => ({}))) as {
        manifolds?: RicciManifold[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load 3-manifolds');
      }
      if (data.manifolds) {
        setManifolds(data.manifolds);
        if (data.manifolds.length > 0) {
          setSelectedManifold((prev) => prev || data.manifolds![0].manifold_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading 3-manifolds';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchManifolds();
  }, [fetchManifolds]);

  const handleSurgery = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/perelman-ricci-flow/execute-surgery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          flow_time_tau: flowTimeTau,
          surgery_cutoff: 1e-4,
          curvature_gain: curvatureGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SurgeryResult & { detail?: string };
      if (!res.ok) {
        throw new Error(data.detail || 'Ricci flow surgery execution failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during Ricci flow surgery';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentManifold = manifolds.find((m) => m.manifold_id === selectedManifold);

  return (
    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Perelman Ricci Flow & Surgery Shield
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  Capability 176
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Dynamic metric regularization, Perelman W-entropy monotonicity, and Thurston geometrization neck-pinch surgery
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchManifolds}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Manifolds
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="my-4 p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-sm flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Ricci Flow Error</p>
            <p>{errorMsg}</p>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-400 hover:text-red-200 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Target 3-Manifold
          </label>
          <select
            value={selectedManifold}
            onChange={(e) => setSelectedManifold(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {manifolds.map((m) => (
              <option key={m.manifold_id} value={m.manifold_id}>
                {m.manifold_id} (R0={m.initial_scalar_curvature_r0})
              </option>
            ))}
          </select>
          {currentManifold && (
            <p className="text-xs text-slate-500 italic mt-1">{currentManifold.topology}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Evolution Time ($\tau$): {flowTimeTau}
          </label>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={flowTimeTau}
            onChange={(e) => setFlowTimeTau(parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.1 (Early Flow)</span>
            <span>0.5 (Canonical)</span>
            <span>3.0 (Long-Term)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Curvature Pinning Gain: {curvatureGain}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={curvatureGain}
            onChange={(e) => setCurvatureGain(parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.50x</span>
            <span>1.25x (Optimal)</span>
            <span>2.50x</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={handleSurgery}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Performing Ricci Flow Surgery...' : 'Execute Ricci Flow & Surgery'}
        </button>
      </div>

      {telemetry && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Perelman Metric Stabilization Telemetry
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Perelman W-Entropy</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.perelman_w_entropy}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Reduced Volume L</p>
              <p className="text-lg font-bold text-indigo-400 mt-0.5">{telemetry.reduced_volume_l}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Canonical Surgeries</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{telemetry.canonical_surgeries_performed}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Shield Strength</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.ricci_shield_strength_pev} PeV</p>
            </div>
          </div>

          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Topology Disruption Suppression: <strong className="text-slate-200">+{telemetry.topology_suppression_db} dB</strong></span>
            <span>Geometric Purity: <strong className="text-emerald-400">{telemetry.effective_fidelity_pct}%</strong></span>
            <span>Geometrization: <strong className="text-indigo-300">{telemetry.thurston_geometrization_verified ? 'VERIFIED' : 'PENDING'}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
