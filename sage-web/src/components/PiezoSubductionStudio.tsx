"use client";

import React, { useState, useEffect } from "react";
import { Zap, Activity, RefreshCw, Radio, Mountain, ShieldCheck } from "lucide-react";

interface SubductionSlab {
  slab_id: string;
  name: string;
  slab_depth_km: number;
  tremor_frequency_hz: number;
  stress_relief_mpa: number;
  nominal_capacity_gw: number;
  piezo_flux_mw: number;
  subduction_coupling_state: string;
  piezo_efficiency_pct: number;
}

interface PiezoTelemetry {
  slab_id: string;
  status: string;
  harvested_power_gw: number;
  piezo_flux_mw: number;
  slab_depth_km: number;
  tremor_frequency_hz: number;
  stress_relief_mpa: number;
  piezo_efficiency_pct: number;
  grid_stability_pct: number;
  dispatch_duration_s: number;
  subduction_coupling_state: string;
  timestamp: number;
}

export function PiezoSubductionStudio() {
  const [slabs, setSlabs] = useState<SubductionSlab[]>([]);
  const [selectedSlab, setSelectedSlab] = useState<string>("");
  const [strainMult, setStrainMult] = useState<number>(1.05);
  const [piezoEfficiency, setPiezoEfficiency] = useState<number>(0.982);
  const [dispatchDuration, setDispatchDuration] = useState<number>(60.0);
  const [telemetry, setTelemetry] = useState<PiezoTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlabs = async () => {
    try {
      const res = await fetch("/api/planetary-piezoelectric-tectonic-subduction/slabs");
      if (!res.ok) throw new Error("Failed to fetch subduction slabs");
      const data = await res.json();
      setSlabs(data.slabs || []);
      if (data.slabs?.length > 0 && !selectedSlab) {
        setSelectedSlab(data.slabs[0].slab_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching slabs");
    }
  };

  useEffect(() => {
    fetchSlabs();
  }, []);

  const harvestPower = async () => {
    if (!selectedSlab) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "/api/planetary-piezoelectric-tectonic-subduction/harvest-tectonic-piezo-power",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slab_id: selectedSlab,
            strain_multiplier: strainMult,
            piezo_efficiency: piezoEfficiency,
            dispatch_duration_s: dispatchDuration,
          }),
        }
      );
      if (!res.ok) throw new Error("Tectonic piezo dispatch failed");
      setTelemetry(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error harvesting tectonic power");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
            <Mountain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Planetary Piezoelectric Tectonic Subduction Supergrid
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Option B Wave 64
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Megathrust subduction quartz-olivine piezoelectric stress tensors &amp; slow-slip tremor strain (9.200 GW baseload + stress relief)
            </p>
          </div>
        </div>
        <button
          onClick={fetchSlabs}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 flex items-center gap-3">
          <Radio className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Subduction Slab Array
            </label>
            <select
              value={selectedSlab}
              onChange={(e) => setSelectedSlab(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {slabs.map((s) => (
                <option key={s.slab_id} value={s.slab_id}>
                  {s.name} ({s.slab_depth_km} km)
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Strain Multiplier: {strainMult.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.90"
                max="1.50"
                step="0.01"
                value={strainMult}
                onChange={(e) => setStrainMult(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Piezo Coupling Efficiency: {(piezoEfficiency * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0.80"
                max="0.99"
                step="0.002"
                value={piezoEfficiency}
                onChange={(e) => setPiezoEfficiency(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Dispatch Duration: {dispatchDuration.toFixed(0)} s
              </label>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={dispatchDuration}
                onChange={(e) => setDispatchDuration(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
          </div>

          <button
            onClick={harvestPower}
            disabled={loading || !selectedSlab}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-rose-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Coupling Subduction Slab...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Dispatch 9.200 GW Baseload
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2">
          {telemetry ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Subduction Telemetry
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Mountain className="w-3.5 h-3.5" /> {telemetry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Harvested Power</span>
                  <span className="text-lg font-bold text-rose-400">
                    {telemetry.harvested_power_gw.toFixed(3)} GW
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Piezo Flux</span>
                  <span className="text-lg font-bold text-orange-400">
                    {telemetry.piezo_flux_mw.toFixed(1)} MW
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Stress Relief</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {telemetry.stress_relief_mpa.toFixed(1)} MPa
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Grid Stability</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.grid_stability_pct.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" />
                  Wadati-Benioff Piezoelectric Coupling Parameters
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Slab Depth:</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.slab_depth_km} km</div>

                  <div className="text-slate-400">Tremor Frequency:</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.tremor_frequency_hz} Hz</div>

                  <div className="text-slate-400">Coupling State:</div>
                  <div className="text-emerald-400 font-semibold text-right flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {telemetry.subduction_coupling_state}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <Mountain className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Subduction Slab Dispatched</p>
              <p className="text-sm">Select a subduction slab array and initiate 9.200 GW dispatch</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
