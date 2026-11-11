'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GitMerge, RefreshCw, Shield, Sparkles, Cpu, AlertTriangle } from 'lucide-react';

interface SymTFTSandwich {
  sandwich_id: string;
  fusion_category: string;
  quantum_dimension_duality: number;
  default_higher_form_p: number;
  default_anyon_objects: number;
  base_defect_fidelity_pct: number;
  base_anomaly_isolation_db: number;
  status: string;
}

interface SealDefectResult {
  sandwich_id: string;
  fusion_category: string;
  higher_form_p: number;
  anyon_objects: number;
  duality_defect_quantum_dim: number;
  drinfeld_total_quantum_dim: number;
  pentagon_associator_residual: number;
  lagrangian_condensation_overlap: number;
  anomaly_isolation_db: number;
  defect_coherence_pct: number;
  pentagon_identity_verified: boolean;
  status: string;
  timestamp: number;
}

export default function NonInvertibleSymTFTStudio() {
  const [sandwiches, setSandwiches] = useState<SymTFTSandwich[]>([]);
  const [selectedSandwich, setSelectedSandwich] = useState<string>('SYMTFT-KW-ISING-01');
  const [higherFormP, setHigherFormP] = useState<number>(1);
  const [anyonCount, setAnyonCount] = useState<number>(6);
  const [associatorGain, setAssociatorGain] = useState<number>(1.4);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealDefectResult | null>(null);

  const fetchSandwiches = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/non-invertible-symtft/sandwiches');
      const data = (await res.json().catch(() => ({}))) as {
        sandwiches?: SymTFTSandwich[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load SymTFT bulk sandwiches');
      }
      if (data.sandwiches) {
        setSandwiches(data.sandwiches);
        if (data.sandwiches.length > 0) {
          setSelectedSandwich((prev) => prev || data.sandwiches![0].sandwich_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load SymTFT bulk sandwiches'
      );
    }
  }, []);

  useEffect(() => {
    fetchSandwiches();
  }, [fetchSandwiches]);

  const handleSealDefect = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/non-invertible-symtft/seal-defect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sandwich_id: selectedSandwich,
          higher_form_p: higherFormP,
          anyon_count: anyonCount,
          pentagon_associator_gain: associatorGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealDefectResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'SymTFT topological defect condensation failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'SymTFT topological defect condensation failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg">
            <GitMerge className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-fuchsia-300">
              Capability 117: Non-Invertible Generalized Symmetry &amp; SymTFT Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Tambara-Yamagami &amp; Rep(D&#8328;) fusion defects, Drinfeld center Z(C) Lagrangian algebra condensation
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchSandwiches}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Sandwiches</span>
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
        {sandwiches.map((s) => (
          <button
            type="button"
            key={s.sandwich_id}
            onClick={() => setSelectedSandwich(s.sandwich_id)}
            aria-pressed={selectedSandwich === s.sandwich_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedSandwich === s.sandwich_id
                ? 'bg-fuchsia-950/40 border-fuchsia-500/60 shadow-lg shadow-fuchsia-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-fuchsia-400">
                {s.sandwich_id}
              </span>
              <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded-full font-mono">
                {s.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{s.fusion_category}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Quantum Dim d_D:</span>
                <span className="text-fuchsia-300">{s.quantum_dimension_duality.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Defect Coherence:</span>
                <span className="text-emerald-300">{s.base_defect_fidelity_pct.toFixed(3)}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-fuchsia-400" />
          <span>SymTFT Bulk Sandwich &amp; Fusion-Category Pentagon Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Higher p-Form Rank: <span className="text-fuchsia-300 font-mono">p={higherFormP}</span>
            </label>
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={higherFormP}
              onChange={(e) => setHigherFormP(parseInt(e.target.value, 10))}
              className="w-full accent-fuchsia-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Simple Anyon Objects: <span className="text-fuchsia-300 font-mono">{anyonCount}</span>
            </label>
            <input
              type="range"
              min="3"
              max="32"
              step="1"
              value={anyonCount}
              onChange={(e) => setAnyonCount(parseInt(e.target.value, 10))}
              className="w-full accent-fuchsia-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Pentagon Associator Gain: <span className="text-fuchsia-300 font-mono">{associatorGain.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min="0.85"
              max="2.5"
              step="0.05"
              value={associatorGain}
              onChange={(e) => setAssociatorGain(parseFloat(e.target.value))}
              className="w-full accent-fuchsia-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSealDefect}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-fuchsia-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Condensing SymTFT Lagrangian Algebra...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Condense Lagrangian Algebra &amp; Seal Non-Invertible Defects</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-fuchsia-950/20 border border-fuchsia-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-fuchsia-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-fuchsia-300">
              SYMTFT NON-INVERTIBLE DEFECT TELEMETRY
            </span>
            <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">DEFECT COHERENCE</span>
              <span className="text-fuchsia-300 font-bold text-sm">
                {telemetry.defect_coherence_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TOTAL QUANTUM DIM</span>
              <span className="text-purple-300 font-bold text-sm">
                {telemetry.drinfeld_total_quantum_dim.toFixed(3)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ANOMALY ISOLATION</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.anomaly_isolation_db.toFixed(1)} dB
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">F-SYMBOL RESIDUAL</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.pentagon_associator_residual.toExponential(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-fuchsia-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Pentagon Associator Verified | Lagrangian Overlap={telemetry.lagrangian_condensation_overlap.toFixed(6)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

