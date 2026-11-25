"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Scale } from "lucide-react";

interface EllipticCurveSha {
  curve_id: string;
  name: string;
  selmer_rank: number;
  sha_order: number;
  descent_verified: boolean;
  base_fidelity_pct: number;
}

interface TateTelemetry {
  curve_id: string;
  status: string;
  selmer_descent_defect: number;
  descent_verified: boolean;
  selmer_rank: number;
  sha_order: number;
  tate_shield_strength_pev: number;
  sha_obstruction_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function TateShafarevichStudio() {
  const [curves, setCurves] = useState<EllipticCurveSha[]>([]);
  const [selectedCurve, setSelectedCurve] = useState<string>("");
  const [selmerRank, setSelmerRank] = useState<number>(1);
  const [shaOrder, setShaOrder] = useState<number>(1);
  const [shieldGain, setShieldGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<TateTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurves = async () => {
    try {
      const res = await fetch("/api/tate-shafarevich-selmer/curves");
      if (!res.ok) throw new Error("Failed to fetch curves");
      const data = await res.json();
      setCurves(data.curves || []);
      if (data.curves?.length > 0 && !selectedCurve) {
        setSelectedCurve(data.curves[0].curve_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching curves");
    }
  };

  useEffect(() => {
    fetchCurves();
  }, []);

  const evaluateDescent = async () => {
    if (!selectedCurve) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tate-shafarevich-selmer/evaluate-selmer-descent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curve_id: selectedCurve,
          selmer_rank: selmerRank,
          sha_order: shaOrder,
          shield_gain: shieldGain,
        }),
      });
      if (!res.ok) throw new Error("Selmer descent evaluation failed");
      setTelemetry(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating descent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Tate-Shafarevich Selmer Descent Shield
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Capability 212
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Tate-Shafarevich group Sha(E/K) finiteness, p-Selmer descent sequence &amp; Birch-Swinnerton-Dyer rank-nullity locking
            </p>
          </div>
        </div>
        <button
          onClick={fetchCurves}
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
              Target Elliptic Curve
            </label>
            <select
              value={selectedCurve}
              onChange={(e) => setSelectedCurve(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {curves.map((c) => (
                <option key={c.curve_id} value={c.curve_id}>
                  {c.name} ({c.curve_id})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Selmer Rank: {selmerRank}
              </label>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={selmerRank}
                onChange={(e) => setSelmerRank(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Sha(E/K) Order: {shaOrder}
              </label>
              <input
                type="range"
                min="1"
                max="16"
                step="1"
                value={shaOrder}
                onChange={(e) => setShaOrder(parseInt(e.target.value))}
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
            onClick={evaluateDescent}
            disabled={loading || !selectedCurve}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Descending Selmer Group...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Lock Selmer Descent
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
                  <span className="text-xs text-slate-400 block mb-1">Sha Order</span>
                  <span className="text-lg font-bold text-emerald-400">
                    #Sha = {telemetry.sha_order}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Shield Strength</span>
                  <span className="text-lg font-bold text-teal-400">
                    {telemetry.tate_shield_strength_pev.toFixed(2)} PeV
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Sha Suppr</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.sha_obstruction_suppression_db.toFixed(1)} dB
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
                  John Tate &amp; Igor Shafarevich Descent Invariants
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Selmer Descent Defect:</div>
                  <div className="text-slate-200 font-mono text-right">
                    {telemetry.selmer_descent_defect.toExponential(4)}
                  </div>

                  <div className="text-slate-400">Descent Status:</div>
                  <div className="text-emerald-400 font-semibold text-right flex items-center justify-end gap-1">
                    <Lock className="w-3.5 h-3.5" />{" "}
                    {telemetry.descent_verified ? "SELMER DESCENT LOCKED" : "DEVIATING"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <Scale className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Curve Evaluated</p>
              <p className="text-sm">Select an elliptic curve and lock Selmer descent</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
