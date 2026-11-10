"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Radio,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  Server,
  RefreshCw,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Lock,
  Wifi,
  Antenna,
} from "lucide-react";

interface SliceRecord {
  slice_id: string;
  name: string;
  sst: number;
  sd: string;
  max_latency_ms: number;
  bandwidth_gbps: number;
  packet_loss_rate: number;
  status: string;
  connected_ues: number;
  rogue_threats_blocked: number;
}

interface AnomalyResult {
  analysis_id: string;
  slice_id: string;
  threat_detected: boolean;
  threat_type: string;
  signal_dbm: number;
  pci_collision?: boolean;
  unexpected_rnti?: boolean;
  recommended_action: string;
  timestamp?: string;
}

export function Telecom5GSliceStudio() {
  const [slices, setSlices] = useState<SliceRecord[]>([]);
  const [selectedSlice, setSelectedSlice] = useState<SliceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [signalDbm, setSignalDbm] = useState<number>(-85);
  const [pciCollision, setPciCollision] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnomalyResult | null>(null);
  const [evalLogs, setEvalLogs] = useState<AnomalyResult[]>([]);

  const fetchSlices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/telecom-5g/slices");
      const data = await res.json();
      if (data.slices) {
        setSlices(data.slices);
        if (data.slices.length > 0) {
          setSelectedSlice((prev) => prev || data.slices[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlices();
  }, [fetchSlices]);

  async function handleAnalyze() {
    if (!selectedSlice) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/telecom-5g/detect-anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slice_id: selectedSlice.slice_id,
          radio_signal_dbm: Number(signalDbm),
          pci_collision: pciCollision,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        const item: AnomalyResult = {
          ...data.analysis,
          timestamp: new Date().toLocaleTimeString(),
        };
        setAnalysisResult(item);
        setEvalLogs((prev) => [item, ...prev.slice(0, 9)]);

        if (item.threat_detected) {
          setSlices((prev) =>
            prev.map((s) =>
              s.slice_id === selectedSlice.slice_id
                ? { ...s, rogue_threats_blocked: s.rogue_threats_blocked + 1 }
                : s
            )
          );
          setSelectedSlice((prev) =>
            prev ? { ...prev, rogue_threats_blocked: prev.rogue_threats_blocked + 1 } : null
          );
        }
      }
    } finally {
      setAnalyzing(false);
    }
  }

  const totalThreats = slices.reduce((acc, curr) => acc + (curr.rogue_threats_blocked || 0), 0);
  const totalUEs = slices.reduce((acc, curr) => acc + (curr.connected_ues || 0), 0);

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Autonomous 5G/6G Core Micro-Slicing & Open-RAN Mesh
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                CAP-50
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                3GPP Rel 18
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Near-RT RIC xApps monitoring E2 interface telemetry, RF jamming, and rogue gNodeB (IMSI Catcher) triangulation.
            </p>
          </div>
        </div>

        <button
          onClick={fetchSlices}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh 5G Telemetry
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Active Core Slices</p>
            <p className="text-2xl font-bold text-white mt-1">{slices.length}</p>
            <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> 3GPP Cryptographically Segregated
            </p>
          </div>
          <Server className="w-8 h-8 text-cyan-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Rogue Threats Blocked</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{totalThreats}</p>
            <p className="text-xs text-amber-400/80 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> IMSI Catchers & Jamming
            </p>
          </div>
          <Antenna className="w-8 h-8 text-amber-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Active Connected UEs</p>
            <p className="text-2xl font-bold text-white mt-1">{totalUEs.toLocaleString()}</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Radio Bearers Hardened
            </p>
          </div>
          <Wifi className="w-8 h-8 text-emerald-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Near-RT RIC Latency</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">&lt; 1.2 ms</p>
            <p className="text-xs text-zinc-400 mt-1">E2 Sub-millisecond Loop</p>
          </div>
          <Activity className="w-8 h-8 text-indigo-400 opacity-60" />
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5G Network Slices List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" /> Active 5G/6G Network Slices
          </h2>

          <div className="space-y-3">
            {slices.map((slice) => {
              const isSelected = selectedSlice?.slice_id === slice.slice_id;
              return (
                <div
                  key={slice.slice_id}
                  onClick={() => {
                    setSelectedSlice(slice);
                    setAnalysisResult(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-800/90 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white text-sm">{slice.name}</span>
                      <p className="text-xs text-zinc-400 mt-1 font-mono">
                        ID: {slice.slice_id} &bull; SST: {slice.sst} &bull; SD: {slice.sd}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        slice.status === "PROTECTED_ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {slice.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800/80 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Latency:</span>
                      <span className="font-mono text-cyan-300">{slice.max_latency_ms} ms</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Bandwidth:</span>
                      <span className="font-mono text-white">{slice.bandwidth_gbps} Gbps</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Threats Blocked:</span>
                      <span className="font-mono text-amber-400 font-bold">{slice.rogue_threats_blocked}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: O-RAN xApp Radio Anomaly Simulator */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" /> Near-RT RIC xApp Radio Anomaly & Jamming Simulator
          </h2>

          {selectedSlice ? (
            <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedSlice.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Target Slice: {selectedSlice.slice_id} | SST: {selectedSlice.sst}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                  QoS Target: &le; {selectedSlice.max_latency_ms} ms
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    <span>Measured Radio Signal (RSRP)</span>
                    <span className="font-mono text-cyan-400">{signalDbm} dBm</span>
                  </div>
                  <input
                    type="range"
                    min="-140"
                    max="-50"
                    value={signalDbm}
                    onChange={(e) => setSignalDbm(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-1 font-mono">
                    <span>-140 dBm (Severe Jamming)</span>
                    <span>-115 dBm (Threshold)</span>
                    <span>-50 dBm (Excellent)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60">
                  <div className="flex items-center gap-3">
                    <Antenna className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-xs font-semibold text-white">Simulate Rogue gNodeB (PCI Collision)</span>
                      <p className="text-xs text-zinc-400">Injects duplicate Physical Cell ID to mimic cell site simulator (IMSI Catcher).</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pciCollision}
                    onChange={(e) => setPciCollision(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Execute O-RAN Near-RT RIC Analysis
                </button>
              </div>

              {/* Real-time Verdict Output */}
              {analysisResult && (
                <div
                  className={`p-5 rounded-xl border transition-all ${
                    analysisResult.threat_detected
                      ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                      : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {analysisResult.threat_detected ? (
                        <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      )}
                      <div>
                        <span className="font-bold text-sm tracking-wide">
                          {analysisResult.threat_detected
                            ? "RADIO ANOMALY / ROGUE THREAT DETECTED"
                            : "NOMINAL RADIO ENVIRONMENT CONFIRMED"}
                        </span>
                        <p className="text-xs opacity-80 mt-0.5">
                          Threat: {analysisResult.threat_type}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                        analysisResult.threat_detected
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {analysisResult.threat_detected ? "THREAT_BLOCKED" : "CLEARED"}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 text-xs">
                    <span className="text-zinc-400 block">Recommended Autonomous Countermeasure:</span>
                    <span className="font-mono text-sm font-semibold text-cyan-300">
                      {analysisResult.recommended_action}
                    </span>
                  </div>
                </div>
              )}

              {/* Recent History */}
              {evalLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-semibold text-zinc-400">Recent xApp Telemetry Inspections</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {evalLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/60 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">{log.timestamp}</span>
                          <span className={log.threat_detected ? "text-rose-400 font-bold" : "text-emerald-400"}>
                            {log.threat_type}
                          </span>
                        </div>
                        <span className="text-zinc-400">{log.signal_dbm} dBm</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">
              Select a 5G/6G network slice on the left to inspect Near-RT RIC telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

