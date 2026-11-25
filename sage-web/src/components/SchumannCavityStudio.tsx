"use client";

import React, { useState, useEffect } from "react";
import { Zap, Activity, RefreshCw, Radio, Waves, ShieldCheck } from "lucide-react";

interface SchumannCavity {
  cavity_id: string;
  name: string;
  resonant_frequency_hz: number;
  harmonic_mode: string;
  q_factor: number;
  nominal_capacity_gw: number;
  cavity_flux_mw: number;
  schumann_coupling_state: string;
  waveguide_efficiency_pct: number;
}

interface SchumannTelemetry {
  cavity_id: string;
  status: string;
  harvested_power_gw: number;
  cavity_flux_mw: number;
  resonant_frequency_hz: number;
  harmonic_mode: string;
  q_factor: number;
  waveguide_efficiency_pct: number;
  grid_stability_pct: number;
  dispatch_duration_s: number;
  schumann_coupling_state: string;
  timestamp: number;
}

export function SchumannCavityStudio() {
  const [cavities, setCavities] = useState<SchumannCavity[]>([]);
  const [selectedCavity, setSelectedCavity] = useState<string>("");
  const [qFactorMult, setQFactorMult] = useState<number>(1.05);
  const [waveguideEfficiency, setWaveguideEfficiency] = useState<number>(0.98);
  const [dispatchDuration, setDispatchDuration] = useState<number>(60.0);
  const [telemetry, setTelemetry] = useState<SchumannTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCavities = async () => {
    try {
      const res = await fetch("/api/planetary-telluric-schumann-cavity/cavities");
      if (!res.ok) throw new Error("Failed to fetch Schumann cavities");
      const data = await res.json();
      setCavities(data.cavities || []);
      if (data.cavities?.length > 0 && !selectedCavity) {
        setSelectedCavity(data.cavities[0].cavity_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching cavities");
    }
  };

  useEffect(() => {
    fetchCavities();
  }, []);

  const harvestPower = async () => {
    if (!selectedCavity) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "/api/planetary-telluric-schumann-cavity/harvest-schumann-cavity-power",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cavity_id: selectedCavity,
            q_factor_multiplier: qFactorMult,
            waveguide_efficiency: waveguideEfficiency,
            dispatch_duration_s: dispatchDuration,
          }),
        }
      );
      if (!res.ok) throw new Error("Schumann cavity dispatch failed");
      setTelemetry(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error harvesting Schumann power");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Planetary Telluric Schumann Cavity Waveguide Supergrid
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                Option B Wave 63
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Global Earth-ionosphere ELF waveguide cavity resonance (7.83 Hz fundamental &amp; harmonics) &amp; telluric loops (8.800 GW baseload)
            </p>
          </div>
        </div>
        <button
          onClick={fetchCavities}
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
              Schumann Cavity Node
            </label>
            <select
              value={selectedCavity}
              onChange={(e) => setSelectedCavity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {cavities.map((c) => (
                <option key={c.cavity_id} value={c.cavity_id}>
                  {c.name} ({c.resonant_frequency_hz} Hz)
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Q-Factor Multiplier: {qFactorMult.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.90"
                max="1.50"
                step="0.01"
                value={qFactorMult}
                onChange={(e) => setQFactorMult(parseFloat(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Waveguide Efficiency: {(waveguideEfficiency * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0.80"
                max="0.99"
                step="0.01"
                value={waveguideEfficiency}
                onChange={(e) => setWaveguideEfficiency(parseFloat(e.target.value))}
                className="w-full accent-teal-500"
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
                className="w-full accent-teal-500"
              />
            </div>
          </div>

          <button
            onClick={harvestPower}
            disabled={loading || !selectedCavity}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-teal-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Coupling ELF Cavity...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Dispatch 8.800 GW Baseload
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2">
          {telemetry ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cavity Telemetry
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Waves className="w-3.5 h-3.5" /> {telemetry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Harvested Power</span>
                  <span className="text-lg font-bold text-teal-400">
                    {telemetry.harvested_power_gw.toFixed(3)} GW
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Cavity Flux</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {telemetry.cavity_flux_mw.toFixed(1)} MW
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">ELF Freq</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.resonant_frequency_hz.toFixed(2)} Hz
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
                  <Activity className="w-4 h-4 text-teal-400" />
                  Schumann Earth-Ionosphere Waveguide Parameters
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Harmonic Mode:</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.harmonic_mode}</div>

                  <div className="text-slate-400">Cavity Q-Factor:</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.q_factor}</div>

                  <div className="text-slate-400">Resonance Lock State:</div>
                  <div className="text-emerald-400 font-semibold text-right flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {telemetry.schumann_coupling_state}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <Waves className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Cavity Node Dispatched</p>
              <p className="text-sm">Select a Schumann cavity node and initiate 8.800 GW dispatch</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
