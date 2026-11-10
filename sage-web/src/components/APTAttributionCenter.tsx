"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Globe2,
  Shield,
  Activity,
  Search,
  ExternalLink,
  Target,
  Server,
  Layers,
  ArrowRight,
  Fingerprint,
  RefreshCw,
  Cpu,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface DiamondModel {
  adversary: string;
  capabilities: string[];
  infrastructure: string[];
  victimology: string[];
}

interface ActorProfile {
  actor_id: string;
  name: string;
  origin: string;
  motivation: string;
  target_sectors: string[];
  diamond_model: DiamondModel;
  confidence_score: number;
}

export function APTAttributionCenter() {
  const [actors, setActors] = useState<ActorProfile[]>([]);
  const [selectedActor, setSelectedActor] = useState<ActorProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // IOC Analysis state
  const [indicatorInput, setIndicatorInput] = useState("194.26.29.112");
  const [ja4Input, setJa4Input] = useState("t13d1516h2_8daaf6152771_0271d4310d7a");
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchActors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/apt-attribution/actors");
      const data = await res.json();
      if (data.actors) {
        setActors(data.actors);
        if (data.actors.length > 0) {
          setSelectedActor((prev) => prev || data.actors[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActors();
  }, [fetchActors]);

  async function handleAnalyzeIOC(e: React.FormEvent) {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const res = await fetch("/api/apt-attribution/analyze-ioc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indicator: indicatorInput,
          ja4_fingerprint: ja4Input || undefined,
        }),
      });
      const data = await res.json();
      if (data.attribution) {
        setAnalysisResult(data.attribution);
      }
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Capability 41
            </span>
            <span className="text-xs text-slate-400">STIX 2.1 Graph & JA4 TLS Attribution</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-amber-400" />
            CTI Graph Fusion & APT Actor Attribution Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Correlates STIX 2.1 intelligence, JA3/JA4 TLS handshake signatures, and Diamond Model graph relationships for automated nation-state adversary attribution.
          </p>
        </div>
        <button
          onClick={fetchActors}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Attribution Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Nation-State Actor Profiles */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Tracked Nation-State APT Actors ({actors.length})
          </h3>
          {actors.map((act) => {
            const isSelected = selectedActor?.actor_id === act.actor_id;
            return (
              <div
                key={act.actor_id}
                onClick={() => setSelectedActor(act)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? "bg-slate-800/90 border-amber-500/50 shadow-lg shadow-amber-950/20"
                    : "bg-slate-900/50 border-slate-800 hover:bg-slate-850 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-white">{act.name}</span>
                  <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/30">
                    {act.confidence_score}%
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Origin: {act.origin}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">{act.motivation}</div>
              </div>
            );
          })}
        </div>

        {/* Center/Right: Diamond Model & IOC Analyzer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Diamond Model Visualization Card */}
          {selectedActor && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-400" />
                    Diamond Model Profile: {selectedActor.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">Sponsor: {selectedActor.origin}</div>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/40">
                  STIX 2.1 Aligned
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Capabilities & Implants</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedActor.diamond_model?.capabilities?.map((cap, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">C2 Infrastructure & Proxy Mesh</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedActor.diamond_model?.infrastructure?.map((inf, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono">
                        {inf}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Adversary Attribution</span>
                  <div className="text-xs text-slate-300">
                    {selectedActor.diamond_model?.adversary}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Victimology & Targeted Sectors</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedActor.diamond_model?.victimology?.map((vic, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
                        {vic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Real-Time IOC & JA4 Analyzer Form */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-amber-400" />
              Live IOC & Cryptographic JA4 TLS Attribution Query
            </h3>

            <form onSubmit={handleAnalyzeIOC} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Suspicious IP or Domain C2</label>
                <input
                  type="text"
                  value={indicatorInput}
                  onChange={(e) => setIndicatorInput(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                  placeholder="194.26.29.112"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">JA4 TLS Client Fingerprint Hash</label>
                <input
                  type="text"
                  value={ja4Input}
                  onChange={(e) => setJa4Input(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                  placeholder="t13d1516h2_..."
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={analyzing}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition flex items-center justify-center gap-2"
                >
                  <Search className={`w-3.5 h-3.5 ${analyzing ? "animate-spin" : ""}`} />
                  Execute Diamond Attribution Query
                </button>
              </div>
            </form>

            {analysisResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-800/40 space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Attributed: {analysisResult.attributed_actor}
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    Confidence: {analysisResult.confidence_score}%
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  JA4 Signature: {analysisResult.ja4_matched}
                </div>
                <div className="border-t border-slate-800 pt-2 space-y-1">
                  <span className="text-xs font-semibold text-slate-300">Attribution Evidence:</span>
                  {analysisResult.attribution_factors?.map((f: string, i: number) => (
                    <div key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

