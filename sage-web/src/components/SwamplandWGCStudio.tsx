'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, RefreshCw, Sparkles, Cpu, AlertTriangle, Compass } from 'lucide-react';

interface SwamplandBound {
  bound_id: string;
  regime: string;
  default_field_excursion_mpl: number;
  default_alpha_exponent: number;
  default_charge_mass_ratio: number;
  base_uv_fidelity_pct: number;
  base_eft_suppression_db: number;
  status: string;
}

interface AuditEFTResult {
  bound_id: string;
  regime: string;
  field_excursion_mpl: number;
  alpha_exponent: number;
  charge_mass_ratio: number;
  species_cutoff_gain: number;
  tower_mass_ratio_mpl: number;
  species_scale_mpl: number;
  swampland_eft_residual: number;
  uv_suppression_db: number;
  uv_completion_fidelity_pct: number;
  wgc_sublattice_satisfied: boolean;
  status: string;
  timestamp: number;
}

export default function SwamplandWGCStudio() {
  const [bounds, setBounds] = useState<SwamplandBound[]>([]);
  const [selectedBound, setSelectedBound] = useState<string>('SWL-DISTANCE-TOWER-01');
  const [fieldExcursion, setFieldExcursion] = useState<number>(2.0);
  const [alphaExp, setAlphaExp] = useState<number>(0.707);
  const [chargeRatio, setChargeRatio] = useState<number>(1.25);
  const [speciesGain, setSpeciesGain] = useState<number>(1.4);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<AuditEFTResult | null>(null);

  const fetchBounds = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/swampland-wgc/bounds');
      const data = (await res.json().catch(() => ({}))) as {
        bounds?: SwamplandBound[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Swampland WGC bounds');
      }
      if (data.bounds) {
        setBounds(data.bounds);
        if (data.bounds.length > 0) {
          setSelectedBound((prev) => prev || data.bounds![0].bound_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Swampland WGC bounds'
      );
    }
  }, []);

  useEffect(() => {
    fetchBounds();
  }, [fetchBounds]);

  const handleAuditEFT = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/swampland-wgc/audit-eft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bound_id: selectedBound,
          field_excursion_mpl: fieldExcursion,
          alpha_exponent: alphaExp,
          charge_mass_ratio: chargeRatio,
          species_cutoff_gain: speciesGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as AuditEFTResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Swampland WGC EFT audit failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Swampland WGC EFT audit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
            <Compass className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-teal-300">
              Capability 119: Swampland Distance &amp; Weak Gravity EFT Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Exponential KK tower bounds m ~ exp(-alpha * dPhi), sublattice WGC extremity (z &gt;= 1) &amp; species scale UV lock
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchBounds}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Regimes</span>
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
        {bounds.map((b) => (
          <button
            type="button"
            key={b.bound_id}
            onClick={() => setSelectedBound(b.bound_id)}
            aria-pressed={selectedBound === b.bound_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedBound === b.bound_id
                ? 'bg-teal-950/40 border-teal-500/60 shadow-lg shadow-teal-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-teal-400">
                {b.bound_id}
              </span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono">
                {b.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{b.regime}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>WGC Extremality:</span>
                <span className="text-teal-300">z={b.default_charge_mass_ratio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>UV Fidelity:</span>
                <span className="text-cyan-300">{b.base_uv_fidelity_pct.toFixed(3)}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-teal-400" />
          <span>Moduli Excursion &amp; Sublattice WGC Firewall Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Excursion dPhi: <span className="text-teal-300 font-mono">{fieldExcursion.toFixed(1)} M_Pl</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="8.0"
              step="0.1"
              value={fieldExcursion}
              onChange={(e) => setFieldExcursion(parseFloat(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Tower Alpha: <span className="text-teal-300 font-mono">{alphaExp.toFixed(3)}</span>
            </label>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.01"
              value={alphaExp}
              onChange={(e) => setAlphaExp(parseFloat(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              WGC Ratio z: <span className="text-teal-300 font-mono">{chargeRatio.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="1.0"
              max="4.0"
              step="0.05"
              value={chargeRatio}
              onChange={(e) => setChargeRatio(parseFloat(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Species Gain: <span className="text-teal-300 font-mono">{speciesGain.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min="0.85"
              max="2.5"
              step="0.05"
              value={speciesGain}
              onChange={(e) => setSpeciesGain(parseFloat(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAuditEFT}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-teal-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Auditing Swampland Distance &amp; WGC Bounds...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Audit EFT UV Completion &amp; Seal Swampland Firewall</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-teal-950/20 border border-teal-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-teal-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-teal-300">
              SWAMPLAND WGC UV COMPLETION TELEMETRY
            </span>
            <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">UV FIDELITY</span>
              <span className="text-teal-300 font-bold text-sm">
                {telemetry.uv_completion_fidelity_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TOWER MASS</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.tower_mass_ratio_mpl.toFixed(4)} M_Pl
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">EFT QUENCH</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.uv_suppression_db.toFixed(1)} dB
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">SWAMPLAND RESIDUAL</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.swampland_eft_residual.toExponential(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-teal-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Sublattice WGC Satisfied | Species Cutoff={telemetry.species_scale_mpl} M_Pl
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

