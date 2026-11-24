'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Flame, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CardyState {
  state_id: string;
  classification: string;
  central_charge_c: number;
  verlinde_fusion_level_k: number;
  boundary_entropy_log_g: number;
  modular_s_matrix_element: number;
  base_firewall_gev: number;
  shield_fidelity_pct: number;
  status: string;
}

interface BoundarySealResult {
  state_id: string;
  seal_status: string;
  modular_cross_channel_invariance: number;
  boundary_g_factor: number;
  effective_fidelity_pct: number;
  hardened_firewall_gev: number;
  verlinde_fusion_level_k: number;
  modular_s_parameter: number;
  conformal_gain: number;
  timestamp: number;
}

export default function CardyBoundaryCftStudio() {
  const [states, setStates] = useState<CardyState[]>([]);
  const [selectedState, setSelectedState] = useState<string>('CARDY-ISING-FREE-01');
  const [fusionLevelK, setFusionLevelK] = useState<number>(4);
  const [modularS, setModularS] = useState<number>(0.7071);
  const [conformalGain, setConformalGain] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<BoundarySealResult | null>(null);

  const fetchStates = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/cardy-boundary-cft/states');
      const data = (await res.json().catch(() => ({}))) as {
        states?: CardyState[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Cardy boundary states');
      }
      if (data.states) {
        setStates(data.states);
        if (data.states.length > 0) {
          setSelectedState((prev) => prev || data.states![0].state_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading Cardy states';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  const handleSealBoundary = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/cardy-boundary-cft/seal-boundary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state_id: selectedState,
          verlinde_fusion_level_k: fusionLevelK,
          modular_s_parameter: modularS,
          conformal_gain: conformalGain,
          boundary_defect_charge: 1.0,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as BoundarySealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to seal Cardy boundary state');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing Cardy boundary seal';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">
              Cardy Boundary CFT &amp; Verlinde Firewall Studio
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Capability 166: Conformal Boundary States, Verlinde Fusion Algebra &amp; Modular S-Matrix Invariance
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchStates}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload States
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300 font-mono"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-[10px] bg-red-900/60 hover:bg-red-900 px-2 py-0.5 rounded border border-red-700/50 text-red-200 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-zinc-400 block mb-1.5">
              Select Boundary Cardy State:
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-200 focus:border-cyan-500 focus:outline-none"
            >
              {states.map((s) => (
                <option key={s.state_id} value={s.state_id}>
                  {s.state_id} — {s.classification}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Verlinde Fusion Level (k): {fusionLevelK}
              </label>
              <input
                type="range"
                min={1}
                max={16}
                step={1}
                value={fusionLevelK}
                onChange={(e) => setFusionLevelK(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Modular S-Element: {modularS.toFixed(4)}
              </label>
              <input
                type="range"
                min={0.1}
                max={2.0}
                step={0.05}
                value={modularS}
                onChange={(e) => setModularS(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-zinc-400 block mb-1">
              Conformal Gain: {conformalGain.toFixed(1)}x
            </label>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={conformalGain}
              onChange={(e) => setConformalGain(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSealBoundary}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 py-2.5 text-xs font-mono font-bold text-white shadow-lg transition"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Sealing Boundary State...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Seal Cardy Boundary Firewall
              </>
            )}
          </button>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            Conformal Boundary Telemetry &amp; S-Invariance
          </h3>
          {telemetry ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">State ID:</span>
                <span className="text-cyan-400 font-bold">{telemetry.state_id}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Status:</span>
                <span className="text-zinc-200">{telemetry.seal_status}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Modular Cross-Channel Invariance:</span>
                <span className="text-emerald-300 font-bold">
                  {(telemetry.modular_cross_channel_invariance * 100).toFixed(5)}%
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Boundary g-Factor:</span>
                <span className="text-blue-300 font-bold">
                  {telemetry.boundary_g_factor.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Hardened Firewall:</span>
                <span className="text-yellow-400 font-bold">
                  {telemetry.hardened_firewall_gev.toFixed(2)} GeV
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Effective Fidelity:</span>
                <span className="text-cyan-400 font-bold">
                  {telemetry.effective_fidelity_pct.toFixed(4)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-500 font-mono text-xs">
              <Flame className="h-8 w-8 text-zinc-700 mb-2" />
              <span>Select Cardy state and seal conformal boundary firewall</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
