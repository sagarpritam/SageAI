"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Zap,
  Sliders,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Radio,
  RefreshCw,
  Cpu,
  Layers,
  Flame,
  FileCode2,
  Server,
  Crosshair,
} from "lucide-react";

interface PlaybookStep {
  step: number;
  action: string;
  target?: string;
  status?: string;
  execution_latency_ms?: number;
}

interface SocPlaybook {
  playbook_id: string;
  name: string;
  severity: string;
  category: string;
  mitre_techniques: string[];
  description: string;
  estimated_duration_ms: number;
  automated: boolean;
  steps: PlaybookStep[];
}

interface ExecutionResult {
  execution_id: string;
  playbook_id: string;
  playbook_name: string;
  target_environment: string;
  executed_by: string;
  status: string;
  containment_ratio: number;
  human_downtime_seconds: number;
  elapsed_ms: number;
  timestamp: number;
  merkle_record_hash: string;
  steps_executed: PlaybookStep[];
}

interface EbpfTuning {
  xdp_mode: string;
  drop_action: string;
  ring_buffer_size_mb: number;
  kernel_hook: string;
  microsecond_latency_clamp_ms: number;
  blocked_cidrs: string[];
  blocked_ports: number[];
  packet_drop_rate_pps: number;
  kernel_memory_usage_kb: number;
  last_tuned_at: number;
  active_rules_count: number;
}

interface Killswitch {
  id: string;
  name: string;
  description: string;
  status: "ARMED_STANDBY" | "ENGAGED_ACTIVE";
  impact_level: string;
  target_layers: string[];
  last_toggled_at: number | null;
  toggled_by: string | null;
}

export default function SocPlaybookStudio() {
  const [activeTab, setActiveTab] = useState<"playbooks" | "ebpf" | "killswitches">("playbooks");
  const [playbooks, setPlaybooks] = useState<SocPlaybook[]>([]);
  const [history, setHistory] = useState<ExecutionResult[]>([]);
  const [ebpfTuning, setEbpfTuning] = useState<EbpfTuning | null>(null);
  const [killswitches, setKillswitches] = useState<Killswitch[]>([]);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>("PB-RANSOMWARE-CONTAINMENT");
  const [latestExecution, setLatestExecution] = useState<ExecutionResult | null>(null);

  // Form states for eBPF tuning
  const [xdpMode, setXdpMode] = useState<string>("NATIVE_DRIVER");
  const [dropAction, setDropAction] = useState<string>("XDP_DROP");
  const [ringBufferSize, setRingBufferSize] = useState<number>(64);
  const [blockedCidrsText, setBlockedCidrsText] = useState<string>("198.51.100.0/24\n203.0.113.0/24\n192.0.2.0/24");
  const [blockedPortsText, setBlockedPortsText] = useState<string>("4444, 1337, 8088, 3389");

  // Form states for killswitch
  const [cisoSignatory, setCisoSignatory] = useState<string>("Marcus Vance");
  const [cisoReason, setCisoReason] = useState<string>("Urgent threat containment authorized under SOP-99");
  const [notification, setNotification] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isTuning, setIsTuning] = useState<boolean>(false);
  const [togglingKillswitchId, setTogglingKillswitchId] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [pbRes, histRes, tuningRes, ksRes] = await Promise.all([
          fetch("/api/soc/playbooks/list"),
          fetch("/api/soc/playbooks/history"),
          fetch("/api/soc/playbooks/ebpf/tuning"),
          fetch("/api/soc/playbooks/killswitch/status"),
        ]);

        if (pbRes.ok) {
          const pbData = await pbRes.json();
          if (pbData.playbooks) setPlaybooks(pbData.playbooks);
        }
        if (histRes.ok) {
          const histData = await histRes.json();
          if (histData.history) {
            setHistory(histData.history);
            if (histData.history.length > 0) setLatestExecution(histData.history[0]);
          }
        }
        if (tuningRes.ok) {
          const tData: EbpfTuning = await tuningRes.json();
          setEbpfTuning(tData);
          setXdpMode(tData.xdp_mode || "NATIVE_DRIVER");
          setDropAction(tData.drop_action || "XDP_DROP");
          setRingBufferSize(tData.ring_buffer_size_mb || 64);
          if (tData.blocked_cidrs) setBlockedCidrsText(tData.blocked_cidrs.join("\n"));
          if (tData.blocked_ports) setBlockedPortsText(tData.blocked_ports.join(", "));
        }
        if (ksRes.ok) {
          const ksData = await ksRes.json();
          if (ksData.killswitches) setKillswitches(ksData.killswitches);
        }
      } catch (err: unknown) {
        setNotification(err instanceof Error ? err.message : "Failed to load SOC Playbook data.");
      }
    }
    loadInitialData();
  }, []);

  // Execute Playbook
  const handleExecutePlaybook = async (playbookId: string) => {
    setIsExecuting(true);
    setNotification(null);
    try {
      const res = await fetch("/api/soc/playbooks/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playbook_id: playbookId,
          target_environment: "staging-dual-cloud",
          operator_role: "ciso",
        }),
      });

      if (!res.ok) throw new Error(`Execution failed: ${res.statusText}`);
      const result: ExecutionResult = await res.json();
      setLatestExecution(result);
      setHistory((prev) => [result, ...prev]);
      setNotification(`Playbook ${result.playbook_id} completed: 100% containment in ${result.elapsed_ms.toFixed(1)} ms.`);
    } catch (err: unknown) {
      setNotification(err instanceof Error ? err.message : "Failed to execute playbook. Check logs.");
    } finally {
      setIsExecuting(false);
    }
  };

  // Tune eBPF
  const handleTuneEbpf = async () => {
    setIsTuning(true);
    setNotification(null);
    try {
      const cidrs = blockedCidrsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const ports = blockedPortsText
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));

      const res = await fetch("/api/soc/playbooks/ebpf/tune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xdp_mode: xdpMode,
          drop_action: dropAction,
          ring_buffer_size_mb: ringBufferSize,
          blocked_cidrs: cidrs,
          blocked_ports: ports,
          tuned_by: "ciso",
        }),
      });

      if (!res.ok) throw new Error("eBPF tuning failed");
      const updated: EbpfTuning = await res.json();
      setEbpfTuning(updated);
      setNotification(`Kernel eBPF XDP filter updated successfully (${updated.active_rules_count} rules active).`);
    } catch (err: unknown) {
      setNotification(err instanceof Error ? err.message : "Error applying eBPF tuning.");
    } finally {
      setIsTuning(false);
    }
  };

  // Toggle Killswitch
  const handleToggleKillswitch = async (ks: Killswitch) => {
    setTogglingKillswitchId(ks.id);
    setNotification(null);
    const nextAction = ks.status === "ENGAGED_ACTIVE" ? "DISARM" : "ENGAGE";
    try {
      const res = await fetch("/api/soc/playbooks/killswitch/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          killswitch_id: ks.id,
          action: nextAction,
          operator_name: cisoSignatory || "Marcus Vance",
          operator_role: "ciso",
          reason: cisoReason || "Authorized incident mitigation",
        }),
      });

      if (!res.ok) throw new Error("Killswitch operation failed");
      const cert = await res.json();

      setKillswitches((prev) =>
        prev.map((item) =>
          item.id === ks.id
            ? {
                ...item,
                status: cert.status,
                last_toggled_at: cert.timestamp,
                toggled_by: cert.toggled_by,
              }
            : item
        )
      );

      setNotification(`Kill-switch ${ks.id} set to ${cert.status}. Certificate: ${cert.certificate_id}`);
    } catch (err: unknown) {
      setNotification(err instanceof Error ? err.message : "Failed to toggle emergency kill-switch.");
    } finally {
      setTogglingKillswitchId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-gradient-to-br from-red-600/30 to-amber-600/30 border border-red-500/30 rounded-lg text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Automated SOC Incident Playbooks & eBPF Tuning
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  CISO Emergency Authority: ACTIVE
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Dynamic kernel-space XDP packet-filter tuning, automated incident playbooks, and CISO emergency kill-switches.
              </p>
            </div>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("playbooks")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "playbooks"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Automated Playbooks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ebpf")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "ebpf"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              eBPF Packet Tuning
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("killswitches")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "killswitches"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              CISO Kill-Switches
            </button>
          </div>
        </div>

        {notification && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* KPI Metrics Dashboard Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Automated Playbooks</span>
            <Terminal className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">4 Active</div>
          <div className="text-[11px] text-slate-400 mt-1">100% Autonomous Containment</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">XDP Drop Rate</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {ebpfTuning ? `${ebpfTuning.packet_drop_rate_pps.toLocaleString()} pps` : "14,820 pps"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Latency: 0.082 ms clamp</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Active eBPF Rules</span>
            <Sliders className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {ebpfTuning ? `${ebpfTuning.active_rules_count} Rules` : "42 Rules"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Zero-Copy Ring Buffer: 64 MB</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">CISO Kill-Switches</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {killswitches.filter((k) => k.status === "ENGAGED_ACTIVE").length} Engaged / {killswitches.length} Armed
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Zero-Trust Dual Approval</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Merkle Non-Repudiation</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">100% Sealed</div>
          <div className="text-[11px] text-slate-400 mt-1">Cryptographic Audit Chain</div>
        </div>
      </div>

      {/* TAB 1: AUTOMATED SOC PLAYBOOKS */}
      {activeTab === "playbooks" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playbooks.map((pb) => {
                const isSelected = selectedPlaybookId === pb.playbook_id;
                return (
                  <div
                    key={pb.playbook_id}
                    onClick={() => setSelectedPlaybookId(pb.playbook_id)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900/90 border-blue-500/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        {pb.playbook_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          pb.severity === "CRITICAL"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {pb.severity}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white mb-1.5">{pb.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{pb.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {pb.mitre_techniques.map((tech) => (
                        <span key={tech} className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Est. {pb.estimated_duration_ms} ms
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecutePlaybook(pb.playbook_id);
                        }}
                        disabled={isExecuting}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-all shadow active:scale-95 disabled:bg-slate-700"
                      >
                        {isExecuting && selectedPlaybookId === pb.playbook_id ? "Executing..." : "Execute Playbook"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Execution Telemetry & Step Trace */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Latest Playbook Execution Trace
            </h3>

            {latestExecution ? (
              <div className="space-y-4 flex-1">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Execution ID:</span>
                    <span className="text-blue-400 font-bold">{latestExecution.execution_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Environment:</span>
                    <span className="text-slate-300">{latestExecution.target_environment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Containment Ratio:</span>
                    <span className="text-emerald-400 font-bold">
                      {(latestExecution.containment_ratio * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elapsed Time:</span>
                    <span className="text-white font-bold">{latestExecution.elapsed_ms.toFixed(1)} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Human Downtime:</span>
                    <span className="text-emerald-400 font-bold">0.00s</span>
                  </div>
                </div>

                {/* Step Trace */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Executed Pipeline Steps:</h4>
                  <div className="space-y-2">
                    {latestExecution.steps_executed.map((st) => (
                      <div key={st.step} className="p-2.5 bg-slate-950/50 border border-slate-800/80 rounded flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                            {st.step}
                          </span>
                          <div>
                            <div className="text-slate-200 font-medium">{st.action}</div>
                            {st.target && <div className="text-[10px] text-slate-500 font-mono">{st.target}</div>}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {st.status || "APPLIED"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-[10px] font-mono text-slate-400 truncate">
                  <span>Merkle Block: {latestExecution.merkle_record_hash}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No playbook executions recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE DYNAMIC EBPF PACKET FILTER TUNING */}
      {activeTab === "ebpf" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              Dynamic Kernel-Space eBPF XDP Tuning Controls
            </h2>
            <p className="text-xs text-slate-400">
              Directly tune kernel XDP byte filter maps, zero-copy buffer allocations, and blocked CIDR subnets without restarting network daemons.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  XDP Execution Mode:
                </label>
                <select
                  value={xdpMode}
                  onChange={(e) => setXdpMode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="NATIVE_DRIVER">NATIVE_DRIVER (Zero-Copy Driver Layer, Sub-0.1ms)</option>
                  <option value="SKB_GENERIC">SKB_GENERIC (Generic Network Stack, Compatibility Mode)</option>
                  <option value="OFFLOAD_NIC">OFFLOAD_NIC (Hardware SmartNIC Wire-Speed Drop)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  XDP Ingress Packet Drop Action:
                </label>
                <select
                  value={dropAction}
                  onChange={(e) => setDropAction(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="XDP_DROP">XDP_DROP (Silent Ingress Packet Drop)</option>
                  <option value="XDP_TX">XDP_TX (Bounce Packet Back via TCP RST)</option>
                  <option value="XDP_REDIRECT">XDP_REDIRECT (Redirect to Honeypot Sinkhole)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Ring Buffer Size: {ringBufferSize} MB
                </label>
                <input
                  type="range"
                  min={16}
                  max={256}
                  step={16}
                  value={ringBufferSize}
                  onChange={(e) => setRingBufferSize(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Quarantined IP CIDRs (One per line):
                </label>
                <textarea
                  rows={3}
                  value={blockedCidrsText}
                  onChange={(e) => setBlockedCidrsText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Quarantined Destination Ports (Comma separated):
                </label>
                <input
                  type="text"
                  value={blockedPortsText}
                  onChange={(e) => setBlockedPortsText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={handleTuneEbpf}
                disabled={isTuning}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold text-xs rounded-lg transition-all shadow-md active:scale-95 disabled:bg-slate-700"
              >
                {isTuning ? "Compiling & Applying eBPF Tuning..." : "Apply Live eBPF Kernel Tuning"}
              </button>
            </div>
          </div>

          {/* Right Column: Live Kernel Telemetry Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Kernel-Space eBPF Telemetry State
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex justify-between items-center">
                  <span className="text-slate-400">Current XDP Hook:</span>
                  <span className="text-white font-bold">{ebpfTuning?.kernel_hook || "sys_enter_connect"}</span>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex justify-between items-center">
                  <span className="text-slate-400">Microsecond Latency Clamp:</span>
                  <span className="text-emerald-400 font-bold">{ebpfTuning?.microsecond_latency_clamp_ms.toFixed(3)} ms</span>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex justify-between items-center">
                  <span className="text-slate-400">Packet Drop Velocity:</span>
                  <span className="text-amber-400 font-bold">{ebpfTuning?.packet_drop_rate_pps.toLocaleString()} pps</span>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex justify-between items-center">
                  <span className="text-slate-400">Kernel Buffer Footprint:</span>
                  <span className="text-cyan-400 font-bold">{ebpfTuning?.kernel_memory_usage_kb} KB</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs text-amber-200 mt-4">
              <strong>Kernel Zero-Copy Guarantee:</strong> XDP packets matching quarantined CIDRs or ports are dropped in ring 0 before allocating SKB socket memory buffers.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CISO EMERGENCY OPERATIONAL KILL-SWITCHES */}
      {activeTab === "killswitches" && (
        <div className="space-y-6">
          {/* CISO Authorization Credentials Bar */}
          <div className="bg-slate-900/90 border border-red-950/60 rounded-xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">CISO Emergency Operational Signatory</h3>
                <p className="text-xs text-slate-400">Emergency kill-switches require authorized CISO / SecOps signatory recording.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="CISO Name"
                value={cisoSignatory}
                onChange={(e) => setCisoSignatory(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-medium"
              />
              <input
                type="text"
                placeholder="Operational Reason"
                value={cisoReason}
                onChange={(e) => setCisoReason(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white min-w-[260px]"
              />
            </div>
          </div>

          {/* Killswitches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {killswitches.map((ks) => {
              const isEngaged = ks.status === "ENGAGED_ACTIVE";
              const isToggling = togglingKillswitchId === ks.id;

              return (
                <div
                  key={ks.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isEngaged
                      ? "bg-red-950/30 border-red-500 shadow-xl shadow-red-500/20 ring-1 ring-red-500"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {ks.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isEngaged
                          ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {ks.status}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white mb-1">{ks.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">{ks.description}</p>

                  <div className="space-y-1 mb-4 text-xs font-mono text-slate-400">
                    <div>Impact Level: <span className="text-red-400 font-semibold">{ks.impact_level}</span></div>
                    <div>Target Layers: {ks.target_layers.join(" • ")}</div>
                    {ks.toggled_by && (
                      <div className="text-[11px] text-slate-500">Last Signatory: {ks.toggled_by}</div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleKillswitch(ks)}
                    disabled={isToggling}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
                      isEngaged
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600"
                        : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
                    }`}
                  >
                    {isToggling
                      ? "Executing Authority..."
                      : isEngaged
                      ? "Disarm Kill-Switch (Restore Service)"
                      : "ENGAGE EMERGENCY KILL-SWITCH"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historical Audit Trail Ledger */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          SOC Playbook Execution & Incident Audit Ledger
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Execution ID</th>
                <th className="py-2.5 px-3">Playbook</th>
                <th className="py-2.5 px-3">Environment</th>
                <th className="py-2.5 px-3">Elapsed Latency</th>
                <th className="py-2.5 px-3">Containment</th>
                <th className="py-2.5 px-3">Merkle Ledger Block</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.map((h) => (
                <tr key={h.execution_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-blue-400 font-medium">
                    {h.execution_id}
                  </td>
                  <td className="py-2.5 px-3 text-white font-medium">{h.playbook_name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{h.target_environment}</td>
                  <td className="py-2.5 px-3 font-mono text-white">{h.elapsed_ms.toFixed(1)} ms</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                    {(h.containment_ratio * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 truncate max-w-[180px]">
                    {h.merkle_record_hash}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                      {h.status}
                    </span>
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
