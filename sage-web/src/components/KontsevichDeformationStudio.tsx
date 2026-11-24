'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

interface PoissonManifold {
  manifold_id: string;
  classification: string;
  poisson_rank: number;
  deformation_parameter_hbar: number;
  harmonic_propagator: string;
  base_associativity_fidelity_pct: number;
  status: string;
}

interface DeformationResult {
  manifold_id: string;
  status: string;
  formality_morphism_order: number;
  kontsevich_graph_weights: Record<string, number>;
  star_product_associativity_pct: number;
  deformation_shield_strength_pev: number;
  deformation_suppression_db: number;
  effective_fidelity_pct: number;
  harmonic_precision: number;
  timestamp: number;
}

export default function KontsevichDeformationStudio() {
  const [manifolds, setManifolds] = useState<PoissonManifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>('KONTSEVICH-MOYAL-PLANE-01');
  const [hbarOrder, setHbarOrder] = useState<number>(4);
  const [deformationGain, setDeformationGain] = useState<number>(1.25);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<DeformationResult | null>(null);

  const fetchManifolds = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/kontsevich-deformation/manifolds');
      const data = (await res.json().catch(() => ({}))) as {
        manifolds?: PoissonManifold[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Poisson manifolds');
      }
      if (data.manifolds) {
        setManifolds(data.manifolds);
        if (data.manifolds.length > 0) {
          setSelectedManifold((prev) => prev || data.manifolds![0].manifold_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading Poisson manifolds';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchManifolds();
  }, [fetchManifolds]);

  const handleQuantize = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/kontsevich-deformation/quantize-deformation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          hbar_order: hbarOrder,
          harmonic_precision: 1e-6,
          deformation_gain: deformationGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as DeformationResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to quantize Poisson deformation');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to execute deformation quantization';
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
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Kontsevich Deformation Quantization Shield
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                  Capability 173
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Poisson manifolds, Kontsevich graph weights, star-product associativity, and L-infinity formality
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
            <p className="font-semibold text-red-200">Deformation Error</p>
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
            Poisson Manifold
          </label>
          <select
            value={selectedManifold}
            onChange={(e) => setSelectedManifold(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {manifolds.map((m) => (
              <option key={m.manifold_id} value={m.manifold_id}>
                {m.manifold_id} (Rank {m.poisson_rank}, ℏ={m.deformation_parameter_hbar})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Perturbative Order ℏ^N (N = {hbarOrder})
          </label>
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={hbarOrder}
            onChange={(e) => setHbarOrder(parseInt(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>N=1 (Moyal)</span>
            <span>N=4 (Standard)</span>
            <span>N=8 (High)</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Deformation Gain ({deformationGain.toFixed(2)}x)
          </label>
          <input
            type="range"
            min={0.5}
            max={3.0}
            step={0.05}
            value={deformationGain}
            onChange={(e) => setDeformationGain(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
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
          onClick={handleQuantize}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-cyan-600/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Evaluating Kontsevich Graphs...' : 'Quantize Poisson Deformation'}
        </button>
      </div>

      {telemetry && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Kontsevich Deformation Quantized
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Star-Product Associativity</span>
              <span className="text-base font-bold text-emerald-400">
                {telemetry.star_product_associativity_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Formality Order</span>
              <span className="text-base font-bold font-mono text-cyan-400">
                O(ℏ^{telemetry.formality_morphism_order})
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Deformation Barrier</span>
              <span className="text-base font-bold font-mono text-indigo-400">
                {telemetry.deformation_shield_strength_pev.toFixed(2)} PeV
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Spectral Suppression</span>
              <span className="text-base font-bold font-mono text-purple-400">
                {telemetry.deformation_suppression_db.toFixed(1)} dB
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
