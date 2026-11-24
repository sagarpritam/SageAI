'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

interface ApsManifold {
  manifold_id: string;
  boundary_type: string;
  dimension: number;
  base_eta_invariant: number;
  index_a_hat: number;
  base_firewall_fidelity_pct: number;
  status: string;
}

interface ApsEtaResult {
  manifold_id: string;
  status: string;
  eta_invariant_val: number;
  aps_index: number;
  eigenvalue_cutoff: number;
  boundary_modes_count: number;
  dai_freed_anomaly_canceled: boolean;
  eta_firewall_strength_pev: number;
  anomaly_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export default function ApsEtaFirewallStudio() {
  const [manifolds, setManifolds] = useState<ApsManifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>('APS-DIRAC-CYLINDER-01');
  const [eigenvalueCutoff, setEigenvalueCutoff] = useState<number>(50);
  const [boundaryDamping, setBoundaryDamping] = useState<number>(1.25);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<ApsEtaResult | null>(null);

  const fetchManifolds = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/aps-eta-firewall/manifolds');
      const data = (await res.json().catch(() => ({}))) as {
        manifolds?: ApsManifold[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load APS boundary manifolds');
      }
      if (data.manifolds) {
        setManifolds(data.manifolds);
        if (data.manifolds.length > 0) {
          setSelectedManifold((prev) => prev || data.manifolds![0].manifold_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading APS manifolds';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchManifolds();
  }, [fetchManifolds]);

  const handleEvaluate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/aps-eta-firewall/evaluate-eta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          spectral_s: 0.0,
          eigenvalue_cutoff: eigenvalueCutoff,
          boundary_damping: boundaryDamping,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as ApsEtaResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to evaluate APS spectral asymmetry');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to execute APS evaluation';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Atiyah-Patodi-Singer η-Invariant Firewall
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                  Capability 175
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Spectral asymmetry eta invariants, non-local boundary conditions, and Dai-Freed anomaly cancellation
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
            <p className="font-semibold text-red-200">APS Firewall Error</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            APS Boundary Manifold
          </label>
          <select
            value={selectedManifold}
            onChange={(e) => setSelectedManifold(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
          >
            {manifolds.map((m) => (
              <option key={m.manifold_id} value={m.manifold_id}>
                {m.manifold_id} (η₀={m.base_eta_invariant})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Eigenvalue Cutoff ({eigenvalueCutoff} Modes)
          </label>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={eigenvalueCutoff}
            onChange={(e) => setEigenvalueCutoff(parseInt(e.target.value))}
            className="w-full accent-rose-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>10</span>
            <span>50 (Optimal)</span>
            <span>100</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Boundary Damping ({boundaryDamping.toFixed(2)}x)
          </label>
          <input
            type="range"
            min={0.5}
            max={3.0}
            step={0.05}
            value={boundaryDamping}
            onChange={(e) => setBoundaryDamping(parseFloat(e.target.value))}
            className="w-full accent-rose-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0.50x</span>
            <span>1.25x</span>
            <span>3.00x</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-rose-600/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Evaluating Spectral Asymmetry...' : 'Evaluate η-Invariant & Seal Boundary'}
        </button>
      </div>

      {telemetry && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              APS Edge Firewall Sealed
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Spectral Asymmetry η(0)</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {telemetry.eta_invariant_val.toFixed(6)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Dai-Freed Anomaly</span>
              <span className="text-base font-bold text-cyan-400">
                {telemetry.dai_freed_anomaly_canceled ? 'CANCELED (0 rad)' : 'LEAKAGE'}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Firewall Strength</span>
              <span className="text-base font-bold font-mono text-rose-400">
                {telemetry.eta_firewall_strength_pev.toFixed(2)} PeV
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Spectral Suppression</span>
              <span className="text-base font-bold font-mono text-purple-400">
                {telemetry.anomaly_suppression_db.toFixed(1)} dB
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
