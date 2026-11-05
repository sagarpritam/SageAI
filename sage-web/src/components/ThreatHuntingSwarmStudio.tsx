"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Search,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Play,
  RefreshCw,
  AlertTriangle,
  Layers,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Crosshair,
} from "lucide-react";

interface HuntRecord {
  hunt_id: string;
  topic: string;
  technique: string;
  sigma_rule: string;
  hypothesis: string;
  agents: {
    hypothesis_agent?: any;
    telemetry_agent?: any;
    correlation_agent?: any;
    arbiter_agent?: any;
  };
  status: string;
  created_at: string;
  enforced_action?: string;
}

export function ThreatHuntingSwarmStudio() {
  const [hunts, setHunts] = useState<HuntRecord[]>([]);
  const [selectedHunt, setSelectedHunt] = useState<HuntRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHunts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/threat-hunting-swarm/hunts");
      if (res.ok) {
        const data = await res.json();
        setHunts(data.hunts || []);
        if (data.hunts && data.hunts.length > 0 && !selectedHunt) {
          setSelectedHunt(data.hunts[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHunts();
  }, []);

  const launchNewHunt = async (topic: string) => {
    setLaunching(true);
    try {
      const res = await fetch("/api/threat-hunting-swarm/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hunt_topic: topic }),
      });
      if (res.ok) {
        const data = await res.json();
        setHunts((prev) => [data.hunt, ...prev]);
        setSelectedHunt(data.hunt);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLaunching(false);
    }
  };

  const executeContainment = async (huntId: string, action: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/threat-hunting-swarm/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hunt_id: huntId, action }),
      });
      if (res.ok) {
        setHunts((prev) =>
          prev.map((h) =>
            h.hunt_id === huntId
              ? { ...h, status: "CONTAINMENT_ENFORCED", enforced_action: action }
              : h
          )
        );
        if (selectedHunt?.hunt_id === huntId) {
          setSelectedHunt((prev) => prev ? { ...prev, status: "CONTAINMENT_ENFORCED", enforced_action: action } : null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-950/30 to-slate-900 border border-purple-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Autonomous Multi-Agent Threat Hunting Swarm
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                Phase 6.2 &bull; 4-Agent Pipeline
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Autonomous reasoning swarm executing continuous, prompt-free hypothesis generation, low-overhead eBPF telemetry aggregation, and SOAR containment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => launchNewHunt("Process Injection & Memory Hollowing")}
            disabled={launching}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            {launching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {launching ? "Swarm Hunting..." : "Launch Autonomous Swarm"}
          </button>
        </div>
      </div>

      {/* Preset Launcher Bar */}
      <div className="flex flex-wrap gap-2 items-center p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
        <span className="text-slate-400 flex items-center gap-1.5 mr-2">
          <Crosshair className="w-3.5 h-3.5 text-purple-400" />
          Quick Hunt Directives:
        </span>
        {[
          { label: "Memory Hollowing (T1055)", topic: "Process Injection & Memory Hollowing" },
          { label: "DCSync KRBTGT Dump (T1003.006)", topic: "Active Directory DCSync Replication Probe" },
          { label: "Cloud Session Hijacking (T1078.004)", topic: "Cloud Console Session Hijacking Without MFA" },
        ].map((q) => (
          <button
            key={q.topic}
            onClick={() => launchNewHunt(q.topic)}
            disabled={launching}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* 4-Agent Pipeline Visualizer */}
      {selectedHunt && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Active Swarm Reasoning Consensus: {selectedHunt.hunt_id}
            </span>
            <span className="text-xs text-purple-400 font-mono">
              Technique: {selectedHunt.technique}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Hypothesis Agent */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-300 font-bold">1. Hypothesis Agent</span>
                <span className="text-[10px] text-emerald-400">COMPLETED</span>
              </div>
              <div className="text-[11px] text-slate-300 leading-relaxed">
                {selectedHunt.hypothesis}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Rule: {selectedHunt.sigma_rule}
              </div>
            </div>

            {/* 2. Telemetry Agent */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-300 font-bold">2. Telemetry Agent</span>
                <span className="text-[10px] text-emerald-400">eBPF PROBES</span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono space-y-1">
                {selectedHunt.agents?.telemetry_agent?.findings?.map((f: any, idx: number) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <div className="text-amber-300 font-bold">{f.target_process || f.target_service}</div>
                    <div className="text-slate-400 text-[10px] truncate">{f.anomaly}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Correlation Agent */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-indigo-300 font-bold">3. Correlation Agent</span>
                <span className="text-[10px] text-purple-400">GRAPH FUSION</span>
              </div>
              <div className="text-center py-2">
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {selectedHunt.agents?.correlation_agent?.confidence_score ?? 96.5}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Anomaly Confidence Score</div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono text-center">
                Blast Radius: HIGH &bull; Entity Graph Mapped
              </div>
            </div>

            {/* 4. Arbiter Agent */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300 font-bold">4. Arbiter Agent</span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {selectedHunt.status === "CONTAINMENT_ENFORCED" ? "ENFORCED" : "DECISION READY"}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                Action:{" "}
                <span className="text-red-300 font-bold">
                  {selectedHunt.enforced_action ||
                    selectedHunt.agents?.arbiter_agent?.recommended_action ||
                    "CONTAIN_HOST"}
                </span>
              </div>
              {selectedHunt.status !== "CONTAINMENT_ENFORCED" ? (
                <button
                  onClick={() =>
                    executeContainment(
                      selectedHunt.hunt_id,
                      selectedHunt.agents?.arbiter_agent?.recommended_action || "CONTAIN_HOST"
                    )
                  }
                  disabled={actionLoading}
                  className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  Execute Containment
                </button>
              ) : (
                <div className="p-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Neutralized by Arbiter
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hunts Registry Table */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Active &amp; Completed Swarm Hunts ({hunts.length})
          </span>
          <span className="text-xs text-purple-400 font-mono">Real-time Swarm Memory</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Hunt ID</th>
                <th className="py-2.5 px-3">Threat Focus / Topic</th>
                <th className="py-2.5 px-3">Technique</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {hunts.map((h) => (
                <tr
                  key={h.hunt_id}
                  onClick={() => setSelectedHunt(h)}
                  className={`cursor-pointer transition ${
                    selectedHunt?.hunt_id === h.hunt_id ? "bg-purple-950/20" : "hover:bg-slate-800/30"
                  }`}
                >
                  <td className="py-3 px-3 text-purple-300 font-bold">{h.hunt_id}</td>
                  <td className="py-3 px-3 text-white font-medium">{h.topic}</td>
                  <td className="py-3 px-3 text-slate-400">{h.technique}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">
                    {h.agents?.correlation_agent?.confidence_score ?? 96.5}%
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.status === "CONTAINMENT_ENFORCED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-purple-400 hover:text-purple-300">
                    Inspect Swarm →
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

