"use client";

import React, { useState } from "react";
import {
  Database,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Layers,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Globe,
  FileCode,
} from "lucide-react";

export function DSPMHub() {
  const [storeId, setStoreId] = useState("s3-analytics-data-prod");
  const [cloudProvider, setCloudProvider] = useState("AWS");
  const [isPublic, setIsPublic] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dspmReport, setDspmReport] = useState<any>(null);
  const [remediationPlan, setRemediationPlan] = useState<any>(null);
  const [copiedHcl, setCopiedHcl] = useState(false);

  const sampleRecords = [
    "TRANSACTION_ID=TX-901 customer_email=alice@corp.com ssn=123-45-6789 card=4111222233334444",
    "PATIENT_ID=MRN-90219 diagnosis=CARDIOMYOPATHY doctor=dr_smith@hospital.org",
    "CONFIG: AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "PUBLIC_DOC: Terms of service and privacy policy for SageAI enterprise cloud.",
  ];

  const scanStore = async () => {
    setLoading(true);
    setRemediationPlan(null);
    try {
      const res = await fetch("/api/dspm/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          cloud_provider: cloudProvider,
          store_type: "OBJECT_STORAGE",
          sample_records: sampleRecords,
          is_public: isPublic,
          encryption_enabled: encryptionEnabled,
          region: "us-east-1",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDspmReport(data.dspm_report);
      }
    } catch (e) {
      console.error("DSPM scan failed", e);
    } finally {
      setLoading(false);
    }
  };

  const generateRemediation = async () => {
    if (!dspmReport) return;
    setLoading(true);
    try {
      const res = await fetch("/api/dspm/remediation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scan_result: dspmReport }),
      });
      if (res.ok) {
        const data = await res.json();
        setRemediationPlan(data.remediation_plan);
      }
    } catch (e) {
      console.error("Remediation failed", e);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHcl(true);
    setTimeout(() => setCopiedHcl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-zinc-900 border border-emerald-900/40 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Autonomous Cloud Data Security Posture Management (DSPM)
                <span className="text-xs font-mono px-2 py-0.5 bg-emerald-950 border border-emerald-700/60 rounded text-emerald-300">
                  PII / PCI / HIPAA
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Multi-cloud sensitive data discovery, toxic data exposure correlation, data lineage flows & least-privilege remediation.
              </p>
            </div>
          </div>

          <button
            onClick={scanStore}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Scan Cloud Data Store
          </button>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6 font-mono text-xs">
          <div>
            <label className="text-zinc-400 text-[10px] block mb-1">TARGET STORAGE ASSET</label>
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-xs"
            />
          </div>
          <div>
            <label className="text-zinc-400 text-[10px] block mb-1">CLOUD PLATFORM</label>
            <select
              value={cloudProvider}
              onChange={(e) => setCloudProvider(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-xs"
            >
              <option value="AWS">AWS (S3 & RDS)</option>
              <option value="Azure">Azure (Blob Storage)</option>
              <option value="GCP">GCP (Cloud Storage)</option>
            </select>
          </div>
          <div>
            <label className="text-zinc-400 text-[10px] block mb-1">INGRESS ACCESS</label>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`w-full p-2 rounded-lg border text-xs font-bold transition-all ${
                isPublic ? "bg-rose-950 text-rose-300 border-rose-800" : "bg-zinc-900 text-zinc-300 border-zinc-700"
              }`}
            >
              {isPublic ? "Public Read Allowed (Exposed)" : "Private Endpoint Isolated"}
            </button>
          </div>
          <div>
            <label className="text-zinc-400 text-[10px] block mb-1">ENCRYPTION AT REST</label>
            <button
              onClick={() => setEncryptionEnabled(!encryptionEnabled)}
              className={`w-full p-2 rounded-lg border text-xs font-bold transition-all ${
                encryptionEnabled ? "bg-emerald-950 text-emerald-300 border-emerald-800" : "bg-amber-950 text-amber-300 border-amber-800"
              }`}
            >
              {encryptionEnabled ? "KMS CMEK Encrypted" : "Unencrypted / Default"}
            </button>
          </div>
        </div>
      </div>

      {/* DSPM Scan Results */}
      {dspmReport && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
              <span className="text-zinc-500 text-[10px]">DSPM POSTURE GRADE</span>
              <div className="flex items-center gap-3">
                <span
                  className={`text-3xl font-bold ${
                    dspmReport.posture_grade === "F" ? "text-rose-400" : dspmReport.posture_grade === "A" ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {dspmReport.posture_grade}
                </span>
                <span className="text-zinc-400 text-xs">Risk Score: {dspmReport.risk_score} / 100</span>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
              <span className="text-zinc-500 text-[10px]">SENSITIVE RECORDS FOUND</span>
              <div className="text-2xl font-bold text-white">{dspmReport.total_sensitive_items} Records</div>
              <div className="flex gap-2 text-[10px]">
                {Object.entries(dspmReport.category_distribution || {}).map(([cat, count]: any, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-emerald-300">
                    {cat}: {count}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-zinc-500 text-[10px]">TOXIC COMBINATION STATUS</span>
                <div
                  className={`text-xs font-bold mt-1 ${
                    dspmReport.toxic_combination_detected ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {dspmReport.toxic_combination_detected ? "TOXIC COMBINATION FLAGGED" : "NO TOXIC EXPOSURE"}
                </div>
              </div>
              <button
                onClick={generateRemediation}
                disabled={loading}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all text-xs flex items-center justify-center gap-2"
              >
                <FileCode className="w-3.5 h-3.5" />
                Generate Remediation Policy
              </button>
            </div>
          </div>

          {dspmReport.toxic_combination_detected && (
            <div className="p-3 bg-rose-950/30 border border-rose-800 rounded-lg text-xs font-mono flex items-center gap-2 text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{dspmReport.toxic_combination_summary}</span>
            </div>
          )}

          {/* Classified Findings */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3 font-mono text-xs">
            <h4 className="text-sm font-bold text-white">Classified Sensitive Records Sample</h4>
            <div className="space-y-2">
              {dspmReport.findings.map((f: any, idx: number) => (
                <div key={idx} className="p-3 bg-black/60 border border-zinc-800 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="text-white font-bold">{f.name}</span>
                    <span className="text-[10px] text-zinc-500 ml-2">Masked: {f.masked_sample}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-emerald-400">
                      {f.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-rose-950 border border-rose-800 rounded text-rose-400 font-bold">
                      {f.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remediation Plan */}
          {remediationPlan && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  Automated Least-Privilege Terraform HCL Remediation
                </h4>
                <button
                  onClick={() => copyCode(remediationPlan.terraform_hcl)}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] rounded border border-zinc-800 flex items-center gap-1.5"
                >
                  {copiedHcl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedHcl ? "Copied" : "Copy Terraform"}
                </button>
              </div>

              <pre className="p-4 bg-black border border-zinc-900 rounded-lg text-xs text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {remediationPlan.terraform_hcl}
              </pre>
            </div>
          )}

          {dspmReport.merkle_seal && (
            <div className="p-3 bg-black border border-emerald-900/40 rounded-xl flex items-center justify-between text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Merkle Seal Block #{dspmReport.merkle_seal.ledger_index} Cryptographically Verified</span>
              </div>
              <div className="text-zinc-500 text-[10px] truncate max-w-xs">{dspmReport.merkle_seal.record_hash}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

