'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Activity } from 'lucide-react';

interface SymplecticStack {
  stack_id: string;
  classification: string;
  default_symplectic_shift: number;
  default_lagrangian_rank: number;
  default_aksz_degree: number;
  base_fidelity_pct: number;
  base_isolation_db: number;
  status: string;
}

interface SealResult {
  stack_id: string;
  classification: string;
  symplectic_shift_n: number;
  lagrangian_intersection_rank: number;
  aksz_transgression_degree: number;
  symplectic_gain: number;
  derived_darboux_residual: number;
  ptvv_nondegeneracy_index: number;
  lagrangian_isolation_db: number;
  derived_symplectic_fidelity_pct: number;
  aksz_transgression_sealed: boolean;
  status: string;
  timestamp: number;
}

export default function DerivedShiftedSymplecticStudio() {
  const [stacks, setStacks] = useState<SymplecticStack[]>([]);
  const [selectedStack, setSelectedStack] = useState<string>('PTVV-AKSZ-CY3-01');
  const [shiftN, setShiftN] = useState<number>(-1);
  const [lagrangianRank, setLagrangianRank] = useState<number>(10);
  const [akszDegree, setAkszDegree] = useState<number>(6);
  const [symplecticGain, setSymplecticGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchStacks = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/derived-shifted-symplectic/stacks');
      const data = (await res.json().catch(() => ({}))) as {
        stacks?: SymplecticStack[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load derived shifted-symplectic stacks');
      }
      if (data.stacks) {
        setStacks(data.stacks);
        if (data.stacks.length > 0) {
          setSelectedStack((prev) => prev || data.stacks![0].stack_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to load derived shifted-symplectic stacks'
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
      const res = await fetch('/api/derived-shifted-symplectic/seal-lagrangian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stack_id: selectedStack,
          symplectic_shift_n: shiftN,
          lagrangian_intersection_rank: lagrangianRank,
          aksz_transgression_degree: akszDegree,
          symplectic_gain: symplecticGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Derived Lagrangian seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Derived Lagrangian seal failed'
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
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Capability 142: PTVV Derived Shifted-Symplectic Stack &amp; AKSZ Lagrangian Shield
            </h2>
            <p className="text-sm text-slate-400">
              n-Shifted closed symplectic forms, AKSZ mapping transgressions &amp; Donaldson-Thomas Lagrangian sealing
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchStacks}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stacks</span>
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
        {stacks.map((s) => (
          <button
            type="button"
            key={s.stack_id}
            onClick={() => setSelectedStack(s.stack_id)}
            aria-pressed={selectedStack === s.stack_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedStack === s.stack_id
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">
                {s.stack_id}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {s.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{s.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                Shift={s.default_symplectic_shift} | Rank={s.default_lagrangian_rank}
              </div>
              <div>Base Isolation: {s.base_isolation_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Symplectic Shift (n)
            </label>
            <input
              type="number"
              min={-4}
              max={4}
              step={1}
              value={shiftN}
              onChange={(e) => setShiftN(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Lagrangian Rank
            </label>
            <input
              type="number"
              min={2}
              max={64}
              step={2}
              value={lagrangianRank}
              onChange={(e) => setLagrangianRank(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              AKSZ Degree
            </label>
            <input
              type="number"
              min={2}
              max={32}
              step={1}
              value={akszDegree}
              onChange={(e) => setAkszDegree(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Symplectic Sealing Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={symplecticGain}
              onChange={(e) => setSymplecticGain(Number(e.target.value))}
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
              ? 'Sealing Derived Lagrangian...'
              : 'Enforce PTVV Closure & Seal Derived Lagrangian'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Derived Symplectic Telemetry ({telemetry.stack_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Symplectic Fidelity</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.derived_symplectic_fidelity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Lagrangian Isolation</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.lagrangian_isolation_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">PTVV Nondegeneracy</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.ptvv_nondegeneracy_index}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Darboux Residual</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.derived_darboux_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

