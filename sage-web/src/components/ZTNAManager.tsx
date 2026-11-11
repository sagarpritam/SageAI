"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Smartphone,
  Lock,
  Network,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export function ZTNAManager() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [context, setContext] = useState({
    is_managed: true,
    disk_encrypted: true,
    edr_active: true,
    mfa_type: "FIDO2_WEBAUTHN",
    has_mtls_cert: true,
    impossible_travel: false,
    tor_proxy: false,
  });

  const [ztnaResult, setZtnaResult] = useState<any>({
    trust_score: 85,
    decision: "ALLOW_FULL_ACCESS",
    enclave_tier: "TIER_1_SOVEREIGN_ENCLAVE",
    signals: [
      "Managed Corporate Device Verified (+15)",
      "Endpoint Full-Disk Encryption Verified (+10)",
      "Hardware FIDO2 / WebAuthn Cryptographic Auth (+25)",
      "mTLS Hardware Client Certificate Validated (+10)",
    ],
  });

  const evaluateTrust = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ztna/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_context: {
            device: {
              is_managed: context.is_managed,
              disk_encrypted: context.disk_encrypted,
              edr_active: context.edr_active,
            },
            auth: {
              user_id: "ciso@enterprise.com",
              mfa_type: context.mfa_type,
              has_mtls_cert: context.has_mtls_cert,
            },
            behavior: {
              impossible_travel_flag: context.impossible_travel,
              tor_exit_node: context.tor_proxy,
            },
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
      if (!res.ok) {
        throw new Error(
          data.error || data.detail || `Trust evaluation failed (HTTP ${res.status})`
        );
      }
      setZtnaResult(data);
    } catch (e: unknown) {
      setErrorMsg(
        e instanceof Error ? e.message : "Failed to evaluate Zero-Trust session posture."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-950/40 via-zinc-950 to-zinc-900 border border-purple-900/40 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Zero-Trust Network Access & Micro-Segmentation
                <span className="text-xs font-mono px-2 py-0.5 bg-purple-950 border border-purple-700/60 rounded text-purple-300">
                  Continuous Trust Scoring
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Contextual session trust scoring, hardware FIDO2 verification, and dynamic Kubernetes Cilium L7 isolation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={evaluateTrust}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Evaluate Trust Score
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-4 bg-rose-950/40 border border-rose-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-rose-300 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-rose-400 hover:text-rose-200 underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Score & Tier Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-black/50 border border-zinc-800 rounded-lg font-mono">
            <div className="text-xs text-zinc-400">Real-Time Trust Score</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{ztnaResult.trust_score} / 100</div>
          </div>
          <div className="p-4 bg-black/50 border border-zinc-800 rounded-lg font-mono">
            <div className="text-xs text-zinc-400">Access Decision</div>
            <div className="text-base font-bold text-white mt-1">{ztnaResult.decision}</div>
          </div>
          <div className="p-4 bg-black/50 border border-zinc-800 rounded-lg font-mono">
            <div className="text-xs text-zinc-400">Enclave Tier Granted</div>
            <div className="text-base font-bold text-purple-300 mt-1">{ztnaResult.enclave_tier}</div>
          </div>
        </div>
      </div>

      {/* Simulator Controls */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-white">Interactive Contextual Posture Toggles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-2 text-zinc-300">
            <input
              type="checkbox"
              checked={context.is_managed}
              onChange={(e) => setContext({ ...context, is_managed: e.target.checked })}
              className="accent-purple-500"
            />
            Managed Corporate Endpoint
          </label>
          <label className="flex items-center gap-2 text-zinc-300">
            <input
              type="checkbox"
              checked={context.disk_encrypted}
              onChange={(e) => setContext({ ...context, disk_encrypted: e.target.checked })}
              className="accent-purple-500"
            />
            Full Disk Encryption (BitLocker/FileVault)
          </label>
          <label className="flex items-center gap-2 text-zinc-300">
            <input
              type="checkbox"
              checked={context.has_mtls_cert}
              onChange={(e) => setContext({ ...context, has_mtls_cert: e.target.checked })}
              className="accent-purple-500"
            />
            Hardware mTLS Client Cert
          </label>
          <label className="flex items-center gap-2 text-rose-400">
            <input
              type="checkbox"
              checked={context.impossible_travel}
              onChange={(e) => setContext({ ...context, impossible_travel: e.target.checked })}
              className="accent-rose-500"
            />
            Trigger Impossible Travel Flag
          </label>
          <label className="flex items-center gap-2 text-rose-400">
            <input
              type="checkbox"
              checked={context.tor_proxy}
              onChange={(e) => setContext({ ...context, tor_proxy: e.target.checked })}
              className="accent-rose-500"
            />
            Trigger Tor Exit Node Ingress
          </label>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
        <h3 className="text-sm font-bold text-white">Trust Evaluation Audit Telemetry</h3>
        <ul className="space-y-1.5 text-xs font-mono">
          {(ztnaResult.signals || []).map((sig: string, idx: number) => (
            <li
              key={idx}
              className={`flex items-center gap-2 ${
                sig.includes("CRITICAL") ? "text-rose-400 font-bold" : "text-emerald-400"
              }`}
            >
              {sig.includes("CRITICAL") ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {sig}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

