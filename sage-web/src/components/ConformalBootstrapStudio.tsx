'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sigma, RefreshCw, Shield, Sparkles, Cpu, AlertTriangle } from 'lucide-react';

interface BootstrapFunctional {
  functional_id: string;
  cft_family: string;
  spacetime_dim: number;
  baseline_delta_sigma: number;
  baseline_delta_epsilon: number;
  base_unitarity_fidelity_pct: number;
  base_ghost_suppression_db: number;
  status: string;
}

interface AuditCrossingResult {
  functional_id: string;
  cft_family: string;
  spacetime_dim: number;
  derivative_order_lambda: number;
  max_spin_ell: number;
  sdp_precision_gain: number;
  delta_sigma_locked: number;
  delta_epsilon_locked: number;
  unitarity_margin_above_floor: number;
  crossing_sum_rule_residual: number;
  extremal_gap_closure_ratio: number;
  ghost_suppression_db: number;
  unitarity_fidelity_pct: number;
  reflection_positivity_verified: boolean;
  status: string;
  timestamp: number;
}

export default function ConformalBootstrapStudio() {
  const [functionals, setFunctionals] = useState<BootstrapFunctional[]>([]);
  const [selectedFunctional, setSelectedFunctional] = useState<string>('SDP-ISING-3D-KINK-01');
  const [derivLambda, setDerivLambda] = useState<number>(27);
  const [maxSpin, setMaxSpin] = useState<number>(26);
  const [sdpGain, setSdpGain] = useState<number>(1.45);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<AuditCrossingResult | null>(null);

  const fetchFunctionals = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/conformal-bootstrap/functionals');
      const data = (await res.json().catch(() => ({}))) as {
        functionals?: BootstrapFunctional[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Conformal Bootstrap SDP functionals');
      }
      if (data.functionals) {
        setFunctionals(data.functionals);
        if (data.functionals.length > 0) {
          setSelectedFunctional((prev) => prev || data.functionals![0].functional_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Conformal Bootstrap SDP functionals'
      );
    }
  }, []);

  useEffect(() => {
    fetchFunctionals();
  }, [fetchFunctionals]);

  const handleAuditCrossing = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/conformal-bootstrap/audit-crossing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functional_id: selectedFunctional,
          derivative_order_lambda: derivLambda,
          max_spin_ell: maxSpin,
          sdp_precision_gain: sdpGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as AuditCrossingResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Conformal Bootstrap SDP crossing audit failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Conformal Bootstrap SDP crossing audit failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Sigma className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-300">
              Capability 118: Conformal Bootstrap SDP &amp; Crossing-Symmetry Auditor
            </h2>
            <p className="text-sm text-slate-400">
              Primal/dual SDPB crossing sum rules, Martin-Froissart dispersion bounds &amp; ghost operator elimination
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchFunctionals}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Functionals</span>
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
        {functionals.map((f) => (
          <button
            type="button"
            key={f.functional_id}
            onClick={() => setSelectedFunctional(f.functional_id)}
            aria-pressed={selectedFunctional === f.functional_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedFunctional === f.functional_id
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-cyan-400">
                {f.functional_id}
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                {f.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{f.cft_family}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Scaling Delta_sigma:</span>
                <span className="text-cyan-300">
                  {f.baseline_delta_sigma.toFixed(6)} (d={f.spacetime_dim})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Unitarity Lock:</span>
                <span className="text-emerald-300">{f.base_unitarity_fidelity_pct.toFixed(3)}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>SDPB Crossing Derivative Cutoff &amp; Spin Truncation Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Derivative Order Lambda: <span className="text-cyan-300 font-mono">{derivLambda}</span>
            </label>
            <input
              type="range"
              min="9"
              max="63"
              step="2"
              value={derivLambda}
              onChange={(e) => setDerivLambda(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Max Spin l_max: <span className="text-cyan-300 font-mono">{maxSpin}</span>
            </label>
            <input
              type="range"
              min="6"
              max="60"
              step="2"
              value={maxSpin}
              onChange={(e) => setMaxSpin(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              SDP Precision Gain: <span className="text-cyan-300 font-mono">{sdpGain.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min="0.85"
              max="2.5"
              step="0.05"
              value={sdpGain}
              onChange={(e) => setSdpGain(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAuditCrossing}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Auditing Conformal Crossing SDP Bounds...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Execute SDPB Crossing Audit &amp; Seal Unitarity Bounds</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-cyan-300">
              CONFORMAL BOOTSTRAP SDP TELEMETRY
            </span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">UNITARITY FIDELITY</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.unitarity_fidelity_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">UNITARITY MARGIN</span>
              <span className="text-emerald-300 font-bold text-sm">
                +{telemetry.unitarity_margin_above_floor.toFixed(6)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">GHOST SUPPRESSION</span>
              <span className="text-teal-300 font-bold text-sm">
                {telemetry.ghost_suppression_db.toFixed(1)} dB
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CROSSING RESIDUAL</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.crossing_sum_rule_residual.toExponential(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-cyan-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Reflection Positivity Enforced | Extremal Gap Closure={telemetry.extremal_gap_closure_ratio.toFixed(6)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

