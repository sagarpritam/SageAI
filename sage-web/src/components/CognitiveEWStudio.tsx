"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  Terminal,
  Layers,
  Crosshair,
  Sliders,
  Wifi,
  Cpu,
} from "lucide-react";

interface Emitter {
  emitter_id: string;
  name: string;
  frequency_ghz: number;
  rf_band: string;
  radar_type: string;
  pri_mode: string;
  pulse_width_us: number;
  peak_power_kw: number;
  current_track_state: string;
  threat_priority: string;
  jamming_attempts: number;
}

interface WaveformResult {
  synthesis_id: string;
  target_emitter_id: string;
  technique_applied: string;
  synthesis_latency_us: number;
  drfm_parameters: {
    center_frequency_ghz: number;
    modulation: string;
    pull_off_delay_us: number;
    doppler_shift_khz: number;
    radiated_jamming_power_kw: number;
  };
  jamming_to_signal_ratio_db: number;
  track_break_probability: number;
  status: string;
  timestamp: number;
}

interface EngagementResult {
  engagement_id: string;
  emitter_id: string;
  previous_state: string;
  current_state: string;
  technique: string;
  duration_ms: number;
  rf_response_latency_us: number;
  deception_outcome: string;
  effective_rcs_reduction_db: number;
  status: string;
  timestamp: number;
}

export function CognitiveEWStudio() {
  const [emitters, setEmitters] = useState<Emitter[]>([]);
  const [selectedEmitterId, setSelectedEmitterId] = useState<string>("");
  const [technique, setTechnique] = useState<string>("RANGE_GATE_PULL_OFF_RGPO");
  const [latestWaveform, setLatestWaveform] = useState<WaveformResult | null>(null);
  const [latestEngagement, setLatestEngagement] = useState<EngagementResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [engaging, setEngaging] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  const fetchEmittersAndMetrics = async () => {
    setLoading(true);
    try {
      const [emitRes, metRes] = await Promise.all([
        fetch("/api/cognitive-ew/emitters"),
        fetch("/api/cognitive-ew/metrics"),
      ]);
      const emitData = await emitRes.json();
      const metData = await metRes.json();

      if (emitData.emitters) {
        setEmitters(emitData.emitters);
        if (!selectedEmitterId && emitData.emitters.length > 0) {
          setSelectedEmitterId(emitData.emitters[0].emitter_id);
        }
      }
      if (metData.metrics) {
        setMetrics(metData.metrics);
      }
    } catch (e) {
      console.error("Failed to load cognitive EW data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmittersAndMetrics();
  }, []);

  const handleSynthesize = async () => {
    if (!selectedEmitterId) return;
    setSynthesizing(true);
    try {
      const em = emitters.find((e) => e.emitter_id === selectedEmitterId);
      const payload = {
        emitter_id: selectedEmitterId,
        carrier_frequency_ghz: em?.frequency_ghz || 9.85,
        pulse_width_us: em?.pulse_width_us || 12.5,
        snr_db: 26.0,
        technique,
      };

      const res = await fetch("/api/cognitive-ew/synthesize-waveform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.waveform) {
        setLatestWaveform(data.waveform);
      }
    } catch (e) {
      console.error("Failed to synthesize DRFM waveform", e);
    } finally {
      setSynthesizing(false);
    }
  };

  const handleEngage = async () => {
    if (!selectedEmitterId) return;
    setEngaging(true);
    try {
      const payload = {
        emitter_id: selectedEmitterId,
        technique,
        duration_ms: 250.0,
      };

      const res = await fetch("/api/cognitive-ew/engage-countermeasure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.engagement) {
        setLatestEngagement(data.engagement);
        fetchEmittersAndMetrics();
      }
    } catch (e) {
      console.error("Failed to engage cognitive countermeasure", e);
    } finally {
      setEngaging(false);
    }
  };

  const selectedEmitter = emitters.find((e) => e.emitter_id === selectedEmitterId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-xl border border-amber-800/50 bg-gradient-to-r from-slate-950 via-amber-950/20 to-slate-950 p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Radio className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">
                  Cognitive Electronic Warfare (EW) Autonomous Radar Waveform Synthesis
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  CAPABILITY 69
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Wideband 1–40 GHz Pulse Descriptor Word (PDW) extraction, fast DRFM RGPO/VGPO synthesis, and sub-5 microsecond radar track breaking.
              </p>
            </div>
          </div>
          <button
            onClick={fetchEmittersAndMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Scan Spectrum
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Monitored Emitters</span>
            <span className="text-xl font-bold text-amber-400 font-mono">
              {metrics?.total_emitters_monitored || emitters.length} Active
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Threats Neutralized</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {metrics?.threats_neutralized || 0} Radar Locks Broken
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Mean DRFM Turnaround</span>
            <span className="text-xl font-bold text-cyan-400 font-mono">
              {metrics?.mean_drfm_turnaround_us || 3.75} μs
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Spectrum Dominance State</span>
            <span className="text-xs font-bold text-indigo-400 font-mono truncate block mt-1">
              {metrics?.spectrum_dominance_state || "AIR_SUPERIORITY"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Intercepted Emitters */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Crosshair className="h-4 w-4 text-amber-400" />
              Intercepted Hostile Emitters
            </h3>
            <div className="space-y-2">
              {emitters.map((e) => (
                <button
                  key={e.emitter_id}
                  onClick={() => setSelectedEmitterId(e.emitter_id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedEmitterId === e.emitter_id
                      ? "bg-amber-950/40 border-amber-500/50 text-white shadow-md"
                      : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-slate-200 truncate">{e.name}</span>
                    <span className="text-xs font-mono text-amber-400">{e.frequency_ghz} GHz</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                    <span>{e.rf_band.split(" ")[0]} ({e.radar_type.split(" ")[0]})</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        e.threat_priority === "NEUTRALIZED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : e.threat_priority.includes("CRITICAL") || e.threat_priority.includes("LETHAL")
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {e.threat_priority}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedEmitter && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Wifi className="h-3.5 w-3.5 text-amber-400" />
                Pulse Descriptor Word (PDW)
              </h4>
              <div className="text-xs space-y-1.5 font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Emitter ID:</span>
                  <span className="text-amber-400">{selectedEmitter.emitter_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Carrier Frequency:</span>
                  <span className="text-slate-200">{selectedEmitter.frequency_ghz} GHz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PRI Mode:</span>
                  <span className="text-indigo-300">{selectedEmitter.pri_mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pulse Width:</span>
                  <span className="text-cyan-400">{selectedEmitter.pulse_width_us} μs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Peak Radiated Power:</span>
                  <span className="text-rose-400">{selectedEmitter.peak_power_kw} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tracking Status:</span>
                  <span className={selectedEmitter.current_track_state.includes("BROKEN") ? "text-emerald-400" : "text-amber-400"}>
                    {selectedEmitter.current_track_state}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center & Right Column: Deception Controls & Waveform Synthesizer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-400" />
              DRFM Waveform Generation & Jamming Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">
                  Deception Technique
                </label>
                <select
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:ring-amber-500"
                >
                  <option value="RANGE_GATE_PULL_OFF_RGPO">Range Gate Pull-Off (RGPO) - Delay Seduced</option>
                  <option value="VELOCITY_GATE_PULL_OFF_VGPO">Velocity Gate Pull-Off (VGPO) - Doppler Slew</option>
                  <option value="COHERENT_FALSE_TARGET_SWARM">Coherent False Target Swarm (Multi-Echo)</option>
                  <option value="COHERENT_NOISE_FLOOD">Coherent Gaussian Noise Flood</option>
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  onClick={handleSynthesize}
                  disabled={synthesizing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-md shadow-amber-600/20 disabled:opacity-50"
                >
                  <Cpu className={`h-4 w-4 ${synthesizing ? "animate-spin" : ""}`} />
                  {synthesizing ? "Synthesizing..." : "Synthesize DRFM"}
                </button>
                <button
                  onClick={handleEngage}
                  disabled={engaging}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  <Zap className={`h-4 w-4 ${engaging ? "animate-pulse" : ""}`} />
                  {engaging ? "Transmitting..." : "Break Radar Track"}
                </button>
              </div>
            </div>

            {/* Synthesized Waveform Card */}
            {latestWaveform && (
              <div className="p-4 rounded-lg border border-amber-900/40 bg-amber-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    Digital Radio Frequency Memory (DRFM) Synthesis Ready
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {latestWaveform.synthesis_latency_us} μs Turnaround
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">J/S Jamming Ratio:</span>
                    <span className="text-emerald-400 font-bold">+{latestWaveform.jamming_to_signal_ratio_db} dB</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Track Break Prob:</span>
                    <span className="text-cyan-400 font-bold">
                      {(latestWaveform.track_break_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Pull-Off Delay:</span>
                    <span className="text-indigo-400 font-bold">{latestWaveform.drfm_parameters.pull_off_delay_us} μs</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Radiated Jamming Power:</span>
                    <span className="text-rose-400 font-bold">{latestWaveform.drfm_parameters.radiated_jamming_power_kw} kW</span>
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Card */}
            {latestEngagement && (
              <div className="p-4 rounded-lg border border-emerald-900/40 bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Cognitive Jamming Engagement Succeeded
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {latestEngagement.rf_response_latency_us} μs Response
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Adversary Radar State:</span>
                    <span className="text-emerald-400 font-bold">{latestEngagement.current_state}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">RCS Suppression:</span>
                    <span className="text-cyan-400 font-bold">{latestEngagement.effective_rcs_reduction_db} dB</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Deception Outcome:</span>
                    <span className="text-slate-300 truncate">{latestEngagement.deception_outcome}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* EW Real-time Emission Log */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Terminal className="h-4 w-4 text-amber-400" />
              Cognitive Electronic Warfare Spectrum Stream
            </h3>
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5 h-36 overflow-y-auto">
              <p className="text-amber-400">[0.00μs] Wideband receiver sweeps 1.0–40.0 GHz: 3 hostile emitters de-interleaved.</p>
              <p className="text-indigo-400">[1.15μs] X-Band AESA: PRI staggered interval detected (18.5 μs, 22.0 μs, 19.8 μs).</p>
              <p className="text-slate-400">[2.40μs] DRFM memory pipeline loaded: 14-bit ADC/DAC phase coherence verified.</p>
              <p className="text-emerald-400">[3.40μs] Range Gate Pull-Off (RGPO) pulse synthesized with +22.4 dB J/S advantage.</p>
              {latestEngagement && (
                <p className="text-rose-400">
                  [{latestEngagement.engagement_id}] Transmit burst: {latestEngagement.duration_ms} ms at {latestEngagement.technique}; lock broken.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
