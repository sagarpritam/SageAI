'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, AlertTriangle, ShieldCheck, Binary } from 'lucide-react';

interface SymplecticTarget {
  target_id: string;
  manifold_name: string;
  dimension: number;
  first_chern_class_c1: number;
  degree_counts: Record<string, number>;
  base_wdvv_purity_pct: number;
  status: string;
}

interface QuantumProductResult {
  target_id: string;
  status: string;
  quantum_degree: number;
  novikov_parameter_q: number;
  gromov_witten_potential: number;
  wdvv_associativity_verified: boolean;
  wdvv_residual_norm: number;
  quantum_barrier_strength_pev: number;
  symplectic_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export default function GromovWittenStudio() {
  const [targets, setTargets] = useState<SymplecticTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('GW-PROJECTIVE-CP2-01');
  const [quantumDegree, setQuantumDegree] = useState<number>(3);
  const [deformationGain, setDeformationGain] = useState<number>(1.25);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<QuantumProductResult | null>(null);

  const fetchTargets = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gromov-witten-cohomology/targets');
      const data = (await res.json().catch(() => ({}))) as {
        targets?: SymplecticTarget[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load symplectic targets');
      }
      if (data.targets) {
        setTargets(data.targets);
        if (data.targets.length > 0) {
          setSelectedTarget((prev) => prev || data.targets![0].target_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading symplectic targets';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  const handleCompute = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gromov-witten-cohomology/compute-quantum-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_id: selectedTarget,
          quantum_degree: quantumDegree,
          novikov_parameter_q: 0.05,
          deformation_gain: deformationGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as QuantumProductResult & { detail?: string };
      if (!res.ok) {
        throw new Error(data.detail || 'Quantum product computation failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during quantum product calculation';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentTarget = targets.find((t) => t.target_id === selectedTarget);

  return (
    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
              <Binary className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Gromov-Witten & Quantum Cohomology Barrier
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                  Capability 177
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Pseudoholomorphic curve moduli spaces, Kontsevich-Manin quantum cup products, and WDVV associativity equations
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchTargets}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Targets
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="my-4 p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-sm flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Gromov-Witten Error</p>
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
            Symplectic Target
          </label>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {targets.map((t) => (
              <option key={t.target_id} value={t.target_id}>
                {t.target_id} (c1={t.first_chern_class_c1})
              </option>
            ))}
          </select>
          {currentTarget && (
            <p className="text-xs text-slate-500 italic mt-1">{currentTarget.manifold_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quantum Curve Degree: {quantumDegree}
          </label>
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={quantumDegree}
            onChange={(e) => setQuantumDegree(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>d=1 (Lines)</span>
            <span>d=3 (Cubics)</span>
            <span>d=6 (High-Genus)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Deformation Pinning Gain: {deformationGain}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={deformationGain}
            onChange={(e) => setDeformationGain(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
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
          onClick={handleCompute}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-cyan-600/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Evaluating Quantum Cohomology Ring...' : 'Compute Quantum Cup Product & Verify WDVV'}
        </button>
      </div>

      {telemetry && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Gromov-Witten Quantum Cohomology Telemetry
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">GW Potential $\Phi(t)$</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.gromov_witten_potential}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">WDVV Residual Norm</p>
              <p className="text-lg font-bold text-cyan-400 mt-0.5">{telemetry.wdvv_residual_norm.toExponential(1)}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Barrier Strength</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.quantum_barrier_strength_pev} PeV</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Suppression</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">+{telemetry.symplectic_suppression_db} dB</p>
            </div>
          </div>

          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Novikov Parameter $q$: <strong className="text-slate-200">{telemetry.novikov_parameter_q}</strong></span>
            <span>Associativity: <strong className="text-emerald-400">{telemetry.wdvv_associativity_verified ? 'WDVV ASSOCIATIVE' : 'VIOLATION'}</strong></span>
            <span>Cohomology Purity: <strong className="text-cyan-300">{telemetry.effective_fidelity_pct}%</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
