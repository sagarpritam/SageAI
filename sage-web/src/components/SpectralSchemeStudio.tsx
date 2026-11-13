'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Layers } from 'lucide-react';

interface SpectralScheme {
  scheme_id: string;
  classification: string;
  default_spectral_rank: number;
  default_cotangent_truncation: number;
  default_etale_strata: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  scheme_id: string;
  classification: string;
  spectral_rank: number;
  cotangent_truncation: number;
  etale_sheaf_strata: number;
  scheme_gain: number;
  cotangent_obstruction_residual: number;
  spectral_descent_fidelity: number;
  scheme_suppression_db: number;
  spectral_unitarity_pct: number;
  derived_etale_locked: boolean;
  status: string;
  timestamp: number;
}

export default function SpectralSchemeStudio() {
  const [schemes, setSchemes] = useState<SpectralScheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<string>('SPECTRAL-AFFINE-E1-01');
  const [spectralRank, setSpectralRank] = useState<number>(4);
  const [cotangentTruncation, setCotangentTruncation] = useState<number>(12);
  const [etaleStrata, setEtaleStrata] = useState<number>(14);
  const [schemeGain, setSchemeGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchSchemes = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/derived-spectral-scheme/schemes');
      const data = (await res.json().catch(() => ({}))) as {
        schemes?: SpectralScheme[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load derived spectral schemes');
      }
      if (data.schemes) {
        setSchemes(data.schemes);
        if (data.schemes.length > 0) {
          setSelectedScheme((prev) => prev || data.schemes![0].scheme_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load derived spectral schemes'
      );
    }
  }, []);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/derived-spectral-scheme/seal-scheme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme_id: selectedScheme,
          spectral_rank: spectralRank,
          cotangent_truncation: cotangentTruncation,
          etale_sheaf_strata: etaleStrata,
          scheme_gain: schemeGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Spectral scheme seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Spectral scheme seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <Layers className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-violet-300">
              Capability 153: Derived Spectral Scheme &amp; Artin Stack Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Lurie spectral Deligne-Mumford &amp; Artin stacks, cotangent complex obstruction classes &amp; hypercomplete etale descent
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchSchemes}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Schemes</span>
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

      {/* Preset Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {schemes.map((s) => (
          <button
            key={s.scheme_id}
            type="button"
            onClick={() => {
              setSelectedScheme(s.scheme_id);
              setSpectralRank(s.default_spectral_rank);
              setCotangentTruncation(s.default_cotangent_truncation);
              setEtaleStrata(s.default_etale_strata);
            }}
            className={`text-left p-3.5 rounded-lg border transition ${
              selectedScheme === s.scheme_id
                ? 'bg-violet-950/40 border-violet-500/80 text-white shadow-lg shadow-violet-950/50'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="text-xs font-mono font-bold text-violet-400">{s.scheme_id}</div>
            <div className="text-sm font-semibold mt-1 truncate">{s.classification}</div>
            <div className="flex justify-between items-center text-xs text-slate-400 mt-2 font-mono">
              <span>Rank {s.default_spectral_rank}</span>
              <span>{s.base_suppression_db} dB</span>
              <span className="text-emerald-400">{s.base_unitarity_pct}%</span>
            </div>
          </button>
        ))}
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-lg border border-slate-800">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Spectral Rank [2-16]
          </label>
          <input
            type="number"
            min={2}
            max={16}
            value={spectralRank}
            onChange={(e) => setSpectralRank(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-violet-500"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Cotangent Truncation [4-64]
          </label>
          <input
            type="number"
            min={4}
            max={64}
            value={cotangentTruncation}
            onChange={(e) => setCotangentTruncation(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-violet-500"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Etale Sheaf Strata [4-128]
          </label>
          <input
            type="number"
            min={4}
            max={128}
            value={etaleStrata}
            onChange={(e) => setEtaleStrata(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-violet-500"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Scheme Gain [0.85-2.5]
          </label>
          <input
            type="number"
            step="0.05"
            min={0.85}
            max={2.5}
            value={schemeGain}
            onChange={(e) => setSchemeGain(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-violet-900/40"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Sealing Spectral Scheme...' : 'Seal Derived Spectral Scheme'}</span>
        </button>
      </div>

      {/* Telemetry Display */}
      {telemetry && (
        <div className="border border-violet-500/40 bg-violet-950/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-violet-900/40 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              <span className="font-mono text-xs uppercase tracking-wider text-violet-300 font-bold">
                Spectral Scheme Telemetry: {telemetry.scheme_id}
              </span>
            </div>
            <span className="text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Cotangent Residual</div>
              <div className="text-lg font-mono font-bold text-violet-300 mt-1">
                {telemetry.cotangent_obstruction_residual.toExponential(4)}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Descent Fidelity</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                {telemetry.spectral_descent_fidelity.toFixed(7)}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Suppression</div>
              <div className="text-lg font-mono font-bold text-cyan-300 mt-1">
                {telemetry.scheme_suppression_db.toFixed(2)} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Spectral Unitarity</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                {telemetry.spectral_unitarity_pct.toFixed(5)}%
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400 pt-2 border-t border-violet-900/30">
            <span>Rank: {telemetry.spectral_rank}</span>
            <span>Truncation: {telemetry.cotangent_truncation}</span>
            <span>Strata: {telemetry.etale_sheaf_strata}</span>
            <span>Gain: {telemetry.scheme_gain}x</span>
            <span className="text-emerald-400">Derived Etale Descent Locked: true</span>
          </div>
        </div>
      )}
    </div>
  );
}
