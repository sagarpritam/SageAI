'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ChiralAlgebra {
  algebra_id: string;
  classification: string;
  default_algebra_level_k: number;
  default_curve_points_n: number;
  default_factorization_depth: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  algebra_id: string;
  classification: string;
  algebra_level_k: number;
  curve_points_n: number;
  factorization_depth: number;
  chiral_gain: number;
  chiral_factorization_residual: number;
  beilinson_fusion_coherence: number;
  chiral_suppression_db: number;
  conformal_unitarity_pct: number;
  chiral_homology_locked: boolean;
  status: string;
  timestamp: number;
}

export default function BeilinsonDrinfeldStudio() {
  const [algebras, setAlgebras] = useState<ChiralAlgebra[]>([]);
  const [selectedAlgebra, setSelectedAlgebra] = useState<string>('CHIRAL-SL2-AFFINE-01');
  const [levelK, setLevelK] = useState<number>(4);
  const [pointsN, setPointsN] = useState<number>(4);
  const [factorizationDepth, setFactorizationDepth] = useState<number>(6);
  const [chiralGain, setChiralGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchAlgebras = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/beilinson-drinfeld-chiral/algebras');
      const data = (await res.json().catch(() => ({}))) as {
        algebras?: ChiralAlgebra[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Beilinson-Drinfeld chiral algebras');
      }
      if (data.algebras) {
        setAlgebras(data.algebras);
        if (data.algebras.length > 0) {
          setSelectedAlgebra((prev) => prev || data.algebras![0].algebra_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Beilinson-Drinfeld chiral algebras'
      );
    }
  }, []);

  useEffect(() => {
    fetchAlgebras();
  }, [fetchAlgebras]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/beilinson-drinfeld-chiral/seal-chiral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algebra_id: selectedAlgebra,
          algebra_level_k: levelK,
          curve_points_n: pointsN,
          factorization_depth: factorizationDepth,
          chiral_gain: chiralGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Beilinson-Drinfeld chiral seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Beilinson-Drinfeld chiral seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-300">
              Capability 157: Beilinson-Drinfeld Grassmannian &amp; Chiral Homology Shield
            </h2>
            <p className="text-sm text-slate-400">
              Affine Grassmannian factorization Gr_G -&gt; X^I, chiral OPE commutators &amp; KZ conformal block monodromy
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchAlgebras}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-center justify-between bg-red-950/50 border border-red-500/40 text-red-300 p-4 rounded-lg text-sm"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-400 hover:text-red-200 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Target Beilinson-Drinfeld Chiral Lie Algebra Configuration
          </label>
          <select
            value={selectedAlgebra}
            onChange={(e) => setSelectedAlgebra(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {algebras.map((a) => (
              <option key={a.algebra_id} value={a.algebra_id}>
                {a.algebra_id} — {a.classification}
              </option>
            ))}
          </select>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Affine Kac-Moody Level k: {levelK}</span>
                <span>[1 to 16]</span>
              </div>
              <input
                type="range"
                min="1"
                max="16"
                value={levelK}
                onChange={(e) => setLevelK(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Curve Coalescing Points n: {pointsN}</span>
                <span>[2 to 32]</span>
              </div>
              <input
                type="range"
                min="2"
                max="32"
                value={pointsN}
                onChange={(e) => setPointsN(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Factorization Depth: {factorizationDepth}</span>
                <span>[2 to 32]</span>
              </div>
              <input
                type="range"
                min="2"
                max="32"
                value={factorizationDepth}
                onChange={(e) => setFactorizationDepth(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>KZ Conformal Gain: {chiralGain.toFixed(2)}x</span>
                <span>[0.85x to 2.50x]</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="2.5"
                step="0.05"
                value={chiralGain}
                onChange={(e) => setChiralGain(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSeal}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loading ? 'Evaluating Chiral OPE...' : 'Seal Chiral Homology Envelope'}</span>
          </button>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 mb-4">
              <Cpu className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Beilinson-Drinfeld Chiral Telemetry</h3>
            </div>

            {telemetry ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Algebra ID:</span>
                  <span className="font-mono text-amber-300">{telemetry.algebra_id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-mono text-emerald-400">{telemetry.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Factorization Residual:</span>
                  <span className="font-mono text-slate-200">
                    {telemetry.chiral_factorization_residual.toExponential(4)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Beilinson Fusion Coherence:</span>
                  <span className="font-mono text-emerald-300">
                    {telemetry.beilinson_fusion_coherence.toFixed(7)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Chiral Suppression Depth:</span>
                  <span className="font-mono text-amber-300">
                    {telemetry.chiral_suppression_db.toFixed(2)} dB
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Conformal Unitarity:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {telemetry.conformal_unitarity_pct.toFixed(5)}%
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">KZ Flat Monodromy Lock:</span>
                  <span className="font-mono text-emerald-400">
                    {telemetry.chiral_homology_locked ? 'YES (TRUE)' : 'NO'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs text-center">
                Select a Beilinson-Drinfeld chiral algebra and trigger factorization seal to inspect live telemetry.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Sovereign Frontier Shield • Wave 45</span>
            <span className="text-amber-400/80 font-mono">v8.5.0-STABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
