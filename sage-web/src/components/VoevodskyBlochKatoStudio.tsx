"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, GitFork } from "lucide-react";

interface MotivicComplex {
  complex_id: string;
  name: string;
  field: string;
  prime_l: number;
  weight_n: number;
  milnor_k_rank: number;
  etale_cohomology_dim: number;
  base_fidelity_pct: number;
  norm_residue_verified: boolean;
}

interface VoevodskyTelemetry {
  complex_id: string;
  status: string;
  norm_residue_defect: number;
  norm_residue_verified: boolean;
  prime_l: number;
  weight_n: number;
  motivic_cohomology_degree: number;
  voevodsky_barrier_strength_pev: number;
  galois_torsion_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function VoevodskyBlochKatoStudio() {
  const [complexes, setComplexes] = useState<MotivicComplex[]>([]);
  const [selectedComplex, setSelectedComplex] = useState<string>("");
  const [primeL, setPrimeL] = useState<number>(2);
  const [weightN, setWeightN] = useState<number>(3);
  const [barrierGain, setBarrierGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<VoevodskyTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplexes = async () => {
    try {
      const res = await fetch("/api/voevodsky-bloch-kato/complexes");
      if (!res.ok) throw new Error("Failed to fetch motivic complexes");
      const data = await res.json();
      setComplexes(data.complexes || []);
      if (data.complexes?.length > 0 && !selectedComplex) {
        setSelectedComplex(data.complexes[0].complex_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching complexes");
    }
  };

  useEffect(() => {
    fetchComplexes();
  }, []);

  const evaluateIsomorphism = async () => {
    if (!selectedComplex) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/voevodsky-bloch-kato/evaluate-norm-residue-isomorphism", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complex_id: selectedComplex,
          prime_l: primeL,
          weight_n: weightN,
          barrier_gain: barrierGain,
        }),
      });
      if (!res.ok) throw new Error("Norm residue isomorphism evaluation failed");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating isomorphism");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Voevodsky Bloch-Kato Motivic Barrier
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Capability 201
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Norm Residue Isomorphism Theorem, Milnor K-theory mod l &amp; motivic-to-étale spectral sequence synthesis
            </p>
          </div>
        </div>
        <button
          onClick={fetchComplexes}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Target Motivic Complex
            </label>
            <select
              value={selectedComplex}
              onChange={(e) => setSelectedComplex(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {complexes.map((c) => (
                <option key={c.complex_id} value={c.complex_id}>
                  {c.name} ({c.complex_id})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Torsion Prime (l): {primeL}
              </label>
              <select
                value={primeL}
                onChange={(e) => setPrimeL(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value={2}>l = 2 (Milnor Conjecture / Quadratic Forms)</option>
                <option value={3}>l = 3 (Ternary Galois Cohomology)</option>
                <option value={5}>l = 5 (Quinary Motivic Torsion)</option>
                <option value={7}>l = 7 (Septenary Étale Obstruction)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Milnor Weight (n): {weightN}
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={weightN}
                onChange={(e) => setWeightN(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Barrier Gain Multiplier: {barrierGain.toFixed(2)}x
              </label>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.05"
                value={barrierGain}
                onChange={(e) => setBarrierGain(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={evaluateIsomorphism}
            disabled={loading || !selectedComplex}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-indigo-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Evaluating Norm Residue...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Enforce Bloch-Kato Isomorphism
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2">
          {telemetry ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Telemetry Status
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Shield className="w-3.5 h-3.5" /> {telemetry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Cohomology Deg</span>
                  <span className="text-lg font-bold text-indigo-400">
                    n = {telemetry.motivic_cohomology_degree}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Barrier Strength</span>
                  <span className="text-lg font-bold text-violet-400">
                    {telemetry.voevodsky_barrier_strength_pev.toFixed(2)} PeV
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Torsion Suppression</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.galois_torsion_suppression_db.toFixed(1)} dB
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Norm Residue Fid</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {telemetry.effective_fidelity_pct.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Vladimir Voevodsky &amp; Spencer Bloch Motivic Invariants
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Torsion Prime (l):</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.prime_l}</div>

                  <div className="text-slate-400">Milnor K-Theory Weight (n):</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.weight_n}</div>

                  <div className="text-slate-400">Norm Residue Defect:</div>
                  <div className="text-slate-200 font-mono text-right">
                    {telemetry.norm_residue_defect.toExponential(4)}
                  </div>

                  <div className="text-slate-400">Bloch-Kato Isomorphism:</div>
                  <div className="text-indigo-400 font-semibold text-right flex items-center justify-end gap-1">
                    <Lock className="w-3.5 h-3.5" />{" "}
                    {telemetry.norm_residue_verified ? "CANONICAL ISOMORPHISM LOCKED" : "DEVIATING"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <GitFork className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Motivic Complex Evaluated</p>
              <p className="text-sm">Select a complex and enforce the Norm Residue Isomorphism</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
