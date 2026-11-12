"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Zap,
  RefreshCw,
  Terminal,
  Activity,
  Compass,
  Radio,
  Eye,
  AlertTriangle,
  Globe2,
} from "lucide-react";

interface HarvesterNode {
  harvester_id: string;
  facility_name: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  inflaton_coupling_constant: number;
  equation_of_state_w: number;
  negative_pressure_gpa: number;
  metric_energy_harvest_rate_mw: number;
  field_coherence_pct: number;
  status: string;
}

interface DarkEnergyEvent {
  event_id: string;
  harvester_id: string;
  target_metric_region: string;
  inflaton_scalar_field_phi: number;
  potential_energy_density_gev4: number;
  equation_of_state_w: number;
  negative_pressure_clamped_gpa: number;
  metric_energy_yield_mw: number;
  curvature_stability_index: number;
  status: string;
  timestamp: string;
}

export function DarkEnergyStudio() {
  const [harvesters, setHarvesters] = useState<HarvesterNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [stabilizing, setStabilizing] = useState(false);
  const [selectedHarvester, setSelectedHarvester] = useState("DARK-ENERGY-ATACAMA-01");
  const [targetRegion, setTargetRegion] = useState("LOCAL_SOLAR_WARP_SECTOR_4");
  const [couplingFactor, setCouplingFactor] = useState(1.0);
  const [lastEvent, setLastEvent] = useState<DarkEnergyEvent | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchHarvesters = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/dark-energy/harvesters");
      if (!res.ok) {
        throw new Error(`Dark energy harvesters fetch returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setHarvesters(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load dark energy harvesters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvesters();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Dark Energy Quintessence Inflaton Harvester online.",
      "[" + new Date().toLocaleTimeString() + "] Inflaton scalar field potential locked at w &lt; -1.0.",
      "[" + new Date().toLocaleTimeString() + "] Negative pressure metric stabilizer armed across cosmic void baselines.",
    ]);
  }, []);

  const handleStabilize = async () => {
    setStabilizing(true);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Coupling to cosmological quintessence scalar field at " + selectedHarvester + "...",
      ...prev,
    ]);

    try {
      const res = await fetch("/api/dark-energy/stabilize-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          harvester_id: selectedHarvester,
          target_metric_region: targetRegion,
          coupling_factor: couplingFactor,
        }),
      });

      if (res.ok) {
        const data: DarkEnergyEvent = await res.json();
        setLastEvent(data);
        setLogs((prev) => [
          "[" + new Date().toLocaleTimeString() + "] Inflaton locked: w = " + data.equation_of_state_w + " | Yield: " + data.metric_energy_yield_mw.toFixed(1) + " MW",
          "[" + new Date().toLocaleTimeString() + "] Metric stability index: " + data.curvature_stability_index + "% (" + data.status + ")",
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] Error stabilizing dark energy field.",
        ...prev,
      ]);
    } finally {
      setStabilizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/30 to-fuchsia-950/60 border border-purple-800/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
              <Sparkles className="w-8 h-8 animate-pulse text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Dark Energy Quintessence & Inflaton Metric Harvester
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Capability 83 &bull; Wave 21
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Cosmic quintessence scalar field stabilization tapping negative pressure metric energy (w &approx; -1.0) to counteract localized spacetime metric tears and harvest cosmic expansion flux.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchHarvesters}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 border border-purple-700/50 text-purple-200 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Sync Harvesters
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

      {/* Harvesters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {harvesters.map((h) => (
          <div
            key={h.harvester_id}
            onClick={() => setSelectedHarvester(h.harvester_id)}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              selectedHarvester === h.harvester_id
                ? "bg-purple-950/70 border-purple-500 ring-2 ring-purple-500/30 shadow-lg"
                : "bg-slate-900/40 border-slate-800/80 hover:border-purple-700/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">{h.facility_name}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{h.harvester_id}</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                LOCKED
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Equation of State (w)</span>
                <span className="font-mono text-purple-300 font-bold">{h.equation_of_state_w}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Harvest Yield</span>
                <span className="font-mono text-fuchsia-300 font-bold">{h.metric_energy_harvest_rate_mw} MW</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel & Telemetry Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Compass className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Inflaton Metric Coupling Controls</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Geodesic Metric Sector</label>
              <select
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="LOCAL_SOLAR_WARP_SECTOR_4">LOCAL_SOLAR_WARP_SECTOR_4 (Near-Earth Inflaton Interface)</option>
                <option value="ATACAMA_DEEP_MANTLE_WELL">ATACAMA_DEEP_MANTLE_WELL (Lithospheric Geoid Null-Zone)</option>
                <option value="LAGRANGE_L2_VOID_INTERCEPT">LAGRANGE_L2_VOID_INTERCEPT (Deep Space Clean Vacuum)</option>
                <option value="COSMIC_EXPANSION_METRIC_PORTAL">COSMIC_EXPANSION_METRIC_PORTAL (Cosmological Horizon Interface)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Inflaton Coupling Amplification Factor</span>
                <span className="font-mono text-purple-300 font-bold">{couplingFactor}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={couplingFactor}
                onChange={(e) => setCouplingFactor(parseFloat(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleStabilize}
              disabled={stabilizing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
            >
              <Zap className={`w-4 h-4 ${stabilizing ? "animate-spin" : ""}`} />
              {stabilizing ? "Locking Inflaton Field..." : "Stabilize Inflaton & Harvest Metric Flux"}
            </button>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Eye className="w-5 h-5 text-fuchsia-400" />
            <h3 className="font-semibold text-white">Quintessence Negative Pressure Telemetry</h3>
          </div>

          {lastEvent ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">{lastEvent.event_id}</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {lastEvent.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Equation of State (w)</span>
                  <span className="text-xl font-mono font-bold text-purple-400">
                    {lastEvent.equation_of_state_w}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Negative Pressure</span>
                  <span className="text-xl font-mono font-bold text-fuchsia-400">
                    {lastEvent.negative_pressure_clamped_gpa} GPa
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Metric Energy Yield</span>
                  <span className="text-sm font-mono font-bold text-indigo-300">
                    {lastEvent.metric_energy_yield_mw.toFixed(1)} MW
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Stability Index</span>
                  <span className="text-sm font-mono font-bold text-emerald-300">
                    {lastEvent.curvature_stability_index}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-200 text-xs font-mono">
                Inflaton Scalar Amplitude (&phi;): {lastEvent.inflaton_scalar_field_phi.toExponential(3)} M_pl
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-sm">
              <Sparkles className="w-8 h-8 mb-2 opacity-40 text-purple-400" />
              <span>No active dark energy harvest recorded.</span>
              <span className="text-xs text-slate-600 mt-1">Engage coupling controls above to stabilize inflaton field.</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Log */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800/50 pb-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>DARK_ENERGY_QUINTESSENCE_STREAM</span>
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

