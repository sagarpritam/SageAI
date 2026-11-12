"use client";

import React, { useState } from "react";
import {
  Network,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  FileCode,
  Terminal,
  Key,
  Users,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export function BloodHoundStudio() {
  const [loading, setLoading] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [adReport, setAdReport] = useState<any>(null);
  const [lockdownScript, setLockdownScript] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scanAD = async () => {
    setLoading(true);
    setLockdownScript(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/bloodhound/scan");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || `Active Directory scan failed (${res.status})`);
      }
      const data = await res.json();
      setAdReport(data.ad_report);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to scan Active Directory attack paths");
    } finally {
      setLoading(false);
    }
  };

  const generateLockdown = async () => {
    setScriptLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/bloodhound/lockdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || `Lockdown generation failed (${res.status})`);
      }
      const data = await res.json();
      setLockdownScript(data.lockdown_script);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to generate Active Directory hardening script");
    } finally {
      setScriptLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-xs text-red-200"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            {errorMsg}
          </span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300 hover:text-white underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Active Directory & BloodHound Attack Graph Studio
            </h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Visualizes Tier-0 attack paths, Kerberoasting (T1558.003), AS-REP Roasting, DCSync replication abuse, and unconstrained delegation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={scanAD}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-red-950/40 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Scan Active Directory
          </button>
        </div>
      </div>

      {adReport ? (
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">AD Hygiene Score</span>
              <p className="text-2xl font-bold text-amber-400">{adReport.ad_hygiene_score}/100</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Critical Exposures</span>
              <p className="text-2xl font-bold text-rose-500">{adReport.critical_risks}</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Total Risks Flagged</span>
              <p className="text-2xl font-bold text-red-400">{adReport.risks_detected}</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Domain Forest</span>
              <p className="text-sm font-bold text-zinc-200 mt-1">{adReport.domain}</p>
            </div>
          </div>

          {/* Shortest Attack Path to Tier-0 */}
          <div className="p-5 bg-gradient-to-r from-red-950/40 via-zinc-900/80 to-zinc-900/80 border border-red-800/40 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Key className="h-4 w-4 text-red-400" />
                Shortest Kill-Chain Path to Domain Controller (Tier-0)
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                CRITICAL LETHALITY
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-white flex-wrap">
              {adReport.shortest_tier0_attack_path?.map((step: string, idx: number) => (
                <React.Fragment key={idx}>
                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                      idx === 0
                        ? "bg-zinc-800 text-zinc-300"
                        : idx === adReport.shortest_tier0_attack_path.length - 1
                        ? "bg-red-950 text-red-300 border border-red-800 font-bold"
                        : "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                    }`}
                  >
                    {step}
                  </span>
                  {idx < adReport.shortest_tier0_attack_path.length - 1 && <span className="text-zinc-600">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between p-4 bg-red-950/20 border border-red-800/40 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-white">Automated Active Directory Hardening</p>
              <p className="text-[11px] text-zinc-400">Generate a hardened PowerShell script to revoke DCSync rights and enforce AES-256 SPNs.</p>
            </div>
            <button
              type="button"
              onClick={generateLockdown}
              disabled={scriptLoading}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {scriptLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <FileCode className="h-3.5 w-3.5" />}
              Generate Hardening Script
            </button>
          </div>

          {/* Generated Script Display */}
          {lockdownScript && (
            <div className="p-4 bg-zinc-950 border border-emerald-500/40 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                PowerShell Hardening Script ({lockdownScript.remediated_risks_count} Remediations)
              </div>
              <div className="p-3 bg-zinc-900 rounded font-mono text-[11px] text-emerald-300 overflow-x-auto">
                <pre>{lockdownScript.powershell_script}</pre>
              </div>
            </div>
          )}

          {/* Risks Stream */}
          <div className="space-y-3">
            {adReport.risks?.map((r: any, idx: number) => (
              <div key={idx} className="p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-red-400 border border-zinc-800">
                      {r.type}
                    </span>
                    <span className="text-xs font-semibold text-white">{r.account}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-400">{r.severity}</span>
                </div>
                <p className="text-xs text-zinc-300">{r.description}</p>
                <div className="p-2 bg-zinc-900/80 rounded border border-zinc-800/80 font-mono text-[11px] text-amber-400">
                  {r.powershell_fix}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-zinc-500 text-sm border border-dashed border-zinc-800/80 rounded-xl">
          Click <span className="text-red-400 font-semibold">Scan Active Directory</span> to evaluate Domain Controller attack graphs and Kerberoasting exposures.
        </div>
      )}
    </div>
  );
}

