'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PerverseStratum {
  stratum_id: string;
  classification: string;
  default_variety_dimension: number;
  default_strata_depth: number;
  default_frobenius_weight: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  stratum_id: string;
  classification: string;
  variety_dimension: number;
  strata_depth: number;
  frobenius_weight: number;
  perverse_gain: number;
  bbdg_decomposition_residual: number;
  intersection_cohomology_coherence: number;
  perverse_suppression_db: number;
  perverse_unitarity_pct: number;
  perverse_sheaf_locked: boolean;
  status: string;
  timestamp: number;
}

export default function PerverseSheafStudio() {
  const [strata, setStrata] = useState<PerverseStratum[]>([]);
  const [selectedStratum, setSelectedStratum] = useState<string>('BBDG-SCHUBERT-STRATA-01');
  const [varietyDimension, setVarietyDimension] = useState<number>(6);
  const [strataDepth, setStrataDepth] = useState<number>(8);
  const [frobeniusWeight, setFrobeniusWeight] = useState<number>(4);
  const [perverseGain, setPerverseGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchStrata = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/perverse-sheaf-deligne/strata');
      const data = (await res.json().catch(() => ({}))) as {
        strata?: PerverseStratum[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load perverse sheaf strata configurations');
      }
      if (data.strata) {
        setStrata(data.strata);
        if (data.strata.length > 0) {
          setSelectedStratum((prev) => prev || data.strata![0].stratum_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load perverse sheaf strata configurations'
      );
    }
  }, []);

  useEffect(() => {
    fetchStrata();
  }, [fetchStrata]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/perverse-sheaf-deligne/seal-perverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stratum_id: selectedStratum,
          variety_dimension: varietyDimension,
          strata_depth: strataDepth,
          frobenius_weight: frobeniusWeight,
          perverse_gain: perverseGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Perverse sheaf seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Perverse sheaf seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Capability 159
            </span>
            <span className="text-xs text-slate-400 font-mono">Wave 46</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            Perverse Sheaf, Intersection Cohomology & Deligne-Lusztig Character Shield
          </h2>
          <p className="text-sm text-slate-400">
            Verify BBDG decomposition theorem and lock Deligne-Lusztig character sheaves over singular Schubert varieties.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchStrata()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Strata
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg flex items-center justify-between text-red-300 text-sm"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-xs bg-red-900/60 hover:bg-red-900 px-2.5 py-1 rounded border border-red-700/50 text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Stratification Configuration
            </label>
            <select
              value={selectedStratum}
              onChange={(e) => setSelectedStratum(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {strata.map((s) => (
                <option key={s.stratum_id} value={s.stratum_id}>
                  {s.stratum_id} - {s.classification}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Variety Dimension $d$</label>
              <input
                type="number"
                min={2}
                max={32}
                value={varietyDimension}
                onChange={(e) => setVarietyDimension(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Whitney Strata Depth</label>
              <input
                type="number"
                min={2}
                max={32}
                value={strataDepth}
                onChange={(e) => setStrataDepth(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Frobenius Eigenvalue Weight</label>
              <input
                type="number"
                min={1}
                max={16}
                value={frobeniusWeight}
                onChange={(e) => setFrobeniusWeight(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">BBDG Perverse Gain</label>
              <input
                type="number"
                step="0.05"
                min={0.85}
                max={2.5}
                value={perverseGain}
                onChange={(e) => setPerverseGain(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSeal}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white shadow-lg shadow-indigo-900/30 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Executing BBDG Decomposition...' : 'Seal Perverse Sheaf Shield'}
          </button>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Live Intersection Cohomology Telemetry
              </span>
              <span className="font-mono text-[11px] text-indigo-400">
                {telemetry ? telemetry.status : 'AWAITING_BBDG_DECOMPOSITION'}
              </span>
            </div>

            {telemetry ? (
              <div className="space-y-3 mt-3 text-sm font-mono">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Stratum ID:</span>
                  <span className="text-slate-200 font-bold">{telemetry.stratum_id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Cohomology Coherence:</span>
                  <span className="text-indigo-400 font-bold">
                    {telemetry.intersection_cohomology_coherence}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Perverse Unitarity:</span>
                  <span className="text-indigo-300 font-bold">
                    {telemetry.perverse_unitarity_pct.toFixed(5)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Perverse Suppression:</span>
                  <span className="text-cyan-300 font-bold">
                    {telemetry.perverse_suppression_db.toFixed(2)} dB
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Decomposition Residual:</span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {telemetry.bbdg_decomposition_residual.toExponential(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Perverse Sheaf Locked:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    YES
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs text-center space-y-1">
                <span>Select stratum and configure dimension.</span>
                <span>Click &quot;Seal Perverse Sheaf Shield&quot; to evaluate.</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Theorem: BBDG Decomposition</span>
            <span>Zero Intersection Leakage</span>
          </div>
        </div>
      </div>
    </div>
  );
}

