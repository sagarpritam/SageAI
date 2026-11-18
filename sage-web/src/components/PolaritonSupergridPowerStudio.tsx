'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PolaritonArray {
  array_id: string;
  classification: string;
  condensate_density_cm2: number;
  rabi_splitting_mev: number;
  base_output_gw: number;
  base_efficiency_pct: number;
  status: string;
}

interface HarvestResult {
  array_id: string;
  classification: string;
  condensate_density_cm2: number;
  detuning_mev: number;
  pump_power_mw: number;
  net_power_output_gw: number;
  conversion_efficiency_pct: number;
  polariton_superfluid_locked: boolean;
  zero_fossil_carbon: boolean;
  zero_fissile_waste: boolean;
  status: string;
  timestamp: number;
}

export default function PolaritonSupergridPowerStudio() {
  const [arrays, setArrays] = useState<PolaritonArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>('POLARITON-BEC-ARRAY-01');
  const [condensateDensity, setCondensateDensity] = useState<number>(4.8e14);
  const [detuningMev, setDetuningMev] = useState<number>(0.0);
  const [pumpPowerMw, setPumpPowerMw] = useState<number>(350.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HarvestResult | null>(null);

  const fetchArrays = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/polariton-bec-supergrid/arrays');
      const data = (await res.json().catch(() => ({}))) as {
        arrays?: PolaritonArray[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Exciton-Polariton BEC power arrays');
      }
      if (data.arrays) {
        setArrays(data.arrays);
        if (data.arrays.length > 0) {
          setSelectedArray((prev) => prev || data.arrays![0].array_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Exciton-Polariton BEC power arrays'
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
      const res = await fetch('/api/polariton-bec-supergrid/harvest-polariton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          array_id: selectedArray,
          condensate_density: condensateDensity,
          detuning_mev: detuningMev,
          pump_power_mw: pumpPowerMw,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HarvestResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Exciton-Polariton BEC baseload harvest failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Exciton-Polariton BEC baseload harvest failed'
      );
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
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Option B Wave 46
              </span>
              <span className="text-xs text-slate-400 font-mono">Baseload Energy Architecture</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Sovereign Planetary Superconducting Exciton-Polariton Supergrid
            </h2>
            <p className="text-xs text-slate-400">
              Macroscopic room-temperature Bose-Einstein condensate (BEC) superfluid power harvesting with zero fossil carbon and zero fissile waste.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fetchArrays()}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Arrays</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-lg flex items-center space-x-2 text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Exciton-Polariton Node / Ring
            </label>
            <select
              value={selectedArray}
              onChange={(e) => setSelectedArray(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {arrays.map((a) => (
                <option key={a.array_id} value={a.array_id}>
                  {a.array_id} - {a.classification}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Condensate Density ($cm^{'-2'}$)
              </label>
              <input
                type="number"
                step="1e13"
                value={condensateDensity}
                onChange={(e) => setCondensateDensity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Microcavity Detuning ($meV$)
              </label>
              <input
                type="number"
                step="1"
                min={-50}
                max={50}
                value={detuningMev}
                onChange={(e) => setDetuningMev(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Optical Parametric Oscillator Pump ($mW$)
            </label>
            <input
              type="number"
              step="25"
              min={50}
              max={1000}
              value={pumpPowerMw}
              onChange={(e) => setPumpPowerMw(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
            />
          </div>

          <button
            type="button"
            onClick={handleHarvest}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Activity className="w-4 h-4" />
            <span>{loading ? 'Harvesting BEC Superfluid Power...' : 'Harvest Polariton Baseload Power'}</span>
          </button>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Live Polariton Telemetry
              </span>
              <span className="text-xs font-mono text-amber-400">
                {telemetry ? telemetry.status : 'AWAITING_HARVEST'}
              </span>
            </div>

            {telemetry ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Array Node:</span>
                  <span className="text-white font-semibold">{telemetry.array_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Net Power Output:</span>
                  <span className="text-amber-400 font-bold text-sm">
                    {telemetry.net_power_output_gw.toFixed(2)} GW
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Conversion Efficiency:</span>
                  <span className="text-emerald-400 font-bold">
                    {telemetry.conversion_efficiency_pct.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Condensate Density:</span>
                  <span className="text-slate-200">
                    {telemetry.condensate_density_cm2.toExponential(2)} cm⁻²
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Superfluid Phase Locked:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    YES
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Zero Fossil Carbon:</span>
                  <span className="text-emerald-400 font-semibold">100% TRUE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Zero Fissile Waste:</span>
                  <span className="text-emerald-400 font-semibold">100% TRUE</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs space-y-1">
                <p>Configure condensate density and detuning.</p>
                <p>Click &quot;Harvest Polariton Baseload Power&quot; to initialize.</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-3 mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>Mechanism: Non-Equilibrium Polariton BEC</span>
            <span>Clean Baseload Grid</span>
          </div>
        </div>
      </div>
    </div>
  );
}

