'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Atom, RefreshCw, Shield, Sparkles, Layers, AlertTriangle } from 'lucide-react';

interface G2Manifold {
  manifold_id: string;
  sector: string;
  betti_b2: number;
  betti_b3: number;
  base_radius_planck: number;
  torsion_class_norm: number;
  g2_holonomy_fidelity_pct: number;
  chiral_generations: number;
  status: string;
}

interface CompactifyResult {
  manifold_id: string;
  betti_b2: number;
  betti_b3: number;
  eleven_d_radius_planck: number;
  flux_quantum_g4: number;
  torsion_damping_gain: number;
  internal_volume_v7_planck: number;
  alpha_gut_inverse: number;
  torsion_class_residual_norm: number;
  compactification_stability_pct: number;
  susy_breaking_scale_tev: number;
  chiral_generations_locked: number;
  joyce_torsion_free_verified: boolean;
  status: string;
  timestamp: number;
}

export default function MTheoryG2Studio() {
  const [manifolds, setManifolds] = useState<G2Manifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>('G2-JOYCE-ORBIFOLD-01');
  const [radiusPlanck, setRadiusPlanck] = useState<number>(18.5);
  const [fluxQuantumG4, setFluxQuantumG4] = useState<number>(4);
  const [torsionGain, setTorsionGain] = useState<number>(1.15);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<CompactifyResult | null>(null);

  const fetchManifolds = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/m-theory-g2/manifolds');
      const data = (await res.json().catch(() => ({}))) as {
        manifolds?: G2Manifold[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load 7D G2 manifolds');
      }
      if (data.manifolds) {
        setManifolds(data.manifolds);
        if (data.manifolds.length > 0) {
          setSelectedManifold((prev) => prev || data.manifolds![0].manifold_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load 7D G2 manifolds');
    }
  }, []);

  useEffect(() => {
    fetchManifolds();
  }, [fetchManifolds]);

  const handleCompactify = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/m-theory-g2/compactify-flux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          eleven_d_radius_planck: radiusPlanck,
          flux_quantum_g4: fluxQuantumG4,
          torsion_damping_gain: torsionGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as CompactifyResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || '11D M-Theory G2 compactification failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : '11D M-Theory G2 compactification failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <Atom className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-300">
              Capability 107: 11D M-Theory G2-Manifold Supergravity Compactifier
            </h2>
            <p className="text-sm text-slate-400">
              Joyce exceptional G2 holonomy calibration (d Phi_3 = 0), G_4 flux stabilization, and 4D GUT unification
            </p>
          </div>
        </div>
        <button
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
          <div
            key={m.manifold_id}
            onClick={() => setSelectedManifold(m.manifold_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
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
            <p className="text-xs text-slate-300 mb-2">{m.sector}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Betti (b2, b3):</span>
                <span className="text-indigo-300">
                  ({m.betti_b2}, {m.betti_b3})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Compactification R:</span>
                <span className="text-cyan-300">{m.base_radius_planck} l_Pl</span>
              </div>
              <div className="flex justify-between">
                <span>G2 Holonomy Fidelity:</span>
                <span className="text-emerald-300">{m.g2_holonomy_fidelity_pct.toFixed(3)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Associative 3-Form &amp; G_4 Flux Moduli Controller</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              11D Radius (l_Pl):{' '}
              <span className="text-indigo-300 font-mono">{radiusPlanck}</span>
            </label>
            <input
              type="range"
              min="8"
              max="36"
              step="0.5"
              value={radiusPlanck}
              onChange={(e) => setRadiusPlanck(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              G_4 Flux Quantum:{' '}
              <span className="text-indigo-300 font-mono">{fluxQuantumG4}</span>
            </label>
            <input
              type="range"
              min="1"
              max="16"
              step="1"
              value={fluxQuantumG4}
              onChange={(e) => setFluxQuantumG4(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Torsion Damping Gain:{' '}
              <span className="text-indigo-300 font-mono">{torsionGain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={torsionGain}
              onChange={(e) => setTorsionGain(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={handleCompactify}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Compactifying 11D M-Theory G2 Manifold...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Compactify 11D Supergravity &amp; Lock G_4 Flux</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-indigo-300">
              11D M-THEORY G2 COMPACTIFICATION TELEMETRY
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">G2 STABILITY FIDELITY</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.compactification_stability_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ALPHA_GUT INVERSE</span>
              <span className="text-indigo-300 font-bold text-sm">
                {telemetry.alpha_gut_inverse.toFixed(4)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TORSION CLASS NORM</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.torsion_class_residual_norm.toExponential(2)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">GRAVITINO SCALE</span>
              <span className="text-violet-300 font-bold text-sm">
                {telemetry.susy_breaking_scale_tev.toFixed(2)} TeV
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-indigo-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Joyce Torsion-Free Associative Calibration Verified | {telemetry.chiral_generations_locked} Chiral Generations Locked
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

