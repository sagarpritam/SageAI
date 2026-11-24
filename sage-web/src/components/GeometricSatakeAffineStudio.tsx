'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SatakeStack {
  stack_id: string;
  classification: string;
  default_group_rank: number;
  default_strata_dimension: number;
  default_springer_fiber_depth: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  stack_id: string;
  classification: string;
  group_rank: number;
  strata_dimension: number;
  springer_fiber_depth: number;
  satake_gain: number;
  orbital_integral_residual: number;
  tannakian_satake_coherence: number;
  satake_suppression_db: number;
  automorphic_unitarity_pct: number;
  geometric_satake_locked: boolean;
  status: string;
  timestamp: number;
}

export default function GeometricSatakeAffineStudio() {
  const [stacks, setStacks] = useState<SatakeStack[]>([]);
  const [selectedStack, setSelectedStack] = useState<string>('SATAKE-PGL2-GR-01');
  const [groupRank, setGroupRank] = useState<number>(4);
  const [strataDim, setStrataDim] = useState<number>(12);
  const [springerDepth, setSpringerDepth] = useState<number>(6);
  const [satakeGain, setSatakeGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchStacks = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/geometric-satake-affine/stacks');
      const data = (await res.json().catch(() => ({}))) as {
        stacks?: SatakeStack[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Geometric Satake stacks');
      }
      if (data.stacks) {
        setStacks(data.stacks);
        if (data.stacks.length > 0) {
          setSelectedStack((prev) => prev || data.stacks![0].stack_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Geometric Satake stacks'
      );
    }
  }, []);

  useEffect(() => {
    fetchStacks();
  }, [fetchStacks]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/geometric-satake-affine/seal-satake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stack_id: selectedStack,
          group_rank: groupRank,
          strata_dimension: strataDim,
          springer_fiber_depth: springerDepth,
          satake_gain: satakeGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Geometric Satake seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Geometric Satake seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-300">
              Capability 160: Geometric Satake Equivalence &amp; Affine Springer Shield
            </h2>
            <p className="text-sm text-slate-400">
              Affine Grassmannian Gr_G perverse sheaves, Tannakian dual Rep(G^v) &amp; Arthur-Selberg endoscopic transfers
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchStacks}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-center justify-between bg-red-950/50 border border-red-500/40 text-red-300 p-4 rounded-lg text-sm"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-400 hover:text-red-200 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="satake-stack-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Target Affine Grassmannian Stack
            </label>
            <select
              id="satake-stack-select"
              aria-label="Target Affine Grassmannian Stack"
              value={selectedStack}
              onChange={(e) => {
                setSelectedStack(e.target.value);
                const s = stacks.find((x) => x.stack_id === e.target.value);
                if (s) {
                  setGroupRank(s.default_group_rank);
                  setStrataDim(s.default_strata_dimension);
                  setSpringerDepth(s.default_springer_fiber_depth);
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {stacks.map((s) => (
                <option key={s.stack_id} value={s.stack_id}>
                  {s.stack_id} — {s.classification}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="satake-group-rank" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Reductive Group Rank ({groupRank})
              </label>
              <input
                id="satake-group-rank"
                aria-label="Reductive Group Rank"
                type="range"
                min="1"
                max="16"
                value={groupRank}
                onChange={(e) => setGroupRank(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="satake-strata-dim" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Schubert Strata Dim ({strataDim})
              </label>
              <input
                id="satake-strata-dim"
                aria-label="Schubert Strata Dim"
                type="range"
                min="2"
                max="64"
                value={strataDim}
                onChange={(e) => setStrataDim(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="satake-springer-depth" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Springer Fiber Depth ({springerDepth})
              </label>
              <input
                id="satake-springer-depth"
                aria-label="Springer Fiber Depth"
                type="range"
                min="2"
                max="32"
                value={springerDepth}
                onChange={(e) => setSpringerDepth(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="satake-gain" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Satake Convolution Gain ({satakeGain.toFixed(2)}x)
              </label>
              <input
                id="satake-gain"
                aria-label="Satake Convolution Gain"
                type="range"
                min="0.85"
                max="2.5"
                step="0.05"
                value={satakeGain}
                onChange={(e) => setSatakeGain(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSeal}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-900/30 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Verify Satake Convolution &amp; Lock Springer Fibers</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Geometric Satake Telemetry</span>
            </h3>

            {telemetry ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Status</span>
                  <span className="font-mono text-indigo-400 font-semibold">{telemetry.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Orbital Integral Residual</span>
                  <span className="font-mono text-emerald-400">{telemetry.orbital_integral_residual.toExponential(4)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Tannakian Satake Coherence</span>
                  <span className="font-mono text-indigo-400">{(telemetry.tannakian_satake_coherence * 100).toFixed(5)}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Endoscopic Suppression</span>
                  <span className="font-mono text-purple-400">{telemetry.satake_suppression_db.toFixed(2)} dB</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Automorphic Unitarity</span>
                  <span className="font-mono text-emerald-300">{telemetry.automorphic_unitarity_pct.toFixed(5)}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Geometric Satake Locked</span>
                  <span className="font-mono text-indigo-400">{telemetry.geometric_satake_locked ? 'TRUE' : 'FALSE'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Timestamp</span>
                  <span className="font-mono text-slate-400">{new Date(telemetry.timestamp * 1000).toLocaleTimeString()}</span>
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-600" />
                <p>No active Geometric Satake seal. Configure Schubert parameters and verify convolution.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Langlands-Arthur D-Module Shield</span>
            <span className="font-mono text-indigo-400">Nilpotent Cone Stratification Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
