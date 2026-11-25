"use client";

import React, { useState, useEffect } from "react";
import { Zap, Activity, RefreshCw, Lock, AlertTriangle, Shield, Flame } from "lucide-react";

interface ICBArray {
  array_id: string;
  name: string;
  icb_depth_km: number;
  pressure_gpa: number;
  temperature_k: number;
  crystallization_rate_mm_yr: number;
  latent_heat_capacity_kj_per_kg: number;
  crystal_phase: string;
  rated_capacity_gw: number;
  status: string;
}

interface ICBTelemetry {
  array_id: string;
  status: string;
  harvested_power_gw: number;
  latent_heat_flux_mw: number;
  icb_depth_km: number;
  pressure_gpa: number;
  temperature_k: number;
  crystallization_rate_mm_yr: number;
  compositional_buoyancy_ms2: number;
  thermo_acoustic_efficiency_pct: number;
  grid_stability_pct: number;
  dispatch_duration_s: number;
  crystal_phase: string;
  timestamp: number;
}

export function ICBSolidificationStudio() {
  const [arrays, setArrays] = useState<ICBArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>("");
  const [crystallizationRate, setCrystallizationRate] = useState<number>(1.5);
  const [efficiency, setEfficiency] = useState<number>(0.95);
  const [duration, setDuration] = useState<number>(60.0);
  const [telemetry, setTelemetry] = useState<ICBTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArrays = async () => {
    try {
      const res = await fetch("/api/icb-dendritic-solidification-supergrid/arrays");
      if (!res.ok) throw new Error("Failed to fetch ICB dendritic solidus arrays");
      const data = await res.json();
      setArrays(data.arrays || []);
      if (data.arrays?.length > 0 && !selectedArray) {
        setSelectedArray(data.arrays[0].array_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching arrays");
    }
  };

  useEffect(() => {
    fetchArrays();
  }, []);

  const handleHarvestLatentHeat = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/icb-dendritic-solidification-supergrid/harvest-latent-heat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          array_id: selectedArray,
          crystallization_rate_override_mm_yr: crystallizationRate,
          thermo_acoustic_efficiency: efficiency,
          dispatch_duration_s: duration,
        }),
      });
      if (!res.ok) throw new Error("Failed to harvest ICB dendritic latent heat");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error harvesting ICB latent heat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-500" />
            Inner-Core Boundary (ICB) Dendritic Solidification Latent-Heat Supergrid Studio
          </h2>
          <p className="text-sm text-zinc-400">
            Option B Wave 56: Multi-GW baseload power dispatch from Earth&apos;s Inner-Core Boundary (5,150 km depth, 330 GPa, 5,750 K) latent heat of crystallization.
          </p>
        </div>
        <button
          onClick={fetchArrays}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md border border-zinc-700 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Arrays
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-sm text-red-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-1 bg-zinc-900/50 p-5 rounded-xl border border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono">
            ICB Collector Configuration
          </h3>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Select ICB Solidus Array</label>
            <select
              value={selectedArray}
              onChange={(e) => setSelectedArray(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
            >
              {arrays.map((a) => (
                <option key={a.array_id} value={a.array_id}>
                  {a.array_id} ({a.rated_capacity_gw} GW rated)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">hcp epsilon-Fe Crystallization Rate (mm/yr)</label>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="5.0"
              value={crystallizationRate}
              onChange={(e) => setCrystallizationRate(parseFloat(e.target.value) || 1.5)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Thermo-Acoustic Efficiency: {(efficiency * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.01"
              value={efficiency}
              onChange={(e) => setEfficiency(parseFloat(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Dispatch Duration (seconds)</label>
            <input
              type="number"
              min="1"
              max="3600"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value) || 60.0)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <button
            onClick={handleHarvestLatentHeat}
            disabled={loading || !selectedArray}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Dispatch ICB Baseload Power
          </button>
        </div>

        <div className="space-y-4 md:col-span-2 bg-zinc-900/50 p-5 rounded-xl border border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono mb-3">
              Latent Heat & Buoyancy Dispatch Telemetry
            </h3>

            {telemetry ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Status</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                      <Lock className="h-3 w-3" />
                      {telemetry.status}
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Harvested Power</span>
                    <span className="text-xs font-bold text-rose-400 font-mono mt-0.5 block">
                      {telemetry.harvested_power_gw.toFixed(2)} GW
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Latent Heat Flux</span>
                    <span className="text-xs font-bold text-amber-300 font-mono mt-0.5 block">
                      {telemetry.latent_heat_flux_mw.toFixed(1)} MW
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Depth / Pressure</span>
                    <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                      {telemetry.icb_depth_km.toFixed(0)} km / {telemetry.pressure_gpa.toFixed(0)} GPa
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Grid Stability</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">
                      {telemetry.grid_stability_pct.toFixed(2)}%
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Crystal Phase</span>
                    <span className="text-xs font-bold text-rose-300 font-mono mt-0.5 block">
                      {telemetry.crystal_phase}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-800/40 rounded border border-zinc-700/40 text-xs font-mono text-zinc-300 space-y-1">
                  <div>• Array ID: {telemetry.array_id}</div>
                  <div>• Crystallization Rate: {telemetry.crystallization_rate_mm_yr} mm/yr</div>
                  <div>• Compositional Buoyancy: {telemetry.compositional_buoyancy_ms2.toFixed(4)} m/s²</div>
                  <div>• Core Temperature: {telemetry.temperature_k} K</div>
                </div>
              </div>
            ) : (
              <div className="h-48 border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-500 text-xs font-mono">
                <Activity className="h-8 w-8 mb-2 opacity-30 text-rose-500" />
                Select an ICB solidus array and execute latent heat baseload dispatch.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Shield className="h-3 w-3" />
              ICB Dendritic Solidification Supergrid Operational
            </span>
            <span>Centesimal Sovereign Era • v9.6.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ICBSolidificationStudio;
