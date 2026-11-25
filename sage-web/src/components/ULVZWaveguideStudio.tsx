"use client";

import React, { useState, useEffect } from "react";
import { Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers, Flame } from "lucide-react";

interface ULVZArray {
  array_id: string;
  location: string;
  cmb_depth_km: number;
  ulvz_thickness_km: number;
  shear_velocity_drop_pct: number;
  iron_enrichment_x_fe: number;
  temperature_k: number;
  base_extraction_efficiency_pct: number;
  status: string;
}

interface ULVZTelemetry {
  array_id: string;
  status: string;
  harvested_power_gw: number;
  magneto_acoustic_flux_mw: number;
  cmb_depth_km: number;
  ulvz_thickness_km: number;
  iron_enrichment_x_fe: number;
  temperature_k: number;
  conversion_efficiency_pct: number;
  grid_stability_pct: number;
  dispatch_duration_s: number;
  timestamp: number;
}

export function ULVZWaveguideStudio() {
  const [arrays, setArrays] = useState<ULVZArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>("");
  const [ironEnrichment, setIronEnrichment] = useState<number>(0.18);
  const [waveguideEfficiency, setWaveguideEfficiency] = useState<number>(0.95);
  const [dispatchDuration, setDispatchDuration] = useState<number>(60);
  const [telemetry, setTelemetry] = useState<ULVZTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArrays = async () => {
    try {
      const res = await fetch("/api/ulvz-magneto-thermal-waveguide-supergrid/arrays");
      if (!res.ok) throw new Error("Failed to fetch ULVZ waveguide arrays");
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

  const handleHarvestWaveguidePower = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ulvz-magneto-thermal-waveguide-supergrid/harvest-waveguide-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          array_id: selectedArray,
          iron_enrichment_override_x_fe: ironEnrichment,
          waveguide_efficiency: waveguideEfficiency,
          dispatch_duration_s: dispatchDuration,
        }),
      });
      if (!res.ok) throw new Error("Failed to harvest ULVZ waveguide power");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error harvesting ULVZ power");
    } finally {
      setLoading(false);
    }
  };

  const currentArray = arrays.find((a) => a.array_id === selectedArray);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Planetary D&apos;&apos; Layer ULVZ Magneto-Thermal Waveguide Supergrid
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                Option B Wave 55
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Core-mantle boundary ultralow-velocity zone iron-rich basal slurry conduits tapping 2,891 km depth thermal siphons
            </p>
          </div>
        </div>
        <button
          onClick={fetchArrays}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition cursor-pointer"
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
            ULVZ Basal Array Location
          </label>
          <select
            value={selectedArray}
            onChange={(e) => setSelectedArray(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {arrays.map((a) => (
              <option key={a.array_id} value={a.array_id}>
                {a.array_id} (thickness {a.ulvz_thickness_km} km)
              </option>
            ))}
          </select>
          {currentArray && (
            <p className="text-xs text-slate-500 italic mt-1">{currentArray.location}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Iron Enrichment x_Fe: {ironEnrichment}
          </label>
          <input
            type="range"
            min="0.10"
            max="0.35"
            step="0.01"
            value={ironEnrichment}
            onChange={(e) => setIronEnrichment(parseFloat(e.target.value))}
            className="w-full accent-rose-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.10 (Marginal Melt)</span>
            <span>0.35 (Heavy Iron Slurry)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Waveguide Efficiency: {Math.round(waveguideEfficiency * 100)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="1.0"
            step="0.05"
            value={waveguideEfficiency}
            onChange={(e) => setWaveguideEfficiency(parseFloat(e.target.value))}
            className="w-full accent-rose-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleHarvestWaveguidePower}
          disabled={loading || !selectedArray}
          className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-rose-950/50 transition cursor-pointer"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Harvest ULVZ Waveguide Baseload Power
        </button>
      </div>

      {telemetry && (
        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              ULVZ Waveguide Telemetry
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Harvested Baseload Power</p>
              <p className="text-lg font-bold text-rose-400 mt-0.5">{telemetry.harvested_power_gw} GW</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Magneto-Acoustic Flux</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.magneto_acoustic_flux_mw} MW</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">ULVZ Thickness</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.ulvz_thickness_km} km</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Grid Stability</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{telemetry.grid_stability_pct}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ULVZWaveguideStudio;
