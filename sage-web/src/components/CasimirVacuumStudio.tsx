"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  Zap,
  RefreshCw,
  Terminal,
  Activity,
  Sliders,
  ShieldCheck,
  Eye,
  Waves,
  Atom,
} from "lucide-react";

interface ResonatorNode {
  resonator_id: string;
  facility_name: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  squid_junction_count: number;
  microwave_cavity_freq_ghz: number;
  boundary_modulation_velocity_c: number;
  photon_pair_flux_per_second: number;
  squeezing_factor_db: number;
  cryo_temperature_mk: number;
  status: string;
}

interface FluxHarvestResult {
  result_id: string;
  resonator_id: string;
  pump_frequency_ghz: number;
  duration_microseconds: number;
  correlated_photon_pairs_emitted: number;
  two_mode_squeezing_db: number;
  vacuum_zero_point_energy_harvested_uj: number;
  quantum_state_fidelity: number;
  status: string;
  timestamp: string;
}

export function CasimirVacuumStudio() {
  const [resonators, setResonators] = useState<ResonatorNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [harvesting, setHarvesting] = useState(false);
  const [selectedResonator, setSelectedResonator] = useState("CASIMIR-CAVITY-DELFT-01");
  const [pumpPower, setPumpPower] = useState(50.0);
  const [durationUs, setDurationUs] = useState(100.0);
  const [lastResult, setLastResult] = useState<FluxHarvestResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchResonators = async () => {
    try {
      const res = await fetch("/api/casimir-vacuum/resonators");
      if (res.ok) {
        const data = await res.json();
        setResonators(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResonators();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Dynamic Casimir Vacuum Zero-Point Harvester online.",
      "[" + new Date().toLocaleTimeString() + "] SQUID coplanar waveguide resonators cooled to T &lt; 15 mK.",
      "[" + new Date().toLocaleTimeString() + "] Relativistic boundary condition modulation armed at v &approx; 0.28c.",
    ]);
  }, []);

  const handleHarvest = async () => {
    setHarvesting(true);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Pumping SQUID junction array at 2&omega;₀ on " + selectedResonator + "...",
      ...prev,
    ]);

    try {
      const res = await fetch("/api/casimir-vacuum/harvest-flux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resonator_id: selectedResonator,
          pump_power_mw: pumpPower,
          pulse_duration_us: durationUs,
        }),
      });

      if (res.ok) {
        const data: FluxHarvestResult = await res.json();
        setLastResult(data);
        setLogs((prev) => [
          "[" + new Date().toLocaleTimeString() + "] Vacuum pair creation verified! " + data.correlated_photon_pairs_emitted.toLocaleString() + " pairs emitted (" + data.two_mode_squeezing_db + " dB squeezing)",
          "[" + new Date().toLocaleTimeString() + "] Fidelity: " + data.quantum_state_fidelity + "% (" + data.status + ")",
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] Error discharging Casimir parametric flux pump.",
        ...prev,
      ]);
    } finally {
      setHarvesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-blue-950/30 to-indigo-950/60 border border-cyan-800/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400">
              <Waves className="w-8 h-8 animate-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Dynamic Casimir Effect Vacuum Zero-Point Field Harvester
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Capability 84 &bull; Wave 21
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Relativistic boundary condition modulation (v &rarr; c) with superconducting SQUID arrays converting ground-state vacuum fluctuations into real, non-thermal correlated photon pairs.
              </p>
            </div>
          </div>
          <button
            onClick={fetchResonators}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-900/40 hover:bg-cyan-800/50 border border-cyan-700/50 text-cyan-200 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Sync Resonators
          </button>
        </div>
      </div>

      {/* Resonators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resonators.map((r) => (
          <div
            key={r.resonator_id}
            onClick={() => setSelectedResonator(r.resonator_id)}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              selectedResonator === r.resonator_id
                ? "bg-cyan-950/70 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg"
                : "bg-slate-900/40 border-slate-800/80 hover:border-cyan-700/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">{r.facility_name}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{r.resonator_id}</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                SQUID ACTIVE
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Boundary Velocity</span>
                <span className="font-mono text-cyan-300 font-bold">{r.boundary_modulation_velocity_c} c</span>
              </div>
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Squeezing</span>
                <span className="font-mono text-blue-300 font-bold">{r.squeezing_factor_db} dB</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Parametric Fast-Flux Pump Control</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Fast-Flux Pump Microwave Power</span>
                <span className="font-mono text-cyan-300 font-bold">{pumpPower} mW</span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={pumpPower}
                onChange={(e) => setPumpPower(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Flux Pump Pulse Duration</span>
                <span className="font-mono text-cyan-300 font-bold">{durationUs} &mu;s</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={durationUs}
                onChange={(e) => setDurationUs(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              onClick={handleHarvest}
              disabled={harvesting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2"
            >
              <Zap className={`w-4 h-4 ${harvesting ? "animate-spin" : ""}`} />
              {harvesting ? "Exciting Quantum Vacuum..." : "Discharge Relativistic Flux Pump"}
            </button>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Eye className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Vacuum Photon Pair Telemetry</h3>
          </div>

          {lastResult ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">{lastResult.result_id}</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {lastResult.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Photon Pairs Emitted</span>
                  <span className="text-lg font-mono font-bold text-cyan-400">
                    {lastResult.correlated_photon_pairs_emitted.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Two-Mode Squeezing</span>
                  <span className="text-xl font-mono font-bold text-blue-400">
                    {lastResult.two_mode_squeezing_db} dB
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Pump Frequency (2&omega;₀)</span>
                  <span className="text-sm font-mono font-bold text-indigo-300">
                    {lastResult.pump_frequency_ghz} GHz
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Quantum Fidelity</span>
                  <span className="text-sm font-mono font-bold text-emerald-300">
                    {lastResult.quantum_state_fidelity}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero-Point Energy Yield: <strong>{lastResult.vacuum_zero_point_energy_harvested_uj.toExponential(3)} &mu;J (Ground State Excitations)</strong></span>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-sm">
              <Atom className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
              <span>No active vacuum flux discharge recorded.</span>
              <span className="text-xs text-slate-600 mt-1">Pump SQUID resonator above to extract correlated photon pairs.</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Log */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800/50 pb-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>DYNAMIC_CASIMIR_VACUUM_PHOTON_STREAM</span>
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
