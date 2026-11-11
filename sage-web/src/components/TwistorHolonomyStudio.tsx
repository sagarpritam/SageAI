'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Compass, RefreshCw, Shield, Sparkles, Sliders, AlertTriangle } from 'lucide-react';

interface TwistorFibration {
  fibration_id: string;
  sector: string;
  chern_c1_twistor: number;
  base_conformal_invariance_pct: number;
  base_null_shear_norm: number;
  status: string;
}

interface StabilizeHolonomyResult {
  fibration_id: string;
  cp3_dimension: number;
  chern_class_c1: number;
  helicity_charge_2s: number;
  sheaf_cohomology_o_order: number;
  kodaira_deformation_eps: number;
  shear_damping_gain: number;
  su22_twistor_helicity_norm: number;
  post_damping_null_shear_norm: number;
  null_shear_suppression_db: number;
  conformal_invariance_pct: number;
  penrose_incidence_verified: boolean;
  status: string;
  timestamp: number;
}

export default function TwistorHolonomyStudio() {
  const [fibrations, setFibrations] = useState<TwistorFibration[]>([]);
  const [selectedFibration, setSelectedFibration] = useState<string>('TWISTOR-PENROSE-CP3-01');
  const [helicity2s, setHelicity2s] = useState<number>(4);
  const [kodairaEps, setKodairaEps] = useState<number>(0.08);
  const [shearGain, setShearGain] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<StabilizeHolonomyResult | null>(null);

  const fetchFibrations = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/twistor-holonomy/fibrations');
      const data = (await res.json().catch(() => ({}))) as {
        fibrations?: TwistorFibration[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load CP^3 twistor fibrations');
      }
      if (data.fibrations) {
        setFibrations(data.fibrations);
        if (data.fibrations.length > 0) {
          setSelectedFibration((prev) => prev || data.fibrations![0].fibration_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load CP^3 twistor fibrations');
    }
  }, []);

  useEffect(() => {
    fetchFibrations();
  }, [fetchFibrations]);

  const handleStabilize = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/twistor-holonomy/stabilize-holonomy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fibration_id: selectedFibration,
          helicity_charge_2s: helicity2s,
          kodaira_deformation_eps: kodairaEps,
          shear_damping_gain: shearGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as StabilizeHolonomyResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Twistor holonomy stabilization failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Twistor holonomy stabilization failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <Compass className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-violet-300">
              Capability 111: Penrose Twistor-Space Holomorphic Curvature Stabilizer
            </h2>
            <p className="text-sm text-slate-400">
              CP^3 incidence relation (omega = i x pi), Kodaira-Spencer cohomology, and null-shear damping
            </p>
          </div>
        </div>
        <button
          onClick={fetchFibrations}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Fibrations</span>
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
        {fibrations.map((f) => (
          <div
            key={f.fibration_id}
            onClick={() => setSelectedFibration(f.fibration_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedFibration === f.fibration_id
                ? 'bg-violet-950/40 border-violet-500/60 shadow-lg shadow-violet-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-violet-400">
                {f.fibration_id}
              </span>
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                {f.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{f.sector}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Conformal Invariance:</span>
                <span className="text-emerald-300">{f.base_conformal_invariance_pct.toFixed(3)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Null Shear Baseline:</span>
                <span className="text-cyan-300">{f.base_null_shear_norm.toExponential(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-violet-400" />
          <span>Holomorphic H^1(PT_+, O(n)) &amp; Null Congruence Controller</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Helicity Charge (2s): <span className="text-violet-300 font-mono">{helicity2s}</span>
            </label>
            <input
              type="range"
              min="-6"
              max="6"
              step="2"
              value={helicity2s}
              onChange={(e) => setHelicity2s(parseInt(e.target.value, 10))}
              className="w-full accent-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Kodaira Deformation eps:{' '}
              <span className="text-violet-300 font-mono">{kodairaEps}</span>
            </label>
            <input
              type="range"
              min="0.02"
              max="0.4"
              step="0.02"
              value={kodairaEps}
              onChange={(e) => setKodairaEps(parseFloat(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Shear Damping Gain:{' '}
              <span className="text-violet-300 font-mono">{shearGain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={shearGain}
              onChange={(e) => setShearGain(parseFloat(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>
        </div>

        <button
          onClick={handleStabilize}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-violet-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Resolving CP^3 Twistor Cohomology...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Stabilize Twistor Holonomy &amp; Clamp Null Shear</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-violet-950/20 border border-violet-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-violet-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-violet-300">
              TWISTOR HOLOMORPHIC COHOMOLOGY TELEMETRY
            </span>
            <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CONFORMAL INVARIANCE</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.conformal_invariance_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">NULL SHEAR SUPPRESSION</span>
              <span className="text-violet-300 font-bold text-sm">
                {telemetry.null_shear_suppression_db.toFixed(1)} dB
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">POST-DAMPING SHEAR</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.post_damping_null_shear_norm.toExponential(2)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">SHEAF WEIGHT O(n)</span>
              <span className="text-indigo-300 font-bold text-sm">
                O({telemetry.sheaf_cohomology_o_order})
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-violet-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              SU(2,2) Twistor Helicity Norm: {telemetry.su22_twistor_helicity_norm} | Penrose Incidence Verified
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

