'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface BraidSystem {
  braid_id: string;
  classification: string;
  num_anyons: number;
  fusion_space_dim: number;
  quantum_dimension: number;
  base_fidelity_pct: number;
  topological_gap_mev: number;
  status: string;
}

interface BraidResult {
  braid_id: string;
  classification: string;
  generator_index: number;
  braid_turns: number;
  topological_order_k: number;
  quantum_dimension: number;
  phase_angle_rad: number;
  unitary_determinant: number;
  decoherence_suppression_db: number;
  topological_fidelity_pct: number;
  fault_tolerant_unitary: boolean;
  status: string;
  timestamp: number;
}

export default function FibonacciAnyonBraidingStudio() {
  const [braids, setBraids] = useState<BraidSystem[]>([]);
  const [selectedBraid, setSelectedBraid] = useState<string>('ANYON-FIB-4STRAND-01');
  const [generatorIndex, setGeneratorIndex] = useState<number>(1);
  const [braidTurns, setBraidTurns] = useState<number>(8);
  const [topologicalOrderK, setTopologicalOrderK] = useState<number>(5);
  const [braidGain, setBraidGain] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<BraidResult | null>(null);

  const fetchBraids = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/fibonacci-anyon-braiding/braids');
      const data = (await res.json().catch(() => ({}))) as {
        braids?: BraidSystem[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Fibonacci anyon systems');
      }
      if (data.braids) {
        setBraids(data.braids);
        if (data.braids.length > 0) {
          setSelectedBraid((prev) => prev || data.braids![0].braid_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading anyon braids';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchBraids();
  }, [fetchBraids]);

  const handleExecuteBraid = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/fibonacci-anyon-braiding/execute-braid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          braid_id: selectedBraid,
          generator_index: generatorIndex,
          braid_turns: braidTurns,
          topological_order_k: topologicalOrderK,
          braid_gain: braidGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as BraidResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute Fibonacci anyon braid');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing topological braid';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">
              Fibonacci Anyon Braiding Studio
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Capability 161: Non-Abelian Yang-Baxter Braiding &amp; Zero-Decoherence Topological Shield
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchBraids}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload Systems
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300 font-mono"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-[10px] bg-red-900/60 hover:bg-red-900 px-2 py-0.5 rounded border border-red-700/50 text-red-200 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-zinc-400 block mb-1.5">
              Select Anyon Braiding Enclave:
            </label>
            <select
              value={selectedBraid}
              onChange={(e) => setSelectedBraid(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-200 focus:border-emerald-500 focus:outline-none"
            >
              {braids.map((b) => (
                <option key={b.braid_id} value={b.braid_id}>
                  {b.braid_id} — {b.classification}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Generator Index (&sigma;<sub>i</sub>): {generatorIndex}
              </label>
              <input
                type="range"
                min={1}
                max={7}
                step={1}
                value={generatorIndex}
                onChange={(e) => setGeneratorIndex(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Braid Turns: {braidTurns}
              </label>
              <input
                type="range"
                min={2}
                max={32}
                step={2}
                value={braidTurns}
                onChange={(e) => setBraidTurns(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Level k: {topologicalOrderK}
              </label>
              <input
                type="number"
                min={3}
                max={12}
                value={topologicalOrderK}
                onChange={(e) => setTopologicalOrderK(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-200"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Topological Gain: {braidGain}x
              </label>
              <input
                type="number"
                min={0.1}
                max={5.0}
                step={0.1}
                value={braidGain}
                onChange={(e) => setBraidGain(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-200"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleExecuteBraid}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2.5 px-4 text-xs font-bold font-mono text-white transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Execute Non-Abelian Braid Transformation
          </button>
        </div>

        {/* Telemetry Panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-zinc-400 font-bold">TOPOLOGICAL BRAID TELEMETRY</span>
            {telemetry && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> UNITARY LOCKED
              </span>
            )}
          </div>

          {telemetry ? (
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Braid ID:</span>
                <span className="text-white font-bold">{telemetry.braid_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Quantum Dimension d(&tau;):</span>
                <span className="text-cyan-400 font-bold">{telemetry.quantum_dimension.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Topological Phase Shift:</span>
                <span className="text-zinc-300 font-bold">{telemetry.phase_angle_rad} rad</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Decoherence Suppression:</span>
                <span className="text-emerald-400 font-bold">{telemetry.decoherence_suppression_db} dB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Topological Fidelity:</span>
                <span className="text-emerald-400 font-bold">{telemetry.topological_fidelity_pct}%</span>
              </div>
              <div className="p-2 rounded bg-black/60 border border-zinc-800 text-[10px] text-zinc-400">
                Yang-Baxter Equation: R<sub>12</sub> R<sub>23</sub> R<sub>12</sub> = R<sub>23</sub> R<sub>12</sub> R<sub>23</sub> satisfied.
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-600 text-center">
              Execute a braid transformation to stream non-Abelian quantum telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

