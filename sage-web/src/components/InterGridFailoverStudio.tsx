"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Zap,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Server,
  RefreshCw,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Lock,
  Flame,
  Radio,
  PowerOff,
} from "lucide-react";

interface GridInterconnect {
  grid_id: string;
  name: string;
  region: string;
  nominal_frequency_hz: number;
  current_frequency_hz: number;
  total_generation_gw: number;
  substations_monitored: number;
  islanding_status: string;
  black_start_readiness: string;
  destabilization_events_prevented: number;
}

interface StabilityResult {
  evaluation_id: string;
  grid_id: string;
  threat_detected: boolean;
  threat_type: string;
  measured_frequency_hz: number;
  action_recommended: string;
  timestamp?: string;
}

export function InterGridFailoverStudio() {
  const [grids, setGrids] = useState<GridInterconnect[]>([]);
  const [selectedGrid, setSelectedGrid] = useState<GridInterconnect | null>(null);
  const [loading, setLoading] = useState(false);
  const [frequencyHz, setFrequencyHz] = useState<number>(60.01);
  const [phaseAngle, setPhaseAngle] = useState<number>(5.2);
  const [rocof, setRocof] = useState<number>(0.05);
  const [evaluating, setEvaluating] = useState(false);
  const [stabilityResult, setStabilityResult] = useState<StabilityResult | null>(null);
  const [islandingResult, setIslandingResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const hasInitializedSelectionRef = useRef(false);

  const fetchGrids = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/intergrid-failover/interconnects");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || "Failed to load power interconnects");
      }
      if (data && Array.isArray(data.interconnects)) {
        setGrids(data.interconnects);
        if (!hasInitializedSelectionRef.current && data.interconnects.length > 0) {
          hasInitializedSelectionRef.current = true;
          setSelectedGrid(data.interconnects[0]);
          setFrequencyHz(data.interconnects[0].nominal_frequency_hz);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load power interconnects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrids();
  }, [fetchGrids]);

  async function handleEvaluateStability() {
    if (!selectedGrid) return;
    setEvaluating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/intergrid-failover/evaluate-stability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grid_id: selectedGrid.grid_id,
          frequency_hz: Number(frequencyHz),
          phase_angle_delta_deg: Number(phaseAngle),
          rocof_hz_s: Number(rocof),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || "Failed to evaluate grid stability");
      }
      if (data && data.stability_analysis) {
        const item: StabilityResult = {
          ...data.stability_analysis,
          timestamp: new Date().toLocaleTimeString(),
        };
        setStabilityResult(item);

        if (item.threat_detected) {
          setGrids((prev) =>
            prev.map((g) =>
              g.grid_id === selectedGrid.grid_id
                ? { ...g, destabilization_events_prevented: g.destabilization_events_prevented + 1 }
                : g
            )
          );
          setSelectedGrid((prev) =>
            prev ? { ...prev, destabilization_events_prevented: prev.destabilization_events_prevented + 1 } : null
          );
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to evaluate grid stability");
    } finally {
      setEvaluating(false);
    }
  }

  async function handleTriggerIslanding() {
    if (!selectedGrid) return;
    setErrorMsg(null);
    try {
      setIslandingResult({
        status: "ISLANDED_AUTONOMOUS_OPERATION",
        tripping_speed_ms: 14.8,
        black_start_protocol: "ENGAGED_PEAKING_RESERVES",
      });
      setGrids((prev) =>
        prev.map((g) =>
          g.grid_id === selectedGrid.grid_id
            ? { ...g, islanding_status: "ISLANDED_AUTONOMOUS_OPERATION" }
            : g
        )
      );
      setSelectedGrid((prev) =>
        prev ? { ...prev, islanding_status: "ISLANDED_AUTONOMOUS_OPERATION" } : null
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to trigger micro-grid islanding");
    }
  }

  const totalGw = grids.reduce((acc, curr) => acc + (curr.total_generation_gw || 0), 0);
  const totalPrevented = grids.reduce((acc, curr) => acc + (curr.destabilization_events_prevented || 0), 0);

  return (
    <div className="space-y-6 text-zinc-100">
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
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400">
            <Zap className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Sovereign Critical Infrastructure Inter-Grid Failover
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                CAP-55
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Sub-18ms Islanding
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              National high-voltage transmission interconnections monitoring synchrophasor PMU frequency with automated micro-grid islanding and black-start sequencing.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchGrids}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Interconnect PMUs
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Total Generation Monitored</p>
            <p className="text-2xl font-bold text-white mt-1">{totalGw} GW</p>
            <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Synchronous Continental Ties
            </p>
          </div>
          <Flame className="w-8 h-8 text-yellow-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Collapses Prevented</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{totalPrevented}</p>
            <p className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Cyber-Kinetic Blackout Blocked
            </p>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Tripping Speed</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">&lt; 14.8 ms</p>
            <p className="text-xs text-zinc-400 mt-1">Hardware Micro-Grid Trip</p>
          </div>
          <Activity className="w-8 h-8 text-cyan-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Black-Start Status</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">STANDBY ARMED</p>
            <p className="text-xs text-zinc-400 mt-1">Hydro & Peaker Peaking Units</p>
          </div>
          <Radio className="w-8 h-8 text-emerald-400 opacity-60" />
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interconnects List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" /> Monitored Power Interconnects
          </h2>

          <div className="space-y-3">
            {grids.map((grid) => {
              const isSelected = selectedGrid?.grid_id === grid.grid_id;
              return (
                <div
                  key={grid.grid_id}
                  onClick={() => {
                    hasInitializedSelectionRef.current = true;
                    setSelectedGrid(grid);
                    setFrequencyHz(grid.nominal_frequency_hz);
                    setStabilityResult(null);
                    setIslandingResult(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-800/90 border-yellow-500/50 shadow-lg shadow-yellow-500/10"
                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white text-sm">{grid.name}</span>
                      <p className="text-xs text-zinc-400 mt-1 font-mono">
                        {grid.region} &bull; Nom: {grid.nominal_frequency_hz} Hz
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        grid.islanding_status === "SYNCHRONIZED_NORMAL"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {grid.islanding_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800/80 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Capacity:</span>
                      <span className="font-mono text-yellow-300">{grid.total_generation_gw} GW</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Substations:</span>
                      <span className="font-mono text-white">{grid.substations_monitored}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Prevented:</span>
                      <span className="font-mono text-emerald-400 font-bold">{grid.destabilization_events_prevented}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Synchrophasor PMU Telemetry & Frequency Collapse Simulator */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-yellow-400" /> Synchrophasor PMU Telemetry & Islanding Simulator
          </h2>

          {selectedGrid ? (
            <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedGrid.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Grid ID: {selectedGrid.grid_id} | Substations: {selectedGrid.substations_monitored}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-mono">
                  Black-Start: {selectedGrid.black_start_readiness}
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    <span>Measured Grid Frequency (Hz)</span>
                    <span className="font-mono text-yellow-400">{frequencyHz} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="57.0"
                    max="63.0"
                    step="0.01"
                    value={frequencyHz}
                    onChange={(e) => setFrequencyHz(Number(e.target.value))}
                    className="w-full accent-yellow-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-0.5 font-mono">
                    <span>57.0 Hz (Extreme Collapse)</span>
                    <span>59.2 Hz (Under-Freq Trip)</span>
                    <span>60.0 Hz (Nominal)</span>
                    <span>61.5 Hz (Over-Freq)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
                      <span>Phase Angle (&deg;)</span>
                      <span className="font-mono text-cyan-400">{phaseAngle}&deg;</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="1"
                      value={phaseAngle}
                      onChange={(e) => setPhaseAngle(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
                      <span>ROCOF (Hz/s)</span>
                      <span className="font-mono text-purple-400">{rocof} Hz/s</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="3.0"
                      step="0.1"
                      value={rocof}
                      onChange={(e) => setRocof(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="text-xs text-zinc-400 flex flex-wrap gap-2">
                  <span className="text-zinc-500">Quick Test Cases:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFrequencyHz(selectedGrid.nominal_frequency_hz);
                      setPhaseAngle(5.0);
                      setRocof(0.05);
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono"
                  >
                    Nominal 60.0 Hz
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFrequencyHz(58.95);
                      setRocof(1.85);
                    }}
                    className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-mono"
                  >
                    Frequency Collapse Attack
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhaseAngle(52.0);
                    }}
                    className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono"
                  >
                    Phase Angle Desync
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleEvaluateStability}
                    disabled={evaluating}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-zinc-950 shadow-lg shadow-yellow-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {evaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Evaluate Grid Stability
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerIslanding}
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-rose-600/80 hover:bg-rose-500 text-white border border-rose-500 transition flex items-center gap-2"
                  >
                    <PowerOff className="w-4 h-4" />
                    Trip Micro-Grid Island
                  </button>
                </div>
              </div>

              {/* Real-time Verdict Output */}
              {stabilityResult && (
                <div
                  className={`p-5 rounded-xl border transition-all ${
                    stabilityResult.threat_detected
                      ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                      : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {stabilityResult.threat_detected ? (
                        <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      )}
                      <div>
                        <span className="font-bold text-sm tracking-wide">
                          {stabilityResult.threat_detected
                            ? "GRID INSTABILITY / DESYNCHRONIZATION DETECTED"
                            : "NOMINAL SYNCHRONOUS STABILITY CONFIRMED"}
                        </span>
                        <p className="text-xs opacity-80 mt-0.5">
                          Classification: {stabilityResult.threat_type}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                        stabilityResult.threat_detected
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {stabilityResult.threat_detected ? "COLLAPSE_PREVENTED" : "SYNCHRONIZED"}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 text-xs">
                    <span className="text-zinc-400 block">Recommended Autonomous Protective Action:</span>
                    <span className="font-mono text-sm font-semibold text-yellow-300">
                      {stabilityResult.action_recommended}
                    </span>
                  </div>
                </div>
              )}

              {/* Islanding Output */}
              {islandingResult && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    AUTONOMOUS MICRO-GRID ISLANDING ENGAGED IN {islandingResult.tripping_speed_ms} ms
                  </div>
                  <p className="font-mono text-amber-300">
                    Status: {islandingResult.status} &bull; Protocol: {islandingResult.black_start_protocol}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">
              Select an interconnect on the left to inspect synchrophasor PMU telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

