"use client";

import React, { useState } from "react";
import {
  Crosshair,
  Play,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Layers,
  Terminal,
  RefreshCw,
  Cpu,
  Flame,
} from "lucide-react";

export function AdversaryEmulationStudio() {
  const [selectedCampaign, setSelectedCampaign] = useState("APT29_COZY_BEAR");
  const [loading, setLoading] = useState(false);
  const [atomicLoading, setAtomicLoading] = useState<string | null>(null);
  const [campaignReport, setCampaignReport] = useState<any>(null);
  const [atomicResult, setAtomicResult] = useState<any>(null);

  const campaigns = [
    { id: "APT29_COZY_BEAR", name: "APT29 (Cozy Bear)", origin: "Russian SVR", desc: "Espionage, identity abuse, stealth C2." },
    { id: "SCATTERED_SPIDER", name: "Scattered Spider", origin: "Cybercrime Syndicate", desc: "Okta identity theft, MFA fatigue, lateral movement." },
    { id: "LOCKBIT_3_RANSOMWARE", name: "LockBit 3.0", origin: "Ransomware Cartel", desc: "LSASS scraping, shadow copy wipe, mass entropy encryption." },
    { id: "VOLT_TYPHOON", name: "Volt Typhoon", origin: "State Actor", desc: "Living-off-the-land, built-in OS tools only." },
  ];

  const atomicTechniques = [
    { id: "T1059.001", name: "PowerShell Script Execution", tactic: "Execution" },
    { id: "T1003.001", name: "LSASS Memory Dumping", tactic: "Credential Access" },
    { id: "T1547.001", name: "Registry Run Key Persistence", tactic: "Persistence" },
    { id: "T1078.004", name: "Cloud Account Abuse", tactic: "Initial Access" },
    { id: "T1021.002", name: "SMB Admin Lateral Share", tactic: "Lateral Movement" },
    { id: "T1486", name: "Data Encrypted for Impact", tactic: "Impact" },
  ];

  const runCampaign = async () => {
    setLoading(true);
    setAtomicResult(null);
    try {
      const res = await fetch("/api/atomic-redteam/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: selectedCampaign,
          target_network: "prod-vpc-us-east-1",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCampaignReport(data.campaign_report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runAtomic = async (techId: string) => {
    setAtomicLoading(techId);
    try {
      const res = await fetch("/api/atomic-redteam/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technique_id: techId,
          target_host: "sandbox-runner-01",
          dry_run: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAtomicResult(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAtomicLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="h-6 w-6 text-red-500 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Autonomous Adversary Emulation & MITRE Caldera Studio
            </h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Empirically evaluate Blue Team telemetry coverage and MTTD across multi-stage APT attack chains in safe zero-egress sandboxes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runCampaign}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-red-950/40 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Launch Campaign Simulation
          </button>
        </div>
      </div>

      {/* Campaign Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {campaigns.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCampaign(c.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedCampaign === c.id
                ? "bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/30"
                : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40">
                {c.origin}
              </span>
              {selectedCampaign === c.id && <Flame className="h-4 w-4 text-red-400" />}
            </div>
            <h4 className="text-sm font-semibold text-white">{c.name}</h4>
            <p className="text-xs text-zinc-400 mt-1">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Campaign Results & Atomic Techniques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Execution Report (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-red-400" />
              Campaign Execution Kill-Chain
            </h3>

            {campaignReport ? (
              <div className="space-y-4">
                {/* Metrics bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-lg">
                    <span className="text-xs text-zinc-400">Blue Team Coverage</span>
                    <p className="text-lg font-bold text-emerald-400">{campaignReport.coverage_percentage}%</p>
                  </div>
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-lg">
                    <span className="text-xs text-zinc-400">Mean Time to Detect</span>
                    <p className="text-lg font-bold text-cyan-400">{campaignReport.mttd_avg_ms} ms</p>
                  </div>
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-lg">
                    <span className="text-xs text-zinc-400">Steps Detected</span>
                    <p className="text-lg font-bold text-zinc-200">
                      {campaignReport.detected_steps} / {campaignReport.total_steps}
                    </p>
                  </div>
                </div>

                {/* Kill chain steps */}
                <div className="space-y-2 mt-4">
                  {campaignReport.tactics_executed.map((t: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-zinc-950/70 border border-zinc-800/60 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                          {t.technique_id}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-white">{t.technique_name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{t.command_executed || "Sandbox Executed"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {t.blue_team_detected ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                            <ShieldCheck className="h-3 w-3" /> Detected ({t.detection_latency_ms}ms)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/40">
                            <ShieldAlert className="h-3 w-3" /> Blindspot
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 text-sm border border-dashed border-zinc-800/80 rounded-lg">
                Click <span className="text-red-400 font-semibold">Launch Campaign Simulation</span> to test full MITRE ATT&CK kill-chain telemetry.
              </div>
            )}
          </div>

          {/* Atomic execution live console */}
          {atomicResult && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-red-400" />
                  Atomic Test Inspector: {atomicResult.technique_id} ({atomicResult.technique_name})
                </span>
                <span className="text-xs text-emerald-400 font-mono">STATUS: {atomicResult.status}</span>
              </div>
              <div className="p-3 bg-zinc-900/90 rounded border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto space-y-1">
                <p className="text-red-400">$ {atomicResult.command_executed}</p>
                <p className="text-zinc-500">Telemetry: {atomicResult.telemetry_observed?.join(", ") || "Sysmon Stream Active"}</p>
                <p className="text-cyan-400">Sigma Rule: {atomicResult.sigma_rule_applied}</p>
              </div>
            </div>
          )}
        </div>

        {/* Atomic Techniques Runner (1 col) */}
        <div className="space-y-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-3">
              <Cpu className="h-4 w-4 text-cyan-400" />
              Atomic Red Team Tests
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Execute individual atomic tests in an isolated sandbox to test specific detection rules.
            </p>

            <div className="space-y-2">
              {atomicTechniques.map((tech) => (
                <div
                  key={tech.id}
                  className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <span className="text-[11px] font-mono text-zinc-400">{tech.id}</span>
                    <p className="text-xs font-medium text-white">{tech.name}</p>
                  </div>
                  <button
                    onClick={() => runAtomic(tech.id)}
                    disabled={atomicLoading === tech.id}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md text-xs transition-colors disabled:opacity-50"
                  >
                    {atomicLoading === tech.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

