'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MajoranaArray {
  array_id: string;
  location: string;
  default_topological_gap_muev: number;
  majorana_braid_order: number;
  base_output_gw: number;
  base_efficiency_pct: number;
  status: string;
}

interface HarvestResult {
  array_id: string;
  location: string;
  topological_gap_muev: number;
  braid_coherence_gain: number;
  majorana_braid_order: number;
  net_grid_output_gw: number;
  conversion_efficiency_pct: number;
  braiding_residual: number;
  parity_coherence: number;
  zero_fossil_carbon: boolean;
  zero_fissile_waste: boolean;
  status: string;
  timestamp: number;
}

export default function MajoranaSupergridPowerStudio() {
  const [arrays, setArrays] = useState<MajoranaArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>('MAJORANA-NANOWIRE-ARRAY-01');
  const [gapMuev, setGapMuev] = useState<number>(640.0);
  const [coherenceGain, setCoherenceGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HarvestResult | null>(null);

  const fetchArrays = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/majorana-zero-supergrid/arrays');
      const data = (await res.json().catch(() => ({}))) as {
        arrays?: MajoranaArray[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Majorana zero-mode arrays');
      }
      if (data.arrays) {
        setArrays(data.arrays);
        if (data.arrays.length > 0) {
          setSelectedArray((prev) => prev || data.arrays![0].array_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Majorana zero-mode arrays'
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
      const res = await fetch('/api/majorana-zero-supergrid/harvest-majorana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          array_id: selectedArray,
          topological_gap_muev: gapMuev,
          braid_coherence_gain: coherenceGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HarvestResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Majorana zero-mode baseload harvest failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Majorana zero-mode baseload harvest failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Option B Wave 45: Planetary Non-Abelian Majorana Zero-Mode Supergrid
            </h2>
            <p className="text-sm text-slate-400">
              Semiconductor-superconductor Kitaev chains, non-abelian braiding &amp; parity-protected baseload supergrid
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
          <label className="block text-sm font-medium text-slate-300">
            Target Planetary Majorana Zero-Mode Supergrid Harvester Array
          </label>
          <select
            value={selectedArray}
            onChange={(e) => setSelectedArray(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {arrays.map((a) => (
              <option key={a.array_id} value={a.array_id}>
                {a.array_id} — {a.location}
              </option>
            ))}
          </select>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Topological Superconducting Gap: {gapMuev.toFixed(1)} μeV</span>
                <span>[100 μeV to 2500 μeV]</span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="10"
                value={gapMuev}
                onChange={(e) => setGapMuev(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Non-Abelian Braid Coherence Gain: {coherenceGain.toFixed(2)}x</span>
                <span>[0.85x to 2.50x]</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="2.5"
                step="0.05"
                value={coherenceGain}
                onChange={(e) => setCoherenceGain(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleHarvest}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{loading ? 'Harvesting Baseload Power...' : 'Harvest Majorana Supergrid Baseload'}</span>
          </button>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-4">
              <Activity className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Majorana Supergrid Telemetry</h3>
            </div>

            {telemetry ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Array ID:</span>
                  <span className="font-mono text-emerald-300">{telemetry.array_id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-mono text-emerald-400">{telemetry.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Net Output:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {telemetry.net_grid_output_gw.toFixed(2)} GW
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Conversion Efficiency:</span>
                  <span className="font-mono text-teal-300">
                    {telemetry.conversion_efficiency_pct.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Braiding Exchange Residual:</span>
                  <span className="font-mono text-slate-200">
                    {telemetry.braiding_residual.toExponential(4)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Parity Coherence Index:</span>
                  <span className="font-mono text-emerald-300">
                    {telemetry.parity_coherence.toFixed(7)}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Zero Fossil Carbon / Waste:</span>
                  <span className="font-mono text-emerald-400">
                    {telemetry.zero_fossil_carbon && telemetry.zero_fissile_waste ? 'VERIFIED (100%)' : 'NO'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs text-center">
                Select a planetary Majorana zero-mode array and initiate topological baseload harvest to inspect live power telemetry.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Planetary Clean Energy Supergrid • Wave 45</span>
            <span className="text-emerald-400/80 font-mono">v8.5.0-STABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
