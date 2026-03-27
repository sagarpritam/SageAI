"use client";

import { useState } from "react";
import { FileCheck, Download, Loader2, Shield } from "lucide-react";
import axios from "axios";

const frameworks = [
  { id: "soc2", label: "SOC 2 Type II", desc: "Trust services criteria audit", icon: "🔒" },
  { id: "pci-dss", label: "PCI DSS", desc: "Payment card industry standard", icon: "💳" },
  { id: "hipaa", label: "HIPAA", desc: "Health data privacy compliance", icon: "🏥" },
  { id: "iso27001", label: "ISO 27001", desc: "Information security management", icon: "🌐" },
  { id: "gdpr", label: "GDPR", desc: "EU data protection regulation", icon: "🇪🇺" },
  { id: "nist", label: "NIST CSF", desc: "Cybersecurity framework", icon: "🏛️" },
];

interface ComplianceReport {
  framework: string;
  score: number;
  status: string;
  controls_passed: number;
  controls_total: number;
  gaps: string[];
}

export function ComplianceCenter() {
  const [selected, setSelected] = useState<string | null>(null);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async (frameworkId: string) => {
    setSelected(frameworkId);
    setLoading(true);
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
      setLoading(false);
    }
  };

  const scoreColor = (score: number) =>
    score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";

  const scoreBarColor = (score: number) =>
    score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <FileCheck className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold text-white">Compliance Report Generator</h3>
      </div>

      {/* Framework Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {frameworks.map((fw) => (
          <button
            key={fw.id}
            onClick={() => generateReport(fw.id)}
            className={`text-left p-4 rounded-xl border transition-all ${
              selected === fw.id
                ? "bg-emerald-900/30 border-emerald-500/50"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <span className="text-2xl mb-2 block">{fw.icon}</span>
            <p className="text-sm font-bold text-white">{fw.label}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{fw.desc}</p>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
      )}

      {/* Report Result */}
      {report && !loading && (
        <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              {frameworks.find((f) => f.id === report.framework)?.label} Assessment
            </h4>
            <span className={`text-3xl font-black ${scoreColor(report.score)}`}>
              {report.score}<span className="text-lg text-zinc-500">%</span>
            </span>
          </div>

          {/* Score Bar */}
          <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 score-bar-fill ${scoreBarColor(report.score)}`}
              style={{ '--score-width': `${report.score}%` } as React.CSSProperties}
            />
          </div>

          {/* Controls */}
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

          {/* Gaps */}
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

          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors text-sm">
            <Download className="w-4 h-4" /> Export Compliance Report
          </button>
        </div>
      )}
    </div>
  );
}
