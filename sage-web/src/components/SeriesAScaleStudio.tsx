"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Server,
  TrendingUp,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  Building2,
  DollarSign,
  Zap,
  Lock,
  Layers,
  FileCode,
  Radio,
  Check,
  Award,
} from "lucide-react";

interface SensorNode {
  node_id: string;
  cluster_id: string;
  company_name: string;
  region: string;
  runtime: string;
  status: string;
  latency_ms: number;
  xdp_packets_per_sec: number;
  last_heartbeat_at: number;
}

interface TelemetryEvent {
  event_id: string;
  cluster_id: string;
  node_id: string;
  event_type: string;
  source_ip: string;
  destination_ip: string;
  hook_action: string;
  latency_overhead_ns: number;
  timestamp: number;
  merkle_record_hash?: string;
}

interface MeshSummary {
  total_active_clusters: number;
  total_sensor_nodes: number;
  overall_mean_latency_ms: number;
  sla_latency_ceiling_ms: number;
  sla_boundary_passed: boolean;
  aggregate_xdp_packet_drop_pps: number;
}

interface AstPatch {
  patch_id: string;
  title: string;
  target_file?: string;
  threat_actor?: string;
  severity?: string;
  unified_diff?: string;
  status: string;
  applied_at?: number;
}

interface PortalDashboard {
  tenant_id: string;
  company_name: string;
  portal_branding: string;
  primary_ciso: string;
  ciso_title: string;
  ciso_email: string;
  sla_tier: string;
  uptime_pct: number;
  downtime_minutes_ytd: number;
  mean_waf_clamp_ms: number;
  sla_ceiling_ms: number;
  indemnity_coverage_usd: number;
  active_sensor_nodes: number;
  active_ebpf_filters: number;
  pending_ast_patches: AstPatch[];
  applied_ast_patches: AstPatch[];
}

interface UnitEconomics {
  current_recognized_arr_usd: number;
  projected_year1_arr_usd: number;
  yoy_arr_growth_pct: number;
  net_revenue_retention_pct: number;
  gross_margin_pct: number;
  cac_payback_months: number;
  rule_of_40_score: number;
  average_contract_value_acv_usd: number;
  pilot_to_paid_conversion_rate_pct: number;
}

interface CohortEntry {
  client: string;
  ciso: string;
  current_arr_usd: number;
  expansion_projected_arr_usd: number;
  retention_status: string;
}

interface CapTableEntry {
  shareholder: string;
  shares: number;
  ownership_pct: number;
}

interface SeriesAModel {
  round_metadata: {
    company_name: string;
    round: string;
    pre_money_valuation_usd: number;
    target_raise_usd: number;
    post_money_valuation_usd: number;
    investor_ownership_pct: number;
  };
  unit_economics: UnitEconomics;
  enterprise_cohorts: CohortEntry[];
  cap_table: CapTableEntry[];
}

export default function SeriesAScaleStudio() {
  const [activeTab, setActiveTab] = useState<"mesh" | "portal" | "seriesA">("mesh");

  // Tab 1: Sensor Mesh
  const [nodes, setNodes] = useState<SensorNode[]>([]);
  const [meshSummary, setMeshSummary] = useState<MeshSummary | null>(null);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);

  // Tab 2: Whitelabel Tenant Portal
  const [selectedTenantId, setSelectedTenantId] = useState<string>("org-apex");
  const [portalData, setPortalData] = useState<PortalDashboard | null>(null);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isEscalating, setIsEscalating] = useState<boolean>(false);

  // Tab 3: Series A
  const [financialModel, setFinancialModel] = useState<SeriesAModel | null>(null);
  const [isRecompiling, setIsRecompiling] = useState<boolean>(false);

  // Common notification
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchMeshTelemetry() {
    try {
      const res = await fetch("/api/telemetry/sensor-mesh/nodes");
      if (res.ok) {
        const data: {
          nodes: SensorNode[];
          summary: MeshSummary;
          recent_events: TelemetryEvent[];
        } = await res.json();
        setNodes(data.nodes || []);
        setMeshSummary(data.summary || null);
        setEvents(data.recent_events || []);
      }
    } catch (err: unknown) {
      setNotification(err instanceof Error ? err.message : "Failed to fetch sensor mesh nodes.");
    }
  }

  async function fetchPortal(tenantId: string) {
    try {
      const res = await fetch(`/api/portal/tenant/${tenantId}/dashboard`);
      if (res.ok) {
        const data: { dashboard: PortalDashboard } = await res.json();
        setPortalData(data.dashboard);
      }
    } catch (err: unknown) {
      setNotification(err instanceof Error ? err.message : "Failed to fetch portal dashboard.");
    }
  }

  async function fetchFinancials() {
    try {
      const res = await fetch("/api/finance/series-a/model");
      if (res.ok) {
        const data: SeriesAModel = await res.json();
        setFinancialModel(data);
      }
    } catch (err: unknown) {
      setNotification(err instanceof Error ? err.message : "Failed to fetch financial model.");
    }
  }

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      await Promise.all([
        fetchMeshTelemetry(),
        fetchPortal(selectedTenantId),
        fetchFinancials(),
      ]);
      setLoading(false);
    }
    loadAll();
  }, []);

  async function handleTenantChange(newTenantId: string) {
    setSelectedTenantId(newTenantId);
    await fetchPortal(newTenantId);
  }

  async function handleSimulateIngest() {
    setIsIngesting(true);
    setNotification(null);
    try {
      const res = await fetch("/api/telemetry/sensor-mesh/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cluster_id: "apex-cluster",
          node_id: "apex-cluster-node-01",
          event_type: "IMDS_SSRF_CLAMPED",
          source_ip: "10.240.8.12",
          destination_ip: "169.254.169.254",
          hook_action: "XDP_DROP",
        }),
      });
      if (res.ok) {
        const data: { event: TelemetryEvent } = await res.json();
        setEvents((prev) => [data.event, ...prev]);
        setNotification(`Kernel Probe Ingested: ${data.event.event_type} dropped at ${data.event.node_id}`);
      }
    } catch (err) {
      setNotification(`Ingest failed: ${String(err)}`);
    } finally {
      setIsIngesting(false);
    }
  }

  async function handleApprovePatch(patchId: string) {
    setIsApproving(true);
    setNotification(null);
    try {
      const res = await fetch(`/api/portal/tenant/${selectedTenantId}/approve-patch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patch_id: patchId }),
      });
      if (res.ok) {
        await fetchPortal(selectedTenantId);
        setNotification(`AST Patch ${patchId} Approved by CISO and deployed to production.`);
      }
    } catch (err) {
      setNotification(`Approval failed: ${String(err)}`);
    } finally {
      setIsApproving(false);
    }
  }

  async function handleEscalateSoc() {
    setIsEscalating(true);
    setNotification(null);
    try {
      const res = await fetch(`/api/portal/tenant/${selectedTenantId}/escalate-soc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident_type: "UNUSUAL_OUTBOUND_EGRESS",
          description: "High-frequency egress spike detected on secondary trader subnet.",
        }),
      });
      if (res.ok) {
        const data: { escalation: { escalation_id: string } } = await res.json();
        setNotification(`Tier-3 SOC Incident Engaged: Escalation ID ${data.escalation.escalation_id}`);
      }
    } catch (err) {
      setNotification(`Escalation failed: ${String(err)}`);
    } finally {
      setIsEscalating(false);
    }
  }

  async function handleRecompileSeriesA() {
    setIsRecompiling(true);
    setNotification(null);
    try {
      const res = await fetch("/api/finance/series-a/recompile", {
        method: "POST",
      });
      if (res.ok) {
        setNotification("Series A Institutional Memorandum recompiled and cryptographically sealed!");
      }
    } catch (err) {
      setNotification(`Recompile failed: ${String(err)}`);
    } finally {
      setIsRecompiling(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Active Production & Series A Scale
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                $840K ARR Reconciled (142% NRR)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-2">
              Sensor Mesh Streaming Gateway, CISO Tenant Portal & Series A Data Room
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              112 deployed kernel sensor nodes reporting live telemetry, self-service CISO SLA portals with
              AST patch approvals, and institutional Series A financial data room modeling.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800/80 px-4 py-3 rounded-lg">
            <div className="text-left">
              <div className="text-xs text-slate-500 font-mono">SENSOR NODES</div>
              <div className="text-lg font-bold text-cyan-400 font-mono">
                {meshSummary?.total_sensor_nodes || 112} Nodes
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-left">
              <div className="text-xs text-slate-500 font-mono">MEAN LATENCY</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {meshSummary?.overall_mean_latency_ms || 0.165} ms
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-left">
              <div className="text-xs text-slate-500 font-mono">SERIES A TARGET</div>
              <div className="text-lg font-bold text-indigo-400 font-mono">$6,000,000</div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-800 pb-3">
          <button
            type="button"
            data-testid="sensor-mesh-tab"
            onClick={() => setActiveTab("mesh")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === "mesh"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Radio className="w-4 h-4" />
            Live Sensor Mesh Stream (112 Nodes)
          </button>
          <button
            type="button"
            data-testid="tenant-portal-tab"
            onClick={() => setActiveTab("portal")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === "portal"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Shield className="w-4 h-4" />
            Whitelabel CISO Portal (99.999% SLA)
          </button>
          <button
            type="button"
            data-testid="series-a-tab"
            onClick={() => setActiveTab("seriesA")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === "seriesA"
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Series A Financial Model ($25M Pre / $6M Raise)
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 bg-indigo-950/40 border border-indigo-800/50 rounded-xl flex items-center justify-between text-indigo-300 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs hover:text-white text-slate-400 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: Sensor Mesh Streaming */}
      {activeTab === "mesh" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Distributed Sensor Mesh Node Fleet (112 Active Enclaves)
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Sub-0.20ms SLA: Measured avg {meshSummary?.overall_mean_latency_ms || 0.165}ms • Total Drops: {meshSummary?.aggregate_xdp_packet_drop_pps.toLocaleString()} pps
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="simulate-ingest-btn"
                  disabled={isIngesting}
                  onClick={handleSimulateIngest}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {isIngesting ? "Ingesting..." : "Simulate Node Probe Ingestion"}
                </button>
                <button
                  type="button"
                  onClick={fetchMeshTelemetry}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cluster Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono">APEX SECURITIES</div>
                <div className="text-lg font-bold text-cyan-400 mt-0.5">24 Nodes</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">0.167ms Latency (AWS EKS)</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono">HYPERSCALE CLOUD</div>
                <div className="text-lg font-bold text-purple-400 mt-0.5">64 Nodes</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">0.172ms Latency (K8s Pods)</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono">NEXUS BIOHEALTH</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">16 Nodes</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">0.162ms Latency (Bare-Metal)</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono">VANGUARD DEFENSE</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">8 Nodes</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">0.160ms Latency (GovCloud)</div>
              </div>
            </div>
          </div>

          {/* Recent Live Events Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Live Ingested Telemetry & Kernel Packet Sever Stream
            </h3>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {events.map((evt) => (
                <div
                  key={evt.event_id}
                  className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                      {evt.node_id}
                    </span>
                    <span className="text-white font-medium">{evt.event_type}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {evt.source_ip} ➔ {evt.destination_ip}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-rose-400 font-mono font-bold bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/40">
                      {evt.hook_action}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {evt.latency_overhead_ns} ns
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Whitelabel Tenant Portal */}
      {activeTab === "portal" && portalData && (
        <div className="space-y-6">
          {/* CISO Switcher Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "org-apex", name: "Apex Securities", ciso: "Marcus Vance" },
              { id: "org-nexus", name: "Nexus BioHealth", ciso: "Dr. Sarah Lin" },
              { id: "org-hyperscale", name: "HyperScale Cloud", ciso: "Alex Chen" },
              { id: "org-vanguard", name: "Vanguard Defense", ciso: "Elena Rostova" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTenantChange(t.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedTenantId === t.id
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {t.name} ({t.ciso})
              </button>
            ))}
          </div>

          {/* Portal CISO Dashboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    {portalData.portal_branding}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {portalData.uptime_pct}% Uptime
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Sponsor: <span className="text-white font-semibold">{portalData.primary_ciso}</span> ({portalData.ciso_email}) • SLA: {portalData.sla_tier}
                </p>
              </div>

              <button
                type="button"
                data-testid="escalate-soc-btn"
                disabled={isEscalating}
                onClick={handleEscalateSoc}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                {isEscalating ? "Engaging SOC..." : "1-Click Escalate to Tier-3 SOC"}
              </button>
            </div>

            {/* SLA Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono">MEASURED WAF CLAMP</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  {portalData.mean_waf_clamp_ms} ms
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Ceiling &lt; {portalData.sla_ceiling_ms} ms
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono">DOWNTIME YTD</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  0.00 Minutes
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  100% SLA Availability
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono">BREACH WARRANTY</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">
                  ${(portalData.indemnity_coverage_usd / 1000000).toFixed(0)}M USD
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Underwritten Policy
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono">ACTIVE ENCLAVES</div>
                <div className="text-lg font-bold text-cyan-400 mt-0.5">
                  {portalData.active_sensor_nodes} Nodes
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {portalData.active_ebpf_filters} eBPF Filters
                </div>
              </div>
            </div>

            {/* Pending AST Patch Approval Queue */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                Pending AST AutoFix Patches Awaiting CISO Authorization ({portalData.pending_ast_patches.length})
              </h3>

              {portalData.pending_ast_patches.length > 0 ? (
                portalData.pending_ast_patches.map((p) => (
                  <div
                    key={p.patch_id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-bold">{p.patch_id}</span>
                          <span className="text-white font-semibold">{p.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-rose-950 text-rose-400 border border-rose-800">
                            {p.severity}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                          Target: {p.target_file} • Threat Actor: {p.threat_actor}
                        </div>
                      </div>

                      <button
                        type="button"
                        data-testid="approve-patch-btn"
                        disabled={isApproving}
                        onClick={() => handleApprovePatch(p.patch_id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {isApproving ? "Deploying..." : "Approve & Deploy to Kernel"}
                      </button>
                    </div>

                    {p.unified_diff && (
                      <pre className="p-3 bg-black/60 border border-slate-800/80 rounded font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
                        {p.unified_diff}
                      </pre>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-500 text-xs">
                  All synthesized AST patches have been reviewed and approved. Zero pending patches.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Series A Financial Data Room */}
      {activeTab === "seriesA" && financialModel && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Series A Institutional Investment Memorandum ($6M on $25M Pre)
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  142% Net Revenue Retention • 1.8 Mo CAC Payback • Rule of 40: {financialModel.unit_economics.rule_of_40_score}%
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isRecompiling}
                  onClick={handleRecompileSeriesA}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRecompiling ? "animate-spin" : ""}`} />
                  {isRecompiling ? "Recompiling..." : "Recompile Model"}
                </button>

                <a
                  href="/api/finance/series-a/pdf"
                  download="SageAI_Series_A_Due_Diligence_Dossier_v8.7.pdf"
                  data-testid="download-series-a-pdf-btn"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Series A Diligence PDF (.pdf)
                </a>
              </div>
            </div>

            {/* Financial Unit Economics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono">RECOGNIZED ARR</div>
                <div className="text-lg font-bold text-indigo-400 mt-0.5">
                  ${(financialModel.unit_economics.current_recognized_arr_usd / 1000).toFixed(0)}K USD
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Year-1 Target: ${(financialModel.unit_economics.projected_year1_arr_usd / 1000000).toFixed(1)}M
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono">NET REVENUE RETENTION</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  {financialModel.unit_economics.net_revenue_retention_pct}% NRR
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Top Quartile SaaS (&gt; 130%)
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono">CAC PAYBACK</div>
                <div className="text-lg font-bold text-cyan-400 mt-0.5">
                  {financialModel.unit_economics.cac_payback_months} Months
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Gross Margin {financialModel.unit_economics.gross_margin_pct}%
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono">POST-MONEY VALUATION</div>
                <div className="text-lg font-bold text-purple-400 mt-0.5">
                  ${(financialModel.round_metadata.post_money_valuation_usd / 1000000).toFixed(1)}M USD
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {financialModel.round_metadata.investor_ownership_pct}% Investor Stake
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise Account Cohort Performance */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Enterprise Account Contract Cohort ($840K ARR Executed)
            </h3>
            <div className="space-y-2">
              {financialModel.enterprise_cohorts.map((c) => (
                <div
                  key={c.client}
                  className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{c.client}</div>
                    <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                      CISO: {c.ciso} • Status: {c.retention_status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-emerald-400 font-bold">
                      ${c.current_arr_usd.toLocaleString()} ARR
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Year 2 Expansion: ${c.expansion_projected_arr_usd.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
