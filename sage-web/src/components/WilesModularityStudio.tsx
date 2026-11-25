"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, KeyRound } from "lucide-react";

interface DeformationRing {
  ring_id: string;
  name: string;
  conductor_n: number;
  residue_prime: number;
  selmer_rank: number;
  modularity_lifting_verified: boolean;
  base_fidelity_pct: number;
}

interface WilesTelemetry {
  ring_id: string;
  status: string;
  r_equals_t_defect: number;
  modularity_lifting_verified: boolean;
  conductor_n: number;
  residue_prime: number;
  wiles_barrier_strength_pev: number;
  galois_obstruction_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function WilesModularityStudio() {
  const [rings, setRings] = useState<DeformationRing[]>([]);
  const [selectedRing, setSelectedRing] = useState<string>("");
  const [conductorN, setConductorN] = useState<number>(11);
  const [residuePrime, setResiduePrime] = useState<number>(3);
  const [barrierGain, setBarrierGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<WilesTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRings = async () => {
    try {
      const res = await fetch("/api/wiles-taylor-modularity-lifting/rings");
      if (!res.ok) throw new Error("Failed to fetch Galois deformation rings");
      const data = await res.json();
      setRings(data.rings || []);
      if (data.rings?.length > 0 && !selectedRing) {
        setSelectedRing(data.rings[0].ring_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching rings");
    }
  };

  useEffect(() => {
    fetchRings();
  }, []);

  const evaluateLifting = async () => {
    if (!selectedRing) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wiles-taylor-modularity-lifting/evaluate-modularity-lifting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ring_id: selectedRing,
          conductor_n: conductorN,
          residue_prime: residuePrime,
          barrier_gain: barrierGain,
        }),
      });
      if (!res.ok) throw new Error("Modularity lifting evaluation failed");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating lifting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Wiles-Taylor Modularity Lifting Barrier
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Capability 204
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              R = T Modularity Lifting Theorem, Galois deformation rings, Taylor-Wiles patching &amp; Frey-Hellegouarch semistable obstruction elimination
            </p>
          </div>
        </div>
        <button
          onClick={fetchRings}
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
              Target Deformation Ring
            </label>
            <select
              value={selectedRing}
              onChange={(e) => setSelectedRing(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {rings.map((r) => (
                <option key={r.ring_id} value={r.ring_id}>
                  {r.name} ({r.ring_id})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Conductor N: {conductorN}
              </label>
              <input
                type="range"
                min="11"
                max="97"
                step="2"
                value={conductorN}
                onChange={(e) => setConductorN(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Residue Prime p: {residuePrime}
              </label>
              <select
                value={residuePrime}
                onChange={(e) => setResiduePrime(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value={3}>p = 3 (Langlands-Tunnell Base)</option>
                <option value={5}>p = 5 (3-5 Switch Patching)</option>
                <option value={7}>p = 7 (Septenary Galois Lifting)</option>
              </select>
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
            onClick={evaluateLifting}
            disabled={loading || !selectedRing}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-indigo-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Patching Hecke Algebra...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Enforce R = T Modularity
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
                  <span className="text-xs text-slate-400 block mb-1">Conductor N</span>
                  <span className="text-lg font-bold text-indigo-400">
                    N = {telemetry.conductor_n}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Barrier Strength</span>
                  <span className="text-lg font-bold text-violet-400">
                    {telemetry.wiles_barrier_strength_pev.toFixed(2)} PeV
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Galois Suppr</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.galois_obstruction_suppression_db.toFixed(1)} dB
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Fidelity</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {telemetry.effective_fidelity_pct.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Andrew Wiles &amp; Richard Taylor R = T Invariants
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Residue Prime (p):</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.residue_prime}</div>

                  <div className="text-slate-400">R = T Isomorphism Defect:</div>
                  <div className="text-slate-200 font-mono text-right">
                    {telemetry.r_equals_t_defect.toExponential(4)}
                  </div>

                  <div className="text-slate-400">Modularity Lifting:</div>
                  <div className="text-indigo-400 font-semibold text-right flex items-center justify-end gap-1">
                    <Lock className="w-3.5 h-3.5" />{" "}
                    {telemetry.modularity_lifting_verified ? "R = T PATCHING LOCKED" : "DEVIATING"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <KeyRound className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Deformation Ring Evaluated</p>
              <p className="text-sm">Select a deformation ring and enforce R = T modularity lifting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
