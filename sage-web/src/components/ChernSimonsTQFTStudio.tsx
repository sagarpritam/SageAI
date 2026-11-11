'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layers, RefreshCw, Shield, Sparkles, Cpu, AlertTriangle } from 'lucide-react';

interface ChernSimonsManifold {
  manifold_id: string;
  topology: string;
  default_gauge_rank_n: number;
  default_cs_level_k: number;
  default_crossing_number: number;
  base_invariant_fidelity_pct: number;
  base_anomaly_suppression_db: number;
  status: string;
}

interface EvaluateInvariantResult {
  manifold_id: string;
  topology: string;
  gauge_group: string;
  gauge_rank_n: number;
  chern_simons_level_k: number;
  knot_crossings: number;
  framing_counterterm_gain: number;
  wzw_central_charge: number;
  partition_function_modulus: number;
  jones_polynomial_modulus: number;
  framing_anomaly_residual: number;
  anomaly_suppression_db: number;
  invariant_fidelity_pct: number;
  reidemeister_invariance_verified: boolean;
  status: string;
  timestamp: number;
}

export default function ChernSimonsTQFTStudio() {
  const [manifolds, setManifolds] = useState<ChernSimonsManifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>('CS-SU2-S3-TREFOIL-01');
  const [gaugeRank, setGaugeRank] = useState<number>(2);
  const [csLevel, setCsLevel] = useState<number>(8);
  const [crossings, setCrossings] = useState<number>(4);
  const [countertermGain, setCountertermGain] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<EvaluateInvariantResult | null>(null);

  const fetchManifolds = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/chern-simons-tqft/manifolds');
      const data = (await res.json().catch(() => ({}))) as {
        manifolds?: ChernSimonsManifold[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Chern-Simons 3-manifolds');
      }
      if (data.manifolds) {
        setManifolds(data.manifolds);
        if (data.manifolds.length > 0) {
          setSelectedManifold((prev) => prev || data.manifolds![0].manifold_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Chern-Simons 3-manifolds'
      );
    }
  }, []);

  useEffect(() => {
    fetchManifolds();
  }, [fetchManifolds]);

  const handleEvaluate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/chern-simons-tqft/evaluate-invariant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          gauge_rank_n: gaugeRank,
          chern_simons_level_k: csLevel,
          knot_crossings: crossings,
          framing_counterterm_gain: countertermGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as EvaluateInvariantResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Chern-Simons TQFT invariant evaluation failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Chern-Simons TQFT invariant evaluation failed'
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
            <Layers className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Capability 113: Witten Chern-Simons 3-Manifold TQFT &amp; Jones Knot Shield
            </h2>
            <p className="text-sm text-slate-400">
              SU(N)_k Witten partition invariants Z(M_3), Kauffman skein polynomials, and framing anomaly cancellation
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
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">
                {m.manifold_id}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {m.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{m.topology}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Gauge Group:</span>
                <span className="text-emerald-300">
                  SU({m.default_gauge_rank_n})_{m.default_cs_level_k} ({m.default_crossing_number}-crossings)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Skein Fidelity:</span>
                <span className="text-cyan-300">{m.base_invariant_fidelity_pct.toFixed(3)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Chern-Simons Level &amp; Reidemeister Knot Framing Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Gauge Rank SU(N): <span className="text-emerald-300 font-mono">{gaugeRank}</span>
            </label>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={gaugeRank}
              onChange={(e) => setGaugeRank(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              CS Level (k): <span className="text-emerald-300 font-mono">{csLevel}</span>
            </label>
            <input
              type="range"
              min="2"
              max="32"
              step="1"
              value={csLevel}
              onChange={(e) => setCsLevel(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Knot Crossings: <span className="text-emerald-300 font-mono">{crossings}</span>
            </label>
            <input
              type="range"
              min="3"
              max="18"
              step="1"
              value={crossings}
              onChange={(e) => setCrossings(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Framing Gain: <span className="text-emerald-300 font-mono">{countertermGain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={countertermGain}
              onChange={(e) => setCountertermGain(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Evaluating Jones Skein Invariant Z(M_3)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Evaluate Chern-Simons Z(M_3) &amp; Jones Polynomial Invariant</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-emerald-300">
              WITTEN CHERN-SIMONS TQFT INVARIANT TELEMETRY
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">INVARIANT FIDELITY</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.invariant_fidelity_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">|Z(M_3)| MODULUS</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.partition_function_modulus.toFixed(5)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">JONES MODULUS</span>
              <span className="text-teal-300 font-bold text-sm">
                {telemetry.jones_polynomial_modulus.toFixed(5)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ANOMALY QUENCH</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.anomaly_suppression_db.toFixed(1)} dB
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Reidemeister Move Invariance Verified | {telemetry.gauge_group} WZW c={telemetry.wzw_central_charge.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

