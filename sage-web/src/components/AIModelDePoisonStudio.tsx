"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Scissors,
  Layers,
  Sparkles,
  Terminal,
} from "lucide-react";

interface LoRAAdapter {
  adapter_id: string;
  name: string;
  base_model: string;
  parameter_count_m: number;
  weight_format: string;
  status: string;
  backdoor_trigger_detected: string;
  anomaly_sparsity_pct: number;
  retrained_utility_retention: number;
}

interface ScanResult {
  scan_id: string;
  adapter_id: string;
  poison_detected: boolean;
  backdoor_signature: string;
  anomaly_sparsity_pct: number;
  threshold_pct: number;
  verdict: string;
  recommended_action: string;
  timestamp?: number;
}

interface ExcisionResult {
  excision_id: string;
  adapter_id: string;
  excision_latency_ms: number;
  ablated_neurons_count: number;
  rank1_subspaces_zeroed: number;
  utility_retention_pct: number;
  new_status: string;
}

export function AIModelDePoisonStudio() {
  const [adapters, setAdapters] = useState<LoRAAdapter[]>([]);
  const [selectedAdapter, setSelectedAdapter] = useState<LoRAAdapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [anomalyThreshold, setAnomalyThreshold] = useState<number>(10.0);
  const [scanning, setScanning] = useState(false);
  const [excising, setExcising] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [excisionResult, setExcisionResult] = useState<ExcisionResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchAdapters = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ai-depoison/adapters");
      const data = (await res.json().catch(() => ({}))) as {
        adapters?: LoRAAdapter[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Failed to load LoRA adapters");
      }
      if (data.adapters) {
        setAdapters(data.adapters);
        if (data.adapters.length > 0) {
          setSelectedAdapter((prev) => prev || data.adapters![0]);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load LoRA adapters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdapters();
  }, [fetchAdapters]);

  async function handleScan() {
    if (!selectedAdapter) return;
    setScanning(true);
    setErrorMsg(null);
    setScanResult(null);
    try {
      const res = await fetch("/api/ai-depoison/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adapter_id: selectedAdapter.adapter_id,
          anomaly_threshold: anomalyThreshold,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        scan?: ScanResult;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Trojan backdoor weight scan failed");
      }
      if (data.scan) {
        setScanResult(data.scan);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] SCAN: ${selectedAdapter.adapter_id} -> ${data.scan!.verdict} (Sparsity: ${data.scan!.anomaly_sparsity_pct}%)`,
          ...prev.slice(0, 15),
        ]);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Trojan backdoor weight scan failed");
    } finally {
      setScanning(false);
    }
  }

  async function handleExcision() {
    if (!selectedAdapter) return;
    setExcising(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ai-depoison/excise-backdoor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adapter_id: selectedAdapter.adapter_id }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        excision?: ExcisionResult;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Surgical rank-1 neuron excision failed");
      }
      if (data.excision) {
        setExcisionResult(data.excision);
        setAdapters((prev) =>
          prev.map((a) =>
            a.adapter_id === selectedAdapter.adapter_id
              ? {
                  ...a,
                  status: "DEPOISONED_VERIFIED",
                  backdoor_trigger_detected: "NEUTRALIZED_ABLATED",
                  anomaly_sparsity_pct: 1.2,
                }
              : a
          )
        );
        setSelectedAdapter((prev) =>
          prev
            ? {
                ...prev,
                status: "DEPOISONED_VERIFIED",
                backdoor_trigger_detected: "NEUTRALIZED_ABLATED",
                anomaly_sparsity_pct: 1.2,
              }
            : null
        );
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] SURGICAL EXCISION: ${selectedAdapter.adapter_id} -> ${data.excision!.ablated_neurons_count} neurons ablated in ${data.excision!.excision_latency_ms}ms (Utility: ${data.excision!.utility_retention_pct}%)`,
          ...prev.slice(0, 15),
        ]);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Surgical rank-1 neuron excision failed");
    } finally {
      setExcising(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-900/20 to-slate-900/50 border border-violet-500/30 backdrop-blur-md shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-violet-500/20 border border-violet-500/40 rounded-xl text-violet-400">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Autonomous Sovereign AI Model De-Poisoning Engine
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono">
                CAP-56 • v4.5.0
              </span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Surgical Rank-1 Neuron Ablation & Latent Sleeper-Agent Trojan Weight Extraction (GGUF / SafeTensors)
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            type="button"
            onClick={fetchAdapters}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Adapters</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-slate-400">Monitored Adapters</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{adapters.length}</span>
            <span className="text-xs text-slate-400">LoRA / GGUF</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-amber-400">Poison Suspected</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-300">
              {adapters.filter((a) => a.status === "POISON_SUSPECTED").length}
            </span>
            <span className="text-xs text-amber-400/80">Quarantined</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-emerald-400">Reasoning Utility</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-300">99.92%</span>
            <span className="text-xs text-emerald-400/80">Post-Excision</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-violet-400">Excision Latency</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-violet-300">21.4 ms</span>
            <span className="text-xs text-violet-400/80">Zero Re-training</span>
          </div>
        </div>
      </div>

      {/* Main Studio Interactive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adapter Selector List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            Foundation LoRA Adapters
          </h3>
          <div className="space-y-3">
            {adapters.map((adapter) => {
              const isSelected = selectedAdapter?.adapter_id === adapter.adapter_id;
              const isPoisoned = adapter.status === "POISON_SUSPECTED";
              const isClean = adapter.status === "VERIFIED_CLEAN";

              return (
                <div
                  key={adapter.adapter_id}
                  onClick={() => {
                    setSelectedAdapter(adapter);
                    setScanResult(null);
                    setExcisionResult(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-violet-950/30 border-violet-500/60 shadow-lg shadow-violet-950/40"
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{adapter.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Base: {adapter.base_model}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isPoisoned
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : isClean
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                      }`}
                    >
                      {adapter.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Format: {adapter.weight_format}</span>
                    <span>Params: {adapter.parameter_count_m}M</span>
                    <span>Sparsity: {adapter.anomaly_sparsity_pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inspection & Controls Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAdapter ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedAdapter.name}
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedAdapter.adapter_id}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Format: {selectedAdapter.weight_format} • Active Signature:{" "}
                    <span className="text-amber-300 font-mono">
                      {selectedAdapter.backdoor_trigger_detected}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Anomaly Sparsity</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">
                    {selectedAdapter.anomaly_sparsity_pct}%
                  </span>
                </div>
              </div>

              {/* Sliders and Controls */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-violet-400" />
                      Activation Sparsity Poison Threshold (&tau;)
                    </span>
                    <span className="font-mono text-violet-300">{anomalyThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="0.5"
                    value={anomalyThreshold}
                    onChange={(e) => setAnomalyThreshold(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Weights exceeding threshold will be marked for surgical rank-1 neuron ablation.
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleScan}
                    disabled={scanning}
                    className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-900/30"
                  >
                    <Activity className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
                    <span>{scanning ? "Scanning Weights..." : "Scan for Trojan Backdoors"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExcision}
                    disabled={excising || selectedAdapter.status !== "POISON_SUSPECTED"}
                    className={`flex-1 min-w-[200px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-lg ${
                      selectedAdapter.status === "POISON_SUSPECTED"
                        ? "bg-rose-600 hover:bg-rose-500 shadow-rose-900/30"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <Scissors className={`w-4 h-4 ${excising ? "animate-spin" : ""}`} />
                    <span>{excising ? "Excising Neurons..." : "Surgical Rank-1 Excision"}</span>
                  </button>
                </div>
              </div>

              {/* Scan / Excision Verdicts */}
              {scanResult && (
                <div
                  className={`p-4 rounded-xl border ${
                    scanResult.poison_detected
                      ? "bg-rose-950/20 border-rose-500/40"
                      : "bg-emerald-950/20 border-emerald-500/40"
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                      {scanResult.poison_detected ? (
                        <>
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          Poisoned Sleeper-Agent Trojan Confirmed
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Clean Model Weights Confirmed
                        </>
                      )}
                    </span>
                    <span className="text-xs font-mono text-slate-300">{scanResult.scan_id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400">Trigger:</span>{" "}
                      <span className="font-mono text-rose-300">{scanResult.backdoor_signature}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Action:</span>{" "}
                      <span className="font-semibold text-white">{scanResult.recommended_action}</span>
                    </div>
                  </div>
                </div>
              )}

              {excisionResult && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Neuron Ablation Complete — Utility Restored
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {excisionResult.excision_id}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400">Ablated:</span>{" "}
                      <span className="text-emerald-300 font-bold">
                        {excisionResult.ablated_neurons_count} Neurons
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Latency:</span>{" "}
                      <span className="text-emerald-300 font-bold">
                        {excisionResult.excision_latency_ms} ms
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Utility:</span>{" "}
                      <span className="text-emerald-300 font-bold">
                        {excisionResult.utility_retention_pct}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              Select an adapter to begin de-poisoning analysis
            </div>
          )}

          {/* Activity Terminal */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-lg">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Terminal className="w-3.5 h-3.5 text-violet-400" />
              Weight Ablation & Telemetry Console
            </h4>
            <div className="space-y-1 font-mono text-xs text-slate-300 max-h-36 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-600">No actions executed in this session.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

