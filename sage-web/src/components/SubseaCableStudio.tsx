"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Waves,
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
  Compass,
  Anchor,
} from "lucide-react";

interface SubseaCable {
  cable_id: string;
  name: string;
  route: string;
  length_km: number;
  fiber_pairs: number;
  capacity_tbps: number;
  otdr_attenuation_db_km: number;
  sop_rotation_rad_s: number;
  das_acoustic_noise_db: number;
  status: string;
  physical_taps_intercepted: number;
  redundant_fallback_route: string;
}

interface InspectionResult {
  inspection_id: string;
  cable_id: string;
  threat_detected: boolean;
  threat_type: string;
  otdr_db_loss: number;
  sop_rotation_rad_s: number;
  das_acoustic_db: number;
  recommended_action: string;
  timestamp?: string;
}

export function SubseaCableStudio() {
  const [cables, setCables] = useState<SubseaCable[]>([]);
  const [selectedCable, setSelectedCable] = useState<SubseaCable | null>(null);
  const [loading, setLoading] = useState(false);
  const [otdrLoss, setOtdrLoss] = useState<number>(0.165);
  const [sopRotation, setSopRotation] = useState<number>(4.2);
  const [acousticDb, setAcousticDb] = useState<number>(-55.0);
  const [inspecting, setInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);
  const [cableLogs, setCableLogs] = useState<InspectionResult[]>([]);

  const fetchCables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subsea-cable/cables");
      const data = await res.json();
      if (data.cables) {
        setCables(data.cables);
        if (data.cables.length > 0) {
          setSelectedCable((prev) => prev || data.cables[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCables();
  }, [fetchCables]);

  async function handleInspect() {
    if (!selectedCable) return;
    setInspecting(true);
    try {
      const res = await fetch("/api/subsea-cable/inspect-telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cable_id: selectedCable.cable_id,
          otdr_db_loss: Number(otdrLoss),
          sop_rotation_rad_s: Number(sopRotation),
          das_acoustic_db: Number(acousticDb),
        }),
      });
      const data = await res.json();
      if (data.inspection) {
        const item: InspectionResult = {
          ...data.inspection,
          timestamp: new Date().toLocaleTimeString(),
        };
        setInspectionResult(item);
        setCableLogs((prev) => [item, ...prev.slice(0, 9)]);

        if (item.threat_detected) {
          setCables((prev) =>
            prev.map((c) =>
              c.cable_id === selectedCable.cable_id
                ? { ...c, physical_taps_intercepted: c.physical_taps_intercepted + 1 }
                : c
            )
          );
          setSelectedCable((prev) =>
            prev ? { ...prev, physical_taps_intercepted: prev.physical_taps_intercepted + 1 } : null
          );
        }
      }
    } finally {
      setInspecting(false);
    }
  }

  const totalLength = cables.reduce((acc, curr) => acc + (curr.length_km || 0), 0);
  const totalTaps = cables.reduce((acc, curr) => acc + (curr.physical_taps_intercepted || 0), 0);

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <Waves className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Deep-Sea Subsea Fiber Acoustic & Optical Tap Interceptor
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                CAP-53
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                DAS & Coherent OTDR
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Transoceanic submarine fiber-optic cable acoustic hydrophone surveillance with sub-15ms optical loopback severance against hostile ROV taps.
            </p>
          </div>
        </div>

        <button
          onClick={fetchCables}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Ocean Bed Telemetry
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Subsea Cable Trunks</p>
            <p className="text-2xl font-bold text-white mt-1">{cables.length} Trunks</p>
            <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Transatlantic & Transpacific
            </p>
          </div>
          <Waves className="w-8 h-8 text-blue-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Total Route Length</p>
            <p className="text-2xl font-bold text-white mt-1">{totalLength.toLocaleString()} km</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Continuous Acoustic Monitoring
            </p>
          </div>
          <Server className="w-8 h-8 text-emerald-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Physical Taps Intercepted</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{totalTaps}</p>
            <p className="text-xs text-amber-400/80 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> ROVs & Micro-Bending
            </p>
          </div>
          <Anchor className="w-8 h-8 text-amber-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Loopback Severance Speed</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">&lt; 11.4 ms</p>
            <p className="text-xs text-zinc-400 mt-1">Autonomous Repeater Trip</p>
          </div>
          <Activity className="w-8 h-8 text-cyan-400 opacity-60" />
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Cables List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Waves className="w-4 h-4 text-blue-400" /> Monitored Submarine Optical Trunks
          </h2>

          <div className="space-y-3">
            {cables.map((cable) => {
              const isSelected = selectedCable?.cable_id === cable.cable_id;
              return (
                <div
                  key={cable.cable_id}
                  onClick={() => {
                    setSelectedCable(cable);
                    setInspectionResult(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-800/90 border-blue-500/50 shadow-lg shadow-blue-500/10"
                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white text-sm">{cable.name}</span>
                      <p className="text-xs text-zinc-400 mt-1 font-mono">
                        Route: {cable.route} &bull; {cable.length_km} km
                      </p>
                    </div>

                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {cable.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800/80 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Capacity:</span>
                      <span className="font-mono text-cyan-300">{cable.capacity_tbps} Tbps</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Attenuation:</span>
                      <span className="font-mono text-white">{cable.otdr_attenuation_db_km} dB/km</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Taps Intercepted:</span>
                      <span className="font-mono text-amber-400 font-bold">{cable.physical_taps_intercepted}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Optical Telemetry & Tap Inspection Simulator */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" /> DAS Hydrophone & OTDR Micro-Bending Tap Simulator
          </h2>

          {selectedCable ? (
            <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedCable.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Trunk ID: {selectedCable.cable_id} | Pairs: {selectedCable.fiber_pairs}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono">
                  Bypass: {selectedCable.redundant_fallback_route}
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    <span>OTDR Attenuation (dB/km)</span>
                    <span className="font-mono text-blue-400">{otdrLoss} dB/km</span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.50"
                    step="0.005"
                    value={otdrLoss}
                    onChange={(e) => setOtdrLoss(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-0.5 font-mono">
                    <span>0.15 dB/km (Nominal)</span>
                    <span>0.25 dB/km (Tap Threshold)</span>
                    <span>0.50 dB/km (Severe Tap)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    <span>Polarization Rotation Rate (&Delta;SOP)</span>
                    <span className="font-mono text-cyan-400">{sopRotation} rad/s</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="80.0"
                    step="0.5"
                    value={sopRotation}
                    onChange={(e) => setSopRotation(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-0.5 font-mono">
                    <span>5 rad/s (Nominal Tidal Currents)</span>
                    <span>50 rad/s (ROV Clamping Manipulation)</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 flex flex-wrap gap-2">
                  <span className="text-zinc-500">Quick Test Cases:</span>
                  <button
                    onClick={() => {
                      setOtdrLoss(0.165);
                      setSopRotation(4.2);
                      setAcousticDb(-55.0);
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono"
                  >
                    Nominal Ocean Bed
                  </button>
                  <button
                    onClick={() => {
                      setOtdrLoss(0.320);
                      setSopRotation(15.0);
                    }}
                    className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono"
                  >
                    Micro-Bending Optical Tap
                  </button>
                  <button
                    onClick={() => {
                      setSopRotation(65.0);
                      setAcousticDb(-22.0);
                    }}
                    className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-mono"
                  >
                    Hostile ROV Tampering
                  </button>
                </div>

                <button
                  onClick={handleInspect}
                  disabled={inspecting}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inspecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Execute OTDR & DAS Optical Tap Inspection
                </button>
              </div>

              {/* Real-time Verdict Output */}
              {inspectionResult && (
                <div
                  className={`p-5 rounded-xl border transition-all ${
                    inspectionResult.threat_detected
                      ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                      : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {inspectionResult.threat_detected ? (
                        <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      )}
                      <div>
                        <span className="font-bold text-sm tracking-wide">
                          {inspectionResult.threat_detected
                            ? "PHYSICAL SUBSEA FIBER INTERCEPTION DETECTED"
                            : "NOMINAL OPTICAL FIBER INTEGRITY CONFIRMED"}
                        </span>
                        <p className="text-xs opacity-80 mt-0.5">
                          Classification: {inspectionResult.threat_type}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                        inspectionResult.threat_detected
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {inspectionResult.threat_detected ? "TAP_INTERCEPTED" : "CLEARED"}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 text-xs">
                    <span className="text-zinc-400 block">Autonomous Loopback Directive:</span>
                    <span className="font-mono text-sm font-semibold text-cyan-300">
                      {inspectionResult.recommended_action}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">
              Select a subsea cable trunk on the left to inspect ocean bed optical telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

