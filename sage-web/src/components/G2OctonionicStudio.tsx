'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Shield, AlertTriangle, ShieldCheck } from 'lucide-react';

interface G2Manifold {
  manifold_id: string;
  classification: string;
  betti_b2: number;
  betti_b3: number;
  associative_3cycles: number;
  coassociative_4cycles: number;
  instanton_charge: number;
  torsion_free_precision: number;
  shield_fidelity_pct: number;
  status: string;
}

interface G2CalibrationResult {
  manifold_id: string;
  calibration_status: string;
  associative_volume_calibrated: number;
  coassociative_instanton_action: number;
  effective_fidelity_pct: number;
  hardened_shield_strength_pev: number;
  instanton_charge: number;
  torsion_free_precision: number;
  associative_refinement_depth: number;
  calibration_gain: number;
  timestamp: number;
}

export default function G2OctonionicStudio() {
  const [manifolds, setManifolds] = useState<G2Manifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>('G2-JOYCE-TORUS-01');
  const [instantonCharge, setInstantonCharge] = useState<number>(3);
  const [refinementDepth, setRefinementDepth] = useState<number>(8);
  const [calibrationGain, setCalibrationGain] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<G2CalibrationResult | null>(null);

  const fetchManifolds = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/g2-octonionic-shield/manifolds');
      const data = (await res.json().catch(() => ({}))) as {
        manifolds?: G2Manifold[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load G2 holonomy manifolds');
      }
      if (data.manifolds) {
        setManifolds(data.manifolds);
        if (data.manifolds.length > 0) {
          setSelectedManifold((prev) => prev || data.manifolds![0].manifold_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading G2 manifolds';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchManifolds();
  }, [fetchManifolds]);

  const handleCalibrate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/g2-octonionic-shield/calibrate-associative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          instanton_charge: instantonCharge,
          associative_refinement_depth: refinementDepth,
          calibration_gain: calibrationGain,
          torsion_free_precision: 1e-6,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as G2CalibrationResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to calibrate G2 associative 3-cycle');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing G2 calibration';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">
              G₂ Octonionic Instanton Shield Studio
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Capability 164: G₂ Holonomy Associative 3-Cycle Calibrations &amp; Coassociative 4-Fold Instanton Defense
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchManifolds}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload Manifolds
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
              Select G₂ Holonomy Manifold:
            </label>
            <select
              value={selectedManifold}
              onChange={(e) => setSelectedManifold(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-200 focus:border-emerald-500 focus:outline-none"
            >
              {manifolds.map((m) => (
                <option key={m.manifold_id} value={m.manifold_id}>
                  {m.manifold_id} — {m.classification}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Instanton Charge (k): {instantonCharge}
              </label>
              <input
                type="range"
                min={1}
                max={16}
                step={1}
                value={instantonCharge}
                onChange={(e) => setInstantonCharge(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Refinement Depth: {refinementDepth}
              </label>
              <input
                type="range"
                min={1}
                max={24}
                step={1}
                value={refinementDepth}
                onChange={(e) => setRefinementDepth(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-zinc-400 block mb-1">
              Calibration Gain: {calibrationGain.toFixed(1)}x
            </label>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={calibrationGain}
              onChange={(e) => setCalibrationGain(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={handleCalibrate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-2.5 text-xs font-mono font-bold text-white shadow-lg transition"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Calibrating G₂ Manifold...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Calibrate Associative 3-Cycles
              </>
            )}
          </button>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Calibration Telemetry &amp; Instanton Action
          </h3>
          {telemetry ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Manifold ID:</span>
                <span className="text-emerald-400 font-bold">{telemetry.manifold_id}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Status:</span>
                <span className="text-zinc-200">{telemetry.calibration_status}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Associative Volume (Vol(M₃)):</span>
                <span className="text-emerald-300 font-bold">
                  {telemetry.associative_volume_calibrated.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Instanton Action (S_inst):</span>
                <span className="text-blue-300 font-bold">
                  {telemetry.coassociative_instanton_action.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Shield Strength:</span>
                <span className="text-yellow-400 font-bold">
                  {telemetry.hardened_shield_strength_pev.toFixed(2)} PeV
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Effective Fidelity:</span>
                <span className="text-emerald-400 font-bold">
                  {telemetry.effective_fidelity_pct.toFixed(4)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-500 font-mono text-xs">
              <Shield className="h-8 w-8 text-zinc-700 mb-2" />
              <span>Select manifold parameters and execute associative calibration</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
