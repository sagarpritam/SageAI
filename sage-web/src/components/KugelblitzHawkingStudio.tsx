'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, RefreshCw, Shield, Sparkles, Flame, AlertTriangle } from 'lucide-react';

interface KugelblitzCore {
  core_id: string;
  location: string;
  singularity_mass_1e10_kg: number;
  confinement_ring_tesla: number;
  penrose_conversion_efficiency_pct: number;
  status: string;
}

interface HawkingHarvestResult {
  core_id: string;
  singularity_mass_kg: number;
  schwarzschild_radius_fm: number;
  hawking_temperature_tk: number;
  gross_hawking_luminosity_gw: number;
  net_electrical_output_gw: number;
  penrose_conversion_efficiency_pct: number;
  accretion_feed_mg_s: number;
  equilibrium_evaporation_mg_s: number;
  net_mass_drift_mg_s: number;
  penrose_coupling_gain: number;
  thermal_equilibrium_locked: boolean;
  zero_fissile_waste: boolean;
  status: string;
  timestamp: number;
}

export default function KugelblitzHawkingStudio() {
  const [cores, setCores] = useState<KugelblitzCore[]>([]);
  const [selectedCore, setSelectedCore] = useState<string>('KUGELBLITZ-ORBITAL-L4-01');
  const [massUnit, setMassUnit] = useState<number>(5.0);
  const [accretionFeed, setAccretionFeed] = useState<number>(1.58);
  const [penroseGain, setPenroseGain] = useState<number>(1.1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HawkingHarvestResult | null>(null);

  const fetchCores = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/kugelblitz-hawking/cores');
      const data = (await res.json().catch(() => ({}))) as {
        cores?: KugelblitzCore[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Kugelblitz cores');
      }
      if (data.cores) {
        setCores(data.cores);
        if (data.cores.length > 0) {
          setSelectedCore((prev) => prev || data.cores![0].core_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Kugelblitz cores'
      );
    }
  }, []);

  useEffect(() => {
    fetchCores();
  }, [fetchCores]);

  const handleHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/kugelblitz-hawking/harvest-power', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          core_id: selectedCore,
          singularity_mass_1e10_kg: massUnit,
          accretion_feed_mg_s: accretionFeed,
          penrose_coupling_gain: penroseGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HawkingHarvestResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Kugelblitz Hawking power harvest failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Kugelblitz Hawking power harvest failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <Flame className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-300">
              Option B Wave 29: Kugelblitz Micro-Black-Hole Hawking Power Generator
            </h2>
            <p className="text-sm text-slate-400">
              Sub-femtometer Dyson-Penrose Kugelblitz Hawking blackbody harvest (&gt;130 GW clean baseload, 0 actinide waste)
            </p>
          </div>
        </div>
        <button
          onClick={fetchCores}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Cores</span>
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
        {cores.map((c) => (
          <div
            key={c.core_id}
            onClick={() => setSelectedCore(c.core_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedCore === c.core_id
                ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-purple-400">
                {c.core_id}
              </span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                {c.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{c.location}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Singularity Mass:</span>
                <span className="text-purple-300">{c.singularity_mass_1e10_kg}e10 kg</span>
              </div>
              <div className="flex justify-between">
                <span>Containment B-Field:</span>
                <span className="text-cyan-300">{c.confinement_ring_tesla} T</span>
              </div>
              <div className="flex justify-between">
                <span>Penrose Efficiency:</span>
                <span className="text-emerald-300">{c.penrose_conversion_efficiency_pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span>Hawking Radiance &amp; Steady-State Accretion Controller</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Singularity Mass (1e10 kg):{' '}
              <span className="text-purple-300 font-mono">{massUnit}</span>
            </label>
            <input
              type="range"
              min="2.5"
              max="10.0"
              step="0.2"
              value={massUnit}
              onChange={(e) => setMassUnit(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Accretion Feed (mg/s):{' '}
              <span className="text-purple-300 font-mono">{accretionFeed}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.05"
              value={accretionFeed}
              onChange={(e) => setAccretionFeed(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Penrose Coupling Gain:{' '}
              <span className="text-purple-300 font-mono">{penroseGain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="1.8"
              step="0.05"
              value={penroseGain}
              onChange={(e) => setPenroseGain(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>

        <button
          onClick={handleHarvest}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-purple-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Harvesting Hawking Radiation Baseload...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Harvest Hawking Radiation &amp; Lock Steady Mass</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-purple-950/20 border border-purple-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-purple-300">
              KUGELBLITZ HAWKING POWER TELEMETRY
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">NET ELECTRICAL OUTPUT</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.net_electrical_output_gw.toFixed(2)} GW
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HAWKING TEMP (T_H)</span>
              <span className="text-purple-300 font-bold text-sm">
                {telemetry.hawking_temperature_tk.toFixed(3)} TK
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HORIZON RADIUS r_s</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.schwarzschild_radius_fm.toFixed(4)} fm
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PENROSE EFFICIENCY</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.penrose_conversion_efficiency_pct.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-purple-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Zero Fissile Waste | Evaporation {telemetry.equilibrium_evaporation_mg_s.toFixed(3)} mg/s | Gross Luminosity {telemetry.gross_hawking_luminosity_gw.toFixed(2)} GW
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

