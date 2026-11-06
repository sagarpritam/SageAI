"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  ShieldCheck,
  Zap,
  RefreshCw,
  Terminal,
  Layers,
  Globe,
  Satellite,
  Compass,
} from "lucide-react";

interface TransceiverNode {
  node_id: string;
  lagrange_point: string;
  distance_km: number;
  laser_wavelength_nm: number;
  beam_divergence_urad: number;
  aperture_diameter_m: number;
  pointing_jitter_nrad: number;
  optical_power_watts: number;
  qkd_enabled: boolean;
  oam_modes: number[];
  status: string;
}

interface TransmissionResult {
  transmission_id: string;
  source_node: string;
  target_node: string;
  distance_km: number;
  one_way_light_delay_sec: number;
  shapiro_delay_nsec: number;
  received_optical_power_dbm: number;
  quantum_bit_error_rate_qber: number;
  secure_key_rate_kbps: number;
  oam_aggregate_throughput_gbps: number;
  beam_drift_correction_urad: number;
  link_status: string;
  timestamp: string;
}

export function CisLunarRelayStudio() {
  const [nodes, setNodes] = useState<TransceiverNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [transmitting, setTransmitting] = useState(false);
  const [selectedSource, setSelectedSource] = useState("EARTH-OCP-TENERIFE");
  const [selectedTarget, setSelectedTarget] = useState("LAGRANGE-L1-HALO-1");
  const [lastTransmission, setLastTransmission] = useState<TransmissionResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchNodes = async () => {
    try {
      const res = await fetch("/api/cislunar-relay/nodes");
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
  }, []);

  const handleEstablishLink = async () => {
    setTransmitting(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Aligning 1550nm narrow-beam laser optical link (${selectedSource} -> ${selectedTarget})...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/cislunar-relay/establish-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_id: selectedSource,
          target_id: selectedTarget,
          requested_oam_modes: [-2, -1, 0, 1, 2],
          atmospheric_turbulence_index: 0.15,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastTransmission(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] Link established: ${data.distance_km.toLocaleString()} km | Shapiro Delay: ${data.shapiro_delay_nsec} ns | QBER: ${(data.quantum_bit_error_rate_qber * 100).toFixed(2)}% | OAM Throughput: ${data.oam_aggregate_throughput_gbps} Gbps`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Optical alignment error: Signal degraded`,
        ...prev,
      ]);
    } finally {
      setTransmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-blue-900/20 to-neutral-900/40 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/30">
                Capability 74
              </span>
              <span className="text-xs text-neutral-400">Wave 18 Deep Space Mesh</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Satellite className="h-6 w-6 text-cyan-400" />
              Cis-Lunar Lagrange L1/L2 High-Rate Quantum Optical Relay
            </h2>
            <p className="mt-1 text-sm text-neutral-300">
              Interplanetary decoy-state BB84 QKD, Orbital Angular Momentum (OAM) multiplexing, and relativistic Shapiro gravitational delay compensation across 450,000 km baseline.
            </p>
          </div>
          <button
            onClick={fetchNodes}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Sync Constellation
          </button>
        </div>
      </div>

      {/* Control Panel & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Radio className="h-4 w-4 text-cyan-400" />
            Max Baseline Distance
          </div>
          <div className="mt-2 text-2xl font-bold text-white">448,900 km</div>
          <div className="mt-1 text-xs text-cyan-400">Earth-Moon L2 Halo Orbit</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Layers className="h-4 w-4 text-blue-400" />
            Active OAM Modes
          </div>
          <div className="mt-2 text-2xl font-bold text-white">l = [-2, -1, 0, 1, 2]</div>
          <div className="mt-1 text-xs text-blue-400">400 Gbps Deep-Space Trunk</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Compass className="h-4 w-4 text-indigo-400" />
            Pointing Jitter Precision
          </div>
          <div className="mt-2 text-2xl font-bold text-white">&lt; 45 nrad</div>
          <div className="mt-1 text-xs text-indigo-400">Piezo Fast-Steering Optics</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Decoy-State QKD Rate
          </div>
          <div className="mt-2 text-2xl font-bold text-white">48.6 kbps</div>
          <div className="mt-1 text-xs text-emerald-400">QBER &lt; 2.5% Optimal</div>
        </div>
      </div>

      {/* Main Control & Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Constellation Nodes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" />
                Cis-Lunar Optical Ground & Spacecraft Nodes
              </h3>
              <span className="text-xs text-neutral-400">{nodes.length} Transceiver Terminals</span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {nodes.map((node) => (
                <div
                  key={node.node_id}
                  className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4 hover:border-cyan-500/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-white text-sm">{node.node_id}</div>
                      <div className="text-xs text-cyan-400 font-mono mt-0.5">{node.lagrange_point}</div>
                    </div>
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      {node.status}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-400">
                    <div>Range: <span className="text-neutral-200">{node.distance_km ? `${node.distance_km.toLocaleString()} km` : "Earth Surface"}</span></div>
                    <div>Laser: <span className="text-neutral-200">{node.laser_wavelength_nm} nm</span></div>
                    <div>Aperture: <span className="text-neutral-200">{node.aperture_diameter_m} m</span></div>
                    <div>Power: <span className="text-neutral-200">{node.optical_power_watts} W</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Link Transmitter Console */}
            <div className="mt-6 rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-4">
              <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                Establish Interplanetary Quantum Optical Link
              </h4>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400">Transmitting Terminal</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white"
                  >
                    {nodes.map((n) => (
                      <option key={n.node_id} value={n.node_id}>
                        {n.node_id} ({n.lagrange_point})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400">Target Terminal</label>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white"
                  >
                    {nodes.map((n) => (
                      <option key={n.node_id} value={n.node_id}>
                        {n.node_id} ({n.lagrange_point})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleEstablishLink}
                disabled={transmitting}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs py-2 transition disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                {transmitting ? "Locking Optical Beam & Computing Shapiro Delay..." : "Lock Optical Channel & Stream Quantum Keys"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Logs */}
        <div className="space-y-4">
          {/* Active Link Telemetry */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Radio className="h-4 w-4 text-cyan-400" />
              Active Link Telemetry
            </h3>

            {lastTransmission ? (
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Transmission ID:</span>
                  <span className="font-mono text-cyan-400">{lastTransmission.transmission_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Range:</span>
                  <span className="text-white font-semibold">{lastTransmission.distance_km.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">1-Way Light Delay:</span>
                  <span className="text-white">{lastTransmission.one_way_light_delay_sec} s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Shapiro Delay:</span>
                  <span className="text-cyan-300 font-mono">+{lastTransmission.shapiro_delay_nsec} ns</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Rx Optical Power:</span>
                  <span className="text-emerald-400 font-mono">{lastTransmission.received_optical_power_dbm} dBm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Quantum Error Rate (QBER):</span>
                  <span className="text-emerald-400 font-mono">{(lastTransmission.quantum_bit_error_rate_qber * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">OAM Aggregate Speed:</span>
                  <span className="text-cyan-400 font-bold">{lastTransmission.oam_aggregate_throughput_gbps} Gbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Link Status:</span>
                  <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-cyan-400 border border-cyan-500/20">
                    {lastTransmission.link_status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-neutral-500 py-6">
                Click &quot;Lock Optical Channel&quot; to compute cis-lunar quantum telemetry.
              </div>
            )}
          </div>

          {/* Deep Space Console Log */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 border-b border-neutral-800/80 pb-2">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              Interplanetary Laser Terminal Log
            </div>
            <div className="mt-3 h-48 overflow-y-auto space-y-1.5 font-mono text-[11px] text-neutral-400">
              {logs.length > 0 ? (
                logs.map((log, i) => <div key={i}>{log}</div>)
              ) : (
                <div className="text-neutral-600">Terminal ready. Standing by for pointing lock...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
