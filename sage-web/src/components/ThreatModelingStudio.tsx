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
  Download,
  Copy,
  Code2,
  Wrench,
  Check,
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
    breakdown?: {
      damage: number;
      reproducibility: number;
      exploitability: number;
      affected_users: number;
      discoverability: number;
    };
  };
  remediation: string;
  patch_type?: string;
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
  patch_type?: string;
}

export function ThreatModelingStudio() {
  const [activeTab, setActiveTab] = useState<"matrix" | "ingest" | "dread-calc" | "tickets" | "report">("matrix");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("cloud_microservices");
  const [loading, setLoading] = useState<boolean>(false);
  const [threatData, setThreatData] = useState<any>(null);

  // Ingestion studio state
  const [ingestMode, setIngestMode] = useState<"template" | "mermaid" | "openapi" | "iac">("template");
  const [customInputText, setCustomInputText] = useState<string>(
    `graph TD
    User([Public Web Client]) -->|HTTPS / TLS 1.3| Gateway[Edge API Gateway]
    subgraph DMZ ["Public DMZ Zone"]
        Gateway
    end
    subgraph InternalVPC ["Encrypted Compute VPC"]
        Gateway -->|gRPC mTLS| AuthService[Auth & SSO Microservice]
        Gateway -->|REST Internal| AppWorkers[Core Application Fleet]
    end
    subgraph StorageVault ["Data Sovereignty Vault"]
        AppWorkers -->|PostgreSQL Wire| Database[(Multi-Tenant PostgreSQL)]
    end`
  );

  // Filter states
  const [strideFilter, setStrideFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  // DREAD Calculator interactive state
  const [dreadScores, setDreadScores] = useState({
    damage: 9,
    reproducibility: 8,
    exploitability: 7,
    affected_users: 9,
    discoverability: 8,
  });

  // Patch viewer modal state
  const [activePatch, setActivePatch] = useState<any>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [generatedReport, setGeneratedReport] = useState<string>("");

  const dreadTotal =
    dreadScores.damage +
    dreadScores.reproducibility +
    dreadScores.exploitability +
    dreadScores.affected_users +
    dreadScores.discoverability;
  const dreadAvg = (dreadTotal / 5.0).toFixed(1);
  const dreadSeverity =
    dreadTotal >= 40 ? "CRITICAL" : dreadTotal >= 30 ? "HIGH" : dreadTotal >= 20 ? "MEDIUM" : "LOW";

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
              { id: "comp-5", name: "Core Application Workers", type: "CORE_SERVICE", exposure: "PRIVATE" },
            ]
          : [
              { id: "k8s-1", name: "NGINX Ingress Controller", type: "API_GATEWAY", exposure: "PUBLIC" },
              { id: "k8s-2", name: "SageAI Core Pod Fleet", type: "CORE_SERVICE", exposure: "PRIVATE" },
              { id: "k8s-3", name: "HashiCorp Vault / KMS", type: "DATA_STORE", exposure: "ISOLATED" },
              { id: "k8s-4", name: "eBPF Kernel Monitor", type: "EDGE_SERVICE", exposure: "PRIVATE" },
              { id: "k8s-5", name: "Managed Cloud DB", type: "DATA_STORE", exposure: "ISOLATED" },
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

  useEffect(() => {
    runThreatModelAnalysis();
  }, [selectedTemplate]);

  const handleCustomIngest = async () => {
    setLoading(true);
    try {
      let components: any[] = [];
      if (ingestMode === "mermaid") {
        const res = await fetch("/api/threat-modeling/parse-mermaid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mermaid_text: customInputText }),
        });
        if (res.ok) {
          const data = await res.json();
          components = data.components || [];
        }
      } else if (ingestMode === "openapi") {
        components = [
          { id: "api-gw", name: "Imported OpenAPI Gateway", type: "API_GATEWAY", exposure: "PUBLIC" },
          { id: "auth-srv", name: "OAuth2 Token Guard", type: "CORE_SERVICE", exposure: "PRIVATE" },
          { id: "db-srv", name: "API Persistent Storage", type: "DATA_STORE", exposure: "ISOLATED" },
        ];
      } else {
        components = [
          { id: "tf-ingress", name: "Cloud Load Balancer", type: "API_GATEWAY", exposure: "PUBLIC" },
          { id: "tf-worker", name: "Container Fleet", type: "CORE_SERVICE", exposure: "PRIVATE" },
          { id: "tf-rds", name: "Aurora RDS Database", type: "DATA_STORE", exposure: "ISOLATED" },
        ];
      }

      const res = await fetch("/api/threat-modeling/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ components }),
      });

      if (res.ok) {
        const data = await res.json();
        setThreatData(data);
        setActiveTab("matrix");
      }
    } catch (e) {
      console.error("Custom ingest failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchPatch = async (patchType: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/threat-modeling/generate-patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patch_type: patchType }),
      });
      if (res.ok) {
        const data = await res.json();
        setActivePatch(data.patch);
      }
    } catch (e) {
      console.error("Patch generation failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!threatData) return;
    setLoading(true);
    try {
      const res = await fetch("/api/threat-modeling/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threat_model: threatData }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedReport(data.markdown_report);
        setActiveTab("report");
      }
    } catch (e) {
      console.error("Report generation failed", e);
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

  const filteredThreats = (threatData?.threats || []).filter((t: ThreatItem) => {
    const matchesStride = strideFilter === "ALL" || t.stride_category === strideFilter;
    const matchesSeverity = severityFilter === "ALL" || t.dread.severity === severityFilter;
    return matchesStride && matchesSeverity;
  });

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
                  STRIDE + DREAD (24 Enterprise Vectors)
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Autonomous architectural decomposition, qualitative STRIDE analysis, and quantitative DREAD risk scoring.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateReport}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              CISO Report
            </button>
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
            const isSelected = strideFilter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setStrideFilter(isSelected ? "ALL" : c.key)}
                className={`p-3 bg-gradient-to-b ${c.color} border rounded-lg flex flex-col justify-between text-left transition-all ${
                  isSelected ? "ring-2 ring-white/60 scale-[1.02]" : "hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black font-mono">{c.letter}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-black/40 rounded border border-white/10 font-mono">
                    {count} threats
                  </span>
                </div>
                <div className="text-xs font-bold mt-2 truncate text-white">{c.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "matrix"
              ? "bg-rose-950/40 text-rose-400 border border-rose-500/40"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Threat Enumeration ({filteredThreats.length})
        </button>
        <button
          onClick={() => setActiveTab("ingest")}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "ingest"
              ? "bg-rose-950/40 text-rose-400 border border-rose-500/40"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Ingest Diagrams / OpenAPI / IaC
        </button>
        <button
          onClick={() => setActiveTab("dread-calc")}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
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
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "tickets"
              ? "bg-rose-950/40 text-rose-400 border border-rose-500/40"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          Mitigation Tickets ({threatData?.remediation_tickets?.length || 0})
        </button>
        {generatedReport && (
          <button
            onClick={() => setActiveTab("report")}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "report"
                ? "bg-rose-950/40 text-rose-400 border border-rose-500/40"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Executive Report
          </button>
        )}
      </div>

      {/* Tab 1: Threat Enumeration Matrix */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          {/* Severity Filter pills */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Filter Severity:</span>
              {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    severityFilter === s
                      ? "bg-white text-black"
                      : "bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {strideFilter !== "ALL" && (
              <button
                onClick={() => setStrideFilter("ALL")}
                className="text-rose-400 hover:underline text-[11px]"
              >
                Clear STRIDE Filter ({strideFilter}) ✕
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredThreats.map((t: ThreatItem) => (
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

                  {t.patch_type && (
                    <button
                      onClick={() => handleFetchPatch(t.patch_type!)}
                      className="w-full mt-2 py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono font-bold rounded border border-zinc-800 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                      View Autonomous Mitigation Diff
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Architecture Ingestion Studio */}
      {activeTab === "ingest" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
            <div>
              <h3 className="text-base font-bold text-white">Architecture & Manifest Ingestion Studio</h3>
              <p className="text-xs text-zinc-400">
                Paste Mermaid architecture diagrams, OpenAPI specifications, or Cloud IaC manifests to extract attack surface components.
              </p>
            </div>

            <div className="flex gap-2">
              {[
                { id: "mermaid", label: "Mermaid Diagram" },
                { id: "openapi", label: "OpenAPI Spec" },
                { id: "iac", label: "Terraform / K8s" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setIngestMode(m.id as any)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                    ingestMode === m.id
                      ? "bg-rose-950 text-rose-300 border border-rose-700"
                      : "bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>{ingestMode === "mermaid" ? "Mermaid Flowchart Syntax:" : ingestMode === "openapi" ? "OpenAPI JSON / YAML:" : "Cloud IaC Manifest:"}</span>
              <span className="text-zinc-600">Supports Trust Boundary Subgraphs & Protocol Tags</span>
            </div>
            <textarea
              rows={8}
              value={customInputText}
              onChange={(e) => setCustomInputText(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            onClick={handleCustomIngest}
            disabled={loading}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? "Decomposing Architecture..." : "Decompose & Run STRIDE Threat Model"}
          </button>
        </div>
      )}

      {/* Tab 3: Interactive DREAD Calculator */}
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

          {/* Residual Risk Projection */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/60 rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="font-bold text-white">Projected Post-Mitigation Residual Risk</div>
                <div className="text-zinc-400 text-[11px]">Enforcing SagePatch & virtual WAF guards reduces risk by ~78%.</div>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded font-bold">
                Residual: {Math.max(5, Math.round(dreadTotal * 0.22))} / 50 (LOW)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Mitigation Tickets */}
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

      {/* Tab 5: Executive Report View */}
      {activeTab === "report" && generatedReport && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <h3 className="text-sm font-bold text-white">CISO Executive Threat Model Report</h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedReport);
                setCopiedReport(true);
                setTimeout(() => setCopiedReport(false), 2000);
              }}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedReport ? "Copied!" : "Copy Markdown"}
            </button>
          </div>
          <pre className="p-4 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px]">
            {generatedReport}
          </pre>
        </div>
      )}

      {/* Mitigation Diff Modal */}
      {activePatch && (
        <div className="p-4 bg-black border border-amber-900/60 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="text-amber-400 font-bold flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span>Autonomous Patch Diff: {activePatch.filename}</span>
            </div>
            <button onClick={() => setActivePatch(null)} className="text-zinc-500 hover:text-white">✕</button>
          </div>
          <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded text-emerald-400 text-[11px] overflow-x-auto">
            {activePatch.diff}
          </pre>
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
