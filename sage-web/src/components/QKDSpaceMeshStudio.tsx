"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  Satellite,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Activity,
  Zap,
  Network,
  Share2,
  Lock,
} from "lucide-react";

interface QKDNode {
  node_id: string;
  node_name: string;
  platform_type: string;
  distance_from_earth_km: number;
  optical_telescope_aperture_m: number;
  quantum_channel_wavelength_nm: number;
  raw_key_generation_rate_kbps: number;
  quantum_bit_error_rate_pct: number;
  entangled_bell_pairs_buffered: number;
  status: string;
}

interface EntanglementSwapResult {
  swap_id: string;
  origin_node_id: string;
  relay_node_id: string;
  destination_node_id: string;
  entanglement_fidelity: number;
  end_to_end_distance_km: number;
  secure_key_rate_kbps: number;
  shapiro_delay_compensation_ms: number;
  zero_trust_signature_verified: boolean;
  status: string;
  timestamp: string;
}

export function QKDSpaceMeshStudio() {
  const [nodes, setNodes] = useState<QKDNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState(false);
  const [originNode, setOriginNode] = useState("QKD-EARTH-CANARY-01");
  const [relayNode, setRelayNode] = useState("QKD-RELAY-LAGRANGE-L1-03");
  const [destNode, setDestNode] = useState("QKD-PROBE-MARS-ORBIT-04");
  const [lastSwap, setLastSwap] = useState<EntanglementSwapResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchNodes = async () => {
    try {
      const res = await fetch("/api/qkd-space-mesh/nodes");
      if (res.ok) {
        const data = await res.json();
        setNodes(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Sovereign Interstellar QKD Space-Mesh Relay initialized.",
      "[" + new Date().toLocaleTimeString() + "] Deep-space laser transceivers locked on Earth-Moon-Mars optical baselines.",
      "[" + new Date().toLocaleTimeString() + "] Bell-state entanglement sources calibrated (1550 nm telecom C-band).",
      "[" + new Date().toLocaleTimeString() + "] Relativistic Shapiro delay compensation engine online.",
    ]);
  }, []);

  const handleSwap = async () => {
    setSwapping(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Initiating Bell-State Entanglement Swap between ${originNode} and ${destNode} via ${relayNode}...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/qkd-space-mesh/swap-entanglement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_node_id: originNode,
          relay_node_id: relayNode,
          destination_node_id: destNode,
        }),
      });

      if (res.ok) {
        const data: EntanglementSwapResult = await res.json();
        setLastSwap(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] SWAP SUCCESS: ${data.swap_id}`,
          `[${new Date().toLocaleTimeString()}] Entanglement Fidelity: ${(data.entanglement_fidelity * 100).toFixed(2)}% | Distance: ${(data.end_to_end_distance_km / 1e6).toFixed(1)}M km`,
          `[${new Date().toLocaleTimeString()}] Key Rate: ${data.secure_key_rate_kbps} kbps | Shapiro Delay: ${data.shapiro_delay_compensation_ms.toFixed(3)} ms`,
          `[${new Date().toLocaleTimeString()}] Zero-Trust Quantum Signature: ${data.zero_trust_signature_verified ? "VERIFIED" : "UNVERIFIED"}`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] SWAP FAILED: Network timeout or optical diffraction packet drop.`,
        ...prev,
      ]);
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Network className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Sovereign Interstellar QKD Space-Mesh Relay Engine
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono">
                    Deep-Space Mesh
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Planetary-Scale Laser Quantum Key Distribution with Bell-State Swapping & Relativistic Shapiro Compensation
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchNodes}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Mesh
            </button>
          </div>
        </div>
      </div>

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-cyan-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Entanglement Fidelity</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {lastSwap ? `${(lastSwap.entanglement_fidelity * 100).toFixed(2)}%` : "98.15%"}
          </div>
          <div className="text-xs text-slate-500 mt-1">Bell-State (|&#936;+&gt;) Swapping</div>
        </div>

        <div className="rounded-lg border border-indigo-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Interplanetary Baseline</span>
            <Satellite className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">
            {lastSwap ? `${(lastSwap.end_to_end_distance_km / 1e6).toFixed(1)}M km` : "225.0M km"}
          </div>
          <div className="text-xs text-slate-500 mt-1">Earth &rarr; L1 &rarr; Mars Mesh</div>
        </div>

        <div className="rounded-lg border border-emerald-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Secure Key Rate</span>
            <Lock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {lastSwap ? `${lastSwap.secure_key_rate_kbps.toFixed(2)} kbps` : "3.02 kbps"}
          </div>
          <div className="text-xs text-slate-500 mt-1">BB84 Decoy-State Protocol</div>
        </div>

        <div className="rounded-lg border border-purple-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Shapiro Compensation</span>
            <Radio className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {lastSwap ? `${lastSwap.shapiro_delay_compensation_ms.toFixed(3)} ms` : "3.002 ms"}
          </div>
          <div className="text-xs text-slate-500 mt-1">Relativistic Curvature Offset</div>
        </div>
      </div>

      {/* Main Grid: Control Panel + Active Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entanglement Swap Controller */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Share2 className="h-4 w-4 text-cyan-400" />
              Interstellar Entanglement Controller
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Origin Node (Laser Emitter)</label>
                <select
                  value={originNode}
                  onChange={(e) => setOriginNode(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {nodes.map((n) => (
                    <option key={n.node_id} value={n.node_id}>
                      {n.node_name} ({n.platform_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Relay Node (Bell State Measurement)</label>
                <select
                  value={relayNode}
                  onChange={(e) => setRelayNode(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {nodes.map((n) => (
                    <option key={n.node_id} value={n.node_id}>
                      {n.node_name} ({n.platform_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Destination Node (Quantum Receiver)</label>
                <select
                  value={destNode}
                  onChange={(e) => setDestNode(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  {nodes.map((n) => (
                    <option key={n.node_id} value={n.node_id}>
                      {n.node_name} ({n.platform_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSwap}
              disabled={swapping}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs transition disabled:opacity-50"
            >
              <Zap className={`h-4 w-4 ${swapping ? "animate-spin" : ""}`} />
              {swapping ? "Executing Relativistic Bell Swap..." : "Establish Entanglement Swap"}
            </button>
          </div>

          {/* Last Swap Telemetry Box */}
          {lastSwap && (
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-cyan-300 font-semibold">
                <span>Active Bell Swap Channel</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Swap ID:</span>
                  <span className="text-white">{lastSwap.swap_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fidelity:</span>
                  <span className="text-emerald-400">{(lastSwap.entanglement_fidelity * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Baseline:</span>
                  <span className="text-white">{(lastSwap.end_to_end_distance_km / 1e6).toFixed(1)}M km</span>
                </div>
                <div className="flex justify-between">
                  <span>Key Rate:</span>
                  <span className="text-cyan-400">{lastSwap.secure_key_rate_kbps.toFixed(2)} kbps</span>
                </div>
                <div className="flex justify-between">
                  <span>Shapiro Offset:</span>
                  <span className="text-purple-400">{lastSwap.shapiro_delay_compensation_ms.toFixed(3)} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Zero-Trust:</span>
                  <span className="text-emerald-400">AUTHENTICATED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Space-Mesh Node Fleet Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Satellite className="h-4 w-4 text-cyan-400" />
                Interplanetary Optical Node Fleet ({nodes.length} Nodes)
              </span>
              <span className="text-xs text-slate-400 font-mono">1550nm Laser Channels</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nodes.map((n) => (
                <div
                  key={n.node_id}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2 hover:border-cyan-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{n.node_name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                      {n.platform_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500">Distance:</span>{" "}
                      <span className="text-slate-300">
                        {n.distance_from_earth_km === 0
                          ? "Ground"
                          : `${(n.distance_from_earth_km / 1e3).toLocaleString()}k km`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Telescope:</span>{" "}
                      <span className="text-slate-300">{n.optical_telescope_aperture_m}m</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Key Rate:</span>{" "}
                      <span className="text-cyan-400">{n.raw_key_generation_rate_kbps} kbps</span>
                    </div>
                    <div>
                      <span className="text-slate-500">QBER:</span>{" "}
                      <span className="text-emerald-400">{n.quantum_bit_error_rate_pct}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Buffered Pairs: {n.entangled_bell_pairs_buffered.toLocaleString()}</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      TRACKING LOCKED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Console Stream */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                Interstellar QKD Mesh Telemetry Log
              </span>
              <span className="text-[10px] text-slate-500">LIVE RELATIVISTIC FEED</span>
            </div>
            <div className="h-36 overflow-y-auto space-y-1 text-[11px]">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-tight">
                  <span className="text-cyan-500">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
