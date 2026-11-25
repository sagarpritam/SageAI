"use client";

import React, { useState, useEffect } from "react";
import { Zap, Activity, RefreshCw, Layers, Shield, AlertTriangle, Radio } from "lucide-react";

interface IMICArray {
  array_id: string;
  name: string;
  radius_km: number;
  depth_km: number;
  pressure_gpa: number;
  temperature_k: number;
  tilt_angle_deg: number;
  base_anisotropy_pct: number;
  transducer_mode: string;
}

interface IMICTelemetry {
  array_id: string;
  status: string;
  harvested_power_gw: number;
  central_compression_flux_mw: number;
  radius_km: number;
  depth_km: number;
  pressure_gpa: number;
  temperature_k: number;
  tilt_angle_deg: number;
  anisotropy_factor_pct: number;
  piezo_coupling_efficiency_pct: number;
  grid_stability_pct: number;
  dispatch_duration_s: number;
  innermost_lattice_state: string;
  timestamp: number;
}

export function InnermostInnerCoreStudio() {
  const [arrays, setArrays] = useState<IMICArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>("");
  const [anisotropyFactor, setAnisotropyFactor] = useState<number>(3.2);
  const [couplingEfficiency, setCouplingEfficiency] = useState<number>(0.95);
  const [dispatchDuration, setDispatchDuration] = useState<number>(60.0);
  const [telemetry, setTelemetry] = useState<IMICTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArrays = async () => {
    try {
      const res = await fetch("/api/planetary-innermost-inner-core-anisotropy/arrays");
      if (!res.ok) throw new Error("Failed to fetch IMIC arrays");
      const data = await res.json();
      setArrays(data.arrays || []);
      if (data.arrays?.length > 0 && !selectedArray) {
        setSelectedArray(data.arrays[0].array_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching IMIC arrays");
    }
  };

  useEffect(() => {
    fetchArrays();
  }, []);

  const handleHarvestInnermostCorePower = async () => {
    if (!selectedArray) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/planetary-innermost-inner-core-anisotropy/harvest-innermost-core-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          array_id: selectedArray,
          anisotropy_factor_override: Number(anisotropyFactor),
          piezo_coupling_efficiency: Number(couplingEfficiency),
          dispatch_duration_s: Number(dispatchDuration),
        }),
      });
      if (!res.ok) throw new Error("Failed to dispatch innermost core power");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Dispatch failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Planetary Innermost Inner Core (IMIC) Anisotropic Lattice Supergrid
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-mono border border-yellow-500/30">
                OPTION-B WAVE-59
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Earth's Innermost Inner Core at 5,700–6,371 km depth (350–364 GPa, 6,000–6,200 K, ~55° tilted fast-axis lattice anisotropy & central compression).
            </p>
          </div>
        </div>
        <button
          onClick={fetchArrays}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
          title="Refresh Arrays"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center space-x-3 text-rose-400 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            IMIC Central Array
          </label>
          <select
            value={selectedArray}
            onChange={(e) => setSelectedArray(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
          >
            {arrays.map((arr) => (
              <option key={arr.array_id} value={arr.array_id}>
                {arr.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            P-Wave Anisotropy (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={anisotropyFactor}
            onChange={(e) => setAnisotropyFactor(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
            min={1.0}
            max={6.0}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Piezo Coupling Efficiency
          </label>
          <input
            type="number"
            step="0.01"
            value={couplingEfficiency}
            onChange={(e) => setCouplingEfficiency(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
            min={0.80}
            max={0.99}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Dispatch Duration (s)
          </label>
          <input
            type="number"
            value={dispatchDuration}
            onChange={(e) => setDispatchDuration(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-yellow-500"
            min={10}
            max={3600}
          />
        </div>
      </div>

      <button
        onClick={handleHarvestInnermostCorePower}
        disabled={loading || !selectedArray}
        className="w-full py-3 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-white font-semibold rounded-lg shadow-lg shadow-yellow-950/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {loading ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Zap className="w-5 h-5" />
            <span>Dispatch Central Gravitational & Lattice Anisotropy Baseload Power</span>
          </>
        )}
      </button>

      {telemetry && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-yellow-400" />
              <div>
                <span className="text-xs text-slate-400">IMIC Status</span>
                <p className="text-sm font-semibold text-yellow-400">{telemetry.status}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Grid Stability</span>
              <p className="text-sm font-bold text-white">{telemetry.grid_stability_pct.toFixed(2)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Baseload Power</span>
              <p className="text-lg font-bold text-yellow-400 font-mono mt-1">
                {telemetry.harvested_power_gw.toFixed(3)} GW
              </p>
              <span className="text-[10px] text-slate-500">Flux: {telemetry.central_compression_flux_mw} MW</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Earth Core Location</span>
              <p className="text-lg font-bold text-amber-400 font-mono mt-1">
                r = {telemetry.radius_km} km
              </p>
              <span className="text-[10px] text-slate-500">Depth = {telemetry.depth_km} km</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Central Pressure & Temp</span>
              <p className="text-lg font-bold text-orange-400 font-mono mt-1">
                {telemetry.pressure_gpa} GPa
              </p>
              <span className="text-[10px] text-slate-500">{telemetry.temperature_k} K | Tilt = {telemetry.tilt_angle_deg}°</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Lattice State</span>
              <p className="text-xs font-bold text-slate-200 font-mono mt-1 truncate">
                {telemetry.innermost_lattice_state}
              </p>
              <span className="text-[10px] text-slate-500">
                Anisotropy: {telemetry.anisotropy_factor_pct}% | {telemetry.piezo_coupling_efficiency_pct}% eff
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
