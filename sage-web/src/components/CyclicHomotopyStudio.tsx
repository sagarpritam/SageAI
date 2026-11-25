"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Infinity as InfinityIcon } from "lucide-react";

interface CyclicAlgebra {
  algebra_id: string;
  name: string;
  arity_m_k: number;
  cyclic_degree: number;
  hkr_formality_verified: boolean;
  base_fidelity_pct: number;
}

interface CyclicTelemetry {
  algebra_id: string;
  status: string;
  stasheff_ainfinity_defect: number;
  hkr_formality_verified: boolean;
  arity_m_k: number;
  cyclic_degree: number;
  cyclic_firewall_strength_pev: number;
  homotopy_obstruction_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function CyclicHomotopyStudio() {
  const [algebras, setAlgebras] = useState<CyclicAlgebra[]>([]);
  const [selectedAlgebra, setSelectedAlgebra] = useState<string>("");
  const [arityMK, setArityMK] = useState<number>(3);
  const [cyclicDegree, setCyclicDegree] = useState<number>(2);
  const [firewallGain, setFirewallGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<CyclicTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlgebras = async () => {
    try {
      const res = await fetch("/api/kontsevich-cyclic-homotopy/algebras");
      if (!res.ok) throw new Error("Failed to fetch cyclic algebras");
      const data = await res.json();
      setAlgebras(data.algebras || []);
      if (data.algebras?.length > 0 && !selectedAlgebra) {
        setSelectedAlgebra(data.algebras[0].algebra_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching algebras");
    }
  };

  useEffect(() => {
    fetchAlgebras();
  }, []);

  const evaluateFormality = async () => {
    if (!selectedAlgebra) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kontsevich-cyclic-homotopy/evaluate-cyclic-formality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algebra_id: selectedAlgebra,
          arity_m_k: arityMK,
          cyclic_degree: cyclicDegree,
          firewall_gain: firewallGain,
        }),
      });
      if (!res.ok) throw new Error("Cyclic formality evaluation failed");
      setTelemetry(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating formality");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <InfinityIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Kontsevich Cyclic Homotopy &amp; A-Infinity Firewall
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Capability 208
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              A-infinity algebras, cyclic Deligne conjecture, cyclic homology HC_*(A) &amp; HKR formality isomorphism
            </p>
          </div>
        </div>
        <button
          onClick={fetchAlgebras}
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
              Target Cyclic A-Infinity Algebra
            </label>
            <select
              value={selectedAlgebra}
              onChange={(e) => setSelectedAlgebra(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {algebras.map((a) => (
                <option key={a.algebra_id} value={a.algebra_id}>
                  {a.name} ({a.algebra_id})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                A-Infinity Arity (m_k): {arityMK}
              </label>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={arityMK}
                onChange={(e) => setArityMK(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Cyclic Homology Degree: {cyclicDegree}
              </label>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={cyclicDegree}
                onChange={(e) => setCyclicDegree(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Firewall Gain Multiplier: {firewallGain.toFixed(2)}x
              </label>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.05"
                value={firewallGain}
                onChange={(e) => setFirewallGain(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <button
            onClick={evaluateFormality}
            disabled={loading || !selectedAlgebra}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-amber-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Evaluating HKR Formality...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Lock Cyclic Formality
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
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Shield className="w-3.5 h-3.5" /> {telemetry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Arity m_k</span>
                  <span className="text-lg font-bold text-amber-400">
                    k = {telemetry.arity_m_k}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Firewall Strength</span>
                  <span className="text-lg font-bold text-orange-400">
                    {telemetry.cyclic_firewall_strength_pev.toFixed(2)} PeV
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Homotopy Suppr</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.homotopy_obstruction_suppression_db.toFixed(1)} dB
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
                  <Activity className="w-4 h-4 text-amber-400" />
                  Maxim Kontsevich &amp; Boris Tsygan Cyclic Invariants
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Stasheff A-Infinity Defect:</div>
                  <div className="text-slate-200 font-mono text-right">
                    {telemetry.stasheff_ainfinity_defect.toExponential(4)}
                  </div>

                  <div className="text-slate-400">HKR Formality Status:</div>
                  <div className="text-amber-400 font-semibold text-right flex items-center justify-end gap-1">
                    <Lock className="w-3.5 h-3.5" />{" "}
                    {telemetry.hkr_formality_verified ? "CYCLIC HKR FORMALITY LOCKED" : "DEVIATING"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <InfinityIcon className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Cyclic Algebra Evaluated</p>
              <p className="text-sm">Select an A-infinity algebra and lock HKR formality</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
