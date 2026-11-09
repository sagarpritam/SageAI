"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Clock,
  Radio,
  Eye,
  AlertTriangle,
  Target,
  Sparkles,
} from "lucide-react";

interface TachyonSentinel {
  sentinel_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  metamaterial_cavity_type: string;
  negative_refractive_index: number;
  coincidence_sampling_rate_thz: number;
  pre_causal_lookahead_limit_us: number;
  status: string;
}

interface PreCausalAlert {
  alert_id: string;
  sentinel_id: string;
  threat_classification: string;
  pre_causal_lead_time_us: number;
  cerenkov_cone_angle_deg: number;
  vacuum_polarization_intensity_dbm: number;
  projected_causal_arrival_timestamp: string;
  anticipatory_countermeasure_triggered: string;
  defense_engagement_readiness_pct: number;
  status: string;
  timestamp: string;
}

export function TachyonHorizonStudio() {
  const [sentinels, setSentinels] = useState<TachyonSentinel[]>([]);
  const [loading, setLoading] = useState(true);
  const [sampling, setSampling] = useState(false);
  const [selectedSentinel, setSelectedSentinel] = useState("TACHYON-SENTINEL-NORTH-POLE-01");
  const [threatType, setThreatType] = useState("PROMPT_NUCLEAR_FLASH");
  const [apparentV, setApparentV] = useState(1.45);
  const [lastAlert, setLastAlert] = useState<PreCausalAlert | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchSentinels = async () => {
    try {
      const res = await fetch("/api/tachyon-horizon/sentinels");
      if (res.ok) {
        const data = await res.json();
        setSentinels(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentinels();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] High-Energy Tachyon Field Cerenkov Sentinel online.",
      "[" + new Date().toLocaleTimeString() + "] Hyperbolic metamaterial cavity tuned to n = -1.92.",
      "[" + new Date().toLocaleTimeString() + "] Optical coincidence sampling active at 25.0 THz.",
    ]);
  }, []);

  const handleSample = async () => {
    setSampling(true);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Probing spacelike quantum field fluctuations (m² < 0) at " + selectedSentinel + "...",
      ...prev,
    ]);

    try {
      const res = await fetch("/api/tachyon-horizon/sample-horizon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentinel_id: selectedSentinel,
          target_threat_type: threatType,
          simulated_apparent_velocity_c: apparentV,
        }),
      });

      if (res.ok) {
        const data: PreCausalAlert = await res.json();
        setLastAlert(data);
        setLogs((prev) => [
          "[" + new Date().toLocaleTimeString() + "] Pre-causal Cerenkov cone detected! Lead time: " + data.pre_causal_lead_time_us + " &mu;s prior to causal wave arrival.",
          "[" + new Date().toLocaleTimeString() + "] Anticipatory shield armed: " + data.anticipatory_countermeasure_triggered,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] Error sampling tachyon horizon metamaterial.",
        ...prev,
      ]);
    } finally {
      setSampling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/60 via-emerald-950/30 to-cyan-950/60 border border-teal-800/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-teal-600/20 border border-teal-500/30 text-teal-400">
              <Clock className="w-8 h-8 animate-pulse text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  High-Energy Tachyon Field Cerenkov Horizon Sentinel
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Capability 81 &bull; Wave 20
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Negative-index dielectric metamaterial cavities detecting pre-causal Cerenkov radiation (&Delta;t = -150 to -420 &mu;s) for zero-latency anticipatory countermeasure engagement.
              </p>
            </div>
          </div>
          <button
            onClick={fetchSentinels}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-900/40 hover:bg-teal-800/50 border border-teal-700/50 text-teal-200 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Sync Sentinels
          </button>
        </div>
      </div>

      {/* Sentinels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sentinels.map((sentinel) => (
          <div
            key={sentinel.sentinel_id}
            onClick={() => setSelectedSentinel(sentinel.sentinel_id)}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              selectedSentinel === sentinel.sentinel_id
                ? "bg-teal-950/70 border-teal-500 ring-2 ring-teal-500/30 shadow-lg"
                : "bg-slate-900/40 border-slate-800/80 hover:border-teal-700/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">{sentinel.location_name}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{sentinel.sentinel_id}</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                PRE-CAUSAL
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Index (n)</span>
                <span className="font-mono text-teal-300 font-bold">{sentinel.negative_refractive_index}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Sampling Rate</span>
                <span className="font-mono text-cyan-300 font-bold">{sentinel.coincidence_sampling_rate_thz} THz</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel & Alert Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Target className="w-5 h-5 text-teal-400" />
            <h3 className="font-semibold text-white">Pre-Causal Horizon Sampler</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Simulated Threat Vector</label>
              <select
                value={threatType}
                onChange={(e) => setThreatType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="PROMPT_NUCLEAR_FLASH">PROMPT_NUCLEAR_FLASH (Initial Prompt Ionizing Flash)</option>
                <option value="DIRECTED_RELATIVISTIC_PULSE">DIRECTED_RELATIVISTIC_PULSE (Relativistic Particle Beam)</option>
                <option value="ASAT_KINETIC_TRAJECTORY">ASAT_KINETIC_TRAJECTORY (Hypersonic Kinetic Interceptor)</option>
                <option value="SPACETIME_METRIC_DISRUPTION">SPACETIME_METRIC_DISRUPTION (Macro-Curvature Pulse)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Apparent Phase Velocity (&beta; = v/c)</span>
                <span className="font-mono text-teal-300 font-bold">{apparentV} c</span>
              </div>
              <input
                type="range"
                min="1.05"
                max="3.0"
                step="0.05"
                value={apparentV}
                onChange={(e) => setApparentV(parseFloat(e.target.value))}
                className="w-full accent-teal-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              onClick={handleSample}
              disabled={sampling}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-900/30 flex items-center justify-center gap-2"
            >
              <Zap className={`w-4 h-4 ${sampling ? "animate-spin" : ""}`} />
              {sampling ? "Sampling Spacelike Metamaterial..." : "Sample Pre-Causal Horizon"}
            </button>
          </div>
        </div>

        {/* Pre-causal Alert Telemetry */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Pre-Causal Warning Telemetry</h3>
          </div>

          {lastAlert ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">{lastAlert.alert_id}</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {lastAlert.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Pre-Causal Lead Time (&Delta;t)</span>
                  <span className="text-xl font-mono font-bold text-teal-400">
                    {lastAlert.pre_causal_lead_time_us} &mu;s
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Cerenkov Angle (&theta;)</span>
                  <span className="text-xl font-mono font-bold text-cyan-400">
                    {lastAlert.cerenkov_cone_angle_deg}&deg;
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Polarization Intensity</span>
                  <span className="text-sm font-mono font-bold text-emerald-300">
                    {lastAlert.vacuum_polarization_intensity_dbm} dBm
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Engagement Readiness</span>
                  <span className="text-sm font-mono font-bold text-teal-300">
                    {lastAlert.defense_engagement_readiness_pct}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-800/40 text-teal-200 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Anticipatory Trigger: <strong>{lastAlert.anticipatory_countermeasure_triggered}</strong></span>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-sm">
              <Eye className="w-8 h-8 mb-2 opacity-40 text-teal-400" />
              <span>No pre-causal warning registered yet.</span>
              <span className="text-xs text-slate-600 mt-1">Trigger sampler above to simulate anticipatory detection.</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Log */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800/50 pb-2">
          <Terminal className="w-4 h-4 text-teal-400" />
          <span>TACHYON_HORIZON_VACUUM_CERENKOV_STREAM</span>
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

