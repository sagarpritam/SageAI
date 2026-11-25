"use client";

import React, { useState, useEffect } from "react";
import { Compass, Activity, RefreshCw, Zap, Lock, AlertTriangle, Shield } from "lucide-react";

interface BordismConfig {
  bordism_id: string;
  spacetime_dimension_n: number;
  boundary_genus_g: number;
  cobordism_type: string;
  modular_central_charge_c: number;
  mapping_class_order: number;
  base_gluing_fidelity_pct: number;
  status: string;
}

interface TQFTTelemetry {
  bordism_id: string;
  status: string;
  functor_amplitude: number;
  cobordism_gluing_verified: boolean;
  spacetime_dimension_n: number;
  boundary_genus_g: number;
  tqft_firewall_strength_pev: number;
  anomaly_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function AtiyahSegalTQFTStudio() {
  const [bordisms, setBordisms] = useState<BordismConfig[]>([]);
  const [selectedBordism, setSelectedBordism] = useState<string>("");
  const [gluingCuts, setGluingCuts] = useState<number>(2);
  const [mappingOrder, setMappingOrder] = useState<number>(12);
  const [functorGain, setFunctorGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<TQFTTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBordisms = async () => {
    try {
      const res = await fetch("/api/atiyah-segal-tqft/bordisms");
      if (!res.ok) throw new Error("Failed to fetch bordism configurations");
      const data = await res.json();
      setBordisms(data.bordisms || []);
      if (data.bordisms?.length > 0 && !selectedBordism) {
        setSelectedBordism(data.bordisms[0].bordism_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching bordisms");
    }
  };

  useEffect(() => {
    fetchBordisms();
  }, []);

  const handleEvaluateFunctor = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/atiyah-segal-tqft/evaluate-functor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bordism_id: selectedBordism,
          gluing_cut_count: gluingCuts,
          mapping_class_order: mappingOrder,
          functor_gain: functorGain,
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate Atiyah-Segal TQFT functor");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating functor");
    } finally {
      setLoading(false);
    }
  };

  const currentBordism = bordisms.find((b) => b.bordism_id === selectedBordism);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Atiyah-Segal Axiomatic Functorial TQFT Firewall
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                Capability 184
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Michael Atiyah &amp; Graeme Segal functorial topological field theory Z: Bord_n to Vect_C &amp; cobordism cutting-and-gluing axiom
            </p>
          </div>
        </div>
        <button
          onClick={fetchBordisms}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Bordisms
        </button>
      </div>

      {error && (
        <div className="p-4 bg-indigo-950/50 border border-indigo-800 rounded-lg text-indigo-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Bordism Configuration
          </label>
          <select
            value={selectedBordism}
            onChange={(e) => setSelectedBordism(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {bordisms.map((b) => (
              <option key={b.bordism_id} value={b.bordism_id}>
                {b.bordism_id} (n={b.spacetime_dimension_n}, g={b.boundary_genus_g})
              </option>
            ))}
          </select>
          {currentBordism && (
            <p className="text-xs text-slate-500 italic mt-1">{currentBordism.cobordism_type}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Gluing Cut Slices: {gluingCuts}
          </label>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={gluingCuts}
            onChange={(e) => setGluingCuts(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>1 (Single Cut)</span>
            <span>8 (Multi-Pants Decomposition)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Functorial Gain: {functorGain}x
          </label>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.25"
            value={functorGain}
            onChange={(e) => setFunctorGain(parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.5x</span>
            <span>3.0x</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleEvaluateFunctor}
          disabled={loading || !selectedBordism}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-indigo-950/50 transition cursor-pointer"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Enforce Atiyah-Segal TQFT Firewall
        </button>
      </div>

      {telemetry && (
        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              TQFT Functor Telemetry
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Functor Amplitude</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.functor_amplitude}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Dimension n / Genus g</p>
              <p className="text-lg font-bold text-indigo-400 mt-0.5">n={telemetry.spacetime_dimension_n} / g={telemetry.boundary_genus_g}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Firewall Strength</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.tqft_firewall_strength_pev} PeV</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Anomaly Suppression</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">+{telemetry.anomaly_suppression_db} dB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AtiyahSegalTQFTStudio;
