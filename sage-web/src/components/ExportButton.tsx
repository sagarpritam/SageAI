"use client";

import { Download } from "lucide-react";
import { useState } from "react";

interface ExportButtonProps {
  scanId: string;
}

export function ExportButton({ scanId }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/scan/${scanId}/pdf`);
      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sageai-report-${scanId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error("PDF download failed", e);
      alert("PDF download failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="group flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-bold text-sm
                 bg-emerald-900/30 border border-emerald-500/40 text-emerald-400
                 hover:bg-emerald-800/40 hover:border-emerald-400/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]
                 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download className={`w-4 h-4 ${loading ? "animate-bounce" : "group-hover:translate-y-0.5"} transition-transform`} />
      {loading ? "Generating..." : "Download PDF Report"}
    </button>
  );
}
