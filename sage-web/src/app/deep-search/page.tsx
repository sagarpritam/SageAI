"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Radar,
  GitBranch,
  Globe,
  Mail,
  User,
  Phone,
  Server,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Zap,
  Eye,
  FileText,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GraphNode {
  id: string;
  label: string;
  type: string;
  depth: number;
  findings_count: number;
  status: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
  reason: string;
}

interface TimelineEntry {
  entity: string;
  entity_type: string;
  depth: number;
  findings_count: number;
  duration_s: number;
}

interface DeepSearchResult {
  agent: string;
  module: string;
  codename: string;
  target: string;
  target_type: string;
  status: string;
  session_id: string;
  stats: {
    total_entities: number;
    total_findings: number;
    max_depth_reached: number;
    max_depth_configured: number;
    duration_s: number;
  };
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  timeline: TimelineEntry[];
  briefing: string;
  entities: Record<string, {
    entity: string;
    entity_type: string;
    depth: number;
    findings_count: number;
    findings: Record<string, unknown>[];
    pivots_found: string[];
    status: string;
    duration_s: number;
  }>;
}

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "pivot" | "briefing";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ENTITY_ICONS: Record<string, typeof Globe> = {
  domain: Globe,
  ip: Server,
  email: Mail,
  username: User,
  phone: Phone,
};

const ENTITY_COLORS: Record<string, string> = {
  domain: "text-emerald-400",
  ip: "text-cyan-400",
  email: "text-amber-400",
  username: "text-purple-400",
  phone: "text-rose-400",
};

const DEPTH_RINGS = ["ring-emerald-500/50", "ring-cyan-500/50", "ring-amber-500/50", "ring-purple-500/50", "ring-rose-500/50"];

function formatTime(s: number): string {
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${Math.floor(s / 60)}m ${(s % 60).toFixed(0)}s`;
}

function getTimestamp(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DeepSearchPage() {
  const [target, setTarget] = useState("");
  const [targetType, setTargetType] = useState("domain");
  const [maxDepth, setMaxDepth] = useState(3);
  const [searchState, setSearchState] = useState<"idle" | "running" | "complete" | "error">("idle");
  const [result, setResult] = useState<DeepSearchResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"terminal" | "graph" | "briefing" | "entities">("terminal");
  const logEndRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);

  // Auto-scroll terminal
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    logIdRef.current++;
    setLogs((prev) => [
      ...prev,
      { id: logIdRef.current, timestamp: getTimestamp(), message, type },
    ]);
  }, []);

  const startSearch = async () => {
    if (!target.trim()) return;

    setSearchState("running");
    setResult(null);
    setLogs([]);
    setActiveTab("terminal");

    addLog(`Initializing Deep Search: THE ABYSS`, "info");
    addLog(`Target: ${target} (${targetType})`, "info");
    addLog(`Max depth: ${maxDepth} | Strategy: Recursive OSINT Pivoting`, "info");
    addLog(`───────────────────────────────────────`, "info");
    addLog(`[PHASE 1] Running intelligence modules against primary target...`, "info");

    try {
      const res = await axios.post("/api/intelligence/deep-search", {
        target: target.trim(),
        target_type: targetType,
        max_depth: maxDepth,
        max_entities: 25,
      });

      const data: DeepSearchResult = res.data;
      setResult(data);

      // Replay timeline as logs
      for (const entry of data.timeline) {
        const depthPrefix = "  ".repeat(entry.depth);
        addLog(
          `${depthPrefix}[DEPTH ${entry.depth}] Searched ${entry.entity_type}:${entry.entity} → ${entry.findings_count} findings (${entry.duration_s}s)`,
          entry.findings_count > 0 ? "success" : "info"
        );
      }

      // Log graph edges as pivots
      for (const edge of data.graph.edges) {
        addLog(`  ↳ PIVOT: ${edge.source} → ${edge.target} (${edge.reason})`, "pivot");
      }

      addLog(`───────────────────────────────────────`, "info");
      addLog(
        `[COMPLETE] ${data.stats.total_entities} entities | ${data.stats.total_findings} findings | ${formatTime(data.stats.duration_s)}`,
        "success"
      );

      if (data.briefing) {
        addLog(`[BRIEFING] AI intelligence briefing generated`, "briefing");
      }

      setSearchState("complete");
      setActiveTab("briefing");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      addLog(`[ERROR] Deep search failed: ${err.response?.data?.detail || err.message}`, "warning");
      setSearchState("error");
    }
  };

  return (
    <main className="min-h-screen bg-black text-emerald-50 font-sans selection:bg-emerald-500/30">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/30 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/scan" className="text-zinc-500 hover:text-emerald-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-900/40 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Radar className="w-7 h-7 text-emerald-400 animate-scan" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-emerald-500">
                DEEP SEARCH
              </h1>
              <p className="text-xs font-mono text-emerald-600 tracking-widest uppercase">
                Module 10 // The Abyss — Recursive OSINT
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-enhanced rounded-2xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Entity Type Selector */}
            <div className="flex gap-1 p-1 bg-zinc-900/60 rounded-xl">
              {(["domain", "ip", "email", "username", "phone"] as const).map((type) => {
                const Icon = ENTITY_ICONS[type];
                return (
                  <button
                    key={type}
                    onClick={() => setTargetType(type)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      targetType === type
                        ? "bg-emerald-900/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {type}
                  </button>
                );
              })}
            </div>

            {/* Input + Controls */}
            <div className="flex-1 flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchState !== "running" && startSearch()}
                  placeholder={
                    targetType === "domain" ? "example.com" :
                    targetType === "ip" ? "8.8.8.8" :
                    targetType === "email" ? "user@example.com" :
                    targetType === "username" ? "johndoe" :
                    "+1234567890"
                  }
                  disabled={searchState === "running"}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-emerald-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/50 transition-all disabled:opacity-50"
                />
              </div>

              {/* Depth selector */}
              <select
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
                disabled={searchState === "running"}
                className="px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-emerald-300 font-mono text-sm focus:outline-none focus:border-emerald-700 disabled:opacity-50"
              >
                <option value={1}>Depth 1</option>
                <option value={2}>Depth 2</option>
                <option value={3}>Depth 3</option>
                <option value={4}>Depth 4</option>
                <option value={5}>Depth 5</option>
              </select>

              <button
                onClick={startSearch}
                disabled={searchState === "running" || !target.trim()}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:shadow-none flex items-center gap-2"
              >
                {searchState === "running" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Deep Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        {(searchState !== "idle") && (
          <div className="space-y-6">
            {/* Stats Bar */}
            {result && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "Entities", value: result.stats.total_entities, icon: GitBranch },
                  { label: "Findings", value: result.stats.total_findings, icon: Eye },
                  { label: "Depth", value: `${result.stats.max_depth_reached}/${result.stats.max_depth_configured}`, icon: Radar },
                  { label: "Duration", value: formatTime(result.stats.duration_s), icon: Zap },
                  { label: "Status", value: result.status === "complete" ? "Complete" : result.status, icon: CheckCircle2 },
                ].map((stat) => (
                  <div key={stat.label} className="glass rounded-xl p-4 flex items-center gap-3">
                    <stat.icon className={`w-5 h-5 ${stat.label === "Status" ? "text-emerald-400" : "text-zinc-500"}`} />
                    <div>
                      <p className="text-xs text-zinc-500 font-mono uppercase">{stat.label}</p>
                      <p className="text-lg font-bold text-emerald-200">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab Bar */}
            <div className="flex gap-1 p-1 bg-zinc-900/40 rounded-xl w-fit">
              {[
                { id: "terminal" as const, label: "Research Terminal", icon: ChevronRight },
                { id: "graph" as const, label: "Discovery Graph", icon: GitBranch },
                { id: "briefing" as const, label: "AI Briefing", icon: FileText },
                { id: "entities" as const, label: "Entities", icon: Eye },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-emerald-900/50 text-emerald-300 shadow-md"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="glass-enhanced rounded-2xl overflow-hidden min-h-[400px]">
              {/* ── Terminal ── */}
              {activeTab === "terminal" && (
                <div className="p-0">
                  <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900/80 border-b border-zinc-800">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-mono text-zinc-600 ml-2">
                      deep-search@sageai — {target || "waiting"}
                    </span>
                    {searchState === "running" && (
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-500 ml-auto" />
                    )}
                  </div>
                  <div className="p-4 max-h-[500px] overflow-y-auto font-mono text-sm space-y-1 scrollbar-hide">
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-3">
                        <span className="text-zinc-700 shrink-0 select-none">{log.timestamp}</span>
                        <span
                          className={
                            log.type === "success" ? "text-emerald-400" :
                            log.type === "warning" ? "text-amber-400" :
                            log.type === "pivot" ? "text-cyan-400" :
                            log.type === "briefing" ? "text-purple-400" :
                            "text-zinc-400"
                          }
                        >
                          {log.message}
                        </span>
                      </div>
                    ))}
                    {searchState === "running" && (
                      <div className="flex items-center gap-2 text-emerald-600 mt-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="animate-pulse">Analyzing entities...</span>
                      </div>
                    )}
                    <div ref={logEndRef} />
                  </div>
                </div>
              )}

              {/* ── Discovery Graph ── */}
              {activeTab === "graph" && result && (
                <div className="p-6">
                  <h3 className="text-lg font-bold text-emerald-300 mb-6">Entity Discovery Map</h3>

                  {result.graph.nodes.length === 0 ? (
                    <p className="text-zinc-500 text-center py-12">No graph data available yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Visual tree */}
                      {result.graph.nodes
                        .sort((a, b) => a.depth - b.depth)
                        .map((node) => {
                          const Icon = ENTITY_ICONS[node.type] || Globe;
                          const color = ENTITY_COLORS[node.type] || "text-zinc-400";
                          const ringColor = DEPTH_RINGS[node.depth] || DEPTH_RINGS[0];
                          const parentEdge = result.graph.edges.find((e) => e.target === node.id);

                          return (
                            <div
                              key={node.id}
                              className="flex items-start gap-3"
                              style={{ paddingLeft: `${node.depth * 40}px` }}
                            >
                              {node.depth > 0 && (
                                <div className="flex items-center gap-1 text-zinc-700 shrink-0 mt-3">
                                  <div className="w-6 border-t border-zinc-800" />
                                  <ChevronRight className="w-3 h-3" />
                                </div>
                              )}
                              <div className={`flex-1 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 ring-1 ${ringColor} hover:bg-zinc-900 transition-all`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-zinc-800/80 ${color}`}>
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className={`font-mono font-bold ${color}`}>{node.label}</p>
                                      <p className="text-xs text-zinc-600 font-mono">
                                        {node.type} · depth {node.depth}
                                        {parentEdge && ` · via ${parentEdge.label}`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-900/40 text-emerald-400 font-mono">
                                      {node.findings_count} findings
                                    </span>
                                    {node.status === "complete" ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    ) : node.status === "error" ? (
                                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    ) : (
                                      <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                                    )}
                                  </div>
                                </div>
                                {parentEdge && (
                                  <p className="mt-2 text-xs text-zinc-600 italic">
                                    {parentEdge.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* ── AI Briefing ── */}
              {activeTab === "briefing" && (
                <div className="p-6">
                  <h3 className="text-lg font-bold text-emerald-300 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Intelligence Briefing
                  </h3>
                  {result?.briefing ? (
                    <div className="prose prose-invert prose-emerald max-w-none font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
                      {result.briefing}
                    </div>
                  ) : searchState === "running" ? (
                    <div className="flex items-center gap-3 text-zinc-500 py-12 justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating briefing...
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-center py-12">
                      No briefing available. Start a deep search to generate one.
                    </p>
                  )}
                </div>
              )}

              {/* ── Entity Explorer ── */}
              {activeTab === "entities" && result && (
                <div className="p-6">
                  <h3 className="text-lg font-bold text-emerald-300 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Discovered Entities ({Object.keys(result.entities).length})
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(result.entities).map(([key, entity]) => {
                      const Icon = ENTITY_ICONS[entity.entity_type] || Globe;
                      const color = ENTITY_COLORS[entity.entity_type] || "text-zinc-400";

                      return (
                        <details key={key} className="group rounded-xl bg-zinc-900/40 border border-zinc-800 overflow-hidden">
                          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-900/60 transition-all">
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg bg-zinc-800/80 ${color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <span className={`font-mono font-bold ${color}`}>{entity.entity}</span>
                                <span className="text-xs text-zinc-600 ml-2">
                                  {entity.entity_type} · depth {entity.depth} · {entity.duration_s.toFixed(1)}s
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-400 font-mono">
                                {entity.findings_count} findings
                              </span>
                              {entity.pivots_found.length > 0 && (
                                <span className="text-xs px-2 py-1 rounded-full bg-cyan-900/30 text-cyan-400 font-mono">
                                  {entity.pivots_found.length} pivots
                                </span>
                              )}
                            </div>
                          </summary>
                          <div className="px-4 pb-4 border-t border-zinc-800/50 pt-3">
                            {entity.findings.length > 0 ? (
                              <pre className="text-xs text-zinc-500 font-mono overflow-x-auto max-h-60">
                                {JSON.stringify(entity.findings, null, 2)}
                              </pre>
                            ) : (
                              <p className="text-xs text-zinc-600 italic">No findings for this entity.</p>
                            )}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Idle State — Hero */}
        {searchState === "idle" && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-emerald-500/10 rounded-full" />
              <div className="relative p-6 bg-emerald-900/20 rounded-full shadow-[0_0_60px_rgba(16,185,129,0.15)]">
                <Radar className="w-16 h-16 text-emerald-400 animate-scan" />
              </div>
            </div>
            <div className="space-y-3 max-w-lg">
              <h2 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-emerald-500">
                The Abyss Awaits
              </h2>
              <p className="text-zinc-500 leading-relaxed">
                Deep Search performs autonomous, recursive OSINT reconnaissance. It
                starts with your target, discovers related entities, and follows each
                lead — building a complete intelligence picture across multiple layers.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full">
              {[
                { title: "Recursive Pivoting", desc: "Follows leads across domains, emails, usernames, and IPs automatically" },
                { title: "AI-Driven Analysis", desc: "Uses LLM reasoning to decide which discoveries are worth investigating" },
                { title: "Discovery Graph", desc: "Visualizes how entities connect — showing the full digital footprint" },
              ].map((f) => (
                <div key={f.title} className="glass rounded-xl p-4 text-left">
                  <h3 className="text-sm font-bold text-emerald-400 mb-1">{f.title}</h3>
                  <p className="text-xs text-zinc-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
