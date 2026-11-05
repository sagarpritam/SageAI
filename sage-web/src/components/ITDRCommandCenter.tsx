"use client";

import React, { useState } from "react";
import {
  UserX,
  Fingerprint,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Lock,
  Zap,
  Globe,
  Radio,
} from "lucide-react";

export function ITDRCommandCenter() {
  const [loading, setLoading] = useState(false);
  const [containLoading, setContainLoading] = useState<string | null>(null);
  const [itdrReport, setItdrReport] = useState<any>(null);
  const [containmentResult, setContainmentResult] = useState<any>(null);

  const fetchTelemetry = async () => {
    setLoading(true);
    setContainmentResult(null);
    try {
      const res = await fetch("/api/itdr/telemetry");
      if (res.ok) {
        const data = await res.json();
        setItdrReport(data.itdr_report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const containUser = async (userEmail: string, action: string) => {
    setContainLoading(userEmail);
    try {
      const res = await fetch("/api/itdr/contain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: userEmail, action }),
      });
      if (res.ok) {
        const data = await res.json();
        setContainmentResult(data.containment_result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setContainLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Identity Threat Detection & Response (ITDR) Command Center
            </h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Detects Impossible Travel, MFA Fatigue push bombing, and Shadow Admin privilege escalations across Okta, Microsoft Entra ID, and AWS IAM.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTelemetry}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-purple-950/40 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Ingest Identity Telemetry
          </button>
        </div>
      </div>

      {itdrReport ? (
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Identity Risk Index</span>
              <p className="text-2xl font-bold text-purple-400">{itdrReport.itdr_risk_index}/100</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Active Threats</span>
              <p className="text-2xl font-bold text-rose-400">{itdrReport.threats_detected}</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Critical Accounts</span>
              <p className="text-2xl font-bold text-red-500">{itdrReport.critical_identity_threats}</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">IdP Ingest Streams</span>
              <p className="text-2xl font-bold text-zinc-200">Okta / Entra / AWS</p>
            </div>
          </div>

          {/* Containment Result Notification */}
          {containmentResult && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Autonomous Identity Containment Enforced</p>
                  <p className="text-xs text-emerald-300">
                    User: {containmentResult.user_affected} | Sessions Revoked: {containmentResult.active_sessions_killed} | FIDO2 Hardware Enforcement: ACTIVE
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300">CONTAINED</span>
            </div>
          )}

          {/* Threats Stream */}
          <div className="space-y-3">
            {itdrReport.threats.map((threat: any, idx: number) => (
              <div key={idx} className="p-5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      {threat.threat_type}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">[{threat.idp}]</span>
                    <span className="text-xs font-semibold text-white">{threat.user_affected}</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/50">
                    {threat.severity}
                  </span>
                </div>

                <p className="text-xs text-zinc-300">{threat.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Playbook: {threat.recommended_action}
                  </div>
                  <button
                    onClick={() => containUser(threat.user_affected, threat.recommended_action)}
                    disabled={containLoading === threat.user_affected}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-all shadow-md disabled:opacity-50"
                  >
                    {containLoading === threat.user_affected ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    Execute Containment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-zinc-500 text-sm border border-dashed border-zinc-800/80 rounded-xl">
          Click <span className="text-purple-400 font-semibold">Ingest Identity Telemetry</span> to analyze Okta, Microsoft Entra, and AWS IAM authentication streams.
        </div>
      )}
    </div>
  );
}
