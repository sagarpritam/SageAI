'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface NovikovManifold {
  manifold_id: string;
  classification: string;
  default_critical_point_rank: number;
  default_gradient_flow_lines: number;
  default_novikov_filtration_depth: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  manifold_id: string;
  classification: string;
  critical_point_rank: number;
  gradient_flow_lines: number;
  novikov_filtration_depth: number;
  novikov_gain: number;
  novikov_monodromy_residual: number;
  gradient_flow_coherence: number;
  floer_suppression_db: number;
  symplectic_unitarity_pct: number;
  floer_novikov_locked: boolean;
  status: string;
  timestamp: number;
}

export default function FloerNovikovStudio() {
  const [manifolds, setManifolds] = useState<NovikovManifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>('NOVIKOV-T4-SYMPL-01');
  const [criticalPoints, setCriticalPoints] = useState<number>(4);
  const [flowLines, setFlowLines] = useState<number>(12);
  const [filtrationDepth, setFiltrationDepth] = useState<number>(6);
  const [novikovGain, setNovikovGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchManifolds = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/floer-novikov-gradient/critical-manifolds');
      const data = (await res.json().catch(() => ({}))) as {
        critical_manifolds?: NovikovManifold[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Floer-Novikov manifolds');
      }
      if (data.critical_manifolds) {
        setManifolds(data.critical_manifolds);
        if (data.critical_manifolds.length > 0) {
          setSelectedManifold((prev) => prev || data.critical_manifolds![0].manifold_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Floer-Novikov manifolds'
      );
    }
  }, []);

  useEffect(() => {
    fetchManifolds();
  }, [fetchManifolds]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/floer-novikov-gradient/seal-novikov', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          critical_point_rank: criticalPoints,
          gradient_flow_lines: flowLines,
          novikov_filtration_depth: filtrationDepth,
          novikov_gain: novikovGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Floer-Novikov seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Floer-Novikov seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-teal-300">
              Capability 156: Floer-Novikov Homology &amp; Morse-Smale Gradient Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Multi-valued closed 1-form Novikov rings, gradient flow line energy decay &amp; Lagrangian intersection bounds
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchManifolds}
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
            Target Symplectic Manifold &amp; Lagrangian Intersection Complex
          </label>
          <select
            value={selectedManifold}
            onChange={(e) => setSelectedManifold(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {manifolds.map((m) => (
              <option key={m.manifold_id} value={m.manifold_id}>
                {m.manifold_id} — {m.classification}
              </option>
            ))}
          </select>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Morse-Novikov Critical Point Rank: {criticalPoints}</span>
                <span>[2 to 16]</span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                value={criticalPoints}
                onChange={(e) => setCriticalPoints(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Gradient Flow Lines: {flowLines}</span>
                <span>[4 to 64]</span>
              </div>
              <input
                type="range"
                min="4"
                max="64"
                value={flowLines}
                onChange={(e) => setFlowLines(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Novikov Filtration Depth: {filtrationDepth}</span>
                <span>[2 to 32]</span>
              </div>
              <input
                type="range"
                min="2"
                max="32"
                value={filtrationDepth}
                onChange={(e) => setFiltrationDepth(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Floer Lagrangian Gain: {novikovGain.toFixed(2)}x</span>
                <span>[0.85x to 2.50x]</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="2.5"
                step="0.05"
                value={novikovGain}
                onChange={(e) => setNovikovGain(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSeal}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loading ? 'Evaluating Gradient Flow...' : 'Seal Floer-Novikov Complex'}</span>
          </button>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-teal-400 mb-4">
              <Cpu className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Floer-Novikov Telemetry</h3>
            </div>

            {telemetry ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Manifold ID:</span>
                  <span className="font-mono text-teal-300">{telemetry.manifold_id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-mono text-emerald-400">{telemetry.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Novikov Monodromy Residual:</span>
                  <span className="font-mono text-slate-200">
                    {telemetry.novikov_monodromy_residual.toExponential(4)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Gradient Flow Coherence:</span>
                  <span className="font-mono text-emerald-300">
                    {telemetry.gradient_flow_coherence.toFixed(7)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Floer Suppression Depth:</span>
                  <span className="font-mono text-teal-300">
                    {telemetry.floer_suppression_db.toFixed(2)} dB
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Symplectic Unitarity:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {telemetry.symplectic_unitarity_pct.toFixed(5)}%
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Lagrangian Intersection Lock:</span>
                  <span className="font-mono text-emerald-400">
                    {telemetry.floer_novikov_locked ? 'YES (TRUE)' : 'NO'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs text-center">
                Select a symplectic manifold and trigger Floer-Novikov gradient seal to inspect live telemetry.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Sovereign Frontier Firewall • Wave 45</span>
            <span className="text-teal-400/80 font-mono">v8.5.0-STABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
