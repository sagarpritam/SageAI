"use client";

import React, { useState, useEffect } from "react";
import { Layers, Activity, RefreshCw, Zap, Lock, AlertTriangle, Shield } from "lucide-react";

interface DeligneVariety {
  variety_id: string;
  group_type: string;
  weyl_element_w: string;
  weyl_length_l: number;
  finite_field_q: number;
  unipotent_degrees: number[];
  base_orthogonality_fidelity_pct: number;
  status: string;
}

interface DLTelemetry {
  variety_id: string;
  status: string;
  green_function_val: number;
  weyl_length_l: number;
  finite_field_q: number;
  cohomology_degree: number;
  dl_barrier_strength_pev: number;
  character_suppression_db: number;
  effective_fidelity_pct: number;
  character_orthogonality_verified: boolean;
  timestamp: number;
}

export function DeligneLusztigStudio() {
  const [varieties, setVarieties] = useState<DeligneVariety[]>([]);
  const [selectedVariety, setSelectedVariety] = useState<string>("");
  const [cohomologyDegree, setCohomologyDegree] = useState<number>(2);
  const [unipotentRank, setUnipotentRank] = useState<number>(3);
  const [representationGain, setRepresentationGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<DLTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVarieties = async () => {
    try {
      const res = await fetch("/api/deligne-lusztig-character/varieties");
      if (!res.ok) throw new Error("Failed to fetch Deligne-Lusztig varieties");
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

  const handleEvaluateCharacter = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/deligne-lusztig-character/evaluate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variety_id: selectedVariety,
          cohomology_degree: cohomologyDegree,
          unipotent_rank: unipotentRank,
          representation_gain: representationGain,
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate Deligne-Lusztig character");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating character");
    } finally {
      setLoading(false);
    }
  };

  const currentVariety = varieties.find((v) => v.variety_id === selectedVariety);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Deligne-Lusztig Character Sheaves Barrier
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                Capability 183
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Pierre Deligne &amp; George Lusztig varieties X(w), compactly supported etale cohomology &amp; virtual representation orthogonality
            </p>
          </div>
        </div>
        <button
          onClick={fetchVarieties}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Varieties
        </button>
      </div>

      {error && (
        <div className="p-4 bg-purple-950/50 border border-purple-800 rounded-lg text-purple-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-purple-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Deligne-Lusztig Variety X(w)
          </label>
          <select
            value={selectedVariety}
            onChange={(e) => setSelectedVariety(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {varieties.map((v) => (
              <option key={v.variety_id} value={v.variety_id}>
                {v.variety_id} (F_{v.finite_field_q}, l={v.weyl_length_l})
              </option>
            ))}
          </select>
          {currentVariety && (
            <p className="text-xs text-slate-500 italic mt-1">{currentVariety.group_type}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Etale Cohomology Degree H_c^i: {cohomologyDegree}
          </label>
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={cohomologyDegree}
            onChange={(e) => setCohomologyDegree(parseInt(e.target.value, 10))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0 (Base)</span>
            <span>12 (Top)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Representation Gain: {representationGain}x
          </label>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.25"
            value={representationGain}
            onChange={(e) => setRepresentationGain(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.5x</span>
            <span>3.0x</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleEvaluateCharacter}
          disabled={loading || !selectedVariety}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-purple-950/50 transition cursor-pointer"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Enforce Character Sheaves Barrier
        </button>
      </div>

      {telemetry && (
        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Deligne-Lusztig Character Telemetry
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Green Function Q(u)</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.green_function_val}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Field Size q / Weyl l(w)</p>
              <p className="text-lg font-bold text-purple-400 mt-0.5">q={telemetry.finite_field_q} / l={telemetry.weyl_length_l}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Barrier Strength</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.dl_barrier_strength_pev} PeV</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Character Suppression</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">+{telemetry.character_suppression_db} dB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeligneLusztigStudio;
