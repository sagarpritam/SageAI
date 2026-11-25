"use client";

import React, { useState, useEffect } from "react";
import { Layers, Activity, RefreshCw, Zap, Lock, AlertTriangle, Shield } from "lucide-react";

interface BruhatPair {
  pair_id: string;
  name: string;
  weyl_group: string;
  coxeter_length_w: number;
  bruhat_sub_length_y: number;
  hecke_q_degree: number;
  perverse_sheaf_self_dual: boolean;
  status: string;
}

interface KLTelemetry {
  pair_id: string;
  status: string;
  kl_poly_coefficient_norm: number;
  canonical_basis_defect: number;
  length_difference_l: number;
  hecke_q_degree: number;
  canonical_basis_verified: boolean;
  perverse_sheaf_self_dual: boolean;
  kl_firewall_strength_pev: number;
  perverse_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function KazhdanLusztigStudio() {
  const [pairs, setPairs] = useState<BruhatPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>("");
  const [heckeQParameter, setHeckeQParameter] = useState<number>(1.0);
  const [inversionOrder, setInversionOrder] = useState<number>(4);
  const [firewallGain, setFirewallGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<KLTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPairs = async () => {
    try {
      const res = await fetch("/api/kazhdan-lusztig-hecke/pairs");
      if (!res.ok) throw new Error("Failed to fetch Bruhat pair configurations");
      const data = await res.json();
      setPairs(data.pairs || []);
      if (data.pairs?.length > 0 && !selectedPair) {
        setSelectedPair(data.pairs[0].pair_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching pairs");
    }
  };

  useEffect(() => {
    fetchPairs();
  }, []);

  const handleEvaluateKLPolynomial = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kazhdan-lusztig-hecke/evaluate-kl-polynomial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pair_id: selectedPair,
          hecke_q_parameter: heckeQParameter,
          kazhdan_inversion_order: inversionOrder,
          firewall_gain: firewallGain,
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate Kazhdan-Lusztig polynomial");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating KL polynomial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-400" />
            Kazhdan-Lusztig Polynomials & Hecke Algebra Firewall Studio
          </h2>
          <p className="text-sm text-zinc-400">
            Capability 190: Evaluates Kazhdan-Lusztig polynomials P_y,w(q), canonical basis elements C&apos;_w, and perverse sheaf self-duality.
          </p>
        </div>
        <button
          onClick={fetchPairs}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md border border-zinc-700 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Pairs
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
            Bruhat Pair Configuration
          </h3>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Select Bruhat Pair</label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
            >
              {pairs.map((p) => (
                <option key={p.pair_id} value={p.pair_id}>
                  {p.pair_id} ({p.weyl_group})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Hecke Quantum Parameter q</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10.0"
              value={heckeQParameter}
              onChange={(e) => setHeckeQParameter(parseFloat(e.target.value) || 1.0)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Kazhdan Inversion Order</label>
            <input
              type="number"
              min={1}
              max={16}
              value={inversionOrder}
              onChange={(e) => setInversionOrder(parseInt(e.target.value) || 4)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Firewall Gain: {firewallGain}x</label>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.05"
              value={firewallGain}
              onChange={(e) => setFirewallGain(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <button
            onClick={handleEvaluateKLPolynomial}
            disabled={loading || !selectedPair}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Evaluate KL Polynomial
          </button>
        </div>

        <div className="space-y-4 md:col-span-2 bg-zinc-900/50 p-5 rounded-xl border border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono mb-3">
              Canonical Basis & Intersection Cohomology Telemetry
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
                    <span className="text-[11px] text-zinc-400 block font-mono">KL Poly Norm</span>
                    <span className="text-xs font-bold text-amber-300 font-mono mt-0.5 block">
                      {telemetry.kl_poly_coefficient_norm.toFixed(4)}
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Perverse Self-Dual</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">
                      {telemetry.perverse_sheaf_self_dual ? "TRUE (DUALITY LOCKED)" : "FALSE"}
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Firewall Strength</span>
                    <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                      {telemetry.kl_firewall_strength_pev.toFixed(1)} PeV
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Perverse Suppr</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">
                      {telemetry.perverse_suppression_db.toFixed(1)} dB
                    </span>
                  </div>
                  <div className="bg-zinc-800/70 p-3 rounded-lg border border-zinc-700/60">
                    <span className="text-[11px] text-zinc-400 block font-mono">Effective Fidelity</span>
                    <span className="text-xs font-bold text-orange-400 font-mono mt-0.5 block">
                      {telemetry.effective_fidelity_pct.toFixed(4)}%
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-800/40 rounded border border-zinc-700/40 text-xs font-mono text-zinc-300 space-y-1">
                  <div>• Bruhat Pair ID: {telemetry.pair_id}</div>
                  <div>• Canonical Basis Verified: {telemetry.canonical_basis_verified ? "YES" : "NO"}</div>
                  <div>• Length Difference l(w) - l(y): {telemetry.length_difference_l}</div>
                  <div>• Hecke q-Degree: {telemetry.hecke_q_degree}</div>
                </div>
              </div>
            ) : (
              <div className="h-48 border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-500 text-xs font-mono">
                <Activity className="h-8 w-8 mb-2 opacity-30 text-amber-400" />
                Select a Bruhat pair and evaluate Kazhdan-Lusztig polynomial self-duality.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Shield className="h-3 w-3" />
              Kazhdan-Lusztig Firewall Operational
            </span>
            <span>Centesimal Sovereign Era • v9.6.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KazhdanLusztigStudio;
