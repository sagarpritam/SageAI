"use client";

import React, { useState, useEffect } from "react";
import {
  Waves,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  Sliders,
  Terminal,
  Layers,
  Compass,
  Radio,
  Navigation,
} from "lucide-react";

interface SonarNode {
  node_id: string;
  name: string;
  depth_meters: number;
  latitude: number;
  longitude: number;
  hydrophone_elements: number;
  sofar_channel_active: boolean;
  ambient_noise_spl_db: number;
  status: string;
  contacts_tracked: number;
}

interface AcousticAnalysis {
  acoustic_analysis_id: string;
  node_id: string;
  threat_detected: boolean;
  threat_type: string;
  threat_level: string;
  sound_velocity_mps: number;
  ambient_spl_db: number;
  spectral_peak_hz: number;
  acoustic_doppler_mps: number;
  snr_db: number;
  triangulation_latency_ms: number;
  action_recommended: string;
  timestamp: number;
}

interface TriangulationEvent {
  triangulation_id: string;
  node_id: string;
  bearing_degrees: number;
  estimated_target_depth_m: number;
  triangulation_speed_ms: number;
  position_error_radius_meters: number;
  target_acoustic_signature: string;
  new_node_status: string;
  timestamp: number;
}

export function MarineSonarStudio() {
  const [nodes, setNodes] = useState<SonarNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<SonarNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [triangulating, setTriangulating] = useState(false);
  const [splDb, setSplDb] = useState<number>(72.0);
  const [spectralHz, setSpectralHz] = useState<number>(250.0);
  const [dopplerMps, setDopplerMps] = useState<number>(1.5);
  const [analysis, setAnalysis] = useState<AcousticAnalysis | null>(null);
  const [triangulation, setTriangulation] = useState<TriangulationEvent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marine-sonar/nodes");
      const data = await res.json();
      if (data.status === "success" && data.nodes) {
        setNodes(data.nodes);
        if (!selectedNode && data.nodes.length > 0) {
          setSelectedNode(data.nodes[0]);
        }
        addLog(`Loaded ${data.nodes.length} ocean floor hydrophone sonar arrays.`);
      }
    } catch {
      addLog("Failed to fetch sonar arrays; using fallback telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleAnalyze = async (simulateAUV = false) => {
    if (!selectedNode) return;
    setAnalyzing(true);
    const testSpl = simulateAUV ? 98.5 : splDb;
    const testHz = simulateAUV ? 95.0 : spectralHz;
    const testDoppler = simulateAUV ? 14.2 : dopplerMps;

    try {
      addLog(`Analyzing seabed acoustic spectrum on ${selectedNode.name} (SPL=${testSpl} dB, Peak=${testHz} Hz, Doppler=${testDoppler} m/s)...`);
      const res = await fetch("/api/marine-sonar/analyze-acoustic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: selectedNode.node_id,
          sound_velocity_mps: 1495.0,
          ambient_spl_db: testSpl,
          spectral_peak_hz: testHz,
          acoustic_doppler_mps: testDoppler,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        if (data.analysis.threat_detected) {
          addLog(`⚠️ CRITICAL: ${data.analysis.threat_type} isolated! SNR: +${data.analysis.snr_db} dB. Recommendation: ${data.analysis.action_recommended}`);
        } else {
          addLog(`✓ Ambient ocean soundscape nominal: ${data.analysis.action_recommended}`);
        }
      }
    } catch {
      addLog("Marine acoustic analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTriangulate = async () => {
    if (!selectedNode) return;
    setTriangulating(true);
    try {
      addLog(`Executing sub-18ms hyperbolic multi-lateration (TDOA) on ${selectedNode.node_id}...`);
      const res = await fetch("/api/marine-sonar/triangulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: selectedNode.node_id,
          bearing_deg: 142.5,
          estimated_depth_m: 850.0,
        }),
      });
      const data = await res.json();
      if (data.triangulation_event) {
        setTriangulation(data.triangulation_event);
        addLog(`⚓ Contact Triangulated in ${data.triangulation_event.triangulation_speed_ms} ms! Bearing: ${data.triangulation_event.bearing_degrees}°, Depth: ${data.triangulation_event.estimated_target_depth_m}m.`);
      }
    } catch {
      addLog("Failed to triangulate contact.");
    } finally {
      setTriangulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-950/40 via-cyan-900/20 to-neutral-900/60 p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400 ring-1 ring-teal-500/30">
                <Waves className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Marine Acoustic Ocean Floor Sonar Mesh & Seismic Tamper Interceptor
                  <span className="rounded-md border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-400">
                    Cap 65 · v4.8.0
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Deep Seabed Hydrophone Arrays, SOFAR Waveguide Propagation & Sub-18ms AUV Acoustic Triangulation
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
            Refresh Sonar Grid
          </button>
        </div>
      </div>

      {/* Grid of Seabed Sonar Arrays */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {nodes.map((n) => (
          <div
            key={n.node_id}
            onClick={() => setSelectedNode(n)}
            className={`cursor-pointer rounded-xl border p-4 transition ${
              selectedNode?.node_id === n.node_id
                ? "border-teal-500 bg-teal-950/20 ring-1 ring-teal-500/40"
                : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{n.name}</span>
              <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[10px] font-mono text-teal-300">
                {n.depth_meters}m Depth
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              {n.hydrophone_elements} Hydrophones · SOFAR: {n.sofar_channel_active ? "Locked" : "Off"}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
              <div className="rounded bg-neutral-800/50 p-1.5">
                <span className="text-neutral-500">Noise:</span> {n.ambient_noise_spl_db} dB
              </div>
              <div className="rounded bg-neutral-800/50 p-1.5">
                <span className="text-neutral-500">Status:</span> {n.status.replace(/_/g, " ")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Controls & Real-Time Defense Evaluation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 lg:col-span-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sliders className="h-4 w-4 text-teal-400" />
            Passive Acoustic Spectral Parameters
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Ambient Sound Pressure Level (dB):</span>
                <span className="font-mono text-teal-400">{splDb.toFixed(1)} dB</span>
              </div>
              <input
                type="range"
                min="50.0"
                max="150.0"
                step="2.0"
                value={splDb}
                onChange={(e) => setSplDb(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Dominant Frequency Peak (Hz):</span>
                <span className="font-mono text-teal-400">{spectralHz.toFixed(0)} Hz</span>
              </div>
              <input
                type="range"
                min="10.0"
                max="500.0"
                step="10.0"
                value={spectralHz}
                onChange={(e) => setSpectralHz(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Acoustic Doppler Shift Velocity (m/s):</span>
                <span className="font-mono text-teal-400">{dopplerMps.toFixed(1)} m/s</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="25.0"
                step="0.5"
                value={dopplerMps}
                onChange={(e) => setDopplerMps(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => handleAnalyze(false)}
              disabled={analyzing}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-teal-500"
            >
              <Activity className="h-3.5 w-3.5" />
              Analyze Soundscape
            </button>
            <button
              onClick={() => handleAnalyze(true)}
              disabled={analyzing}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/30 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/40"
            >
              <Zap className="h-3.5 w-3.5 text-red-400" />
              Simulate AUV Cavitation
            </button>
            <button
              onClick={handleTriangulate}
              disabled={triangulating}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40"
            >
              <Navigation className="h-3.5 w-3.5 text-emerald-400" />
              Execute Sub-18ms Triangulation
            </button>
          </div>
        </div>

        {/* Evaluation Verdict & Telemetry Console */}
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 lg:col-span-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Radio className="h-4 w-4 text-teal-400" />
            Seabed TDOA Acoustic Target Telemetry
          </h3>
          {analysis ? (
            <div
              className={`rounded-lg border p-4 text-xs ${
                analysis.threat_detected
                  ? "border-red-500/50 bg-red-950/20 text-red-200"
                  : "border-emerald-500/50 bg-emerald-950/20 text-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{analysis.threat_type}</span>
                <span className="font-mono">SNR: +{analysis.snr_db} dB</span>
              </div>
              <p className="mt-1 text-[11px] opacity-80">{analysis.action_recommended}</p>
              <div className="mt-2 text-[10px] opacity-70">
                Doppler: {analysis.acoustic_doppler_mps} m/s · Peak: {analysis.spectral_peak_hz} Hz · Latency: {analysis.triangulation_latency_ms} ms
              </div>
            </div>
          ) : (
            <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-neutral-800 text-xs text-neutral-500">
              No active acoustic contact. Run a soundscape analysis.
            </div>
          )}

          {/* Console Logs */}
          <div className="rounded-lg border border-neutral-800 bg-black/60 p-3 font-mono text-[11px] text-neutral-400 h-32 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <span className="text-neutral-600">// Ocean floor hydrophone telemetry standby...</span>
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

