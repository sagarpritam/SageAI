'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Compass, Cpu, AlertTriangle, Shield } from 'lucide-react';

interface DSStaticPatch {
  patch_id: string;
  horizon: string;
  default_hubble_scale: number;
  default_york_time: number;
  default_timelike_interval: number;
  base_coherence_pct: number;
  base_isolation_db: number;
  status: string;
}

interface LockPatchResult {
  patch_id: string;
  horizon: string;
  hubble_scale: number;
  york_time: number;
  timelike_interval: number;
  observer_clamp_gain: number;
  gibbons_hawking_entropy_sgh: number;
  timelike_pseudo_entropy_st: number;
  horizon_drift_residual: number;
  horizon_isolation_db: number;
  patch_coherence_pct: number;
  type_ii1_algebra_locked: boolean;
  status: string;
  timestamp: number;
}

export default function DSStaticPatchStudio() {
  const [patches, setPatches] = useState<DSStaticPatch[]>([]);
  const [selectedPatch, setSelectedPatch] = useState<string>('DS-STATIC-GIBBONS-01');
  const [hubbleScale, setHubbleScale] = useState<number>(1.0);
  const [yorkTime, setYorkTime] = useState<number>(0.95);
  const [timelikeInterval, setTimelikeInterval] = useState<number>(1.6);
  const [clampGain, setClampGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<LockPatchResult | null>(null);

  const fetchPatches = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ds-static-patch/patches');
      const data = (await res.json().catch(() => ({}))) as {
        patches?: DSStaticPatch[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load de Sitter static patches');
      }
      if (data.patches) {
        setPatches(data.patches);
        if (data.patches.length > 0) {
          setSelectedPatch((prev) => prev || data.patches![0].patch_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load de Sitter static patches');
    }
  }, []);

  useEffect(() => {
    fetchPatches();
  }, [fetchPatches]);

  const handleLock = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ds-static-patch/lock-patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patch_id: selectedPatch,
          hubble_scale: hubbleScale,
          york_time: yorkTime,
          timelike_interval: timelikeInterval,
          observer_clamp_gain: clampGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as LockPatchResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'dS static-patch lock failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'dS static-patch lock failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Compass className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-300">
              Capability 126: dS/CFT De Sitter Static-Patch &amp; Timelike Entanglement Shield
            </h2>
            <p className="text-sm text-slate-400">
              Gibbons-Hawking horizon entropy S_GH = A/4G, Type II_1 observer algebra &amp; timelike pseudo-entanglement S_T
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchPatches}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Patches</span>
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
        {patches.map((p) => (
          <button
            type="button"
            key={p.patch_id}
            onClick={() => setSelectedPatch(p.patch_id)}
            aria-pressed={selectedPatch === p.patch_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedPatch === p.patch_id
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-cyan-400">{p.patch_id}</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                {p.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{p.horizon}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Hubble Scale: H={p.default_hubble_scale} | York={p.default_york_time}</div>
              <div>Base Isolation: {p.base_isolation_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Hubble Scale (H)
            </label>
            <input
              type="number"
              min={0.2}
              max={10}
              step={0.1}
              value={hubbleScale}
              onChange={(e) => setHubbleScale(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              York Time Coordinate
            </label>
            <input
              type="number"
              min={0.1}
              max={5}
              step={0.05}
              value={yorkTime}
              onChange={(e) => setYorkTime(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Timelike Interval (dT)
            </label>
            <input
              type="number"
              min={0.2}
              max={8}
              step={0.1}
              value={timelikeInterval}
              onChange={(e) => setTimelikeInterval(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Observer Clamp Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={clampGain}
              onChange={(e) => setClampGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleLock}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-cyan-900/30"
        >
          <Shield className="w-4 h-4" />
          <span>{loading ? 'Locking Static-Patch Horizon...' : 'Lock dS Static-Patch & Timelike Entanglement'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-cyan-950/20 border border-cyan-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/50 pb-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>dS/CFT Static-Patch Telemetry ({telemetry.patch_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Gibbons-Hawking S_GH</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.gibbons_hawking_entropy_sgh}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Horizon Isolation</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.horizon_isolation_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Patch Coherence</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.patch_coherence_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Timelike Entropy S_T</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.timelike_pseudo_entropy_st}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

