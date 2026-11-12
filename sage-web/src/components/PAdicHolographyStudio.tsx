'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, GitBranch } from 'lucide-react';

interface PAdicTree {
  tree_id: string;
  geometry: string;
  default_prime_p: number;
  default_tree_depth_n: number;
  default_vladimirov_order: number;
  base_fidelity_pct: number;
  base_isolation_db: number;
  status: string;
}

interface SealResult {
  tree_id: string;
  geometry: string;
  prime_base_p: number;
  tree_depth_n: number;
  vladimirov_order: number;
  ultrametric_gain: number;
  bruhat_tits_valence: number;
  vladimirov_spectral_gap: number;
  vladimirov_leak_residual: number;
  ultrametric_isolation_db: number;
  tree_holographic_fidelity_pct: number;
  non_archimedean_certified: boolean;
  status: string;
  timestamp: number;
}

export default function PAdicHolographyStudio() {
  const [trees, setTrees] = useState<PAdicTree[]>([]);
  const [selectedTree, setSelectedTree] = useState<string>('PADIC-BRUHAT-TITS-P3-01');
  const [primeBaseP, setPrimeBaseP] = useState<number>(3);
  const [treeDepthN, setTreeDepthN] = useState<number>(12);
  const [vladimirovOrder, setVladimirovOrder] = useState<number>(2.0);
  const [ultrametricGain, setUltrametricGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchTrees = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/adic-p-adic-holography/trees');
      const data = (await res.json().catch(() => ({}))) as {
        trees?: PAdicTree[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load p-Adic Bruhat-Tits holographic trees');
      }
      if (data.trees) {
        setTrees(data.trees);
        if (data.trees.length > 0) {
          setSelectedTree((prev) => prev || data.trees![0].tree_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load p-Adic Bruhat-Tits holographic trees');
    }
  }, []);

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/adic-p-adic-holography/seal-ultrametric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tree_id: selectedTree,
          prime_base_p: primeBaseP,
          tree_depth_n: treeDepthN,
          vladimirov_order: vladimirovOrder,
          ultrametric_gain: ultrametricGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'p-Adic ultrametric tree seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'p-Adic ultrametric tree seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <GitBranch className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Capability 136: p-Adic Bruhat-Tits Tree AdS/CFT &amp; Ultrametric Berkovich Shield
            </h2>
            <p className="text-sm text-slate-400">
              Non-Archimedean ultrametric strong triangle inequality &amp; Vladimirov fractional spectral gap lock
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchTrees}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Trees</span>
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
        {trees.map((t) => (
          <button
            type="button"
            key={t.tree_id}
            onClick={() => setSelectedTree(t.tree_id)}
            aria-pressed={selectedTree === t.tree_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedTree === t.tree_id
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">{t.tree_id}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {t.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{t.geometry}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Prime p={t.default_prime_p} | Depth n={t.default_tree_depth_n}</div>
              <div>Base Isolation: {t.base_isolation_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              p-Adic Prime Base (p)
            </label>
            <input
              type="number"
              min={2}
              max={97}
              step={1}
              value={primeBaseP}
              onChange={(e) => setPrimeBaseP(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Tree Radial Depth (n)
            </label>
            <input
              type="number"
              min={4}
              max={64}
              step={1}
              value={treeDepthN}
              onChange={(e) => setTreeDepthN(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Vladimirov Order (s)
            </label>
            <input
              type="number"
              min={0.5}
              max={12.0}
              step={0.25}
              value={vladimirovOrder}
              onChange={(e) => setVladimirovOrder(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Ultrametric Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={ultrametricGain}
              onChange={(e) => setUltrametricGain(Number(e.target.value))}
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
          <span>{loading ? 'Sealing Bruhat-Tits Tree...' : 'Seal Ultrametric Bruhat-Tits Tree & Lock Gap'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>p-Adic Holography Telemetry ({telemetry.tree_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Tree Fidelity</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.tree_holographic_fidelity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Ultrametric Isolation</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.ultrametric_isolation_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Vladimirov Gap</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.vladimirov_spectral_gap}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Archimedean Leak</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.vladimirov_leak_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

