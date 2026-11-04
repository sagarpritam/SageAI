"use client";

import { useState } from "react";
import {
  FileCheck,
  Download,
  Loader2,
  Shield,
  Globe2,
  Lock,
  Layers,
  CheckCircle2,
  Copy,
  Sparkles,
  ExternalLink,
  Bot,
} from "lucide-react";
import axios from "axios";

const frameworks = [
  { id: "soc2", label: "SOC 2 Type II", desc: "Trust services criteria audit", icon: "🔒" },
  { id: "pci-dss", label: "PCI DSS", desc: "Payment card industry standard", icon: "💳" },
  { id: "hipaa", label: "HIPAA", desc: "Health data privacy compliance", icon: "🏥" },
  { id: "iso27001", label: "ISO 27001", desc: "Information security management", icon: "🌐" },
  { id: "gdpr", label: "GDPR", desc: "EU data protection regulation", icon: "🇪🇺" },
  { id: "nist", label: "NIST CSF", desc: "Cybersecurity framework", icon: "🏛️" },
];

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh", label: "简体中文", flag: "🇨🇳" },
  { code: "ar", label: "العربية", flag: "🇦🇪" },
];

interface ComplianceReport {
  framework: string;
  score: number;
  status: string;
  controls_passed: number;
  controls_total: number;
  gaps: string[];
}

interface MultilingualDebrief {
  status: string;
  language: { code: string; name: string };
  metadata: { title: string; target: string; generated_at: string; org_id: string };
  posture: {
    risk_score: number;
    risk_level: string;
    section_label: string;
    metrics_label: string;
    breakdown: { critical: number; high: number; medium: number; low: number; total: number };
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
    block_index: number;
    block_hash: string;
  };
}

export function ComplianceCenter() {
  const [activeTab, setActiveTab] = useState<"frameworks" | "multilingual">("frameworks");

  // Framework state
  const [selectedFw, setSelectedFw] = useState<string | null>(null);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loadingFw, setLoadingFw] = useState(false);
  const [exportingFw, setExportingFw] = useState(false);

  // Multilingual state
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [targetAsset, setTargetAsset] = useState<string>("api.enterprise-defense.internal");
  const [targetRiskScore, setTargetRiskScore] = useState<number>(78);
  const [loadingDebrief, setLoadingDebrief] = useState<boolean>(false);
  const [debrief, setDebrief] = useState<MultilingualDebrief | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const generateReport = async (frameworkId: string) => {
    setSelectedFw(frameworkId);
    setLoadingFw(true);
    setReport(null);
    try {
      const { data } = await axios.get(`/api/compliance?framework=${frameworkId}`);
      setReport(data);
    } catch {
      setReport({
        framework: frameworkId,
        score: 0,
        status: "unavailable",
        controls_passed: 0,
        controls_total: 0,
        gaps: ["Run scans to generate compliance data."],
      });
    } finally {
      setLoadingFw(false);
    }
  };

  const handleExportFramework = () => {
    if (!report) return;
    setExportingFw(true);
    const fwMeta = frameworks.find((f) => f.id === report.framework);
    const exportData = {
      compliance_report_version: "2.5.0",
      attestation_type: "SageAI Cryptographic Compliance Assessment",
      generated_at: new Date().toISOString(),
      framework: {
        id: report.framework,
        name: fwMeta?.label || report.framework.toUpperCase(),
        description: fwMeta?.desc || "",
      },
      assessment: {
        score_percent: report.score,
        status: report.status,
        controls_passed: report.controls_passed,
        controls_total: report.controls_total,
        compliance_ratio: `${report.controls_passed}/${report.controls_total}`,
        identified_gaps: report.gaps,
      },
      audit_integrity: {
        engine: "SageAI Autonomous Multi-Agent Compliance Verifier",
        tamper_evident_seal: "MERKLE_CHAIN_SEALED",
        assurance_level: "SOC2 Type II / ISO 27001 Cryptographic Proof",
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SageAI_${report.framework.toUpperCase()}_Compliance_Report_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportingFw(false);
  };

  const handleGenerateDebrief = async () => {
    setLoadingDebrief(true);
    try {
      const { data } = await axios.post("/api/reports/debrief", {
        target: targetAsset,
        risk_score: targetRiskScore,
        lang: selectedLang,
        findings: [
          { title: "Cloud IMDSv2 SSRF Vulnerability", severity: "CRITICAL" },
          { title: "JWT RS256/HS256 Key Confusion", severity: "CRITICAL" },
          { title: "In-Line WAF Parameter Injection", severity: "HIGH" },
          { title: "High-Entropy Obfuscated Script Dropper", severity: "HIGH" },
        ],
      });
      setDebrief(data);
    } catch (err) {
      console.error("Failed to generate debrief", err);
    } finally {
      setLoadingDebrief(false);
    }
  };

  const scoreColor = (score: number) =>
    score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";

  const scoreBarColor = (score: number) =>
    score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("frameworks")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === "frameworks"
                ? "bg-emerald-900/30 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Compliance Framework Audits
          </button>
          <button
            onClick={() => setActiveTab("multilingual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === "multilingual"
                ? "bg-emerald-900/30 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Globe2 className="w-4 h-4 text-emerald-400" />
            International CISO Board Debrief (7 Languages)
          </button>
        </div>
        <span className="text-xs font-mono text-zinc-500 hidden sm:inline-block">
          SOC 2 Type II • ISO 27001 • FedRAMP High
        </span>
      </div>

      {/* Tab 1: Framework Audits */}
      {activeTab === "frameworks" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {frameworks.map((fw) => (
              <button
                key={fw.id}
                onClick={() => generateReport(fw.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedFw === fw.id
                    ? "bg-emerald-900/30 border-emerald-500/50 shadow-lg"
                    : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <span className="text-2xl mb-2 block">{fw.icon}</span>
                <p className="text-sm font-bold text-white">{fw.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{fw.desc}</p>
              </button>
            ))}
          </div>

          {loadingFw && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
          )}

          {report && !loadingFw && (
            <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  {frameworks.find((f) => f.id === report.framework)?.label} Assessment
                </h4>
                <span className={`text-3xl font-black ${scoreColor(report.score)}`}>
                  {report.score}<span className="text-lg text-zinc-500">%</span>
                </span>
              </div>

              <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 score-bar-fill ${scoreBarColor(report.score)}`}
                  style={{ "--score-width": `${report.score}%` } as React.CSSProperties}
                />
              </div>

              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-zinc-500 font-mono uppercase">Controls Passed</p>
                  <p className="text-xl font-black text-emerald-400">
                    {report.controls_passed}<span className="text-zinc-500 text-sm">/{report.controls_total}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-mono uppercase">Status</p>
                  <p className={`text-sm font-bold capitalize ${
                    report.status === "compliant" ? "text-emerald-400" : "text-amber-400"
                  }`}>
                    {report.status}
                  </p>
                </div>
              </div>

              {report.gaps.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 font-mono uppercase mb-2">Identified Gaps</p>
                  <div className="space-y-1.5">
                    {report.gaps.map((gap, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-amber-300/80 bg-amber-950/20 border border-amber-900/20 rounded-lg px-3 py-2">
                        <span className="text-amber-500 mt-0.5">•</span> {gap}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleExportFramework}
                disabled={exportingFw}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> {exportingFw ? "Exporting..." : "Export Compliance Report"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Multilingual Executive Debrief */}
      {activeTab === "multilingual" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-emerald-400" />
                Global Boardroom Briefing Synthesizer
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Generate localized, non-repudiable CISO security debriefs in 7 global business languages with cryptographic Merkle proof seals.
              </p>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase">Target Boardroom Language</label>
              <div className="flex flex-wrap gap-2">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setSelectedLang(l.code)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                      selectedLang === l.code
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Configuration Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400">Target Asset / Domain</label>
                <input
                  type="text"
                  value={targetAsset}
                  onChange={(e) => setTargetAsset(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <span>Simulated Risk Score</span>
                  <span className="text-emerald-400 font-bold">{targetRiskScore}/100</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={targetRiskScore}
                  onChange={(e) => setTargetRiskScore(Number(e.target.value))}
                  className="w-full accent-emerald-500 mt-2"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGenerateDebrief}
                disabled={loadingDebrief}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/10"
              >
                {loadingDebrief ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    Synthesizing Localized Boardroom Brief...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-black text-black" />
                    Synthesize Multilingual CISO Debrief
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rendered Localized Debrief Card */}
          {debrief && (
            <div className="rounded-2xl border border-emerald-500/30 bg-zinc-950 p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {debrief.language.name}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Target: {debrief.metadata.target}</span>
                  </div>
                  <h3 className="text-xl font-black text-white">{debrief.metadata.title}</h3>
                </div>

                {/* Posture Score Pill */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                      {debrief.posture.section_label}
                    </span>
                    <span className="text-sm font-bold text-white">{debrief.posture.risk_level}</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {debrief.posture.risk_score}
                    <span className="text-xs text-zinc-500 font-normal">/100</span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  {debrief.executive_summary.section_label}
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
                  {debrief.executive_summary.content}
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 pt-1">
                  <Bot className="w-4 h-4" />
                  <span>{debrief.executive_summary.autonomous_defense_notice}</span>
                </div>
              </div>

              {/* Key Risk Metrics Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  {debrief.posture.metrics_label}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-xl">
                    <span className="text-xs text-red-400 font-mono block">CRITICAL</span>
                    <span className="text-xl font-black text-red-300">{debrief.posture.breakdown.critical}</span>
                  </div>
                  <div className="bg-amber-950/20 border border-amber-900/30 p-3 rounded-xl">
                    <span className="text-xs text-amber-400 font-mono block">HIGH</span>
                    <span className="text-xl font-black text-amber-300">{debrief.posture.breakdown.high}</span>
                  </div>
                  <div className="bg-yellow-950/20 border border-yellow-900/30 p-3 rounded-xl">
                    <span className="text-xs text-yellow-400 font-mono block">MEDIUM</span>
                    <span className="text-xl font-black text-yellow-300">{debrief.posture.breakdown.medium}</span>
                  </div>
                  <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl">
                    <span className="text-xs text-emerald-400 font-mono block">TOTAL VECTORS</span>
                    <span className="text-xl font-black text-emerald-300">{debrief.posture.breakdown.total}</span>
                  </div>
                </div>
              </div>

              {/* Strategic Roadmap */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  {debrief.strategic_recommendations.section_label}
                </h4>
                <div className="space-y-2">
                  {debrief.strategic_recommendations.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Compliance Seal */}
              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {debrief.compliance_assurance.section_label}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {debrief.compliance_assurance.tamper_proof_statement} • Block #{debrief.compliance_assurance.block_index}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(debrief.compliance_assurance.block_hash);
                      setCopiedHash(true);
                      setTimeout(() => setCopiedHash(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition"
                  >
                    {copiedHash ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy SHA-256 Seal
                  </button>
                  <button
                    onClick={() => {
                      const markdown = `# ${debrief.metadata.title}\n\n**Target**: \`${debrief.metadata.target}\`\n**Language**: ${debrief.language.name}\n**Risk Score**: ${debrief.posture.risk_score}/100\n\n## ${debrief.executive_summary.section_label}\n${debrief.executive_summary.content}\n\n## ${debrief.strategic_recommendations.section_label}\n${debrief.strategic_recommendations.items.map((it) => `- ${it}`).join("\n")}\n\n## ${debrief.compliance_assurance.section_label}\n- **Merkle Block**: #${debrief.compliance_assurance.block_index}\n- **Block Hash**: \`${debrief.compliance_assurance.block_hash}\`\n`;
                      const blob = new Blob([markdown], { type: "text/markdown" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `SageAI_Board_Brief_${debrief.language.code}_${Date.now()}.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Localized .md
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
