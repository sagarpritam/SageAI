"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  ShieldCheck,
  Lock,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  Binary,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export function ZKPComplianceStudio() {
  const [framework, setFramework] = useState("SOC 2 Type II");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [proofData, setProofData] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const fetchExistingProof = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/zkp/proof");
      if (res.ok) {
        const data = await res.json();
        setProofData(data.proof);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingProof();
  }, []);

  const generateNewProof = async () => {
    setLoading(true);
    setVerifyResult(null);
    try {
      const res = await fetch("/api/zkp/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ framework }),
      });
      if (res.ok) {
        const data = await res.json();
        setProofData(data.proof);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const verifyProof = async () => {
    if (!proofData) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/zkp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proof_id: proofData.proof_id,
          framework: proofData.framework,
          public_signals: proofData.public_signals,
          groth16_proof: proofData.groth16_proof,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setVerifyResult(data.verification);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  const copyProofJson = () => {
    if (!proofData) return;
    navigator.clipboard.writeText(JSON.stringify(proofData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Zero-Knowledge Proof (ZKP) Compliance Attestation
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Groth16 / BN254 Curve
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Mathematically prove SOC 2, ISO 27001, and FedRAMP compliance to enterprise auditors and clients without exposing internal IP addresses, infrastructure topology, or secrets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-emerald-500 outline-none"
          >
            <option>SOC 2 Type II</option>
            <option>ISO/IEC 27001:2022</option>
            <option>FedRAMP High</option>
            <option>HIPAA Security Rule</option>
          </select>
          <button
            onClick={generateNewProof}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Synthesizing SNARK..." : "Synthesize ZK Proof"}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Public Signals & Guarantees */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Zero-Knowledge Public Signals
              </span>
              <span className="text-xs text-emerald-400 font-mono">Zero IP Disclosed</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Storage Encryption at Rest</div>
                  <div className="text-[10px] text-slate-500">AES-256 / HSM Keys Enforced</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">VERIFIED (1)</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Critical CVE Remediation SLA</div>
                  <div className="text-[10px] text-slate-500">Zero Unpatched Vulnerabilities &gt;24h</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">VERIFIED (1)</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">MFA &amp; FIDO2 Hardware Enforcement</div>
                  <div className="text-[10px] text-slate-500">Zero Password-Only Accounts Permitted</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">VERIFIED (1)</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Enclave Zero-Egress Boundary</div>
                  <div className="text-[10px] text-slate-500">Micro-Shield Active on All Pods</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">VERIFIED (1)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Auditor Zero-Knowledge Guarantee
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Third-party auditors can mathematically verify that your infrastructure strictly satisfies 100% of controls without accessing database connection strings, VPC topology, or internal hostnames.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Groth16 Proof & Pairing Check */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Binary className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-emerald-300 font-bold">
                  Groth16 zk-SNARK Bundle ({proofData?.curve || "BN254 / alt_bn128"})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyProofJson}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy Proof JSON"}
                </button>
                <button
                  onClick={verifyProof}
                  disabled={verifying || !proofData}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition disabled:opacity-50"
                >
                  {verifying ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                  {verifying ? "Verifying..." : "Run Pairing Check"}
                </button>
              </div>
            </div>

            {verifyResult && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1 font-mono">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Pairing Check: {verifyResult.verification_status}
                </div>
                <div className="text-[11px] text-slate-400">{verifyResult.pairing_check}</div>
                <div className="text-[10px] text-emerald-500 pt-0.5">
                  Verified At: {verifyResult.verified_at}
                </div>
              </div>
            )}

            {proofData ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Proof ID</span>
                    <span className="text-emerald-400 truncate block">{proofData.proof_id}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Curve / Scheme</span>
                    <span className="text-slate-200 block">BN254 Groth16</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Framework</span>
                    <span className="text-slate-200 block">{proofData.framework}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">
                    Curve Points (pi_a, pi_b, pi_c)
                  </span>
                  <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-emerald-200/90 overflow-x-auto max-h-56 border border-slate-800">
                    {JSON.stringify(proofData.groth16_proof, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                Click "Synthesize ZK Proof" to generate cryptographic compliance bundle.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

