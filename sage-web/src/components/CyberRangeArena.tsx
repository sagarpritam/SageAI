"use client";

import { useState, useEffect } from "react";
import {
  Swords,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Radio,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu,
  Layers,
  Terminal,
  Crosshair,
  Flame,
  Globe,
  Sparkles,
  Zap,
} from "lucide-react";
import axios from "axios";

interface Scenario {
  id: string;
  name: string;
  description: string;
  complexity: string;
  stages: number;
  mitre_ttps: string[];
}

interface DrillStage {
  stage: number;
  phase: string;
  threat_actor: string;
  target: string;
  status: string;
  description: string;
  evidence: any;
}

interface DrillResult {
  status: string;
  scenario: string;
  duration_ms: number;
  attacker_ip: string;
  overall_defense_score: number;
  stages_completed: number;
  timeline: DrillStage[];
  containment: {
    virtual_patch_generated: string;
    soar_action: any;
  };
  cryptographic_proof: {
    merkle_block_index: number;
    block_hash: string;
    sealed_at: string;
  };
}

export function CyberRangeArena() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>("APT-29 Supply Chain & Ingress Breach Drill");
  const [attackerIp, setAttackerIp] = useState("198.51.100.99");
  const [running, setRunning] = useState(false);
  const [drillResult, setDrillResult] = useState<DrillResult | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const res = await axios.get("/api/simulation/scenarios");
      if (res.data?.scenarios) {
        setScenarios(res.data.scenarios);
      }
    } catch (err) {
      console.error("Failed to load scenarios", err);
    }
  };

  const handleRunDrill = async () => {
    setRunning(true);
    setDrillResult(null);
    setActiveStageIndex(0);

    try {
      const res = await axios.post("/api/simulation/run-drill", {
        scenario_name: selectedScenario,
        attacker_ip: attackerIp,
      });

      if (res.data?.status === "DRILL_SUCCESSFUL") {
        setDrillResult(res.data);
        // Animate stages sequentially
        for (let i = 0; i < (res.data.timeline?.length || 0); i++) {
          await new Promise((r) => setTimeout(r, 350));
          setActiveStageIndex(i + 1);
        }
      }
    } catch (err) {
      console.error("Drill simulation error", err);
    } finally {
      setRunning(false);
    }
  };

  const getStageIcon = (phase: string) => {
    switch (phase) {
      case "RECONNAISSANCE_AND_NIDS":
        return <Activity className="w-5 h-5 text-purple-400" />;
      case "DECEPTION_TRAP_TRIGGERED":
        return <Radio className="w-5 h-5 text-amber-400" />;
      case "INGRESS_WAF_DEFENSE":
        return <ShieldAlert className="w-5 h-5 text-blue-400" />;
      case "MALWARE_DETONATION_LAB":
        return <Flame className="w-5 h-5 text-red-400" />;
      case "UEBA_BEHAVIORAL_ANOMALY":
        return <Cpu className="w-5 h-5 text-emerald-400" />;
      case "SOAR_CONTAINMENT_AND_MERKLE_SEAL":
        return <ShieldCheck className="w-5 h-5 text-cyan-400" />;
      default:
        return <Crosshair className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-red-950/30 via-zinc-900 to-black border border-red-500/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
              Autonomous Cyber Range
            </span>
            <span className="text-zinc-500 text-xs font-mono">Full-Spectrum Red vs Blue Adversarial Simulation</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Swords className="w-6 h-6 text-red-400" />
            Autonomous Threat Simulation & Live APT Drill
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl mt-1">
            Chains together all 10 enterprise capabilities: NIDS port sweeps & DNS tunneling, decoy canaries, WAF ingress filters, malware detonation, UEBA Z-score anomaly tracking, and SOAR Merkle hash sealing.
          </p>
        </div>

        {/* Global Score Gauge */}
        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Autonomous Defense Index</div>
            <div className="text-2xl font-black text-white flex items-center gap-1.5">
              <span>{drillResult ? `${drillResult.overall_defense_score}%` : "READY"}</span>
              {drillResult && <span className="text-xs text-emerald-400 font-mono font-normal">NEUTRALIZED</span>}
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              {drillResult ? `Execution Latency: ${drillResult.duration_ms}ms` : "Zero Human Latency"}
            </div>
          </div>
        </div>
      </div>

      {/* Drill Configurator */}
      <div className="p-6 bg-zinc-950 border border-zinc-800/80 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-mono text-zinc-400 block">Select Adversary APT Campaign</label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-red-500/50 outline-none"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name} ({s.complexity} &bull; {s.stages} Stages)
              </option>
            ))}
            {scenarios.length === 0 && (
              <option value="APT-29 Supply Chain & Ingress Breach Drill">
                APT-29 Supply Chain & Ingress Breach Drill (ADVANCED &bull; 6 Stages)
              </option>
            )}
          </select>
        </div>

        <div>
          <button
            onClick={handleRunDrill}
            disabled={running}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-900/30"
          >
            {running ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Simulating Multi-Stage Attack...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Launch Autonomous Drill</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Stage Progress & Results */}
      {drillResult && (
        <div className="space-y-6 animate-in fade-in">
          {/* Stage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drillResult.timeline.map((stg, idx) => {
              const isVisible = idx < activeStageIndex;
              return (
                <div
                  key={stg.stage}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    isVisible
                      ? "bg-zinc-950 border-zinc-800 opacity-100 scale-100"
                      : "bg-zinc-950/40 border-zinc-900/60 opacity-40 scale-95"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-zinc-900 rounded-lg">{getStageIcon(stg.phase)}</div>
                        <span className="text-xs font-mono font-bold text-zinc-300">Stage {stg.stage}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
                        {stg.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1.5">{stg.phase.replace(/_/g, " ")}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">{stg.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>Target: {stg.target}</span>
                    <span className="text-zinc-400 font-bold">100% BLOCKED</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cryptographic Proof & Containment Summary */}
          <div className="p-6 bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-800 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">SOAR Autonomous Containment</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-3">
                Zero-delay perimeter isolation executed and virtual WAF patch generated inline.
              </p>
              <div className="p-3 bg-black/60 border border-zinc-800 rounded-xl space-y-1.5 font-mono text-xs">
                <div className="text-zinc-300">
                  Firewall Action: <span className="text-emerald-400 font-bold">{drillResult.containment.soar_action?.status || "EXECUTED"}</span>
                </div>
                <div className="text-zinc-400 truncate">
                  Target Quarantined: <span className="text-white">{drillResult.attacker_ip}</span>
                </div>
                <div className="text-zinc-500 text-[11px] truncate">
                  Patch: {drillResult.containment.virtual_patch_generated}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Cryptographic Merkle Proof</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-3">
                Tamper-evident audit chain proof registered under SOC2 Type II compliance standards.
              </p>
              <div className="p-3 bg-black/60 border border-zinc-800 rounded-xl space-y-1.5 font-mono text-xs">
                <div className="text-zinc-300">
                  Block Index: <span className="text-emerald-400 font-bold">#{drillResult.cryptographic_proof.merkle_block_index}</span>
                </div>
                <div className="text-zinc-400 truncate">
                  Hash: <span className="text-white">{drillResult.cryptographic_proof.block_hash}</span>
                </div>
                <div className="text-zinc-500 text-[11px]">
                  Sealed At: {new Date(drillResult.cryptographic_proof.sealed_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

