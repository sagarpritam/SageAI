'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Infinity as InfinityIcon } from 'lucide-react';

interface CobordismFunctor {
  cobordism_id: string;
  classification: string;
  default_dimension_n: number;
  default_dualizable_cells: number;
  default_stratified_seams: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  cobordism_id: string;
  classification: string;
  category_dimension_n: number;
  dualizable_cells: number;
  stratified_seams: number;
  cobordism_gain: number;
  gluing_obstruction_residual: number;
  cobordism_functor_index: number;
  bordism_suppression_db: number;
  infinity_unitarity_pct: number;
  full_dualizability_locked: boolean;
  status: string;
  timestamp: number;
}

export default function InfinityCobordismStudio() {
  const [cobordisms, setCobordisms] = useState<CobordismFunctor[]>([]);
  const [selectedCobordism, setSelectedCobordism] = useState<string>('BORDISM-INF3-FRAMED-01');
  const [dimensionN, setDimensionN] = useState<number>(3);
  const [dualizableCells, setDualizableCells] = useState<number>(18);
  const [stratifiedSeams, setStratifiedSeams] = useState<number>(14);
  const [cobordismGain, setCobordismGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchCobordisms = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/infinity-topos-lurie-cobordism/cobordisms');
      const data = (await res.json().catch(() => ({}))) as {
        cobordisms?: CobordismFunctor[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load infinity cobordism functors');
      }
      if (data.cobordisms) {
        setCobordisms(data.cobordisms);
        if (data.cobordisms.length > 0) {
          setSelectedCobordism((prev) => prev || data.cobordisms![0].cobordism_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load infinity cobordism functors'
      );
    }
  }, []);

  useEffect(() => {
    fetchCobordisms();
  }, [fetchCobordisms]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/infinity-topos-lurie-cobordism/seal-cobordism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cobordism_id: selectedCobordism,
          category_dimension_n: dimensionN,
          dualizable_cells: dualizableCells,
          stratified_seams: stratifiedSeams,
          cobordism_gain: cobordismGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Infinity cobordism seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Infinity cobordism seal failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <InfinityIcon className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Capability 151: Lurie (infinity,n)-Category Bordism Hypothesis Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Framed extended TQFT functors, full k-morphism dualizability &amp; stratified defect-seam gluing invariants
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchCobordisms}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Functors</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cobordisms.map((c) => (
          <button
            type="button"
            key={c.cobordism_id}
            onClick={() => setSelectedCobordism(c.cobordism_id)}
            aria-pressed={selectedCobordism === c.cobordism_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedCobordism === c.cobordism_id
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">
                {c.cobordism_id}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {c.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{c.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                n={c.default_dimension_n} | Cells={c.default_dualizable_cells}
              </div>
              <div>Base Suppression: {c.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Category Dimension (n)
            </label>
            <input
              type="number"
              min={1}
              max={12}
              step={1}
              value={dimensionN}
              onChange={(e) => setDimensionN(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Dualizable Cells
            </label>
            <input
              type="number"
              min={4}
              max={128}
              step={2}
              value={dualizableCells}
              onChange={(e) => setDualizableCells(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Stratified Defect Seams
            </label>
            <input
              type="number"
              min={4}
              max={64}
              step={1}
              value={stratifiedSeams}
              onChange={(e) => setStratifiedSeams(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Framing Coherence Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={cobordismGain}
              onChange={(e) => setCobordismGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-emerald-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {loading
              ? 'Sealing Infinity Cobordism Functor...'
              : 'Seal Framed Cobordism & Full k-Morphism Dualizability'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Infinity Cobordism Telemetry ({telemetry.cobordism_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Infinity Unitarity</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.infinity_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Bordism Suppression</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.bordism_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Functor Index</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.cobordism_functor_index}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Gluing Obstruction</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.gluing_obstruction_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

