"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Layers,
  Loader2,
  RefreshCw,
  Shield,
  ShieldAlert,
  Terminal,
  Zap,
} from "lucide-react";
import axios from "axios";

interface OperationalMetrics {
  timestamp: string;
  scan_fleet: {
    backlog_depth: number;
    running_scans: number;
    completed_scans: number;
    failed_scans: number;
    broker_connected: boolean;
    worker_concurrency_capacity: number;
    fleet_status: string;
  };
  alert_operations: {
    p50_latency_ms: number;
    p95_latency_ms: number;
    p99_latency_ms: number;
    sla_compliant: boolean;
    active_channels_count: number;
    channels_breakdown: Record<string, number>;
  };
  threat_feed_intel: {
    last_sync_timestamp: string;
    hours_since_sync: number;
    is_stale: boolean;
    status: string;
  };
  remediation_velocity: {
    pending_approval: number;
    dispatched_prs: number;
    rejected_patches: number;
    approval_ratio: number;
  };
}

interface TraceSummary {
  trace_id: string;
  root_name: string;
  start_time: number;
  duration_ms: number;
  span_count: number;
  status: string;
  path: string;
}

interface TraceDetail {
  trace_id: string;
  span_count: number;
  total_duration_ms: number;
  spans: Array<{
    span_id: string;
    parent_span_id?: string;
    name: string;
    duration_ms: number;
    status: string;
    attributes: Record<string, unknown>;
  }>;
}

export function ObservabilityDashboard() {
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Traces state
  const [traces, setTraces] = useState<TraceSummary[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<TraceDetail | null>(null);
  const [loadingTraceDetail, setLoadingTraceDetail] = useState(false);

  // DAST state
  const [dastTarget, setDastTarget] = useState("https://staging.example.com");
  const [dastMode, setDastMode] = useState<"passive" | "active">("passive");
  const [isAuthorizedStaging, setIsAuthorizedStaging] = useState(false);
  const [runningDast, setRunningDast] = useState(false);
  const [dastResults, setDastResults] = useState<Record<string, unknown> | null>(null);
  const [dastError, setDastError] = useState("");

  const fetchMetrics = async () => {
    try {
      const res = await axios.get("/api/telemetry/metrics");
      setMetrics(res.data);
    } catch {
      // Graceful fallback
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchTraces = async () => {
    try {
      const res = await axios.get("/api/telemetry/traces?limit=20");
      setTraces(res.data.traces || []);
    } catch {
      setTraces([]);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchTraces();
  }, []);

  const inspectTrace = async (traceId: string) => {
    setLoadingTraceDetail(true);
    try {
      const res = await axios.get(`/api/telemetry/traces/${traceId}`);
      setSelectedTrace(res.data);
    } catch {
      setSelectedTrace(null);
    } finally {
      setLoadingTraceDetail(false);
    }
  };

  const handleRunDast = async () => {
    if (!dastTarget.trim()) return;
    setRunningDast(true);
    setDastResults(null);
    setDastError("");

    try {
      const res = await axios.post("/api/dast/scan", {
        target: dastTarget,
        mode: dastMode,
        is_authorized: isAuthorizedStaging,
      });
      setDastResults(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setDastError(err.response?.data?.detail || err.message);
      } else {
        setDastError("DAST scan failed to execute.");
      }
    } finally {
      setRunningDast(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Phase 05: Observability & Release Hardening
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time fleet telemetry, W3C distributed trace waterfalls, and authorized staging DAST verification.
          </p>
        </div>
        <button
          onClick={() => {
            fetchMetrics();
            fetchTraces();
          }}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-mono flex items-center gap-1.5 self-start sm:self-center transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Operational Scorecard Cards */}
      {loadingMetrics ? (
        <div className="p-8 text-center bg-zinc-900/30 rounded-xl border border-zinc-800 text-zinc-400 text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          Loading operational metrics...
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Worker Fleet Backlog */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" /> Worker Fleet
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold">
                {metrics.scan_fleet.fleet_status}
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {metrics.scan_fleet.backlog_depth}{" "}
              <span className="text-xs text-zinc-500 font-normal">queued / {metrics.scan_fleet.worker_concurrency_capacity} max slots</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              Running: <span className="text-emerald-400 font-bold">{metrics.scan_fleet.running_scans}</span> • Completed: {metrics.scan_fleet.completed_scans}
            </div>
          </div>

          {/* Alert SLA Delivery */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Alert SLA Latency
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  metrics.alert_operations.sla_compliant
                    ? "bg-emerald-950 text-emerald-400"
                    : "bg-red-950 text-red-400"
                }`}
              >
                {metrics.alert_operations.sla_compliant ? "SLA Passed" : "SLA Breached"}
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {metrics.alert_operations.p95_latency_ms}{" "}
              <span className="text-xs text-zinc-500 font-normal">ms (P95)</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              P50: {metrics.alert_operations.p50_latency_ms}ms • P99: {metrics.alert_operations.p99_latency_ms}ms
            </div>
          </div>

          {/* Threat Intelligence Freshness */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-400" /> Threat Intelligence
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  metrics.threat_feed_intel.is_stale
                    ? "bg-amber-950 text-amber-400"
                    : "bg-emerald-950 text-emerald-400"
                }`}
              >
                {metrics.threat_feed_intel.is_stale ? "Stale (>24h)" : "Live"}
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {metrics.threat_feed_intel.hours_since_sync}h{" "}
              <span className="text-xs text-zinc-500 font-normal">since crawl</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono truncate">
              Last: {new Date(metrics.threat_feed_intel.last_sync_timestamp).toLocaleTimeString()}
            </div>
          </div>

          {/* Remediation Velocity */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" /> SagePatch Velocity
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-400 font-bold">
                {Math.round(metrics.remediation_velocity.approval_ratio * 100)}% Approved
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {metrics.remediation_velocity.pending_approval}{" "}
              <span className="text-xs text-zinc-500 font-normal">awaiting review</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              PRs Dispatched: <span className="text-emerald-400 font-bold">{metrics.remediation_velocity.dispatched_prs}</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Distributed Trace Waterfalls Section */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          Distributed Trace Waterfalls (W3C Trace Context)
        </h3>
        <p className="text-xs text-zinc-400">
          Trace propagation tracks incoming browser/API calls through authentication, scanning workers, and alerting pipelines.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Traces List */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {traces.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 bg-black/40 rounded-lg">
                No recent traces recorded yet.
              </div>
            ) : (
              traces.map((t) => (
                <div
                  key={t.trace_id}
                  onClick={() => inspectTrace(t.trace_id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all text-xs font-mono flex items-center justify-between ${
                    selectedTrace?.trace_id === t.trace_id
                      ? "bg-emerald-950/40 border-emerald-500/60 text-white"
                      : "bg-black/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold truncate max-w-xs">{t.root_name}</div>
                    <div className="text-[10px] text-zinc-500">ID: {t.trace_id.slice(0, 12)}...</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-emerald-400">
                      {t.duration_ms}ms
                    </span>
                    <div className="text-[10px] text-zinc-500 mt-1">{t.span_count} spans</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Trace Detail Waterfall */}
          <div className="bg-black/50 border border-zinc-800 rounded-lg p-4 font-mono text-xs max-h-80 overflow-y-auto">
            {loadingTraceDetail ? (
              <div className="h-full flex items-center justify-center gap-2 text-zinc-500">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading trace waterfall...
              </div>
            ) : selectedTrace ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-emerald-400 font-bold">Trace: {selectedTrace.trace_id}</span>
                  <span className="text-zinc-400 font-bold">{selectedTrace.total_duration_ms} ms total</span>
                </div>
                <div className="space-y-2">
                  {selectedTrace.spans.map((span) => (
                    <div key={span.span_id} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-200 truncate">{span.name}</span>
                        <span className="text-emerald-400 font-bold">{span.duration_ms}ms</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(10, (span.duration_ms / selectedTrace.total_duration_ms) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-center">
                Select a trace on the left to inspect its span waterfall.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-Tier Staged DAST Verification */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Two-Tier Staged DAST Verification
          </h3>
          <span className="text-xs font-mono text-zinc-500">Nightly DAST Hardening</span>
        </div>
        <p className="text-xs text-zinc-400">
          Combines non-invasive passive baseline analysis (headers, cookies, disclosures) with controlled active probes restricted exclusively to authorized staging targets.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={dastTarget}
            onChange={(e) => setDastTarget(e.target.value)}
            placeholder="https://staging.target.com"
            className="col-span-2 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
          />
          <select
            value={dastMode}
            onChange={(e) => setDastMode(e.target.value as "passive" | "active")}
            className="bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="passive">Passive Baseline Scan (Safe)</option>
            <option value="active">Controlled Active Staging Probe</option>
          </select>
        </div>

        {dastMode === "active" && (
          <label className="flex items-center gap-2 text-xs text-amber-300 font-mono bg-amber-950/30 border border-amber-800/40 p-3 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={isAuthorizedStaging}
              onChange={(e) => setIsAuthorizedStaging(e.target.checked)}
              className="rounded border-zinc-700 text-amber-500 focus:ring-0"
            />
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>I confirm this target is an explicitly authorized staging environment (required for active probes).</span>
          </label>
        )}

        <div className="flex items-center justify-end">
          <button
            onClick={handleRunDast}
            disabled={runningDast || !dastTarget.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold px-5 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950"
          >
            {runningDast ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Running DAST Scan...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" /> Execute DAST Verification
              </>
            )}
          </button>
        </div>

        {dastError && (
          <div className="bg-red-950/40 border border-red-700/40 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 font-mono">{dastError}</p>
          </div>
        )}

        {dastResults && (
          <div className="bg-black/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> DAST Scan Completed
              </span>
              <span className="text-zinc-400">
                Found {Array.isArray(dastResults.findings) ? dastResults.findings.length : 0} items
              </span>
            </div>
            <pre className="text-xs text-zinc-400 font-mono max-h-60 overflow-y-auto p-3 bg-zinc-950 rounded-lg">
              {JSON.stringify(dastResults, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
