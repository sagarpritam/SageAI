"use client";

import React, { useState } from "react";
import {
  Cloud,
  GitPullRequest,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  FileCode,
  ShieldAlert,
  Server,
  Terminal,
  AlertTriangle,
} from "lucide-react";

export function IaCDriftEngine() {
  const [loading, setLoading] = useState(false);
  const [prLoading, setPrLoading] = useState(false);
  const [driftReport, setDriftReport] = useState<any>(null);
  const [generatedPR, setGeneratedPR] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scanDrift = async () => {
    setLoading(true);
    setGeneratedPR(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/iac-drift/scan", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json().catch(() => ({}))) as {
        drift_report?: unknown;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Failed to scan IaC drift");
      }
      setDriftReport(data.drift_report);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to scan IaC drift");
    } finally {
      setLoading(false);
    }
  };

  const generatePR = async () => {
    if (!driftReport) return;
    setPrLoading(true);
    setErrorMsg(null);
    try {
      const driftIds = driftReport.drifts.map((d: any) => d.drift_id);
      const res = await fetch("/api/iac-drift/pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drift_ids: driftIds }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        pull_request?: unknown;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate remediation PR");
      }
      setGeneratedPR(data.pull_request);
    } catch (e: unknown) {
      setErrorMsg(
        e instanceof Error ? e.message : "Failed to generate remediation PR"
      );
    } finally {
      setPrLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-sky-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Autonomous Cloud Infrastructure-as-Code (IaC) Drift Engine
            </h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Continuously reconciles declared Terraform, Helm, and CloudFormation templates against live cloud assets and generates zero-trust Git PR patches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={scanDrift}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-sky-950/40 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Scan IaC Drift
          </button>
        </div>
      </div>

      {driftReport ? (
        <div className="space-y-6">
          {/* Posture Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">IaC Posture Score</span>
              <p className="text-2xl font-bold text-amber-400">{driftReport.cloud_iac_posture_score}/100</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Drifts Detected</span>
              <p className="text-2xl font-bold text-rose-400">{driftReport.drifts_detected}</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Critical Regressions</span>
              <p className="text-2xl font-bold text-red-500">{driftReport.critical_drifts}</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Resources Inspected</span>
              <p className="text-2xl font-bold text-zinc-200">{driftReport.resources_inspected}</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between p-4 bg-sky-950/20 border border-sky-800/40 rounded-xl">
            <div className="flex items-center gap-3">
              <GitPullRequest className="h-5 w-5 text-sky-400" />
              <div>
                <p className="text-sm font-semibold text-white">Autonomous Git Reconciliation</p>
                <p className="text-xs text-zinc-400">Generate a unified Git Pull Request containing all Terraform and Helm reconciliation blocks.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={generatePR}
              disabled={prLoading}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md disabled:opacity-50"
            >
              {prLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <GitPullRequest className="h-3.5 w-3.5" />}
              Generate Remediation PR
            </button>
          </div>

          {/* Generated PR Banner */}
          {generatedPR && (
            <div className="p-5 bg-zinc-900/90 border border-emerald-500/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  {generatedPR.title}
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  BRANCH: {generatedPR.branch}
                </span>
              </div>
              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                <pre>{generatedPR.diff}</pre>
              </div>
            </div>
          )}

          {/* Drifts Table */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-400" />
              Detected Cloud State Discrepancies
            </h3>
            <div className="space-y-3">
              {driftReport.drifts.map((d: any, idx: number) => (
                <div key={idx} className="p-4 bg-zinc-950/70 border border-zinc-800/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/50">
                        {d.severity}
                      </span>
                      <span className="text-xs font-mono text-zinc-300">{d.resource_id}</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">{d.file_path}</span>
                  </div>
                  <p className="text-xs text-zinc-300">{d.description}</p>
                  <div className="p-2 bg-zinc-900/80 rounded border border-zinc-800/80 font-mono text-[11px] text-sky-400">
                    CLI Fix: {d.remediation_cli}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-zinc-500 text-sm border border-dashed border-zinc-800/80 rounded-xl">
          Click <span className="text-sky-400 font-semibold">Scan IaC Drift</span> to audit live cloud infrastructure against declared Terraform manifests.
        </div>
      )}
    </div>
  );
}

