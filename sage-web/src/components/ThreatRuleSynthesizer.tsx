"use client";

import { useState, useEffect } from "react";
import {
  FileCode2,
  ShieldAlert,
  Terminal,
  Copy,
  Check,
  Download,
  ScrollText,
  Layers,
  Flame,
  Globe,
  ShieldCheck,
  Sparkles,
  Play,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";

interface PreloadedTemplate {
  cve_id: string;
  title: string;
  description: string;
  severity: string;
  vendor?: string;
  product?: string;
}

interface SynthesizedRules {
  cve_id: string;
  title: string;
  severity: string;
  yara_rule: string;
  sigma_rule: string;
  nuclei_template: string;
  waf_patch: {
    cve_id: string;
    modsecurity_rule: string;
    cloudflare_rule: string;
    aws_waf_regex: string;
  };
  saved_paths?: {
    yara: string;
    sigma: string;
    nuclei: string;
  };
}

export function ThreatRuleSynthesizer() {
  const [templates, setTemplates] = useState<PreloadedTemplate[]>([]);
  const [selectedCve, setSelectedCve] = useState<string>("CVE-2024-21887");
  const [customCve, setCustomCve] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"yara" | "sigma" | "nuclei" | "waf">("yara");
  const [rules, setRules] = useState<SynthesizedRules | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get("/api/rules/templates");
      if (res.data?.templates) {
        setTemplates(res.data.templates);
      }
    } catch {
      // Fallback
    }
  };

  const loadRulesForCve = async (cveId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/rules/cve/${encodeURIComponent(cveId)}`);
      if (res.data?.rules) {
        setRules(res.data.rules);
      } else {
        setError("Failed to load synthesized rules for this threat.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to synthesize rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    loadRulesForCve("CVE-2024-21887");
  }, []);

  const handleSelectTemplate = (cveId: string) => {
    setSelectedCve(cveId);
    setCustomCve("");
    loadRulesForCve(cveId);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCve.trim()) {
      setSelectedCve(customCve.trim().toUpperCase());
      loadRulesForCve(customCve.trim().toUpperCase());
    }
  };

  const getActiveCode = () => {
    if (!rules) return "";
    switch (activeTab) {
      case "yara":
        return rules.yara_rule;
      case "sigma":
        return rules.sigma_rule;
      case "nuclei":
        return rules.nuclei_template;
      case "waf":
        return `${rules.waf_patch.modsecurity_rule}\n\n# Cloudflare WAF Expression:\n${rules.waf_patch.cloudflare_rule}\n\n# AWS WAF Regex Pattern:\n${rules.waf_patch.aws_waf_regex}`;
      default:
        return "";
    }
  };

  const handleCopy = async () => {
    const code = getActiveCode();
    if (!code) return;
    if (!navigator?.clipboard?.writeText) {
      setError("Clipboard unavailable in this browser context. Download the rule file instead.");
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard write blocked by browser. Download the rule file instead.");
    }
  };

  const handleDownload = () => {
    const code = getActiveCode();
    if (!code || !rules) return;

    let extension = "txt";
    if (activeTab === "yara") extension = "yar";
    else if (activeTab === "sigma" || activeTab === "nuclei") extension = "yml";
    else if (activeTab === "waf") extension = "conf";

    const filename = `${rules.cve_id.toLowerCase().replace(/[^a-z0-9_]/g, "_")}_${activeTab}.${extension}`;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-zinc-900/60 to-black border border-blue-900/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ScrollText className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white tracking-tight">
              Autonomous Threat Pattern &amp; Rule Synthesizer
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Pillar IV: Automatically compiles emerging CVEs and zero-day threat intelligence into verified, machine-executable defense artifacts — YARA endpoint signatures, Sigma SIEM rules, Nuclei active scanning templates, and WAF Virtual Patches.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-black/60 px-3 py-1.5 rounded-lg border border-zinc-800">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Rule Engine: ACTIVE</span>
        </div>
      </div>

      {/* CVE Selector & Input */}
      <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono block mb-2">
            Select Trending Threat or Enter Target CVE
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {templates.map((tpl) => {
              const isSelected = selectedCve === tpl.cve_id;
              return (
                <button
                  type="button"
                  key={tpl.cve_id}
                  onClick={() => handleSelectTemplate(tpl.cve_id)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? "bg-blue-950/40 border-blue-500/60 text-white shadow-lg shadow-blue-950/20"
                      : "bg-zinc-950/60 border-zinc-800/80 text-zinc-500 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-blue-400">{tpl.cve_id}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900/40">
                      {tpl.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs font-bold line-clamp-1">{tpl.title}</div>
                  <div className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                    {tpl.vendor} · {tpl.product}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom CVE Input Form */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2 pt-2 border-t border-zinc-900">
          <input
            type="text"
            value={customCve}
            onChange={(e) => setCustomCve(e.target.value)}
            placeholder="Or type custom CVE (e.g. CVE-2024-38063, CVE-2023-46805)..."
            className="flex-1 bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Forge Rules</span>
          </button>
        </form>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Synthesized Output Arena */}
      {rules && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header Bar with Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-400">{rules.cve_id}</span>
                <span className="text-xs font-bold text-white">— {rules.title}</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                Compiled into 4 Defense Formats (Memory, SIEM, DAST, WAF)
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 text-xs hover:border-zinc-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-900/50 bg-blue-950/40 text-blue-400 text-xs hover:bg-blue-900/50 transition font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Rule</span>
              </button>
            </div>
          </div>

          {/* Format Tabs */}
          <div className="flex gap-2 border-b border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab("yara")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 ${
                activeTab === "yara"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>YARA Signature (.yar)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sigma")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 ${
                activeTab === "sigma"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Sigma SIEM Rule (.yml)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("nuclei")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 ${
                activeTab === "nuclei"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Nuclei DAST Template (.yml)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("waf")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 ${
                activeTab === "waf"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>WAF Virtual Patch (.conf)</span>
            </button>
          </div>

          {/* Syntax Code Editor Container */}
          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2 relative">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pb-2 border-b border-zinc-900">
              <span>Format: {activeTab.toUpperCase()}</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Syntax Validated
              </span>
            </div>
            <pre className="text-xs font-mono text-zinc-300 bg-zinc-950/80 p-4 rounded-lg overflow-x-auto border border-zinc-900 leading-relaxed max-h-[480px]">
              {getActiveCode()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

