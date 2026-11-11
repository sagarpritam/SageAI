"use client";

import { useState } from "react";
import {
  Database,
  Download,
  Loader2,
  FileJson,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
} from "lucide-react";

const exportTypes = [
  { id: "scans", label: "Scan Results", desc: "All completed scans with findings", icon: FileText },
  { id: "findings", label: "Vulnerability Findings", desc: "All unique vulnerabilities discovered", icon: FileJson },
  { id: "audit", label: "Audit Logs", desc: "Organization activity history", icon: FileSpreadsheet },
];

const formats = [
  { id: "json", label: "JSON" },
  { id: "csv", label: "CSV" },
  { id: "pdf", label: "PDF" },
];

export function DataExport() {
  const [selectedType, setSelectedType] = useState("scans");
  const [selectedFormat, setSelectedFormat] = useState("json");
  const [exporting, setExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, format: selectedFormat }),
      });
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        throw new Error(errData.error || errData.detail || "Export failed. Please try again.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sageai-${selectedType}.${selectedFormat}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold text-white">Data Export</h3>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/40 border border-red-700/50 rounded-lg px-4 py-3 text-xs font-mono text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Export Type */}
      <div className="space-y-2">
        {exportTypes.map((et) => (
          <button
            key={et.id}
            onClick={() => setSelectedType(et.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              selectedType === et.id
                ? "bg-emerald-900/30 border-emerald-500/50"
                : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <et.icon
              className={`w-5 h-5 shrink-0 ${
                selectedType === et.id ? "text-emerald-400" : "text-zinc-500"
              }`}
            />
            <div>
              <p className="text-sm font-bold text-white">{et.label}</p>
              <p className="text-xs text-zinc-500">{et.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Format */}
      <div>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-2">Format</p>
        <div className="flex gap-2">
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFormat(f.id)}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                selectedFormat === f.id
                  ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/50"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold rounded-lg transition-colors text-sm w-full justify-center"
      >
        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {exporting ? "Exporting..." : "Export Data"}
      </button>
    </div>
  );
}
