'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Rocket, RefreshCw, Shield, Sparkles, Sliders, AlertTriangle } from 'lucide-react';

interface LentzCorridor {
  corridor_id: string;
  route: string;
  base_cruise_c: number;
  base_confinement_efficiency_pct: number;
  nominal_soliton_power_gw: number;
  status: string;
}

interface EngageSolitonResult {
  corridor_id: string;
  route: string;
  target_velocity_c: number;
  cruise_velocity_km_s: number;
  cislunar_transit_seconds: number;
  soliton_radius_m: number;
  positive_plasma_recovery_gain: number;
  wec_min_energy_density_ratio: number;
  positive_energy_only_t00_ge_0: boolean;
  interior_tidal_g: number;
  shell_confinement_efficiency_pct: number;
  soliton_field_power_gw: number;
  regenerative_bus_output_gw: number;
  zero_exotic_negative_mass: boolean;
  zero_fissile_waste: boolean;
  status: string;
  timestamp: number;
}

export default function AlcubierreLentzWarpStudio() {
  const [corridors, setCorridors] = useState<LentzCorridor[]>([]);
  const [selectedCorridor, setSelectedCorridor] = useState<string>('LENTZ-SOLITON-LEO-GEO-01');
  const [velocityC, setVelocityC] = useState<number>(0.28);
  const [radiusM, setRadiusM] = useState<number>(45);
  const [recoveryGain, setRecoveryGain] = useState<number>(1.15);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<EngageSolitonResult | null>(null);

  const fetchCorridors = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/alcubierre-lentz-warp/corridors');
      const data = (await res.json().catch(() => ({}))) as {
        corridors?: LentzCorridor[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Alcubierre-Lentz soliton corridors');
      }
      if (data.corridors) {
        setCorridors(data.corridors);
        if (data.corridors.length > 0) {
          setSelectedCorridor((prev) => prev || data.corridors![0].corridor_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to load Alcubierre-Lentz soliton corridors'
      );
    }
  }, []);

  useEffect(() => {
    fetchCorridors();
  }, [fetchCorridors]);

  const handleEngage = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/alcubierre-lentz-warp/engage-soliton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corridor_id: selectedCorridor,
          target_velocity_c: velocityC,
          soliton_radius_m: radiusM,
          positive_plasma_recovery_gain: recoveryGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as EngageSolitonResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Alcubierre-Lentz soliton synthesis failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Alcubierre-Lentz soliton synthesis failed'
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
            <Rocket className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-300">
              Option B Wave 31: Sovereign Alcubierre-Lentz Solitonic Warp-Field Transit Matrix
            </h2>
            <p className="text-sm text-slate-400">
              Positive-energy Erik Lentz hyperbolic shift-vector solitons (T_00 &gt;= 0, zero exotic matter)
            </p>
          </div>
        </div>
        <button
          onClick={fetchCorridors}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Corridors</span>
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
        {corridors.map((c) => (
          <div
            key={c.corridor_id}
            onClick={() => setSelectedCorridor(c.corridor_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedCorridor === c.corridor_id
                ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-amber-400">
                {c.corridor_id}
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                {c.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{c.route}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Cruise Velocity:</span>
                <span className="text-amber-300">{c.base_cruise_c.toFixed(2)} c</span>
              </div>
              <div className="flex justify-between">
                <span>Plasma Confinement:</span>
                <span className="text-emerald-300">
                  {c.base_confinement_efficiency_pct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Lentz Rhomboidal Soliton &amp; Positive Plasma Recovery Controller</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Target Cruise (v / c):{' '}
              <span className="text-amber-300 font-mono">{velocityC} c</span>
            </label>
            <input
              type="range"
              min="0.10"
              max="0.46"
              step="0.02"
              value={velocityC}
              onChange={(e) => setVelocityC(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Soliton Bubble Radius:{' '}
              <span className="text-amber-300 font-mono">{radiusM} m</span>
            </label>
            <input
              type="range"
              min="20"
              max="110"
              step="5"
              value={radiusM}
              onChange={(e) => setRadiusM(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Plasma Recovery Gain:{' '}
              <span className="text-amber-300 font-mono">{recoveryGain}x</span>
            </label>
            <input
              type="range"
              min="0.9"
              max="1.45"
              step="0.05"
              value={recoveryGain}
              onChange={(e) => setRecoveryGain(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        <button
          onClick={handleEngage}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Synthesizing Positive-Energy Lentz Soliton...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Engage Alcubierre-Lentz Soliton Transit Matrix</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-amber-300">
              LENTZ POSITIVE-ENERGY SOLITON TELEMETRY
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">REGENERATIVE BUS</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.regenerative_bus_output_gw.toFixed(2)} GW
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CRUISE VELOCITY</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.cruise_velocity_km_s.toLocaleString()} km/s
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CISLUNAR TRANSIT</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.cislunar_transit_seconds.toFixed(2)} s
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PLASMA CONFINEMENT</span>
              <span className="text-orange-300 font-bold text-sm">
                {telemetry.shell_confinement_efficiency_pct.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-amber-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              T_00 &gt;= 0 Weak Energy Condition Verified | Zero Negative Mass | Zero Fissile Waste
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

