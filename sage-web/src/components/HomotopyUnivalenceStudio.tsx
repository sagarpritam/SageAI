'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, GitCommitHorizontal } from 'lucide-react';

interface HoTTUniverse {
  universe_id: string;
  classification: string;
  default_truncation_level: number;
  default_cubical_dim: number;
  default_hit_constructors: number;
  base_fidelity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  universe_id: string;
  classification: string;
  h_truncation_level: number;
  cubical_dimension: number;
  hit_constructors: number;
  univalence_gain: number;
  kan_fibration_transport_drift: number;
  univalence_equivalence_index: number;
  homotopy_isolation_db: number;
  univalence_fidelity_pct: number;
  eckmann_hilton_coherence_locked: boolean;
  status: string;
  timestamp: number;
}

export default function HomotopyUnivalenceStudio() {
  const [universes, setUniverses] = useState<HoTTUniverse[]>([]);
  const [selectedUniverse, setSelectedUniverse] = useState<string>('HOTT-UNIVALENCE-U0-01');
  const [truncLevel, setTruncLevel] = useState<number>(2);
  const [cubicalDim, setCubicalDim] = useState<number>(8);
  const [hitConstructors, setHitConstructors] = useState<number>(10);
  const [univalenceGain, setUnivalenceGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchUniverses = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/homotopy-type-univalence/universes');
      const data = (await res.json().catch(() => ({}))) as {
        universes?: HoTTUniverse[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load HoTT univalent type universes');
      }
      if (data.universes) {
        setUniverses(data.universes);
        if (data.universes.length > 0) {
          setSelectedUniverse((prev) => prev || data.universes![0].universe_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to load HoTT univalent type universes'
      );
    }
  }, []);

  useEffect(() => {
    fetchUniverses();
  }, [fetchUniverses]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/homotopy-type-univalence/seal-univalence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universe_id: selectedUniverse,
          h_truncation_level: truncLevel,
          cubical_dimension: cubicalDim,
          hit_constructors: hitConstructors,
          univalence_gain: univalenceGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'HoTT univalence cubical seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'HoTT univalence cubical seal failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <GitCommitHorizontal className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-violet-300">
              Capability 145: HoTT Voevodsky Univalence &amp; ∞-Groupoid Cubical Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Voevodsky univalence axiom, Kan-fibration path transport &amp; Eckmann-Hilton HIT coherence
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchUniverses}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Universes</span>
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
        {universes.map((u) => (
          <button
            type="button"
            key={u.universe_id}
            onClick={() => setSelectedUniverse(u.universe_id)}
            aria-pressed={selectedUniverse === u.universe_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedUniverse === u.universe_id
                ? 'bg-violet-950/40 border-violet-500/60 shadow-lg shadow-violet-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-violet-400">
                {u.universe_id}
              </span>
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                {u.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{u.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                n-Trunc={u.default_truncation_level} | Cubical={u.default_cubical_dim}D
              </div>
              <div>Base Suppression: {u.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              h-Truncation Level
            </label>
            <input
              type="number"
              min={0}
              max={12}
              step={1}
              value={truncLevel}
              onChange={(e) => setTruncLevel(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Cubical Dimension
            </label>
            <input
              type="number"
              min={2}
              max={64}
              step={2}
              value={cubicalDim}
              onChange={(e) => setCubicalDim(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              HIT Constructors
            </label>
            <input
              type="number"
              min={2}
              max={64}
              step={2}
              value={hitConstructors}
              onChange={(e) => setHitConstructors(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Univalence Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={univalenceGain}
              onChange={(e) => setUnivalenceGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-violet-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {loading
              ? 'Sealing Univalent Path...'
              : 'Verify Voevodsky Univalence & Seal Cubical Kan Transport'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-violet-950/20 border border-violet-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-violet-900/50 pb-3">
            <div className="flex items-center space-x-2 text-violet-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>HoTT Univalence Telemetry ({telemetry.universe_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Univalence Fidelity</div>
              <div className="text-base font-bold text-violet-300">
                {telemetry.univalence_fidelity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Homotopy Isolation</div>
              <div className="text-base font-bold text-fuchsia-300">
                {telemetry.homotopy_isolation_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Equivalence Index</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.univalence_equivalence_index}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Kan Transport Drift</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.kan_fibration_transport_drift}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

