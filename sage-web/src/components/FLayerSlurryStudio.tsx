"use client";

import React, { useState, useEffect } from "react";
import { Zap, Activity, RefreshCw, Power, AlertTriangle, Radio } from "lucide-react";

interface FLayerArray {
  array_id: string;
  region_name: string;
  depth_km: number;
  layer_thickness_km: number;
  pressure_gpa: number;
  temperature_k: number;
  iron_sedimentation_rate_mm_yr: number;
  stratification_buoyancy_ms2: number;
  base_stability_pct: number;
}

interface FLayerTelemetry {
  array_id: string;
  status: string;
  harvested_power_gw: number;
  sedimentation_flux_mw: number;
  f_layer_depth_km: number;
  layer_thickness_km: number;
  pressure_gpa: number;
  temperature_k: number;
  sedimentation_rate_mm_yr: number;
  stratification_frequency_rad_s: number;
  magnetostrictive_efficiency_pct: number;
  grid_stability_pct: number;
  dispatch_duration_s: number;
  slurry_phase: string;
  timestamp: number;
}

export function FLayerSlurryStudio() {
  const [arrays, setArrays] = useState<FLayerArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>("");
  const [sedimentationRate, setSedimentationRate] = useState<number>(2.5);
  const [efficiency, setEfficiency] = useState<number>(0.95);
  const [duration, setDuration] = useState<number>(60.0);
  const [telemetry, setTelemetry] = useState<FLayerTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArrays = async () => {
    try {
      const res = await fetch("/api/planetary-f-layer-slurry-supergrid/arrays");
      if (!res.ok) throw new Error("Failed to fetch F-layer slurry arrays");
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
    if (!selectedArray) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/planetary-f-layer-slurry-supergrid/harvest-slurry-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          array_id: selectedArray,
          sedimentation_rate_override_mm_yr: sedimentationRate,
          magnetostrictive_efficiency: efficiency,
          dispatch_duration_s: duration,
        }),
      });
      if (!res.ok) throw new Error("F-layer power harvest dispatch failed");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Harvest failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              Option B • Wave 57 Supergrid
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Planetary F-Layer Slurry Stratification Supergrid
            </h2>
            <p className="text-sm text-zinc-400">
              Direct multi-gigawatt baseload electrical power dispatch harvested from the Earth&apos;s lowermost outer core F-layer (4,900–5,150 km depth, 315–330 GPa) via iron-snow slurry sedimentation.
            </p>
          </div>
          <button
            onClick={fetchArrays}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Arrays
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Control & Parameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            Select F-Layer Sedimentation Array
          </h3>
          <div className="space-y-2">
            {arrays.map((arr) => (
              <button
                key={arr.array_id}
                onClick={() => setSelectedArray(arr.array_id)}
                className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all ${
                  selectedArray === arr.array_id
                    ? "bg-amber-500/10 border-amber-500/30 text-white"
                    : "bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800/70 text-zinc-400"
                }`}
              >
                <div className="font-bold text-zinc-200">{arr.array_id}</div>
                <div className="text-zinc-400 text-[11px] truncate">{arr.region_name}</div>
                <div className="mt-1 flex gap-3 text-[10px] text-zinc-500">
                  <span>{arr.depth_km} km</span>
                  <span>{arr.pressure_gpa} GPa</span>
                  <span>{arr.temperature_k} K</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-5">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Harvesting & Stratification Controls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Sedimentation Rate: {sedimentationRate.toFixed(1)} mm/yr
              </label>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.1"
                value={sedimentationRate}
                onChange={(e) => setSedimentationRate(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Extraction Efficiency: {(efficiency * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.7"
                max="1.0"
                step="0.01"
                value={efficiency}
                onChange={(e) => setEfficiency(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Dispatch Duration: {duration.toFixed(0)} s
              </label>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <button
            onClick={handleHarvestPower}
            disabled={loading || !selectedArray}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
            Dispatch F-Layer Baseload Power
          </button>
        </div>
      </div>

      {/* Telemetry Output */}
      {telemetry && (
        <div className="p-6 bg-zinc-900/60 border border-amber-500/20 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2 font-mono">
              <Activity className="w-4 h-4" />
              TELEMETRY: {telemetry.status}
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              {new Date(telemetry.timestamp * 1000).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Baseload Power</div>
              <div className="text-lg font-bold text-white font-mono">{telemetry.harvested_power_gw.toFixed(3)} GW</div>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Sedimentation Flux</div>
              <div className="text-lg font-bold text-white font-mono">{telemetry.sedimentation_flux_mw.toFixed(1)} MW</div>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Grid Stability</div>
              <div className="text-lg font-bold text-amber-400 font-mono">{telemetry.grid_stability_pct.toFixed(2)}%</div>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Stratification Freq</div>
              <div className="text-lg font-bold text-amber-400 font-mono">{telemetry.stratification_frequency_rad_s.toFixed(4)} rad/s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
