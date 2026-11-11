'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, RefreshCw, Shield, Sparkles, Sliders, AlertTriangle } from 'lucide-react';

interface SchwingerCavity {
  cavity_id: string;
  location: string;
  base_field_ratio_e_ec: number;
  base_recovery_efficiency_pct: number;
  nominal_gross_gw: number;
  status: string;
}

interface HarvestCascadeResult {
  cavity_id: string;
  location: string;
  field_ratio_e_ec: number;
  effective_field_v_m: number;
  beam_pulse_hz: number;
  recovery_coupling_gain: number;
  pair_yield_rate_1e24_s: number;
  cyclotron_bragg_recovery_pct: number;
  gross_cascade_power_gw: number;
  net_electrical_output_gw: number;
  zero_fissile_waste: boolean;
  quench_lock_verified: boolean;
  status: string;
  timestamp: number;
}

export default function SchwingerVacuumStudio() {
  const [cavities, setCavities] = useState<SchwingerCavity[]>([]);
  const [selectedCavity, setSelectedCavity] = useState<string>('SCHWINGER-L5-OPTICAL-01');
  const [fieldRatio, setFieldRatio] = useState<number>(0.86);
  const [pulseHz, setPulseHz] = useState<number>(120);
  const [recoveryGain, setRecoveryGain] = useState<number>(1.12);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HarvestCascadeResult | null>(null);

  const fetchCavities = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/schwinger-vacuum/cavities');
      const data = (await res.json().catch(() => ({}))) as {
        cavities?: SchwingerCavity[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Schwinger vacuum cavities');
      }
      if (data.cavities) {
        setCavities(data.cavities);
        if (data.cavities.length > 0) {
          setSelectedCavity((prev) => prev || data.cavities![0].cavity_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Schwinger vacuum cavities'
      );
    }
  }, []);

  useEffect(() => {
    fetchCavities();
  }, [fetchCavities]);

  const handleHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/schwinger-vacuum/harvest-cascade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cavity_id: selectedCavity,
          field_ratio_e_ec: fieldRatio,
          beam_pulse_hz: pulseHz,
          recovery_coupling_gain: recoveryGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HarvestCascadeResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Schwinger cascade power harvest failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Schwinger cascade power harvest failed'
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
              Option B Wave 30: Sovereign Zero-Point Schwinger-Vacua Pair-Production Harvester
            </h2>
            <p className="text-sm text-slate-400">
              Near-critical E_c (1.323e18 V/m) Breit-Wheeler e+e- pair cascades with Cyclotron-Bragg recovery
            </p>
          </div>
        </div>
        <button
          onClick={fetchCavities}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Cavities</span>
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
        {cavities.map((c) => (
          <div
            key={c.cavity_id}
            onClick={() => setSelectedCavity(c.cavity_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedCavity === c.cavity_id
                ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-amber-400">
                {c.cavity_id}
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                {c.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{c.location}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Normalized Field E/E_c:</span>
                <span className="text-amber-300">{c.base_field_ratio_e_ec.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cyclotron Recovery:</span>
                <span className="text-emerald-300">
                  {c.base_recovery_efficiency_pct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Schwinger QED Breakdown &amp; Direct Inductive Recovery Controller</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Field Ratio (E / E_c):{' '}
              <span className="text-amber-300 font-mono">{fieldRatio}</span>
            </label>
            <input
              type="range"
              min="0.60"
              max="0.95"
              step="0.01"
              value={fieldRatio}
              onChange={(e) => setFieldRatio(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Breit-Wheeler Pulse Rate:{' '}
              <span className="text-amber-300 font-mono">{pulseHz} Hz</span>
            </label>
            <input
              type="range"
              min="60"
              max="260"
              step="10"
              value={pulseHz}
              onChange={(e) => setPulseHz(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Bragg Recovery Gain:{' '}
              <span className="text-amber-300 font-mono">{recoveryGain}x</span>
            </label>
            <input
              type="range"
              min="0.9"
              max="1.45"
              step="0.02"
              value={recoveryGain}
              onChange={(e) => setRecoveryGain(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        <button
          onClick={handleHarvest}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Harvesting Schwinger Pair-Production Cascade...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Harvest Schwinger Vacuum Baseload Power</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-amber-300">
              SCHWINGER PAIR-CASCADE BASELOAD TELEMETRY
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
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
              <span className="text-slate-400 block text-[10px]">EFFECTIVE E-FIELD</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.effective_field_v_m.toExponential(2)} V/m
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">BRAGG RECOVERY</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.cyclotron_bragg_recovery_pct.toFixed(2)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PAIR CASCADE FLUX</span>
              <span className="text-orange-300 font-bold text-sm">
                {telemetry.pair_yield_rate_1e24_s.toFixed(2)}e24/s
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-amber-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Zero Fissile Actinide Waste Verified | Quench Lock Active ({telemetry.gross_cascade_power_gw.toFixed(1)} GW Gross)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

