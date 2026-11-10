"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  Sliders,
  Terminal,
  Layers,
  Flame,
  Radio,
  Eye,
} from "lucide-react";

interface PhotonicCoprocessor {
  coprocessor_id: string;
  name: string;
  architecture: string;
  optical_modes: number;
  squeezing_factor_db: number;
  optical_gate_latency_fs: number;
  status: string;
  mzi_interferometer_elements: number;
  cryogenic_cooling_kelvin: number;
  cryptanalytic_attempts_blocked: number;
}

interface LatticeEvaluation {
  evaluation_id: string;
  coprocessor_id: string;
  threat_detected: boolean;
  threat_type: string;
  target_pqc_scheme: string;
  lattice_dimension: number;
  root_hermite_factor: number;
  photon_loss_rate_pct: number;
  estimated_classical_bit_security: number;
  optical_gate_latency_fs: number;
  action_recommended: string;
  timestamp: number;
}

interface FirewallEvent {
  firewall_id: string;
  coprocessor_id: string;
  defense_mode: string;
  optical_response_latency_fs: number;
  quantum_fidelity_degradation_pct: number;
  adversarial_decoherence_enforced: boolean;
  new_coprocessor_status: string;
  timestamp: number;
}

export function PhotonicQuantumStudio() {
  const [coprocessors, setCoprocessors] = useState<PhotonicCoprocessor[]>([]);
  const [selectedNode, setSelectedNode] = useState<PhotonicCoprocessor | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [firingFirewall, setFiringFirewall] = useState(false);
  const [latticeDim, setLatticeDim] = useState<number>(1024);
  const [rootHermite, setRootHermite] = useState<number>(1.0045);
  const [photonLoss, setPhotonLoss] = useState<number>(1.2);
  const [evaluation, setEvaluation] = useState<LatticeEvaluation | null>(null);
  const [firewallEvent, setFirewallEvent] = useState<FirewallEvent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const fetchCoprocessors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/photonic-quantum/coprocessors");
      const data = await res.json();
      if (data.status === "success" && data.coprocessors) {
        setCoprocessors(data.coprocessors);
        if (!selectedNode && data.coprocessors.length > 0) {
          setSelectedNode(data.coprocessors[0]);
        }
        addLog(`Loaded ${data.coprocessors.length} continuous-variable photonic quantum co-processors.`);
      }
    } catch {
      addLog("Failed to fetch photonic co-processors; using local telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoprocessors();
  }, []);

  const handleEvaluate = async (exploit = false) => {
    if (!selectedNode) return;
    setEvaluating(true);
    const testDelta = exploit ? 1.0028 : rootHermite;
    const testDim = exploit ? 384 : latticeDim;

    try {
      addLog(`Initiating optical Shor/Grover lattice analysis on ${selectedNode.name} (δ=${testDelta}, n=${testDim})...`);
      const res = await fetch("/api/photonic-quantum/evaluate-lattice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coprocessor_id: selectedNode.coprocessor_id,
          lattice_dimension: testDim,
          target_pqc_scheme: "ML-KEM-1024",
          root_hermite_factor: testDelta,
          photon_loss_rate_pct: photonLoss,
        }),
      });
      const data = await res.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        if (data.evaluation.threat_detected) {
          addLog(`⚠️ CRITICAL: ${data.evaluation.threat_type} isolated! Optical gate latency: ${data.evaluation.optical_gate_latency_fs} fs.`);
        } else {
          addLog(`✓ Lattice quantum hardness verified: ${data.evaluation.estimated_classical_bit_security}-bit security.`);
        }
      }
    } catch {
      addLog("Lattice cryptanalysis evaluation failed.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleEngageFirewall = async () => {
    if (!selectedNode) return;
    setFiringFirewall(true);
    try {
      addLog(`Discharging optical noise injection barrier into MZI mesh on ${selectedNode.coprocessor_id}...`);
      const res = await fetch("/api/photonic-quantum/engage-firewall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coprocessor_id: selectedNode.coprocessor_id,
          defense_mode: "OPTICAL_NOISE_INJECTION_BARRIER",
        }),
      });
      const data = await res.json();
      if (data.firewall_event) {
        setFirewallEvent(data.firewall_event);
        addLog(`🛡️ Photonic Firewall Discharged in ${data.firewall_event.optical_response_latency_fs} fs! Adversarial decoherence: ${data.firewall_event.quantum_fidelity_degradation_pct}%.`);
      }
    } catch {
      addLog("Failed to engage photonic firewall.");
    } finally {
      setFiringFirewall(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-purple-900/20 to-neutral-900/60 p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Photonic Quantum Cryptanalytic Co-Processor & Lattice Firewall
                  <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-400">
                    Cap 62 · v4.7.0
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Continuous-Variable Squeezed Light Interferometry, Mach-Zehnder Meshes & Sub-Picosecond PQC Defense
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchCoprocessors}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3.5 py-1.5 text-xs font-medium text-neutral-200 transition hover:bg-neutral-700/80"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Grid of Monitored Photonic Coprocessors */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {coprocessors.map((c) => (
          <div
            key={c.coprocessor_id}
            onClick={() => setSelectedNode(c)}
            className={`cursor-pointer rounded-xl border p-4 transition ${
              selectedNode?.coprocessor_id === c.coprocessor_id
                ? "border-violet-500 bg-violet-950/20 ring-1 ring-violet-500/40"
                : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{c.name}</span>
              <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-mono text-violet-300">
                {c.optical_modes} Modes
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-400 line-clamp-1">{c.architecture}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
              <div className="rounded bg-neutral-800/50 p-1.5">
                <span className="text-neutral-500">Squeezing:</span> {c.squeezing_factor_db} dB
              </div>
              <div className="rounded bg-neutral-800/50 p-1.5">
                <span className="text-neutral-500">Gate Speed:</span> {c.optical_gate_latency_fs} fs
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Controls & Real-Time Defense Evaluation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 lg:col-span-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sliders className="h-4 w-4 text-violet-400" />
            Lattice Vector Parameter Controls (ML-KEM / ML-DSA)
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Lattice Dimension (n):</span>
                <span className="font-mono text-violet-400">{latticeDim}</span>
              </div>
              <input
                type="range"
                min="256"
                max="2048"
                step="128"
                value={latticeDim}
                onChange={(e) => setLatticeDim(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Root Hermite Factor (δ):</span>
                <span className="font-mono text-violet-400">{rootHermite.toFixed(4)}</span>
              </div>
              <input
                type="range"
                min="1.0020"
                max="1.0060"
                step="0.0001"
                value={rootHermite}
                onChange={(e) => setRootHermite(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Optical Photon Loss Rate (%):</span>
                <span className="font-mono text-violet-400">{photonLoss.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={photonLoss}
                onChange={(e) => setPhotonLoss(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => handleEvaluate(false)}
              disabled={evaluating}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-violet-500"
            >
              <Zap className="h-3.5 w-3.5" />
              Evaluate Hardness
            </button>
            <button
              onClick={() => handleEvaluate(true)}
              disabled={evaluating}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/30 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/40"
            >
              <Flame className="h-3.5 w-3.5 text-red-400" />
              Simulate SVP Exploit
            </button>
            <button
              onClick={handleEngageFirewall}
              disabled={firingFirewall}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Engage Sub-Picosecond Firewall
            </button>
          </div>
        </div>

        {/* Evaluation Verdict & Telemetry Console */}
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 lg:col-span-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Activity className="h-4 w-4 text-violet-400" />
            Optical Coherence & Cryptanalytic Telemetry
          </h3>
          {evaluation ? (
            <div
              className={`rounded-lg border p-4 text-xs ${
                evaluation.threat_detected
                  ? "border-red-500/50 bg-red-950/20 text-red-200"
                  : "border-emerald-500/50 bg-emerald-950/20 text-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{evaluation.threat_type}</span>
                <span className="font-mono">{evaluation.estimated_classical_bit_security}-bit hard</span>
              </div>
              <p className="mt-1 text-[11px] opacity-80">{evaluation.action_recommended}</p>
              <div className="mt-2 text-[10px] opacity-70">
                Gate Latency: {evaluation.optical_gate_latency_fs} fs · Delta: {evaluation.root_hermite_factor}
              </div>
            </div>
          ) : (
            <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-neutral-800 text-xs text-neutral-500">
              No active lattice evaluation. Run a hardness test.
            </div>
          )}

          {/* Console Logs */}
          <div className="rounded-lg border border-neutral-800 bg-black/60 p-3 font-mono text-[11px] text-neutral-400 h-32 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <span className="text-neutral-600">{"// Photonic quantum telemetry standby..."}</span>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="leading-tight">
                  {l}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

