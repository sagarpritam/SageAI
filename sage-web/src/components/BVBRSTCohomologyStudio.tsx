'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Shield } from 'lucide-react';

interface BVComplex {
  complex_id: string;
  complex_sector: string;
  default_ghost_grading: number;
  default_bracket_order: number;
  default_gauge_fermion_xi: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface EnforceResult {
  complex_id: string;
  complex_sector: string;
  ghost_number_grading: number;
  antifield_bracket_order: number;
  gauge_fermion_xi: number;
  brst_gain: number;
  antibracket_norm: number;
  laplacian_delta_residual: number;
  nilpotent_q2_suppression_db: number;
  cohomology_unitarity_pct: number;
  master_equation_certified: boolean;
  status: string;
  timestamp: number;
}

export default function BVBRSTCohomologyStudio() {
  const [complexes, setComplexes] = useState<BVComplex[]>([]);
  const [selectedComplex, setSelectedComplex] = useState<string>('BV-MASTER-YANG-MILLS-01');
  const [ghostGrading, setGhostGrading] = useState<number>(2);
  const [bracketOrder, setBracketOrder] = useState<number>(4);
  const [gaugeFermionXi, setGaugeFermionXi] = useState<number>(1.2);
  const [brstGain, setBrstGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<EnforceResult | null>(null);

  const fetchComplexes = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/bv-brst-cohomology/complexes');
      const data = (await res.json().catch(() => ({}))) as {
        complexes?: BVComplex[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load BV-BRST antifield complexes');
      }
      if (data.complexes) {
        setComplexes(data.complexes);
        if (data.complexes.length > 0) {
          setSelectedComplex((prev) => prev || data.complexes![0].complex_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load BV-BRST antifield complexes');
    }
  }, []);

  useEffect(() => {
    fetchComplexes();
  }, [fetchComplexes]);

  const handleEnforce = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/bv-brst-cohomology/enforce-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complex_id: selectedComplex,
          ghost_number_grading: ghostGrading,
          antifield_bracket_order: bracketOrder,
          gauge_fermion_xi: gaugeFermionXi,
          brst_gain: brstGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as EnforceResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'BV Quantum Master Equation enforcement failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'BV Quantum Master Equation enforcement failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-300">
              Capability 135: Batalin-Vilkovisky (BV) Antifield BRST Cohomology Master Shield
            </h2>
            <p className="text-sm text-slate-400">
              Quantum Master Equation closure, nilpotent Q^2 = 0 BRST cohomology &amp; Gribov gauge isolation
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchComplexes}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Complexes</span>
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
        {complexes.map((c) => (
          <button
            type="button"
            key={c.complex_id}
            onClick={() => setSelectedComplex(c.complex_id)}
            aria-pressed={selectedComplex === c.complex_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedComplex === c.complex_id
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-cyan-400">{c.complex_id}</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                {c.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{c.complex_sector}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Ghost={c.default_ghost_grading} | Bracket={c.default_bracket_order}</div>
              <div>Base Suppression: {c.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Ghost Grading
            </label>
            <input
              type="number"
              min={1}
              max={16}
              step={1}
              value={ghostGrading}
              onChange={(e) => setGhostGrading(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Antifield Bracket Order
            </label>
            <input
              type="number"
              min={2}
              max={32}
              step={2}
              value={bracketOrder}
              onChange={(e) => setBracketOrder(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Gauge Fermion (xi)
            </label>
            <input
              type="number"
              min={0.25}
              max={6.0}
              step={0.1}
              value={gaugeFermionXi}
              onChange={(e) => setGaugeFermionXi(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              BRST Nilpotent Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={brstGain}
              onChange={(e) => setBrstGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleEnforce}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-cyan-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Closing BV Master Equation...' : 'Enforce BV Quantum Master Equation & Seal BRST'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-cyan-950/20 border border-cyan-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/50 pb-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>BV-BRST Master Equation Telemetry ({telemetry.complex_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Cohomology Unitarity</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.cohomology_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Q^2 Suppression</div>
              <div className="text-base font-bold text-sky-300">
                {telemetry.nilpotent_q2_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Antibracket Norm</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.antibracket_norm}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Delta Residual</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.laplacian_delta_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

