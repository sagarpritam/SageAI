'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, GitBranch } from 'lucide-react';

interface MotivicComplex {
  motive_id: string;
  sector: string;
  default_tate_weight: number;
  default_beilinson_order: number;
  default_hodge_rank: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  motive_id: string;
  sector: string;
  tate_twist_weight: number;
  beilinson_regulator_order: number;
  hodge_filtration_rank: number;
  motivic_gain: number;
  beilinson_regulator_norm: number;
  period_drift_residual: number;
  period_suppression_db: number;
  motivic_unitarity_pct: number;
  galois_action_equivariant: boolean;
  status: string;
  timestamp: number;
}

export default function MotivicGaloisStudio() {
  const [motives, setMotives] = useState<MotivicComplex[]>([]);
  const [selectedMotive, setSelectedMotive] = useState<string>('MOTIVE-MIXED-TATE-01');
  const [tateWeight, setTateWeight] = useState<number>(4);
  const [beilinsonOrder, setBeilinsonOrder] = useState<number>(6);
  const [hodgeRank, setHodgeRank] = useState<number>(8);
  const [motivicGain, setMotivicGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchMotives = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/motivic-galois-cohomology/motives');
      const data = (await res.json().catch(() => ({}))) as {
        motives?: MotivicComplex[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Motivic Galois complexes');
      }
      if (data.motives) {
        setMotives(data.motives);
        if (data.motives.length > 0) {
          setSelectedMotive((prev) => prev || data.motives![0].motive_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load Motivic Galois complexes');
    }
  }, []);

  useEffect(() => {
    fetchMotives();
  }, [fetchMotives]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/motivic-galois-cohomology/seal-motive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motive_id: selectedMotive,
          tate_twist_weight: tateWeight,
          beilinson_regulator_order: beilinsonOrder,
          hodge_filtration_rank: hodgeRank,
          motivic_gain: motivicGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Motivic Galois period seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Motivic Galois period seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <GitBranch className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-300">
              Capability 138: Motivic Galois Group &amp; Voevodsky Mixed-Tate Shield
            </h2>
            <p className="text-sm text-slate-400">
              Voevodsky A^1-homotopy algebraic cycles, Beilinson regulator bounds &amp; cosmic Galois period locks
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchMotives}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Motives</span>
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
        {motives.map((m) => (
          <button
            type="button"
            key={m.motive_id}
            onClick={() => setSelectedMotive(m.motive_id)}
            aria-pressed={selectedMotive === m.motive_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedMotive === m.motive_id
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-cyan-400">{m.motive_id}</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                {m.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{m.sector}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Tate w={m.default_tate_weight} | Hodge={m.default_hodge_rank}</div>
              <div>Base Suppression: {m.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Tate Twist Weight (n)
            </label>
            <input
              type="number"
              min={1}
              max={32}
              step={1}
              value={tateWeight}
              onChange={(e) => setTateWeight(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Beilinson Regulator Order
            </label>
            <input
              type="number"
              min={2}
              max={48}
              step={1}
              value={beilinsonOrder}
              onChange={(e) => setBeilinsonOrder(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Hodge Filtration Rank
            </label>
            <input
              type="number"
              min={2}
              max={64}
              step={2}
              value={hodgeRank}
              onChange={(e) => setHodgeRank(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Motivic Galois Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={motivicGain}
              onChange={(e) => setMotivicGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-cyan-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Locking Motivic Periods...' : 'Lock Mixed-Tate Filtration & Seal Motivic Galois Group'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-cyan-950/20 border border-cyan-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/50 pb-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Motivic Galois Telemetry ({telemetry.motive_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Motivic Unitarity</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.motivic_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Period Suppression</div>
              <div className="text-base font-bold text-sky-300">
                {telemetry.period_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Beilinson Regulator</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.beilinson_regulator_norm}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Period Drift Residual</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.period_drift_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

