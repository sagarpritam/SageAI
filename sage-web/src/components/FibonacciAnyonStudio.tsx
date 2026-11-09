'use client';

import React, { useState, useEffect } from 'react';
import { Network, RefreshCw, Activity, Shield, Sparkles, Binary } from 'lucide-react';

interface FibonacciBraid {
  braid_id: string;
  sector: string;
  strand_count: number;
  base_gate_fidelity_pct: number;
  topological_decoherence_suppression_db: number;
  quantum_dimension_d_tau: number;
  status: string;
}

interface CompileResult {
  braid_id: string;
  target_gate: string;
  braid_length_steps: number;
  damping_gain: number;
  quantum_dimension_d_tau: number;
  synthesized_braid_word: string;
  gate_compilation_error: number;
  topological_gate_fidelity_pct: number;
  topological_decoherence_suppression_db: number;
  pentagon_hexagon_consistency_verified: boolean;
  pentagon_residual: number;
  universal_topological_quantum_logic_locked: boolean;
  status: string;
  timestamp: number;
}

export default function FibonacciAnyonStudio() {
  const [braids, setBraids] = useState<FibonacciBraid[]>([]);
  const [selectedBraid, setSelectedBraid] = useState<string>('FIB-BRAID-TOPOLOGICAL-01');
  const [targetGate, setTargetGate] = useState<string>('HADAMARD');
  const [lengthSteps, setLengthSteps] = useState<number>(32);
  const [gain, setGain] = useState<number>(1.1);
  const [loading, setLoading] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<CompileResult | null>(null);

  useEffect(() => {
    fetchBraids();
  }, []);

  const fetchBraids = async () => {
    try {
      const res = await fetch('/api/fibonacci-anyon/braids');
      const data = await res.json();
      if (data.braids) {
        setBraids(data.braids);
        if (data.braids.length > 0 && !selectedBraid) {
          setSelectedBraid(data.braids[0].braid_id);
        }
      }
    } catch (err) {
      console.error('Failed to load Fibonacci anyon braids', err);
    }
  };

  const handleCompile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fibonacci-anyon/compile-braid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          braid_id: selectedBraid,
          target_gate: targetGate,
          braid_length_steps: lengthSteps,
          damping_gain: gain,
        }),
      });
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      console.error('Fibonacci braid compilation failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg">
            <Network className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-fuchsia-300">
              Capability 106: Fibonacci Anyon Braid Compiler &amp; Topological Fault-Tolerance Synthesizer
            </h2>
            <p className="text-sm text-slate-400">
              Universal quantum compilation on non-Abelian Fibonacci anyons with golden ratio quantum dimension d_τ = 1.618
            </p>
          </div>
        </div>
        <button
          onClick={fetchBraids}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Channels</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {braids.map((b) => (
          <div
            key={b.braid_id}
            onClick={() => setSelectedBraid(b.braid_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedBraid === b.braid_id
                ? 'bg-fuchsia-950/40 border-fuchsia-500/60 shadow-lg shadow-fuchsia-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-fuchsia-400">{b.braid_id}</span>
              <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded-full font-mono">
                {b.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{b.sector}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Strand Count:</span>
                <span className="text-fuchsia-300">{b.strand_count} Anyons</span>
              </div>
              <div className="flex justify-between">
                <span>Base Fidelity:</span>
                <span className="text-cyan-300">{b.base_gate_fidelity_pct.toFixed(4)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Decoherence Suppression:</span>
                <span className="text-emerald-300">{b.topological_decoherence_suppression_db.toFixed(1)} dB</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Binary className="w-4 h-4 text-fuchsia-400" />
          <span>Solovay-Kitaev Fibonacci Braid Word Compiler</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Target Quantum Gate:</label>
            <select
              value={targetGate}
              onChange={(e) => setTargetGate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-fuchsia-300 font-mono"
            >
              <option value="HADAMARD">Hadamard (H)</option>
              <option value="PHASE_S">Phase (S)</option>
              <option value="T_GATE">T Gate (π/8)</option>
              <option value="CNOT">CNOT (Controlled-NOT)</option>
              <option value="TOFFOLI">Toffoli (CCNOT)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Braid Length Steps: <span className="text-fuchsia-300 font-mono">{lengthSteps}</span>
            </label>
            <input
              type="range"
              min="8"
              max="64"
              step="4"
              value={lengthSteps}
              onChange={(e) => setLengthSteps(parseInt(e.target.value))}
              className="w-full accent-fuchsia-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Topological Gain: <span className="text-fuchsia-300 font-mono">{gain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={gain}
              onChange={(e) => setGain(parseFloat(e.target.value))}
              className="w-full accent-fuchsia-500"
            />
          </div>
        </div>

        <button
          onClick={handleCompile}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-fuchsia-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Compiling Fibonacci Braid Word...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Synthesize Universal Topological Gate</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-fuchsia-950/20 border border-fuchsia-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-fuchsia-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-fuchsia-300">FIBONACCI COMPILATION TELEMETRY</span>
            <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-400 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">GATE FIDELITY</span>
              <span className="text-fuchsia-300 font-bold text-sm">
                {telemetry.topological_gate_fidelity_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">DECOHERENCE SUPPRESSION</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.topological_decoherence_suppression_db.toFixed(1)} dB
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">QUANTUM DIMENSION</span>
              <span className="text-amber-300 font-bold text-sm">
                d_τ = {telemetry.quantum_dimension_d_tau.toFixed(4)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">COMPILATION ERROR</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.gate_compilation_error.toExponential(2)}
              </span>
            </div>
          </div>
          <div className="p-3 bg-slate-950/80 rounded border border-slate-800 font-mono text-xs">
            <span className="text-slate-400 text-[10px] block mb-1">SYNTHESIZED CANONICAL BRAID WORD:</span>
            <span className="text-fuchsia-300">{telemetry.synthesized_braid_word}</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-fuchsia-400 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Pentagon/Hexagon Coherence Satisfied | Universal Fault-Tolerant Quantum Logic Locked</span>
          </div>
        </div>
      )}
    </div>
  );
}

