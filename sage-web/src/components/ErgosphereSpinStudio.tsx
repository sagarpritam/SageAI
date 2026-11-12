'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, RefreshCw, Sparkles, Cpu, AlertTriangle, Zap } from 'lucide-react';

interface ErgosphereRotor {
  rotor_id: string;
  architecture: string;
  default_spin_a_star: number;
  default_magnetic_flux_wb: number;
  default_plasma_impedance_ohm: number;
  base_output_gw: number;
  base_efficiency_pct: number;
  status: string;
}

interface ExtractTorqueResult {
  rotor_id: string;
  architecture: string;
  spin_a_star: number;
  magnetic_flux_wb: number;
  flux_coupling_gain: number;
  superradiant_mode_m: number;
  horizon_omega_dimensionless: number;
  penrose_energy_gain_ratio: number;
  net_grid_output_gw: number;
  bz_conversion_efficiency_pct: number;
  zero_fossil_carbon: boolean;
  zero_fissile_waste: boolean;
  status: string;
  timestamp: number;
}

export default function ErgosphereSpinStudio() {
  const [rotors, setRotors] = useState<ErgosphereRotor[]>([]);
  const [selectedRotor, setSelectedRotor] = useState<string>('ERG-BZ-TOROID-01');
  const [spinAStar, setSpinAStar] = useState<number>(0.985);
  const [magneticFlux, setMagneticFlux] = useState<number>(5.0);
  const [fluxGain, setFluxGain] = useState<number>(1.45);
  const [modeM, setModeM] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<ExtractTorqueResult | null>(null);

  const fetchRotors = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ergosphere-spin-power/rotors');
      const data = (await res.json().catch(() => ({}))) as {
        rotors?: ErgosphereRotor[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load ergosphere rotors');
      }
      if (data.rotors) {
        setRotors(data.rotors);
        if (data.rotors.length > 0) {
          setSelectedRotor((prev) => prev || data.rotors![0].rotor_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load ergosphere rotors');
    }
  }, []);

  useEffect(() => {
    fetchRotors();
  }, [fetchRotors]);

  const handleExtractTorque = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ergosphere-spin-power/extract-torque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rotor_id: selectedRotor,
          spin_a_star: spinAStar,
          magnetic_flux_wb: magneticFlux * 1.0e6,
          flux_coupling_gain: fluxGain,
          superradiant_mode_m: modeM,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as ExtractTorqueResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Ergosphere torque extraction failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Ergosphere torque extraction failed'
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
              Option B (Wave 33): Superradiant Penrose-BZ Ergosphere Power Matrix
            </h2>
            <p className="text-sm text-slate-400">
              Blandford-Znajek poloidal flux torque &amp; Kerr micro-ergosphere frame-dragging clean GW baseload
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchRotors}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Rotors</span>
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
        {rotors.map((r) => (
          <button
            type="button"
            key={r.rotor_id}
            onClick={() => setSelectedRotor(r.rotor_id)}
            aria-pressed={selectedRotor === r.rotor_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedRotor === r.rotor_id
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">
                {r.rotor_id}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {r.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{r.architecture}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Kerr Spin a*:</span>
                <span className="text-emerald-300">{r.default_spin_a_star.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span>Clean Baseload:</span>
                <span className="text-cyan-300">{r.base_output_gw.toFixed(1)} GW</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Blandford-Znajek Poloidal Flux &amp; Superradiance Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Kerr Spin a*: <span className="text-emerald-300 font-mono">{spinAStar.toFixed(3)}</span>
            </label>
            <input
              type="range"
              min="0.75"
              max="0.998"
              step="0.002"
              value={spinAStar}
              onChange={(e) => setSpinAStar(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Flux (MWb): <span className="text-emerald-300 font-mono">{magneticFlux.toFixed(1)} MWb</span>
            </label>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.2"
              value={magneticFlux}
              onChange={(e) => setMagneticFlux(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Coupling Gain: <span className="text-emerald-300 font-mono">{fluxGain.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min="0.85"
              max="2.5"
              step="0.05"
              value={fluxGain}
              onChange={(e) => setFluxGain(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Harmonic Mode m: <span className="text-emerald-300 font-mono">{modeM}</span>
            </label>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={modeM}
              onChange={(e) => setModeM(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleExtractTorque}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Synchronizing Blandford-Znajek Ergosphere Flux...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Extract Clean Penrose-BZ Spin Torque to Grid</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-emerald-300">
              SUPERRADIANT PENROSE-BZ POWER TELEMETRY
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CLEAN BASELOAD</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.net_grid_output_gw.toFixed(2)} GW
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">BZ EFFICIENCY</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.bz_conversion_efficiency_pct.toFixed(2)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PENROSE GAIN</span>
              <span className="text-teal-300 font-bold text-sm">
                {telemetry.penrose_energy_gain_ratio.toFixed(4)}x
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HORIZON OMEGA_H</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.horizon_omega_dimensionless.toFixed(4)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Zero Fossil Carbon={String(telemetry.zero_fossil_carbon)} | Zero Fissile Waste={String(telemetry.zero_fissile_waste)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

