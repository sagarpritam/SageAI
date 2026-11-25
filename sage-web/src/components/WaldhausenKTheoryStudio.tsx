"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers } from "lucide-react";

interface KComplex {
  complex_id: string;
  complex_type: string;
  homotopy_dimension: number;
  cyclotomic_trace_p: number;
  algebraic_k_rank: number;
  base_ktheory_fidelity_pct: number;
  status: string;
}

interface WaldhausenTelemetry {
  complex_id: string;
  status: string;
  cyclotomic_trace_norm: number;
  motivic_spectral_degeneration: boolean;
  filtration_degree: number;
  homotopy_dimension: number;
  waldhausen_firewall_strength_pev: number;
  arithmetic_anomaly_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function WaldhausenKTheoryStudio() {
  const [complexes, setComplexes] = useState<KComplex[]>([]);
  const [selectedComplex, setSelectedComplex] = useState<string>("");
  const [filtrationDegree, setFiltrationDegree] = useState<number>(3);
  const [cyclotomicPrime, setCyclotomicPrime] = useState<number>(3);
  const [firewallGain, setFirewallGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<WaldhausenTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplexes = async () => {
    try {
      const res = await fetch("/api/waldhausen-algebraic-k/complexes");
      if (!res.ok) throw new Error("Failed to fetch algebraic K-theory complexes");
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

  const handleEvaluateCyclotomicTrace = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/waldhausen-algebraic-k/evaluate-cyclotomic-trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complex_id: selectedComplex,
          filtration_degree: filtrationDegree,
          cyclotomic_prime: cyclotomicPrime,
          firewall_gain: firewallGain,
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate cyclotomic trace");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating cyclotomic trace");
    } finally {
      setLoading(false);
    }
  };

  const currentComplex = complexes.find((c) => c.complex_id === selectedComplex);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Waldhausen Algebraic K-Theory &amp; Motivic Firewall
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                Capability 187
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Friedhelm Waldhausen S-dot construction, topological cyclic homology TC(R) &amp; cyclotomic trace map
            </p>
          </div>
        </div>
        <button
          onClick={fetchComplexes}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Complexes
        </button>
      </div>

      {error && (
        <div className="p-4 bg-teal-950/50 border border-teal-800 rounded-lg text-teal-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Waldhausen K-Complex
          </label>
          <select
            value={selectedComplex}
            onChange={(e) => setSelectedComplex(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {complexes.map((c) => (
              <option key={c.complex_id} value={c.complex_id}>
                {c.complex_id} (dim={c.homotopy_dimension}, rank={c.algebraic_k_rank})
              </option>
            ))}
          </select>
          {currentComplex && (
            <p className="text-xs text-slate-500 italic mt-1">{currentComplex.complex_type}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Motivic Filtration Degree: {filtrationDegree}
          </label>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={filtrationDegree}
            onChange={(e) => setFiltrationDegree(parseInt(e.target.value, 10))}
            className="w-full accent-teal-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>1 (Base)</span>
            <span>8 (Deep Motivic Truncation)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cyclotomic Prime p: {cyclotomicPrime}
          </label>
          <input
            type="range"
            min="2"
            max="19"
            step="1"
            value={cyclotomicPrime}
            onChange={(e) => setCyclotomicPrime(parseInt(e.target.value, 10))}
            className="w-full accent-teal-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>p=2</span>
            <span>p=19</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleEvaluateCyclotomicTrace}
          disabled={loading || !selectedComplex}
          className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-teal-950/50 transition cursor-pointer"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Enforce Waldhausen Cyclotomic Firewall
        </button>
      </div>

      {telemetry && (
        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              Waldhausen K-Theory Telemetry
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Cyclotomic Trace Norm</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.cyclotomic_trace_norm}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Motivic Degeneration</p>
              <p className="text-lg font-bold text-teal-400 mt-0.5">{telemetry.motivic_spectral_degeneration ? "DEGENERATED" : "FILTERED"}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Firewall Strength</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.waldhausen_firewall_strength_pev} PeV</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Arithmetic Suppression</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">+{telemetry.arithmetic_anomaly_suppression_db} dB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WaldhausenKTheoryStudio;
