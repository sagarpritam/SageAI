"use client";

import React, { useState } from "react";
import {
  Globe,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Search,
  ExternalLink,
  Hash,
} from "lucide-react";

export function EASMHunter() {
  const [loading, setLoading] = useState(false);
  const [targetDomain, setTargetDomain] = useState("enterprise.com");
  const [easmData, setEasmData] = useState<any>({
    perimeter_grade: "F (CRITICAL RISKS DETECTED)",
    total_assets_discovered: 5,
    shadow_it_count: 3,
    takeover_vulnerabilities_count: 1,
    assets: [
      { subdomain: "api.enterprise.com", ip: "198.51.100.12", grade: "A", is_shadow: false },
      { subdomain: "auth.enterprise.com", ip: "198.51.100.15", grade: "A", is_shadow: false },
      { subdomain: "staging-api.enterprise.com", ip: "203.0.113.88", grade: "C", is_shadow: true, reason: "Unauthenticated staging environment exposed" },
      { subdomain: "docs.enterprise.com", ip: "185.199.108.153", grade: "F", is_shadow: true, reason: "Dangling CNAME pointing to unclaimed GitHub Pages" },
      { subdomain: "legacy-portal.enterprise.com", ip: "198.51.100.99", grade: "D", is_shadow: true, reason: "Deprecated admin portal with TLS 1.0" },
    ],
    takeover_vulnerabilities: [
      {
        subdomain: "docs.enterprise.com",
        vulnerable_cname: "corp-docs.github.io",
        service: "GitHub Pages",
        severity: "HIGH",
        mitre_attack: "T1584.001",
        description: "Subdomain 'docs.enterprise.com' has a dangling CNAME pointing to an unclaimed GitHub Pages site.",
        remediation: "Immediately remove dangling CNAME record in DNS.",
      },
    ],
  });

  const runEASMScan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/easm/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_domain: targetDomain }),
      });
      if (res.ok) {
        const data = await res.json();
        setEasmData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-950 to-zinc-900 border border-amber-900/40 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                External Attack Surface Management & Shadow IT
                <span className="text-xs font-mono px-2 py-0.5 bg-amber-950 border border-amber-700/60 rounded text-amber-300">
                  Dangling DNS & Subdomain Takeovers
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Continuous asset reconnaissance, Certificate Transparency monitoring, and abandoned cloud takeover alerts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value)}
              className="px-3 py-1.5 bg-black border border-zinc-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={runEASMScan}
              disabled={loading}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg text-xs transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Scan Perimeter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Perimeter Posture Grade</div>
            <div className="text-base font-bold text-rose-400 mt-1">{easmData.perimeter_grade}</div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Total Assets Discovered</div>
            <div className="text-base font-bold text-white mt-1">{easmData.total_assets_discovered} Subdomains</div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Unmanaged Shadow IT</div>
            <div className="text-base font-bold text-amber-400 mt-1">{easmData.shadow_it_count} Exposed</div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Subdomain Takeovers</div>
            <div className="text-base font-bold text-rose-400 mt-1">{easmData.takeover_vulnerabilities_count} Hijackable</div>
          </div>
        </div>
      </div>

      {/* Takeover alerts */}
      {easmData.takeover_vulnerabilities?.length > 0 && (
        <div className="p-5 bg-zinc-950 border border-rose-900/60 rounded-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Critical Subdomain Takeover Vulnerabilities
          </h3>
          {easmData.takeover_vulnerabilities.map((t: any, idx: number) => (
            <div key={idx} className="p-3 bg-black/60 border border-rose-800 rounded-lg text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-rose-400 font-bold">
                <span>{t.subdomain} ➔ {t.vulnerable_cname}</span>
                <span className="px-2 py-0.5 bg-rose-950 rounded border border-rose-800">
                  {t.severity} RISK
                </span>
              </div>
              <div className="text-zinc-300">{t.description}</div>
              <div className="text-emerald-400 text-[11px]">
                <strong>Remediation: </strong>{t.remediation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discovered Assets */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 font-mono text-xs">
        <h3 className="text-sm font-bold text-white">Discovered Perimeter Assets & Shadow IT</h3>
        <div className="space-y-2">
          {easmData.assets?.map((a: any, idx: number) => (
            <div key={idx} className="p-3 bg-black/60 border border-zinc-800/80 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    a.grade === "A"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : a.grade === "C"
                      ? "bg-amber-950 text-amber-400 border border-amber-800"
                      : "bg-rose-950 text-rose-400 border border-rose-800"
                  }`}
                >
                  Grade {a.grade}
                </span>
                <span className="text-white font-bold">{a.subdomain}</span>
                {a.is_shadow && (
                  <span className="px-1.5 py-0.5 bg-zinc-900 text-amber-400 rounded text-[10px]">
                    SHADOW IT
                  </span>
                )}
              </div>
              <div className="text-zinc-500 text-[11px]">{a.reason || `Direct IP: ${a.ip}`}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

