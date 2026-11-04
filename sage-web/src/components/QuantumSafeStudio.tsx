"use client";

import React, { useState } from "react";
import {
  Cpu,
  Key,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Hash,
  Activity,
  Layers,
} from "lucide-react";

export function QuantumSafeStudio() {
  const [activeTab, setActiveTab] = useState<"keygen" | "encrypt" | "dsa-signing" | "zero-egress-seal" | "hndl-scan">("keygen");
  const [loading, setLoading] = useState<boolean>(false);
  const [keypair, setKeypair] = useState<any>({
    algorithm: "Hybrid X25519 + ML-KEM-768",
    classical_public_key: "o9s4X5A7H1qE0jZ8pB3vM6uW2xY4rT7sP1nK8vC5bE4=",
    classical_private_key: "m1K7vB4nQ8xZ0pW3sR9uY2tT6vE5rM8bX1jP4oA7H0=",
    ml_kem_public_key: "k9Lm4P0qW7vB2xY8rT5sN1pK8vC4bE7m1K9vB3nQ7xZ0=",
    public_key_fingerprint: "a7f4e910c2834b91",
    security_level: "Post-Quantum 256-bit Hybrid",
  });

  // Signing keypair state (Ed25519 + ML-DSA-65)
  const [signingKeys, setSigningKeys] = useState<any>({
    algorithm: "Hybrid Ed25519 + ML-DSA-65",
    classical_public_key: "k9s4X5A7H1qE0jZ8pB3vM6uW2xY4rT7sP1nK8vC5bE4=",
    classical_private_key: "r1K7vB4nQ8xZ0pW3sR9uY2tT6vE5rM8bX1jP4oA7H0=",
    ml_dsa_public_key: "d9Lm4P0qW7vB2xY8rT5sN1pK8vC4bE7m1K9vB3nQ7xZ0=",
    ml_dsa_private_key: "p9Lm4P0qW7vB2xY8rT5sN1pK8vC4bE7m1K9vB3nQ7xZ0=",
    public_key_fingerprint: "e8b2c4f19034da77",
    security_level: "Post-Quantum 256-bit Hybrid Digital Signature",
  });

  // Signature state
  const [signMessage, setSignMessage] = useState<string>("Sovereign Enclave Directive: Authorize inter-enclave sync without plaintext exposure.");
  const [signatureResult, setSignatureResult] = useState<any>(null);
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);

  // Zero-Egress PQC Payload Sealer state
  const [targetRegion, setTargetRegion] = useState<string>("eu-central-1");
  const [zeroEgressPlaintext, setZeroEgressPlaintext] = useState<string>(
    "SOVEREIGN_TRANSACTION_ID=TX-998271\nAWS_KEY=AKIAIOSFODNN7EXAMPLE\nDATABASE_URI=postgres://sec_admin:AlphaSecret99@prod-db.internal:5432/core\nPATIENT_EMAIL=patient-records@health-enclave.eu"
  );
  const [sealedEnvelope, setSealedEnvelope] = useState<any>(null);
  const [unsealResult, setUnsealResult] = useState<any>(null);
  const [unsealRegion, setUnsealRegion] = useState<string>("eu-central-1");
  const [unsealError, setUnsealError] = useState<string | null>(null);

  // Encryption Studio state
  const [plaintext, setPlaintext] = useState<string>(
    "TOP_SECRET_CORE_DATABASE_CREDENTIALS=postgres://ciso_admin:UltraSecretQuantumPW99!@db.prod.internal:5432/main"
  );
  const [envelope, setEnvelope] = useState<any>(null);
  const [decryptedText, setDecryptedText] = useState<string>("");

  // HNDL Scanner state
  const [scanResult, setScanResult] = useState<any>(null);

  const generateKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pqc/generate-keys", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setKeypair(data.keypair);
      }
    } catch (e) {
      console.error("Key generation failed", e);
    } finally {
      setLoading(false);
    }
  };

  const encryptPayload = async () => {
    if (!keypair) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pqc/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plaintext,
          classical_public_key: keypair.classical_public_key,
          ml_kem_public_key: keypair.ml_kem_public_key,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEnvelope(data.envelope);
        setDecryptedText("");
      }
    } catch (e) {
      console.error("PQC encrypt failed", e);
    } finally {
      setLoading(false);
    }
  };

  const decryptPayload = async () => {
    if (!envelope || !keypair) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pqc/decrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          envelope,
          classical_private_key: keypair.classical_private_key,
          ml_kem_public_key: keypair.ml_kem_public_key,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDecryptedText(data.plaintext);
      }
    } catch (e) {
      console.error("PQC decrypt failed", e);
    } finally {
      setLoading(false);
    }
  };

  const generateSigningKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pqc/generate-signing-keys", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSigningKeys(data.keypair);
      }
    } catch (e) {
      console.error("Signing key generation failed", e);
    } finally {
      setLoading(false);
    }
  };

  const signPayload = async () => {
    if (!signingKeys) return;
    setLoading(true);
    setVerifyStatus(null);
    try {
      const res = await fetch("/api/pqc/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: signMessage,
          classical_private_key: signingKeys.classical_private_key,
          ml_dsa_private_key: signingKeys.ml_dsa_private_key,
          ml_dsa_public_key: signingKeys.ml_dsa_public_key,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSignatureResult(data.signature);
      }
    } catch (e) {
      console.error("Hybrid sign failed", e);
    } finally {
      setLoading(false);
    }
  };

  const verifySignature = async () => {
    if (!signatureResult || !signingKeys) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pqc/verify-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: signMessage,
          hybrid_signature: signatureResult,
          classical_public_key: signingKeys.classical_public_key,
          ml_dsa_public_key: signingKeys.ml_dsa_public_key,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setVerifyStatus(data.valid ? "VALID" : "INVALID");
      }
    } catch (e) {
      console.error("Signature verify failed", e);
      setVerifyStatus("ERROR");
    } finally {
      setLoading(false);
    }
  };

  const sealZeroEgressPayload = async () => {
    if (!keypair || !signingKeys) return;
    setLoading(true);
    setUnsealResult(null);
    setUnsealError(null);
    try {
      const res = await fetch("/api/pqc/zero-egress/seal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plaintext: zeroEgressPlaintext,
          destination_region: targetRegion,
          sender_classical_signing_priv: signingKeys.classical_private_key,
          sender_ml_dsa_priv: signingKeys.ml_dsa_private_key,
          sender_ml_dsa_pub: signingKeys.ml_dsa_public_key,
          recipient_classical_pub: keypair.classical_public_key,
          recipient_ml_kem_pub: keypair.ml_kem_public_key,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSealedEnvelope(data.sealed_envelope);
        setUnsealRegion(targetRegion);
      }
    } catch (e) {
      console.error("Seal zero-egress failed", e);
    } finally {
      setLoading(false);
    }
  };

  const unsealZeroEgressPayload = async () => {
    if (!sealedEnvelope || !keypair || !signingKeys) return;
    setLoading(true);
    setUnsealError(null);
    setUnsealResult(null);
    try {
      const res = await fetch("/api/pqc/zero-egress/unseal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pqc_envelope: sealedEnvelope,
          recipient_classical_priv: keypair.classical_private_key,
          recipient_ml_kem_pub: keypair.ml_kem_public_key,
          sender_classical_pub: signingKeys.classical_public_key,
          sender_ml_dsa_pub: signingKeys.ml_dsa_public_key,
          current_region: unsealRegion,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUnsealResult(data.unsealed_result);
      } else {
        const err = await res.json();
        setUnsealError(err.detail || "Unseal rejected: cross-region policy violation or invalid signature");
      }
    } catch (e) {
      console.error("Unseal zero-egress failed", e);
      setUnsealError("Decryption or verification failed");
    } finally {
      setLoading(false);
    }
  };

  const runHNDLScan = async () => {
    setLoading(true);
    try {
      const ciphersuites = [
        "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
        "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
        "TLS_AES_256_GCM_SHA384",
        "X25519Kyber768Draft00_AES256_GCM",
      ];
      const res = await fetch("/api/pqc/risk-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ciphersuites }),
      });
      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
      }
    } catch (e) {
      console.error("PQC risk scan failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-950/40 via-zinc-950 to-zinc-900 border border-violet-900/40 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg text-violet-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Post-Quantum Cryptography (PQC) Migration Layer
                <span className="text-xs font-mono px-2 py-0.5 bg-violet-950 border border-violet-700/60 rounded text-violet-300">
                  NIST FIPS 203 & 204
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Hybrid classical-quantum key encapsulation (ML-KEM-768 + X25519) and Harvest-Now-Decrypt-Later defense.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="px-3 py-1.5 bg-black border border-zinc-800 rounded-lg text-zinc-400">
              CNSA 2.0 Mandate: <span className="text-amber-400 font-bold">2030 Deadline</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          <div className="p-3 bg-black/40 border border-zinc-800/80 rounded-lg">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-violet-400" />
              NIST FIPS 203 ML-KEM-768
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Lattice-based Module Learning with Errors (M-LWE) key encapsulation mechanism.
            </p>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800/80 rounded-lg">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Dual-Layer Hybrid KDF
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Combines Classical X25519 + ML-KEM via HKDF-SHA256. Resilient to CRQCs and classical attacks.
            </p>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800/80 rounded-lg">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              HNDL Defense Grid
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Prevents nation-state adversaries from harvesting encrypted traffic today for future decryption.
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("keygen")}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
            activeTab === "keygen"
              ? "bg-violet-950/40 text-violet-400 border border-violet-500/40"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Hybrid Key Generator
        </button>
        <button
          onClick={() => setActiveTab("encrypt")}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
            activeTab === "encrypt"
              ? "bg-violet-950/40 text-violet-400 border border-violet-500/40"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Quantum Envelope Encryption
        </button>
        <button
          onClick={() => setActiveTab("dsa-signing")}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
            activeTab === "dsa-signing"
              ? "bg-violet-950/40 text-violet-400 border border-violet-500/40"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Dilithium (ML-DSA) Signatures
        </button>
        <button
          onClick={() => setActiveTab("zero-egress-seal")}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
            activeTab === "zero-egress-seal"
              ? "bg-violet-950/40 text-violet-400 border border-violet-500/40"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Zero-Egress PQC Sealer
        </button>
        <button
          onClick={() => {
            setActiveTab("hndl-scan");
            if (!scanResult) runHNDLScan();
          }}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
            activeTab === "hndl-scan"
              ? "bg-violet-950/40 text-violet-400 border border-violet-500/40"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          HNDL Quantum Risk Scanner
        </button>
      </div>

      {/* Tab 1: Hybrid Keypair Generator */}
      {activeTab === "keygen" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div>
              <h3 className="text-sm font-bold text-white">Active Post-Quantum Hybrid Keypair</h3>
              <p className="text-xs text-zinc-400">
                X25519 (Classical 256-bit ECDH) + ML-KEM-768 (Lattice 1184-byte Public Key).
              </p>
            </div>
            <button
              onClick={generateKeys}
              disabled={loading}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Generate New Hybrid Keypair
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3 bg-black/60 border border-zinc-800 rounded-lg space-y-2">
              <div className="text-zinc-400 font-bold flex items-center justify-between">
                <span>Classical Public Key (X25519)</span>
                <span className="text-[10px] text-zinc-600">32 bytes</span>
              </div>
              <div className="text-violet-300 break-all text-[11px] p-2 bg-zinc-900/60 rounded">
                {keypair.classical_public_key}
              </div>
            </div>

            <div className="p-3 bg-black/60 border border-zinc-800 rounded-lg space-y-2">
              <div className="text-zinc-400 font-bold flex items-center justify-between">
                <span>Post-Quantum Public Key (ML-KEM-768)</span>
                <span className="text-[10px] text-zinc-600">1184 bytes</span>
              </div>
              <div className="text-violet-300 break-all text-[11px] p-2 bg-zinc-900/60 rounded">
                {keypair.ml_kem_public_key}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-lg text-xs font-mono text-zinc-400">
            <span>Public Key Fingerprint: <span className="text-white font-bold">{keypair.public_key_fingerprint}</span></span>
            <span className="text-emerald-400 font-bold">Standard: NIST FIPS 203 Level 3</span>
          </div>
        </div>
      )}

      {/* Tab 2: Quantum Envelope Encryption Studio */}
      {activeTab === "encrypt" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white">Quantum-Safe Payload Encryption</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Payload is encrypted with an ephemeral AES-256-GCM symmetric key derived from ML-KEM-768 encapsulation.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300">Plaintext Data / Secrets:</label>
            <textarea
              rows={3}
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={encryptPayload}
              disabled={loading}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              Encrypt with Hybrid ML-KEM
            </button>
            {envelope && (
              <button
                onClick={decryptPayload}
                disabled={loading}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
              >
                <Unlock className="w-3.5 h-3.5" />
                Decapsulate & Decrypt
              </button>
            )}
          </div>

          {envelope && (
            <div className="space-y-3 pt-3 border-t border-zinc-900 font-mono text-xs">
              <div className="text-zinc-300 font-bold">Encrypted Quantum-Safe Envelope:</div>
              <div className="p-3 bg-black border border-zinc-800 rounded-lg space-y-1 text-[11px] text-zinc-400">
                <div><span className="text-violet-400 font-bold">Algorithm: </span>{envelope.algorithm}</div>
                <div><span className="text-violet-400 font-bold">ML-KEM Ciphertext: </span>{envelope.ml_kem_ciphertext.slice(0, 48)}...</div>
                <div><span className="text-violet-400 font-bold">AES Ciphertext: </span>{envelope.ciphertext.slice(0, 48)}...</div>
                <div><span className="text-emerald-400 font-bold">Guarantee: </span>{envelope.quantum_guarantee}</div>
              </div>
            </div>
          )}

          {decryptedText && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-800 rounded-lg text-xs font-mono space-y-1">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Decrypted Plaintext Verified:
              </div>
              <div className="text-white break-all">{decryptedText}</div>
            </div>
          )}
        </div>
      )}

      {/* Tab: NIST ML-DSA-65 (Dilithium-3) Hybrid Signatures */}
      {activeTab === "dsa-signing" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                NIST FIPS 204 ML-DSA-65 (Dilithium-3) + Ed25519 Signatures
                <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-950 text-violet-300 border border-violet-800 rounded">
                  Dual Lattice + Classical
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Lattice-based digital signatures providing unforgeable authenticity resilient against both classical and quantum computing attacks.
              </p>
            </div>
            <button
              onClick={generateSigningKeys}
              disabled={loading}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Rotate ML-DSA Signing Keys
            </button>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 bg-black/60 border border-zinc-800 rounded-lg space-y-2">
              <div className="text-violet-400 font-bold flex items-center justify-between">
                <span>Ed25519 Classical Public Key (RFC 8032)</span>
                <span className="text-[10px] text-zinc-500">32 bytes</span>
              </div>
              <div className="p-2 bg-zinc-900/80 rounded text-zinc-300 break-all select-all text-[11px]">
                {signingKeys?.classical_public_key}
              </div>
            </div>
            <div className="p-4 bg-black/60 border border-zinc-800 rounded-lg space-y-2">
              <div className="text-violet-400 font-bold flex items-center justify-between">
                <span>ML-DSA-65 Lattice Public Key (FIPS 204)</span>
                <span className="text-[10px] text-zinc-500">1952 bytes</span>
              </div>
              <div className="p-2 bg-zinc-900/80 rounded text-zinc-300 break-all select-all text-[11px]">
                {signingKeys?.ml_dsa_public_key.slice(0, 80)}...
              </div>
            </div>
          </div>

          {/* Message to Sign */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300">Message or Enclave Directive to Digitally Sign:</label>
            <textarea
              rows={3}
              value={signMessage}
              onChange={(e) => setSignMessage(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={signPayload}
              disabled={loading || !signMessage}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sign with Hybrid Ed25519 + ML-DSA-65
            </button>
            {signatureResult && (
              <button
                onClick={verifySignature}
                disabled={loading}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verify Signatures
              </button>
            )}
          </div>

          {signatureResult && (
            <div className="p-4 bg-black border border-zinc-800 rounded-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-300 font-bold border-b border-zinc-900 pb-2">
                <span>Dual Hybrid Cryptographic Signature</span>
                <span className="text-[11px] text-violet-400 font-normal">
                  Fingerprint: {signatureResult.signature_fingerprint}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="space-y-1">
                  <span className="text-zinc-500">Ed25519 Signature (64 bytes):</span>
                  <div className="p-2 bg-zinc-900/60 rounded text-zinc-400 break-all">{signatureResult.classical_signature}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-500">ML-DSA-65 Lattice Signature (3309 bytes):</span>
                  <div className="p-2 bg-zinc-900/60 rounded text-zinc-400 break-all">{signatureResult.ml_dsa_signature.slice(0, 100)}...</div>
                </div>
              </div>
              {verifyStatus && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 font-bold ${
                    verifyStatus === "VALID"
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800"
                      : "bg-rose-950/40 text-rose-400 border border-rose-800"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {verifyStatus === "VALID"
                      ? "Cryptographic Verification Passed: Ed25519 and NIST FIPS 204 ML-DSA-65 signatures are valid and untampered."
                      : "Signature Verification Rejected: Payload modified or keys do not match."}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Zero-Egress PQC Payload Sealer */}
      {activeTab === "zero-egress-seal" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Sovereign Zero-Egress Post-Quantum Payload Sealer
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                  Kyber-768 + Dilithium-3 + AES-GCM
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Combines zero-egress credential sanitization, Kyber (ML-KEM) encapsulation, and Dilithium (ML-DSA) digital signature binding to guarantee regional sovereign isolation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-400 font-mono">Destination Enclave:</label>
              <select
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                className="bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-violet-500"
              >
                <option value="eu-central-1">eu-central-1 (EU GDPR / BSI C5)</option>
                <option value="us-east-1">us-east-1 (FedRAMP High / NIST SP 800-53)</option>
                <option value="ap-southeast-1">ap-southeast-1 (Singapore PDPA / MAS TRM)</option>
              </select>
            </div>
          </div>

          {/* Sensitive Payload Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300">Raw Sensitive Enclave Data (Contains secrets/PII):</label>
              <span className="text-[10px] text-amber-400 font-mono">Auto-sanitized before encryption</span>
            </div>
            <textarea
              rows={4}
              value={zeroEgressPlaintext}
              onChange={(e) => setZeroEgressPlaintext(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={sealZeroEgressPayload}
              disabled={loading || !zeroEgressPlaintext}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-violet-950/30"
            >
              <Lock className="w-3.5 h-3.5" />
              Seal Quantum-Safe Zero-Egress Payload
            </button>
          </div>

          {/* Sealed Result */}
          {sealedEnvelope && (
            <div className="space-y-4 pt-4 border-t border-zinc-900 font-mono text-xs">
              <div className="p-4 bg-black/80 border border-violet-900/40 rounded-xl space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-white font-bold">Payload Sealed for Enclave:</span>
                    <span className="px-2 py-0.5 bg-violet-950 text-violet-300 rounded border border-violet-800">
                      {sealedEnvelope.region}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Sealed at: {new Date(sealedEnvelope.sealed_at).toLocaleTimeString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-3 bg-zinc-900/50 rounded-lg space-y-1">
                    <span className="text-zinc-500 font-bold">1. Zero-Egress Sanitization</span>
                    <div className="text-emerald-400 font-bold">{sealedEnvelope.sanitization_summary.tokens_replaced} tokens replaced</div>
                    <div className="text-zinc-400">Leakage risk: {sealedEnvelope.sanitization_summary.leakage_risk_after}</div>
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-lg space-y-1">
                    <span className="text-zinc-500 font-bold">2. NIST ML-KEM-768 (Kyber)</span>
                    <div className="text-violet-400 truncate">{sealedEnvelope.kem_envelope.ml_kem_ciphertext.slice(0, 24)}...</div>
                    <div className="text-zinc-400">Hybrid X25519 KDF</div>
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-lg space-y-1">
                    <span className="text-zinc-500 font-bold">3. NIST ML-DSA-65 (Dilithium)</span>
                    <div className="text-blue-400 truncate">Fingerprint: {sealedEnvelope.hybrid_signature.signature_fingerprint}</div>
                    <div className="text-zinc-400">Unforgeable Digital Seal</div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1 text-[11px] text-zinc-400">
                  <div><span className="text-violet-400 font-bold">Ciphertext: </span>{sealedEnvelope.ciphertext.slice(0, 64)}...</div>
                  <div><span className="text-violet-400 font-bold">AAD Regional Binding: </span>{sealedEnvelope.associated_data}</div>
                  <div><span className="text-emerald-400 font-bold">Merkle Seal Block: </span>#{sealedEnvelope.merkle_seal.ledger_index} ({sealedEnvelope.merkle_seal.record_hash.slice(0, 24)}...)</div>
                </div>

                {/* Enclave Unseal Tester */}
                <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg space-y-3 mt-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <span className="text-white font-bold">Enclave Boundary Unseal Verification:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 text-[11px]">Executing Region:</span>
                      <select
                        value={unsealRegion}
                        onChange={(e) => setUnsealRegion(e.target.value)}
                        className="bg-black border border-zinc-700 rounded px-2 py-1 text-xs text-white font-mono"
                      >
                        <option value="eu-central-1">eu-central-1 (Matching Enclave)</option>
                        <option value="us-east-1">us-east-1 (Foreign Region - Cross-Egress Test)</option>
                        <option value="ap-southeast-1">ap-southeast-1 (Foreign Region - Cross-Egress Test)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={unsealZeroEgressPayload}
                      disabled={loading}
                      className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                    >
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      Verify Signature & Decrypt in Enclave
                    </button>
                    {unsealRegion !== sealedEnvelope.region && (
                      <span className="text-amber-400 text-[11px]">
                        ⚠️ Cross-region unseal should be rejected by sovereign enclave policy.
                      </span>
                    )}
                  </div>

                  {unsealError && (
                    <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{unsealError}</span>
                    </div>
                  )}

                  {unsealResult && (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-800 rounded-lg space-y-2">
                      <div className="text-emerald-400 font-bold flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Enclave Unseal & Dilithium Signature Verification Succeeded!</span>
                      </div>
                      <div className="text-zinc-400 text-[11px]">
                        Sanitized Plaintext (zero credential leakage):
                      </div>
                      <div className="p-2 bg-black rounded text-zinc-200 text-xs break-all whitespace-pre-wrap">
                        {unsealResult.decrypted_plaintext}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: HNDL Risk Scanner */}
      {activeTab === "hndl-scan" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div>
              <h3 className="text-sm font-bold text-white">Harvest-Now-Decrypt-Later (HNDL) Vulnerability Audit</h3>
              <p className="text-xs text-zinc-400">
                Identifies legacy public-key algorithms vulnerable to Shor's algorithm on quantum computers.
              </p>
            </div>
            <button
              onClick={runHNDLScan}
              disabled={loading}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Re-Scan Ciphersuites
            </button>
          </div>

          <div className="space-y-3">
            {(scanResult?.ciphersuites || []).map((cs: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-black/60 border border-zinc-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{cs.ciphersuite}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        cs.risk_level === "CRITICAL"
                          ? "bg-rose-950 text-rose-400 border-rose-700"
                          : cs.risk_level === "MEDIUM"
                          ? "bg-amber-950 text-amber-400 border-amber-700"
                          : "bg-emerald-950 text-emerald-400 border-emerald-700"
                      }`}
                    >
                      {cs.risk_level === "CRITICAL" ? "CRITICAL HNDL RISK" : cs.risk_level === "NONE" ? "QUANTUM SAFE" : "CLASSICAL OK"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">{cs.threat_vector}</p>
                </div>

                <div className="text-[11px] font-mono text-violet-300 md:text-right max-w-sm">
                  <span className="text-zinc-500">Action: </span>
                  {cs.migration_action}
                </div>
              </div>
            ))}
          </div>

          {scanResult?.merkle_seal && (
            <div className="p-3 bg-black border border-emerald-900/40 rounded-xl flex items-center justify-between text-xs font-mono text-zinc-400 mt-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Merkle Seal Block #{scanResult.merkle_seal.ledger_index} Cryptographically Verified</span>
              </div>
              <div className="text-zinc-500 text-[10px] truncate max-w-xs">{scanResult.merkle_seal.record_hash}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

