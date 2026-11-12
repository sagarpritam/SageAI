"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  FileCheck,
  Wrench,
  Download,
  ChevronRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Code,
  ExternalLink,
  Globe,
  Copy,
  Check,
  FileText,
} from "lucide-react";
import axios from "axios";

/* ──────────────────────────────────────── Types ──── */

interface PostureScore {
  posture_score: number;
  grade: string;
  grade_color: string;
  categories: Record<string, { score: number; label: string; findings: number }>;
  severity_distribution: Record<string, number>;
  delta: { delta: number; direction: string; label: string };
  scan_id?: string;
  target?: string;
  scanned_at?: string;
  total_findings?: number;
}

interface TrendPoint {
  date: string;
  posture_score: number;
  grade: string;
  total_findings: number;
}

interface ComplianceFramework {
  framework: string;
  framework_label: string;
  score: number;
  status: string;
  controls_passed: number;
  controls_total: number;
  gaps: string[];
}

interface ComplianceData {
  overall_score: number;
  overall_status: string;
  frameworks: Record<string, ComplianceFramework>;
}

interface DebriefData {
  status: string;
  language: { code: string; name: string };
  metadata: {
    title: string;
    target: string;
    generated_at: string;
    org_id: string;
  };
  posture: {
    risk_score: number;
    risk_level: string;
    section_label: string;
    metrics_label: string;
    breakdown: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      total: number;
    };
  };
  executive_summary: {
    section_label: string;
    content: string;
    autonomous_defense_notice: string;
  };
  strategic_recommendations: {
    section_label: string;
    items: string[];
  };
  compliance_assurance: {
    section_label: string;
    tamper_proof_statement: string;
    merkle_verification: {
      is_valid: boolean;
      total_blocks: number;
      tampered_indices: number[];
    };
    block_index: number;
    block_hash: string;
  };
}

const DEBRIEF_LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "ja", label: "JA", name: "日本語" },
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "es", label: "ES", name: "Español" },
  { code: "zh", label: "ZH", name: "简体中文" },
  { code: "ar", label: "AR", name: "العربية" },
];

interface RemediationItem {
  rank: number;
  finding_type: string;
  severity: string;
  title: string;
  effort_label: string;
  effort_minutes: number;
  impact: string;
  auto_fixable: boolean;
  steps: string[];
  code_snippets: Record<string, string>;
  references: string[];
  priority_score: number;
}

/* ──────────────────────────────────────── Helpers ──── */

const sevColor = (sev: string) => {
  switch (sev.toLowerCase()) {
    case "critical": return "text-red-400";
    case "high": return "text-orange-400";
    case "medium": return "text-amber-400";
    case "low": return "text-emerald-400";
    default: return "text-zinc-400";
  }
};

const sevBg = (sev: string) => {
  switch (sev.toLowerCase()) {
    case "critical": return "bg-red-900/30 border-red-800/40";
    case "high": return "bg-orange-900/30 border-orange-800/40";
    case "medium": return "bg-amber-900/30 border-amber-800/40";
    case "low": return "bg-emerald-900/30 border-emerald-800/40";
    default: return "bg-zinc-900/30 border-zinc-800/40";
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case "compliant": return "text-emerald-400";
    case "partial": return "text-amber-400";
    default: return "text-red-400";
  }
};

/* ──────────────────────────────────────── Gauge ──── */

function PostureGauge({ score, grade, color }: { score: number; grade: string; color: string }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      <svg width="200" height="200" className="-rotate-90">
        {/* Background arc */}
        <circle
          cx="100" cy="100" r={radius}
          fill="none" stroke="#27272a" strokeWidth="12"
        />
        {/* Progress arc */}
        <circle
          cx="100" cy="100" r={radius}
          fill="none" stroke={color} strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white">{grade}</span>
        <span className="text-sm font-mono text-zinc-400">{score}/100</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────── Sparkline ──── */

function TrendSparkline({ data }: { data: TrendPoint[] }) {
  if (data.length < 2) {
    return <p className="text-xs text-zinc-500 font-mono">Need 2+ scans for trends</p>;
  }

  const max = Math.max(...data.map((d) => d.posture_score));
  const min = Math.min(...data.map((d) => d.posture_score));
  const range = max - min || 1;
  const w = 280;
  const h = 60;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d.posture_score - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const trending = latest.posture_score >= prev.posture_score;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        {trending ? (
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-400" />
        )}
        <span className={`font-bold ${trending ? "text-emerald-400" : "text-red-400"}`}>
          {trending ? "Improving" : "Declining"}
        </span>
        <span className="text-zinc-500 text-xs font-mono">
          ({data.length} scans, last {data.length > 1 ? `${data.length} days` : "scan"})
        </span>
      </div>
      <svg width={w} height={h + 10} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={trending ? "#22C55E" : "#EF4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = h - ((d.posture_score - min) / range) * h;
          return (
            <circle
              key={i}
              cx={x} cy={y} r="3"
              fill={trending ? "#22C55E" : "#EF4444"}
              className="opacity-60"
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ──────────────────────────────────────── Code Block ──── */

function CodeSnippet({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const copy = async () => {
    setCopyError(false);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setCopyError(true);
      }
    } catch {
      setCopyError(true);
    }
  };

  return (
    <div className="mt-2 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between bg-zinc-900 px-3 py-1.5 border-b border-zinc-800">
        <span className="text-xs text-zinc-500 font-mono uppercase">{language}</span>
        <button type="button" onClick={copy} aria-live="polite" className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors">
          {copied ? "✓ Copied" : copyError ? "Copy unavailable" : "Copy"}
        </button>
      </div>
      <pre className="p-3 bg-zinc-950 text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre leading-relaxed max-h-48 overflow-y-auto">
        {code}
      </pre>
    </div>
  );
}

/* ──────────────────────────────────────── Main Component ──── */

export function SecurityPosture() {
  const [posture, setPosture] = useState<PostureScore | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [compliance, setCompliance] = useState<ComplianceData | null>(null);
  const [remediations, setRemediations] = useState<RemediationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "compliance" | "remediation" | "debrief">("overview");
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [debrief, setDebrief] = useState<DebriefData | null>(null);
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [copiedDebrief, setCopiedDebrief] = useState(false);
  const [expandedRem, setExpandedRem] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [postureRes, trendsRes, complianceRes] = await Promise.allSettled([
          axios.get("/api/posture/score"),
          axios.get("/api/posture/trends"),
          axios.get("/api/posture/compliance"),
        ]);

        if (postureRes.status === "fulfilled") {
          setPosture(postureRes.value.data);

          // Load remediations if we have a scan
          if (postureRes.value.data.scan_id) {
            try {
              const remRes = await axios.get(
                `/api/posture/remediation/${postureRes.value.data.scan_id}`
              );
              setRemediations(remRes.data.remediations || []);
            } catch {
              setErrorMsg("Unable to load automated remediation playbooks for this scan.");
            }
          }
        } else {
          setErrorMsg("Unable to load security posture score.");
        }

        if (trendsRes.status === "fulfilled") setTrends(trendsRes.value.data.trends || []);
        if (complianceRes.status === "fulfilled") setCompliance(complianceRes.value.data);
      } catch {
        setErrorMsg("Unable to load security posture metrics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (activeTab !== "debrief") return;
    const fetchDebrief = async () => {
      setDebriefLoading(true);
      setErrorMsg(null);
      try {
        if (posture?.scan_id) {
          const res = await axios.get(`/api/reports/${posture.scan_id}/debrief?lang=${selectedLang}`);
          setDebrief(res.data);
        } else {
          const res = await axios.post("/api/reports/debrief", {
            target: posture?.target || "Enterprise Global Asset",
            risk_score: 100 - (posture?.posture_score || 85),
            findings: [],
            lang: selectedLang,
          });
          setDebrief(res.data);
        }
      } catch (err) {
        console.error("Failed to load debrief:", err);
        setErrorMsg("Unable to synthesize localized CISO debrief.");
      } finally {
        setDebriefLoading(false);
      }
    };
    fetchDebrief();
  }, [activeTab, selectedLang, posture?.scan_id, posture?.target, posture?.posture_score]);

  const copyDebriefText = async () => {
    if (!debrief) return;
    const text = `${debrief.metadata.title}\nTarget: ${debrief.metadata.target}\nRisk Score: ${debrief.posture.risk_score}/100 (${debrief.posture.risk_level})\n\n${debrief.executive_summary.section_label}:\n${debrief.executive_summary.content}\n\n${debrief.strategic_recommendations.section_label}:\n` +
      debrief.strategic_recommendations.items.map((it, idx) => `${idx + 1}. ${it}`).join("\n") +
      `\n\n${debrief.compliance_assurance.section_label}:\n${debrief.compliance_assurance.tamper_proof_statement} (Block #${debrief.compliance_assurance.block_index}, Hash: ${debrief.compliance_assurance.block_hash})`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedDebrief(true);
        setTimeout(() => setCopiedDebrief(false), 2000);
      } else {
        setErrorMsg("Clipboard access is unavailable in this browser context.");
      }
    } catch {
      setErrorMsg("Failed to copy executive debrief to clipboard.");
    }
  };

  const downloadSarif = async () => {
    if (!posture?.scan_id) return;
    setErrorMsg(null);
    try {
      const res = await axios.get(`/api/reports/${posture.scan_id}/sarif`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `SageAI_sarif_${posture.scan_id.slice(0, 8)}.sarif.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch {
      setErrorMsg("Failed to export SARIF compliance report.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="ml-3 text-zinc-400 font-mono">Loading security posture...</span>
      </div>
    );
  }

  if (!posture) {
    return (
      <div className="text-center py-16 space-y-3">
        <Shield className="w-12 h-12 text-zinc-600 mx-auto" />
        <p className="text-zinc-400 font-mono">No scan data available.</p>
        <p className="text-zinc-500 text-sm">Run your first security scan to see your posture.</p>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Shield },
    { id: "compliance" as const, label: "Compliance", icon: FileCheck },
    { id: "remediation" as const, label: "Remediation", icon: Wrench },
    { id: "debrief" as const, label: "CISO Debrief (i18n)", icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Security Posture</h2>
          {posture.target && (
            <span className="text-xs text-zinc-500 font-mono bg-zinc-900 px-2 py-1 rounded">
              {posture.target}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={downloadSarif}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg transition-colors border border-zinc-700"
        >
          <Download className="w-3.5 h-3.5" />
          SARIF Export
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-xs font-mono text-red-300"
        >
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300/80 hover:text-red-200 font-semibold shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id
                ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800/50"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ──── Overview Tab ──── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top row: Gauge + Delta + Severity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gauge */}
            <div className="bg-zinc-900/60 border border-emerald-900/20 rounded-2xl p-6 flex flex-col items-center">
              <PostureGauge
                score={posture.posture_score}
                grade={posture.grade}
                color={posture.grade_color}
              />
              <div className="mt-3 flex items-center gap-2 text-sm">
                {posture.delta.direction === "improving" ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : posture.delta.direction === "degrading" ? (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                ) : (
                  <Minus className="w-4 h-4 text-zinc-400" />
                )}
                <span className={`font-mono text-xs ${
                  posture.delta.direction === "improving" ? "text-emerald-400"
                    : posture.delta.direction === "degrading" ? "text-red-400"
                    : "text-zinc-400"
                }`}>
                  {posture.delta.label}
                </span>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Category Scores
              </h3>
              {Object.entries(posture.categories).map(([key, cat]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-mono">{cat.label}</span>
                    <span className={`font-bold ${
                      cat.score >= 80 ? "text-emerald-400"
                        : cat.score >= 50 ? "text-amber-400"
                        : "text-red-400"
                    }`}>
                      {cat.score}%
                      {cat.findings > 0 && (
                        <span className="text-zinc-600 font-normal ml-1">
                          ({cat.findings} findings)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        cat.score >= 80 ? "bg-emerald-500"
                          : cat.score >= 50 ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Severity Distribution */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Severity Breakdown
              </h3>
              {Object.entries(posture.severity_distribution || {}).map(([sev, count]) => (
                <div key={sev} className="flex items-center justify-between">
                  <span className={`text-xs font-bold capitalize ${sevColor(sev)}`}>{sev}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sev === "critical" ? "bg-red-500"
                            : sev === "high" ? "bg-orange-500"
                            : sev === "medium" ? "bg-amber-500"
                            : sev === "low" ? "bg-emerald-500"
                            : "bg-zinc-600"
                        }`}
                        style={{
                          width: `${Math.min(100, (count / Math.max(posture.total_findings || 0, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 font-mono w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Total findings</span>
                  <span className="text-white font-bold">{posture.total_findings}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trend Sparkline */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Posture Trend (30 days)
            </h3>
            <TrendSparkline data={trends} />
          </div>
        </div>
      )}

      {/* ──── Compliance Tab ──── */}
      {activeTab === "compliance" && compliance && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-zinc-900/60 border border-emerald-900/20 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-mono uppercase">Overall Compliance</p>
              <p className={`text-3xl font-black ${statusColor(compliance.overall_status)}`}>
                {compliance.overall_score}%
              </p>
              <p className={`text-sm font-bold capitalize ${statusColor(compliance.overall_status)}`}>
                {compliance.overall_status}
              </p>
            </div>
            <FileCheck className="w-12 h-12 text-emerald-400/30" />
          </div>

          {/* Framework Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(compliance.frameworks).map((fw) => (
              <div
                key={fw.framework}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{fw.framework_label}</h4>
                  <span className={`text-xl font-black ${statusColor(fw.status)}`}>
                    {fw.score}%
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      fw.score >= 90 ? "bg-emerald-500"
                        : fw.score >= 70 ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${fw.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-500 font-mono">
                  <span>
                    <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-400" />
                    {fw.controls_passed}/{fw.controls_total} controls
                  </span>
                  <span className={`capitalize font-bold ${statusColor(fw.status)}`}>
                    {fw.status}
                  </span>
                </div>
                {fw.gaps.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800 space-y-1">
                    {fw.gaps.slice(0, 2).map((gap, i) => (
                      <p key={i} className="text-xs text-amber-300/70 truncate" title={gap}>
                        • {gap}
                      </p>
                    ))}
                    {fw.gaps.length > 2 && (
                      <p className="text-xs text-zinc-600">+{fw.gaps.length - 2} more gaps</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──── Remediation Tab ──── */}
      {activeTab === "remediation" && (
        <div className="space-y-4">
          {remediations.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-zinc-400 font-mono">No remediations needed!</p>
              <p className="text-zinc-500 text-sm">Your security posture is clean.</p>
            </div>
          ) : (
            remediations.map((rem) => (
              <div
                key={rem.rank}
                className={`border rounded-xl transition-all ${sevBg(rem.severity)}`}
              >
                {/* Header */}
                <button
                  type="button"
                  onClick={() => setExpandedRem(expandedRem === rem.rank ? null : rem.rank)}
                  className="w-full text-left p-4 flex items-center gap-3"
                >
                  <span className="text-xs text-zinc-500 font-mono w-6">#{rem.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{rem.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{rem.finding_type}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${sevColor(rem.severity)}`}>
                      {rem.severity}
                    </span>
                    {rem.auto_fixable && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-800/50">
                        Auto-fix
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {rem.effort_label}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-zinc-500 transition-transform ${
                        expandedRem === rem.rank ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedRem === rem.rank && (
                  <div className="px-4 pb-4 space-y-4 border-t border-zinc-800/50 pt-4">
                    {/* Impact */}
                    <p className="text-xs text-zinc-300">{rem.impact}</p>

                    {/* Steps */}
                    <div>
                      <h5 className="text-xs font-bold text-zinc-400 mb-2 flex items-center gap-1">
                        <Wrench className="w-3 h-3" /> Remediation Steps
                      </h5>
                      <ol className="space-y-1.5">
                        {rem.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                            <span className="text-emerald-500 font-bold shrink-0">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Code Snippets */}
                    {Object.keys(rem.code_snippets).length > 0 && (
                      <div>
                        <h5 className="text-xs font-bold text-zinc-400 mb-2 flex items-center gap-1">
                          <Code className="w-3 h-3" /> Code Examples
                        </h5>
                        {Object.entries(rem.code_snippets).map(([lang, code]) => (
                          <CodeSnippet key={lang} language={lang} code={code} />
                        ))}
                      </div>
                    )}

                    {/* References */}
                    {rem.references.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {rem.references.map((ref, i) => (
                          <a
                            key={i}
                            href={ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-emerald-500/70 hover:text-emerald-400 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {new URL(ref).hostname}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
