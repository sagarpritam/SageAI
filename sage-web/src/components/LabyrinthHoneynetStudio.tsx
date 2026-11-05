"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  AlertOctagon,
  Clock,
  Terminal,
  Activity,
  Zap,
  RefreshCw,
  Search,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  Cpu,
  Radio,
  Eye,
} from "lucide-react";

interface LabyrinthRecord {
  labyrinth_id: string;
  name: string;
  architecture_type: string;
  depth_levels: number;
  deception_persona: string;
  active_traps: number;
  adversaries_trapped: number;
  total_dwell_time_sec: number;
  simulated_services: Array<{ port: number; service: string }>;
}

export function LabyrinthHoneynetStudio() {
  const [mazes, setMazes] = useState<LabyrinthRecord[]>([]);
  const [selectedMaze, setSelectedMaze] = useState<LabyrinthRecord | null>(null);
  const [loading, setLoading] = useState(false);

  // Probe simulator state
  const [probeCmd, setProbeCmd] = useState("cat /etc/shadow");
  const [adversaryIp, setAdversaryIp] = useState("198.51.100.89");
  const [trapping, setTrapping] = useState(false);
  const [trapResult, setTrapResult] = useState<any | null>(null);

  useEffect(() => {
    fetchMazes();
  }, []);

  async function fetchMazes() {
    setLoading(true);
    try {
      const res = await fetch("/api/labyrinth-honeynet/mazes");
      const data = await res.json();
      if (data.mazes) {
        setMazes(data.mazes);
        if (!selectedMaze && data.mazes.length > 0) {
          setSelectedMaze(data.mazes[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulateProbe(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMaze) return;
    setTrapping(true);
    try {
      const res = await fetch("/api/labyrinth-honeynet/trap-adversary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labyrinth_id: selectedMaze.labyrinth_id,
          adversary_ip: adversaryIp,
          probe_command: probeCmd,
        }),
      });
      const data = await res.json();
      if (data.trap) {
        setTrapResult(data.trap);
        setSelectedMaze((prev) =>
          prev
            ? {
                ...prev,
                adversaries_trapped: prev.adversaries_trapped + 1,
                total_dwell_time_sec: prev.total_dwell_time_sec + 30,
              }
            : null
        );
      }
    } finally {
      setTrapping(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-950 border border-orange-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Capability 45
            </span>
            <span className="text-xs text-slate-400">Recursive Deception & Latency Trap Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-orange-400" />
            AI-Synthesized Autonomous Honeynet Labyrinths
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Multi-tier deceptive mazes simulating SWIFT core networks, Kubernetes control planes, and AI foundation model weights with state mirroring and adaptive latency exhaustion.
          </p>
        </div>
        <button
          onClick={fetchMazes}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Labyrinth Metrics Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Active Labyrinths</div>
          <div className="text-2xl font-bold text-white mt-1">{mazes.length}</div>
          <div className="text-xs text-orange-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> State Mirroring Active
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Adversaries Trapped</div>
          <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">
            {mazes.reduce((acc, m) => acc + (m.adversaries_trapped || 0), 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Stalled in recursive mazes</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Dwell Time Injected</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
            {Math.round(mazes.reduce((acc, m) => acc + (m.total_dwell_time_sec || 0), 0) / 60)} min
          </div>
          <div className="text-xs text-slate-500 mt-1">Scanner threads exhausted</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Canary Watermarks</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">100%</div>
          <div className="text-xs text-slate-500 mt-1">Downstream leak tracking</div>
        </div>
      </div>

      {/* Main Studio View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Labyrinth Selection */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Configured Labyrinths ({mazes.length})
          </h3>
          {mazes.map((maze) => {
            const isSelected = selectedMaze?.labyrinth_id === maze.labyrinth_id;
            return (
              <div
                key={maze.labyrinth_id}
                onClick={() => setSelectedMaze(maze)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? "bg-slate-800/90 border-orange-500/50 shadow-lg shadow-orange-950/20"
                    : "bg-slate-900/50 border-slate-800 hover:bg-slate-850 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-white">{maze.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                    Depth: {maze.depth_levels}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">{maze.deception_persona}</div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800">
                  <span>Trapped: {maze.adversaries_trapped} bots</span>
                  <span className="font-mono text-emerald-400">{Math.round(maze.total_dwell_time_sec / 60)} min dwell</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: State Mirroring & Probe Testing Console */}
        <div className="lg:col-span-2 space-y-4">
          {selectedMaze ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-orange-400" />
                    {selectedMaze.name}
                  </h3>
                  <span className="text-xs font-mono text-orange-300 bg-orange-950/40 px-2.5 py-1 rounded border border-orange-800/40">
                    {selectedMaze.architecture_type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Persona: {selectedMaze.deception_persona} &bull; Depth: {selectedMaze.depth_levels} recursive tiers
                </p>
              </div>

              {/* Simulated Exposed Services */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Simulated Bait Services & Ingress Points
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedMaze.simulated_services?.map((svc, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <div className="text-orange-400 font-mono font-bold">Port {svc.port}</div>
                      <div className="text-slate-300 text-[11px] truncate mt-0.5">{svc.service}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Probe Simulator Form */}
              <form onSubmit={handleSimulateProbe} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-orange-400" />
                  Simulate Adversary Probe into Labyrinth
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400">Adversary Source IP</label>
                    <input
                      type="text"
                      value={adversaryIp}
                      onChange={(e) => setAdversaryIp(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Adversary Recon Command</label>
                    <input
                      type="text"
                      value={probeCmd}
                      onChange={(e) => setProbeCmd(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={trapping}
                  className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Send Probe & Trigger Adaptive Latency Trap
                </button>
              </form>

              {/* Trap Output Feed */}
              {trapResult && (
                <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-800/40 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-orange-300">
                      Trap Response (Depth: {trapResult.current_depth} / {trapResult.max_maze_depth})
                    </span>
                    <span className="font-mono text-emerald-400">
                      +{trapResult.delay_injected_sec}s Delay Injected
                    </span>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto select-all">
                    {trapResult.state_mirrored_response}
                  </pre>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Watermarked canary credential delivered: <span className="font-mono text-orange-300">{trapResult.canary_token_seeded}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500">
              Select a honeynet labyrinth to inspect recursive bait architecture and live traps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
