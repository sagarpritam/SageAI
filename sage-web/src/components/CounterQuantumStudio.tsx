"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  Zap,
  RefreshCw,
  Terminal,
  Layers,
  Key,
  Flame,
  Binary,
  AlertOctagon,
} from "lucide-react";

interface QuantumInterceptor {
  interceptor_id: string;
  name: string;
  traffic_type: string;
  target_pqc_scheme: string;
  chaff_injection_ratio_pct: number;
  adversary_harvest_detected: boolean;
  status: string;
  honey_ciphertexts_injected: number;
}

interface InjectionResult {
  injection_id: string;
  interceptor_id: string;
  burst_count: number;
  target_pqc_scheme: string;
  lattice_dimension: number;
  entropy_sink_type: string;
  trapdoor_signature: string;
  injected_data_volume_mb: number;
  adversary_storage_corrupted_pct: number;
  estimated_adversary_qpu_burn_hours: number;
  status: string;
  timestamp: number;
}

interface DecoherenceResult {
  decoherence_id: string;
  interceptor_id: string;
  target_algorithm: string;
  quantum_fidelity_collapse_pct: number;
  adversary_error_syndrome: string;
  cryptanalytic_work_wasted_qpu_days: number;
  outcome: string;
  timestamp: number;
}

export function CounterQuantumStudio() {
  const [interceptors, setInterceptors] = useState<QuantumInterceptor[]>([]);
  const [selectedItId, setSelectedItId] = useState<string>("");
  const [burstCount, setBurstCount] = useState<number>(100);
  const [latestInjection, setLatestInjection] = useState<InjectionResult | null>(null);
  const [latestDecoherence, setLatestDecoherence] = useState<DecoherenceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [trippingDecoherence, setTrippingDecoherence] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  const fetchInterceptorsAndMetrics = async () => {
    setLoading(true);
    try {
      const [itRes, metRes] = await Promise.all([
        fetch("/api/counter-quantum/interceptors"),
        fetch("/api/counter-quantum/metrics"),
      ]);
      const itData = await itRes.json();
      const metData = await metRes.json();

      if (itData.interceptors) {
        setInterceptors(itData.interceptors);
        if (!selectedItId && itData.interceptors.length > 0) {
          setSelectedItId(itData.interceptors[0].interceptor_id);
        }
      }
      if (metData.metrics) {
        setMetrics(metData.metrics);
      }
    } catch (e) {
      console.error("Failed to load counter-quantum data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterceptorsAndMetrics();
  }, []);

  const handleInjectChaff = async () => {
    if (!selectedItId) return;
    setInjecting(true);
    try {
      const payload = {
        interceptor_id: selectedItId,
        burst_count: burstCount,
        lattice_dimension: 1024,
        entropy_sink_type: "TRAPDOOR_EXPONENTIAL_BRANCH_SINK",
      };

      const res = await fetch("/api/counter-quantum/inject-honey-chaff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.injection) {
        setLatestInjection(data.injection);
        fetchInterceptorsAndMetrics();
      }
    } catch (e) {
      console.error("Failed to inject quantum honey-chaff", e);
    } finally {
      setInjecting(false);
    }
  };

  const handleTriggerDecoherence = async () => {
    if (!selectedItId) return;
    setTrippingDecoherence(true);
    try {
      const payload = {
        interceptor_id: selectedItId,
        target_quantum_algorithm: "PRIMAL_DUAL_LATTICE_BKZ_2_0",
      };

      const res = await fetch("/api/counter-quantum/trigger-decoherence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.decoherence) {
        setLatestDecoherence(data.decoherence);
        fetchInterceptorsAndMetrics();
      }
    } catch (e) {
      console.error("Failed to trigger quantum decoherence", e);
    } finally {
      setTrippingDecoherence(false);
    }
  };

  const selectedIt = interceptors.find((it) => it.interceptor_id === selectedItId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-xl border border-fuchsia-800/50 bg-gradient-to-r from-slate-950 via-fuchsia-950/20 to-slate-950 p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg text-fuchsia-400">
              <Binary className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">
                  Counter-Quantum Cryptographic Harvest Attack Disruption Matrix
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40">
                  CAPABILITY 72
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Poisoning adversary &quot;Harvest Now, Decrypt Later&quot; (HNDL) data vaults via mathematically authentic honey-ciphertexts, entropy chaff, and QPU trapdoors.
              </p>
            </div>
          </div>
          <button
            onClick={fetchInterceptorsAndMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Egress
          </button>
        </div>

        {/* Global Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Harvest Interceptors</span>
            <span className="text-xl font-bold text-fuchsia-400 font-mono">
              {metrics?.total_harvest_interceptors || interceptors.length} Monitored
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Honey-Ciphertexts Injected</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {metrics?.total_honey_ciphertexts_injected?.toLocaleString() || "28,240"}
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Active Chaff Pipelines</span>
            <span className="text-xl font-bold text-cyan-400 font-mono">
              {metrics?.active_chaff_pipelines || 2} Streams
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Adversary Vault Status</span>
            <span className="text-xs font-bold text-rose-400 font-mono truncate block mt-1">
              {metrics?.adversary_hndl_vault_status || "ENTROPY_POISONED"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interceptors Selector */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-fuchsia-400" />
              Egress Interceptors
            </h3>
            <div className="space-y-2">
              {interceptors.map((it) => (
                <button
                  key={it.interceptor_id}
                  onClick={() => setSelectedItId(it.interceptor_id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedItId === it.interceptor_id
                      ? "bg-fuchsia-950/40 border-fuchsia-500/50 text-white shadow-md"
                      : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-slate-200 truncate">{it.name}</span>
                    <span className="text-xs font-mono text-fuchsia-400">{it.target_pqc_scheme}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                    <span className="truncate max-w-[140px]">{it.traffic_type}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                      {it.honey_ciphertexts_injected} Injected
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedIt && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Key className="h-3.5 w-3.5 text-fuchsia-400" />
                Harvest Sentry Parameters
              </h4>
              <div className="text-xs space-y-1.5 font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Interceptor ID:</span>
                  <span className="text-fuchsia-400">{selectedIt.interceptor_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Scheme:</span>
                  <span className="text-cyan-400">{selectedIt.target_pqc_scheme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chaff Ratio:</span>
                  <span className="text-emerald-400">{selectedIt.chaff_injection_ratio_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Adversary Harvest:</span>
                  <span className={selectedIt.adversary_harvest_detected ? "text-rose-400 font-bold" : "text-slate-500"}>
                    {selectedIt.adversary_harvest_detected ? "ACTIVE_SIPHON_DETECTED" : "PASSIVE_STANDBY"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center & Right Column: Chaff Injection & Decoherence Trip */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Flame className="h-4 w-4 text-fuchsia-400" />
              Honey-Chaff Synthesis & Adversarial QPU Decoherence Trip
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-400 uppercase tracking-wider">
                  Burst Volume:
                </label>
                <select
                  value={burstCount}
                  onChange={(e) => setBurstCount(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:ring-fuchsia-500 font-mono"
                >
                  <option value={50}>50 Decoy Ciphertexts (~78 KB)</option>
                  <option value={100}>100 Decoy Ciphertexts (~156 KB)</option>
                  <option value={250}>250 Decoy Ciphertexts (~390 KB)</option>
                  <option value={500}>500 Decoy Ciphertexts (~780 KB)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleInjectChaff}
                  disabled={injecting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-fuchsia-600/20 disabled:opacity-50"
                >
                  <Binary className={`h-4 w-4 ${injecting ? "animate-spin" : ""}`} />
                  {injecting ? "Injecting..." : "Inject Honey Chaff"}
                </button>
                <button
                  onClick={handleTriggerDecoherence}
                  disabled={trippingDecoherence}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  <Zap className={`h-4 w-4 ${trippingDecoherence ? "animate-pulse" : ""}`} />
                  {trippingDecoherence ? "Collapsing QPU..." : "Trip QPU Decoherence"}
                </button>
              </div>
            </div>

            {/* Injection Result */}
            {latestInjection && (
              <div className="p-4 rounded-lg border border-fuchsia-900/40 bg-fuchsia-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-fuchsia-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Honey-Ciphertexts Successfully Siphoned into Adversary Vault
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40">
                    +{latestInjection.burst_count} Decoys Injected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Corrupted Vault Volume:</span>
                    <span className="text-rose-400 font-bold">+{latestInjection.adversary_storage_corrupted_pct}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">QPU Burn Hours:</span>
                    <span className="text-amber-400 font-bold">{latestInjection.estimated_adversary_qpu_burn_hours} hrs</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Lattice Complexity Sink:</span>
                    <span className="text-indigo-400 font-bold">Dim={latestInjection.lattice_dimension}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Trapdoor Signature:</span>
                    <span className="text-cyan-400 font-bold truncate block">{latestInjection.trapdoor_signature}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Decoherence Result */}
            {latestDecoherence && (
              <div className="p-4 rounded-lg border border-rose-900/40 bg-rose-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                    <AlertOctagon className="h-4 w-4 text-rose-400" />
                    Adversarial QPU Quantum Decoherence Triggered
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {latestDecoherence.quantum_fidelity_collapse_pct}% Qubit Collapse
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Wasted Work:</span>
                    <span className="text-rose-400 font-bold">{latestDecoherence.cryptanalytic_work_wasted_qpu_days} QPU Days</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Error Syndrome:</span>
                    <span className="text-slate-200 truncate">{latestDecoherence.adversary_error_syndrome}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Outcome:</span>
                    <span className="text-emerald-400 truncate">{latestDecoherence.outcome}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Egress Feed */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Terminal className="h-4 w-4 text-fuchsia-400" />
              Counter-Quantum Harvest Telemetry Feed
            </h3>
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5 h-36 overflow-y-auto">
              <p className="text-fuchsia-400">[0.00ms] Transatlantic subsea optical tap: 400Gbps egress monitored for unauthorized splitters.</p>
              <p className="text-emerald-400">[1.42ms] Decoy ML-KEM-1024 seed generator armed with SMT branch complexity trapdoors.</p>
              <p className="text-slate-400">[3.80ms] Adversary intelligence HNDL storage node ingested 150 chaff packets.</p>
              {latestDecoherence && (
                <p className="text-rose-400 font-bold">
                  [{latestDecoherence.decoherence_id}] Trapdoor sprung! Adversary QPU collapsed: {latestDecoherence.quantum_fidelity_collapse_pct}% decoherence.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
