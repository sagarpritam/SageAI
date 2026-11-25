"use client";

import React, { useState, useEffect } from "react";
import { Zap, Activity, RefreshCw, Radio, Compass, ShieldCheck } from "lucide-react";

interface GeomagneticCapacitor {
  capacitor_id: string;
  name: string;
  gauss_harmonic_mode: string;
  multipole_order: number;
  magnetic_flux_density_ut: number;
  nominal_capacity_gw: number;
  secular_flux_mw: number;
  geomagnetic_capacitor_state: string;
  lorentz_coupling_efficiency_pct: number;
}

interface GeomagneticTelemetry {
  capacitor_id: string;
  status: string;
  harvested_power_gw: number;
  secular_flux_mw: number;
  multipole_order: number;
  gauss_harmonic_mode: string;
  magnetic_flux_density_ut: number;
  lorentz_coupling_efficiency_pct: number;
  grid_stability_pct: number;
  dispatch_duration_s: number;
  geomagnetic_capacitor_state: string;
  timestamp: number;
}

export function GeomagneticFluxCapacitorStudio() {
  const [capacitors, setCapacitors] = useState<GeomagneticCapacitor[]>([]);
  const [selectedCapacitor, setSelectedCapacitor] = useState<string>("");
  const [multipoleOrder, setMultipoleOrder] = useState<number>(3);
  const [lorentzEfficiency, setLorentzEfficiency] = useState<number>(0.97);
  const [dispatchDuration, setDispatchDuration] = useState<number>(60.0);
  const [telemetry, setTelemetry] = useState<GeomagneticTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCapacitors = async () => {
    try {
      const res = await fetch("/api/planetary-geomagnetic-reversal-flux-capacitor/capacitors");
      if (!res.ok) throw new Error("Failed to fetch geomagnetic capacitors");
      const data = await res.json();
      setCapacitors(data.capacitors || []);
      if (data.capacitors?.length > 0 && !selectedCapacitor) {
        setSelectedCapacitor(data.capacitors[0].capacitor_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching capacitors");
    }
  };

  useEffect(() => {
    fetchCapacitors();
  }, []);

  const harvestPower = async () => {
    if (!selectedCapacitor) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "/api/planetary-geomagnetic-reversal-flux-capacitor/harvest-geomagnetic-reversal-power",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            capacitor_id: selectedCapacitor,
            multipole_order_override: multipoleOrder,
            lorentz_coupling_efficiency: lorentzEfficiency,
            dispatch_duration_s: dispatchDuration,
          }),
        }
      );
      if (!res.ok) throw new Error("Geomagnetic reversal power dispatch failed");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error harvesting geomagnetic power");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Planetary Geomagnetic Reversal Flux Capacitor Supergrid
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Option B Wave 61
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Multipole Gauss-coefficient secular variation &amp; South Atlantic Anomaly flux reversal Lorentz arrays (8.200 GW clean baseload)
            </p>
          </div>
        </div>
        <button
          onClick={fetchCapacitors}
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
              Geomagnetic Flux Capacitor Node
            </label>
            <select
              value={selectedCapacitor}
              onChange={(e) => setSelectedCapacitor(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {capacitors.map((c) => (
                <option key={c.capacitor_id} value={c.capacitor_id}>
                  {c.name} ({c.gauss_harmonic_mode})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Multipole Harmonic Order: {multipoleOrder}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={multipoleOrder}
                onChange={(e) => setMultipoleOrder(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Lorentz Coupling Efficiency: {(lorentzEfficiency * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0.80"
                max="0.99"
                step="0.01"
                value={lorentzEfficiency}
                onChange={(e) => setLorentzEfficiency(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
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
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          <button
            onClick={harvestPower}
            disabled={loading || !selectedCapacitor}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-cyan-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Coupling Secular Flux...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Dispatch 8.200 GW Baseload
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2">
          {telemetry ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Geomagnetic Telemetry
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Compass className="w-3.5 h-3.5" /> {telemetry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Harvested Power</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.harvested_power_gw.toFixed(3)} GW
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Secular Flux</span>
                  <span className="text-lg font-bold text-teal-400">
                    {telemetry.secular_flux_mw.toFixed(1)} MW
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Flux Density</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {telemetry.magnetic_flux_density_ut.toFixed(1)} uT
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Grid Stability</span>
                  <span className="text-lg font-bold text-amber-400">
                    {telemetry.grid_stability_pct.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Multipole Gauss-Coefficient Induction Parameters
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Gauss Harmonic Mode:</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.gauss_harmonic_mode}</div>

                  <div className="text-slate-400">Multipole Order:</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.multipole_order}</div>

                  <div className="text-slate-400">Lorentz Coupling Efficiency:</div>
                  <div className="text-cyan-400 font-semibold text-right">
                    {telemetry.lorentz_coupling_efficiency_pct.toFixed(1)}%
                  </div>

                  <div className="text-slate-400">Capacitor Lock State:</div>
                  <div className="text-emerald-400 font-semibold text-right flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {telemetry.geomagnetic_capacitor_state}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <Compass className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Geomagnetic Node Dispatched</p>
              <p className="text-sm">Select a geomagnetic flux capacitor and initiate 8.200 GW dispatch</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
