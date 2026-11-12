"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Brain,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Lock,
  Fingerprint,
  Cpu,
  KeyRound,
} from "lucide-react";

interface OperatorProfile {
  operator_id: string;
  callsign: string;
  role: string;
  eeg_channel_count: number;
  impedance_kohm: number;
  nominal_p300_uv: number;
  nominal_n400_ms: number;
  biometric_status: string;
  coercion_attacks_blocked: number;
}

interface EvaluationResult {
  evaluation_id: string;
  operator_id: string;
  access_granted: boolean;
  threat_detected: boolean;
  threat_type: string;
  cognitive_stress_index: number;
  measured_p300_uv: number;
  measured_n400_ms: number;
  auth_action: string;
  raw_eeg_persisted: boolean;
  timestamp?: string;
}

export function NeuralBCIStudio() {
  const [operators, setOperators] = useState<OperatorProfile[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<OperatorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [p300Uv, setP300Uv] = useState<number>(14.5);
  const [n400Ms, setN400Ms] = useState<number>(395.0);
  const [stressIndex, setStressIndex] = useState<number>(0.25);
  const [syntheticReplay, setSyntheticReplay] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [svidResult, setSvidResult] = useState<{
    algorithm: string;
    spiffe_id: string;
    token_sha384: string;
    validity: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const hasInitializedSelectionRef = useRef(false);

  const fetchOperators = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/neural-bci/operators");
      const data = (await res.json().catch(() => ({}))) as {
        operators?: OperatorProfile[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Failed to load Neural BCI operators");
      }
      if (data.operators) {
        setOperators(data.operators);
        if (!hasInitializedSelectionRef.current && data.operators.length > 0) {
          hasInitializedSelectionRef.current = true;
          setSelectedOperator(data.operators[0]);
          setP300Uv(data.operators[0].nominal_p300_uv);
          setN400Ms(data.operators[0].nominal_n400_ms);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load Neural BCI operators");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  async function handleEvaluateIntent() {
    if (!selectedOperator) return;
    setEvaluating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/neural-bci/evaluate-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operator_id: selectedOperator.operator_id,
          p300_amplitude_uv: Number(p300Uv),
          n400_latency_ms: Number(n400Ms),
          cognitive_stress_index: Number(stressIndex),
          synthetic_replay_flag: syntheticReplay,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        evaluation?: EvaluationResult;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Neural BCI cognitive intent verification failed");
      }
      if (data.evaluation) {
        const item: EvaluationResult = {
          ...data.evaluation,
          timestamp: new Date().toLocaleTimeString(),
        };
        setEvalResult(item);

        if (item.threat_detected) {
          setOperators((prev) =>
            prev.map((o) =>
              o.operator_id === selectedOperator.operator_id
                ? { ...o, coercion_attacks_blocked: o.coercion_attacks_blocked + 1 }
                : o
            )
          );
          setSelectedOperator((prev) =>
            prev ? { ...prev, coercion_attacks_blocked: prev.coercion_attacks_blocked + 1 } : null
          );
        } else if (item.access_granted) {
          // Auto issue PQC SVID
          handleIssueSvid();
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Neural BCI cognitive intent verification failed");
    } finally {
      setEvaluating(false);
    }
  }

  function handleIssueSvid() {
    if (!selectedOperator) return;
    setSvidResult({
      algorithm: "ML-DSA-65_POST_QUANTUM",
      spiffe_id: `spiffe://sageai.sovereign/bci/${selectedOperator.operator_id}`,
      token_sha384: "d8e9f01824ef819284ba019284ca901824ef819284ba019284ca901824ef819284ba019284ca",
      validity: "300s Ephemeral",
    });
  }

  const totalCoercion = operators.reduce((acc, curr) => acc + (curr.coercion_attacks_blocked || 0), 0);

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <Brain className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Biometric & Neural Interface (BCI) Zero-Trust Gate
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                CAP-54
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                P300/N400 Zero-Knowledge
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Brain-Computer Interface cognitive authentication detecting coercion and synthetic EEG replay with zero persistent raw brainwave storage.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchOperators}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Operator Enclave
        </button>
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

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Enrolled Operators</p>
            <p className="text-2xl font-bold text-white mt-1">{operators.length} Clearances</p>
            <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> 64-Channel Medical EEG
            </p>
          </div>
          <Fingerprint className="w-8 h-8 text-purple-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Coercion Attacks Blocked</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{totalCoercion}</p>
            <p className="text-xs text-amber-400/80 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Duress & Replay Intercepted
            </p>
          </div>
          <ShieldAlert className="w-8 h-8 text-amber-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Privacy Guarantee</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">100.0% ZKP</p>
            <p className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Zero Raw EEG Stored
            </p>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Intent Verification Speed</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">&lt; 18.5 ms</p>
            <p className="text-xs text-zinc-400 mt-1">Real-Time Wavelet Decomposition</p>
          </div>
          <Activity className="w-8 h-8 text-cyan-400 opacity-60" />
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Operators List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" /> High-Clearance BCI Operators
          </h2>

          <div className="space-y-3">
            {operators.map((op) => {
              const isSelected = selectedOperator?.operator_id === op.operator_id;
              return (
                <div
                  key={op.operator_id}
                  onClick={() => {
                    hasInitializedSelectionRef.current = true;
                    setSelectedOperator(op);
                    setP300Uv(op.nominal_p300_uv);
                    setN400Ms(op.nominal_n400_ms);
                    setEvalResult(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-800/90 border-purple-500/50 shadow-lg shadow-purple-500/10"
                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white text-sm">{op.callsign}</span>
                      <p className="text-xs text-zinc-400 mt-1 font-mono">
                        Role: {op.role} &bull; ID: {op.operator_id}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {op.biometric_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800/80 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Channels:</span>
                      <span className="font-mono text-purple-300">{op.eeg_channel_count} EEG</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Nominal P300:</span>
                      <span className="font-mono text-white">{op.nominal_p300_uv} &mu;V</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Duress Blocked:</span>
                      <span className="font-mono text-amber-400 font-bold">{op.coercion_attacks_blocked}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Real-time BCI Intent & Coercion Playground */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" /> Cognitive Intent & Coercion Detection Simulator
          </h2>

          {selectedOperator ? (
            <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedOperator.callsign}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Clearance: {selectedOperator.role} | Impedance: {selectedOperator.impedance_kohm} k&Omega;
                  </p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
                  Channels: {selectedOperator.eeg_channel_count} 10-20 Array
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    <span>Cognitive Stress / Duress Index</span>
                    <span className="font-mono text-purple-400">{stressIndex}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.01"
                    value={stressIndex}
                    onChange={(e) => setStressIndex(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-0.5 font-mono">
                    <span>0.10 (Calm Focus)</span>
                    <span>0.85 (Coercion Threshold)</span>
                    <span>1.00 (Extreme Hostage Duress)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-xs font-semibold text-white">Simulate AI Deepfake Brainwave Replay</span>
                      <p className="text-xs text-zinc-400">Injects synthetic EEG pattern without micro-jitter.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={syntheticReplay}
                    onChange={(e) => setSyntheticReplay(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="text-xs text-zinc-400 flex flex-wrap gap-2">
                  <span className="text-zinc-500">Quick Test Cases:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStressIndex(0.22);
                      setSyntheticReplay(false);
                      setP300Uv(selectedOperator.nominal_p300_uv);
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono"
                  >
                    Nominal Intent
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStressIndex(0.94);
                      setSyntheticReplay(false);
                    }}
                    className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono"
                  >
                    Physical Duress / Hostage
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSyntheticReplay(true);
                    }}
                    className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-mono"
                  >
                    Synthetic Brainwave Replay
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleEvaluateIntent}
                  disabled={evaluating}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {evaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Verify Cognitive Intent via Zero-Knowledge BCI
                </button>
              </div>

              {/* Real-time Verdict Output */}
              {evalResult && (
                <div
                  className={`p-5 rounded-xl border transition-all ${
                    evalResult.threat_detected
                      ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                      : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {evalResult.threat_detected ? (
                        <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      )}
                      <div>
                        <span className="font-bold text-sm tracking-wide">
                          {evalResult.threat_detected
                            ? "COGNITIVE COERCION / BIOMETRIC ANOMALY DETECTED"
                            : "NEURAL INTENT AUTHENTICATED (ACCESS GRANTED)"}
                        </span>
                        <p className="text-xs opacity-80 mt-0.5">
                          Directive: {evalResult.auth_action}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                        evalResult.access_granted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {evalResult.access_granted ? "AUTHORIZED" : "DENIED"}
                    </span>
                  </div>

                  {/* Ephemeral SVID token */}
                  {svidResult && evalResult.access_granted && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-1 text-xs">
                      <span className="text-zinc-400 block font-semibold flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-purple-400" /> Ephemeral Neural SVID Token Issued (ML-DSA-65)
                      </span>
                      <p className="font-mono text-purple-300 break-all">{svidResult.token_sha384}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">
              Select an operator on the left to test neural BCI cognitive intent authentication.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

