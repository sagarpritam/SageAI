"use client";

import React, { useState } from "react";
import {
  Cloud,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Layers,
  Wrench,
  CheckCircle2,
  Server,
  Hash,
} from "lucide-react";

export function CSPMHub() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"findings" | "toxic" | "remediation">("toxic");
  const [cspmData, setCspmData] = useState<any>({
    compliance_score_pct: 78.5,
    total_checks: 14,
    passed_checks: 11,
    failed_checks: 3,
    toxic_combinations: [
      {
        title: "TOXIC COMBINATION: Public Workload with Admin IAM on prod-alb",
        severity: "CRITICAL",
        risk_score: 9.9,
        asset: "prod-alb",
        mitre_attack: "T1078.004",
        vectors: [
          "Publicly accessible ingress endpoint",
          "Compute role contains sts:AssumeRole / iam:* wildcards",
        ],
        remediation: "Sever admin IAM profile; isolate behind private subnet.",
      },
    ],
    findings: [
      {
        finding_id: "FIND-AWS-S3",
        rule_id: "CIS-AWS-2.1.1",
        title: "Ensure S3 Buckets Prohibit Public Read and Write Access",
        severity: "CRITICAL",
        asset_name: "prod-customer-backups",
        remediation: "Enable S3 Block Public Access at the account and bucket level.",
      },
      {
        finding_id: "FIND-AWS-SSH",
        rule_id: "CIS-AWS-4.1",
        title: "Ensure No Security Groups Allow Ingress from 0.0.0.0/0 to Port 22 (SSH)",
        severity: "HIGH",
        asset_name: "bastion-sg",
        remediation: "Restrict inbound SSH to designated VPN CIDR.",
      },
    ],
    merkle_seal: {
      record_hash: "f4a1829471928471029487102947102948710294710294871029471029471029",
      ledger_index: 48,
    },
  });

  const [activeRemediation, setActiveRemediation] = useState<any>(null);

  const runCSPMAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cspm/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloud_assets: [
            { name: "prod-alb", type: "LOAD_BALANCER", cloud: "AWS", is_public: true, has_admin_iam: true },
            { name: "prod-customer-backups", type: "S3_BUCKET", cloud: "AWS", is_public: true },
            { name: "bastion-sg", type: "SECURITY_GROUP", cloud: "AWS", open_ssh: true },
            { name: "k8s-worker-pool", type: "KUBERNETES_NODE", cloud: "Kubernetes", is_privileged_container: false },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCspmData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRemediation = async (findingId: string, ruleId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/cspm/remediation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finding_id: findingId, rule_id: ruleId }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveRemediation(data.remediation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-zinc-950 to-zinc-900 border border-blue-900/40 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Cloud Security Posture Management & CIEM
                <span className="text-xs font-mono px-2 py-0.5 bg-blue-950 border border-blue-700/60 rounded text-blue-300">
                  CIS Benchmarks & Toxic Risks
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Multi-cloud compliance drift, toxic combination correlation, and automated Terraform/AWS CLI remediation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runCSPMAudit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Run CIS Benchmark Audit
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">CIS Compliance Score</div>
            <div className="text-base font-bold text-emerald-400 mt-1">
              {cspmData.compliance_score_pct}% Compliant
            </div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Toxic Combinations</div>
            <div className="text-base font-bold text-rose-400 mt-1">
              {cspmData.toxic_combinations?.length || 0} Critical Paths
            </div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Passed / Total Checks</div>
            <div className="text-base font-bold text-white mt-1">
              {cspmData.passed_checks} / {cspmData.total_checks}
            </div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Auto-Remediable Flaws</div>
            <div className="text-base font-bold text-cyan-400 mt-1">
              {cspmData.findings?.length || 0} Automated Fixes
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("toxic")}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
            activeTab === "toxic"
              ? "bg-rose-950/40 text-rose-400 border border-rose-500/40"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Toxic Risk Combinations ({cspmData.toxic_combinations?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("findings")}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
            activeTab === "findings"
              ? "bg-blue-950/40 text-blue-400 border border-blue-500/40"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          CIS Benchmark Findings ({cspmData.findings?.length || 0})
        </button>
      </div>

      {/* Toxic combinations */}
      {activeTab === "toxic" && (
        <div className="space-y-3">
          {(cspmData.toxic_combinations || []).map((toxic: any, idx: number) => (
            <div key={idx} className="p-4 bg-zinc-950 border border-rose-900/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 bg-rose-950 rounded border border-rose-800">
                  CRITICAL RISK {toxic.risk_score}/10
                </span>
                <span className="text-xs font-mono text-zinc-400">Asset: {toxic.asset}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{toxic.title}</h3>
              <ul className="list-disc list-inside text-xs text-zinc-400 space-y-0.5">
                {toxic.vectors?.map((v: string, i: number) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
              <div className="pt-2 text-xs font-mono text-emerald-400">
                <strong>Remediation:</strong> {toxic.remediation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CIS Findings */}
      {activeTab === "findings" && (
        <div className="space-y-3">
          {(cspmData.findings || []).map((f: any, idx: number) => (
            <div key={idx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-800 font-bold">
                    {f.rule_id}
                  </span>
                  <span className="text-zinc-400">{f.asset_name}</span>
                </div>
                <div className="text-sm font-bold text-white">{f.title}</div>
                <div className="text-zinc-500">{f.remediation}</div>
              </div>

              <button
                onClick={() => fetchRemediation(f.finding_id, f.rule_id)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold transition-all flex items-center gap-1.5 self-start md:self-center"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                View Code Fix
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Remediation Modal */}
      {activeRemediation && (
        <div className="p-4 bg-black border border-zinc-800 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-300 font-bold">
            <span>Automated Remediation Script ({activeRemediation.type})</span>
            <button onClick={() => setActiveRemediation(null)} className="text-zinc-500 hover:text-white">✕</button>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 mb-1">Terraform HCL Fix:</div>
            <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded text-emerald-400 overflow-x-auto text-[11px]">
              {activeRemediation.terraform}
            </pre>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 mb-1">AWS CLI Command:</div>
            <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded text-cyan-300 overflow-x-auto text-[11px]">
              {activeRemediation.aws_cli}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

