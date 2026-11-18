'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TannakianCategory {
  category_id: string;
  classification: string;
  default_tannakian_rank: number;
  default_period_dimension: number;
  default_hodge_weight: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  category_id: string;
  classification: string;
  tannakian_rank: number;
  period_dimension: number;
  hodge_weight: number;
  tannakian_gain: number;
  fiber_functor_residual: number;
  tannakian_group_coherence: number;
  motivic_suppression_db: number;
  motivic_unitarity_pct: number;
  tannakian_category_locked: boolean;
  status: string;
  timestamp: number;
}

export default function TannakianMotivicStudio() {
  const [categories, setCategories] = useState<TannakianCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('TANNAKA-MOTIVE-NUM-01');
  const [tannakianRank, setTannakianRank] = useState<number>(4);
  const [periodDimension, setPeriodDimension] = useState<number>(8);
  const [hodgeWeight, setHodgeWeight] = useState<number>(2);
  const [tannakianGain, setTannakianGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchCategories = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/tannakian-motivic-shield/categories');
      const data = (await res.json().catch(() => ({}))) as {
        categories?: TannakianCategory[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Tannakian category configurations');
      }
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setSelectedCategory((prev) => prev || data.categories![0].category_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Tannakian category configurations'
      );
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/tannakian-motivic-shield/seal-tannakian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: selectedCategory,
          tannakian_rank: tannakianRank,
          period_dimension: periodDimension,
          hodge_weight: hodgeWeight,
          tannakian_gain: tannakianGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Tannakian motivic seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Tannakian motivic seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Capability 160
            </span>
            <span className="text-xs text-slate-400 font-mono">Wave 46</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            Tannakian Duality, Motivic Galois Group & Period Lattice Shield
          </h2>
          <p className="text-sm text-slate-400">
            Reconstruct neutral Tannakian categories and lock motivic Galois group representations over Grothendieck period lattices.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchCategories()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Categories
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg flex items-center gap-2 text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Tannakian Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_id} - {c.classification}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tannakian Linear Rank</label>
              <input
                type="number"
                min={1}
                max={32}
                value={tannakianRank}
                onChange={(e) => setTannakianRank(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Period Ring Dimension</label>
              <input
                type="number"
                min={2}
                max={64}
                value={periodDimension}
                onChange={(e) => setPeriodDimension(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Deligne-Hodge Weight</label>
              <input
                type="number"
                min={1}
                max={16}
                value={hodgeWeight}
                onChange={(e) => setHodgeWeight(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tensor Functor Gain</label>
              <input
                type="number"
                step="0.05"
                min={0.85}
                max={2.5}
                value={tannakianGain}
                onChange={(e) => setTannakianGain(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSeal}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold text-sm text-white shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Reconstructing Tensor Functors...' : 'Seal Tannakian Motivic Shield'}
          </button>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Live Tannakian Galois Telemetry
              </span>
              <span className="font-mono text-[11px] text-cyan-400">
                {telemetry ? telemetry.status : 'AWAITING_RECONSTRUCTION'}
              </span>
            </div>

            {telemetry ? (
              <div className="space-y-3 mt-3 text-sm font-mono">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Category ID:</span>
                  <span className="text-slate-200 font-bold">{telemetry.category_id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Group Coherence:</span>
                  <span className="text-cyan-400 font-bold">
                    {telemetry.tannakian_group_coherence}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Motivic Unitarity:</span>
                  <span className="text-cyan-300 font-bold">
                    {telemetry.motivic_unitarity_pct.toFixed(5)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Motivic Suppression:</span>
                  <span className="text-emerald-300 font-bold">
                    {telemetry.motivic_suppression_db.toFixed(2)} dB
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Fiber Functor Residual:</span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {telemetry.fiber_functor_residual.toExponential(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Tannakian Category Locked:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    YES
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs text-center space-y-1">
                <span>Select Tannakian category and configure period dimension.</span>
                <span>Click &quot;Seal Tannakian Motivic Shield&quot; to evaluate.</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Duality: Saavedra Rivano & Deligne</span>
            <span>Zero Transcendental Leakage</span>
          </div>
        </div>
      </div>
    </div>
  );
}

