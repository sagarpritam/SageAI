"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Crosshair,
  ShieldAlert,
  Flame,
  Bot,
  Terminal,
  Activity,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Key,
  EyeOff,
  Radio,
  FileCode,
} from "lucide-react";

interface AgentStatus {
  role: string;
  status?: string;
  actions_taken: number;
  findings_count: number;
}

interface Finding {
  finding_id: string;
  agent: string;
  title: string;
  severity: string;
  mitre_technique: string;
  target?: string;
  status: string;
}

interface Campaign {
  campaign_id: string;
  name: string;
  target_scope: string;
  scenario_type: string;
  intensity: string;
  status: string;
  rounds_completed: number;
  posture_score: number;
  agents: Record<string, AgentStatus>;
  findings: Finding[];
}

export function CASRedTeamStudio() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [runningRound, setRunningRound] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cas-redteam/campaigns");
      const data = await res.json();
      if (data.campaigns) {
        setCampaigns(data.campaigns);
        if (data.campaigns.length > 0) {
          setSelectedCampaign((prev) => prev || data.campaigns[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch campaigns", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  async function handleRunRound() {
    if (!selectedCampaign) return;
    setRunningRound(true);
    try {
      const res = await fetch("/api/cas-redteam/execute-round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: selectedCampaign.campaign_id }),
      });
      const data = await res.json();
      if (data.result?.finding) {
        setSelectedCampaign((prev) => {
          if (!prev) return null;
          const updatedFindings = [data.result.finding, ...prev.findings];
          return {
            ...prev,
            rounds_completed: prev.rounds_completed + 1,
            posture_score: data.result.posture_score ?? prev.posture_score,
            findings: updatedFindings,
          };
        });
      }
    } finally {
      setRunningRound(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 border border-rose-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Capability 40
            </span>
            <span className="text-xs text-slate-400">Autonomous Offensive Simulation Swarm</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-400" />
            Continuous Adversary Simulation (CAS) Red-Team Swarm
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Autonomous multi-agent offensive swarm simulating external breach, container breakout, and defense evasion with automated MITRE ATT&CK mapping.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunRound}
            disabled={runningRound || !selectedCampaign}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-lg shadow-rose-950/40 transition"
          >
            <Play className={`w-3.5 h-3.5 ${runningRound ? "animate-spin" : ""}`} />
            Run Swarm Round
          </button>
          <button
            onClick={fetchCampaigns}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Swarm Agent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ReconAgent */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Search className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ACTIVE
            </span>
          </div>
          <div className="text-sm font-bold text-white">ReconAgent</div>
          <div className="text-xs text-slate-400 mt-0.5">Attack surface & API profiling</div>
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-500">Actions</span>
            <span className="text-white font-mono">{selectedCampaign?.agents?.ReconAgent?.actions_taken || 24}</span>
          </div>
        </div>

        {/* ExploitCrafterAgent */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Crosshair className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ACTIVE
            </span>
          </div>
          <div className="text-sm font-bold text-white">ExploitCrafterAgent</div>
          <div className="text-xs text-slate-400 mt-0.5">Dynamic payload generation & injection</div>
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-500">Actions</span>
            <span className="text-white font-mono">{selectedCampaign?.agents?.ExploitCrafterAgent?.actions_taken || 18}</span>
          </div>
        </div>

        {/* PrivilegeEscalationAgent */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Key className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ACTIVE
            </span>
          </div>
          <div className="text-sm font-bold text-white">PrivilegeEscalationAgent</div>
          <div className="text-xs text-slate-400 mt-0.5">IAM token harvest & host breakout</div>
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-500">Actions</span>
            <span className="text-white font-mono">{selectedCampaign?.agents?.PrivilegeEscalationAgent?.actions_taken || 12}</span>
          </div>
        </div>

        {/* EvasionAgent */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <EyeOff className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ACTIVE
            </span>
          </div>
          <div className="text-sm font-bold text-white">EvasionAgent</div>
          <div className="text-xs text-slate-400 mt-0.5">Polymorphic payload mutation & WAF bypass</div>
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-500">Actions</span>
            <span className="text-white font-mono">{selectedCampaign?.agents?.EvasionAgent?.actions_taken || 16}</span>
          </div>
        </div>
      </div>

      {/* Main Campaign & Findings View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Campaign Overview */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Target Scope</span>
              <span className="text-xs font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                {selectedCampaign?.intensity || "AGGRESSIVE"}
              </span>
            </div>
            <div className="font-mono text-sm text-white p-3 rounded-xl bg-slate-950 border border-slate-800">
              {selectedCampaign?.target_scope || "k8s-cluster.prod.internal"}
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400">Perimeter Posture Score</span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                {selectedCampaign?.posture_score || 78.5} / 100
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400">Rounds Completed</span>
              <span className="text-lg font-bold text-white font-mono">
                {selectedCampaign?.rounds_completed || 4}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Exploitation Findings Feed */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400" />
              Discovered Exploitation Findings ({selectedCampaign?.findings?.length || 0})
            </h3>
            <span className="text-xs text-slate-500">Autonomous Proof of Concept Confirmed</span>
          </div>

          <div className="space-y-3">
            {selectedCampaign?.findings?.map((find) => (
              <div
                key={find.finding_id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-rose-300">
                      {find.mitre_technique}
                    </span>
                    <span className="text-sm font-semibold text-white">{find.title}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      find.severity === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : find.severity === "HIGH"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}
                  >
                    {find.severity}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span>Discovered by: {find.agent}</span>
                  <span className="text-emerald-400">{find.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

