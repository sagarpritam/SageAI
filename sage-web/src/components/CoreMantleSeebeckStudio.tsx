'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

interface SeebeckArray {
  array_id: string;
  location: string;
  cmb_depth_km: number;
  delta_temperature_k: number;
  seebeck_coefficient_uv_k: number;
  figure_of_merit_zt: number;
  base_conversion_efficiency_pct: number;
  status: string;
}

interface HarvestResult {
  array_id: string;
  status: string;
  harvested_power_gw: number;
  delta_temperature_k: number;
  seebeck_coefficient_uv_k: number;
  figure_of_merit_zt: number;
  conversion_efficiency_pct: number;
  grid_stability_pct: number;
  cmb_depth_km: number;
  dispatch_duration_s: number;
  timestamp: number;
}

export default function CoreMantleSeebeckStudio() {
  const [arrays, setArrays] = useState<SeebeckArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>('SEEBECK-PACIFIC-TRENCH-01');
  const [deltaTemp, setDeltaTemp] = useState<number>(1250.0);
  const [efficiency, setEfficiency] = useState<number>(0.95);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HarvestResult | null>(null);

  const fetchArrays = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/core-mantle-seebeck-supergrid/arrays');
      const data = (await res.json().catch(() => ({}))) as {
        arrays?: SeebeckArray[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load core-mantle Seebeck arrays');
      }
      if (data.arrays) {
        setArrays(data.arrays);
        if (data.arrays.length > 0) {
          setSelectedArray((prev) => prev || data.arrays![0].array_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading Seebeck arrays';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchArrays();
  }, [fetchArrays]);

  const handleHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/core-mantle-seebeck-supergrid/harvest-thermal-power', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          array_id: selectedArray,
          delta_temp_override_k: deltaTemp,
          thermopile_efficiency: efficiency,
          dispatch_duration_s: 60.0,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HarvestResult & { detail?: string };
      if (!res.ok) {
        throw new Error(data.detail || 'Seebeck thermal harvest failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during Seebeck power harvest';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentArray = arrays.find((a) => a.array_id === selectedArray);

  return (
    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Planetary Core-Mantle Seebeck Supergrid
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  Wave 52 Option B
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Core-mantle boundary (CMB) D&quot; thermal gradient (&Delta;T ~ 1,200 K), nanostructured skutterudite thermopiles, and continuous multi-GW baseload power
              </p>
            </div>
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

      {errorMsg && (
        <div
          role="alert"
          className="my-4 p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-sm flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Seebeck Grid Error</p>
            <p>{errorMsg}</p>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-400 hover:text-red-200 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Seebeck Thermopile Array
          </label>
          <select
            value={selectedArray}
            onChange={(e) => setSelectedArray(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {arrays.map((a) => (
              <option key={a.array_id} value={a.array_id}>
                {a.array_id} (ZT={a.figure_of_merit_zt})
              </option>
            ))}
          </select>
          {currentArray && (
            <p className="text-xs text-slate-500 italic mt-1">{currentArray.location}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            CMB Thermal Gradient ($\Delta T$): {deltaTemp} K
          </label>
          <input
            type="range"
            min="900"
            max="1500"
            step="10"
            value={deltaTemp}
            onChange={(e) => setDeltaTemp(parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>900 K</span>
            <span>1,250 K (CMB D&quot;)</span>
            <span>1,500 K</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Thermopile Efficiency: {Math.round(efficiency * 100)}%
          </label>
          <input
            type="range"
            min="0.70"
            max="0.99"
            step="0.01"
            value={efficiency}
            onChange={(e) => setEfficiency(parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>70%</span>
            <span>95% (Resonant)</span>
            <span>99%</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={handleHarvest}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-amber-600/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? 'Coupling CMB Thermal Gradient...' : 'Harvest Core-Mantle Seebeck Power'}
        </button>
      </div>

      {telemetry && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Planetary Seebeck Power Dispatch Telemetry
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Harvested Baseload</p>
              <p className="text-lg font-bold text-amber-400 mt-0.5">{telemetry.harvested_power_gw} GW</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Seebeck Coefficient</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.seebeck_coefficient_uv_k} $\mu$V/K</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Figure of Merit (ZT)</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.figure_of_merit_zt}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Grid Stability</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{telemetry.grid_stability_pct}%</p>
            </div>
          </div>

          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>CMB Depth: <strong className="text-slate-200">{telemetry.cmb_depth_km} km</strong></span>
            <span>Gradient: <strong className="text-amber-300">{telemetry.delta_temperature_k} K</strong></span>
            <span>Coupling: <strong className="text-emerald-400">D&quot; BOUNDARY LOCKED</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
