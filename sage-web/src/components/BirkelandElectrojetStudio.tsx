"use client";

import React, { useState, useEffect } from "react";
import { Zap, Activity, RefreshCw, Radio, Orbit, ShieldCheck } from "lucide-react";

interface BirkelandElectrojet {
  electrojet_id: string;
  name: string;
  altitude_km: number;
  field_aligned_current_ma: number;
  hall_pedersen_ratio: number;
  nominal_capacity_gw: number;
  ionospheric_flux_mw: number;
  birkeland_coupling_state: string;
  tether_efficiency_pct: number;
}

interface BirkelandTelemetry {
  electrojet_id: string;
  status: string;
  harvested_power_gw: number;
  ionospheric_flux_mw: number;
  altitude_km: number;
  field_aligned_current_ma: number;
  hall_pedersen_ratio: number;
  tether_efficiency_pct: number;
  grid_stability_pct: number;
  dispatch_duration_s: number;
  birkeland_coupling_state: string;
  timestamp: number;
}

export function BirkelandElectrojetStudio() {
  const [electrojets, setElectrojets] = useState<BirkelandElectrojet[]>([]);
  const [selectedJet, setSelectedJet] = useState<string>("");
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.05);
  const [tetherEfficiency, setTetherEfficiency] = useState<number>(0.975);
  const [dispatchDuration, setDispatchDuration] = useState<number>(60.0);
  const [telemetry, setTelemetry] = useState<BirkelandTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchElectrojets = async () => {
    try {
      const res = await fetch("/api/planetary-birkeland-auroral-electrojet/electrojets");
      if (!res.ok) throw new Error("Failed to fetch Birkeland electrojets");
      const data = await res.json();
      setElectrojets(data.electrojets || []);
      if (data.electrojets?.length > 0 && !selectedJet) {
        setSelectedJet(data.electrojets[0].electrojet_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching electrojets");
    }
  };

  useEffect(() => {
    fetchElectrojets();
  }, []);

  const harvestPower = async () => {
    if (!selectedJet) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "/api/planetary-birkeland-auroral-electrojet/harvest-birkeland-electrojet-power",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            electrojet_id: selectedJet,
            current_multiplier_override: currentMultiplier,
            tether_efficiency: tetherEfficiency,
            dispatch_duration_s: dispatchDuration,
          }),
        }
      );
      if (!res.ok) throw new Error("Birkeland electrojet dispatch failed");
      setTelemetry(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error harvesting Birkeland power");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/20">
            <Orbit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Planetary Magnetospheric Birkeland &amp; Auroral Electrojet Supergrid
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">
                Option B Wave 62
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Region-1/Region-2 field-aligned Birkeland currents &amp; auroral Hall/Pedersen closure at 100-130 km (8.400 GW baseload)
            </p>
          </div>
        </div>
        <button
          onClick={fetchElectrojets}
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
              Birkeland Electrojet Node
            </label>
            <select
              value={selectedJet}
              onChange={(e) => setSelectedJet(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {electrojets.map((j) => (
                <option key={j.electrojet_id} value={j.electrojet_id}>
                  {j.name} ({j.altitude_km} km)
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Current Multiplier: {currentMultiplier.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.90"
                max="1.50"
                step="0.01"
                value={currentMultiplier}
                onChange={(e) => setCurrentMultiplier(parseFloat(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Tether Coupling Efficiency: {(tetherEfficiency * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0.80"
                max="0.99"
                step="0.005"
                value={tetherEfficiency}
                onChange={(e) => setTetherEfficiency(parseFloat(e.target.value))}
                className="w-full accent-violet-500"
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
                className="w-full accent-violet-500"
              />
            </div>
          </div>

          <button
            onClick={harvestPower}
            disabled={loading || !selectedJet}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-violet-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Synchronizing Electrojet...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Dispatch 8.400 GW Baseload
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2">
          {telemetry ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Electrojet Telemetry
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <Orbit className="w-3.5 h-3.5" /> {telemetry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Harvested Power</span>
                  <span className="text-lg font-bold text-violet-400">
                    {telemetry.harvested_power_gw.toFixed(3)} GW
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Ionospheric Flux</span>
                  <span className="text-lg font-bold text-fuchsia-400">
                    {telemetry.ionospheric_flux_mw.toFixed(1)} MW
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Current</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {telemetry.field_aligned_current_ma.toFixed(1)} MA
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
                  <Activity className="w-4 h-4 text-violet-400" />
                  Birkeland Ionospheric Closure Parameters
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Altitude:</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.altitude_km} km</div>

                  <div className="text-slate-400">Hall / Pedersen Ratio:</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.hall_pedersen_ratio}</div>

                  <div className="text-slate-400">Coupling State:</div>
                  <div className="text-emerald-400 font-semibold text-right flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {telemetry.birkeland_coupling_state}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <Orbit className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Electrojet Node Dispatched</p>
              <p className="text-sm">Select a Birkeland node and initiate 8.400 GW dispatch</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
