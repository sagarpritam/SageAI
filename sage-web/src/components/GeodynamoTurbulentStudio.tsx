"use client";

import React, { useState, useEffect } from "react";
import { Zap, Activity, RefreshCw, Gauge, BatteryCharging, AlertTriangle, Compass } from "lucide-react";

interface GeodynamoArray {
  array_id: string;
  location: string;
  outer_core_depth_km: number;
  magnetic_reynolds_rm: number;
  rossby_number_ro: number;
  turbulent_helicity_alpha: number;
  base_induction_efficiency_pct: number;
  status: string;
}

interface GeodynamoTelemetry {
  array_id: string;
  status: string;
  harvested_power_gw: number;
  dynamo_emf_kv: number;
  magnetic_reynolds_rm: number;
  turbulent_helicity_alpha: number;
  conversion_efficiency_pct: number;
  grid_stability_pct: number;
  outer_core_depth_km: number;
  dispatch_duration_s: number;
  timestamp: number;
}

export function GeodynamoTurbulentStudio() {
  const [arrays, setArrays] = useState<GeodynamoArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>("");
  const [helicityAlpha, setHelicityAlpha] = useState<number>(0.045);
  const [efficiency, setEfficiency] = useState<number>(0.95);
  const [telemetry, setTelemetry] = useState<GeodynamoTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArrays = async () => {
    try {
      const res = await fetch("/api/geodynamo-helical-turbulent-supergrid/arrays");
      if (!res.ok) throw new Error("Failed to fetch geodynamo arrays");
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

  const handleHarvestPower = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/geodynamo-helical-turbulent-supergrid/harvest-induction-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          array_id: selectedArray,
          helicity_override_alpha: helicityAlpha,
          induction_efficiency: efficiency,
          dispatch_duration_s: 60.0,
        }),
      });
      if (!res.ok) throw new Error("Failed to harvest geodynamo power");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error harvesting geodynamo power");
    } finally {
      setLoading(false);
    }
  };

  const currentArray = arrays.find((a) => a.array_id === selectedArray);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Planetary Outer-Core Geodynamo Induction Supergrid
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-medium">
                Wave 53 Option B
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Earth liquid-iron outer core (r ~ 1,220 - 3,480 km) turbulent helical convection, Taylor columns, and multi-GW induction baseload
            </p>
          </div>
        </div>
        <button
          onClick={fetchArrays}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Arrays
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Geodynamo Induction Array
          </label>
          <select
            value={selectedArray}
            onChange={(e) => setSelectedArray(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            {arrays.map((a) => (
              <option key={a.array_id} value={a.array_id}>
                {a.array_id} ({a.location})
              </option>
            ))}
          </select>
          {currentArray && (
            <p className="text-xs text-slate-500 italic mt-1">
              Depth: {currentArray.outer_core_depth_km} km &bull; Rm: {currentArray.magnetic_reynolds_rm} &bull; Ro: {currentArray.rossby_number_ro}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Turbulent Helicity Alpha: {helicityAlpha}
          </label>
          <input
            type="range"
            min="0.01"
            max="0.08"
            step="0.005"
            value={helicityAlpha}
            onChange={(e) => setHelicityAlpha(parseFloat(e.target.value))}
            className="w-full accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.01 (Weak Helicity)</span>
            <span>0.08 (Strong Helicity)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Induction Coupling Efficiency: {(efficiency * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.80"
            max="0.99"
            step="0.01"
            value={efficiency}
            onChange={(e) => setEfficiency(parseFloat(e.target.value))}
            className="w-full accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>80%</span>
            <span>99%</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleHarvestPower}
          disabled={loading || !selectedArray}
          className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg shadow-lg shadow-yellow-950/50 transition cursor-pointer"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Harvest Geodynamo Induction Power
        </button>
      </div>

      {telemetry && (
        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-yellow-400" />
              Outer-Core Geodynamo Dispatch Telemetry
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-yellow-950/60 text-yellow-300 border border-yellow-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Harvested Power</p>
              <p className="text-lg font-bold text-yellow-400 mt-0.5">{telemetry.harvested_power_gw} GW</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Dynamo EMF</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.dynamo_emf_kv} kV</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Grid Stability</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{telemetry.grid_stability_pct}%</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Outer Core Depth</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.outer_core_depth_km} km</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default GeodynamoTurbulentStudio;
