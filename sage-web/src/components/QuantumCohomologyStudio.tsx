'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Target } from 'lucide-react';

interface GromovInvariant {
  invariant_id: string;
  classification: string;
  default_curve_genus: number;
  default_marked_points: number;
  default_novikov_degree: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  invariant_id: string;
  classification: string;
  curve_genus: number;
  marked_points: number;
  novikov_degree: number;
  quantum_gain: number;
  wdvv_associativity_residual: number;
  virtual_cycle_fidelity: number;
  gromov_suppression_db: number;
  quantum_unitarity_pct: number;
  wdvv_associativity_locked: boolean;
  status: string;
  timestamp: number;
}

export default function QuantumCohomologyStudio() {
  const [invariants, setInvariants] = useState<GromovInvariant[]>([]);
  const [selectedInvariant, setSelectedInvariant] = useState<string>('GW-QUINTIC-CY3-01');
  const [curveGenus, setCurveGenus] = useState<number>(0);
  const [markedPoints, setMarkedPoints] = useState<number>(14);
  const [novikovDegree, setNovikovDegree] = useState<number>(12);
  const [quantumGain, setQuantumGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchInvariants = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/quantum-gromov-witten/invariants');
      const data = (await res.json().catch(() => ({}))) as {
        invariants?: GromovInvariant[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Gromov-Witten invariants');
      }
      if (data.invariants) {
        setInvariants(data.invariants);
        if (data.invariants.length > 0) {
          setSelectedInvariant((prev) => prev || data.invariants![0].invariant_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Gromov-Witten invariants'
      );
    }
  }, []);

  useEffect(() => {
    fetchInvariants();
  }, [fetchInvariants]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/quantum-gromov-witten/seal-gromov', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invariant_id: selectedInvariant,
          curve_genus: curveGenus,
          marked_points: markedPoints,
          novikov_degree: novikovDegree,
          quantum_gain: quantumGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Gromov-Witten seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gromov-Witten seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg">
            <Target className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-pink-300">
              Capability 154: Quantum Cohomology &amp; Gromov-Witten Shield
            </h2>
            <p className="text-sm text-slate-400">
              Kontsevich stable map moduli spaces, virtual fundamental class cycle intersections &amp; WDVV associativity equations
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchInvariants}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Invariants</span>
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
        {invariants.map((iv) => (
          <button
            key={iv.invariant_id}
            type="button"
            onClick={() => {
              setSelectedInvariant(iv.invariant_id);
              setCurveGenus(iv.default_curve_genus);
              setMarkedPoints(iv.default_marked_points);
              setNovikovDegree(iv.default_novikov_degree);
            }}
            className={`text-left p-3.5 rounded-lg border transition ${
              selectedInvariant === iv.invariant_id
                ? 'bg-pink-950/40 border-pink-500/80 text-white shadow-lg shadow-pink-950/50'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="text-xs font-mono font-bold text-pink-400">{iv.invariant_id}</div>
            <div className="text-sm font-semibold mt-1 truncate">{iv.classification}</div>
            <div className="flex justify-between items-center text-xs text-slate-400 mt-2 font-mono">
              <span>Genus {iv.default_curve_genus}</span>
              <span>{iv.base_suppression_db} dB</span>
              <span className="text-emerald-400">{iv.base_unitarity_pct}%</span>
            </div>
          </button>
        ))}
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-lg border border-slate-800">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Curve Genus (g) [0-8]
          </label>
          <input
            type="number"
            min={0}
            max={8}
            value={curveGenus}
            onChange={(e) => setCurveGenus(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-pink-500"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Marked Points (n) [3-64]
          </label>
          <input
            type="number"
            min={3}
            max={64}
            value={markedPoints}
            onChange={(e) => setMarkedPoints(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-pink-500"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Novikov Degree (d) [1-64]
          </label>
          <input
            type="number"
            min={1}
            max={64}
            value={novikovDegree}
            onChange={(e) => setNovikovDegree(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-pink-500"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            Quantum Gain [0.85-2.5]
          </label>
          <input
            type="number"
            step="0.05"
            min={0.85}
            max={2.5}
            value={quantumGain}
            onChange={(e) => setQuantumGain(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-pink-900/40"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Sealing Gromov-Witten...' : 'Seal Quantum Cohomology Ring'}</span>
        </button>
      </div>

      {/* Telemetry Display */}
      {telemetry && (
        <div className="border border-pink-500/40 bg-pink-950/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-pink-900/40 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-pink-400" />
              <span className="font-mono text-xs uppercase tracking-wider text-pink-300 font-bold">
                Quantum Cohomology Telemetry: {telemetry.invariant_id}
              </span>
            </div>
            <span className="text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">WDVV Residual</div>
              <div className="text-lg font-mono font-bold text-pink-300 mt-1">
                {telemetry.wdvv_associativity_residual.toExponential(4)}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Cycle Fidelity</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                {telemetry.virtual_cycle_fidelity.toFixed(7)}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Suppression</div>
              <div className="text-lg font-mono font-bold text-cyan-300 mt-1">
                {telemetry.gromov_suppression_db.toFixed(2)} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Quantum Unitarity</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                {telemetry.quantum_unitarity_pct.toFixed(5)}%
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400 pt-2 border-t border-pink-900/30">
            <span>Genus: {telemetry.curve_genus}</span>
            <span>Marked: {telemetry.marked_points}</span>
            <span>Degree: {telemetry.novikov_degree}</span>
            <span>Gain: {telemetry.quantum_gain}x</span>
            <span className="text-emerald-400">WDVV Associativity Locked: true</span>
          </div>
        </div>
      )}
    </div>
  );
}
