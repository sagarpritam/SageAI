"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Skull,
  Radio,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  KeyRound,
  Trash2,
  CheckCircle2,
  Globe,
  ExternalLink,
  Lock,
} from "lucide-react";

interface StealerHit {
  user_identity: string;
  botnet_family: string;
  compromised_token_hash: string;
  source_log: string;
  has_active_session_cookie: boolean;
  threat_severity: string;
  detected_at: string;
}

export function DarkWebRadarCenter() {
  const [domain, setDomain] = useState("enterprise.io");
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [hits, setHits] = useState<StealerHit[]>([]);
  const [stats, setStats] = useState({
    totalFlagged: 4,
    highRiskTokens: 3,
    revocationsExecuted: 12,
  });
  const [revocationSuccess, setRevocationSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scanDomain = useCallback(async (targetDomain: string = "enterprise.io") => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/darkweb-radar/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: targetDomain }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to scan darkweb infostealer telemetry");
      }
      setHits(data.compromised_records || []);
      if (data.radar_report) {
        setStats({
          totalFlagged: data.radar_report.compromised_credentials_flagged || 4,
          highRiskTokens: data.radar_report.active_session_tokens_intercepted || 3,
          revocationsExecuted: 12,
        });
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to scan darkweb infostealer telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    scanDomain("enterprise.io");
  }, [scanDomain]);

  const revokeSession = async (userEmail: string, tokenHash: string) => {
    setRevoking(tokenHash);
    setRevocationSuccess(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/darkweb-radar/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_identity: userEmail,
          token_hash: tokenHash,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to revoke IdP session tokens");
      }
      setRevocationSuccess(`Session tokens for ${userEmail} revoked across Okta, Google Workspace, and Azure AD.`);
      setHits((prev) =>
        prev.map((h) =>
          h.compromised_token_hash === tokenHash
            ? { ...h, has_active_session_cookie: false, threat_severity: "REVOKED_NEUTRALIZED" }
            : h
        )
      );
      setStats((prev) => ({
        ...prev,
        highRiskTokens: Math.max(0, prev.highRiskTokens - 1),
        revocationsExecuted: prev.revocationsExecuted + 1,
      }));
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to revoke IdP session tokens");
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-purple-950/30 to-slate-900 border border-red-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            <Skull className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Dark Web & Infostealer Intelligence Radar
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono border border-red-500/30">
                Lumma / RedLine / Vidar / Raccoon
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Continuous reconnaissance of infostealer botnet C2 logs, leaked session cookies, and compromised employee credentials with 1-click IdP session invalidation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-red-500 outline-none"
            placeholder="Domain (e.g. enterprise.io)"
          />
          <button
            type="button"
            onClick={() => scanDomain(domain)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition shadow-lg shadow-red-600/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Scanning C2 Logs..." : "Scan Stealer Dumps"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-950/40 border border-red-700/60 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-red-300 hover:text-white underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-xs font-mono text-slate-400">Credentials Intercepted</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.totalFlagged}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across 4 major stealer botnets</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-xs font-mono text-slate-400">Live Active Session Cookies</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">{stats.highRiskTokens}</div>
          <div className="text-[10px] text-red-400 mt-0.5">Bypasses MFA if not revoked</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-xs font-mono text-slate-400">Instant IdP Revocations</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{stats.revocationsExecuted}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Okta / Google / Azure AD invalidated</div>
        </div>
      </div>

      {revocationSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{revocationSuccess}</span>
        </div>
      )}

      {/* Table of Compromised Credentials */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Compromised Identities & Ingestion Feed
          </span>
          <span className="text-xs text-red-400 font-mono">Real-time C2 Telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Identity / Employee</th>
                <th className="py-2.5 px-3">Botnet Variant</th>
                <th className="py-2.5 px-3">Token Fingerprint</th>
                <th className="py-2.5 px-3">Cookie Hijack Risk</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {hits.map((hit, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 text-slate-200 font-semibold">{hit.user_identity}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {hit.botnet_family}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{hit.compromised_token_hash}</td>
                  <td className="py-3 px-3">
                    {hit.has_active_session_cookie ? (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold animate-pulse">
                        ACTIVE SESSION
                      </span>
                    ) : (
                      <span className="text-slate-500">EXPIRED / REVOKED</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold ${
                        hit.threat_severity.includes("CRITICAL")
                          ? "text-red-400"
                          : hit.threat_severity.includes("HIGH")
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {hit.threat_severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {hit.has_active_session_cookie ? (
                      <button
                        type="button"
                        onClick={() => revokeSession(hit.user_identity, hit.compromised_token_hash)}
                        disabled={revoking === hit.compromised_token_hash}
                        className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-white font-medium text-[11px] transition disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        {revoking === hit.compromised_token_hash ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <KeyRound className="w-3 h-3" />
                        )}
                        Revoke All IdP Sessions
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-[11px] flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Neutralized
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

