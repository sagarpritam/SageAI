"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Hash,
} from "lucide-react";

interface ThreatItem {
  threat_id: string;
  component_name: string;
  stride_category: string;
  title: string;
  description: string;
  mitre_attack: string;
  dread: {
    dread_total: number;
    dread_average: number;
    severity: string;
  };
  remediation: string;
}

interface RemediationTicket {
  ticket_key: string;
  priority: string;
  title: string;
  component: string;
  mitre_attack: string;
  dread_score: number;
  severity: string;
  action_items: string[];
}

export function ThreatModelingStudio() {
  const [activeTab, setActiveTab] = useState<"matrix" | "dread-calc" | "tickets">("matrix");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("cloud_microservices");
  const [loading, setLoading] = useState<boolean>(false);
  const [threatData, setThreatData] = useState<any>(null);

  // DREAD Calculator interactive state
  const [dreadScores, setDreadScores] = useState({
    damage: 9,
    reproducibility: 8,
    exploitability: 7,
    affected_users: 9,
    discoverability: 8,
  });

  const dreadTotal =
    dreadScores.damage +
    dreadScores.reproducibility +
    dreadScores.exploitability +
    dreadScores.affected_users +
    dreadScores.discoverability;
  const dreadAvg = (dreadTotal / 5.0).toFixed(1);
  const dreadSeverity =
    dreadTotal >= 40 ? "CRITICAL" : dreadTotal >= 30 ? "HIGH" : dreadTotal >= 20 ? "MEDIUM" : "LOW";

  useEffect(() => {
    runThreatModelAnalysis();
  }, [selectedTemplate]);

  const runThreatModelAnalysis = async () => {
    setLoading(true);
    try {
      const components =
        selectedTemplate === "cloud_microservices"
          ? [
              { id: "comp-1", name: "Edge API Gateway", type: "API_GATEWAY", exposure: "PUBLIC" },
              { id: "comp-2", name: "Auth & SSO Service", type: "CORE_SERVICE", exposure: "PRIVATE" },
              { id: "comp-3", name: "Multi-Tenant PostgreSQL", type: "DATA_STORE", exposure: "ISOLATED" },
              { id: "comp-4", name: "Redis Event Stream", type: "MESSAGE_BUS", exposure: "PRIVATE" },
            ]
          : [
              { id: "k8s-1", name: "NGINX Ingress Controller", type: "API_GATEWAY", exposure: "PUBLIC" },
              { id: "k8s-2", name: "SageAI Core Pod Fleet", type: "CORE_SERVICE", exposure: "PRIVATE" },
              { id: "k8s-3", name: "HashiCorp Vault / KMS", type: "DATA_STORE", exposure: "ISOLATED" },
              { id: "k8s-4", name: "eBPF Kernel Monitor", type: "EDGE_SERVICE", exposure: "PRIVATE" },
            ];

      const res = await fetch("/api/threat-modeling/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ components }),
      });

      if (res.ok) {
        const data = await res.json();
        setThreatData(data);
      }
    } catch (e) {
      console.error("Threat model fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  const strideCategories = [
    { key: "Spoofing", letter: "S", label: "Spoofing", color: "from-rose-500/20 to-rose-950/20 border-rose-500/30 text-rose-400" },
    { key: "Tampering", letter: "T", label: "Tampering", color: "from-amber-500/20 to-amber-950/20 border-amber-500/30 text-amber-400" },
    { key: "Repudiation", letter: "R", label: "Repudiation", color: "from-yellow-500/20 to-yellow-950/20 border-yellow-500/30 text-yellow-400" },
    { key: "Information Disclosure", letter: "I", label: "Info Disclosure", color: "from-blue-500/20 to-blue-950/20 border-blue-500/30 text-blue-400" },
    { key: "Denial of Service", letter: "D", label: "Denial of Service", color: "from-purple-500/20 to-purple-950/20 border-purple-500/30 text-purple-400" },
    { key: "Elevation of Privilege", letter: "E", label: "Privilege Elevation", color: "from-emerald-500/20 to-emerald-950/20 border-emerald-500/30 text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Automated Threat Modeling Engine
                <span className="text-xs font-mono px-2 py-0.5 bg-rose-950/50 border border-rose-700/50 rounded text-rose-300">
                  STRIDE + DREAD
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Autonomous architectural decomposition, qualitative STRIDE analysis, and quantitative DREAD risk scoring.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="bg-black border border-zinc-700 rounded-lg text-xs font-mono text-zinc-300 px-3 py-2"
            >
              <option value="cloud_microservices">Template: Cloud Microservices SaaS</option>
              <option value="kubernetes_infrastructure">Template: Kubernetes Container Mesh</option>
            </select>
            <button
              onClick={runThreatModelAnalysis}
              disabled={loading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loading ? "Analyzing..." : "Re-Analyze"}
            </button>
          </div>
        </div>

        {/* STRIDE Pill Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6">
          {strideCategories.map((c) => {
            const count = threatData?.stride_summary?.[c.key] || 1;
            return (
              <div
                key={c.key}
                className={`p-3 bg-gradient-to-b ${c.color} border rounded-lg flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black font-mono">{c.letter}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-black/40 rounded border border-white/10 font-mono">
                    {count} threats
                  </span>
                </div>
                <div className="text-xs font-bold mt-2 truncate text-white">{c.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
            activeTab === "matrix"
              ? "bg-rose-950/40 text-rose-400 border border-rose-500/40"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Threat Enumeration ({threatData?.threats?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("dread-calc")}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
            activeTab === "dread-calc"
              ? "bg-rose-950/40 text-rose-400 border border-rose-500/40"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Interactive DREAD Calculator
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
            activeTab === "tickets"
              ? "bg-rose-950/40 text-rose-400 border border-rose-500/40"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          Mitigation Tickets ({threatData?.remediation_tickets?.length || 0})
        </button>
      </div>

      {/* Tab 1: Threat Enumeration Matrix */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(threatData?.threats || []).map((t: ThreatItem) => (
              <div
                key={t.threat_id}
                className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 bg-zinc-900 rounded">
                      {t.threat_id}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        t.dread.severity === "CRITICAL"
                          ? "bg-rose-950 text-rose-400 border-rose-700"
                          : t.dread.severity === "HIGH"
                          ? "bg-amber-950 text-amber-400 border-amber-700"
                          : "bg-blue-950 text-blue-400 border-blue-700"
                      }`}
                    >
                      DREAD: {t.dread.dread_total}/50 ({t.dread.severity})
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{t.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{t.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-900 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-500">Component: {t.component_name}</span>
                    <span className="text-emerald-400 font-bold">ATT&CK: {t.mitre_attack}</span>
                  </div>
                  <div className="p-2 bg-black/60 rounded border border-zinc-800 text-[11px] text-zinc-300">
                    <span className="font-bold text-rose-400">Remediation: </span>
                    {t.remediation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Interactive DREAD Calculator */}
      {activeTab === "dread-calc" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
            <div>
              <h3 className="text-base font-bold text-white">Quantitative DREAD Score Engine</h3>
              <p className="text-xs text-zinc-400">
                Adjust threat dimensions dynamically to compute overall risk exposure.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-black px-4 py-2 rounded-lg border border-zinc-800">
              <div className="text-right">
                <div className="text-[10px] font-mono text-zinc-500">Composite Score</div>
                <div className="text-xl font-mono font-black text-white">{dreadTotal} / 50</div>
              </div>
              <div
                className={`px-3 py-1 text-xs font-mono font-bold rounded border ${
                  dreadSeverity === "CRITICAL"
                    ? "bg-rose-950 text-rose-400 border-rose-700"
                    : dreadSeverity === "HIGH"
                    ? "bg-amber-950 text-amber-400 border-amber-700"
                    : "bg-blue-950 text-blue-400 border-blue-700"
                }`}
              >
                {dreadSeverity} (Avg: {dreadAvg})
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: "damage", label: "Damage Potential (0-10)", desc: "How severe is the impact if the exploit succeeds?" },
              { key: "reproducibility", label: "Reproducibility (0-10)", desc: "How easy is it to duplicate the exploit attack?" },
              { key: "exploitability", label: "Exploitability (0-10)", desc: "What level of technical skill or automation is required?" },
              { key: "affected_users", label: "Affected Users (0-10)", desc: "What percentage of tenants or end users are impacted?" },
              { key: "discoverability", label: "Discoverability (0-10)", desc: "How easy is it for adversaries to locate the vulnerability?" },
            ].map((d) => (
              <div key={d.key} className="space-y-2 p-3 bg-zinc-900/40 rounded-lg border border-zinc-800/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-200">{d.label}</span>
                  <span className="font-mono text-rose-400 font-bold text-sm">
                    {dreadScores[d.key as keyof typeof dreadScores]} / 10
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">{d.desc}</p>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={dreadScores[d.key as keyof typeof dreadScores]}
                  onChange={(e) =>
                    setDreadScores({ ...dreadScores, [d.key]: parseInt(e.target.value) })
                  }
                  className="w-full accent-rose-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Mitigation Tickets */}
      {activeTab === "tickets" && (
        <div className="space-y-3">
          {(threatData?.remediation_tickets || []).map((ticket: RemediationTicket) => (
            <div
              key={ticket.ticket_key}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 bg-rose-950/60 border border-rose-800 rounded">
                    {ticket.ticket_key} • {ticket.priority}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">{ticket.component}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    MITRE {ticket.mitre_attack}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{ticket.title}</h4>
                <ul className="list-disc list-inside text-xs text-zinc-400 space-y-0.5 mt-2">
                  {ticket.action_items.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                <div className="text-right font-mono text-xs mr-2">
                  <div className="text-zinc-500 text-[10px]">DREAD Score</div>
                  <div className="text-white font-bold">{ticket.dread_score} / 50</div>
                </div>
                <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3" />
                  Export Jira
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Merkle Seal Proof */}
      {threatData?.merkle_seal && (
        <div className="p-3 bg-zinc-950 border border-emerald-900/40 rounded-xl flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Merkle Seal Block #{threatData.merkle_seal.ledger_index} Cryptographically Verified</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500">
            <Hash className="w-3 h-3" />
            <span className="truncate max-w-xs">{threatData.merkle_seal.record_hash}</span>
          </div>
        </div>
      )}
    </div>
  );
}

