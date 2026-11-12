'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, Cpu, AlertTriangle, Sparkles } from 'lucide-react';

interface BerryArray {
  array_id: string;
  location: string;
  default_pump_thz: number;
  berry_dipole_nm: number;
  base_output_gw: number;
  base_efficiency_pct: number;
  status: string;
}

interface HarvestResult {
  array_id: string;
  location: string;
  berry_dipole_nm: number;
  terahertz_pump_thz: number;
  berry_dipole_gain: number;
  conversion_efficiency_pct: number;
  net_grid_output_gw: number;
  nonlinear_hall_locked: boolean;
  zero_fossil_carbon: boolean;
  zero_fissile_waste: boolean;
  status: string;
  timestamp: number;
}

export default function BerryCurvaturePowerStudio() {
  const [arrays, setArrays] = useState<BerryArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>('BERRY-MOIRE-BLG-01');
  const [pumpThz, setPumpThz] = useState<number>(1.8);
  const [berryGain, setBerryGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HarvestResult | null>(null);

  const fetchArrays = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/berry-curvature-power/arrays');
      const data = (await res.json().catch(() => ({}))) as {
        arrays?: BerryArray[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Berry-Curvature harvest arrays');
      }
      if (data.arrays) {
        setArrays(data.arrays);
        if (data.arrays.length > 0) {
          setSelectedArray((prev) => prev || data.arrays![0].array_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load Berry-Curvature harvest arrays');
    }
  }, []);

  useEffect(() => {
    fetchArrays();
  }, [fetchArrays]);

  const handleHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/berry-curvature-power/harvest-berry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          array_id: selectedArray,
          terahertz_pump_thz: pumpThz,
          berry_dipole_gain: berryGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HarvestResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Berry-curvature baseload harvest failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Berry-curvature baseload harvest failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
            <Zap className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-rose-300">
              Option B Wave 39: Planetary Topological Berry-Curvature &amp; Nonlinear Hall Harvest Grid
            </h2>
            <p className="text-sm text-slate-400">
              Moire bilayer graphene, Weyl TaAs dipoles &amp; Kagome Chern-magnet nonlinear Hall rectification (zero carbon, zero fissile waste)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchArrays}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Arrays</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {arrays.map((a) => (
          <button
            type="button"
            key={a.array_id}
            onClick={() => setSelectedArray(a.array_id)}
            aria-pressed={selectedArray === a.array_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedArray === a.array_id
                ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-rose-400">{a.array_id}</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-mono">
                {a.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{a.location}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Dipole={a.berry_dipole_nm} nm | Pump={a.default_pump_thz} THz</div>
              <div>Base Efficiency: {a.base_efficiency_pct}%</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Terahertz Pump Frequency (THz)
            </label>
            <input
              type="number"
              min={0.5}
              max={25.0}
              step={0.2}
              value={pumpThz}
              onChange={(e) => setPumpThz(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Berry Dipole Gain
            </label>
            <input
              type="number"
              min={0.8}
              max={2.5}
              step={0.05}
              value={berryGain}
              onChange={(e) => setBerryGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleHarvest}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-rose-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Harvesting Berry Baseload...' : 'Harvest Berry-Curvature Nonlinear Hall Baseload'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-rose-950/20 border border-rose-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-900/50 pb-3">
            <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Berry-Curvature Grid Telemetry ({telemetry.array_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Net Baseload Output</div>
              <div className="text-base font-bold text-rose-300">
                {telemetry.net_grid_output_gw} GW
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Conversion Efficiency</div>
              <div className="text-base font-bold text-pink-300">
                {telemetry.conversion_efficiency_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Berry Dipole</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.berry_dipole_nm} nm
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Zero Carbon / Waste</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.zero_fossil_carbon && telemetry.zero_fissile_waste ? 'VERIFIED' : 'CHECK'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

