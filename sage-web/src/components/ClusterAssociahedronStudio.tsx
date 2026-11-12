'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Hexagon } from 'lucide-react';

interface ClusterPolytope {
  cluster_id: string;
  classification: string;
  default_cluster_rank: number;
  default_stasheff_vertices: number;
  default_quiver_depth: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  cluster_id: string;
  classification: string;
  cluster_rank: number;
  stasheff_vertices: number;
  quiver_mutation_depth: number;
  cluster_gain: number;
  laurent_positivity_residual: number;
  associahedron_coherence: number;
  cluster_suppression_db: number;
  quiver_unitarity_pct: number;
  laurent_phenomenon_locked: boolean;
  status: string;
  timestamp: number;
}

export default function ClusterAssociahedronStudio() {
  const [clusters, setClusters] = useState<ClusterPolytope[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string>('CLUSTER-A4-STASHEFF-01');
  const [clusterRank, setClusterRank] = useState<number>(4);
  const [stasheffVertices, setStasheffVertices] = useState<number>(14);
  const [quiverDepth, setQuiverDepth] = useState<number>(12);
  const [clusterGain, setClusterGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchClusters = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/cluster-algebra-associahedron/clusters');
      const data = (await res.json().catch(() => ({}))) as {
        clusters?: ClusterPolytope[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load cluster associahedron polytopes');
      }
      if (data.clusters) {
        setClusters(data.clusters);
        if (data.clusters.length > 0) {
          setSelectedCluster((prev) => prev || data.clusters![0].cluster_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load cluster associahedron polytopes'
      );
    }
  }, []);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/cluster-algebra-associahedron/seal-cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cluster_id: selectedCluster,
          cluster_rank: clusterRank,
          stasheff_vertices: stasheffVertices,
          quiver_mutation_depth: quiverDepth,
          cluster_gain: clusterGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Cluster associahedron seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Cluster associahedron seal failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <Hexagon className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-300">
              Capability 149: Cluster Algebra Mutation &amp; Stasheff Associahedron Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Fomin-Zelevinsky quiver exchange mutations, Stasheff pentagon polytopes &amp; Grassmannian positroid Laurent bounds
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchClusters}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Polytopes</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clusters.map((c) => (
          <button
            type="button"
            key={c.cluster_id}
            onClick={() => setSelectedCluster(c.cluster_id)}
            aria-pressed={selectedCluster === c.cluster_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedCluster === c.cluster_id
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-indigo-400">
                {c.cluster_id}
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                {c.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{c.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                Rank={c.default_cluster_rank} | Vertices={c.default_stasheff_vertices}
              </div>
              <div>Base Suppression: {c.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Cluster Exchange Rank
            </label>
            <input
              type="number"
              min={2}
              max={16}
              step={1}
              value={clusterRank}
              onChange={(e) => setClusterRank(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Stasheff Vertices
            </label>
            <input
              type="number"
              min={5}
              max={128}
              step={1}
              value={stasheffVertices}
              onChange={(e) => setStasheffVertices(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Quiver Mutation Depth
            </label>
            <input
              type="number"
              min={4}
              max={64}
              step={1}
              value={quiverDepth}
              onChange={(e) => setQuiverDepth(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Laurent Coherence Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={clusterGain}
              onChange={(e) => setClusterGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-indigo-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {loading
              ? 'Sealing Cluster Associahedron...'
              : 'Seal Quiver Mutation & Stasheff Associahedron Bounds'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-indigo-950/20 border border-indigo-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-900/50 pb-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Cluster Associahedron Telemetry ({telemetry.cluster_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Quiver Unitarity</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.quiver_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Cluster Suppression</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.cluster_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Associahedron Coherence</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.associahedron_coherence}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Laurent Residual</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.laurent_positivity_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

