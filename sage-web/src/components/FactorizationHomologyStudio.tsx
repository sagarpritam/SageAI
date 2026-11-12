'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Layers } from 'lucide-react';

interface FactorizationManifold {
  manifold_id: string;
  classification: string;
  default_operad_dim: number;
  default_excision_depth: number;
  default_koszul_order: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  manifold_id: string;
  classification: string;
  operad_dimension: number;
  excision_strata_depth: number;
  koszul_duality_order: number;
  excision_gain: number;
  ayala_francis_excision_residual: number;
  en_disk_homology_coherence: number;
  operadic_suppression_db: number;
  factorization_unitarity_pct: number;
  koszul_self_duality_locked: boolean;
  status: string;
  timestamp: number;
}

export default function FactorizationHomologyStudio() {
  const [manifolds, setManifolds] = useState<FactorizationManifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>('FACTORIZATION-E3-S3-01');
  const [operadDimension, setOperadDimension] = useState<number>(3);
  const [excisionDepth, setExcisionDepth] = useState<number>(12);
  const [koszulOrder, setKoszulOrder] = useState<number>(6);
  const [excisionGain, setExcisionGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchManifolds = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/factorization-homology-tft/manifolds');
      const data = (await res.json().catch(() => ({}))) as {
        manifolds?: FactorizationManifold[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load factorization homology manifolds');
      }
      if (data.manifolds) {
        setManifolds(data.manifolds);
        if (data.manifolds.length > 0) {
          setSelectedManifold((prev) => prev || data.manifolds![0].manifold_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load factorization homology manifolds'
      );
    }
  }, []);

  useEffect(() => {
    fetchManifolds();
  }, [fetchManifolds]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/factorization-homology-tft/seal-manifold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          operad_dimension: operadDimension,
          excision_strata_depth: excisionDepth,
          koszul_duality_order: koszulOrder,
          excision_gain: excisionGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Factorization homology manifold seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Factorization homology manifold seal failed'
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
            <Layers className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-300">
              Capability 140: Ayala-Francis Factorization Homology &amp; E_n-Disk Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Stratified E_n-disk excision, Swiss-cheese operadic defects &amp; Koszul self-duality verification
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchManifolds}
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
        {manifolds.map((m) => (
          <button
            type="button"
            key={m.manifold_id}
            onClick={() => setSelectedManifold(m.manifold_id)}
            aria-pressed={selectedManifold === m.manifold_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedManifold === m.manifold_id
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-indigo-400">
                {m.manifold_id}
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                {m.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{m.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                E_{m.default_operad_dim} | Excision={m.default_excision_depth}
              </div>
              <div>Base Suppression: {m.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Operad Dimension (n)
            </label>
            <input
              type="number"
              min={1}
              max={12}
              step={1}
              value={operadDimension}
              onChange={(e) => setOperadDimension(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Excision Strata Depth
            </label>
            <input
              type="number"
              min={4}
              max={128}
              step={2}
              value={excisionDepth}
              onChange={(e) => setExcisionDepth(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Koszul Duality Order
            </label>
            <input
              type="number"
              min={2}
              max={32}
              step={1}
              value={koszulOrder}
              onChange={(e) => setKoszulOrder(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Excision Gluing Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={excisionGain}
              onChange={(e) => setExcisionGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-indigo-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {loading
              ? 'Sealing Factorization Manifold...'
              : 'Verify Ayala-Francis Excision & Seal E_n Manifold'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-indigo-950/20 border border-indigo-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-900/50 pb-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Factorization Homology Telemetry ({telemetry.manifold_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Factorization Unitarity</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.factorization_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Operadic Suppression</div>
              <div className="text-base font-bold text-violet-300">
                {telemetry.operadic_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">E_n Coherence</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.en_disk_homology_coherence}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Excision Residual</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.ayala_francis_excision_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

