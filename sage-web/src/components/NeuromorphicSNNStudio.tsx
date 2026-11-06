"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  Sliders,
  Sparkles,
  Terminal,
  Layers,
  BatteryCharging,
  Fingerprint,
} from "lucide-react";

interface NeuromorphicCore {
  core_id: string;
  name: string;
  hardware_platform: string;
  total_neurons: number;
  total_synapses: number;
  baseline_spike_rate_mhz: number;
  energy_per_synapse_pj: number;
  status: string;
  power_consumption_mw: number;
  voltage_glitch_detected: boolean;
  clamps_active: number;
}

interface SNNClassification {
  classification_id: string;
  core_id: string;
  threat_detected: boolean;
  threat_type: string;
  mean_spike_rate_mhz: number;
  aer_jitter_ns: number;
  voltage_anomaly_mv: number;
  bus_entropy: number;
  inference_latency_ns: number;
  energy_consumed_pj: number;
  action_recommended: string;
}

interface ClampResult {
  clamp_id: string;
  core_id: string;
  clamp_line: string;
  response_latency_ns: number;
  clamp_energy_pj: number;
  hardware_bus_isolated: boolean;
  new_core_status: string;
}

export function NeuromorphicSNNStudio() {
  const [cores, setCores] = useState<NeuromorphicCore[]>([]);
  const [selectedCore, setSelectedCore] = useState<NeuromorphicCore | null>(null);
  const [loading, setLoading] = useState(false);
  const [spikeRate, setSpikeRate] = useState<number>(125.0);
  const [aerJitter, setAerJitter] = useState<number>(18.0);
  const [voltageDeviation, setVoltageDeviation] = useState<number>(25.0);
  const [busEntropy, setBusEntropy] = useState<number>(7.2);
  const [classifying, setClassifying] = useState(false);
  const [clamping, setClamping] = useState(false);
  const [classification, setClassification] = useState<SNNClassification | null>(null);
  const [clampResult, setClampResult] = useState<ClampResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetchCores();
  }, []);

  async function fetchCores() {
    setLoading(true);
    try {
      const res = await fetch("/api/neuromorphic-snn/cores");
      const data = await res.json();
      if (data.cores) {
        setCores(data.cores);
        if (!selectedCore && data.cores.length > 0) {
          setSelectedCore(data.cores[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load neuromorphic cores", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleClassify() {
    if (!selectedCore) return;
    setClassifying(true);
    setClassification(null);
    try {
      const res = await fetch("/api/neuromorphic-snn/classify-spikes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          core_id: selectedCore.core_id,
          mean_spike_rate_mhz: spikeRate,
          aer_inter_arrival_jitter_ns: aerJitter,
          voltage_anomaly_mv: voltageDeviation,
          bus_payload_entropy: busEntropy,
        }),
      });
      const data = await res.json();
      if (data.classification) {
        setClassification(data.classification);
        if (data.classification.threat_detected) {
          setCores((prev) =>
            prev.map((c) =>
              c.core_id === selectedCore.core_id
                ? { ...c, status: "ANOMALY_SPIKE_DETECTED", voltage_glitch_detected: true }
                : c
            )
          );
        }
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] SNN CLASSIFY: ${selectedCore.core_id} -> ${data.classification.threat_type} (Latency: ${data.classification.inference_latency_ns}ns, Energy: ${data.classification.energy_consumed_pj}pJ)`,
          ...prev.slice(0, 15),
        ]);
      }
    } catch (err) {
      console.error("Classification failed", err);
    } finally {
      setClassifying(false);
    }
  }

  async function handleClamp() {
    if (!selectedCore) return;
    setClamping(true);
    try {
      const res = await fetch("/api/neuromorphic-snn/inject-clamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          core_id: selectedCore.core_id,
          clamp_line: "BUS_LINE_RESET_ISOLATE",
          response_latency_ns: 385.0,
        }),
      });
      const data = await res.json();
      if (data.clamp) {
        setClampResult(data.clamp);
        setCores((prev) =>
          prev.map((c) =>
            c.core_id === selectedCore.core_id
              ? {
                  ...c,
                  status: "HARDWARE_CLAMPED_SECURE",
                  clamps_active: c.clamps_active + 1,
                  voltage_glitch_detected: false,
                }
              : c
          )
        );
        setSelectedCore((prev) =>
          prev
            ? {
                ...prev,
                status: "HARDWARE_CLAMPED_SECURE",
                clamps_active: prev.clamps_active + 1,
                voltage_glitch_detected: false,
              }
            : null
        );
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] NEURO-CLAMP: Discharged GABA-ergic clamp on ${selectedCore.core_id} in ${data.clamp.response_latency_ns}ns (${data.clamp.clamp_energy_pj}pJ)`,
          ...prev.slice(0, 15),
        ]);
      }
    } catch (err) {
      console.error("Clamp failed", err);
    } finally {
      setClamping(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-900/20 to-slate-900/50 border border-emerald-500/30 backdrop-blur-md shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
            <Cpu className="w-8 h-8 animate-pulse text-emerald-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Neuromorphic Spiking Neural Network (SNN) Edge Sentinel
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                CAP-59 • v4.6.0
              </span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Sub-Microsecond LIF Spiking Silicon, AER Train Stream Classification & Nanosecond Glitch Fault Clamps
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={fetchCores}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Cores</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-slate-400">Neuromorphic Cores</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{cores.length}</span>
            <span className="text-xs text-slate-400">Loihi 2 / Dynap</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-emerald-400">Inference Latency</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-300">385 ns</span>
            <span className="text-xs text-emerald-400/80">Sub-Microsecond</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-teal-400">Energy Efficiency</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-teal-300">12.1 pJ</span>
            <span className="text-xs text-teal-400/80">Per Synapse</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-amber-400">Neuro-Clamps</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-300">
              {cores.reduce((acc, c) => acc + c.clamps_active, 0)}
            </span>
            <span className="text-xs text-amber-400/80">Isolated Lines</span>
          </div>
        </div>
      </div>

      {/* Main Studio Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Active Neuromorphic Silicon Cores
          </h3>
          <div className="space-y-3">
            {cores.map((core) => {
              const isSelected = selectedCore?.core_id === core.core_id;
              const isNominal = core.status === "SPIKING_NOMINAL";

              return (
                <div
                  key={core.core_id}
                  onClick={() => {
                    setSelectedCore(core);
                    setSpikeRate(core.baseline_spike_rate_mhz);
                    setClassification(null);
                    setClampResult(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/40"
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{core.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{core.hardware_platform}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isNominal
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {core.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Neurons: {(core.total_neurons / 1000).toFixed(0)}k</span>
                    <span>Power: {core.power_consumption_mw} mW</span>
                    <span className="font-mono text-emerald-300">{core.baseline_spike_rate_mhz} MHz</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry Controls & Classifier */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCore ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedCore.name}
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedCore.core_id}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Silicon: {selectedCore.hardware_platform} • Energy: {selectedCore.energy_per_synapse_pj} pJ/synapse
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Active Status</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {selectedCore.status}
                  </span>
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      Mean Spike Train Firing Frequency
                    </span>
                    <span className="font-mono text-emerald-300">{spikeRate.toFixed(1)} MHz</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="1"
                    value={spikeRate}
                    onChange={(e) => setSpikeRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      AER Inter-Arrival Timing Jitter
                    </span>
                    <span className="font-mono text-emerald-300">{aerJitter.toFixed(1)} ns</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={aerJitter}
                    onChange={(e) => setAerJitter(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      Hardware Voltage Deviation (Glitch Probe)
                    </span>
                    <span className="font-mono text-amber-300">{voltageDeviation.toFixed(1)} mV</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="250"
                    step="5"
                    value={voltageDeviation}
                    onChange={(e) => setVoltageDeviation(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Deviations &gt; 120 mV flag nanosecond voltage glitch fault injection.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      Bus Payload Shannon Entropy
                    </span>
                    <span className="font-mono text-emerald-300">{busEntropy.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="8.0"
                    step="0.05"
                    value={busEntropy}
                    onChange={(e) => setBusEntropy(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleClassify}
                  disabled={classifying}
                  className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30"
                >
                  <Activity className={`w-4 h-4 ${classifying ? "animate-spin" : ""}`} />
                  <span>{classifying ? "Evaluating Spikes..." : "Classify AER Spike Train"}</span>
                </button>

                <button
                  onClick={handleClamp}
                  disabled={clamping || selectedCore.status !== "ANOMALY_SPIKE_DETECTED"}
                  className={`flex-1 min-w-[200px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-lg ${
                    selectedCore.status === "ANOMALY_SPIKE_DETECTED"
                      ? "bg-amber-600 hover:bg-amber-500 shadow-amber-900/30 animate-pulse"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Zap className={`w-4 h-4 ${clamping ? "animate-spin" : ""}`} />
                  <span>{clamping ? "Injecting Clamp..." : "Discharge Inhibitory Neuro-Clamp"}</span>
                </button>
              </div>

              {/* Classification Verdict */}
              {classification && (
                <div
                  className={`p-4 rounded-xl border ${
                    classification.threat_detected
                      ? "bg-rose-950/20 border-rose-500/40"
                      : "bg-emerald-950/20 border-emerald-500/40"
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                      {classification.threat_detected ? (
                        <>
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          Hardware Threat Intercepted in Sub-Microsecond!
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Nominal Neuromorphic Spike Stream
                        </>
                      )}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      {classification.classification_id}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400">Type:</span>{" "}
                      <span className="font-semibold text-rose-300">{classification.threat_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Latency:</span>{" "}
                      <span className="font-bold text-emerald-300 font-mono">
                        {classification.inference_latency_ns} ns
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Action:</span>{" "}
                      <span className="font-semibold text-white">
                        {classification.action_recommended}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {clampResult && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Inhibitory GABA-ergic Clamp Latched — Hardware Line Isolated
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {clampResult.clamp_id}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400">Actuation Speed:</span>{" "}
                      <span className="text-emerald-300 font-bold">
                        {clampResult.response_latency_ns} ns
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Energy Expended:</span>{" "}
                      <span className="text-emerald-300 font-bold">
                        {clampResult.clamp_energy_pj} pJ
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>{" "}
                      <span className="text-emerald-300 font-bold">
                        {clampResult.new_core_status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              Select a neuromorphic core to inspect
            </div>
          )}

          {/* Activity Terminal */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-lg">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Neuromorphic Spike Stream & Bus Tampering Console
            </h4>
            <div className="space-y-1 font-mono text-xs text-slate-300 max-h-36 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-600">No spike anomalies logged in this session.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

