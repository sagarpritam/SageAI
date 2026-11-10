"use client";

import { useEffect, useState } from "react";
import { Shield, ArrowLeft, ExternalLink, Download, AlertTriangle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";

interface ScanItem {
  id: string;
  target: string;
  status: string;
  risk_score: number | null;
  risk_level: string | null;
  created_at: string;
}

const riskColors: Record<string, string> = {
  Critical: "bg-red-600 text-white",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-500 text-black",
  Low: "bg-emerald-500 text-white",
};

const statusColors: Record<string, string> = {
  completed: "bg-emerald-900/50 text-emerald-400 border-emerald-700",
  running: "bg-blue-900/50 text-blue-400 border-blue-700",
  failed: "bg-red-900/50 text-red-400 border-red-700",
  pending: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await axios.get("/api/scans");
        setScans(res.data || []);
      } catch (e: unknown) {
        const status = axios.isAxiosError(e) ? e.response?.status : undefined;
        const errData = axios.isAxiosError(e)
          ? (e.response?.data as { error?: string } | undefined)
          : undefined;
        if (status === 401) {
          setError("Please sign in to view your scan history.");
        } else {
          setError(errData?.error || "Could not load scan history. Backend service is offline or unreachable.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  const downloadPdf = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setActionError(null);
    try {
      const res = await fetch(`/api/scan/${id}/pdf`);
      if (res.status === 401) {
        setActionError("Please sign in to export PDF reports.");
        return;
      }
      if (res.status === 402) {
        setActionError(
          "PDF Export requires a Pro or Enterprise plan. Please manage your billing in Settings to upgrade."
        );
        return;
      }
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "PDF download failed.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sageai-report-${id.toString().slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "PDF download failed.");
    }
  };

  return (
    <main className="min-h-screen bg-black text-emerald-50 font-sans selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black z-0 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-emerald-500/70 hover:text-emerald-400 transition-colors text-sm font-mono mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Scanner
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-emerald-100 to-emerald-600">
              Scan History
            </h1>
            <p className="text-emerald-500/60 font-mono mt-2">
              All previous reconnaissance missions
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 p-3 bg-emerald-900/20 rounded-full">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <Card role="alert" className="bg-red-950/30 border-red-900/50">
            <CardContent className="py-8 text-center text-red-400 font-mono">
              {error}
            </CardContent>
          </Card>
        )}

        {actionError && (
          <div
            role="alert"
            className="mb-6 bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3 text-red-300 font-mono text-sm flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              {actionError}
            </span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-red-400 hover:text-red-200 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {!loading && !error && scans.length === 0 && (
          <Card className="bg-zinc-950/80 border-emerald-900/50">
            <CardContent className="py-16 text-center">
              <Shield className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
              <p className="text-zinc-500 font-mono">No scans yet. Go run your first pentest!</p>
              <Link
                href="/"
                className="inline-block mt-4 px-6 py-2 bg-emerald-900/30 border border-emerald-500/40 rounded-lg text-emerald-400 font-mono text-sm hover:bg-emerald-800/40 transition-colors"
              >
                Start Scanning →
              </Link>
            </CardContent>
          </Card>
        )}

        {!loading && scans.length > 0 && (
          <div className="space-y-4">
            {scans.map((scan, i) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-zinc-950/80 border-emerald-900/30 hover:border-emerald-500/40 transition-all duration-300 group">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-mono text-lg text-emerald-50 truncate">
                            {scan.target}
                          </h3>
                          <Badge
                            className={`font-mono text-xs ${statusColors[scan.status] || statusColors.pending}`}
                          >
                            {scan.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500 font-mono">
                          {new Date(scan.created_at).toLocaleString()} • ID: {scan.id.slice(0, 8)}…
                        </p>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        {scan.risk_level && (
                          <Badge className={`font-mono ${riskColors[scan.risk_level] || "bg-zinc-700"}`}>
                            {scan.risk_score ?? "?"}/100 {scan.risk_level}
                          </Badge>
                        )}
                        {scan.status === "completed" && (
                          <button
                            onClick={(e) => downloadPdf(e, scan.id)}
                            className="text-zinc-500 hover:text-emerald-400 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/history/${scan.id}`}
                          className="text-emerald-500/60 hover:text-emerald-400 transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
