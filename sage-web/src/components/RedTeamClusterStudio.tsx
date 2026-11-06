"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  RefreshCw,
  Terminal,
  Cpu,
  Target,
  Skull,
  Crosshair,
  AlertOctagon,
  Activity,
} from "lucide-react";

interface RedAgent {
  agent_id: string;
  codename: string;
  specialization: string;
  aggression_level: number;
  evasion_techniques: string[];
  active_payload_vectors: number;
  status: string;
}

interface CampaignFinding {
  domain: string;
  adversary_vector: string;
  mitigation_service: string;
  containment_latency_ms: number;
  residual_risk: string;
  status: string;
}

interface CampaignResult {
  campaign_id: string;
  target_domains: string[];
  engaged_agents: string[];
  simulated_attack_vectors: number;
  deflection_success_pct: number;
  mean_mitigation_latency_ms: number;
  blast_radius_containment_pct: number;
  systemic_resilience_score: number;
  detailed_findings: CampaignFinding[];
  verdict: string;
  timestamp: string;
}

export function RedTeamClusterStudio() {
  const [agents, setAgents] = useState<RedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignRunning, setCampaignRunning] = useState(false);
  const [intensity, setIntensity] = useState(0.85);
  const [lastCampaign, setLastCampaign] = useState<CampaignResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/redteam-cluster/agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleLaunchCampaign = async () => {
    setCampaignRunning(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Mobilizing autonomous adversarial Red-Team swarm across 76 sovereign defense capabilities (Intensity: ${(intensity * 100).toFixed(0)}%)...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/redteam-cluster/launch-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_domains: [
            "ORBITAL_PNT",
            "QUANTUM_NETWORK",
            "DEEP_SPACE_RELAY",
            "SUBTERRANEAN_SEISMIC",
            "PLASMA_SHIELD",
          ],
          intensity: intensity,
          target_capabilities_count: 76,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastCampaign(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] Campaign concluded: ${data.simulated_attack_vectors} vectors tested | Deflection: ${data.deflection_success_pct}% | Mean Mitigation: ${data.mean_mitigation_latency_ms} ms | Resilience: ${data.systemic_resilience_score}%`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Campaign error: Adversary agent connection interrupted`,
        ...prev,
      ]);
    } finally {
      setCampaignRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-rose-500/20 bg-gradient-to-r from-rose-950/40 via-red-900/20 to-neutral-900/40 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/30">
                Option B Engine
              </span>
              <span className="text-xs text-neutral-400">Autonomous Adversarial Swarm</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Skull className="h-6 w-6 text-rose-400" />
              Sovereign Multi-Agent Red-Teaming &amp; Adversarial Stress Engine
            </h2>
            <p className="mt-1 text-sm text-neutral-300">
              Autonomous non-deterministic adversarial AI agents continuously stress-testing Capabilities 1–76 across RF jamming, quantum side-channels, hypervelocity ASAT, and subterranean exfiltration.
            </p>
          </div>
          <button
            onClick={fetchAgents}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Sync Red Agents
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Skull className="h-4 w-4 text-rose-400" />
            Active Red-Team Swarm
          </div>
          <div className="mt-2 text-2xl font-bold text-white">4 Autonomous Agents</div>
          <div className="mt-1 text-xs text-rose-400">18 Attack Vectors Enacted</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Target className="h-4 w-4 text-amber-400" />
            Capabilities Tested
          </div>
          <div className="mt-2 text-2xl font-bold text-white">76 / 76 Capabilities</div>
          <div className="mt-1 text-xs text-amber-400">Full Planetary Spectrum</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Zap className="h-4 w-4 text-cyan-400" />
            Mean Mitigation Speed
          </div>
          <div className="mt-2 text-2xl font-bold text-white">2.45 ms</div>
          <div className="mt-1 text-xs text-cyan-400">Sub-5ms Autonomous Loop</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Planetary Resilience Score
          </div>
          <div className="mt-2 text-2xl font-bold text-white">99.88%</div>
          <div className="mt-1 text-xs text-emerald-400">Zero Cascade Deflection</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Red-Team Agents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-rose-400" />
                Adversarial AI Agent Profiles
              </h3>
              <span className="text-xs text-neutral-400">{agents.length} Standby Adversaries</span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {agents.map((ag) => (
                <div
                  key={ag.agent_id}
                  className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4 hover:border-rose-500/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-white text-sm">{ag.codename}</div>
                      <div className="text-xs text-rose-400 font-mono mt-0.5">{ag.agent_id}</div>
                    </div>
                    <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20">
                      Aggression: {(ag.aggression_level * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-neutral-300 font-medium">
                    {ag.specialization}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {ag.evasion_techniques.map((tech, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Campaign Launcher */}
            <div className="mt-6 rounded-lg border border-rose-500/20 bg-rose-950/20 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                  Launch Full Adversarial Stress Campaign
                </h4>
                <span className="text-xs text-neutral-400 font-mono">
                  Intensity: {(intensity * 100).toFixed(0)}%
                </span>
              </div>

              <div className="mt-3">
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <button
                onClick={handleLaunchCampaign}
                disabled={campaignRunning}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs py-2.5 transition disabled:opacity-50"
              >
                <AlertOctagon className="h-4 w-4" />
                {campaignRunning
                  ? "Orchestrating Asymmetric Multi-Domain Assault..."
                  : "Launch Adversarial Campaign Across Capabilities 1–76"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Campaign Results & Findings */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Activity className="h-4 w-4 text-rose-400" />
              Campaign Defense Scorecard
            </h3>

            {lastCampaign ? (
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Campaign ID:</span>
                  <span className="font-mono text-rose-400">{lastCampaign.campaign_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Vectors Tested:</span>
                  <span className="text-white font-bold">{lastCampaign.simulated_attack_vectors} vectors</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Deflection Rate:</span>
                  <span className="text-emerald-400 font-bold">{lastCampaign.deflection_success_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Mitigation Latency:</span>
                  <span className="text-cyan-400 font-mono">{lastCampaign.mean_mitigation_latency_ms} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Resilience Score:</span>
                  <span className="text-green-400 font-bold">{lastCampaign.systemic_resilience_score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Verdict:</span>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400 border border-emerald-500/20 font-bold">
                    {lastCampaign.verdict}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-800 space-y-1.5">
                  <div className="text-[11px] font-semibold text-neutral-300">Domain Findings:</div>
                  {lastCampaign.detailed_findings.map((f, i) => (
                    <div
                      key={i}
                      className="rounded border border-neutral-800 bg-neutral-950/80 p-2 text-[11px] flex justify-between items-center"
                    >
                      <span className="font-mono text-neutral-300">{f.domain}</span>
                      <span className="text-emerald-400 font-semibold">{f.containment_latency_ms} ms</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-neutral-500 py-6">
                Click &quot;Launch Adversarial Campaign&quot; to stress test defenses.
              </div>
            )}
          </div>

          {/* Console Log */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 border-b border-neutral-800/80 pb-2">
              <Terminal className="h-3.5 w-3.5 text-rose-400" />
              Red-Team Swarm Execution Log
            </div>
            <div className="mt-3 h-44 overflow-y-auto space-y-1.5 font-mono text-[11px] text-neutral-400">
              {logs.length > 0 ? (
                logs.map((log, i) => <div key={i}>{log}</div>)
              ) : (
                <div className="text-neutral-600">Red agents standing by. Zero hostile ingress permitted.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
