"use client";

import { useState, useEffect } from "react";
import {
  Biohazard,
  ShieldAlert,
  Terminal,
  Activity,
  FileCode,
  Flame,
  Radio,
  Network,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  Binary,
} from "lucide-react";
import axios from "axios";

interface BenchmarkSample {
  id: string;
  name: string;
  filename: string;
  type: string;
  description: string;
  size_bytes: number;
}

interface StaticAnalysis {
  filename: string;
  size_bytes: number;
  file_type: string;
  category: string;
  hashes: { md5: string; sha1: string; sha256: string };
  entropy: number;
  is_packed: boolean;
  verdict: "Clean" | "Low Risk / Adware" | "Suspicious" | "Malicious";
  risk_score: number;
  risk_flags: string[];
  suspicious_patterns: Array<{ pattern: string; count: number; sample: string }>;
  network_iocs: { ips: string[]; urls: string[]; onion_domains: string[] };
  hexdump_preview: string;
  mitre_ttps: Array<{ id: string; name: string; tactic: string }>;
}

interface DetonationResult {
  detonation_id: string;
  chamber_status: string;
  execution_duration_sec: number;
  static_analysis: StaticAnalysis;
  process_tree: Array<{ pid: number; ppid: number; name: string; command_line: string; status: string }>;
  registry_modifications: Array<{ key: string; value: string; operation: string }>;
  network_activity: Array<{ destination: string; port: number; protocol: string; state: string }>;
  dropped_files: Array<{ path: string; size_bytes: number; sha256: string }>;
  evasion_attempts: Array<{ technique: string; action: string }>;
  quarantine_recommendation: string;
}

export function DetonationChamber() {
  const [samples, setSamples] = useState<BenchmarkSample[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>("wannacry_mock");
  const [rawText, setRawText] = useState("");
  const [inputMode, setInputMode] = useState<"benchmark" | "custom">("benchmark");
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<"static" | "dynamic">("dynamic");
  const [detonation, setDetonation] = useState<DetonationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSamples = async () => {
    try {
      const res = await axios.get("/api/malware/samples");
      if (res.data?.samples) {
        setSamples(res.data.samples);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load malware benchmark samples");
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const runDetonation = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload: any = {};
      if (inputMode === "benchmark") {
        payload.sample_id = selectedSampleId;
      } else {
        payload.raw_text = rawText;
        payload.filename = "custom_payload.script";
      }

      const res = await axios.post("/api/malware/detonate", payload);
      if (res.data?.detonation) {
        setDetonation(res.data.detonation);
      } else {
        setError("Invalid telemetry received from detonation chamber.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to detonate sample");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "Malicious":
        return "bg-red-950/80 text-red-400 border-red-800/60";
      case "Suspicious":
        return "bg-amber-950/80 text-amber-400 border-amber-800/60";
      case "Clean":
        return "bg-emerald-950/80 text-emerald-400 border-emerald-800/60";
      default:
        return "bg-zinc-900 text-zinc-400 border-zinc-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-900/60 to-black border border-purple-900/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Biohazard className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white tracking-tight">
              Malware Detonation Chamber &amp; Static Inspector
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Pillar III: Isolated containment sandbox executing deep static inspection (Shannon entropy \(H &gt; 7.2\), magic byte validation, MITRE ATT&amp;CK TTP mapping) and simulated runtime behavioral detonation.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-black/60 px-3 py-1.5 rounded-lg border border-zinc-800">
          <Activity className="w-4 h-4 text-purple-400" />
          <span>Containment Sandbox: ARMED</span>
        </div>
      </div>

      {/* Control Box */}
      <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-4">
        <div className="flex gap-2 border-b border-zinc-800 pb-3">
          <button
            type="button"
            onClick={() => setInputMode("benchmark")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              inputMode === "benchmark"
                ? "bg-purple-950/60 text-purple-400 border border-purple-900/40"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Threat Benchmark Library
          </button>
          <button
            type="button"
            onClick={() => setInputMode("custom")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              inputMode === "custom"
                ? "bg-purple-950/60 text-purple-400 border border-purple-900/40"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Custom Script / Raw Payload
          </button>
        </div>

        {inputMode === "benchmark" ? (
          <div>
            <label className="text-xs text-zinc-400 block mb-1 font-mono">
              Select Threat Benchmark Sample
            </label>
            <select
              value={selectedSampleId}
              onChange={(e) => setSelectedSampleId(e.target.value)}
              className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
            >
              {samples.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.filename}) — {s.type}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="text-xs text-zinc-400 block mb-1 font-mono">
              Suspicious Payload, Shell Script, or Command String
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g. powershell.exe -NoProfile -ExecutionPolicy Bypass -enc ... or vssadmin delete shadows"
              className="w-full bg-black/60 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
        )}

        <button
          type="button"
          onClick={runDetonation}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-purple-900/30"
        >
          {loading ? (
            <>
              <Biohazard className="w-4 h-4 animate-spin" />
              <span>Detonating in Isolated Sandbox...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Detonate &amp; Inspect in Containment Sandbox</span>
            </>
          )}
        </button>
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

      {/* Detonation Results */}
      {detonation && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Verdict</span>
              <span className={`text-base font-black font-mono px-2 py-0.5 rounded border inline-block mt-1 ${getVerdictBadge(detonation.static_analysis.verdict)}`}>
                {detonation.static_analysis.verdict}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Shannon Entropy</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xl font-black text-white font-mono">{detonation.static_analysis.entropy}</span>
                {detonation.static_analysis.is_packed && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-red-950/80 text-red-400 rounded border border-red-800/40">PACKED / UPX</span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Risk Score</span>
              <span className="text-xl font-black text-purple-400 font-mono mt-1 block">
                {detonation.static_analysis.risk_score} / 100
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Sandbox Chamber</span>
              <span className="text-xs font-black text-emerald-400 font-mono mt-1 block truncate">
                {detonation.chamber_status}
              </span>
            </div>
          </div>

          {/* Tab Navigation: Dynamic Detonation vs Static Analysis */}
          <div className="flex gap-2 border-b border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveView("dynamic")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition border-b-2 ${
                activeView === "dynamic"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Behavioral Detonation Telemetry</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView("static")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition border-b-2 ${
                activeView === "static"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Binary className="w-3.5 h-3.5" />
              <span>Deep Static &amp; MITRE TTPs</span>
            </button>
          </div>

          {/* Dynamic Detonation Telemetry View */}
          {activeView === "dynamic" && (
            <div className="space-y-4">
              {/* Process Execution Tree */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs uppercase tracking-wider font-bold text-white font-mono">
                    Sandboxed Process Execution Tree ({detonation.process_tree.length} Processes)
                  </h3>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {detonation.process_tree.map((p, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-black/70 border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 font-bold">{p.name}</span>
                          <span className="text-[10px] text-zinc-500">PID: {p.pid} (PPID: {p.ppid})</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 break-all">{p.command_line}</div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 self-start sm:self-center">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid: Registry, Network C2, Dropped Files */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Network Activity */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs uppercase tracking-wider font-bold text-white font-mono">
                      Observed C2 Network Activity
                    </h3>
                  </div>
                  {detonation.network_activity.length === 0 ? (
                    <p className="text-xs text-zinc-500">Zero outbound C2 connections observed.</p>
                  ) : (
                    <div className="space-y-1.5 font-mono text-[11px]">
                      {detonation.network_activity.map((n, i) => (
                        <div key={i} className="p-2 rounded bg-black/60 border border-zinc-900 flex items-center justify-between">
                          <span className="text-zinc-300">{n.destination}:{n.port}</span>
                          <span className="text-amber-400 text-[10px]">{n.state}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Registry Modifications */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs uppercase tracking-wider font-bold text-white font-mono">
                      Registry Persistence Hooks
                    </h3>
                  </div>
                  {detonation.registry_modifications.length === 0 ? (
                    <p className="text-xs text-zinc-500">No autostart registry modifications detected.</p>
                  ) : (
                    <div className="space-y-1.5 font-mono text-[11px]">
                      {detonation.registry_modifications.map((r, i) => (
                        <div key={i} className="p-2 rounded bg-black/60 border border-zinc-900 space-y-0.5">
                          <div className="text-amber-400 break-all">{r.key}</div>
                          <div className="text-zinc-500 text-[10px]">Data: {r.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quarantine Action */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs space-y-1.5">
                <span className="text-[10px] uppercase font-mono font-bold text-purple-400 block">
                  Automated Quarantine &amp; Containment Protocol:
                </span>
                <p className="text-zinc-300 leading-relaxed font-mono text-[11px]">
                  {detonation.quarantine_recommendation}
                </p>
              </div>
            </div>
          )}

          {/* Static Analysis View */}
          {activeView === "static" && (
            <div className="space-y-4">
              {/* MITRE ATT&CK Matrix */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <h3 className="text-xs uppercase tracking-wider font-bold text-white font-mono">
                  Identified MITRE ATT&amp;CK TTPs ({detonation.static_analysis.mitre_ttps.length})
                </h3>
                {detonation.static_analysis.mitre_ttps.length === 0 ? (
                  <p className="text-xs text-zinc-500">No offensive MITRE ATT&amp;CK techniques mapped.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {detonation.static_analysis.mitre_ttps.map((ttp, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-black/70 border border-zinc-900 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-purple-400">{ttp.id}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">{ttp.tactic}</span>
                        </div>
                        <div className="text-xs font-bold text-zinc-200 line-clamp-1">{ttp.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hashes & File Info */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 font-mono text-xs">
                <h3 className="text-xs uppercase tracking-wider font-bold text-white mb-2">Cryptographic Fingerprints</h3>
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-500">File Type:</span>
                  <span className="text-zinc-300">{detonation.static_analysis.file_type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-500">SHA256:</span>
                  <span className="text-emerald-400 break-all">{detonation.static_analysis.hashes.sha256}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-500">MD5:</span>
                  <span className="text-zinc-300">{detonation.static_analysis.hashes.md5}</span>
                </div>
              </div>

              {/* Canonical Hexdump Viewer */}
              <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2">
                <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400 font-mono">
                  Canonical Hex Dump (Header Offset 0x0000 - 0x0100)
                </h3>
                <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-950/90 p-3 rounded-lg overflow-x-auto border border-zinc-900 leading-snug">
                  {detonation.static_analysis.hexdump_preview}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

