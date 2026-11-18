'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MajoranaArray {
  array_id: string;
  location: string;
  nanowire_material: string;
  num_nanowires: number;
  topological_gap_mev: number;
  zero_bias_conductance_g0: number;
  base_output_mw: number;
  status: string;
}

interface HarvestResult {
  array_id: string;
  location: string;
  nanowire_material: string;
  zeeman_field_tesla: number;
  topological_criterion_met: boolean;
  harvested_power_mw: number;
  quantized_conductance_g0: string;
  conductance_fidelity_pct: number;
  grid_stabilization_status: string;
  timestamp: number;
}

export default function MajoranaZeroModePowerStudio() {
  const [arrays, setArrays] = useState<MajoranaArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>('MZM-KODIAK-INAS-01');
  const [zeemanField, setZeemanField] = useState<number>(1.25);
  const [chemicalPotential, setChemicalPotential] = useState<number>(0.5);
  const [supercurrentBias, setSupercurrentBias] = useState<number>(4.2);
  const [gridGain, setGridGain] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HarvestResult | null>(null);

  const fetchArrays = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/majorana-supergrid-power/arrays');
      const data = (await res.json().catch(() => ({}))) as {
        arrays?: MajoranaArray[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Majorana Supergrid arrays');
      }
      if (data.arrays) {
        setArrays(data.arrays);
        if (data.arrays.length > 0) {
          setSelectedArray((prev) => prev || data.arrays![0].array_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading Majorana arrays';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchArrays();
  }, [fetchArrays]);

  const handleHarvestMajorana = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/majorana-supergrid-power/harvest-majorana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          array_id: selectedArray,
          zeeman_field_tesla: zeemanField,
          chemical_potential_mu_mev: chemicalPotential,
          supercurrent_bias_ma: supercurrentBias,
          grid_gain: gridGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HarvestResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to harvest Majorana power');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error harvesting Majorana energy';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-violet-500/30 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-950/60 border border-violet-500/40 text-violet-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">
              Majorana Zero Mode Supergrid Power Studio
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Option B Wave 47: 2e&sup2;/h Quantized Conductance Peak &amp; Planetary Clean Superconducting Power
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchArrays}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload Arrays
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300 font-mono">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-zinc-400 block mb-1.5">
              Select Majorana Nanowire Supergrid Array:
            </label>
            <select
              value={selectedArray}
              onChange={(e) => setSelectedArray(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-200 focus:border-violet-500 focus:outline-none"
            >
              {arrays.map((a) => (
                <option key={a.array_id} value={a.array_id}>
                  {a.array_id} — {a.location} ({a.base_output_mw} MW)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Zeeman Field (Tesla): {zeemanField} T
              </label>
              <input
                type="range"
                min={0.2}
                max={4.0}
                step={0.05}
                value={zeemanField}
                onChange={(e) => setZeemanField(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Chemical Potential (&mu;): {chemicalPotential} meV
              </label>
              <input
                type="range"
                min={0.0}
                max={2.0}
                step={0.05}
                value={chemicalPotential}
                onChange={(e) => setChemicalPotential(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Supercurrent Bias: {supercurrentBias} mA
              </label>
              <input
                type="number"
                min={0.1}
                max={20.0}
                step={0.1}
                value={supercurrentBias}
                onChange={(e) => setSupercurrentBias(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-200"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Grid Gain: {gridGain}x
              </label>
              <input
                type="number"
                min={0.1}
                max={5.0}
                step={0.1}
                value={gridGain}
                onChange={(e) => setGridGain(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-200"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleHarvestMajorana}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-500 py-2.5 px-4 text-xs font-bold font-mono text-white transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Harvest Quantized Majorana Zero Mode Power
          </button>
        </div>

        {/* Telemetry Panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-zinc-400 font-bold">MAJORANA ZERO MODE TELEMETRY</span>
            {telemetry && (
              <span className="flex items-center gap-1 text-[11px] text-violet-400 font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> 2e&sup2;/h QUANTIZED
              </span>
            )}
          </div>

          {telemetry ? (
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Array ID:</span>
                <span className="text-white font-bold">{telemetry.array_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Conductance Peak:</span>
                <span className="text-violet-400 font-bold">{telemetry.quantized_conductance_g0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Harvested Power Output:</span>
                <span className="text-emerald-400 font-bold">{telemetry.harvested_power_mw.toLocaleString()} MW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Conductance Fidelity:</span>
                <span className="text-violet-400 font-bold">{telemetry.conductance_fidelity_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Topological Phase:</span>
                <span className={telemetry.topological_criterion_met ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                  {telemetry.topological_criterion_met ? "PROTECTED GAP OPEN" : "SUB-CRITICAL"}
                </span>
              </div>
              <div className="p-2 rounded bg-black/60 border border-zinc-800 text-[10px] text-zinc-400">
                Topological criterion: V<sub>z</sub> &gt; &radic;(&Delta;&sup2; + &mu;&sup2;) verified across InAs/Al junction.
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-600 text-center">
              Trigger a harvest cycle to stream planetary Majorana zero mode telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
