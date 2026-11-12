'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, RefreshCw, Sparkles, Cpu, AlertTriangle, Activity } from 'lucide-react';

interface SYKEnsemble {
  ensemble_id: string;
  manifold: string;
  default_majorana_n: number;
  default_interaction_q: number;
  default_beta_j: number;
  base_scrambling_fidelity_pct: number;
  base_chaos_isolation_db: number;
  status: string;
}

interface BoundScramblingResult {
  ensemble_id: string;
  manifold: string;
  majorana_n: number;
  interaction_q: number;
  beta_j_coupling: number;
  schwarzian_damping_gain: number;
  lyapunov_mss_saturation_ratio: number;
  scrambling_horizon_ln_n: number;
  otoc_leakage_residual: number;
  chaos_isolation_db: number;
  scrambling_fidelity_pct: number;
  mss_bound_enforced: boolean;
  status: string;
  timestamp: number;
}

export default function SYKChaosStudio() {
  const [ensembles, setEnsembles] = useState<SYKEnsemble[]>([]);
  const [selectedEnsemble, setSelectedEnsemble] = useState<string>('SYK-MAJORANA-Q4-01');
  const [majoranaN, setMajoranaN] = useState<number>(512);
  const [interactionQ, setInteractionQ] = useState<number>(4);
  const [betaJ, setBetaJ] = useState<number>(28.0);
  const [schwarzianGain, setSchwarzianGain] = useState<number>(1.4);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<BoundScramblingResult | null>(null);

  const fetchEnsembles = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/syk-chaos-guard/ensembles');
      const data = (await res.json().catch(() => ({}))) as {
        ensembles?: SYKEnsemble[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load SYK ensembles');
      }
      if (data.ensembles) {
        setEnsembles(data.ensembles);
        if (data.ensembles.length > 0) {
          setSelectedEnsemble((prev) => prev || data.ensembles![0].ensemble_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load SYK ensembles');
    }
  }, []);

  useEffect(() => {
    fetchEnsembles();
  }, [fetchEnsembles]);

  const handleBoundScrambling = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/syk-chaos-guard/bound-scrambling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ensemble_id: selectedEnsemble,
          majorana_n: majoranaN,
          interaction_q: interactionQ,
          beta_j_coupling: betaJ,
          schwarzian_damping_gain: schwarzianGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as BoundScramblingResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'SYK Chaos Scrambling lock failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'SYK Chaos Scrambling lock failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg">
            <Activity className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-fuchsia-300">
              Capability 120: SYK Maximal Chaos &amp; Schwarzian Scrambling Guard
            </h2>
            <p className="text-sm text-slate-400">
              Majorana q-body OTOC MSS chaos saturation (lambda_L &lt;= 2*pi*T) &amp; AdS2 Schwarzian stabilization
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchEnsembles}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ensembles</span>
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
        {ensembles.map((e) => (
          <button
            type="button"
            key={e.ensemble_id}
            onClick={() => setSelectedEnsemble(e.ensemble_id)}
            aria-pressed={selectedEnsemble === e.ensemble_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedEnsemble === e.ensemble_id
                ? 'bg-fuchsia-950/40 border-fuchsia-500/60 shadow-lg shadow-fuchsia-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-fuchsia-400">
                {e.ensemble_id}
              </span>
              <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded-full font-mono">
                {e.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{e.manifold}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Majorana N / q:</span>
                <span className="text-fuchsia-300">
                  {e.default_majorana_n} (q={e.default_interaction_q})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Scrambling Fidelity:</span>
                <span className="text-cyan-300">{e.base_scrambling_fidelity_pct.toFixed(3)}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-fuchsia-400" />
          <span>MSS Lyapunov Bound &amp; Schwarzian Mode Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Majorana Sites N: <span className="text-fuchsia-300 font-mono">{majoranaN}</span>
            </label>
            <input
              type="range"
              min="32"
              max="2048"
              step="32"
              value={majoranaN}
              onChange={(e) => setMajoranaN(parseInt(e.target.value, 10))}
              className="w-full accent-fuchsia-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Interaction Rank q: <span className="text-fuchsia-300 font-mono">{interactionQ}</span>
            </label>
            <input
              type="range"
              min="2"
              max="12"
              step="2"
              value={interactionQ}
              onChange={(e) => setInteractionQ(parseInt(e.target.value, 10))}
              className="w-full accent-fuchsia-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Coupling beta*J: <span className="text-fuchsia-300 font-mono">{betaJ.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="4.0"
              max="100.0"
              step="2.0"
              value={betaJ}
              onChange={(e) => setBetaJ(parseFloat(e.target.value))}
              className="w-full accent-fuchsia-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Schwarzian Gain: <span className="text-fuchsia-300 font-mono">{schwarzianGain.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min="0.85"
              max="2.5"
              step="0.05"
              value={schwarzianGain}
              onChange={(e) => setSchwarzianGain(parseFloat(e.target.value))}
              className="w-full accent-fuchsia-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleBoundScrambling}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-fuchsia-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Clamping SYK Lyapunov &amp; Schwarzian Modes...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Enforce MSS Chaos Bound &amp; Lock Schwarzian Mode</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-fuchsia-950/20 border border-fuchsia-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-fuchsia-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-fuchsia-300">
              SYK SCRAMBLING &amp; MSS BOUND TELEMETRY
            </span>
            <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">SCRAMBLING FIDELITY</span>
              <span className="text-fuchsia-300 font-bold text-sm">
                {telemetry.scrambling_fidelity_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">MSS LYAPUNOV RATIO</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.lyapunov_mss_saturation_ratio.toFixed(4)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CHAOS ISOLATION</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.chaos_isolation_db.toFixed(1)} dB
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">OTOC RESIDUAL</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.otoc_leakage_residual.toExponential(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-fuchsia-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              MSS Bound Enforced | Scrambling Horizon ln(N)={telemetry.scrambling_horizon_ln_n}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

