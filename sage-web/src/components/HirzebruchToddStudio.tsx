"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers } from "lucide-react";

interface SheafBundle {
  sheaf_id: string;
  name: string;
  complex_dimension: number;
  bundle_rank: number;
  euler_characteristic: number;
  todd_genus_verified: boolean;
  base_fidelity_pct: number;
}

interface HirzebruchTelemetry {
  sheaf_id: string;
  status: string;
  todd_intersection_defect: number;
  todd_genus_verified: boolean;
  complex_dimension: number;
  bundle_rank: number;
  euler_characteristic: number;
  hirzebruch_shield_strength_pev: number;
  holomorphic_anomaly_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function HirzebruchToddStudio() {
  const [sheaves, setSheaves] = useState<SheafBundle[]>([]);
  const [selectedSheaf, setSelectedSheaf] = useState<string>("");
  const [complexDimension, setComplexDimension] = useState<number>(2);
  const [bundleRank, setBundleRank] = useState<number>(3);
  const [shieldGain, setShieldGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<HirzebruchTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSheaves = async () => {
    try {
      const res = await fetch("/api/hirzebruch-riemann-roch/sheaves");
      if (!res.ok) throw new Error("Failed to fetch holomorphic sheaves");
      const data = await res.json();
      setSheaves(data.sheaves || []);
      if (data.sheaves?.length > 0 && !selectedSheaf) {
        setSelectedSheaf(data.sheaves[0].sheaf_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching sheaves");
    }
  };

  useEffect(() => {
    fetchSheaves();
  }, []);

  const evaluateHRR = async () => {
    if (!selectedSheaf) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hirzebruch-riemann-roch/evaluate-hrr-todd-genus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheaf_id: selectedSheaf,
          complex_dimension: complexDimension,
          bundle_rank: bundleRank,
          shield_gain: shieldGain,
        }),
      });
      if (!res.ok) throw new Error("HRR Todd genus evaluation failed");
      setTelemetry(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating HRR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Hirzebruch-Riemann-Roch &amp; Todd Genus Shield
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Capability 206
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Hirzebruch-Riemann-Roch Theorem chi(X, E) = integral ch(E) ^ Td(T_X), Todd genus &amp; holomorphic anomaly confinement
            </p>
          </div>
        </div>
        <button
          onClick={fetchSheaves}
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
              Target Holomorphic Sheaf
            </label>
            <select
              value={selectedSheaf}
              onChange={(e) => setSelectedSheaf(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {sheaves.map((s) => (
                <option key={s.sheaf_id} value={s.sheaf_id}>
                  {s.name} ({s.sheaf_id})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Complex Dimension: {complexDimension}
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={complexDimension}
                onChange={(e) => setComplexDimension(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Bundle Rank: {bundleRank}
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={bundleRank}
                onChange={(e) => setBundleRank(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Shield Gain Multiplier: {shieldGain.toFixed(2)}x
              </label>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.05"
                value={shieldGain}
                onChange={(e) => setShieldGain(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={evaluateHRR}
            disabled={loading || !selectedSheaf}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Evaluating Todd Class...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Lock HRR Todd Invariants
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
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Shield className="w-3.5 h-3.5" /> {telemetry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Euler Char</span>
                  <span className="text-lg font-bold text-emerald-400">
                    chi = {telemetry.euler_characteristic}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Shield Strength</span>
                  <span className="text-lg font-bold text-teal-400">
                    {telemetry.hirzebruch_shield_strength_pev.toFixed(2)} PeV
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Anomaly Suppr</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.holomorphic_anomaly_suppression_db.toFixed(1)} dB
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Fidelity</span>
                  <span className="text-lg font-bold text-amber-400">
                    {telemetry.effective_fidelity_pct.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Friedrich Hirzebruch &amp; Alexandre Grothendieck Invariants
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Todd Intersection Defect:</div>
                  <div className="text-slate-200 font-mono text-right">
                    {telemetry.todd_intersection_defect.toExponential(4)}
                  </div>

                  <div className="text-slate-400">Todd Genus Verification:</div>
                  <div className="text-emerald-400 font-semibold text-right flex items-center justify-end gap-1">
                    <Lock className="w-3.5 h-3.5" />{" "}
                    {telemetry.todd_genus_verified ? "HRR TODD CONSERVATION LOCKED" : "DEVIATING"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <Layers className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Sheaf Evaluated</p>
              <p className="text-sm">Select a holomorphic sheaf and verify Todd genus invariants</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
