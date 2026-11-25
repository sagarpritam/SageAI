"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Waves, CheckCircle2, AlertTriangle } from "lucide-react";

interface SymplecticManifold {
  manifold_id: string;
  manifold_name: string;
  symplectic_form: string;
  seiberg_witten_invariant: number;
  gromov_invariant: number;
  canonical_degree_k: number;
  base_sw_fidelity_pct: number;
  status: string;
}

interface TaubesTelemetry {
  manifold_id: string;
  status: string;
  seiberg_witten_invariant: number;
  gromov_invariant: number;
  sw_gromov_equivalent: boolean;
  vortex_energy: number;
  vortex_parameter_r: number;
  taubes_barrier_strength_pev: number;
  vortex_suppression_db: number;
  effective_fidelity_pct: number;
  pseudoholomorphic_foliation_locked: boolean;
  timestamp: number;
}

export function TaubesVortexStudio() {
  const [manifolds, setManifolds] = useState<SymplecticManifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>("");
  const [vortexR, setVortexR] = useState<number>(1.0);
  const [perturbationEta, setPerturbationEta] = useState<number>(0.01);
  const [couplingGain, setCouplingGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<TaubesTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchManifolds = async () => {
    try {
      const res = await fetch("/api/taubes-vortex-sw/manifolds");
      if (!res.ok) throw new Error("Failed to fetch symplectic manifolds");
      const data = await res.json();
      setManifolds(data.manifolds || []);
      if (data.manifolds?.length > 0 && !selectedManifold) {
        setSelectedManifold(data.manifolds[0].manifold_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching manifolds");
    }
  };

  useEffect(() => {
    fetchManifolds();
  }, []);

  const handleEquateSWGr = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/taubes-vortex-sw/equate-sw-gromov", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          vortex_parameter_r: vortexR,
          perturbation_eta: perturbationEta,
          coupling_gain: couplingGain,
        }),
      });
      if (!res.ok) throw new Error("Failed to equate SW and Gromov invariants");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error equating SW and Gr");
    } finally {
      setLoading(false);
    }
  };

  const currentManifold = manifolds.find((m) => m.manifold_id === selectedManifold);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Taubes Vortices & SW=Gr Equivalence Barrier
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                Capability 180
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Clifford Taubes vortex equations, Seiberg-Witten and Gromov invariant duality SW(X) = Gr(X), and symplectic pseudoholomorphic foliations
            </p>
          </div>
        </div>
        <button
          onClick={fetchManifolds}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Manifolds
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Symplectic 4-Manifold
          </label>
          <select
            value={selectedManifold}
            onChange={(e) => setSelectedManifold(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {manifolds.map((m) => (
              <option key={m.manifold_id} value={m.manifold_id}>
                {m.manifold_id} ({m.manifold_name})
              </option>
            ))}
          </select>
          {currentManifold && (
            <p className="text-xs text-slate-500 italic mt-1">{currentManifold.symplectic_form}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Taubes Vortex Parameter r: {vortexR}
          </label>
          <input
            type="range"
            min="0.2"
            max="5.0"
            step="0.2"
            value={vortexR}
            onChange={(e) => setVortexR(parseFloat(e.target.value))}
            className="w-full accent-teal-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.2 (Weak Vortex)</span>
            <span>5.0 (Strong Vortex)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Symplectic Coupling Gain: {couplingGain}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.25"
            value={couplingGain}
            onChange={(e) => setCouplingGain(parseFloat(e.target.value))}
            className="w-full accent-teal-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.5x</span>
            <span>2.5x</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleEquateSWGr}
          disabled={loading || !selectedManifold}
          className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-teal-950/50 transition cursor-pointer"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Equate Seiberg-Witten &amp; Gromov Invariants
        </button>
      </div>

      {telemetry && (
        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              Taubes Vortex &amp; SW=Gr Telemetry
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">SW = Gr Equivalence</p>
              <p className="text-lg font-bold text-white mt-0.5">
                SW:{telemetry.seiberg_witten_invariant} = Gr:{telemetry.gromov_invariant}
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Vortex Energy</p>
              <p className="text-lg font-bold text-teal-400 mt-0.5">{telemetry.vortex_energy}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Barrier Strength</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.taubes_barrier_strength_pev} PeV</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Suppression</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">+{telemetry.vortex_suppression_db} dB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default TaubesVortexStudio;
