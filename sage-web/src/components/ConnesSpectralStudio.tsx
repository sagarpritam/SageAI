'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Shield, AlertTriangle, ShieldCheck, Compass } from 'lucide-react';

interface SpectralTriple {
  triple_id: string;
  algebra: string;
  hilbert_space: string;
  ko_dimension: string;
  grading_gamma: string;
  base_unification_fidelity_pct: number;
  status: string;
}

interface SpectralActionResult {
  triple_id: string;
  status: string;
  energy_cutoff_gev: number;
  heat_kernel_order: number;
  seeley_dewitt_coefficients: Record<string, number>;
  total_spectral_action: number;
  dixmier_trace: number;
  noncommutative_barrier_gev: number;
  spectral_suppression_db: number;
  unification_fidelity_pct: number;
  timestamp: number;
}

export default function ConnesSpectralStudio() {
  const [triples, setTriples] = useState<SpectralTriple[]>([]);
  const [selectedTriple, setSelectedTriple] = useState<string>('CONNES-STANDARD-MODEL-01');
  const [energyCutoffLog, setEnergyCutoffLog] = useState<number>(16);
  const [dixmierScale, setDixmierScale] = useState<number>(1.15);
  const [gaugeUnification, setGaugeUnification] = useState<number>(0.98);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SpectralActionResult | null>(null);

  const fetchTriples = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/connes-spectral-geometry/triples');
      const data = (await res.json().catch(() => ({}))) as {
        triples?: SpectralTriple[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Connes spectral triples');
      }
      if (data.triples) {
        setTriples(data.triples);
        if (data.triples.length > 0) {
          setSelectedTriple((prev) => prev || data.triples![0].triple_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading spectral triples';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchTriples();
  }, [fetchTriples]);

  const handleEvaluate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/connes-spectral-geometry/evaluate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triple_id: selectedTriple,
          energy_cutoff_gev: Math.pow(10, energyCutoffLog),
          heat_kernel_order: 4,
          dixmier_trace_scale: dixmierScale,
          gauge_coupling_unification: gaugeUnification,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SpectralActionResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to evaluate Connes-Chamseddine spectral action');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to execute spectral action evaluation';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Non-Commutative Connes Spectral Geometry Armor
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                  Capability 172
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Spectral triples (A, H, D), Connes-Chamseddine action, and Dixmier trace unification
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchTriples}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Triples
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="my-4 p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-sm flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Spectral Geometry Error</p>
            <p>{errorMsg}</p>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-400 hover:text-red-200 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Non-Commutative Spectral Triple
          </label>
          <select
            value={selectedTriple}
            onChange={(e) => setSelectedTriple(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
          >
            {triples.map((t) => (
              <option key={t.triple_id} value={t.triple_id}>
                {t.triple_id} ({t.ko_dimension})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Energy Cutoff Scale Λ (10^{energyCutoffLog} GeV)
          </label>
          <input
            type="range"
            min={10}
            max={19}
            step={1}
            value={energyCutoffLog}
            onChange={(e) => setEnergyCutoffLog(parseInt(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>10^10 GeV</span>
            <span>10^16 (GUT)</span>
            <span>10^19 (Planck)</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Dixmier Trace Scale ({dixmierScale.toFixed(2)}x)
          </label>
          <input
            type="range"
            min={0.5}
            max={2.5}
            step={0.05}
            value={dixmierScale}
            onChange={(e) => setDixmierScale(parseFloat(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0.50x</span>
            <span>1.15x</span>
            <span>2.50x</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-violet-600/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Evaluating Spectral Action...' : 'Evaluate Spectral Action & Dixmier'}
        </button>
      </div>

      {telemetry && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Connes Spectral Armor Active
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Dixmier Trace Tr_ω</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {telemetry.dixmier_trace.toFixed(6)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Spectral Action S</span>
              <span className="text-base font-bold font-mono text-cyan-400">
                {telemetry.total_spectral_action.toFixed(6)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Geometric Barrier</span>
              <span className="text-base font-bold font-mono text-violet-400">
                {telemetry.noncommutative_barrier_gev.toExponential(2)} GeV
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Spectral Suppression</span>
              <span className="text-base font-bold font-mono text-purple-400">
                {telemetry.spectral_suppression_db.toFixed(1)} dB
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
