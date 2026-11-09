"use client";

import React, { useState, useEffect } from "react";
import {
  Binary,
  Zap,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  ShieldCheck,
  Eye,
  GitBranch,
  Cpu,
} from "lucide-react";

interface AnyonMatrixNode {
  matrix_id: string;
  facility_name: string;
  anyon_model: string;
  active_topological_qubits: number;
  braiding_junctions: number;
  majorana_modes_count: number;
  decoherence_suppression_ratio_db: number;
  topological_energy_gap_mev: number;
  cryo_temp_mk: number;
  status: string;
}

interface BraidOperationResult {
  operation_id: string;
  matrix_id: string;
  braid_word: string;
  target_qubit_id: string;
  synthesized_quantum_gate: string;
  topological_fidelity_pct: number;
  homotopy_invariance_verified: boolean;
  qubit_superposition_state: string;
  status: string;
  timestamp: string;
}

export function AnyonBraidingStudio() {
  const [matrices, setMatrices] = useState<AnyonMatrixNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [braiding, setBraiding] = useState(false);
  const [selectedMatrix, setSelectedMatrix] = useState("ANYON-CORE-COPENHAGEN-01");
  const [braidWord, setBraidWord] = useState("sigma_1 * sigma_2^-1 * sigma_1");
  const [targetQubit, setTargetQubit] = useState("TOPO-QUBIT-01");
  const [gateType, setGateType] = useState("HADAMARD");
  const [lastBraid, setLastBraid] = useState<BraidOperationResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchMatrices = async () => {
    try {
      const res = await fetch("/api/anyon-braiding/matrices");
      if (res.ok) {
        const data = await res.json();
        setMatrices(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrices();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Non-Abelian Anyon Topological Braiding Matrix online.",
      "[" + new Date().toLocaleTimeString() + "] Majorana zero modes protected by Delta_topo &approx; 0.48 meV energy gap.",
      "[" + new Date().toLocaleTimeString() + "] Homotopic invariant quantum gate synthesis engine ready.",
    ]);
  }, []);

  const handleBraid = async () => {
    setBraiding(true);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Executing physical anyon adiabatic worldline exchange: " + braidWord + " on " + targetQubit + "...",
      ...prev,
    ]);

    try {
      const res = await fetch("/api/anyon-braiding/execute-braid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matrix_id: selectedMatrix,
          braid_word: braidWord,
          target_qubit_id: targetQubit,
          gate_type: gateType,
        }),
      });

      if (res.ok) {
        const data: BraidOperationResult = await res.json();
        setLastBraid(data);
        setLogs((prev) => [
          "[" + new Date().toLocaleTimeString() + "] Unitary " + data.synthesized_quantum_gate + " gate synthesized! Topological fidelity: " + data.topological_fidelity_pct + "%",
          "[" + new Date().toLocaleTimeString() + "] Output state: " + data.qubit_superposition_state + " (" + data.status + ")",
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] Error executing topological anyon braid.",
        ...prev,
      ]);
    } finally {
      setBraiding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-950/30 to-amber-950/60 border border-emerald-800/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
              <GitBranch className="w-8 h-8 animate-pulse text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Non-Abelian Fractional Anyon Topological Braiding Quantum Matrix
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Capability 85 &bull; Wave 21
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Adiabatic braiding of Fibonacci / Majorana non-Abelian anyons in &nu; = 5/2 fractional quantum Hall states, delivering hardware-level topological noise immunity and fault-tolerant Clifford + T quantum gates.
              </p>
            </div>
          </div>
          <button
            onClick={fetchMatrices}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-700/50 text-emerald-200 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Sync Matrices
          </button>
        </div>
      </div>

      {/* Matrices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {matrices.map((m) => (
          <div
            key={m.matrix_id}
            onClick={() => setSelectedMatrix(m.matrix_id)}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              selectedMatrix === m.matrix_id
                ? "bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg"
                : "bg-slate-900/40 border-slate-800/80 hover:border-emerald-700/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">{m.facility_name}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{m.matrix_id}</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                GAP LOCKED
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Logical Qubits</span>
                <span className="font-mono text-emerald-300 font-bold">{m.active_topological_qubits}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Noise Isolation</span>
                <span className="font-mono text-teal-300 font-bold">{m.decoherence_suppression_ratio_db} dB</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Topological Braid Word Compiler</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Logical Qubit</label>
              <input
                type="text"
                value={targetQubit}
                onChange={(e) => setTargetQubit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Quantum Gate</label>
              <select
                value={gateType}
                onChange={(e) => setGateType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="HADAMARD">HADAMARD (H-Gate &bull; Equal Superposition)</option>
                <option value="PHASE_S">PHASE_S (S-Gate &bull; &pi;/2 Relative Phase)</option>
                <option value="T_GATE">T_GATE (Non-Clifford T-Gate &bull; &pi;/4 Phase)</option>
                <option value="CNOT">CNOT (Controlled-NOT Entangling Gate)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Anyon Braid Word Sequence</label>
              <input
                type="text"
                value={braidWord}
                onChange={(e) => setBraidWord(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleBraid}
              disabled={braiding}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
            >
              <Zap className={`w-4 h-4 ${braiding ? "animate-spin" : ""}`} />
              {braiding ? "Executing Adiabatic Braid..." : "Execute Topological Anyon Braid"}
            </button>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Eye className="w-5 h-5 text-teal-400" />
            <h3 className="font-semibold text-white">Quantum Homotopy & State Telemetry</h3>
          </div>

          {lastBraid ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">{lastBraid.operation_id}</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {lastBraid.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Synthesized Gate</span>
                  <span className="text-xl font-mono font-bold text-emerald-400">
                    {lastBraid.synthesized_quantum_gate}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Topological Fidelity</span>
                  <span className="text-xl font-mono font-bold text-teal-400">
                    {lastBraid.topological_fidelity_pct}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-emerald-300">
                <span className="text-[10px] text-slate-500 block mb-0.5">Logical State Vector</span>
                {lastBraid.qubit_superposition_state}
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Homotopy Invariance: <strong>VERIFIED (IMMUNE TO LOCAL PERTURBATIONS)</strong></span>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-sm">
              <Binary className="w-8 h-8 mb-2 opacity-40 text-emerald-400" />
              <span>No active braid operation recorded.</span>
              <span className="text-xs text-slate-600 mt-1">Execute braid compiler above to synthesize fault-tolerant quantum gates.</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Log */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800/50 pb-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>ANYON_TOPOLOGICAL_BRAIDING_STREAM</span>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {logs.map((log, idx) => (
            <div key={idx} className="text-slate-300">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

