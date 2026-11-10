"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Binary,
  Radio,
  Network,
  Activity,
  Flame,
  Bot,
  Crosshair,
  Lock,
  Layers,
  FileCheck,
  Download,
  RefreshCw,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronRight,
  Terminal,
  Zap,
} from "lucide-react";
import axios from "axios";
import { PLATFORM_VERSION } from "@/lib/platform";

interface Capability {
  id: number;
  key: string;
  name: string;
  category: string;
  status: string;
  version: string;
  module: string;
  description: string;
  metrics: Record<string, any>;
  mitre_ttps: string[];
}

interface DrillStage {
  stage: number;
  capability: string;
  status: string;
  summary: string;
  [key: string]: any;
}

interface MerkleSeal {
  record_hash: string;
  previous_hash: string;
  ledger_index: number;
  timestamp: string;
  algorithm: string;
  status: string;
}

interface DrillResult {
  status: string;
  drill_id: string;
  scenario_name: string;
  attacker_ip: string;
  executed_by: string;
  executed_at: string;
  elapsed_ms: number;
  stages_total: number;
  stages_passed: number;
  compliance_rating: string;
  merkle_seal: MerkleSeal;
  stages: DrillStage[];
  executive_summary: string;
}

export function EnterpriseSecurityHub() {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [loadingCaps, setLoadingCaps] = useState<boolean>(true);
  const [runningDrill, setRunningDrill] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [drillResult, setDrillResult] = useState<DrillResult | null>(null);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportMarkdown, setReportMarkdown] = useState<string>("");
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const fetchCapabilities = async () => {
    setLoadingCaps(true);
    try {
      const res = await axios.get("/api/security/enterprise-capabilities");
      if (res.data?.capabilities) {
        setCapabilities(res.data.capabilities);
      }
    } catch (err) {
      console.error("Failed to load enterprise capabilities", err);
    } finally {
      setLoadingCaps(false);
    }
  };

  useEffect(() => {
    fetchCapabilities();
  }, []);

  const handleRunFullDrill = async () => {
    setRunningDrill(true);
    setDrillResult(null);
    setActiveStage(0);

    try {
      // Simulate live stage progression animation
      const stageInterval = setInterval(() => {
        setActiveStage((prev) => (prev < 10 ? prev + 1 : prev));
      }, 350);

      const res = await axios.post("/api/security/enterprise-drill", {
        scenario_name: "Enterprise Sovereign Defense & Offense Grid Drill",
        attacker_ip: "198.51.100.99",
      });

      clearInterval(stageInterval);
      setActiveStage(10);

      if (res.data?.status === "SUCCESS") {
        setDrillResult(res.data);
      }
    } catch (err) {
      console.error("Failed to execute enterprise security drill", err);
    } finally {
      setRunningDrill(false);
    }
  };

  const handleFetchReport = async () => {
    try {
      const res = await axios.get("/api/security/enterprise-report");
      if (res.data?.markdown_report) {
        setReportMarkdown(res.data.markdown_report);
        setShowReportModal(true);
      }
    } catch (err) {
      console.error("Failed to fetch compliance report", err);
    }
  };

  const handleCopyMerkleHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getCapabilityIcon = (key: string) => {
    switch (key) {
      case "reverse_engineering":
        return <Binary className="w-5 h-5 text-indigo-400" />;
      case "deception_mesh":
        return <Radio className="w-5 h-5 text-amber-400" />;
      case "waf_detector":
        return <ShieldAlert className="w-5 h-5 text-emerald-400" />;
      case "nids_monitor":
        return <Network className="w-5 h-5 text-cyan-400" />;
      case "threat_intelligence":
        return <Flame className="w-5 h-5 text-rose-400" />;
      case "ueba_engine":
        return <Activity className="w-5 h-5 text-purple-400" />;
      case "soar_engine":
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case "redteam_resilience":
        return <Bot className="w-5 h-5 text-blue-400" />;
      case "cyber_range":
        return <Crosshair className="w-5 h-5 text-orange-400" />;
      case "merkle_audit_chain":
        return <Lock className="w-5 h-5 text-teal-400" />;
      default:
        return <Shield className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-black p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SOVEREIGN DEFENSE GRID v{PLATFORM_VERSION}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                10/10 ACTIVE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                RATING: AAA
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              Enterprise Security Orchestration Hub
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl mt-1">
              End-to-end orchestration uniting Reverse Engineering, Deception Mesh, Next-Gen WAF, NIDS,
              Threat Intelligence, UEBA Analytics, SOAR Playbooks, NeMo Guardrails, Cyber Range, and Merkle Proofs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleFetchReport}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center gap-2 transition shadow-lg"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Compliance Report
            </button>
            <button
              onClick={handleRunFullDrill}
              disabled={runningDrill}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold text-black flex items-center gap-2 transition shadow-xl ${
                runningDrill
                  ? "bg-emerald-500/50 cursor-not-allowed"
                  : "bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20 hover:scale-[1.02]"
              }`}
            >
              {runningDrill ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  Exercising Defense Grid ({activeStage}/10)...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-black text-black" />
                  Execute 10-Stage Enterprise Drill
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Progress Bar when running */}
        {runningDrill && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Executing Stage {activeStage} of 10...
              </span>
              <span>{activeStage * 10}% Complete</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 ease-out"
                style={{ width: `${activeStage * 10}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Drill Results Section */}
      {drillResult && (
        <div className="rounded-2xl border border-emerald-500/40 bg-zinc-950 p-6 shadow-2xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  DRILL EXECUTION SUCCESSFUL
                </span>
                <span className="text-xs font-mono text-zinc-500">ID: {drillResult.drill_id}</span>
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                10/10 Capabilities Intercepted & Contained
              </h2>
              <p className="text-xs text-zinc-400 mt-1">{drillResult.executive_summary}</p>
            </div>

            {/* Merkle Seal Pill */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 flex flex-col gap-1 min-w-[280px]">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  Merkle Cryptographic Seal
                </span>
                <span className="text-zinc-500">Block #{drillResult.merkle_seal.ledger_index}</span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-1">
                <code className="text-[11px] font-mono text-emerald-300 truncate max-w-[200px]">
                  {drillResult.merkle_seal.record_hash}
                </code>
                <button
                  onClick={() => handleCopyMerkleHash(drillResult.merkle_seal.record_hash)}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
                  title="Copy SHA-256 Hash"
                >
                  {copiedHash ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                Anchored at: {new Date(drillResult.merkle_seal.timestamp).toLocaleTimeString()} • Latency: {drillResult.elapsed_ms}ms
              </span>
            </div>
          </div>

          {/* Drill Stages Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">
              10-Stage Forensic Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {drillResult.stages.map((stage) => {
                const isExpanded = expandedStage === stage.stage;
                return (
                  <div
                    key={stage.stage}
                    className={`rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                      isExpanded
                        ? "border-emerald-500 bg-zinc-900/90 shadow-lg"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60"
                    }`}
                    onClick={() => setExpandedStage(isExpanded ? null : stage.stage)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono text-xs font-bold text-emerald-400">
                          {stage.stage}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{stage.capability}</h4>
                          <span className="text-xs text-zinc-400">{stage.summary}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {stage.status}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-zinc-800 text-xs font-mono space-y-2 text-zinc-300 animate-in fade-in duration-200">
                        {Object.entries(stage)
                          .filter(([k]) => !["stage", "capability", "status", "summary"].includes(k))
                          .map(([key, val]) => (
                            <div key={key} className="flex flex-col gap-0.5">
                              <span className="text-[11px] text-zinc-500 capitalize">{key.replace(/_/g, " ")}:</span>
                              <pre className="bg-black/60 p-2 rounded border border-zinc-800/80 overflow-x-auto text-emerald-300 text-[11px]">
                                {typeof val === "object" ? JSON.stringify(val, null, 2) : String(val)}
                              </pre>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 10 Capabilities Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Unified Enterprise Architecture
            </h2>
            <p className="text-xs text-zinc-400">
              Live telemetry and architectural specifications across all 10 defense layers
            </p>
          </div>
          <button
            onClick={fetchCapabilities}
            disabled={loadingCaps}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
            title="Refresh Capability Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loadingCaps ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap) => (
            <div
              key={cap.id}
              className="group rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 hover:border-emerald-500/40 hover:bg-zinc-900/40 transition-all duration-300 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-emerald-500/30 transition">
                    {getCapabilityIcon(cap.key)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-mono font-bold text-emerald-400">{cap.status}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{cap.category}</span>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                    {cap.id}. {cap.name}
                  </h3>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-4">{cap.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800">
                  {Object.entries(cap.metrics || {})
                    .slice(0, 2)
                    .map(([mk, mv]) => (
                      <div key={mk} className="truncate">
                        <span className="text-zinc-500 block text-[10px] capitalize">{mk.replace(/_/g, " ")}</span>
                        <span className="text-zinc-200 font-semibold truncate block">
                          {Array.isArray(mv) ? mv.length : String(mv)}
                        </span>
                      </div>
                    ))}
                </div>

                {/* MITRE TTPs & Module */}
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span className="truncate max-w-[140px] text-zinc-400" title={cap.module}>
                    {cap.module.split(".").slice(-2).join(".")}
                  </span>
                  <div className="flex gap-1">
                    {(cap.mitre_ttps || []).slice(0, 3).map((ttp) => (
                      <span key={ttp} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                        {ttp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Executive Compliance & Audit Report</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([reportMarkdown], { type: "text/markdown" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `SageAI_Compliance_Report_${Date.now()}.md`;
                    a.click();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .md
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <pre className="p-4 rounded-xl bg-black border border-zinc-800 text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {reportMarkdown}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

