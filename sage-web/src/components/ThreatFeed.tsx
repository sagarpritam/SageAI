"use client";

import { useState, useEffect } from "react";
import { Rss, ExternalLink, Loader2, AlertTriangle, Shield, Info, ScrollText, Copy, Check, ChevronDown, ChevronUp, FileCode } from "lucide-react";
import axios from "axios";

interface ThreatItem {
  id: string;
  title: string;
  severity: string;
  source: string;
  published: string;
  url: string;
}

const sevColors: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-emerald-600 text-white",
};

const sevIcons: Record<string, typeof Shield> = {
  critical: AlertTriangle,
  high: AlertTriangle,
  medium: Info,
  low: Shield,
};

export function ThreatFeed() {
  const [items, setItems] = useState<ThreatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expandedThreatId, setExpandedThreatId] = useState<string | null>(null);
  const [synthesizingId, setSynthesizingId] = useState<string | null>(null);
  const [ruleBundles, setRuleBundles] = useState<Record<string, any>>({});
  const [activeRuleTabs, setActiveRuleTabs] = useState<Record<string, "yara" | "sigma" | "nuclei" | "waf">>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleForgeRules = async (item: ThreatItem) => {
    if (expandedThreatId === item.id) {
      setExpandedThreatId(null);
      return;
    }
    setExpandedThreatId(item.id);

    if (ruleBundles[item.id]) return;

    setSynthesizingId(item.id);
    try {
      let res = await axios.get(`/api/rules/cve/${encodeURIComponent(item.id)}`).catch(() => null);
      if (res?.data?.bundle) {
        setRuleBundles((prev) => ({ ...prev, [item.id]: res.data.bundle }));
      } else {
        const synthRes = await axios.post("/api/rules/synthesize", {
          cve_id: item.id,
          title: item.title,
          severity: item.severity?.toLowerCase() || "high",
        });
        if (synthRes?.data?.bundle) {
          setRuleBundles((prev) => ({ ...prev, [item.id]: synthRes.data.bundle }));
        }
      }
    } catch (e) {
      console.error("Rule synthesis error:", e);
    } finally {
      setSynthesizingId(null);
    }
  };

  const copyRuleCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => {
    axios
      .get("/api/threat-feed")
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.severity === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Rss className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Threat Intelligence Feed</h3>
          <span className="text-xs text-zinc-500 font-mono">({filtered.length} items)</span>
        </div>
        <div className="flex gap-1.5">
          {["all", "critical", "high", "medium"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ${
                filter === f
                  ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/50"
                  : "bg-zinc-800/50 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-8 text-center">
          <Shield className="w-8 h-8 text-emerald-400/30 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No threats matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const sev = item.severity?.toLowerCase() || "low";
            const Icon = sevIcons[sev] || Info;
            return (
            <div key={item.id} className="space-y-1">
              <div className="flex items-start gap-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-emerald-900/40 transition-colors">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 mt-0.5 ${sevColors[sev] || "bg-zinc-700 text-white"}`}>
                  <Icon className="w-3 h-3" /> {item.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                    <span className="font-mono">{item.id}</span>
                    <span>•</span>
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{new Date(item.published).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleForgeRules(item)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-emerald-400 border border-zinc-700/60 transition-all"
                  >
                    <ScrollText className="w-3.5 h-3.5 text-emerald-400" />
                    Forge Rules
                    {expandedThreatId === item.id ? (
                      <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                    )}
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-zinc-800/40 text-zinc-500 hover:text-emerald-400 transition-colors shrink-0 border border-zinc-800"
                    aria-label={`View ${item.id}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Expandable Synthesized Rule Drawer */}
              {expandedThreatId === item.id && (
                <div className="mt-2 p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Autonomous Defense Rules: {item.id}
                      </span>
                    </div>

                    {ruleBundles[item.id] && (
                      <div className="flex gap-1">
                        {(["yara", "sigma", "nuclei", "waf"] as const).map((rTab) => (
                          <button
                            key={rTab}
                            onClick={() =>
                              setActiveRuleTabs((prev) => ({ ...prev, [item.id]: rTab }))
                            }
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase transition-all ${
                              (activeRuleTabs[item.id] || "yara") === rTab
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {rTab}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {synthesizingId === item.id ? (
                    <div className="flex items-center justify-center py-6 text-xs text-zinc-400 font-mono gap-2">
                      <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                      Synthesizing YARA, Sigma, Nuclei & Virtual WAF rules...
                    </div>
                  ) : ruleBundles[item.id] ? (
                    <div className="space-y-2">
                      {(() => {
                        const curTab = activeRuleTabs[item.id] || "yara";
                        const bundle = ruleBundles[item.id];
                        let code = "";
                        let title = "";
                        if (curTab === "yara") {
                          code = bundle.yara?.content || "";
                          title = bundle.yara?.rule_name || "YARA Memory / File Rule";
                        } else if (curTab === "sigma") {
                          code = bundle.sigma?.content || "";
                          title = bundle.sigma?.title || "Sigma SIEM Detection Rule";
                        } else if (curTab === "nuclei") {
                          code = bundle.nuclei?.content || "";
                          title = bundle.nuclei?.template_id || "Nuclei DAST Template";
                        } else {
                          code = bundle.virtual_waf?.content || "";
                          title = bundle.virtual_waf?.rule_id || "ModSecurity / Cloudflare WAF";
                        }
                        const cKey = `${item.id}_${curTab}`;

                        return (
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] text-zinc-400 font-mono">{title}</span>
                              <button
                                onClick={() => copyRuleCode(cKey, code)}
                                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors"
                              >
                                {copiedKey === cKey ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" /> Copy {curTab.toUpperCase()}
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-[11px] text-zinc-300 font-mono overflow-x-auto whitespace-pre max-h-56 leading-relaxed">
                              {code}
                            </pre>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 font-mono py-2">
                      No rules available for this threat pattern.
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
