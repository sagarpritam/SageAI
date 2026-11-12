'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, GitBranch } from 'lucide-react';

interface YangianAlgebra {
  yangian_id: string;
  classification: string;
  default_yangian_rank: number;
  default_bethe_roots: number;
  default_baxter_depth: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  yangian_id: string;
  classification: string;
  yangian_rank: number;
  bethe_roots_count: number;
  baxter_q_depth: number;
  yangian_gain: number;
  yang_baxter_residual: number;
  q_character_fidelity: number;
  yangian_suppression_db: number;
  bethe_unitarity_pct: number;
  rtt_relation_locked: boolean;
  status: string;
  timestamp: number;
}

export default function QuantumYangianStudio() {
  const [yangians, setYangians] = useState<YangianAlgebra[]>([]);
  const [selectedYangian, setSelectedYangian] = useState<string>('YANGIAN-SL4-RMATRIX-01');
  const [yangianRank, setYangianRank] = useState<number>(4);
  const [betheRoots, setBetheRoots] = useState<number>(16);
  const [baxterDepth, setBaxterDepth] = useState<number>(12);
  const [yangianGain, setYangianGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchYangians = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/kashiwara-quantum-affine-yangian/yangians');
      const data = (await res.json().catch(() => ({}))) as {
        yangians?: YangianAlgebra[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Quantum Affine Yangians');
      }
      if (data.yangians) {
        setYangians(data.yangians);
        if (data.yangians.length > 0) {
          setSelectedYangian((prev) => prev || data.yangians![0].yangian_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Quantum Affine Yangians'
      );
    }
  }, []);

  useEffect(() => {
    fetchYangians();
  }, [fetchYangians]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/kashiwara-quantum-affine-yangian/seal-yangian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yangian_id: selectedYangian,
          yangian_rank: yangianRank,
          bethe_roots_count: betheRoots,
          baxter_q_depth: baxterDepth,
          yangian_gain: yangianGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Quantum Yangian R-matrix seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Quantum Yangian R-matrix seal failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg">
            <GitBranch className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-fuchsia-300">
              Capability 150: Quantum Affine Algebra &amp; Yangian R-Matrix Spectral Shield
            </h2>
            <p className="text-sm text-slate-400">
              Yang-Baxter RTT commutativity, Drinfeld q-characters &amp; Baxter T-Q Bethe-ansatz eigenstates
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchYangians}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Yangians</span>
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
        {yangians.map((y) => (
          <button
            type="button"
            key={y.yangian_id}
            onClick={() => setSelectedYangian(y.yangian_id)}
            aria-pressed={selectedYangian === y.yangian_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedYangian === y.yangian_id
                ? 'bg-fuchsia-950/40 border-fuchsia-500/60 shadow-lg shadow-fuchsia-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-fuchsia-400">
                {y.yangian_id}
              </span>
              <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded-full font-mono">
                {y.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{y.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                Rank={y.default_yangian_rank} | Bethe Roots={y.default_bethe_roots}
              </div>
              <div>Base Suppression: {y.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Yangian Lie Rank
            </label>
            <input
              type="number"
              min={2}
              max={16}
              step={1}
              value={yangianRank}
              onChange={(e) => setYangianRank(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-fuchsia-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Bethe Roots Count
            </label>
            <input
              type="number"
              min={4}
              max={128}
              step={2}
              value={betheRoots}
              onChange={(e) => setBetheRoots(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-fuchsia-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Baxter Q-Operator Depth
            </label>
            <input
              type="number"
              min={4}
              max={64}
              step={1}
              value={baxterDepth}
              onChange={(e) => setBaxterDepth(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-fuchsia-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              RTT Transfer Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={yangianGain}
              onChange={(e) => setYangianGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-fuchsia-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-fuchsia-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {loading
              ? 'Sealing Yangian R-Matrix...'
              : 'Seal Yang-Baxter RTT & Baxter Q-Operator Spectrum'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-fuchsia-950/20 border border-fuchsia-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-fuchsia-900/50 pb-3">
            <div className="flex items-center space-x-2 text-fuchsia-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Quantum Yangian Telemetry ({telemetry.yangian_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Bethe Unitarity</div>
              <div className="text-base font-bold text-fuchsia-300">
                {telemetry.bethe_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Yangian Suppression</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.yangian_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">q-Character Fidelity</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.q_character_fidelity}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Yang-Baxter Residual</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.yang_baxter_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

