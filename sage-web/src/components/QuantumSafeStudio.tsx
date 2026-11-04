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
  const [activeTab, setActiveTab] = useState<"keygen" | "encrypt" | "hndl-scan">("keygen");
  const [loading, setLoading] = useState<boolean>(false);
  const [keypair, setKeypair] = useState<any>({
    algorithm: "Hybrid X25519 + ML-KEM-768",
    classical_public_key: "o9s4X5A7H1qE0jZ8pB3vM6uW2xY4rT7sP1nK8vC5bE4=",
    classical_private_key: "m1K7vB4nQ8xZ0pW3sR9uY2tT6vE5rM8bX1jP4oA7H0=",
    ml_kem_public_key: "k9Lm4P0qW7vB2xY8rT5sN1pK8vC4bE7m1K9vB3nQ7xZ0=",
    public_key_fingerprint: "a7f4e910c2834b91",
    security_level: "Post-Quantum 256-bit Hybrid",
  });

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

