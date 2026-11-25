"use client";

import React, { useState, useEffect } from "react";
import { Layers, Activity, RefreshCw, Zap, Lock, AlertTriangle, Shield } from "lucide-react";

interface SingularVariety {
  variety_id: string;
  name: string;
  variety_type: string;
  dimension_n: number;
  singular_strata_codimension: number;
  chow_homology_rank: number;
  todd_class_degree: number;
  intersection_pairing_valid: boolean;
  status: string;
}

interface GRRTelemetry {
  variety_id: string;
  status: string;
  grr_commutativity_defect: number;
  stratification_depth: number;
  todd_degree: number;
  grr_commutativity_verified: boolean;
  intersection_pairing_valid: boolean;
  bfm_barrier_strength_pev: number;
  singularity_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function GRRBaumFultonStudio() {
  const [varieties, setVarieties] = useState<SingularVariety[]>([]);
  const [selectedVariety, setSelectedVariety] = useState<string>("");
  const [stratificationDepth, setStratificationDepth] = useState<number>(3);
  const [toddDegree, setToddDegree] = useState<number>(4);
  const [barrierGain, setBarrierGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<GRRTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVarieties = async () => {
    try {
      const res = await fetch("/api/grr-baum-fulton-macpherson/varieties");
      if (!res.ok) throw new Error("Failed to fetch singular varieties");
      const data = await res.json();
      setVarieties(data.varieties || []);
      if (data.varieties?.length > 0 && !selectedVariety) {
        setSelectedVariety(data.varieties[0].variety_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching varieties");
    }
  };

  useEffect(() => {
    fetchVarieties();
  }, []);

  const handleComputeChernCharacter = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/grr-baum-fulton-macpherson/compute-singular-chern-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variety_id: selectedVariety,
          stratification_depth: stratificationDepth,
          todd_degree: toddDegree,
          barrier_gain: barrierGain,
        }),
      });
      if (!res.ok) throw new Error("Failed to compute singular Chern character");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error computing Chern character");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-teal-400" />
            Grothendieck-Riemann-Roch & Baum-Fulton-MacPherson Barrier Studio
          </h2>
          <p className="text-sm text-zinc-400">
            Capability 189: Extends GRR to singular algebraic varieties, Chow homology groups A_*(X) x Q, and intersection homology strata.
          </p>
        </div>
        <button
          onClick={fetchVarieties}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md border border-zinc-700 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Varieties
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-sm text-red-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-1 bg-zinc-900/50 p-5 rounded-xl border border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono">
            Singular Scheme Configuration
          </h3>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Select Singular Variety</label>
            <select
              value={selectedVariety}
              onChange={(e) => setSelectedVariety(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
            >
              {varieties.map((v) => (
                <option key={v.variety_id} value={v.variety_id}>
                  {v.variety_id} ({v.variety_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Stratification Filtration Depth</label>
            <input
              type="number"
              min={1}
              max={12}
              value={stratificationDepth}
              onChange={(e) => setStratificationDepth(parseInt(e.target.value) || 3)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Todd Class Degree</label>
            <input
              type="number"
              min={1}
              max={16}
              value={toddDegree}
              onChange={(e) => setToddDegree(parseInt(e.target.value) || 4)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Barrier Gain: {barrierGain}x</label>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.05"
              value={barrierGain}
              onChange={(e) => setBarrierGain(parseFloat(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>

          <button
            onClick={handleComputeChernCharacter}
            disabled={loading || !selectedVariety}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-teal-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Compute Singular GRR
          </button>
        </div>

        <div className="space-y-4 md:col-span-2 bg-zinc-900/50 p-5 rounded-xl border border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono mb-3">
              Chow Homology & BFM Intersection Telemetry
            </h3>

            {telemetry ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Status</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                      <Lock className="h-3 w-3" />
                      {telemetry.status}
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">GRR Defect</span>
                    <span className="text-xs font-bold text-teal-300 font-mono mt-0.5 block">
                      {telemetry.grr_commutativity_defect.toFixed(6)}
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Intersection Valid</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">
                      {telemetry.intersection_pairing_valid ? "TRUE (PERVERSE VERIFIED)" : "FALSE"}
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Barrier Strength</span>
                    <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                      {telemetry.bfm_barrier_strength_pev.toFixed(1)} PeV
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Singularity Suppr</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">
                      {telemetry.singularity_suppression_db.toFixed(1)} dB
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Effective Fidelity</span>
                    <span className="text-xs font-bold text-teal-400 font-mono mt-0.5 block">
                      {telemetry.effective_fidelity_pct.toFixed(4)}%
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-800/40 rounded border border-zinc-700/40 text-xs font-mono text-zinc-300 space-y-1">
                  <div>• Variety ID: {telemetry.variety_id}</div>
                  <div>• GRR Commutativity Verified: {telemetry.grr_commutativity_verified ? "YES" : "NO"}</div>
                  <div>• Stratification Depth: {telemetry.stratification_depth}</div>
                  <div>• Todd Class Degree: {telemetry.todd_degree}</div>
                </div>
              </div>
            ) : (
              <div className="h-48 border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-500 text-xs font-mono">
                <Activity className="h-8 w-8 mb-2 opacity-30 text-teal-400" />
                Select a singular variety and compute Baum-Fulton-MacPherson Chern character.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Shield className="h-3 w-3" />
              GRR BFM Barrier Operational
            </span>
            <span>Centesimal Sovereign Era • v9.6.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GRRBaumFultonStudio;
