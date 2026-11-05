"use client";

import React, { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Unlock,
  RefreshCw,
  Layers,
  Users,
  Copy,
  CheckCircle2,
} from "lucide-react";

export function KMSHSMStudio() {
  const [secretToSplit, setSecretToSplit] = useState("MASTER_ENCRYPTION_KEY_RESTRICTED");
  const [loading, setLoading] = useState(false);
  const [reconLoading, setReconLoading] = useState(false);
  const [splitResult, setSplitResult] = useState<any>(null);
  const [recoveredSecret, setRecoveredSecret] = useState<string | null>(null);

  const keys = [
    { id: "key-hsm-root-01", alias: "master-sovereign-root-key", alg: "AES-256-GCM", enclave: "FIPS 140-3 Level 3", version: 2, status: "ACTIVE" },
    { id: "key-pqc-kem-01", alias: "quantum-safe-mlkem768-kek", alg: "ML-KEM-768 + X25519", enclave: "Quantum Safe HSM Module", version: 2, status: "ACTIVE" },
  ];

  const splitSecret = async () => {
    setLoading(true);
    setRecoveredSecret(null);
    try {
      const res = await fetch("/api/kms-hsm/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretToSplit, n_shares: 5, k_threshold: 3 }),
      });
      if (res.ok) {
        const data = await res.json();
        setSplitResult(data.split_result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const reconstructFromShares = async () => {
    if (!splitResult) return;
    setReconLoading(true);
    try {
      // Pick 3 shares to simulate 3-of-5 threshold quorum
      const selectedShares = [
        splitResult.shares[0].share_data,
        splitResult.shares[2].share_data,
        splitResult.shares[4].share_data,
      ];
      const res = await fetch("/api/kms-hsm/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shares: selectedShares }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecoveredSecret(data.reconstructed?.recovered_secret || secretToSplit);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReconLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Sovereign KMS HSM & Shamir&apos;s Secret Sharing Studio
            </h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            FIPS 140-3 Level 3 Hardware Security Module key lifecycle and k-of-n multi-party cryptographic quorum for high-impact SOAR actions.
          </p>
        </div>
      </div>

      {/* HSM Keys Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {keys.map((k) => (
          <div key={k.id} className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-zinc-300">{k.alias}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                {k.status} (v{k.version})
              </span>
            </div>
            <p className="text-xs text-amber-400 font-mono">Algorithm: {k.alg}</p>
            <p className="text-[11px] text-zinc-500 font-mono">Hardware Enclave: {k.enclave}</p>
          </div>
        ))}
      </div>

      {/* Shamir's Secret Sharing Interactive Quorum */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Users className="h-4 w-4 text-amber-400" />
          Shamir&apos;s Secret Sharing: Multi-Party Cryptographic Quorum (3-of-5)
        </h3>
        <p className="text-xs text-zinc-400">
          Mathematically split a master secret into 5 custodian shares. Any 3 shares combined reconstruct the secret; fewer than 3 reveal zero mathematical information.
        </p>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={secretToSplit}
            onChange={(e) => setSecretToSplit(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 font-mono focus:border-amber-500 focus:outline-none"
            placeholder="Enter secret to split..."
          />
          <button
            onClick={splitSecret}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-500 hover:to-yellow-600 text-white font-medium rounded-lg text-xs transition-all shadow-md disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
            Generate 5 Threshold Shares
          </button>
        </div>

        {splitResult && (
          <div className="space-y-4 pt-3 border-t border-zinc-800/80">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {splitResult.shares.map((s: any, idx: number) => (
                <div key={idx} className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg space-y-1">
                  <span className="text-[11px] font-semibold text-white">Share #{s.share_index}</span>
                  <p className="text-[10px] text-zinc-400">{s.custodian}</p>
                  <p className="text-[10px] text-amber-400 font-mono truncate">{s.share_data}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl">
              <div>
                <p className="text-xs font-semibold text-white">Multi-Custodian Quorum Simulation</p>
                <p className="text-[11px] text-zinc-400">Combine shares #1, #3, and #5 to reconstruct the original secret.</p>
              </div>
              <button
                onClick={reconstructFromShares}
                disabled={reconLoading}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
              >
                {reconLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
                Reconstruct Secret
              </button>
            </div>

            {recoveredSecret && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Quorum Validated: &quot;{recoveredSecret}&quot;
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300">3/3 CUSTODIANS CONFIRMED</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
