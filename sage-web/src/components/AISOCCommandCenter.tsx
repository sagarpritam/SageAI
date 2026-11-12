"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Zap,
  Filter,
  Layers,
  FileText,
  RefreshCw,
  TrendingDown,
  Terminal,
} from "lucide-react";

export function AISOCCommandCenter() {
  const [loading, setLoading] = useState(false);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [triageReport, setTriageReport] = useState<any>(null);
  const [briefing, setBriefing] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleAlerts = [
    { id: "ALT-01", source_ip: "198.51.100.42", target_asset: "prod-api-gateway", type: "sqli_probe", severity: "LOW", category: "waf_probe" },
    { id: "ALT-02", source_ip: "198.51.100.42", target_asset: "prod-api-gateway", type: "xss_attempt", severity: "LOW", category: "waf_probe" },
    { id: "ALT-03", source_ip: "198.51.100.42", target_asset: "prod-api-gateway", type: "path_traversal", severity: "MEDIUM", category: "waf_probe" },
    { id: "ALT-04", source_ip: "198.51.100.42", target_asset: "prod-api-gateway", type: "dir_buster", severity: "LOW", category: "waf_probe" },
    { id: "ALT-05", source_ip: "198.51.100.42", target_asset: "prod-api-gateway", type: "port_scan", severity: "INFO", category: "nids_sweep" },
    { id: "ALT-06", source_ip: "203.0.113.88", target_asset: "k8s-worker-prod-02", type: "ebpf_setns_escape", severity: "CRITICAL", category: "container_escape" },
    { id: "ALT-07", source_ip: "203.0.113.88", target_asset: "k8s-worker-prod-02", type: "honeytoken_aws_access", severity: "CRITICAL", category: "deception_tripwire" },
    { id: "ALT-08", source_ip: "203.0.113.88", target_asset: "k8s-worker-prod-02", type: "data_exfiltration_burst", severity: "HIGH", category: "nids_exfil" },
    { id: "ALT-09", source_ip: "192.0.2.14", target_asset: "auth-service", type: "brute_force_spike", severity: "MEDIUM", category: "auth_anomaly" },
    { id: "ALT-10", source_ip: "192.0.2.14", target_asset: "auth-service", type: "jwt_alg_none_probe", severity: "HIGH", category: "auth_tamper" },
  ];

  const runTriage = async () => {
    setLoading(true);
    setBriefing(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ai-soc/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_alerts: sampleAlerts }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} running neural alert triage`);
      }
      const data = await res.json();
      setTriageReport(data.triage_report);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Neural alert triage failed");
    } finally {
      setLoading(false);
    }
  };

  const generateBriefing = async () => {
    if (!triageReport) return;
    setBriefingLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ai-soc/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triage_report: triageReport }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} generating CISO briefing`);
      }
      const data = await res.json();
      setBriefing(data.executive_briefing);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "CISO briefing generation failed");
    } finally {
      setBriefingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-zinc-950 to-zinc-900 border border-cyan-900/40 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Autonomous AI SOC & Neural Alert Triage Engine
                <span className="text-xs font-mono px-2 py-0.5 bg-cyan-950 border border-cyan-700/60 rounded text-cyan-300">
                  95% Noise Reduction
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Automated 3-Tier Alert Triage, Graph-based Alert Clustering, Root-Cause Hypothesis Synthesis & CISO Briefings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={runTriage}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Run Neural Alert Triage
          </button>
        </div>

        {errorMsg && (
          <div role="alert" className="mt-4 p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-rose-300 hover:text-white px-2 py-0.5 rounded bg-rose-900/50"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6">
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg">
            <span className="text-zinc-500 text-[10px] font-mono">INGESTED RAW ALERTS</span>
            <div className="text-lg font-bold text-white mt-1">{sampleAlerts.length} Signals</div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg">
            <span className="text-zinc-500 text-[10px] font-mono">NOISE REDUCTION GAIN</span>
            <div className="text-lg font-bold text-cyan-400 mt-1 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              {triageReport?.noise_reduction_ratio || "90.0%"}
            </div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg">
            <span className="text-zinc-500 text-[10px] font-mono">CORRELATED INCIDENTS</span>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {triageReport?.correlated_incident_count || 3} Triaged
            </div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg">
            <span className="text-zinc-500 text-[10px] font-mono">TIER-3 ESCALATIONS</span>
            <div className="text-lg font-bold text-rose-400 mt-1">
              {triageReport?.triage_summary?.tier_3_critical_escalation || 1} Critical
            </div>
          </div>
        </div>
      </div>

      {/* Triaged Incidents View */}
      {triageReport && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Correlated Attack Clusters ({triageReport.incidents.length})
            </h3>
            <button
              type="button"
              onClick={generateBriefing}
              disabled={briefingLoading}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              {briefingLoading ? "Synthesizing Briefing..." : "Generate CISO Briefing"}
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {triageReport.incidents.map((inc: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 bg-zinc-950 border rounded-xl space-y-3 ${
                  inc.triage_tier === "TIER_3_CRITICAL_ESCALATION"
                    ? "border-rose-900/60 bg-rose-950/10"
                    : inc.triage_tier === "TIER_2_INVESTIGATION"
                    ? "border-amber-900/60 bg-amber-950/10"
                    : "border-zinc-800"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{inc.incident_id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        inc.triage_tier === "TIER_3_CRITICAL_ESCALATION"
                          ? "bg-rose-950 text-rose-400 border-rose-700 font-bold"
                          : inc.triage_tier === "TIER_2_INVESTIGATION"
                          ? "bg-amber-950 text-amber-400 border-amber-700 font-bold"
                          : "bg-emerald-950 text-emerald-400 border-emerald-700"
                      }`}
                    >
                      {inc.triage_tier}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Aggregated {inc.aggregated_alert_count} raw signals
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Source: <span className="text-zinc-300">{inc.source_ip}</span> → Target: <span className="text-zinc-300">{inc.target_asset}</span>
                  </div>
                </div>

                <div className="p-3 bg-black/60 border border-zinc-800 rounded-lg space-y-1">
                  <div className="text-zinc-400 text-[11px] font-bold">Autonomous Root-Cause Hypothesis:</div>
                  <div className="text-zinc-200 text-xs leading-relaxed">{inc.root_cause_hypothesis}</div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">MITRE Tactics:</span>
                    {inc.mitre_tactics.map((tac: string, tIdx: number) => (
                      <span key={tIdx} className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-cyan-300 text-[10px]">
                        {tac}
                      </span>
                    ))}
                  </div>
                  <div className="text-cyan-400 font-bold">
                    Action: {inc.recommended_action}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Merkle Seal */}
          {triageReport.merkle_seal && (
            <div className="p-3 bg-black border border-emerald-900/40 rounded-xl flex items-center justify-between text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Merkle Seal Block #{triageReport.merkle_seal.ledger_index} Cryptographically Verified</span>
              </div>
              <div className="text-zinc-500 text-[10px] truncate max-w-xs">{triageReport.merkle_seal.record_hash}</div>
            </div>
          )}
        </div>
      )}

      {/* CISO Executive Briefing Modal/Card */}
      {briefing && (
        <div className="p-6 bg-gradient-to-r from-zinc-950 via-cyan-950/20 to-zinc-950 border border-cyan-800/60 rounded-xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                {briefing.title}
              </h4>
              <span className="text-[11px] text-zinc-500">Prepared for: {briefing.prepared_for}</span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px]">
              {briefing.governance_status}
            </span>
          </div>

          <p className="text-zinc-300 leading-relaxed text-xs p-3 bg-black/60 border border-zinc-800 rounded-lg">
            {briefing.executive_summary}
          </p>

          <div className="space-y-2">
            <div className="text-zinc-400 font-bold text-xs">Autonomous Containment Playbook:</div>
            <div className="space-y-2">
              {briefing.recommended_playbook.map((pb: any, idx: number) => (
                <div key={idx} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-cyan-300">[{pb.phase}] </span>
                    <span className="text-zinc-200">{pb.action}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-black border border-zinc-700 rounded text-zinc-400 shrink-0">
                    Priority: {pb.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

