"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Download,
  FileText,
  Bug,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import axios from "axios";

interface Finding {
  title: string;
  severity: string;
  description: string;
  recommendation?: string;
  evidence?: string;
}

interface ReportData {
  id: string;
  target: string;
  risk_score: number;
  risk_level: string;
  findings: Finding[];
  executive_summary?: string;
}

const severityColor: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-emerald-600 text-white",
  info: "bg-blue-600 text-white",
};

const severityIcon: Record<string, typeof Bug> = {
  critical: AlertTriangle,
  high: AlertTriangle,
  medium: Info,
  low: Info,
  info: Info,
};

export default function ScanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const { data } = await axios.get(`/api/reports/${id}`);
        setReport(data);
      } catch {
        setError("Failed to load scan report. The scan may still be running.");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadReport();
  }, [id]);

  const downloadPdf = async () => {
    setDownloading("pdf");
    try {
      const res = await fetch(`/api/scan/${id}/pdf`);
      if (res.status === 402) {
        alert("🔒 PDF Export requires a Pro or Enterprise plan. Please manage your billing in Settings to upgrade.");
        return;
      }
      if (!res.ok) throw new Error("Download failed");
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sageai-report-${id?.toString().slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF download failed.");
    } finally {
      setDownloading(null);
    }
  };

  const downloadHackerOne = async () => {
    setDownloading("h1");
    try {
      const res = await fetch(`/api/reports/${id}/hackerone`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hackerone-${id?.toString().slice(0, 8)}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("HackerOne download failed.");
    } finally {
      setDownloading(null);
    }
  };

  const riskGradient =
    report?.risk_level === "Critical"
      ? "from-red-600 to-red-900"
      : report?.risk_level === "High"
        ? "from-orange-500 to-orange-800"
        : report?.risk_level === "Medium"
          ? "from-yellow-500 to-yellow-800"
          : "from-emerald-500 to-emerald-800";

  return (
    <main className="min-h-screen bg-black text-emerald-50 font-sans selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black z-0 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-emerald-500/70 hover:text-emerald-400 transition-colors text-sm font-mono mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>

        {loading && (
          <div className="flex justify-center py-32">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-mono">{error}</p>
          </div>
        )}

        {report && (
          <>
            {/* Hero Card */}
            <div className={`bg-gradient-to-br ${riskGradient} rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-white/80" />
                  <h1 className="text-3xl font-black tracking-tight text-white">
                    {report.target}
                  </h1>
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <div>
                    <p className="text-white/60 text-xs font-mono uppercase tracking-wider">Risk Score</p>
                    <p className="text-5xl font-black text-white">{report.risk_score}<span className="text-2xl text-white/60">/100</span></p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-mono uppercase tracking-wider">Level</p>
                    <p className="text-2xl font-black text-white">{report.risk_level}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-mono uppercase tracking-wider">Findings</p>
                    <p className="text-2xl font-black text-white">{report.findings?.length ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={downloadPdf}
                disabled={downloading === "pdf"}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold rounded-lg transition-colors text-sm"
              >
                {downloading === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download PDF Report
              </button>
              <button
                onClick={downloadHackerOne}
                disabled={downloading === "h1"}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 text-white font-bold rounded-lg transition-colors text-sm border border-zinc-700"
              >
                {downloading === "h1" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                HackerOne Report
              </button>
            </div>

            {/* Findings */}
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Bug className="w-5 h-5 text-emerald-400" /> Vulnerability Findings
            </h2>

            {(!report.findings || report.findings.length === 0) ? (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-8 text-center">
                <Shield className="w-10 h-10 text-emerald-400/40 mx-auto mb-3" />
                <p className="text-zinc-500 font-mono">No vulnerabilities found. Target appears secure.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {report.findings.map((f, i) => {
                  const sev = f.severity?.toLowerCase() || "info";
                  const Icon = severityIcon[sev] || Info;
                  return (
                    <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-emerald-900/40 transition-colors">
                      <div className="flex items-start gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase ${severityColor[sev] || "bg-zinc-700 text-white"}`}>
                          <Icon className="w-3 h-3" /> {f.severity}
                        </span>
                        <h3 className="font-bold text-white text-sm flex-1">{f.title}</h3>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed mb-3">{f.description}</p>
                      {f.evidence && (
                        <div className="bg-black/50 border border-zinc-800 rounded-lg p-3 mb-3">
                          <p className="text-xs text-zinc-500 font-mono uppercase mb-1">Evidence</p>
                          <code className="text-xs text-amber-400 font-mono whitespace-pre-wrap break-all">{f.evidence}</code>
                        </div>
                      )}
                      {f.recommendation && (
                        <div className="bg-emerald-950/30 border border-emerald-900/30 rounded-lg p-3">
                          <p className="text-xs text-emerald-500 font-mono uppercase mb-1">Recommendation</p>
                          <p className="text-sm text-emerald-300/80">{f.recommendation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
