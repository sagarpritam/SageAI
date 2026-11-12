"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  FileCode,
  Network,
  Lock,
  Layers,
  Code2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export function APIShieldCenter() {
  const [loading, setLoading] = useState(false);
  const [regoLoading, setRegoLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<any>(null);
  const [opaPolicy, setOpaPolicy] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const auditAPIs = async () => {
    setLoading(true);
    setOpaPolicy(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/api-shield/audit");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || `API audit failed (${res.status})`);
      }
      const data = await res.json();
      setAuditReport(data.api_audit_report);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to audit microservices APIs");
    } finally {
      setLoading(false);
    }
  };

  const generateRego = async () => {
    setRegoLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/api-shield/rego");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || `Rego generation failed (${res.status})`);
      }
      const data = await res.json();
      setOpaPolicy(data.opa_policy);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to generate OPA Rego policy");
    } finally {
      setRegoLoading(false);
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
            <Network className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              API Security & Microservices Boundary Shield (BOLA/BFLA)
            </h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Automated discovery of Broken Object Level Authorization (BOLA), Broken Function Level Authorization (BFLA), and OPA Rego policy enforcement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={auditAPIs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-indigo-950/40 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Audit Microservices APIs
          </button>
        </div>
      </div>

      {auditReport ? (
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">API Security Score</span>
              <p className="text-2xl font-bold text-amber-400">{auditReport.api_security_score}/100</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Endpoints Audited</span>
              <p className="text-2xl font-bold text-zinc-200">{auditReport.endpoints_audited}</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Critical BOLA / BFLA</span>
              <p className="text-2xl font-bold text-rose-500">{auditReport.critical_api_vulnerabilities}</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Total Vulnerabilities</span>
              <p className="text-2xl font-bold text-red-400">{auditReport.vulnerabilities_detected}</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between p-4 bg-indigo-950/20 border border-indigo-800/40 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-white">Autonomous Policy Enforcement</p>
              <p className="text-[11px] text-zinc-400">Synthesize an Open Policy Agent (OPA) Rego policy to enforce tenant boundaries in Envoy / Istio.</p>
            </div>
            <button
              type="button"
              onClick={generateRego}
              disabled={regoLoading}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {regoLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Code2 className="h-3.5 w-3.5" />}
              Generate OPA Rego Policy
            </button>
          </div>

          {/* Generated OPA Policy */}
          {opaPolicy && (
            <div className="p-4 bg-zinc-950 border border-emerald-500/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Open Policy Agent (OPA) Rego Policy
                </span>
                <span className="text-[10px] font-mono text-zinc-400">TARGET: {opaPolicy.gateway_target}</span>
              </div>
              <div className="p-3 bg-zinc-900 rounded font-mono text-[11px] text-emerald-300 overflow-x-auto">
                <pre>{opaPolicy.rego_code}</pre>
              </div>
            </div>
          )}

          {/* Vulnerability Cards */}
          <div className="space-y-3">
            {auditReport.vulnerabilities?.map((v: any, idx: number) => (
              <div key={idx} className="p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-indigo-300 border border-zinc-800">
                      {v.endpoint}
                    </span>
                    <span className="text-xs font-semibold text-white">[{v.service}]</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-400">{v.severity}</span>
                </div>
                <p className="text-xs font-medium text-amber-400">{v.category}</p>
                <p className="text-xs text-zinc-300">{v.description}</p>
                <div className="p-2 bg-zinc-900/80 rounded border border-zinc-800/80 text-[11px] text-emerald-400">
                  Fix: {v.remediation}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-zinc-500 text-sm border border-dashed border-zinc-800/80 rounded-xl">
          Click <span className="text-indigo-400 font-semibold">Audit Microservices APIs</span> to test REST, GraphQL, and gRPC endpoints for BOLA/BFLA authorization bypasses.
        </div>
      )}
    </div>
  );
}

