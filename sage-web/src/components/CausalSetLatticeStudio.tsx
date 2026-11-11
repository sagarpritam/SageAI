'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GitCommitHorizontal, RefreshCw, Shield, Sparkles, Sliders, AlertTriangle } from 'lucide-react';

interface CausalPoset {
  poset_id: string;
  sector: string;
  sprinkling_elements_n: number;
  base_myrheim_meyer_dim: number;
  base_covariance_pct: number;
  status: string;
}

interface EnforcePosetResult {
  poset_id: string;
  sprinkling_density_factor: number;
  target_dimension_d: number;
  transitivity_damping_gain: number;
  effective_poset_cardinality: number;
  myrheim_meyer_estimated_dim: number;
  ordering_fraction_ratio: number;
  benincasa_dowker_curvature: number;
  acausal_cycle_probability: number;
  transitivity_violation_residual: number;
  lorentz_poset_covariance_pct: number;
  bell_causality_bell_csg_locked: boolean;
  status: string;
  timestamp: number;
}

export default function CausalSetLatticeStudio() {
  const [posets, setPosets] = useState<CausalPoset[]>([]);
  const [selectedPoset, setSelectedPoset] = useState<string>('CAUSAL-SPRINKLE-4D-01');
  const [densityFactor, setDensityFactor] = useState<number>(1.25);
  const [targetDim, setTargetDim] = useState<number>(4.0);
  const [transitivityGain, setTransitivityGain] = useState<number>(1.15);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<EnforcePosetResult | null>(null);

  const fetchPosets = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/causal-set-lattice/posets');
      const data = (await res.json().catch(() => ({}))) as {
        posets?: CausalPoset[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load discrete causal posets');
      }
      if (data.posets) {
        setPosets(data.posets);
        if (data.posets.length > 0) {
          setSelectedPoset((prev) => prev || data.posets![0].poset_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load discrete causal posets');
    }
  }, []);

  useEffect(() => {
    fetchPosets();
  }, [fetchPosets]);

  const handleEnforce = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/causal-set-lattice/enforce-poset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poset_id: selectedPoset,
          sprinkling_density_factor: densityFactor,
          target_dimension_d: targetDim,
          transitivity_damping_gain: transitivityGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as EnforcePosetResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Causal set poset enforcement failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Causal set poset enforcement failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <GitCommitHorizontal className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-300">
              Capability 112: Causal Set Discrete Spacetime Poset Lattice Guard
            </h2>
            <p className="text-sm text-slate-400">
              Lorentz-invariant Poisson sprinkling (rho ~ l_Pl^-4), Myrheim-Meyer dimension recovery, zero acausal cycles
            </p>
          </div>
        </div>
        <button
          onClick={fetchPosets}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Posets</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posets.map((p) => (
          <div
            key={p.poset_id}
            onClick={() => setSelectedPoset(p.poset_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedPoset === p.poset_id
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-cyan-400">
                {p.poset_id}
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                {p.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{p.sector}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Myrheim-Meyer Dim:</span>
                <span className="text-cyan-300">{p.base_myrheim_meyer_dim.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Lorentz Covariance:</span>
                <span className="text-emerald-300">{p.base_covariance_pct.toFixed(3)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Poisson Sprinkling &amp; Benincasa-Dowker Poset Controller</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Sprinkling Density Factor:{' '}
              <span className="text-cyan-300 font-mono">{densityFactor}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.25"
              value={densityFactor}
              onChange={(e) => setDensityFactor(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Target Manifold Dim (d):{' '}
              <span className="text-cyan-300 font-mono">{targetDim.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="3.0"
              max="5.0"
              step="0.5"
              value={targetDim}
              onChange={(e) => setTargetDim(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Transitivity Gain:{' '}
              <span className="text-cyan-300 font-mono">{transitivityGain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={transitivityGain}
              onChange={(e) => setTransitivityGain(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>

        <button
          onClick={handleEnforce}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying Discrete Poset Partial Order...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Enforce Causal Set Poset &amp; Estimate d_MM</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-cyan-300">
              CAUSAL SET POSET LATTICE TELEMETRY
            </span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">LORENTZ COVARIANCE</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.lorentz_poset_covariance_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">MYRHEIM-MEYER DIM</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.myrheim_meyer_estimated_dim.toFixed(4)}D
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">POSET CARDINALITY</span>
              <span className="text-sky-300 font-bold text-sm">
                {telemetry.effective_poset_cardinality.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ACAUSAL CYCLE PROB</span>
              <span className="text-emerald-400 font-bold text-sm">
                {telemetry.acausal_cycle_probability.toFixed(1)} (LOCKED)
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-cyan-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Ordering Fraction: {telemetry.ordering_fraction_ratio} | CSG Markov Growth Verified
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

