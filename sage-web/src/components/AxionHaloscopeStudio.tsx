'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Atom, RefreshCw, Zap, Sparkles, Cpu, AlertTriangle } from 'lucide-react';

interface HaloscopeArray {
  array_id: string;
  location: string;
  default_magnetic_field_t: number;
  default_cavity_q_million: number;
  nominal_output_gw: number;
  base_rectification_eff_pct: number;
  status: string;
}

interface ResonateHaloscopeResult {
  array_id: string;
  location: string;
  magnetic_field_tesla: number;
  cavity_quality_q_million: number;
  axion_mass_uev: number;
  resonant_frequency_ghz: number;
  primakov_coupling_gain: number;
  coherent_rectification_eff_pct: number;
  raw_primakov_flux_gw: number;
  net_clean_baseload_gw: number;
  zero_fossil_carbon: boolean;
  zero_fissile_waste: boolean;
  status: string;
  timestamp: number;
}

export default function AxionHaloscopeStudio() {
  const [arrays, setArrays] = useState<HaloscopeArray[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>('AXION-ADMX-TOROID-01');
  const [bFieldTesla, setBFieldTesla] = useState<number>(14.0);
  const [cavityQ, setCavityQ] = useState<number>(2.8);
  const [axionMass, setAxionMass] = useState<number>(42.0);
  const [primakovGain, setPrimakovGain] = useState<number>(1.25);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<ResonateHaloscopeResult | null>(null);

  const fetchArrays = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/axion-haloscope-power/arrays');
      const data = (await res.json().catch(() => ({}))) as {
        arrays?: HaloscopeArray[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Axion Haloscope power arrays');
      }
      if (data.arrays) {
        setArrays(data.arrays);
        if (data.arrays.length > 0) {
          setSelectedArray((prev) => prev || data.arrays![0].array_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Axion Haloscope power arrays'
      );
    }
  }, []);

  useEffect(() => {
    fetchArrays();
  }, [fetchArrays]);

  const handleResonate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/axion-haloscope-power/resonate-haloscope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          array_id: selectedArray,
          magnetic_field_tesla: bFieldTesla,
          cavity_quality_q_million: cavityQ,
          axion_mass_uev: axionMass,
          primakov_coupling_gain: primakovGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as ResonateHaloscopeResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Axion Primakov cavity resonance failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Axion Primakov cavity resonance failed'
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
            <Atom className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Option B Wave 32: Planetary Axion-Quasiparticle Haloscope Power Grid
            </h2>
            <p className="text-sm text-slate-400">
              Superconducting Sikivie-Primakov E&#183;B axion-photon cavity rectification &amp; zero-carbon planetary baseload
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
              <span className="font-mono text-xs font-semibold text-emerald-400">
                {a.array_id}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {a.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{a.location}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>B-Field / Q_L:</span>
                <span className="text-emerald-300">
                  {a.default_magnetic_field_t.toFixed(1)} T / {a.default_cavity_q_million.toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between">
                <span>Nominal Baseload:</span>
                <span className="text-cyan-300">{a.nominal_output_gw.toFixed(0)} GW</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Primakov Toroidal B-Field &amp; Cryo-Cavity Tuning Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Toroidal B-Field: <span className="text-emerald-300 font-mono">{bFieldTesla.toFixed(1)} T</span>
            </label>
            <input
              type="range"
              min="8"
              max="28"
              step="0.5"
              value={bFieldTesla}
              onChange={(e) => setBFieldTesla(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Cavity Q_L: <span className="text-emerald-300 font-mono">{cavityQ.toFixed(1)}M</span>
            </label>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.2"
              value={cavityQ}
              onChange={(e) => setCavityQ(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Axion Mass: <span className="text-emerald-300 font-mono">{axionMass.toFixed(0)} ueV</span>
            </label>
            <input
              type="range"
              min="1"
              max="250"
              step="1"
              value={axionMass}
              onChange={(e) => setAxionMass(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Primakov Gain: <span className="text-emerald-300 font-mono">{primakovGain.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min="0.85"
              max="1.6"
              step="0.05"
              value={primakovGain}
              onChange={(e) => setPrimakovGain(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleResonate}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Tuning Superconducting Primakov Resonance...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Engage Coherent Axion Haloscope &amp; Rectify Clean Baseload</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-emerald-300">
              AXION-HALOSCOPE PRIMAKOV POWER TELEMETRY
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">NET CLEAN BASELOAD</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.net_clean_baseload_gw.toFixed(2)} GW
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CAVITY FREQUENCY</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.resonant_frequency_ghz.toFixed(3)} GHz
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">RECTIFICATION EFF</span>
              <span className="text-teal-300 font-bold text-sm">
                {telemetry.coherent_rectification_eff_pct.toFixed(2)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TOROIDAL B-FIELD</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.magnetic_field_tesla.toFixed(1)} T
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-300 font-mono pt-1">
            <Zap className="w-3.5 h-3.5" />
            <span>
              Zero Fossil Carbon &amp; Zero Fissile Waste | Raw Primakov Flux={telemetry.raw_primakov_flux_gw.toFixed(2)} GW
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

