'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, Activity, AlertTriangle, Flame } from 'lucide-react';

interface UnruhRindlerArray {
  array_id: string;
  location: string;
  rindler_accel_1e20_ms2: number;
  default_cavity_ghz: number;
  unruh_temp_kelvin: number;
  base_efficiency_pct: number;
  status: string;
}

interface HarvestUnruhResult {
  array_id: string;
  location: string;
  rindler_accel_1e20_ms2: number;
  effective_unruh_temp_kelvin: number;
  cavity_frequency_ghz: number;
  rectifier_gain: number;
  conversion_efficiency_pct: number;
  net_grid_output_gw: number;
  zero_fossil_carbon: boolean;
  zero_fissile_waste: boolean;
  status: string;
  timestamp: number;
}

export default function UnruhRindlerStudio() {
  const [arrays, setArrays] = useState<UnruhRindlerArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>('UNRUH-RINDLER-LEO-01');
  const [cavityGhz, setCavityGhz] = useState<number>(42.0);
  const [rectifierGain, setRectifierGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HarvestUnruhResult | null>(null);

  const fetchArrays = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/unruh-rindler-power/arrays');
      const data = (await res.json().catch(() => ({}))) as {
        arrays?: UnruhRindlerArray[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Unruh-Rindler rectifier arrays');
      }
      if (data.arrays) {
        setArrays(data.arrays);
        if (data.arrays.length > 0) {
          setSelectedArray((prev) => prev || data.arrays![0].array_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load Unruh-Rindler rectifier arrays');
    }
  }, []);

  useEffect(() => {
    fetchArrays();
  }, [fetchArrays]);

  const handleHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/unruh-rindler-power/harvest-unruh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          array_id: selectedArray,
          cavity_frequency_ghz: cavityGhz,
          rectifier_gain: rectifierGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HarvestUnruhResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Unruh-Rindler power harvest failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unruh-Rindler power harvest failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <Flame className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Option B (Wave 35): Unruh-Rindler Thermal Bath &amp; Josephson Rectifier Grid
            </h2>
            <p className="text-sm text-slate-400">
              Fulling-Davies-Unruh accelerated vacuum thermal bath rectification (&gt;240–620 GW, zero fissile waste)
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
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
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
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">{a.array_id}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {a.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{a.location}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Unruh Temp: T_U={a.unruh_temp_kelvin} K</div>
              <div>Base Efficiency: {a.base_efficiency_pct}%</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Josephson Cavity Frequency (GHz)
            </label>
            <input
              type="number"
              min={10}
              max={180}
              step={2}
              value={cavityGhz}
              onChange={(e) => setCavityGhz(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Bogoliubov Rectifier Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={rectifierGain}
              onChange={(e) => setRectifierGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleHarvest}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-emerald-900/30"
        >
          <Zap className="w-4 h-4" />
          <span>{loading ? 'Rectifying Unruh Bath Modes...' : 'Harvest Unruh-Rindler Vacuum Baseload'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <Activity className="w-4 h-4" />
              <span>Unruh-Rindler Grid Telemetry ({telemetry.array_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Net Baseload</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.net_grid_output_gw} GW
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Efficiency</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.conversion_efficiency_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Effective T_U</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.effective_unruh_temp_kelvin} K
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Zero Fissile Waste</div>
              <div className="text-base font-bold text-emerald-400">
                {telemetry.zero_fissile_waste ? 'VERIFIED ZERO' : 'CHECK'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

