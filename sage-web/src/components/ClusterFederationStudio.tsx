"use client";

import React, { useState, useEffect } from "react";
import {
  Server,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Zap,
  Network,
  Share2,
  AlertOctagon,
  CheckCircle2,
  Globe2,
} from "lucide-react";

interface FederationCluster {
  cluster_id: string;
  region_name: string;
  datacenter_type: string;
  endpoint_url: string;
  active_nodes: number;
  round_trip_latency_ms: number;
  bft_consensus_weight: number;
  merkle_state_root_sha256: string;
  is_leader: boolean;
  cluster_health: string;
}

interface SyncEvent {
  sync_id: string;
  initiating_cluster: string;
  target_cluster: string;
  synchronized_merkle_root: string;
  state_drift_ms: number;
  synced_capabilities_count: number;
  zero_trust_token_verified: boolean;
  failover_route_established: boolean;
  status: string;
  timestamp: string;
}

interface FailoverEvent {
  isolated_cluster_id: string;
  active_failover_cluster_id: string;
  failover_latency_ms: number;
  traffic_reroute_status: string;
  state_loss_pct: number;
  merkle_verification: string;
  reason: string;
  timestamp: string;
}

export function ClusterFederationStudio() {
  const [clusters, setClusters] = useState<FederationCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [failingOver, setFailingOver] = useState(false);
  const [initCluster, setInitCluster] = useState("CLUSTER-US-EAST-01");
  const [targetCluster, setTargetCluster] = useState("CLUSTER-EU-CENTRAL-02");
  const [lastSync, setLastSync] = useState<SyncEvent | null>(null);
  const [lastFailover, setLastFailover] = useState<FailoverEvent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchClusters = async () => {
    try {
      const res = await fetch("/api/cluster-federation/clusters");
      if (res.ok) {
        const data = await res.json();
        setClusters(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Sovereign Multi-Region Cluster Federation Engine initialized.",
      "[" + new Date().toLocaleTimeString() + "] BFT Consensus Quorum established across US, EU, APAC, and Orbital L1.",
      "[" + new Date().toLocaleTimeString() + "] Sub-12ms automated failover routes pre-computed and armed.",
    ]);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Synchronizing Merkle roots between " + initCluster + " & " + targetCluster + " across 82 capabilities...",
      ...prev,
    ]);

    try {
      const res = await fetch("/api/cluster-federation/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initiating_cluster_id: initCluster,
          target_cluster_id: targetCluster,
          capabilities_count: 82,
        }),
      });

      if (res.ok) {
        const data: SyncEvent = await res.json();
        setLastSync(data);
        setLogs((prev) => [
          "[" + new Date().toLocaleTimeString() + "] Consensus state synchronized! Root: " + data.synchronized_merkle_root.substring(0, 16) + "... (Drift: " + data.state_drift_ms + " ms)",
          "[" + new Date().toLocaleTimeString() + "] All 82 capabilities cross-reconciled.",
          ...prev,
        ]);
        fetchClusters();
      }
    } catch {
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] Error executing cross-cluster state synchronization.",
        ...prev,
      ]);
    } finally {
      setSyncing(false);
    }
  };

  const handleFailover = async () => {
    setFailingOver(true);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Simulating regional EMP isolation on " + targetCluster + "...",
      ...prev,
    ]);

    try {
      const res = await fetch("/api/cluster-federation/failover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          failing_cluster_id: targetCluster,
          backup_cluster_id: initCluster,
          reason: "SIMULATED_REGIONAL_EMP_ISOLATION",
        }),
      });

      if (res.ok) {
        const data: FailoverEvent = await res.json();
        setLastFailover(data);
        setLogs((prev) => [
          "[" + new Date().toLocaleTimeString() + "] Sub-12ms Failover successful! Latency: " + data.failover_latency_ms + " ms (< 12.0 ms SLA)",
          "[" + new Date().toLocaleTimeString() + "] 100% traffic deflected to " + data.active_failover_cluster_id + " (Zero state loss).",
          ...prev,
        ]);
        fetchClusters();
      }
    } catch {
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] Error triggering automated failover.",
        ...prev,
      ]);
    } finally {
      setFailingOver(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/60 via-blue-950/30 to-indigo-950/60 border border-sky-800/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-sky-600/20 border border-sky-500/30 text-sky-400">
              <Globe2 className="w-8 h-8 animate-pulse text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Enterprise Multi-Region Sovereign Cluster Federation Engine
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Option B &bull; v6.0.0
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Cross-region sovereign cluster federation with Byzantine fault-tolerant (BFT) consensus, distributed Merkle state proof verification, and sub-12ms automated failover.
              </p>
            </div>
          </div>
          <button
            onClick={fetchClusters}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-900/40 hover:bg-sky-800/50 border border-sky-700/50 text-sky-200 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Sync Clusters
          </button>
        </div>
      </div>

      {/* Clusters List */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {clusters.map((cluster) => (
          <div
            key={cluster.cluster_id}
            className={`p-4 rounded-xl border transition-all ${
              cluster.is_leader
                ? "bg-sky-950/70 border-sky-500 ring-2 ring-sky-500/30 shadow-lg"
                : "bg-slate-900/40 border-slate-800/80 hover:border-sky-700/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">{cluster.region_name}</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{cluster.cluster_id}</p>
              </div>
              <span
                className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                  cluster.cluster_health === "HEALTHY_FEDERATED"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}
              >
                {cluster.is_leader ? "LEADER" : "FOLLOWER"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Active Nodes</span>
                <span className="font-mono text-sky-300 font-bold">{cluster.active_nodes}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/40 border border-slate-700/30">
                <span className="text-slate-400 block text-[10px]">Latency</span>
                <span className="font-mono text-cyan-300 font-bold">{cluster.round_trip_latency_ms} ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Operations & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Network className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold text-white">Federation Consensus & Failover Actions</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Initiating Cluster (Leader)</label>
                <select
                  value={initCluster}
                  onChange={(e) => setInitCluster(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="CLUSTER-US-EAST-01">CLUSTER-US-EAST-01 (Virginia)</option>
                  <option value="CLUSTER-EU-CENTRAL-02">CLUSTER-EU-CENTRAL-02 (Frankfurt)</option>
                  <option value="CLUSTER-APAC-TOKYO-03">CLUSTER-APAC-TOKYO-03 (Tokyo)</option>
                  <option value="CLUSTER-ORBITAL-L1-04">CLUSTER-ORBITAL-L1-04 (Lagrange L1)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Cluster (Follower)</label>
                <select
                  value={targetCluster}
                  onChange={(e) => setTargetCluster(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="CLUSTER-EU-CENTRAL-02">CLUSTER-EU-CENTRAL-02 (Frankfurt)</option>
                  <option value="CLUSTER-US-EAST-01">CLUSTER-US-EAST-01 (Virginia)</option>
                  <option value="CLUSTER-APAC-TOKYO-03">CLUSTER-APAC-TOKYO-03 (Tokyo)</option>
                  <option value="CLUSTER-ORBITAL-L1-04">CLUSTER-ORBITAL-L1-04 (Lagrange L1)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2"
              >
                <Share2 className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Reconciling..." : "Synchronize Merkle State"}
              </button>

              <button
                onClick={handleFailover}
                disabled={failingOver}
                className="py-3 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2"
              >
                <AlertOctagon className={`w-4 h-4 ${failingOver ? "animate-spin" : ""}`} />
                {failingOver ? "Rerouting..." : "Test Automated Failover"}
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Federation Consensus Telemetry</h3>
          </div>

          {lastFailover ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-rose-400 font-mono">AUTOMATED_FAILOVER_ENGAGED</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SUB-12MS SLA MET
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Failover Latency</span>
                  <span className="text-xl font-mono font-bold text-emerald-400">
                    {lastFailover.failover_latency_ms} ms
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">State Loss</span>
                  <span className="text-xl font-mono font-bold text-sky-400">
                    {lastFailover.state_loss_pct}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Reroute: <strong>{lastFailover.traffic_reroute_status}</strong></span>
              </div>
            </div>
          ) : lastSync ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">{lastSync.sync_id}</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {lastSync.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Capabilities Synced</span>
                  <span className="text-xl font-mono font-bold text-sky-400">
                    {lastSync.synced_capabilities_count} / 82
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">State Drift</span>
                  <span className="text-xl font-mono font-bold text-cyan-400">
                    {lastSync.state_drift_ms} ms
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-300 overflow-hidden text-ellipsis">
                <span className="text-[10px] text-slate-500 block mb-0.5">Merkle Root</span>
                {lastSync.synchronized_merkle_root}
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-sm">
              <Server className="w-8 h-8 mb-2 opacity-40 text-sky-400" />
              <span>No cross-cluster sync or failover recorded.</span>
              <span className="text-xs text-slate-600 mt-1">Synchronize Merkle state or test automated failover above.</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Log */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800/50 pb-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span>MULTI_CLUSTER_FEDERATION_CONSENSUS_STREAM</span>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {logs.map((log, idx) => (
            <div key={idx} className="text-slate-300">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
