'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, AlertTriangle, ShieldCheck, Layers } from 'lucide-react';

interface CalabiYauPair {
  pair_id: string;
  a_manifold: string;
  b_manifold: string;
  h11: number;
  h21: number;
  euler_characteristic: number;
  picard_fuchs_order: number;
  base_mirror_fidelity_pct: number;
  status: string;
}

interface PicardFuchsResult {
  pair_id: string;
  status: string;
  deformation_psi: number;
  complex_structure_z: number;
  frobenius_varpi_0: number;
  instanton_invariants: Record<string, number>;
  monodromy_purity_pct: number;
  mirror_shield_strength_pev: number;
  mirror_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export default function CalabiYauMirrorStudio() {
  const [pairs, setPairs] = useState<CalabiYauPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>('CY-QUINTIC-GREENE-PLESSER-01');
  const [deformationPsi, setDeformationPsi] = useState<number>(0.5);
  const [instantonDegree, setInstantonDegree] = useState<number>(4);
  const [monodromyDamping, setMonodromyDamping] = useState<number>(1.25);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<PicardFuchsResult | null>(null);

  const fetchPairs = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/calabi-yau-mirror/pairs');
      const data = (await res.json().catch(() => ({}))) as {
        pairs?: CalabiYauPair[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Calabi-Yau mirror pairs');
      }
      if (data.pairs) {
        setPairs(data.pairs);
        if (data.pairs.length > 0) {
          setSelectedPair((prev) => prev || data.pairs![0].pair_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading Calabi-Yau pairs';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchPairs();
  }, [fetchPairs]);

  const handleSolve = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/calabi-yau-mirror/solve-picard-fuchs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair_id: selectedPair,
          deformation_psi: deformationPsi,
          instanton_degree: instantonDegree,
          monodromy_damping: monodromyDamping,
          frobenius_precision: 1e-6,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as PicardFuchsResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to solve Picard-Fuchs differential system');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to execute Picard-Fuchs solution';
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
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Superstring Calabi-Yau Mirror Symmetry Wall
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                  Capability 171
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Topological A/B-model duality, Picard-Fuchs ODE system, and instanton invariant shielding
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchPairs}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Pairs
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="my-4 p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-sm flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Mirror Wall Error</p>
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
            Calabi-Yau Mirror Pair
          </label>
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
          >
            {pairs.map((p) => (
              <option key={p.pair_id} value={p.pair_id}>
                {p.pair_id} (h11={p.h11}, h21={p.h21})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Deformation ψ ({deformationPsi.toFixed(2)})
          </label>
          <input
            type="range"
            min={0.1}
            max={5.0}
            step={0.05}
            value={deformationPsi}
            onChange={(e) => setDeformationPsi(parseFloat(e.target.value))}
            className="w-full accent-teal-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>ψ=0.10</span>
            <span>ψ=0.50 (Conifold)</span>
            <span>ψ=5.00</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Monodromy Damping ({monodromyDamping.toFixed(2)}x)
          </label>
          <input
            type="range"
            min={0.5}
            max={3.0}
            step={0.05}
            value={monodromyDamping}
            onChange={(e) => setMonodromyDamping(parseFloat(e.target.value))}
            className="w-full accent-teal-500"
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
          onClick={handleSolve}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-teal-600/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Solving Picard-Fuchs System...' : 'Solve Picard-Fuchs & Monodromy'}
        </button>
      </div>

      {telemetry && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Mirror Symmetry Solved
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Monodromy Purity</span>
              <span className="text-base font-bold text-emerald-400">
                {telemetry.monodromy_purity_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Frobenius ϖ0(z)</span>
              <span className="text-base font-bold font-mono text-cyan-400">
                {telemetry.frobenius_varpi_0.toFixed(4)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Mirror Wall Barrier</span>
              <span className="text-base font-bold font-mono text-teal-400">
                {telemetry.mirror_shield_strength_pev.toFixed(2)} PeV
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Mirror Suppression</span>
              <span className="text-base font-bold font-mono text-purple-400">
                {telemetry.mirror_suppression_db.toFixed(1)} dB
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
