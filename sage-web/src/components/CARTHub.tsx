"use client";

import React, { useState } from "react";
import {
  Share2,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Scissors,
  AlertTriangle,
  Flame,
  Target,
  Zap,
} from "lucide-react";

export function CARTHub() {
  const [loading, setLoading] = useState(false);
  const [severLoading, setSeverLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [severanceResult, setSeveranceResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const discoverPaths = async () => {
    setLoading(true);
    setSeveranceResult(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/cart/paths");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || `Attack graph scan failed (${res.status})`);
      }
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to analyze enterprise attack graph");
    } finally {
      setLoading(false);
    }
  };

  const severChokePoint = async (nodeId: string) => {
    setSeverLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/cart/sever", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node_id: nodeId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || `Choke-point severance failed (${res.status})`);
      }
      const data = await res.json();
      setSeveranceResult(data.severance_result);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to sever attack graph choke point");
    } finally {
      setSeverLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-xs text-red-200"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            {errorMsg}
          </span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300 hover:text-white underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Continuous Attack Path & Graph Choke-Point Analysis (CART)
            </h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Graph-based modeling of enterprise attack paths to Crown Jewels, identifying critical bottleneck choke points to sever multi-vector kill-chains.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={discoverPaths}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-amber-950/40 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <GitBranch className="h-4 w-4" />}
            Analyze Attack Graph
          </button>
        </div>
      </div>

      {analysis ? (
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Blast Radius Score</span>
              <p className="text-2xl font-bold text-rose-500">{analysis.blast_radius_score}/100</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Lethal Attack Paths</span>
              <p className="text-2xl font-bold text-amber-400">{analysis.total_attack_paths_found}</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Crown Jewels Targeted</span>
              <p className="text-2xl font-bold text-red-400">{analysis.crown_jewels_targeted}</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Choke-Point Leverage</span>
              <p className="text-2xl font-bold text-emerald-400">{analysis.choke_point.path_collapse_percentage}%</p>
            </div>
          </div>

          {/* Choke Point Callout Card */}
          <div className="p-5 bg-gradient-to-r from-amber-950/40 via-zinc-900/80 to-zinc-900/80 border border-amber-600/40 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Target className="h-5 w-5 text-amber-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">
                  Primary Choke Point Identified: {analysis.choke_point.node_name} ({analysis.choke_point.node_type})
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-950 text-amber-400 border border-amber-700/50">
                COLLAPSES {analysis.choke_point.path_collapse_percentage}% OF PATHS
              </span>
            </div>

            <p className="text-xs text-zinc-300">{analysis.choke_point.severance_strategy}</p>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <span className="text-xs text-zinc-400 font-mono">
                Paths traversing: {analysis.choke_point.paths_traversing} / {analysis.total_attack_paths_found}
              </span>
              <button
                type="button"
                onClick={() => severChokePoint(analysis.choke_point.node_id)}
                disabled={severLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-semibold rounded-lg transition-all shadow-md disabled:opacity-50"
              >
                {severLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Scissors className="h-3.5 w-3.5" />}
                Sever Choke Point Now
              </button>
            </div>
          </div>

          {/* Severance Confirmation */}
          {severanceResult && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <ShieldCheck className="h-4 w-4" />
                Choke Point Severed Successfully
              </div>
              <p className="text-xs text-emerald-300">
                {severanceResult.rules_applied.map((r: any) => r.rule).join(" | ")}
              </p>
              <span className="inline-block text-[11px] font-mono text-zinc-400">
                Risk Reduction: {severanceResult.risk_reduction_pct}% | Blast Radius Neutralized
              </span>
            </div>
          )}

          {/* Discovered Paths */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-400" />
              Lethal Kill-Chain Traversal Sequences
            </h3>
            <div className="space-y-3">
              {analysis.attack_paths.map((p: any, idx: number) => (
                <div key={idx} className="p-4 bg-zinc-950/70 border border-zinc-800/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-amber-400">{p.path_id.toUpperCase()}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40">
                      LETHALITY: {p.lethality_score}/100 ({p.hops} HOPS)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-white flex-wrap">
                    {p.node_sequence.map((node: string, nIdx: number) => (
                      <React.Fragment key={nIdx}>
                        <span
                          className={`px-2 py-1 rounded text-[11px] font-mono ${
                            nIdx === 0
                              ? "bg-zinc-800 text-zinc-300"
                              : nIdx === p.node_sequence.length - 1
                              ? "bg-red-950/80 text-red-300 border border-red-800/40"
                              : node.includes("Bastion")
                              ? "bg-amber-950/80 text-amber-300 border border-amber-800/40"
                              : "bg-zinc-900 text-zinc-300"
                          }`}
                        >
                          {node}
                        </span>
                        {nIdx < p.node_sequence.length - 1 && <span className="text-zinc-600">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-zinc-500 text-sm border border-dashed border-zinc-800/80 rounded-xl">
          Click <span className="text-amber-400 font-semibold">Analyze Attack Graph</span> to evaluate multi-stage exploit paths and identify critical choke points.
        </div>
      )}
    </div>
  );
}

