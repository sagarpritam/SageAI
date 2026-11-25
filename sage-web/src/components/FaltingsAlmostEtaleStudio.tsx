"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers } from "lucide-react";

interface AlmostEtaleScheme {
  scheme_id: string;
  name: string;
  prime_p: number;
  dimension: number;
  truncation_degree: number;
  period_ring: string;
  base_fidelity_pct: number;
  almost_etale_verified: boolean;
}

interface FaltingsTelemetry {
  scheme_id: string;
  status: string;
  almost_etale_residual: number;
  almost_etale_verified: boolean;
  prime_p: number;
  truncation_degree: number;
  period_ring: string;
  faltings_shield_strength_pev: number;
  galois_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function FaltingsAlmostEtaleStudio() {
  const [schemes, setSchemes] = useState<AlmostEtaleScheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<string>("");
  const [pPrime, setPPrime] = useState<number>(5);
  const [truncationDegree, setTruncationDegree] = useState<number>(4);
  const [shieldGain, setShieldGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<FaltingsTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchemes = async () => {
    try {
      const res = await fetch("/api/faltings-almost-etale/schemes");
      if (!res.ok) throw new Error("Failed to fetch almost étale schemes");
      const data = await res.json();
      setSchemes(data.schemes || []);
      if (data.schemes?.length > 0 && !selectedScheme) {
        setSelectedScheme(data.schemes[0].scheme_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching schemes");
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleEvaluateAlmostEtaleDescent = async () => {
    if (!selectedScheme) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/faltings-almost-etale/evaluate-almost-etale-descent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheme_id: selectedScheme,
          p_prime: Number(pPrime),
          truncation_degree: Number(truncationDegree),
          shield_gain: Number(shieldGain),
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate almost étale descent");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Faltings Almost Étale & Fontaine Period Ring Shield
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                CAP-194
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Gerd Faltings & Jean-Marc Fontaine p-adic Hodge theory, almost étale descent, and Fontaine period rings (B_dR, B_crys, A_inf).
            </p>
          </div>
        </div>
        <button
          onClick={fetchSchemes}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
          title="Refresh Schemes"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-lg flex items-center gap-3 text-red-300 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Target Scheme / Variety
          </label>
          <select
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            {schemes.map((s) => (
              <option key={s.scheme_id} value={s.scheme_id}>
                {s.name} ({s.period_ring})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            p-Adic Prime (p)
          </label>
          <input
            type="number"
            value={pPrime}
            onChange={(e) => setPPrime(Number(e.target.value))}
            min={2}
            max={31}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Truncation Degree
          </label>
          <input
            type="number"
            value={truncationDegree}
            onChange={(e) => setTruncationDegree(Number(e.target.value))}
            min={1}
            max={16}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Shield Gain Multiplier
          </label>
          <input
            type="number"
            value={shieldGain}
            onChange={(e) => setShieldGain(Number(e.target.value))}
            step={0.05}
            min={0.5}
            max={3.0}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleEvaluateAlmostEtaleDescent}
          disabled={loading || !selectedScheme}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors shadow-lg shadow-emerald-900/30"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {loading ? "Enforcing Almost Étale Descent..." : "Enforce Almost Étale Shield"}
        </button>
      </div>

      {telemetry && (
        <div className="mt-6 border border-slate-800 bg-slate-950/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-sm text-white font-mono">
                {telemetry.status}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {new Date(telemetry.timestamp * 1000).toISOString()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Faltings Shield Strength
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {telemetry.faltings_shield_strength_pev} PeV
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                Galois Suppression
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {telemetry.galois_suppression_db} dB
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Valuation Residual
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {telemetry.almost_etale_residual}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Descent Fidelity
              </div>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {telemetry.effective_fidelity_pct}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
