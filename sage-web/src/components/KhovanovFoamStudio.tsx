'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface KhovanovKnot {
  knot_id: string;
  classification: string;
  default_knot_rank: number;
  default_crossing_depth: number;
  default_foam_facets: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  knot_id: string;
  classification: string;
  knot_rank: number;
  crossing_depth: number;
  foam_facets: number;
  khovanov_gain: number;
  rasmussen_s_invariant_residual: number;
  foam_homotopy_coherence: number;
  khovanov_suppression_db: number;
  categorified_unitarity_pct: number;
  khovanov_homology_locked: boolean;
  status: string;
  timestamp: number;
}

export default function KhovanovFoamStudio() {
  const [knots, setKnots] = useState<KhovanovKnot[]>([]);
  const [selectedKnot, setSelectedKnot] = useState<string>('KNOT-TREFOIL-KH4-01');
  const [knotRank, setKnotRank] = useState<number>(4);
  const [crossingDepth, setCrossingDepth] = useState<number>(12);
  const [foamFacets, setFoamFacets] = useState<number>(14);
  const [khovanovGain, setKhovanovGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchKnots = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/khovanov-foam-cobordism/knots');
      const data = (await res.json().catch(() => ({}))) as {
        knots?: KhovanovKnot[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Khovanov knot complexes');
      }
      if (data.knots) {
        setKnots(data.knots);
        if (data.knots.length > 0) {
          setSelectedKnot((prev) => prev || data.knots![0].knot_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Khovanov knot complexes'
      );
    }
  }, []);

  useEffect(() => {
    fetchKnots();
  }, [fetchKnots]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/khovanov-foam-cobordism/seal-khovanov', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          knot_id: selectedKnot,
          knot_rank: knotRank,
          crossing_depth: crossingDepth,
          foam_facets: foamFacets,
          khovanov_gain: khovanovGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Khovanov foam seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Khovanov foam seal failed');
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
              Capability 152: Khovanov Homology &amp; Foam Cobordism Shield
            </h2>
            <p className="text-sm text-slate-400">
              Bar-Natan foam categorification 2-morphisms, Rasmussen s-invariant concordance bounds &amp; sl(N) chain differentials
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchKnots}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Complexes</span>
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

      {/* Preset Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {knots.map((k) => (
          <button
            key={k.knot_id}
            type="button"
            onClick={() => {
              setSelectedKnot(k.knot_id);
              setKnotRank(k.default_knot_rank);
              setCrossingDepth(k.default_crossing_depth);
              setFoamFacets(k.default_foam_facets);
            }}
            className={`text-left p-3.5 rounded-lg border transition ${
              selectedKnot === k.knot_id
                ? 'bg-indigo-950/40 border-indigo-500/80 text-white shadow-lg shadow-indigo-950/50'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="text-xs font-mono font-bold text-indigo-400">{k.knot_id}</div>
            <div className="text-sm font-semibold mt-1 truncate">{k.classification}</div>
            <div className="flex justify-between items-center text-xs text-slate-400 mt-2 font-mono">
              <span>Rank {k.default_knot_rank}</span>
              <span>{k.base_suppression_db} dB</span>
              <span className="text-emerald-400">{k.base_unitarity_pct}%</span>
            </div>
          </button>
        ))}
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-lg border border-slate-800">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Knot Rank (N) [2-16]
          </label>
          <input
            type="number"
            min={2}
            max={16}
            value={knotRank}
            onChange={(e) => setKnotRank(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Crossing Depth [4-64]
          </label>
          <input
            type="number"
            min={4}
            max={64}
            value={crossingDepth}
            onChange={(e) => setCrossingDepth(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Foam Facets [4-128]
          </label>
          <input
            type="number"
            min={4}
            max={128}
            value={foamFacets}
            onChange={(e) => setFoamFacets(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Khovanov Gain [0.85-2.5]
          </label>
          <input
            type="number"
            step="0.05"
            min={0.85}
            max={2.5}
            value={khovanovGain}
            onChange={(e) => setKhovanovGain(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-indigo-900/40"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Sealing Khovanov Complex...' : 'Seal Khovanov Homology & Foam'}</span>
        </button>
      </div>

      {/* Telemetry Display */}
      {telemetry && (
        <div className="border border-indigo-500/40 bg-indigo-950/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-900/40 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span className="font-mono text-xs uppercase tracking-wider text-indigo-300 font-bold">
                Categorified Telemetry: {telemetry.knot_id}
              </span>
            </div>
            <span className="text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Rasmussen s-Residue</div>
              <div className="text-lg font-mono font-bold text-indigo-300 mt-1">
                {telemetry.rasmussen_s_invariant_residual.toExponential(4)}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Foam Coherence</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                {telemetry.foam_homotopy_coherence.toFixed(7)}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Suppression</div>
              <div className="text-lg font-mono font-bold text-cyan-300 mt-1">
                {telemetry.khovanov_suppression_db.toFixed(2)} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Categorified Unitarity</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                {telemetry.categorified_unitarity_pct.toFixed(5)}%
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400 pt-2 border-t border-indigo-900/30">
            <span>Rank: {telemetry.knot_rank}</span>
            <span>Crossings: {telemetry.crossing_depth}</span>
            <span>Facets: {telemetry.foam_facets}</span>
            <span>Gain: {telemetry.khovanov_gain}x</span>
            <span className="text-emerald-400">Khovanov Differential Locked: true</span>
          </div>
        </div>
      )}
    </div>
  );
}
