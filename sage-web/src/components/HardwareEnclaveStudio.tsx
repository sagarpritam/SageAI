"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  RefreshCw,
  Binary,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Copy,
  Check,
  FileCode,
} from "lucide-react";

export function HardwareEnclaveStudio() {
  const [platform, setPlatform] = useState<"AWS_NITRO" | "AMD_SEV_SNP" | "INTEL_SGX">("AWS_NITRO");
  const [simulateTampering, setSimulateTampering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unsealLoading, setUnsealLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [unsealResult, setUnsealResult] = useState<any>(null);
  const [selectedSecret, setSelectedSecret] = useState("sovereign-vault-master-key");
  const [copiedKey, setCopiedKey] = useState(false);
  const [goldenMeasurements, setGoldenMeasurements] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMeasurements = async () => {
    try {
      const res = await fetch("/api/enclave-attestation/measurements");
      if (res.ok) {
        const data = await res.json();
        setGoldenMeasurements(data.golden_measurements);
        setErrorMsg(null);
      } else {
        setErrorMsg(`Failed to load enclave measurements (HTTP ${res.status}).`);
      }
    } catch {
      setErrorMsg("Unable to reach enclave measurements endpoint.");
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const runVerification = async () => {
    setLoading(true);
    setUnsealResult(null);
    setErrorMsg(null);
    try {
      const body: Record<string, any> = { platform };
      if (platform === "AWS_NITRO") {
        const pcr0 = simulateTampering
          ? "badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad0"
          : "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        const doc = {
          module_id: "i-09f42d17c88b9e01-enc01",
          pcrs: {
            "0": pcr0,
            "1": "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
            "2": "4e1243bd22c66e76c2ba9eddc1f91394e57f9f835f15d7f1d3c01bf68595305f",
          },
        };
        body.attestation_doc_b64 = btoa(JSON.stringify(doc));
      } else if (platform === "AMD_SEV_SNP") {
        body.report_hex = simulateTampering
          ? "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
          : "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b73b5ee0e02c525f24ec4472d7f8d6899";
      } else {
        body.quote_hex = simulateTampering
          ? "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
          : "b6589fc6ab0dc82cf12099d1c2d40ab994e8410c";
      }

      const res = await fetch("/api/enclave-attestation/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setVerifyResult(data);
      } else {
        setErrorMsg(`Remote attestation failed (HTTP ${res.status}).`);
      }
    } catch {
      setErrorMsg("Remote attestation request failed.");
    } finally {
      setLoading(false);
    }
  };

  const unsealSecret = async () => {
    setUnsealLoading(true);
    setErrorMsg(null);
    try {
      const body: Record<string, any> = {
        platform,
        secret_id: selectedSecret,
      };
      if (platform === "AWS_NITRO") {
        const pcr0 = simulateTampering
          ? "badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad0"
          : "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        body.attestation_doc_b64 = btoa(
          JSON.stringify({
            module_id: "i-09f42d17c88b9e01-enc01",
            pcrs: { "0": pcr0, "1": "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb" },
          })
        );
      } else if (platform === "AMD_SEV_SNP") {
        body.report_hex = simulateTampering
          ? "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
          : "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b73b5ee0e02c525f24ec4472d7f8d6899";
      } else {
        body.quote_hex = simulateTampering ? "deadbeef0000" : "b6589fc6ab0dc82cf12099d1c2d40ab994e8410c";
      }

      const res = await fetch("/api/enclave-attestation/unseal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setUnsealResult(data);
      } else {
        setErrorMsg(`Secret unsealing request failed (HTTP ${res.status}).`);
      }
    } catch {
      setErrorMsg("Secret unsealing request failed.");
    } finally {
      setUnsealLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    setErrorMsg(null);
    if (!navigator?.clipboard?.writeText) {
      setErrorMsg("Clipboard write unavailable in this browser context.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      setErrorMsg("Clipboard write blocked by browser.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-teal-950/40 via-cyan-950/30 to-slate-900 border border-teal-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Confidential Hardware Enclave Remote Attestation
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono border border-teal-500/30">
                Phase 6.1 / Nitro &bull; SEV-SNP &bull; SGX
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Cryptographically verify silicon enclave state, kernel PCR measurements, and hypervisor integrity before unsealing sovereign encryption keys or database credentials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Simulate Tampering:</span>
            <button
              type="button"
              onClick={() => setSimulateTampering(!simulateTampering)}
              className={`px-2 py-0.5 rounded font-bold transition ${
                simulateTampering
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {simulateTampering ? "TAMPERED PCR" : "GENUINE"}
            </button>
          </div>
          <button
            type="button"
            onClick={runVerification}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm transition shadow-lg shadow-teal-600/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {loading ? "Attesting Silicon..." : "Verify Enclave State"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="px-4 py-3 rounded-xl bg-red-950/40 border border-red-700/50 text-xs font-mono text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Platform & PCR Telemetry */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Confidential Silicon Platform
              </span>
              <span className="text-xs text-teal-400 font-mono">Hardware Root of Trust</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "AWS_NITRO", label: "AWS Nitro Enclaves", desc: "COSE Sign1 / PCR0-8" },
                { id: "AMD_SEV_SNP", label: "AMD SEV-SNP", desc: "ECDSA P-384 / VCEK" },
                { id: "INTEL_SGX", label: "Intel SGX / TDX", desc: "DCAP Quote / PCS" },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPlatform(p.id as any)}
                  className={`p-3 rounded-lg text-left transition border ${
                    platform === p.id
                      ? "bg-teal-500/10 border-teal-500/40 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{p.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>

            {/* Platform PCR Measurement Details */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-slate-300 font-mono">
                Golden Reference Integrity Hashes:
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] space-y-2">
                {platform === "AWS_NITRO" && (
                  <>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>PCR0 (Enclave Kernel / Initramfs):</span>
                      <span className="text-teal-300 text-[10px] truncate max-w-[200px]">
                        {goldenMeasurements?.AWS_NITRO?.PCR0 || "e3b0c442...b855"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>PCR1 (Kernel Command Line):</span>
                      <span className="text-teal-300 text-[10px] truncate max-w-[200px]">
                        {goldenMeasurements?.AWS_NITRO?.PCR1 || "ca978112...48bb"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>PCR2 (Application Code Hash):</span>
                      <span className="text-teal-300 text-[10px] truncate max-w-[200px]">
                        {goldenMeasurements?.AWS_NITRO?.PCR2 || "4e1243bd...305f"}
                      </span>
                    </div>
                  </>
                )}
                {platform === "AMD_SEV_SNP" && (
                  <>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Launch Measurement (SHA-384):</span>
                      <span className="text-teal-300 text-[10px] truncate max-w-[200px]">
                        {goldenMeasurements?.AMD_SEV_SNP?.measurement || "6b86b273...6899"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>VCEK Cert Distribution:</span>
                      <span className="text-emerald-400">AMD KDS Signed</span>
                    </div>
                  </>
                )}
                {platform === "INTEL_SGX" && (
                  <>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>MRENCLAVE (Enclave Identity):</span>
                      <span className="text-teal-300 text-[10px]">
                        {goldenMeasurements?.INTEL_SGX?.mrenclave || "b6589fc6...410c"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>MRSIGNER (Author Identity):</span>
                      <span className="text-teal-300 text-[10px]">
                        {goldenMeasurements?.INTEL_SGX?.mrsigner || "d32930f3...3772"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Verification Result Card */}
            {verifyResult && (
              <div
                className={`p-3.5 rounded-xl border space-y-2 font-mono ${
                  verifyResult.valid
                    ? "bg-teal-950/40 border-teal-500/40"
                    : "bg-red-950/40 border-red-500/40"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    {verifyResult.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={verifyResult.valid ? "text-teal-300" : "text-red-300"}>
                      {verifyResult.verification_status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{verifyResult.platform}</span>
                </div>
                {verifyResult.pcr_results && (
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div>
                      PCR0 Integrity:{" "}
                      <span className={verifyResult.pcr_results.pcr0_valid ? "text-teal-400" : "text-red-400 font-bold"}>
                        {verifyResult.pcr_results.pcr0_valid ? "MATCHED GOLDEN PCR" : "TAMPERING REJECTED"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attested Secret Unsealing Vault */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                Attested Sovereign Secret Release
              </span>
              <span className="text-xs text-amber-400 font-mono">Zero-Knowledge Key Release</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Confidential secrets are sealed inside hardware enclaves and will only unseal if remote attestation cryptographically proves zero kernel or memory modifications.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Sovereign Secret</label>
                <select
                  value={selectedSecret}
                  onChange={(e) => setSelectedSecret(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-teal-500 outline-none"
                >
                  <option value="sovereign-vault-master-key">Master Vault Root Key (AES-256-GCM)</option>
                  <option value="fips-hsm-custodian-seed">FIPS HSM Custodian Seed (Shamir Quorum)</option>
                  <option value="customer-pii-column-key">Customer PII Database Column Key</option>
                </select>
              </div>

              <button
                type="button"
                onClick={unsealSecret}
                disabled={unsealLoading}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition shadow-lg shadow-teal-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {unsealLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                {unsealLoading ? "Attesting & Unsealing..." : "Attempt Secret Unsealing"}
              </button>
            </div>

            {unsealResult && (
              <div
                className={`p-4 rounded-xl border space-y-3 font-mono text-xs ${
                  unsealResult.status === "UNSEALED_SUCCESSFULLY"
                    ? "bg-teal-950/40 border-teal-500/40 text-teal-200"
                    : "bg-red-950/40 border-red-500/40 text-red-300"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Status: {unsealResult.status}</span>
                  <span className="text-[10px] text-slate-400">{unsealResult.timestamp}</span>
                </div>

                {unsealResult.status === "UNSEALED_SUCCESSFULLY" ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-950 rounded-lg border border-teal-500/30 flex items-center justify-between">
                      <span className="text-emerald-300 font-bold break-all">
                        {unsealResult.secret_value}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(unsealResult.secret_value)}
                        aria-label="Copy unsealed secret"
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition ml-2"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="text-[10px] text-teal-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Merkle Hash Chain Anchored: Record Hash sealed
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-red-300 leading-relaxed">
                    {unsealResult.reason}
                    <div className="text-[10px] text-slate-400 mt-1">
                      Action: Memory zeroized immediately to prevent unauthorized memory extraction.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

