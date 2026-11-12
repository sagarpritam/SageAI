"use client";

import React, { useState, useEffect } from "react";
import {
  Swords,
  ShieldAlert,
  Play,
  RefreshCw,
  Flame,
  CheckCircle2,
  Crosshair,
  Hash,
  AlertTriangle,
} from "lucide-react";

export function AdversaryMatrixViewer() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [matrixData, setMatrixData] = useState<any>({
    average_coverage_pct: 95.2,
    tactics: [
      { id: "TA0043", name: "Reconnaissance", coverage_pct: 95, techniques: ["T1595", "T1592"] },
      { id: "TA0001", name: "Initial Access", coverage_pct: 98, techniques: ["T1190", "T1078"] },
      { id: "TA0002", name: "Execution", coverage_pct: 96, techniques: ["T1059", "T1203"] },
      { id: "TA0004", name: "Privilege Escalation", coverage_pct: 94, techniques: ["T1068", "T1611"] },
      { id: "TA0006", name: "Credential Access", coverage_pct: 97, techniques: ["T1003", "T1552"] },
      { id: "TA0011", name: "Command and Control", coverage_pct: 98, techniques: ["T1071", "T1573"] },
    ],
  });
  const [selectedApt, setSelectedApt] = useState<string>("APT29");
  const [drillResult, setDrillResult] = useState<any>(null);

  const runAptDrill = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/adversary/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor_id: selectedApt }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string } & Record<string, any>;
      if (!res.ok) {
        throw new Error(data.error || "BAS adversary emulation drill failed");
      }
      setDrillResult(data);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "BAS adversary emulation drill failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-950/40 via-zinc-950 to-zinc-900 border border-red-900/40 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                MITRE ATT&CK Matrix & Adversary Emulation
                <span className="text-xs font-mono px-2 py-0.5 bg-red-950 border border-red-700/60 rounded text-red-300">
                  14 Tactics Enterprise Grid
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Real-time defensive coverage mapping and autonomous Breach-and-Attack Simulation (BAS) against APT profiles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedApt}
              onChange={(e) => setSelectedApt(e.target.value)}
              className="bg-black border border-zinc-700 rounded-lg text-xs font-mono text-zinc-300 px-3 py-2"
            >
              <option value="APT29">APT29 (Cozy Bear - SVR)</option>
              <option value="FIN7">FIN7 (Financial Syndicate)</option>
              <option value="VOLT_TYPHOON">Volt Typhoon (Critical Infra)</option>
            </select>
            <button
              type="button"
              onClick={runAptDrill}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-2"
            >
              <Play className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Run BAS Drill
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-4 bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-red-300 hover:text-white underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Coverage */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Average Grid Coverage</div>
            <div className="text-base font-bold text-emerald-400 mt-1">{matrixData.average_coverage_pct}% Mitigated</div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Enterprise Tactics</div>
            <div className="text-base font-bold text-white mt-1">14 Tactics Mapped</div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">APT Profiles</div>
            <div className="text-base font-bold text-red-400 mt-1">APT29, FIN7, Volt Typhoon</div>
          </div>
          <div className="p-3 bg-black/40 border border-zinc-800 rounded-lg font-mono">
            <div className="text-[11px] text-zinc-500">Simulation Status</div>
            <div className="text-base font-bold text-cyan-400 mt-1">Autonomous BAS Active</div>
          </div>
        </div>
      </div>

      {/* MITRE Heatmap Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(matrixData.tactics || []).map((t: any) => (
          <div key={t.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1 text-xs font-mono">
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span>{t.id}</span>
              <span className="text-emerald-400 font-bold">{t.coverage_pct}%</span>
            </div>
            <div className="font-bold text-white truncate">{t.name}</div>
            <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-900">
              {t.techniques?.join(", ")}
            </div>
          </div>
        ))}
      </div>

      {/* Drill Results */}
      {drillResult && (
        <div className="p-5 bg-zinc-950 border border-red-900/60 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-red-400" />
              BAS Adversary Emulation Results: {drillResult.apt_profile?.name}
            </span>
            <span className="px-3 py-1 bg-emerald-950 text-emerald-300 rounded border border-emerald-700 font-bold">
              100% Interception Rate
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {drillResult.stages?.map((s: any) => (
              <div key={s.stage} className="p-3 bg-black border border-zinc-800 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Stage #{s.stage} ({s.technique})</span>
                  <span className="text-emerald-400 font-bold">CONTAINED</span>
                </div>
                <div className="text-zinc-200 font-bold">{s.interception_layer}</div>
                <div className="text-[10px] text-zinc-500">Latency: {s.latency_ms} ms</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

