"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  ShieldAlert,
  Cloud,
  KeyRound,
  Layers,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Terminal,
  Code2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";

interface AttackVector {
  id: string;
  name: string;
  description: string;
  mitre_attack: string;
  owasp_category: string;
  cwe: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

interface DeepFinding {
  id: string;
  vector_category: string;
  type: string;
  severity: string;
  confidence: string;
  cve_id?: string;
  mitre_attack?: string;
  owasp_category?: string;
  target_url: string;
  description: string;
  remediation: string;
  evidence_proof?: string;
}

interface DeepAuditResult {
  agent: string;
  target: string;
  status: string;
  findings_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  findings: DeepFinding[];
  vectors_evaluated: string[];
}

export function DeepAnalysisPanel() {
  const [target, setTarget] = useState("api.enterprise.internal");
  const [codeSnippet, setCodeSnippet] = useState(
    `# Example: Cloud SSRF and Token Exfiltration endpoint\n@app.get("/api/proxy")\ndef fetch_user_avatar(url: str):\n    # Unrestricted URL fetch into internal AWS IMDS\n    resp = requests.get(url)\n    return resp.text`
  );
  const [showCode, setShowCode] = useState(true);
  const [selectedVectors, setSelectedVectors] = useState<string[]>([
    "cloud_imds_ssrf",
    "oauth_jwt_auth",
    "cache_smuggling",
    "llm_top10",
    "concurrency_toctou",
  ]);
  const [vectorsList, setVectorsList] = useState<AttackVector[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeepAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVectors();
  }, []);

  const fetchVectors = async () => {
    try {
      const res = await axios.get("/api/deep-analysis/vectors");
      if (res.data?.vectors) {
        setVectorsList(res.data.vectors);
      }
    } catch {
      // Fallback local vectors if API not yet populated
      setVectorsList([
        {
          id: "cloud_imds_ssrf",
          name: "Cloud IMDSv1/v2 SSRF",
          description: "AWS IMDSv1/v2 bypass, GCP compute metadata, Azure instance, K8s tokens",
          mitre_attack: "T1552.005",
          owasp_category: "OWASP-A10:2021",
          cwe: "CWE-918",
          severity: "CRITICAL",
        },
        {
          id: "oauth_jwt_auth",
          name: "OAuth & JWT Confusion",
          description: "Redirect URI path traversal, wildcard bypasses, alg:none, RS256/HS256 confusion",
          mitre_attack: "T1078",
          owasp_category: "OWASP-A07:2021",
          cwe: "CWE-345",
          severity: "CRITICAL",
        },
        {
          id: "cache_smuggling",
          name: "Cache Poisoning & Smuggling",
          description: "CL.TE/TE.CL desynchronization, unkeyed X-Forwarded-Host, Web Cache Deception",
          mitre_attack: "T1190",
          owasp_category: "OWASP-A05:2021",
          cwe: "CWE-444",
          severity: "HIGH",
        },
        {
          id: "llm_top10",
          name: "OWASP LLM Top 10",
          description: "Prompt injection overrides, system prompt leakage, Markdown image data exfil",
          mitre_attack: "T1059",
          owasp_category: "OWASP-LLM01",
          cwe: "CWE-1384",
          severity: "CRITICAL",
        },
        {
          id: "concurrency_toctou",
          name: "Concurrency & TOCTOU Races",
          description: "Parallel burst double-spend probe, check-then-act balance lock deficiency",
          mitre_attack: "T1499",
          owasp_category: "OWASP-A04:2021",
          cwe: "CWE-367",
          severity: "HIGH",
        },
      ]);
    }
  };

  const toggleVector = (id: string) => {
    if (selectedVectors.includes(id)) {
      if (selectedVectors.length > 1) {
        setSelectedVectors(selectedVectors.filter((v) => v !== id));
      }
    } else {
      setSelectedVectors([...selectedVectors, id]);
    }
  };

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post("/api/deep-analysis/audit", {
        target,
        vectors: selectedVectors,
        code_snippet: showCode ? codeSnippet : undefined,
      });

      if (res.data?.audit) {
        setResult(res.data.audit);
      } else {
        setError("Invalid response format received from audit agent.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to execute deep attack audit");
    } finally {
      setLoading(false);
    }
  };

  const getVectorIcon = (id: string) => {
    switch (id) {
      case "cloud_imds_ssrf":
        return Cloud;
      case "oauth_jwt_auth":
        return KeyRound;
      case "cache_smuggling":
        return Layers;
      case "llm_top10":
        return Cpu;
      case "concurrency_toctou":
        return Zap;
      default:
        return Flame;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-900/60 to-black border border-red-900/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Flame className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white tracking-tight">
              Deep Emerging Attack Vector Auditor
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Pillar II: Autonomous deep attack auditor targeting non-traditional surfaces — Cloud IMDSv1/v2 SSRF, OAuth &amp; JWT confusion, CDN Cache Poisoning, OWASP LLM Top 10, and Concurrency/TOCTOU race hazards.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-black/60 px-3 py-1.5 rounded-lg border border-zinc-800">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>5 Vector Suites Active</span>
        </div>
      </div>

      {/* Vector Selector Chips */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono block">
          Select Emerging Attack Vectors to Audit
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {vectorsList.map((vec) => {
            const Icon = getVectorIcon(vec.id);
            const isSelected = selectedVectors.includes(vec.id);
            return (
              <button
                key={vec.id}
                onClick={() => toggleVector(vec.id)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? "bg-red-950/30 border-red-500/50 text-white shadow-lg shadow-red-950/20"
                    : "bg-zinc-950/60 border-zinc-800/80 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? "text-red-400" : "text-zinc-600"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      vec.severity === "CRITICAL"
                        ? "bg-red-950/60 text-red-400 border border-red-900/40"
                        : "bg-amber-950/60 text-amber-400 border border-amber-900/40"
                    }`}
                  >
                    {vec.severity}
                  </span>
                </div>
                <div className="text-xs font-bold leading-snug line-clamp-1">{vec.name}</div>
                <div className="text-[10px] text-zinc-400 font-mono mt-1">{vec.cwe}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target & Source Input Controls */}
      <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-4">
        <div>
          <label className="text-xs text-zinc-400 block mb-1 font-mono">
            Target Hostname, URL, or Endpoint
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. api.internal.enterprise or https://cloud.gateway"
              className="flex-1 bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500 font-mono"
            />
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 text-xs hover:border-zinc-700 transition"
            >
              <Code2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>{showCode ? "Hide Source" : "Attach Source Code"}</span>
            </button>
          </div>
        </div>

        {showCode && (
          <div>
            <label className="text-xs text-zinc-400 block mb-1 font-mono">
              Source Code / API Snippet (For Deterministic AST Taint Flow Verification)
            </label>
            <textarea
              rows={4}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full bg-black/70 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>
        )}

        <button
          onClick={runAudit}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/30"
        >
          {loading ? (
            <>
              <Flame className="w-4 h-4 animate-spin" />
              <span>Auditing Next-Gen Attack Vectors...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Execute Deep Emerging Threat Audit</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Output Results */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                Total Findings
              </span>
              <span className="text-xl font-black text-white font-mono">
                {result.findings_count}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/40">
              <span className="text-[10px] text-red-400 uppercase font-mono block">
                Critical Severity
              </span>
              <span className="text-xl font-black text-red-400 font-mono">
                {result.critical_count}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/40">
              <span className="text-[10px] text-amber-400 uppercase font-mono block">
                High Severity
              </span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {result.high_count}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">
                Vectors Audited
              </span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {result.vectors_evaluated.length}
              </span>
            </div>
          </div>

          {/* Finding Cards */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400 font-mono">
              Identified Threat Findings ({result.findings.length})
            </h3>

            {result.findings.length === 0 ? (
              <div className="p-8 rounded-xl bg-zinc-950/40 border border-zinc-800/80 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs text-zinc-300 font-bold">
                  Zero Emerging Threat Vectors Detected
                </p>
                <p className="text-[11px] text-zinc-500">
                  Target endpoints responded securely with no signs of IMDS SSRF, OAuth flaws, Cache Deception, or TOCTOU races.
                </p>
              </div>
            ) : (
              result.findings.map((f, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3 hover:border-zinc-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                          f.severity.toLowerCase() === "critical"
                            ? "bg-red-950/80 text-red-400 border border-red-800/50"
                            : "bg-amber-950/80 text-amber-400 border border-amber-800/50"
                        }`}
                      >
                        {f.severity.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-white">{f.type}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                      {f.cve_id && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                          {f.cve_id}
                        </span>
                      )}
                      {f.mitre_attack && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-purple-400">
                          {f.mitre_attack}
                        </span>
                      )}
                      {f.owasp_category && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-blue-400">
                          {f.owasp_category}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{f.description}</p>

                  {f.evidence_proof && (
                    <div className="p-2.5 rounded-lg bg-black/80 border border-zinc-900 text-[11px] font-mono text-emerald-400 space-y-1">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        Technical Evidence &amp; Proof:
                      </div>
                      <div className="break-all">{f.evidence_proof}</div>
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/30 text-xs text-zinc-400 space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-blue-400 block">
                      Remediation Guidance:
                    </span>
                    <p className="text-[11px] text-zinc-300">{f.remediation}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
