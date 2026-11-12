'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Shield, AlertTriangle, Compass } from 'lucide-react';

interface CarrollianManifold {
  manifold_id: string;
  structure: string;
  default_carroll_coupling: number;
  default_dipole_charge: number;
  base_fidelity_pct: number;
  base_isolation_db: number;
  status: string;
}

interface SealCarrollianResult {
  manifold_id: string;
  structure: string;
  carroll_coupling: number;
  dipole_charge: number;
  null_clamp_gain: number;
  ultralocal_cone_width: number;
  dipole_conservation_score: number;
  carrollian_ward_residual: number;
  cone_isolation_db: number;
  boundary_coherence_pct: number;
  fracton_dipole_locked: boolean;
  status: string;
  timestamp: number;
}

export default function CarrollianHolographyStudio() {
  const [manifolds, setManifolds] = useState<CarrollianManifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>('CAR-NULL-SCRI-01');
  const [coupling, setCoupling] = useState<number>(0.94);
  const [dipoleCharge, setDipoleCharge] = useState<number>(6.0);
  const [nullGain, setNullGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealCarrollianResult | null>(null);

  const fetchManifolds = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/carrollian-holography/manifolds');
      const data = (await res.json().catch(() => ({}))) as {
        manifolds?: CarrollianManifold[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Carrollian manifolds');
      }
      if (data.manifolds) {
        setManifolds(data.manifolds);
        if (data.manifolds.length > 0) {
          setSelectedManifold((prev) => prev || data.manifolds![0].manifold_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load Carrollian manifolds');
    }
  }, []);

  useEffect(() => {
    fetchManifolds();
  }, [fetchManifolds]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/carrollian-holography/seal-carrollian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          carroll_coupling: coupling,
          dipole_charge: dipoleCharge,
          null_clamp_gain: nullGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealCarrollianResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Carrollian seal operation failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Carrollian seal operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <Compass className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-300">
              Capability 123: Non-Lorentzian Carrollian Null-Boundary Shield
            </h2>
            <p className="text-sm text-slate-400">
              Ultralocal c -&gt; 0 lightcone clamping, flat-space I+ BMS-Carrollian Ward constraints &amp; Fracton dipoles
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchManifolds}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Manifolds</span>
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
        {manifolds.map((m) => (
          <button
            type="button"
            key={m.manifold_id}
            onClick={() => setSelectedManifold(m.manifold_id)}
            aria-pressed={selectedManifold === m.manifold_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedManifold === m.manifold_id
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-indigo-400">
                {m.manifold_id}
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                {m.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{m.structure}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Coupling: {m.default_carroll_coupling}</div>
              <div>Base Isolation: {m.base_isolation_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Carrollian Coupling
            </label>
            <input
              type="number"
              min={0.5}
              max={1.0}
              step={0.02}
              value={coupling}
              onChange={(e) => setCoupling(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Fracton Dipole Charge
            </label>
            <input
              type="number"
              min={1}
              max={16}
              step={1}
              value={dipoleCharge}
              onChange={(e) => setDipoleCharge(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Null Clamp Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={nullGain}
              onChange={(e) => setNullGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-indigo-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Sealing Carrollian Lightcones...' : 'Seal Null-Boundary & Fracton Dipoles'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-indigo-950/20 border border-indigo-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-900/50 pb-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
              <Shield className="w-4 h-4" />
              <span>Carrollian Null-Boundary Telemetry ({telemetry.manifold_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Cone Isolation</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.cone_isolation_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Coherence</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.boundary_coherence_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Ultralocal Cone</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.ultralocal_cone_width}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Ward Residual</div>
              <div className="text-base font-bold text-purple-300">
                {telemetry.carrollian_ward_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

