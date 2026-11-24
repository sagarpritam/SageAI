'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DiamagneticArray {
  array_id: string;
  location: string;
  default_meissner_field_tesla: number;
  diamagnetic_order_rank: number;
  base_output_gw: number;
  base_efficiency_pct: number;
  status: string;
}

interface HarvestResult {
  array_id: string;
  location: string;
  meissner_field_tesla: number;
  levitation_gain: number;
  diamagnetic_order_rank: number;
  net_grid_output_gw: number;
  conversion_efficiency_pct: number;
  meissner_residual: number;
  levitation_coherence: number;
  zero_fossil_carbon: boolean;
  zero_fissile_waste: boolean;
  status: string;
  timestamp: number;
}

export default function DiamagneticSupergridPowerStudio() {
  const [arrays, setArrays] = useState<DiamagneticArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>('DIAMAGNETIC-LK99-ARRAY-01');
  const [meissnerField, setMeissnerField] = useState<number>(14.5);
  const [levitationGain, setLevitationGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HarvestResult | null>(null);

  const fetchArrays = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/room-temp-diamagnetic-supergrid/arrays');
      const data = (await res.json().catch(() => ({}))) as {
        arrays?: DiamagneticArray[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Diamagnetic Supergrid arrays');
      }
      if (data.arrays) {
        setArrays(data.arrays);
        if (data.arrays.length > 0) {
          setSelectedArray((prev) => prev || data.arrays![0].array_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Diamagnetic Supergrid arrays'
      );
    }
  }, []);

  useEffect(() => {
    fetchArrays();
  }, [fetchArrays]);

  const handleHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/room-temp-diamagnetic-supergrid/harvest-diamagnetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          array_id: selectedArray,
          meissner_field_tesla: meissnerField,
          levitation_gain: levitationGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HarvestResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Diamagnetic Supergrid harvest failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Diamagnetic Supergrid harvest failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-300">
              Option B Wave 46: Room-Temperature Diamagnetic &amp; Meissner-Levitation Supergrid
            </h2>
            <p className="text-sm text-slate-400">
              Sovereign planetary Cu-substituted lead-apatite diamagnetic levitation, zero-dissipation HVDC &amp; orbital storage
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchArrays}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-center justify-between bg-red-950/50 border border-red-500/40 text-red-300 p-4 rounded-lg text-sm"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-400 hover:text-red-200 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="diamagnetic-array-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Target Diamagnetic Supergrid Harvester Array
            </label>
            <select
              id="diamagnetic-array-select"
              aria-label="Target Diamagnetic Supergrid Harvester Array"
              value={selectedArray}
              onChange={(e) => {
                setSelectedArray(e.target.value);
                const arr = arrays.find((x) => x.array_id === e.target.value);
                if (arr) {
                  setMeissnerField(arr.default_meissner_field_tesla);
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {arrays.map((arr) => (
                <option key={arr.array_id} value={arr.array_id}>
                  {arr.array_id} — {arr.location}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="meissner-field-slider" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Meissner Induction ({meissnerField.toFixed(1)} T)
              </label>
              <input
                id="meissner-field-slider"
                aria-label="Meissner Induction"
                type="range"
                min="1"
                max="120"
                step="0.5"
                value={meissnerField}
                onChange={(e) => setMeissnerField(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label htmlFor="levitation-gain-slider" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Levitation Coherence Gain ({levitationGain.toFixed(2)}x)
              </label>
              <input
                id="levitation-gain-slider"
                aria-label="Levitation Coherence Gain"
                type="range"
                min="0.85"
                max="2.5"
                step="0.05"
                value={levitationGain}
                onChange={(e) => setLevitationGain(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleHarvest}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold rounded-lg shadow-lg shadow-amber-900/30 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Harvest Planetary Diamagnetic Baseload</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Diamagnetic Supergrid Telemetry</span>
            </h3>

            {telemetry ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Status</span>
                  <span className="font-mono text-amber-400 font-semibold">{telemetry.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Net Baseload Power</span>
                  <span className="font-mono text-emerald-400 font-bold">{telemetry.net_grid_output_gw.toFixed(2)} GW</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Conversion Efficiency</span>
                  <span className="font-mono text-amber-300">{telemetry.conversion_efficiency_pct.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Meissner Residual</span>
                  <span className="font-mono text-purple-400">{telemetry.meissner_residual.toExponential(4)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Levitation Coherence</span>
                  <span className="font-mono text-cyan-400">{(telemetry.levitation_coherence * 100).toFixed(5)}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Zero Fossil Carbon</span>
                  <span className="font-mono text-emerald-400">{telemetry.zero_fossil_carbon ? 'VERIFIED' : 'NO'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Zero Fissile Waste</span>
                  <span className="font-mono text-emerald-400">{telemetry.zero_fissile_waste ? 'VERIFIED' : 'NO'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Timestamp</span>
                  <span className="font-mono text-slate-400">{new Date(telemetry.timestamp * 1000).toLocaleTimeString()}</span>
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-600" />
                <p>No active harvest event. Select an array and trigger persistent supercurrent baseload extraction.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Room-Temp Superconductivity</span>
            <span className="font-mono text-amber-400">LK-99 / Pb-Apatite Meissner Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
