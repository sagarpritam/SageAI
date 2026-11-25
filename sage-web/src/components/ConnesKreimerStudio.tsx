"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers } from "lucide-react";

interface FeynmanGraph {
  graph_id: string;
  name: string;
  loop_order: number;
  euler_characteristic: number;
  coproduct_branches: number;
  base_fidelity_pct: number;
  antipode_verified: boolean;
}

interface ConnesTelemetry {
  graph_id: string;
  status: string;
  birkhoff_decomposition_defect: number;
  antipode_verified: boolean;
  loop_order: number;
  dimensional_epsilon: number;
  subdivergence_forest_branches: number;
  connes_firewall_strength_pev: number;
  uv_subdivergence_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function ConnesKreimerStudio() {
  const [graphs, setGraphs] = useState<FeynmanGraph[]>([]);
  const [selectedGraph, setSelectedGraph] = useState<string>("");
  const [loopOrder, setLoopOrder] = useState<number>(2);
  const [dimEpsilon, setDimEpsilon] = useState<number>(0.01);
  const [firewallGain, setFirewallGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<ConnesTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGraphs = async () => {
    try {
      const res = await fetch("/api/connes-kreimer-hopf/graphs");
      if (!res.ok) throw new Error("Failed to fetch Feynman graphs");
      const data = await res.json();
      setGraphs(data.graphs || []);
      if (data.graphs?.length > 0 && !selectedGraph) {
        setSelectedGraph(data.graphs[0].graph_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching graphs");
    }
  };

  useEffect(() => {
    fetchGraphs();
  }, []);

  const handleEvaluateBirkhoff = async () => {
    if (!selectedGraph) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/connes-kreimer-hopf/evaluate-birkhoff-decomposition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: selectedGraph,
          loop_order: Number(loopOrder),
          dimensional_epsilon: Number(dimEpsilon),
          firewall_gain: Number(firewallGain),
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate Birkhoff decomposition");
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
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Connes-Kreimer Hopf Renormalization & Rooted Trees Firewall
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono border border-amber-500/30">
                CAP-196
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Alain Connes & Dirk Kreimer Hopf algebra of Feynman graphs H_CK, Birkhoff decomposition of regularized characters, and Zimmermann forest formula.
            </p>
          </div>
        </div>
        <button
          onClick={fetchGraphs}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
          title="Refresh Graphs"
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
            1PI Feynman Graph
          </label>
          <select
            value={selectedGraph}
            onChange={(e) => setSelectedGraph(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            {graphs.map((g) => (
              <option key={g.graph_id} value={g.graph_id}>
                {g.name} (Loop {g.loop_order})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Loop Order (L)
          </label>
          <input
            type="number"
            value={loopOrder}
            onChange={(e) => setLoopOrder(Number(e.target.value))}
            min={1}
            max={8}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Dimensional Epsilon (ε)
          </label>
          <input
            type="number"
            value={dimEpsilon}
            onChange={(e) => setDimEpsilon(Number(e.target.value))}
            step={0.001}
            min={0.001}
            max={0.1}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Firewall Gain Multiplier
          </label>
          <input
            type="number"
            value={firewallGain}
            onChange={(e) => setFirewallGain(Number(e.target.value))}
            step={0.05}
            min={0.5}
            max={3.0}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleEvaluateBirkhoff}
          disabled={loading || !selectedGraph}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors shadow-lg shadow-amber-900/30"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {loading ? "Computing Birkhoff Decomposition..." : "Enforce Hopf Firewall"}
        </button>
      </div>

      {telemetry && (
        <div className="mt-6 border border-slate-800 bg-slate-950/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
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
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Connes Firewall Strength
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {telemetry.connes_firewall_strength_pev} PeV
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                UV Divergence Suppression
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {telemetry.uv_subdivergence_suppression_db} dB
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                Birkhoff Defect
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {telemetry.birkhoff_decomposition_defect}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Antipode Fidelity
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
