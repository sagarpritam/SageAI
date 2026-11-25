"use client";

import React, { useState, useEffect } from "react";
import { Zap, Activity, RefreshCw, Radio, Layers, ShieldCheck, AlertCircle } from "lucide-react";

interface TangentCylinderArray {
  array_id: string;
  name: string;
  cylinder_radius_km: number;
  depth_km: number;
  pressure_gpa: number;
  temperature_k: number;
  jet_velocity_km_yr: number;
  azimuthal_field_mt: number;
  base_stability_pct: number;
}

interface TangentJetTelemetry {
  array_id: string;
  status: string;
  harvested_power_gw: number;
  tangent_jet_flux_mw: number;
  cylinder_radius_km: number;
  depth_km: number;
  pressure_gpa: number;
  temperature_k: number;
  jet_velocity_km_yr: number;
  alfven_velocity_m_s: number;
  mhd_induction_efficiency_pct: number;
  grid_stability_pct: number;
  dispatch_duration_s: number;
  tangent_cylinder_state: string;
  timestamp: number;
}

export function TangentCylinderJetStudio() {
  const [arrays, setArrays] = useState<TangentCylinderArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>("");
  const [jetVelocity, setJetVelocity] = useState<number>(42.5);
  const [efficiency, setEfficiency] = useState<number>(0.95);
  const [duration, setDuration] = useState<number>(60.0);
  const [telemetry, setTelemetry] = useState<TangentJetTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArrays = async () => {
    try {
      const res = await fetch("/api/planetary-outer-core-tangent-cylinder-jet/arrays");
      if (!res.ok) throw new Error("Failed to fetch Tangent Cylinder arrays");
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
      const res = await fetch("/api/planetary-outer-core-tangent-cylinder-jet/harvest-tangent-jet-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          array_id: selectedArray,
          jet_velocity_override_km_yr: Number(jetVelocity),
          mhd_induction_efficiency: Number(efficiency),
          dispatch_duration_s: Number(duration),
        }),
      });
      if (!res.ok) throw new Error("Failed to dispatch Tangent Cylinder power");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Harvesting failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Planetary Outer-Core Tangent Cylinder Jet Supergrid
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono border border-blue-500/30">
                OPTION-B WAVE-58
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Tapping into high-latitude retrograde circumpolar plasma jets (40–45 km/yr) streaming along the Tangent Cylinder boundary at 2,891–5,150 km depth for multi-GW electrical baseload dispatch.
            </p>
          </div>
        </div>
        <button
          onClick={fetchArrays}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
          title="Refresh Stator Arrays"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-lg flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Stator Array / Location
          </label>
          <select
            value={selectedArray}
            onChange={(e) => setSelectedArray(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {arrays.map((a) => (
              <option key={a.array_id} value={a.array_id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Jet Velocity (km/yr)
          </label>
          <input
            type="number"
            value={jetVelocity}
            onChange={(e) => setJetVelocity(Number(e.target.value))}
            step={0.5}
            min={20.0}
            max={70.0}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Induction Efficiency (η)
          </label>
          <input
            type="number"
            value={efficiency}
            onChange={(e) => setEfficiency(Number(e.target.value))}
            step={0.01}
            min={0.7}
            max={0.99}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Dispatch Duration (s)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            step={10.0}
            min={10.0}
            max={3600.0}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleHarvestPower}
          disabled={loading || !selectedArray}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors shadow-lg shadow-blue-900/30"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {loading ? "Coupling Core Plasma Jet..." : "Harvest Tangent Jet Power"}
        </button>
      </div>

      {telemetry && (
        <div className="mt-6 border border-slate-800 bg-slate-950/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-sm text-white font-mono">
                {telemetry.status}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {new Date(telemetry.timestamp * 1000).toISOString()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Harvested Baseload
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {telemetry.harvested_power_gw} GW
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                Tangent Jet Flux
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {telemetry.tangent_jet_flux_mw} MW
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Alfvén Velocity
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {telemetry.alfven_velocity_m_s} m/s
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Grid Stability
              </div>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {telemetry.grid_stability_pct}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
