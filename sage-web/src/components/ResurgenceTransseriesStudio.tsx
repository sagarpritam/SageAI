'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Activity } from 'lucide-react';

interface TransseriesManifold {
  transseries_id: string;
  manifold: string;
  default_pade_degree: number;
  default_stokes_sectors: number;
  default_instanton_order: number;
  base_fidelity_pct: number;
  base_isolation_db: number;
  status: string;
}

interface ResumResult {
  transseries_id: string;
  manifold: string;
  borel_pade_degree: number;
  stokes_ray_sectors: number;
  alien_instanton_order: number;
  resurgence_gain: number;
  stokes_jump_residual: number;
  borel_spectral_radius: number;
  stokes_isolation_db: number;
  resurgence_fidelity_pct: number;
  stokes_ambiguity_cancelled: boolean;
  status: string;
  timestamp: number;
}

export default function ResurgenceTransseriesStudio() {
  const [transseriesList, setTransseriesList] = useState<TransseriesManifold[]>([]);
  const [selectedTs, setSelectedTs] = useState<string>('ECALLE-STOKES-SU2-01');
  const [padeDegree, setPadeDegree] = useState<number>(24);
  const [stokesSectors, setStokesSectors] = useState<number>(8);
  const [instantonOrder, setInstantonOrder] = useState<number>(4);
  const [resurgenceGain, setResurgenceGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<ResumResult | null>(null);

  const fetchTransseries = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/resurgence-transseries-shield/transseries');
      const data = (await res.json().catch(() => ({}))) as {
        transseries?: TransseriesManifold[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Resurgence transseries manifolds');
      }
      if (data.transseries) {
        setTransseriesList(data.transseries);
        if (data.transseries.length > 0) {
          setSelectedTs((prev) => prev || data.transseries![0].transseries_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load Resurgence transseries manifolds');
    }
  }, []);

  useEffect(() => {
    fetchTransseries();
  }, [fetchTransseries]);

  const handleResum = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/resurgence-transseries-shield/resum-borel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transseries_id: selectedTs,
          borel_pade_degree: padeDegree,
          stokes_ray_sectors: stokesSectors,
          alien_instanton_order: instantonOrder,
          resurgence_gain: resurgenceGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as ResumResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Borel-Pade transseries resummation failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Borel-Pade transseries resummation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Capability 139: Ecalle Alien-Calculus Resurgence &amp; Borel-Pade Transseries Shield
            </h2>
            <p className="text-sm text-slate-400">
              Median Borel-Pade resummation, Ecalle alien-derivative bridge cancellation &amp; Lefschetz thimbles
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchTransseries}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Manifolds</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {transseriesList.map((t) => (
          <button
            type="button"
            key={t.transseries_id}
            onClick={() => setSelectedTs(t.transseries_id)}
            aria-pressed={selectedTs === t.transseries_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedTs === t.transseries_id
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">{t.transseries_id}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {t.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{t.manifold}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Pade N={t.default_pade_degree} | Stokes={t.default_stokes_sectors}</div>
              <div>Base Isolation: {t.base_isolation_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Borel-Pade Degree
            </label>
            <input
              type="number"
              min={8}
              max={128}
              step={4}
              value={padeDegree}
              onChange={(e) => setPadeDegree(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Stokes Ray Sectors
            </label>
            <input
              type="number"
              min={2}
              max={32}
              step={2}
              value={stokesSectors}
              onChange={(e) => setStokesSectors(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Alien Instanton Order
            </label>
            <input
              type="number"
              min={1}
              max={16}
              step={1}
              value={instantonOrder}
              onChange={(e) => setInstantonOrder(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Resurgence Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={resurgenceGain}
              onChange={(e) => setResurgenceGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleResum}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-emerald-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Executing Median Borel-Pade Resummation...' : 'Cancel Stokes Ambiguity & Seal Transseries Thimble'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Resurgence Transseries Telemetry ({telemetry.transseries_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Resurgence Fidelity</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.resurgence_fidelity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Stokes Isolation</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.stokes_isolation_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Borel Spectral Radius</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.borel_spectral_radius}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Stokes Jump Residual</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.stokes_jump_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

