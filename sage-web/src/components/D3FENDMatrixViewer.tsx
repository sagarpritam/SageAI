"use client";

import React, { useState, useEffect } from "react";
import {
  Grid3X3,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Target,
} from "lucide-react";

interface Countermeasure {
  d3fend_id: string;
  d3fend_name: string;
  mitre_attack_countered: string[];
  sageai_enforcer: string;
}

export function D3FENDMatrixViewer() {
  const [matrixData, setMatrixData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [attackTech, setAttackTech] = useState("T1059.001");
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/d3fend/matrix");
      if (res.ok) {
        const data = await res.json();
        setMatrixData(data.matrix);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const runAttackQuery = async (tech?: string) => {
    const targetTech = tech || attackTech;
    setQueryLoading(true);
    try {
      const res = await fetch("/api/d3fend/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attack_technique: targetTech }),
      });
      if (res.ok) {
        const data = await res.json();
        setQueryResult(data.query_result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-indigo-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Grid3X3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              MITRE D3FEND Defensive Countermeasure Matrix
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                5 Domains / DMI Enforcer
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Offense-to-defense graph fusion linking MITRE ATT&CK techniques with active D3FEND countermeasures across MODEL, HARDEN, DETECT, ISOLATE, and DECEIVE.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">Defense Maturity Index</div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {matrixData?.defense_maturity_index ? `${matrixData.defense_maturity_index}%` : "100.0%"}
            </div>
          </div>
          <button
            onClick={fetchMatrix}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ATT&CK Query Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            Offensive ATT&CK to Defensive D3FEND Graph Query
          </span>
          <span className="text-[11px] text-slate-500">Quick queries:</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={attackTech}
              onChange={(e) => setAttackTech(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 font-mono focus:border-indigo-500 outline-none"
              placeholder="Enter MITRE ATT&CK ID or Name (e.g., T1059.001, T1003.001, T1190, T1486)"
            />
          </div>
          <button
            onClick={() => runAttackQuery()}
            disabled={queryLoading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {queryLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Resolve Countermeasures
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: "T1059.001", label: "PowerShell (T1059.001)" },
            { id: "T1003.001", label: "LSASS Dumping (T1003.001)" },
            { id: "T1190", label: "Exploit Public App (T1190)" },
            { id: "T1486", label: "Ransomware Encryption (T1486)" },
            { id: "T1078", label: "Valid Accounts (T1078)" },
          ].map((quick) => (
            <button
              key={quick.id}
              onClick={() => {
                setAttackTech(quick.id);
                runAttackQuery(quick.id);
              }}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition border border-slate-700/60"
            >
              {quick.label}
            </button>
          ))}
        </div>

        {queryResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-indigo-300 font-bold">
                Query Target: {queryResult.technique}
              </span>
              <span className="text-emerald-400">
                {queryResult.countermeasures_found} Active Countermeasures Linked
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {queryResult.countermeasures?.map((cm: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">{cm.d3fend_id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      Domain: {cm.domain}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white">{cm.d3fend_name}</div>
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500">SageAI Enforcer: </span>
                    <span className="text-emerald-400 font-mono">{cm.sageai_enforcer}</span>
                  </div>
                  {cm.mitigation_effectiveness && (
                    <div className="text-[10px] text-slate-500">
                      Mitigation Effectiveness: {cm.mitigation_effectiveness}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5 Domains Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Enforced D3FEND Domains Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* DETECT */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <h4 className="text-sm font-bold text-white font-mono">DETECT</h4>
              </div>
              <span className="text-[11px] text-cyan-400 font-mono">3 Enforcers</span>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">D3-PSA: Process Spawn Analysis</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">eBPF Syscall Tracepoints</div>
                <div className="text-[10px] text-slate-500 mt-1">Counters: T1059.001 (PowerShell)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">D3-WAF: Web Application Filtering</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Next-Gen WAF Deep Inspector</div>
                <div className="text-[10px] text-slate-500 mt-1">Counters: T1190 (Exploit Public App)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">D3-SBE: Shannon Burst Encryption Interceptor</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Anti-Ransomware Shield</div>
                <div className="text-[10px] text-slate-500 mt-1">Counters: T1486 (Data Encrypted)</div>
              </div>
            </div>
          </div>

          {/* HARDEN */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h4 className="text-sm font-bold text-white font-mono">HARDEN</h4>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">3 Enforcers</span>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">D3-SCB: Script Command Blocking</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">AppLocker / Constrained Mode</div>
                <div className="text-[10px] text-slate-500 mt-1">Counters: T1059.001 (PowerShell)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">D3-LSASSP: LSASS Protection</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Windows RunAsPPL &amp; CredGuard</div>
                <div className="text-[10px] text-slate-500 mt-1">Counters: T1003.001 (LSASS Memory)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">D3-MFA: Hardware MFA Enforcement</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">FIDO2 / WebAuthn Policy</div>
                <div className="text-[10px] text-slate-500 mt-1">Counters: T1078 (Valid Accounts)</div>
              </div>
            </div>
          </div>

          {/* ISOLATE */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <h4 className="text-sm font-bold text-white font-mono">ISOLATE</h4>
              </div>
              <span className="text-[11px] text-purple-400 font-mono">2 Enforcers</span>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">D3-EBR: Ephemeral Boundary Restrictions</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">SDN Micro-Shield</div>
                <div className="text-[10px] text-slate-500 mt-1">Counters: T1021.002 (SMB/Windows Admin)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">D3-ITF: Inbound Traffic Filtering</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Calico / Cilium Mesh Policies</div>
                <div className="text-[10px] text-slate-500 mt-1">Counters: T1190 (Exploit Public App)</div>
              </div>
            </div>
          </div>

          {/* DECEIVE */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h4 className="text-sm font-bold text-white font-mono">DECEIVE</h4>
              </div>
              <span className="text-[11px] text-amber-400 font-mono">2 Enforcers</span>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">D3-DH: Decoy Host / Honeytokens</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Decoy Honeytoken Traps</div>
                <div className="text-[10px] text-slate-500 mt-1">Counters: T1078 (Valid Accounts)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">D3-HND: Honey-Network Diversion</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Autonomous Honeynet Router</div>
                <div className="text-[10px] text-slate-500 mt-1">Counters: T1021 (Remote Services)</div>
              </div>
            </div>
          </div>

          {/* MODEL */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-pink-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                <h4 className="text-sm font-bold text-white font-mono">MODEL</h4>
              </div>
              <span className="text-[11px] text-pink-400 font-mono">2 Enforcers</span>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">D3-AIM: Asset Inventory Mapping</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">EASM Hunter + CSPM Scanner</div>
                <div className="text-[10px] text-slate-500 mt-1">Counters: T1046 (Network Service Scanning)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">D3-NTM: Network Topology Mapping</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">eBPF Flow Graph Analyzer</div>
                <div className="text-[10px] text-slate-500 mt-1">Counters: T1018 (Remote System Discovery)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

