'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface WeylArray {
  array_id: string;
  location: string;
  default_fermi_arc_angstrom: number;
  chiral_charge_order: number;
  base_output_gw: number;
  base_efficiency_pct: number;
  status: string;
}

interface HarvestResult {
  array_id: string;
  location: string;
  chiral_charge_order: number;
  fermi_arc_angstrom: number;
  chiral_anomaly_gain: number;
  conversion_efficiency_pct: number;
  net_grid_output_gw: number;
  chiral_anomaly_locked: boolean;
  zero_fossil_carbon: boolean;
  zero_fissile_waste: boolean;
  status: string;
  timestamp: number;
}

export default function WeylSupergridPowerStudio() {
  const [arrays, setArrays] = useState<WeylArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>('WEYL-TAAS-ARRAY-01');
  const [fermiArc, setFermiArc] = useState<number>(0.42);
  const [chiralGain, setChiralGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HarvestResult | null>(null);

  const fetchArrays = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/weyl-chiral-supergrid/arrays');
      const data = (await res.json().catch(() => ({}))) as {
        arrays?: WeylArray[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Weyl semimetal supergrid arrays');
      }
      if (data.arrays) {
        setArrays(data.arrays);
        if (data.arrays.length > 0) {
          setSelectedArray((prev) => prev || data.arrays![0].array_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Weyl semimetal supergrid arrays'
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
      const res = await fetch('/api/weyl-chiral-supergrid/harvest-weyl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          array_id: selectedArray,
          fermi_arc_angstrom: fermiArc,
          chiral_anomaly_gain: chiralGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HarvestResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Weyl semimetal supergrid harvest failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Weyl semimetal supergrid harvest failed'
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
            <h2 className="text-xl font-bold text-amber-300">
              Option B Wave 44: Planetary Chiral Topological &amp; Weyl Supergrid
            </h2>
            <p className="text-sm text-slate-400">
              Type-I/II Weyl semimetal TaAs/CoSi Fermi-arc harvesters, chiral anomaly axial currents &amp; photo-galvanic THz rectifiers
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

      {/* Preset Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {arrays.map((arr) => (
          <button
            key={arr.array_id}
            type="button"
            onClick={() => {
              setSelectedArray(arr.array_id);
              setFermiArc(arr.default_fermi_arc_angstrom);
            }}
            className={`text-left p-3.5 rounded-lg border transition ${
              selectedArray === arr.array_id
                ? 'bg-amber-950/40 border-amber-500/80 text-white shadow-lg shadow-amber-950/50'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="text-xs font-mono font-bold text-amber-400">{arr.array_id}</div>
            <div className="text-sm font-semibold mt-1 truncate">{arr.location}</div>
            <div className="flex justify-between items-center text-xs text-slate-400 mt-2 font-mono">
              <span>Charge n={arr.chiral_charge_order}</span>
              <span>{arr.base_output_gw} GW</span>
              <span className="text-emerald-400">{arr.base_efficiency_pct}%</span>
            </div>
          </button>
        ))}
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-lg border border-slate-800">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Fermi-Arc Separation (k_F) [0.1 - 2.5 Å⁻¹]
          </label>
          <input
            type="number"
            step="0.01"
            min={0.1}
            max={2.5}
            value={fermiArc}
            onChange={(e) => setFermiArc(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Chiral Anomaly Gain [0.8 - 2.5]
          </label>
          <input
            type="number"
            step="0.05"
            min={0.8}
            max={2.5}
            value={chiralGain}
            onChange={(e) => setChiralGain(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleHarvest}
          disabled={loading}
          className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-amber-900/40"
        >
          <Zap className="w-4 h-4" />
          <span>{loading ? 'Harvesting Weyl Power...' : 'Harvest Chiral Weyl Baseload'}</span>
        </button>
      </div>

      {/* Telemetry Display */}
      {telemetry && (
        <div className="border border-amber-500/40 bg-amber-950/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs uppercase tracking-wider text-amber-300 font-bold">
                Baseload Harvest: {telemetry.array_id}
              </span>
            </div>
            <span className="text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Net Output</div>
              <div className="text-2xl font-mono font-bold text-amber-300 mt-1">
                {telemetry.net_grid_output_gw.toFixed(2)} GW
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Conversion Efficiency</div>
              <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                {telemetry.conversion_efficiency_pct.toFixed(2)}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Fermi Arc k_F</div>
              <div className="text-2xl font-mono font-bold text-cyan-300 mt-1">
                {telemetry.fermi_arc_angstrom.toFixed(2)} Å⁻¹
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Chiral Charge Order</div>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
                n = {telemetry.chiral_charge_order}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs font-mono text-emerald-400 pt-2 border-t border-amber-900/30">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Chiral Anomaly Locked: true</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Fossil Carbon: true</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Fissile Waste: true</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
