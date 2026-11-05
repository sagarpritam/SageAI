"use client";

import React, { useState } from "react";
import {
  Binary,
  Code2,
  FileCode,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  RefreshCw,
  Play,
  Copy,
  Check,
  Cpu,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export function SymbolicDeobfuscatorStudio() {
  const [sampleName, setSampleName] = useState("LummaStealer_Packed_Dropper.bin");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [copiedYara, setCopiedYara] = useState(false);

  const runDeobfuscation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/binary-deobfuscator/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sample_name: sampleName }),
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyYara = () => {
    if (!report?.yara_l_rule) return;
    navigator.clipboard.writeText(report.yara_l_rule);
    setCopiedYara(true);
    setTimeout(() => setCopiedYara(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-teal-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Symbolic Binary Execution &amp; Polymorphic De-Obfuscation
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono border border-teal-500/30">
                Phase 6.4 &bull; Angr / Triton / Z3 SMT
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Autonomous control flow flattening (CFF) elimination, mathematical opaque predicate pruning via Z3, automated API unhashing, and dynamic YARA-L synthesis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sampleName}
            onChange={(e) => setSampleName(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-teal-500 outline-none"
          >
            <option value="LummaStealer_Packed_Dropper.bin">LummaStealer (OLLVM CFF + Opaque Predicates)</option>
            <option value="QakBot_StringTable_Packed.dll">QakBot (Control Flow Indirection + RC4)</option>
            <option value="CobaltStrike_Staged_Shellcode.bin">CobaltStrike (ROR13 API Hashing)</option>
          </select>
          <button
            onClick={runDeobfuscation}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm transition shadow-lg shadow-teal-600/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? "Symbolic Solving..." : "Deobfuscate Binary"}
          </button>
        </div>
      </div>

      {report ? (
        <div className="space-y-6">
          {/* Complexity Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs font-mono text-slate-400">Original Complexity</div>
              <div className="text-2xl font-bold font-mono text-red-400 mt-1">
                {report.original_cyclomatic_complexity}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Heavy CFF dispatcher loops</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs font-mono text-slate-400">Deobfuscated Complexity</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {report.deobfuscated_cyclomatic_complexity}
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Linear CFG restored</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs font-mono text-slate-400">Complexity Reduction</div>
              <div className="text-2xl font-bold font-mono text-teal-400 mt-1">
                {report.complexity_reduction}
              </div>
              <div className="text-[10px] text-teal-400 mt-0.5">Dead basic blocks pruned</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs font-mono text-slate-400">Hidden APIs Recovered</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {report.unhashed_apis?.length ?? 4}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">ROR13/CRC32 hashes unhashed</div>
            </div>
          </div>

          {/* SMT Predicates & Unhashed APIs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Opaque Predicates */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-teal-400" />
                  Z3 SMT Solver &bull; Opaque Predicate Pruning
                </span>
                <span className="text-xs text-teal-400 font-mono">Invariants Pruned</span>
              </div>

              <div className="space-y-2">
                {report.pruned_opaque_predicates?.map((p: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-300 font-bold">{p.predicate_expression}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                        {p.evaluation}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{p.simplification_action}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unhashed APIs */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Binary className="w-3.5 h-3.5 text-teal-400" />
                  Resolved Windows APIs (ROR13 / CRC32)
                </span>
                <span className="text-xs text-red-400 font-mono">Hidden Process Injection</span>
              </div>

              <div className="space-y-2">
                {report.unhashed_apis?.map((api: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="text-slate-500 mr-2">{api.hash}</span>
                      <span className="text-white font-bold">{api.api_name}</span>
                      <span className="text-slate-500 text-[10px] ml-2">({api.dll})</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                      {api.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decrypted C2 & Auto-Generated YARA-L */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Decrypted Strings &amp; C2 Infrastructure
              </div>
              <div className="space-y-2 font-mono text-xs">
                {report.decrypted_strings?.map((s: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-teal-400 flex justify-between">
                      <span>Offset: {s.offset}</span>
                      <span>{s.type}</span>
                    </div>
                    <div className="text-slate-200 mt-1 break-all text-[11px] font-bold">{s.plaintext}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 p-4 rounded-xl bg-slate-900/90 border border-teal-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-teal-300 font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-teal-400" />
                  Auto-Generated YARA-L v2 Detection Rule
                </span>
                <button
                  onClick={copyYara}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                >
                  {copiedYara ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedYara ? "Copied" : "Copy YARA-L"}
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-teal-200 overflow-x-auto max-h-56 border border-slate-800">
                {report.yara_l_rule}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 space-y-2">
          <Code2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="text-sm">Select an obfuscated malware sample and click "Deobfuscate Binary".</p>
          <p className="text-xs text-slate-500">Angr and Z3 SMT solver will de-flatten the control flow graph and resolve obfuscated APIs.</p>
        </div>
      )}
    </div>
  );
}

