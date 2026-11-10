"use client";

import React, { useState, useEffect } from "react";
import {
  Plane,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  Sliders,
  Terminal,
  Layers,
  Wind,
  Radio,
  Scan,
} from "lucide-react";

interface HAPSNode {
  node_id: string;
  name: string;
  altitude_km: number;
  wingspan_meters: number;
  payload: string;
  sar_resolution_m: number;
  battery_soc_pct: number;
  optical_isl_active: boolean;
  status: string;
  telemetry_frames_downlinked: number;
}

interface FlightMonitor {
  flight_monitor_id: string;
  node_id: string;
  threat_detected: boolean;
  threat_type: string;
  threat_level: string;
  wind_velocity_mps: number;
  battery_soc_pct: number;
  sar_clutter_ratio_db: number;
  optical_jitter_urad: number;
  station_keeping_efficiency_pct: number;
  action_recommended: string;
  timestamp: number;
}

interface TelemetryEvent {
  telemetry_id: string;
  node_id: string;
  altitude_km: number;
  sar_resolution_meters: number;
  pqc_signature_algorithm: string;
  synthetic_aperture_radar_lock: boolean;
  target_tracks_correlated: number;
  new_node_status: string;
  timestamp: number;
}

export function HAPSStratosphereStudio() {
  const [nodes, setNodes] = useState<HAPSNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<HAPSNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [relaying, setRelaying] = useState(false);
  const [windMps, setWindMps] = useState<number>(14.0);
  const [batterySoc, setBatterySoc] = useState<number>(88.0);
  const [clutterDb, setClutterDb] = useState<number>(2.5);
  const [opticalJitter, setOpticalJitter] = useState<number>(1.2);
  const [flightMonitor, setFlightMonitor] = useState<FlightMonitor | null>(null);
  const [telemetryEvent, setTelemetryEvent] = useState<TelemetryEvent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/haps-stratosphere/nodes");
      const data = await res.json();
      if (data.status === "success" && data.nodes) {
        setNodes(data.nodes);
        if (!selectedNode && data.nodes.length > 0) {
          setSelectedNode(data.nodes[0]);
        }
        addLog(`Loaded ${data.nodes.length} stratospheric HAPS surveillance platforms.`);
      }
    } catch {
      addLog("Failed to fetch HAPS nodes; using fallback telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleMonitorFlight = async (simulateShear = false) => {
    if (!selectedNode) return;
    setMonitoring(true);
    const testWind = simulateShear ? 42.5 : windMps;
    const testJitter = simulateShear ? 4.8 : opticalJitter;

    try {
      addLog(`Monitoring stratospheric aero-thermodynamics on ${selectedNode.name} (Wind=${testWind} m/s, Alt=${selectedNode.altitude_km} km)...`);
      const res = await fetch("/api/haps-stratosphere/monitor-flight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: selectedNode.node_id,
          wind_velocity_mps: testWind,
          battery_soc_pct: batterySoc,
          sar_clutter_ratio_db: clutterDb,
          optical_link_jitter_urad: testJitter,
        }),
      });
      const data = await res.json();
      if (data.flight_monitor) {
        setFlightMonitor(data.flight_monitor);
        if (data.flight_monitor.threat_detected) {
          addLog(`⚠️ CRITICAL: ${data.flight_monitor.threat_type}! Station-keeping efficiency: ${data.flight_monitor.station_keeping_efficiency_pct}%. Action: ${data.flight_monitor.action_recommended}`);
        } else {
          addLog(`✓ Stratospheric flight nominal: Station-keeping at ${data.flight_monitor.station_keeping_efficiency_pct}%.`);
        }
      }
    } catch {
      addLog("Stratospheric flight monitoring failed.");
    } finally {
      setMonitoring(false);
    }
  };

  const handleRelaySAR = async () => {
    if (!selectedNode) return;
    setRelaying(true);
    try {
      addLog(`Downlinking sub-millimeter SAR ground telemetry from ${selectedNode.node_id}...`);
      const res = await fetch("/api/haps-stratosphere/relay-sar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: selectedNode.node_id,
          frame_resolution_meters: 0.15,
          pqc_cipher: "ML-DSA-87_AES256GCM",
        }),
      });
      const data = await res.json();
      if (data.telemetry_event) {
        setTelemetryEvent(data.telemetry_event);
        addLog(`🛰️ SAR Ground Telemetry Downlinked! Resolution: ${data.telemetry_event.sar_resolution_meters}m · Cipher: ${data.telemetry_event.pqc_signature_algorithm} · Targets Correlated: ${data.telemetry_event.target_tracks_correlated}.`);
      }
    } catch {
      addLog("Failed to downlink SAR telemetry.");
    } finally {
      setRelaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-sky-500/30 bg-gradient-to-br from-sky-950/40 via-blue-900/20 to-neutral-900/60 p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30">
                <Plane className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Sub-Millimeter HAPS Stratospheric Persistent Surveillance Swarm
                  <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-400">
                    Cap 64 · v4.7.0
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Solar UAVs at 20km Altitude, Sub-Millimeter Synthetic Aperture Radar (SAR) & Optical Inter-HAPS Mesh
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchNodes}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3.5 py-1.5 text-xs font-medium text-neutral-200 transition hover:bg-neutral-700/80"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh HAPS Fleet
          </button>
        </div>
      </div>

      {/* Grid of Monitored HAPS Nodes */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {nodes.map((n) => (
          <div
            key={n.node_id}
            onClick={() => setSelectedNode(n)}
            className={`cursor-pointer rounded-xl border p-4 transition ${
              selectedNode?.node_id === n.node_id
                ? "border-sky-500 bg-sky-950/20 ring-1 ring-sky-500/40"
                : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{n.name}</span>
              <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-mono text-sky-300">
                {n.altitude_km} km Alt
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-400 line-clamp-1">{n.payload}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
              <div className="rounded bg-neutral-800/50 p-1.5">
                <span className="text-neutral-500">SAR Res:</span> {n.sar_resolution_m} m
              </div>
              <div className="rounded bg-neutral-800/50 p-1.5">
                <span className="text-neutral-500">Battery:</span> {n.battery_soc_pct}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Controls & Real-Time Defense Evaluation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 lg:col-span-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sliders className="h-4 w-4 text-sky-400" />
            Stratospheric Aero-Dynamics & Radar Parameters
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Jet Stream Wind Velocity (m/s):</span>
                <span className="font-mono text-sky-400">{windMps.toFixed(1)} m/s</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="50.0"
                step="1.0"
                value={windMps}
                onChange={(e) => setWindMps(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Solar Battery SoC (%):</span>
                <span className="font-mono text-sky-400">{batterySoc.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="10.0"
                max="100.0"
                step="2.0"
                value={batterySoc}
                onChange={(e) => setBatterySoc(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Inter-HAPS Optical Laser Jitter (µrad):</span>
                <span className="font-mono text-sky-400">{opticalJitter.toFixed(1)} µrad</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={opticalJitter}
                onChange={(e) => setOpticalJitter(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => handleMonitorFlight(false)}
              disabled={monitoring}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-sky-500"
            >
              <Wind className="h-3.5 w-3.5" />
              Monitor Aero Station-Keeping
            </button>
            <button
              onClick={() => handleMonitorFlight(true)}
              disabled={monitoring}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/30 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/40"
            >
              <Wind className="h-3.5 w-3.5 text-red-400" />
              Simulate Jet Stream Shear
            </button>
            <button
              onClick={handleRelaySAR}
              disabled={relaying}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40"
            >
              <Scan className="h-3.5 w-3.5 text-emerald-400" />
              Downlink Sub-mm SAR Telemetry
            </button>
          </div>
        </div>

        {/* Evaluation Verdict & Telemetry Console */}
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 lg:col-span-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Radio className="h-4 w-4 text-sky-400" />
            Station-Keeping & Downlink Telemetry Console
          </h3>
          {flightMonitor ? (
            <div
              className={`rounded-lg border p-4 text-xs ${
                flightMonitor.threat_detected
                  ? "border-red-500/50 bg-red-950/20 text-red-200"
                  : "border-emerald-500/50 bg-emerald-950/20 text-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{flightMonitor.threat_type}</span>
                <span className="font-mono">Efficiency: {flightMonitor.station_keeping_efficiency_pct}%</span>
              </div>
              <p className="mt-1 text-[11px] opacity-80">{flightMonitor.action_recommended}</p>
              <div className="mt-2 text-[10px] opacity-70">
                Wind: {flightMonitor.wind_velocity_mps} m/s · Battery: {flightMonitor.battery_soc_pct}% · Jitter: {flightMonitor.optical_jitter_urad} µrad
              </div>
            </div>
          ) : (
            <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-neutral-800 text-xs text-neutral-500">
              No active flight monitoring. Run an aero evaluation.
            </div>
          )}

          {/* Console Logs */}
          <div className="rounded-lg border border-neutral-800 bg-black/60 p-3 font-mono text-[11px] text-neutral-400 h-32 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <span className="text-neutral-600">{"// Stratospheric HAPS telemetry standby..."}</span>
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

