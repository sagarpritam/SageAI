'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Server,
  Cloud,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Terminal,
  Lock,
} from 'lucide-react';

interface ClusterInfo {
  cluster_id: string;
  cloud_provider: string;
  cluster_type: string;
  region: string;
  environment: string;
  status: string;
  node_count: number;
  node_machine_type: string;
  total_vcpus: number;
  total_ram_gb: number;
  cpu_utilization_pct: number;
  ram_utilization_pct: number;
  endpoint: string;
  pqc_tls_suite: string;
  network_policy: string;
  istio_mesh_status: string;
  keda_autoscaler: string;
  active_pods: Array<{ name: string; status: string; restarts: number; age: string }>;
  last_health_check: string;
}

interface InfraMetrics {
  total_clusters: number;
  total_nodes: number;
  total_vcpus: number;
  total_ram_gb: number;
  total_active_pods: number;
  quantum_safe_pqc_status: string;
  pqc_handshake_latency_ms: number;
  zero_egress_rules_active: number;
  unauthorized_egress_attempts: number;
  uptime_pct: number;
  environment: string;
  recent_deployments: number;
  status: string;
}

interface DeploymentReceipt {
  deployment_id: string;
  target_cloud: string;
  environment: string;
  helm_chart: string;
  pqc_tls_enforced: boolean;
  zero_egress_enforced: boolean;
  status: string;
  duration_ms: number;
  steps: Array<{ step: number; task: string; status: string; duration_ms: number }>;
  active_endpoints: Array<{ service: string; url: string; probe: string }>;
  timestamp: string;
}

export default function MultiCloudClusterStudio() {
  const [clusters, setClusters] = useState<ClusterInfo[]>([]);
  const [metrics, setMetrics] = useState<InfraMetrics | null>(null);
  const [targetCloud, setTargetCloud] = useState<string>('DUAL_CLOUD_HA');
  const [nodeCount, setNodeCount] = useState<number>(2);
  const [enablePqc, setEnablePqc] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [spinningUp, setSpinningUp] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<DeploymentReceipt | null>(null);

  const fetchClusterData = useCallback(async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const [clusterRes, metricsRes] = await Promise.all([
        fetch('/api/infrastructure/clusters'),
        fetch('/api/infrastructure/metrics'),
      ]);

      if (clusterRes.ok) {
        const cData = (await clusterRes.json()) as { clusters?: ClusterInfo[] };
        if (cData.clusters) setClusters(cData.clusters);
      }

      if (metricsRes.ok) {
        const mData = (await metricsRes.json()) as InfraMetrics;
        setMetrics(mData);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to cluster orchestrator';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClusterData();
  }, [fetchClusterData]);

  const handleSpinUpStaging = async () => {
    setSpinningUp(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/infrastructure/spin-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_cloud: targetCloud,
          environment: 'staging',
          enable_pqc: enablePqc,
          node_count: nodeCount,
        }),
      });

      const data = (await res.json()) as DeploymentReceipt & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Staging spin-up failed');
      }
      setReceipt(data);
      await fetchClusterData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing staging spin-up';
      setErrorMsg(msg);
    } finally {
      setSpinningUp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono text-white tracking-tight">
              Multi-Cloud Kubernetes &amp; Terraform Staging Ops
            </h2>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
              HELM v8.7.0 • TERRAFORM v1.5+
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Automated Staging Spin-Up across High-Availability GKE (us-central1) and EKS (us-east-1) with Istio PQC mTLS.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchClusterData}
          disabled={loading}
          className="flex items-center gap-1.5 self-start md:self-auto rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-700 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Mesh Telemetry
        </button>
      </div>

      {errorMsg && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-mono text-rose-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Top Telemetry KPIs */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <span className="text-[10px] text-zinc-500 block">TOTAL MULTI-CLOUD COMPUTE</span>
            <span className="text-base font-bold text-white mt-0.5 block">
              {metrics.total_nodes} Nodes ({metrics.total_vcpus} vCPUs)
            </span>
            <span className="text-[10px] text-zinc-400">{metrics.total_ram_gb} GB Total Memory</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <span className="text-[10px] text-zinc-500 block">ISTIO PQC MUTUAL TLS</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> {metrics.pqc_handshake_latency_ms} ms
            </span>
            <span className="text-[10px] text-emerald-500/80">Kyber768 + BikeL3</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <span className="text-[10px] text-zinc-500 block">ZERO-EGRESS NETWORKPOLICY</span>
            <span className="text-base font-bold text-cyan-400 mt-0.5 block">
              {metrics.zero_egress_rules_active} Rules Active
            </span>
            <span className="text-[10px] text-cyan-500/80">0 Unauthorized Drops</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <span className="text-[10px] text-zinc-500 block">HIGH-AVAILABILITY UPTIME</span>
            <span className="text-base font-bold text-violet-400 mt-0.5 block">
              {metrics.uptime_pct}%
            </span>
            <span className="text-[10px] text-zinc-400">{metrics.total_active_pods} Active Pods</span>
          </div>
        </div>
      )}

      {/* Cluster Grid: GKE vs EKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clusters.map((cluster) => {
          const isGcp = cluster.cloud_provider.includes('Google');
          return (
            <div
              key={cluster.cluster_id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-3 font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Cloud className={`h-4 w-4 ${isGcp ? 'text-blue-400' : 'text-amber-400'}`} />
                  <span className="font-bold text-white">{cluster.cluster_id}</span>
                </div>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-bold border border-emerald-500/20">
                  {cluster.status}
                </span>
              </div>

              <div className="space-y-1.5 text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Provider:</span>
                  <span className="text-white font-medium">{cluster.cloud_provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Region:</span>
                  <span className="text-cyan-400 font-medium">{cluster.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Machine Type:</span>
                  <span className="text-zinc-300">{cluster.node_machine_type} ({cluster.node_count} nodes)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">PQC TLS Suite:</span>
                  <span className="text-emerald-400 font-medium">{cluster.pqc_tls_suite}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">NetworkPolicy:</span>
                  <span className="text-zinc-400">{cluster.network_policy}</span>
                </div>
              </div>

              {/* Resource Usage Bars */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-500">CPU Load:</span>
                    <span className="text-zinc-300">{cluster.cpu_utilization_pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${cluster.cpu_utilization_pct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-500">RAM Load:</span>
                    <span className="text-zinc-300">{cluster.ram_utilization_pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${cluster.ram_utilization_pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Pods List */}
              <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 block mb-1">ACTIVE POD FLEET:</span>
                <div className="space-y-1">
                  {cluster.active_pods.map((p) => (
                    <div key={p.name} className="flex justify-between text-[10px] bg-black/40 px-2 py-1 rounded border border-zinc-800/50">
                      <span className="text-zinc-400 truncate max-w-[200px]">{p.name}</span>
                      <span className="text-emerald-400 font-bold">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spin-Up Control Room */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4 font-mono text-xs">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-bold text-white">AUTOMATED STAGING PROVISIONING ENGINE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-zinc-400 block mb-1.5">Target Cloud Deployment:</label>
            <select
              value={targetCloud}
              onChange={(e) => setTargetCloud(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-200"
            >
              <option value="DUAL_CLOUD_HA">Dual-Cloud HA (GKE us-central1 + EKS us-east-1)</option>
              <option value="GCP">Google Cloud Platform (GKE Sovereign Private)</option>
              <option value="AWS">Amazon Web Services (EKS Redundant)</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1.5">Nodes per Cluster: {nodeCount}</label>
            <input
              type="range"
              min={1}
              max={6}
              value={nodeCount}
              onChange={(e) => setNodeCount(Number(e.target.value))}
              className="w-full accent-emerald-500 mt-2"
            />
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={enablePqc}
                onChange={(e) => setEnablePqc(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
              <span>Enforce Post-Quantum TLS (Kyber768)</span>
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSpinUpStaging}
          disabled={spinningUp}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2.5 px-4 text-xs font-bold font-mono text-white transition disabled:opacity-50"
        >
          {spinningUp ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Execute Automated Staging Spin-Up (Terraform Apply &amp; Helm Rollout)
        </button>

        {/* Real-Time Provisioning Audit Log */}
        {receipt && (
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> {receipt.status} ({receipt.deployment_id})
              </span>
              <span className="text-zinc-500">Duration: {receipt.duration_ms} ms</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              {receipt.steps.map((s) => (
                <div key={s.step} className="flex justify-between p-2 rounded bg-black/60 border border-zinc-800/80">
                  <span className="text-zinc-400">{s.step}. {s.task}</span>
                  <span className="text-emerald-400 font-bold">{s.duration_ms} ms</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded bg-zinc-950 border border-emerald-500/30 text-[11px] space-y-1">
              <span className="text-emerald-400 font-bold block mb-1">PROVISIONED STAGING ENDPOINTS:</span>
              {receipt.active_endpoints.map((ep) => (
                <div key={ep.service} className="flex justify-between">
                  <span className="text-zinc-400">{ep.service}: <code className="text-zinc-200">{ep.url}</code></span>
                  <span className="text-emerald-400">{ep.probe}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
