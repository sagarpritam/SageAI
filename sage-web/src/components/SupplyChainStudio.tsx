"use client";

import React, { useState } from "react";
import {
  Package,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  RefreshCw,
  GitBranch,
  Hash,
} from "lucide-react";

export function SupplyChainStudio() {
  const [loading, setLoading] = useState(false);
  const [manifestText, setManifestText] = useState(
    "fastapi==0.115.0\npydantic==2.9.2\nrequests==2.20.0\ncryptography==43.0.1\nlodsh==1.0.0"
  );
  const [sbomData, setSbomData] = useState<any>({
    total_components: 5,
    vulnerabilities_count: 1,
    typosquat_warnings_count: 1,
    vulnerabilities: [
      {
        component: "requests",
        version: "2.20.0",
        cve: "CVE-2018-18074",
        severity: "HIGH",
        cvss: 7.5,
        title: "Redirect session authorization leak",
      },
    ],
    typosquat_warnings: [
      {
        suspect_package: "lodsh",
        target_popular_package: "lodash",
        risk: "HIGH_CONFIDENCE_TYPOSQUATTING",
        description: "Package 'lodsh' differs by only 1 character from popular 'lodash'.",
      },
    ],
  });

  const runScan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/supply-chain/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest_content: manifestText, project_name: "SageAI-Core" }),
      });
      if (res.ok) {
        const data = await res.json();
        setSbomData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-zinc-900 border border-emerald-900/40 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Software Supply Chain & CycloneDX 1.5 SBOM
                <span className="text-xs font-mono px-2 py-0.5 bg-emerald-950 border border-emerald-700/60 rounded text-emerald-300">
                  Dependency Graph & Typosquatting
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Automated SBOM generation, transitive dependency vulnerability mapping, and package typosquatting defense.
              </p>
            </div>
          </div>

          <button
            onClick={runScan}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded-lg text-xs transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Scan Manifest & Generate SBOM
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Components in SBOM</div>
            <div className="text-base font-bold text-white mt-1">{sbomData.total_components} Libraries</div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Known CVEs</div>
            <div className="text-base font-bold text-rose-400 mt-1">{sbomData.vulnerabilities_count} Flaws</div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Typosquatting Alerts</div>
            <div className="text-base font-bold text-amber-400 mt-1">{sbomData.typosquat_warnings_count} Suspicious</div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Standard</div>
            <div className="text-base font-bold text-emerald-400 mt-1">CycloneDX 1.5 JSON</div>
          </div>
        </div>
      </div>

      {/* Manifest Input */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3 font-mono text-xs">
        <div className="text-zinc-300 font-bold">Package Manifest (requirements.txt / package.json):</div>
        <textarea
          rows={4}
          value={manifestText}
          onChange={(e) => setManifestText(e.target.value)}
          className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-emerald-500 text-xs"
        />
      </div>

      {/* Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Typosquat warnings */}
        <div className="p-5 bg-zinc-950 border border-amber-900/40 rounded-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Supply Chain Typosquatting Warnings
          </h3>
          {(sbomData.typosquat_warnings || []).map((t: any, idx: number) => (
            <div key={idx} className="p-3 bg-black/60 border border-amber-900/60 rounded-lg text-xs font-mono space-y-1">
              <div className="text-amber-400 font-bold">{t.risk}</div>
              <div className="text-zinc-300">{t.description}</div>
              <div className="text-[11px] text-zinc-500">Target Popular Package: {t.target_popular_package}</div>
            </div>
          ))}
        </div>

        {/* Vulnerabilities */}
        <div className="p-5 bg-zinc-950 border border-rose-900/40 rounded-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            Direct & Transitive CVE Findings
          </h3>
          {(sbomData.vulnerabilities || []).map((v: any, idx: number) => (
            <div key={idx} className="p-3 bg-black/60 border border-rose-900/60 rounded-lg text-xs font-mono space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-bold">{v.cve}</span>
                <span className="text-[10px] px-2 py-0.5 bg-rose-950 text-rose-300 rounded border border-rose-800">
                  CVSS {v.cvss} ({v.severity})
                </span>
              </div>
              <div className="text-zinc-200 font-bold">{v.title}</div>
              <div className="text-[11px] text-zinc-500">Affected: {v.component}@{v.version}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

