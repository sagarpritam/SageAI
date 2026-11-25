"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Box } from "lucide-react";

interface SmoothFourManifold {
  manifold_id: string;
  name: string;
  manifold_type: string;
  second_chern_number: number;
  b2_plus: number;
  intersection_form_type: string;
  moduli_dimension: number;
  base_fidelity_pct: number;
  smoothness_verified: boolean;
}

interface DonaldsonTelemetry {
  manifold_id: string;
  status: string;
  gauge_moduli_defect: number;
  smoothness_verified: boolean;
  second_chern_number: number;
  b2_plus: number;
  donaldson_polynomial_degree: number;
  donaldson_firewall_strength_pev: number;
  exotic_topology_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function DonaldsonGaugeStudio() {
  const [manifolds, setManifolds] = useState<SmoothFourManifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>("");
  const [secondChernNumber, setSecondChernNumber] = useState<number>(2);
  const [b2Plus, setB2Plus] = useState<number>(3);
  const [firewallGain, setFirewallGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<DonaldsonTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchManifolds = async () => {
    try {
      const res = await fetch("/api/donaldson-gauge-moduli/manifolds");
      if (!res.ok) throw new Error("Failed to fetch 4-manifolds");
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

  const evaluateInvariants = async () => {
    if (!selectedManifold) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/donaldson-gauge-moduli/evaluate-donaldson-invariants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          second_chern_number: secondChernNumber,
          b2_plus: b2Plus,
          firewall_gain: firewallGain,
        }),
      });
      if (!res.ok) throw new Error("Donaldson invariants evaluation failed");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating invariants");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Donaldson Gauge Moduli Firewall
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Capability 202
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Anti-self-dual Yang-Mills instanton moduli space M_ASD(X), Donaldson polynomial invariants &amp; exotic smooth structure detection
            </p>
          </div>
        </div>
        <button
          onClick={fetchManifolds}
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
              Target Smooth 4-Manifold
            </label>
            <select
              value={selectedManifold}
              onChange={(e) => setSelectedManifold(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {manifolds.map((m) => (
                <option key={m.manifold_id} value={m.manifold_id}>
                  {m.name} ({m.manifold_id})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                2nd Chern Class c_2(E): {secondChernNumber}
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={secondChernNumber}
                onChange={(e) => setSecondChernNumber(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Self-Dual Betti Number b2+(X): {b2Plus}
              </label>
              <input
                type="range"
                min="1"
                max="7"
                step="2"
                value={b2Plus}
                onChange={(e) => setB2Plus(parseInt(e.target.value))}
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
            onClick={evaluateInvariants}
            disabled={loading || !selectedManifold}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-amber-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Evaluating Moduli Space...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Lock Donaldson Invariants
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
                  <span className="text-xs text-slate-400 block mb-1">Poly Deg (d)</span>
                  <span className="text-lg font-bold text-amber-400">
                    d = {telemetry.donaldson_polynomial_degree}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Firewall Strength</span>
                  <span className="text-lg font-bold text-orange-400">
                    {telemetry.donaldson_firewall_strength_pev.toFixed(2)} PeV
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Exotic Suppression</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.exotic_topology_suppression_db.toFixed(1)} dB
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Smoothness Fid</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {telemetry.effective_fidelity_pct.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Sir Simon Donaldson &amp; Karen Uhlenbeck Gauge Moduli Invariants
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Instanton Chern Number c_2(E):</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.second_chern_number}</div>

                  <div className="text-slate-400">Positive Betti Dimension b2+(X):</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.b2_plus}</div>

                  <div className="text-slate-400">Gauge Moduli Defect:</div>
                  <div className="text-slate-200 font-mono text-right">
                    {telemetry.gauge_moduli_defect.toExponential(4)}
                  </div>

                  <div className="text-slate-400">Smoothness Verification:</div>
                  <div className="text-amber-400 font-semibold text-right flex items-center justify-end gap-1">
                    <Lock className="w-3.5 h-3.5" />{" "}
                    {telemetry.smoothness_verified ? "ASD MODULI CONFINEMENT LOCKED" : "DEVIATING"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <Box className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No 4-Manifold Evaluated</p>
              <p className="text-sm">Select a manifold and evaluate Donaldson ASD instanton moduli invariants</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
