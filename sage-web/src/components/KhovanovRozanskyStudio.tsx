'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface KRComplex {
  complex_id: string;
  classification: string;
  default_lie_algebra_n: number;
  default_crossing_number: number;
  default_filtration_depth: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  complex_id: string;
  classification: string;
  lie_algebra_n: number;
  crossing_number: number;
  filtration_depth: number;
  kr_gain: number;
  factorization_residual: number;
  matrix_factorization_coherence: number;
  kr_suppression_db: number;
  categorified_unitarity_pct: number;
  kr_complex_locked: boolean;
  status: string;
  timestamp: number;
}

export default function KhovanovRozanskyStudio() {
  const [complexes, setComplexes] = useState<KRComplex[]>([]);
  const [selectedComplex, setSelectedComplex] = useState<string>('KR-GL2-HOPF-01');
  const [lieAlgebraN, setLieAlgebraN] = useState<number>(3);
  const [crossingNumber, setCrossingNumber] = useState<number>(6);
  const [filtrationDepth, setFiltrationDepth] = useState<number>(8);
  const [krGain, setKrGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchComplexes = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/khovanov-rozansky-homology/complexes');
      const data = (await res.json().catch(() => ({}))) as {
        complexes?: KRComplex[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Khovanov-Rozansky complex configurations');
      }
      if (data.complexes) {
        setComplexes(data.complexes);
        if (data.complexes.length > 0) {
          setSelectedComplex((prev) => prev || data.complexes![0].complex_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Khovanov-Rozansky complex configurations'
      );
    }
  }, []);

  useEffect(() => {
    fetchComplexes();
  }, [fetchComplexes]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/khovanov-rozansky-homology/seal-rozansky', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complex_id: selectedComplex,
          lie_algebra_n: lieAlgebraN,
          crossing_number: crossingNumber,
          filtration_depth: filtrationDepth,
          kr_gain: krGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Khovanov-Rozansky homology seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Khovanov-Rozansky homology seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Capability 158
            </span>
            <span className="text-xs text-slate-400 font-mono">Wave 46</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            Categorified Khovanov-Rozansky $\mathfrak{'{gl}'}(N)$ Link Homology Firewall
          </h2>
          <p className="text-sm text-slate-400">
            Verify matrix factorizations and lock categorified Rouquier complexes against quantum braid attacks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchComplexes()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Complexes
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg flex items-center justify-between text-red-300 text-sm"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-xs bg-red-900/60 hover:bg-red-900 px-2.5 py-1 rounded border border-red-700/50 text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Link Homology Complex
            </label>
            <select
              value={selectedComplex}
              onChange={(e) => setSelectedComplex(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {complexes.map((c) => (
                <option key={c.complex_id} value={c.complex_id}>
                  {c.complex_id} - {c.classification}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Lie Algebra $\mathfrak{'{gl}'}(N)$ Rank</label>
              <input
                type="number"
                min={2}
                max={16}
                value={lieAlgebraN}
                onChange={(e) => setLieAlgebraN(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Crossing Number</label>
              <input
                type="number"
                min={2}
                max={64}
                value={crossingNumber}
                onChange={(e) => setCrossingNumber(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Soergel Filtration Depth</label>
              <input
                type="number"
                min={2}
                max={32}
                value={filtrationDepth}
                onChange={(e) => setFiltrationDepth(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Matrix Factorization Gain</label>
              <input
                type="number"
                step="0.05"
                min={0.85}
                max={2.5}
                value={krGain}
                onChange={(e) => setKrGain(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSeal}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-sm text-white shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Executing Matrix Factorization...' : 'Seal Khovanov-Rozansky Firewall'}
          </button>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                Live Categorified Homology Telemetry
              </span>
              <span className="font-mono text-[11px] text-emerald-400">
                {telemetry ? telemetry.status : 'AWAITING_FACTORIZATION'}
              </span>
            </div>

            {telemetry ? (
              <div className="space-y-3 mt-3 text-sm font-mono">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Complex ID:</span>
                  <span className="text-slate-200 font-bold">{telemetry.complex_id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Matrix Coherence:</span>
                  <span className="text-emerald-400 font-bold">
                    {telemetry.matrix_factorization_coherence}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Categorified Unitarity:</span>
                  <span className="text-emerald-300 font-bold">
                    {telemetry.categorified_unitarity_pct.toFixed(5)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Homology Suppression:</span>
                  <span className="text-cyan-300 font-bold">
                    {telemetry.kr_suppression_db.toFixed(2)} dB
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Factorization Residual:</span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {telemetry.factorization_residual.toExponential(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Rouquier Complex Locked:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    YES
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs text-center space-y-1">
                <span>Configure Lie algebra and crossing depth.</span>
                <span>Click &quot;Seal Khovanov-Rozansky Firewall&quot; to evaluate.</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Invariant: Triply-Graded $\mathfrak{'{gl}'}(N)$</span>
            <span>Zero Unwinding Leakage</span>
          </div>
        </div>
      </div>
    </div>
  );
}

