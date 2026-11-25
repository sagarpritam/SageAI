'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, AlertTriangle, ShieldCheck, Compass } from 'lucide-react';

interface QuillenBundle {
  bundle_id: string;
  family_description: string;
  base_dimension: number;
  fiber_dimension: number;
  base_analytic_torsion_log: number;
  quillen_curvature_form: string;
  base_anomaly_fidelity_pct: number;
  status: string;
}

interface DeterminantResult {
  bundle_id: string;
  status: string;
  zeta_prime_zero: number;
  quillen_metric_norm: number;
  deligne_riemann_roch_verified: boolean;
  bismut_freed_anomaly_canceled: boolean;
  regularization_cutoff: number;
  quillen_firewall_strength_pev: number;
  spectral_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export default function QuillenDeterminantStudio() {
  const [bundles, setBundles] = useState<QuillenBundle[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<string>('QUILLEN-DIRAC-RIEMANN-01');
  const [zetaScale, setZetaScale] = useState<number>(1.0);
  const [firewallGain, setFirewallGain] = useState<number>(1.25);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<DeterminantResult | null>(null);

  const fetchBundles = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/quillen-determinant/bundles');
      const data = (await res.json().catch(() => ({}))) as {
        bundles?: QuillenBundle[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Quillen determinant bundles');
      }
      if (data.bundles) {
        setBundles(data.bundles);
        if (data.bundles.length > 0) {
          setSelectedBundle((prev) => prev || data.bundles![0].bundle_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading Quillen bundles';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  const handleEvaluate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/quillen-determinant/evaluate-determinant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundle_id: selectedBundle,
          regularization_cutoff: 1e-5,
          zeta_derivative_scale: zetaScale,
          firewall_gain: firewallGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as DeterminantResult & { detail?: string };
      if (!res.ok) {
        throw new Error(data.detail || 'Quillen determinant evaluation failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred evaluating Quillen determinant';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentBundle = bundles.find((b) => b.bundle_id === selectedBundle);

  return (
    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Quillen Determinant & Deligne-Riemann-Roch Firewall
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                  Capability 178
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Daniel Quillen determinant bundles, Ray-Singer analytic torsion metrics, and Bismut-Freed anomaly cancellation
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchBundles}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Bundles
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="my-4 p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-sm flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Quillen Firewall Error</p>
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
            Determinant Line Bundle
          </label>
          <select
            value={selectedBundle}
            onChange={(e) => setSelectedBundle(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            {bundles.map((b) => (
              <option key={b.bundle_id} value={b.bundle_id}>
                {b.bundle_id} (dim={b.base_dimension})
              </option>
            ))}
          </select>
          {currentBundle && (
            <p className="text-xs text-slate-500 italic mt-1">{currentBundle.family_description}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Zeta Derivative Scale (&zeta;&apos;(0)): {zetaScale}x
          </label>
          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.1"
            value={zetaScale}
            onChange={(e) => setZetaScale(parseFloat(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.2x (Subharmonic)</span>
            <span>1.0x (Canonical)</span>
            <span>2.0x (Perturbative)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Firewall Gain: {firewallGain}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={firewallGain}
            onChange={(e) => setFirewallGain(parseFloat(e.target.value))}
            className="w-full accent-violet-500"
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
          onClick={handleEvaluate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-violet-600/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Evaluating Analytic Torsion Metric...' : 'Evaluate Quillen Metric & Seal Anomaly'}
        </button>
      </div>

      {telemetry && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-violet-400" />
              Quillen Determinant Firewall Telemetry
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet-950/60 text-violet-300 border border-violet-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Zeta Derivative &zeta;&apos;(0)</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.zeta_prime_zero}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Quillen Norm ||s||_Q</p>
              <p className="text-lg font-bold text-violet-400 mt-0.5">{telemetry.quillen_metric_norm}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Firewall Strength</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.quillen_firewall_strength_pev} PeV</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Suppression</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">+{telemetry.spectral_suppression_db} dB</p>
            </div>
          </div>

          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Deligne-Riemann-Roch: <strong className="text-slate-200">{telemetry.deligne_riemann_roch_verified ? 'VERIFIED' : 'PENDING'}</strong></span>
            <span>Bismut-Freed Anomaly: <strong className="text-emerald-400">{telemetry.bismut_freed_anomaly_canceled ? 'CANCELED' : 'ACTIVE'}</strong></span>
            <span>Spectral Fidelity: <strong className="text-violet-300">{telemetry.effective_fidelity_pct}%</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
