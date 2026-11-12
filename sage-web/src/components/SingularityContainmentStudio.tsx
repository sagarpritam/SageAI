"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Zap,
  Activity,
  AlertTriangle,
  Sliders,
  Layers,
  CircleDot,
} from "lucide-react";

interface SingularityCell {
  cell_id: string;
  facility_name: string;
  mass_kg: number;
  schwarzschild_radius_m: number;
  hawking_temperature_kelvin: number;
  hawking_power_watts: number;
  graviton_waveguide_field_tesla: number;
  matter_injection_rate_kg_s: number;
  evaporation_margin_years: number;
  containment_status: string;
}

interface SingularityTelemetry {
  telemetry_id: string;
  cell_id: string;
  current_mass_kg: number;
  hawking_luminosity_pw: number;
  matter_feed_balance_ratio: number;
  containment_integrity_pct: number;
  gravitational_flux_leakage_pct: number;
  power_extraction_efficiency_pct: number;
  status: string;
  timestamp: string;
}

export function SingularityContainmentStudio() {
  const [cells, setCells] = useState<SingularityCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [sampling, setSampling] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [selectedCell, setSelectedCell] = useState("SINGULARITY-VAULT-GENEVA-01");
  const [deltaFeed, setDeltaFeed] = useState(0.05);
  const [lastTelemetry, setLastTelemetry] = useState<SingularityTelemetry | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchCells = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/singularity-containment/cells");
      if (!res.ok) {
        throw new Error(`Singularity cell fetch returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setCells(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load singularity containment cells");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCells();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Micro-Singularity Hawking Radiation Containment Matrix online.",
      "[" + new Date().toLocaleTimeString() + "] Quadrupole graviton waveguides active at 35.0-42.0 Tesla.",
      "[" + new Date().toLocaleTimeString() + "] Mass-evaporation equilibrium locked across all vaults.",
    ]);
  }, []);

  const handleSampleTelemetry = async () => {
    setSampling(true);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Querying graviton waveguide sensors on " + selectedCell + "...",
      ...prev,
    ]);

    try {
      const res = await fetch("/api/singularity-containment/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cell_id: selectedCell }),
      });

      if (res.ok) {
        const data: SingularityTelemetry = await res.json();
        setLastTelemetry(data);
        setLogs((prev) => [
          "[" + new Date().toLocaleTimeString() + "] Hawking power extracted: " + data.hawking_luminosity_pw + " PW (Integrity: " + data.containment_integrity_pct + "%)",
          "[" + new Date().toLocaleTimeString() + "] Feed balance ratio: " + data.matter_feed_balance_ratio + " (Status: " + data.status + ")",
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] Error reading singularity telemetry.",
        ...prev,
      ]);
    } finally {
      setSampling(false);
    }
  };

  const handleAdjustFeed = async () => {
    setAdjusting(true);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Adjusting relativistic pellet injection feed by &Delta;M = " + deltaFeed + " kg/s...",
      ...prev,
    ]);

    try {
      const res = await fetch("/api/singularity-containment/adjust-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cell_id: selectedCell, delta_rate_kg_s: deltaFeed }),
      });

      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [
          "[" + new Date().toLocaleTimeString() + "] Injection feed stabilized: " + data.new_injection_rate_kg_s + " kg/s (" + data.mass_stabilization_state + ")",
          ...prev,
        ]);
        fetchCells();
      }
    } catch {
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] Error adjusting relativistic feeder.",
        ...prev,
      ]);
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-orange-950/30 to-rose-950/60 border border-amber-800/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400">
              <Flame className="w-8 h-8 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Micro-Singularity Hawking Radiation Containment & Graviton Waveguide
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Capability 82 &bull; Wave 20
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Confinement of artificial micro-black holes (M ~ 10⁸-10¹¹ kg, r_s ~ 10⁻¹⁷ m) extracting 10-50 Petawatts Hawking radiation with zero runaway burst risk.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchCells}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-900/40 hover:bg-amber-800/50 border border-amber-700/50 text-amber-200 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Sync Cells
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs font-mono text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Cells Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cells.map((cell) => (
          <div
            key={cell.cell_id}
            onClick={() => setSelectedCell(cell.cell_id)}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              selectedCell === cell.cell_id
                ? "bg-amber-950/70 border-amber-500 ring-2 ring-amber-500/30 shadow-lg"
                : "bg-slate-900/40 border-slate-800/80 hover:border-amber-700/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">{cell.facility_name}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{cell.cell_id}</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                EQUILIBRIUM
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Hawking Output</span>
                <span className="font-mono text-amber-300 font-bold">
                  {(cell.hawking_power_watts / 1e15).toFixed(1)} PW
                </span>
              </div>
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Feed Rate</span>
                <span className="font-mono text-orange-300 font-bold">{cell.matter_injection_rate_kg_s} kg/s</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">Mass Feed & Containment Controls</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Relativistic Matter Injection Rate (&Delta;M)</span>
                <span className="font-mono text-amber-300 font-bold">{deltaFeed} kg/s</span>
              </div>
              <input
                type="range"
                min="-0.2"
                max="0.5"
                step="0.01"
                value={deltaFeed}
                onChange={(e) => setDeltaFeed(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAdjustFeed}
                disabled={adjusting}
                className="py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs transition-all shadow-lg shadow-orange-900/30 flex items-center justify-center gap-2"
              >
                <Zap className={`w-4 h-4 ${adjusting ? "animate-spin" : ""}`} />
                {adjusting ? "Compensating..." : "Adjust Pellet Feed"}
              </button>

              <button
                type="button"
                onClick={handleSampleTelemetry}
                disabled={sampling}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Activity className={`w-4 h-4 ${sampling ? "animate-spin" : ""}`} />
                {sampling ? "Polling..." : "Poll Waveguide Telemetry"}
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <CircleDot className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold text-white">Graviton Waveguide Status</h3>
          </div>

          {lastTelemetry ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">{lastTelemetry.telemetry_id}</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {lastTelemetry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Hawking Luminosity</span>
                  <span className="text-xl font-mono font-bold text-amber-400">
                    {lastTelemetry.hawking_luminosity_pw} Petawatts
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Mass Balance Ratio</span>
                  <span className="text-xl font-mono font-bold text-emerald-400">
                    {lastTelemetry.matter_feed_balance_ratio}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Containment Integrity</span>
                  <span className="text-sm font-mono font-bold text-orange-300">
                    {lastTelemetry.containment_integrity_pct}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Extraction Efficiency</span>
                  <span className="text-sm font-mono font-bold text-amber-300">
                    {lastTelemetry.power_extraction_efficiency_pct}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Waveguide Flux Leakage: <strong>{lastTelemetry.gravitational_flux_leakage_pct}% (ZERO BURST RISK)</strong></span>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-sm">
              <Flame className="w-8 h-8 mb-2 opacity-40 text-amber-400" />
              <span>No telemetry polled yet.</span>
              <span className="text-xs text-slate-600 mt-1">Poll telemetry or adjust pellet feed to inspect vault state.</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Log */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800/50 pb-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>SINGULARITY_HAWKING_WAVEGUIDE_TELEMETRY</span>
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

