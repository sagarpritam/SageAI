"use client";

import React, { useState, useEffect } from "react";
import {
  Atom,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Lock,
  Globe,
  Radio,
  Share2,
  Terminal,
} from "lucide-react";

interface QKDLink {
  link_id: string;
  name: string;
  satellite_id: string;
  ground_telescope: string;
  protocol: string;
  entangled_photon_rate_hz: number;
  current_qber_pct: number;
  max_tolerable_qber_pct: number;
  distance_km: number;
  status: string;
  eavesdropping_aborts: number;
}

interface QBEREvaluation {
  evaluation_id: string;
  link_id: string;
  threat_detected: boolean;
  threat_type: string;
  measured_qber_pct: number;
  tolerable_qber_limit_pct: number;
  photon_coincidence_window_ns: number;
  action_recommended: string;
}

interface SwapResult {
  swap_id: string;
  link_id: string;
  bell_state_measured: string;
  extended_distance_km: number;
  swapping_fidelity: number;
  unconditional_key_bits_generated: number;
}

export function SpaceGroundQKDStudio() {
  const [links, setLinks] = useState<QKDLink[]>([]);
  const [selectedLink, setSelectedLink] = useState<QKDLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [measuredQber, setMeasuredQber] = useState<number>(2.8);
  const [coincidenceWindow, setCoincidenceWindow] = useState<number>(1.2);
  const [evaluating, setEvaluating] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [evaluation, setEvaluation] = useState<QBEREvaluation | null>(null);
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    setLoading(true);
    try {
      const res = await fetch("/api/space-ground-qkd/links");
      const data = await res.json();
      if (data.links) {
        setLinks(data.links);
        if (!selectedLink && data.links.length > 0) {
          setSelectedLink(data.links[0]);
          setMeasuredQber(data.links[0].current_qber_pct);
        }
      }
    } catch (err) {
      console.error("Failed to fetch QKD links", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEvaluateQBER() {
    if (!selectedLink) return;
    setEvaluating(true);
    setEvaluation(null);
    try {
      const res = await fetch("/api/space-ground-qkd/evaluate-qber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link_id: selectedLink.link_id,
          measured_qber_pct: measuredQber,
          photon_coincidence_window_ns: coincidenceWindow,
        }),
      });
      const data = await res.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        if (data.evaluation.threat_detected) {
          setLinks((prev) =>
            prev.map((l) =>
              l.link_id === selectedLink.link_id
                ? {
                    ...l,
                    status: "ABORTED_EAVESDROPPER_ISOLATED",
                    eavesdropping_aborts: l.eavesdropping_aborts + 1,
                  }
                : l
            )
          );
        }
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] QBER EVAL: ${selectedLink.link_id} -> ${measuredQber}% (Threat: ${data.evaluation.threat_detected ? "YES - BEAM SPLITTING TAP" : "NO - NOMINAL"})`,
          ...prev.slice(0, 15),
        ]);
      }
    } catch (err) {
      console.error("QBER evaluation failed", err);
    } finally {
      setEvaluating(false);
    }
  }

  async function handleExecuteSwap() {
    if (!selectedLink) return;
    setSwapping(true);
    try {
      const res = await fetch("/api/space-ground-qkd/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link_id: selectedLink.link_id }),
      });
      const data = await res.json();
      if (data.swap) {
        setSwapResult(data.swap);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] ENTANGLEMENT SWAP: ${selectedLink.link_id} -> Extended to ${data.swap.extended_distance_km} km (Fidelity: ${data.swap.swapping_fidelity})`,
          ...prev.slice(0, 15),
        ]);
      }
    } catch (err) {
      console.error("Swap failed", err);
    } finally {
      setSwapping(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-900/20 to-slate-900/50 border border-cyan-500/30 backdrop-blur-md shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-400">
            <Atom className="w-8 h-8 animate-spin text-cyan-300" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Space-Ground Quantum Key Distribution (QKD) Mesh
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                CAP-57 • v4.5.0
              </span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              BBM92 Entangled Photon Channels, Orbital Repeater BSM Swapping & Adversary Beam-Splitting Interception
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={fetchLinks}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Uplinks</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-slate-400">Quantum Uplinks</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{links.length}</span>
            <span className="text-xs text-slate-400">LEO/GEO</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-cyan-400">Entanglement Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-300">12.5 MHz</span>
            <span className="text-xs text-cyan-400/80">Photon Pairs</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-emerald-400">Theoretical Bound</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-300">11.0%</span>
            <span className="text-xs text-emerald-400/80">Max QBER</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-violet-400">Unconditional OTP</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-violet-300">485 Mbit</span>
            <span className="text-xs text-violet-400/80">Generated</span>
          </div>
        </div>
      </div>

      {/* Main Studio Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Link List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Entangled Photon Uplinks
          </h3>
          <div className="space-y-3">
            {links.map((link) => {
              const isSelected = selectedLink?.link_id === link.link_id;
              const isLocked = link.status === "ENTANGLEMENT_LOCKED";

              return (
                <div
                  key={link.link_id}
                  onClick={() => {
                    setSelectedLink(link);
                    setMeasuredQber(link.current_qber_pct);
                    setEvaluation(null);
                    setSwapResult(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-950/40"
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{link.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Sat: {link.satellite_id}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isLocked
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {link.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Protocol: {link.protocol.slice(0, 10)}</span>
                    <span>Dist: {link.distance_km} km</span>
                    <span className="font-mono text-cyan-300">QBER: {link.current_qber_pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls & Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          {selectedLink ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedLink.name}
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedLink.link_id}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Ground: {selectedLink.ground_telescope} • Sat: {selectedLink.satellite_id}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Current QBER</span>
                  <span className="text-lg font-bold text-cyan-400 font-mono">
                    {measuredQber.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      Measured Quantum Bit Error Rate (QBER)
                    </span>
                    <span className="font-mono text-cyan-300">{measuredQber.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="18.0"
                    step="0.1"
                    value={measuredQber}
                    onChange={(e) => setMeasuredQber(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    QBER &gt; 11.0% triggers instant photon shutter abort to block beam-splitting eavesdropper.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      Photon Coincidence Timing Window
                    </span>
                    <span className="font-mono text-cyan-300">{coincidenceWindow} ns</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={coincidenceWindow}
                    onChange={(e) => setCoincidenceWindow(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleEvaluateQBER}
                    disabled={evaluating}
                    className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-900/30"
                  >
                    <Activity className={`w-4 h-4 ${evaluating ? "animate-spin" : ""}`} />
                    <span>{evaluating ? "Sampling Photons..." : "Evaluate QBER & Eavesdropping"}</span>
                  </button>

                  <button
                    onClick={handleExecuteSwap}
                    disabled={swapping}
                    className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-900/30"
                  >
                    <Share2 className={`w-4 h-4 ${swapping ? "animate-spin" : ""}`} />
                    <span>{swapping ? "Swapping Bell States..." : "Execute BSM Entanglement Swap"}</span>
                  </button>
                </div>
              </div>

              {/* Verdicts */}
              {evaluation && (
                <div
                  className={`p-4 rounded-xl border ${
                    evaluation.threat_detected
                      ? "bg-rose-950/20 border-rose-500/40"
                      : "bg-emerald-950/20 border-emerald-500/40"
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                      {evaluation.threat_detected ? (
                        <>
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          Adversary Photon Beam-Splitting Tap Detected!
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Unconditional Quantum Coherence Confirmed
                        </>
                      )}
                    </span>
                    <span className="text-xs font-mono text-slate-300">{evaluation.evaluation_id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400">Action:</span>{" "}
                      <span className="font-semibold text-white">{evaluation.action_recommended}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Measured QBER:</span>{" "}
                      <span className="font-mono text-cyan-300">{evaluation.measured_qber_pct}%</span>
                    </div>
                  </div>
                </div>
              )}

              {swapResult && (
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      Bell-State Entanglement Swap Complete
                    </span>
                    <span className="text-xs font-mono text-slate-400">{swapResult.swap_id}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400">Fidelity:</span>{" "}
                      <span className="text-indigo-300 font-bold">{swapResult.swapping_fidelity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Distance:</span>{" "}
                      <span className="text-indigo-300 font-bold">
                        {swapResult.extended_distance_km} km
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">OTP Key Bits:</span>{" "}
                      <span className="text-indigo-300 font-bold">
                        {swapResult.unconditional_key_bits_generated.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              Select a space-ground quantum link to inspect
            </div>
          )}

          {/* Activity Terminal */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-lg">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Quantum Photon Telemetry Log
            </h4>
            <div className="space-y-1 font-mono text-xs text-slate-300 max-h-36 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-600">No telemetry events logged.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

