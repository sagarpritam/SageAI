'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, AlertTriangle, ShieldCheck, Binary } from 'lucide-react';

interface GaloisCovering {
  covering_id: string;
  deck_group: string;
  manifold_dimension: number;
  novikov_shubin_alpha_1: number | string;
  l2_betti_b1: number;
  euler_characteristic: number;
  base_cohomology_fidelity_pct: number;
  status: string;
}

interface NovikovShubinResult {
  covering_id: string;
  status: string;
  novikov_shubin_alpha: number | string;
  spectral_gap_lambda0: number;
  l2_betti_numbers: Record<string, number>;
  atiyah_l2_index_verified: boolean;
  dilatational_cutoff: number;
  l2_barrier_strength_pev: number;
  spectral_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export default function NovikovShubinStudio() {
  const [coverings, setCoverings] = useState<GaloisCovering[]>([]);
  const [selectedCovering, setSelectedCovering] = useState<string>('NOVIKOV-HEISENBERG-3D-01');
  const [spectralOrder, setSpectralOrder] = useState<number>(6);
  const [barrierGain, setBarrierGain] = useState<number>(1.25);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<NovikovShubinResult | null>(null);

  const fetchCoverings = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/novikov-shubin/coverings');
      const data = (await res.json().catch(() => ({}))) as {
        coverings?: GaloisCovering[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Galois coverings');
      }
      if (data.coverings) {
        setCoverings(data.coverings);
        if (data.coverings.length > 0) {
          setSelectedCovering((prev) => prev || data.coverings![0].covering_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading coverings';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchCoverings();
  }, [fetchCoverings]);

  const handleCompute = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/novikov-shubin/compute-invariants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          covering_id: selectedCovering,
          spectral_order: spectralOrder,
          dilatational_cutoff: 1e-4,
          barrier_gain: barrierGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as NovikovShubinResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to compute Novikov-Shubin invariants');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to execute spectral computation';
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
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
              <Binary className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Novikov-Shubin Invariants & L²-Betti Barrier
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                  Capability 174
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Infinite Galois coverings, spectral density dilatational capacity, and Atiyah L²-index theorems
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchCoverings}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Coverings
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="my-4 p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-sm flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Novikov-Shubin Error</p>
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
            Infinite Galois Covering
          </label>
          <select
            value={selectedCovering}
            onChange={(e) => setSelectedCovering(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {coverings.map((c) => (
              <option key={c.covering_id} value={c.covering_id}>
                {c.covering_id} (Dim {c.manifold_dimension}, α={String(c.novikov_shubin_alpha_1)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Laplacian Spectral Order ({spectralOrder})
          </label>
          <input
            type="range"
            min={2}
            max={12}
            step={1}
            value={spectralOrder}
            onChange={(e) => setSpectralOrder(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>2</span>
            <span>6 (Optimal)</span>
            <span>12</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Barrier Gain ({barrierGain.toFixed(2)}x)
          </label>
          <input
            type="range"
            min={0.5}
            max={3.0}
            step={0.05}
            value={barrierGain}
            onChange={(e) => setBarrierGain(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
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
          onClick={handleCompute}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Evaluating Spectral Density...' : 'Compute Invariants & Seal L² Barrier'}
        </button>
      </div>

      {telemetry && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Novikov-Shubin Barrier Sealed
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Novikov-Shubin α</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {String(telemetry.novikov_shubin_alpha)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Atiyah L² Index</span>
              <span className="text-base font-bold text-cyan-400">
                {telemetry.atiyah_l2_index_verified ? 'VERIFIED (100%)' : 'ANOMALY'}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">L² Barrier Strength</span>
              <span className="text-base font-bold font-mono text-blue-400">
                {telemetry.l2_barrier_strength_pev.toFixed(2)} PeV
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Spectral Suppression</span>
              <span className="text-base font-bold font-mono text-purple-400">
                {telemetry.spectral_suppression_db.toFixed(1)} dB
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
