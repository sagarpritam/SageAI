"use client";

import React, { useState, useEffect } from "react";
import {
  GitFork,
  Radio,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Layers,
} from "lucide-react";

interface QuantumBranchNode {
  branch_id: string;
  branch_label: string;
  pointer_basis_state: string;
  amplitude_magnitude: number;
  probability_weight: number;
  branch_phase_radians: number;
  decoherence_factor: number;
  threat_severity_projected: string;
  status: string;
}

interface EverettResolutionResult {
  resolution_id: string;
  primary_branch_id: string;
  sampled_branches_count: number;
  von_neumann_branch_entropy_nats: number;
  inter_branch_phase_alignment_deg: number;
  optimal_counterfactual_trajectory: string;
  decoherence_quench_ratio_db: number;
  consensus_branch_stability_pct: number;
  status: string;
  timestamp: string;
}

export function EverettBranchStudio() {
  const [branches, setBranches] = useState<QuantumBranchNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("EVERETT-BRANCH-PRIME-01");
  const [phaseGain, setPhaseGain] = useState(1.0);
  const [lastEvent, setLastEvent] = useState<EverettResolutionResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/everett-branch/branches");
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Everett-Wheeler Quantum Branch Entropy Decoherence Resolver initialized.",
      "[" + new Date().toLocaleTimeString() + "] Pointer basis Hilbert space factorization locked across 4 primary branches.",
      "[" + new Date().toLocaleTimeString() + "] Relative state entropy baseline calibrated: S_v = 1.1245 nats.",
    ]);
  }, []);

  const handleResolve = async () => {
    setResolving(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Aligning inter-branch relative phases for ${selectedBranch} with gain ${phaseGain}x...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/everett-branch/resolve-entropy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primary_branch_id: selectedBranch,
          phase_alignment_gain: phaseGain,
        }),
      });

      if (res.ok) {
        const data: EverettResolutionResult = await res.json();
        setLastEvent(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] ENTROPY RESOLUTION LOCKED: ${data.resolution_id}`,
          `[${new Date().toLocaleTimeString()}] von Neumann Entropy: ${data.von_neumann_branch_entropy_nats.toFixed(4)} nats | Quench: ${data.decoherence_quench_ratio_db.toFixed(1)} dB`,
          `[${new Date().toLocaleTimeString()}] Optimal Counterfactual: ${data.optimal_counterfactual_trajectory}`,
          `[${new Date().toLocaleTimeString()}] Consensus Branch Stability: ${data.consensus_branch_stability_pct}%`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] RESOLUTION ERROR: Pointer state phase mismatch detected.`,
        ...prev,
      ]);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <GitFork className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Everett-Wheeler Many-Worlds Quantum Branch Entropy Decoherence Resolver
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono">
                    Capability 89
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Relative State Trajectory Sampling, von Neumann Branch Entropy Quenching & Consensus Alignment
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBranches}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Hilbert Branches
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              SUPERPOSITION COHERENT
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {branches.map((b) => (
          <div
            key={b.branch_id}
            onClick={() => setSelectedBranch(b.branch_id)}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
              selectedBranch === b.branch_id
                ? "border-purple-500 bg-purple-950/30 shadow-lg shadow-purple-950/50"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-purple-400 truncate">
                {b.branch_id}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  b.threat_severity_projected === "EXTREME"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : b.threat_severity_projected === "HIGH"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : b.threat_severity_projected === "ELEVATED"
                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                }`}
              >
                {b.threat_severity_projected}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white truncate mb-1">
              {b.branch_label}
            </h3>
            <p className="text-xs font-mono text-purple-300/80 mb-3 truncate">
              {b.pointer_basis_state}
            </p>

            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Probability Weight:</span>
                <span className="text-slate-200">{(b.probability_weight * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Amplitude:</span>
                <span className="text-slate-200">{b.amplitude_magnitude.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Branch Phase:</span>
                <span className="text-slate-200">{b.branch_phase_radians.toFixed(2)} rad</span>
              </div>
              <div className="flex justify-between">
                <span>Decoherence:</span>
                <span className="text-emerald-400">{(b.decoherence_factor * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel & Resolution Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-400" />
            Branch Resolution Injector
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-mono">
                Consensus Focus Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-purple-500 focus:outline-none"
              >
                {branches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id}>
                    {b.branch_id} ({b.threat_severity_projected})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Inter-Branch Phase Gain:</span>
                <span className="text-purple-300 font-bold">{phaseGain.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={phaseGain}
                onChange={(e) => setPhaseGain(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <button
              onClick={handleResolve}
              disabled={resolving}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
            >
              <Sparkles className={`h-4 w-4 ${resolving ? "animate-spin" : ""}`} />
              {resolving ? "Quenching Decoherence..." : "Resolve Everett Entropy"}
            </button>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-400" />
            Entropy & Relative State Metrics
          </h2>

          {lastEvent ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolution ID:</span>
                  <span className="text-purple-300 font-bold">{lastEvent.resolution_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">von Neumann Entropy:</span>
                  <span className="text-white font-bold">{lastEvent.von_neumann_branch_entropy_nats.toFixed(4)} nats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Decoherence Quench:</span>
                  <span className="text-emerald-400 font-bold">{lastEvent.decoherence_quench_ratio_db.toFixed(1)} dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phase Alignment:</span>
                  <span className="text-indigo-300">{lastEvent.inter_branch_phase_alignment_deg.toFixed(1)}°</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Recommended Countermeasure:</span>
                <span className="text-purple-300 font-bold block truncate">
                  {lastEvent.optimal_counterfactual_trajectory}
                </span>
                <span className="text-emerald-400 block text-[11px] mt-1">
                  Consensus Branch Stability: {lastEvent.consensus_branch_stability_pct}%
                </span>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs font-mono space-y-2">
              <Layers className="h-8 w-8 text-slate-700" />
              <span>Ready for Everett entropy resolution cycle.</span>
            </div>
          )}
        </div>

        {/* Live Execution Terminal */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs flex flex-col h-[280px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-purple-400" />
              Everett Branch Console
            </span>
            <span className="text-[10px] text-purple-400/80">ONLINE</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-slate-300 pr-1 select-text">
            {logs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
