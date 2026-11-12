'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Box } from 'lucide-react';

interface SatakeSheaf {
  sheaf_id: string;
  classification: string;
  default_lie_rank: number;
  default_crystal_depth: number;
  default_polytope_vertices: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  sheaf_id: string;
  classification: string;
  dual_group_rank: number;
  crystal_operator_depth: number;
  mv_polytope_vertices: number;
  satake_gain: number;
  mv_tropical_polytope_bound: number;
  perverse_ic_sheaf_purity: number;
  crystal_suppression_db: number;
  satake_unitarity_pct: number;
  lusztig_canonical_basis_locked: boolean;
  status: string;
  timestamp: number;
}

export default function GeometricSatakeStudio() {
  const [sheaves, setSheaves] = useState<SatakeSheaf[]>([]);
  const [selectedSheaf, setSelectedSheaf] = useState<string>('SATAKE-MV-SL4-01');
  const [dualRank, setDualRank] = useState<number>(4);
  const [crystalDepth, setCrystalDepth] = useState<number>(14);
  const [mvVertices, setMvVertices] = useState<number>(12);
  const [satakeGain, setSatakeGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchSheaves = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/geometric-satake-kashiwara/sheaves');
      const data = (await res.json().catch(() => ({}))) as {
        sheaves?: SatakeSheaf[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Geometric Satake perverse sheaves');
      }
      if (data.sheaves) {
        setSheaves(data.sheaves);
        if (data.sheaves.length > 0) {
          setSelectedSheaf((prev) => prev || data.sheaves![0].sheaf_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to load Geometric Satake perverse sheaves'
      );
    }
  }, []);

  useEffect(() => {
    fetchSheaves();
  }, [fetchSheaves]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/geometric-satake-kashiwara/seal-crystal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheaf_id: selectedSheaf,
          dual_group_rank: dualRank,
          crystal_operator_depth: crystalDepth,
          mv_polytope_vertices: mvVertices,
          satake_gain: satakeGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Geometric Satake crystal seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Geometric Satake crystal seal failed'
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
            <Box className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Capability 144: Geometric Satake &amp; Kashiwara Crystal-Basis Perverse Shield
            </h2>
            <p className="text-sm text-slate-400">
              Mirković-Vilonen affine Grassmannian cycles, Kashiwara crystal operators &amp; Lusztig IC purity
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchSheaves}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Sheaves</span>
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
        {sheaves.map((s) => (
          <button
            type="button"
            key={s.sheaf_id}
            onClick={() => setSelectedSheaf(s.sheaf_id)}
            aria-pressed={selectedSheaf === s.sheaf_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedSheaf === s.sheaf_id
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">
                {s.sheaf_id}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {s.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{s.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                Rank={s.default_lie_rank} | Crystal={s.default_crystal_depth}
              </div>
              <div>Base Suppression: {s.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Dual Group Rank
            </label>
            <input
              type="number"
              min={2}
              max={16}
              step={1}
              value={dualRank}
              onChange={(e) => setDualRank(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Crystal Operator Depth
            </label>
            <input
              type="number"
              min={4}
              max={128}
              step={2}
              value={crystalDepth}
              onChange={(e) => setCrystalDepth(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              MV Polytope Vertices
            </label>
            <input
              type="number"
              min={4}
              max={64}
              step={2}
              value={mvVertices}
              onChange={(e) => setMvVertices(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Satake Equivalence Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={satakeGain}
              onChange={(e) => setSatakeGain(Number(e.target.value))}
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
              ? 'Sealing Crystal Sheaf...'
              : 'Verify Satake Equivalence & Seal Kashiwara Crystal Basis'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Geometric Satake Telemetry ({telemetry.sheaf_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Satake Unitarity</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.satake_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Crystal Suppression</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.crystal_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Perverse IC Purity</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.perverse_ic_sheaf_purity}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">MV Polytope Bound</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.mv_tropical_polytope_bound}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

