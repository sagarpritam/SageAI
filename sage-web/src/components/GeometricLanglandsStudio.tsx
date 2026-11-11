'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Network, RefreshCw, Shield, Sparkles, Sliders, AlertTriangle } from 'lucide-react';

interface LanglandsSheaf {
  sheaf_id: string;
  dual_pair: string;
  default_gauge_coupling_g: number;
  default_theta_angle_pi: number;
  base_duality_coherence_pct: number;
  base_hecke_lock_db: number;
  status: string;
}

interface SyncDualityResult {
  sheaf_id: string;
  dual_pair: string;
  electric_coupling_g: number;
  magnetic_dual_coupling_g: number;
  tau_imag: number;
  dual_tau_real: number;
  dual_tau_imag: number;
  riemann_genus: number;
  hitchin_moduli_dimension: number;
  hecke_eigen_gain: number;
  wilson_thooft_residual: number;
  hecke_spectral_lock_db: number;
  duality_coherence_pct: number;
  kapustin_witten_a_b_brane_dual: boolean;
  status: string;
  timestamp: number;
}

export default function GeometricLanglandsStudio() {
  const [sheaves, setSheaves] = useState<LanglandsSheaf[]>([]);
  const [selectedSheaf, setSelectedSheaf] = useState<string>('LANGLANDS-SU3-PSU3-01');
  const [gaugeCoupling, setGaugeCoupling] = useState<number>(1.18);
  const [thetaPi, setThetaPi] = useState<number>(0.25);
  const [genus, setGenus] = useState<number>(3);
  const [heckeGain, setHeckeGain] = useState<number>(1.25);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SyncDualityResult | null>(null);

  const fetchSheaves = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/geometric-langlands/sheaves');
      const data = (await res.json().catch(() => ({}))) as {
        sheaves?: LanglandsSheaf[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Langlands sheaf bundles');
      }
      if (data.sheaves) {
        setSheaves(data.sheaves);
        if (data.sheaves.length > 0) {
          setSelectedSheaf((prev) => prev || data.sheaves![0].sheaf_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Langlands sheaf bundles'
      );
    }
  }, []);

  useEffect(() => {
    fetchSheaves();
  }, [fetchSheaves]);

  const handleSync = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/geometric-langlands/sync-duality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheaf_id: selectedSheaf,
          yang_mills_coupling_g: gaugeCoupling,
          theta_vacuum_angle_pi: thetaPi,
          riemann_genus: genus,
          hecke_eigen_gain: heckeGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SyncDualityResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Kapustin-Witten S-duality synchronization failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Kapustin-Witten S-duality synchronization failed'
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
            <Network className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-300">
              Capability 115: Langlands-Kapustin S-Duality &amp; Geometric Langlands Synchronizer
            </h2>
            <p className="text-sm text-slate-400">
              4D N=4 SYM Montonen-Olive tau -&gt; -1/tau transform, Wilson/&apos;t Hooft exchange &amp; Hecke eigensheaves
            </p>
          </div>
        </div>
        <button
          onClick={fetchSheaves}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Sheaves</span>
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
        {sheaves.map((s) => (
          <div
            key={s.sheaf_id}
            onClick={() => setSelectedSheaf(s.sheaf_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedSheaf === s.sheaf_id
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-indigo-400">
                {s.sheaf_id}
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                {s.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{s.dual_pair}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Coupling g_YM:</span>
                <span className="text-indigo-300">{s.default_gauge_coupling_g.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Duality Coherence:</span>
                <span className="text-emerald-300">{s.base_duality_coherence_pct.toFixed(3)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>Kapustin-Witten Modular SL(2, Z) &amp; Hitchin Fibration Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Coupling g_YM: <span className="text-indigo-300 font-mono">{gaugeCoupling}</span>
            </label>
            <input
              type="range"
              min="0.4"
              max="3.0"
              step="0.02"
              value={gaugeCoupling}
              onChange={(e) => setGaugeCoupling(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Theta / pi: <span className="text-indigo-300 font-mono">{thetaPi}</span>
            </label>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.05"
              value={thetaPi}
              onChange={(e) => setThetaPi(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Riemann Genus g: <span className="text-indigo-300 font-mono">{genus}</span>
            </label>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              value={genus}
              onChange={(e) => setGenus(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Hecke Gain: <span className="text-indigo-300 font-mono">{heckeGain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={heckeGain}
              onChange={(e) => setHeckeGain(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Executing S-Duality Inversion tau -&gt; -1/tau...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Synchronize Langlands-Kapustin S-Duality &amp; Hecke Sheaves</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-indigo-300">
              GEOMETRIC LANGLANDS S-DUALITY TELEMETRY
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">DUALITY COHERENCE</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.duality_coherence_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">DUAL g_YM (^L G)</span>
              <span className="text-indigo-300 font-bold text-sm">
                {telemetry.magnetic_dual_coupling_g.toFixed(4)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HITCHIN DIM M_H</span>
              <span className="text-purple-300 font-bold text-sm">
                {telemetry.hitchin_moduli_dimension}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HECKE SPECTRAL LOCK</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.hecke_spectral_lock_db.toFixed(1)} dB
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-indigo-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Kapustin-Witten A-Brane &lt;-&gt; B-Brane Dual Verified | Wilson/&apos;t Hooft Residual={telemetry.wilson_thooft_residual.toExponential(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

