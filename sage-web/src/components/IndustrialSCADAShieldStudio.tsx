"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  Server,
  RefreshCw,
  AlertTriangle,
  Flame,
  Droplets,
  Radio,
  Sliders,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface PLCRecord {
  plc_id: string;
  name: string;
  sector: string;
  protocol: string;
  ip_address: string;
  enforced_envelope: string;
  current_telemetry: Record<string, number>;
  status: string;
  threats_clamped: number;
}

interface InspectionResult {
  verdict: string;
  plc_id: string;
  protocol?: string;
  requested_value: number;
  clamped_value: number;
  clamped: boolean;
  action_taken: string;
  envelope?: string;
  timestamp?: string;
}

export function IndustrialSCADAShieldStudio() {
  const [plcs, setPlcs] = useState<PLCRecord[]>([]);
  const [selectedPlc, setSelectedPlc] = useState<PLCRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [testValue, setTestValue] = useState<number>(4500);
  const [inspecting, setInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);
  const [inspectionLogs, setInspectionLogs] = useState<InspectionResult[]>([]);

  useEffect(() => {
    fetchPLCs();
  }, []);

  async function fetchPLCs() {
    setLoading(true);
    try {
      const res = await fetch("/api/industrial-scada/plcs");
      const data = await res.json();
      if (data.plcs) {
        setPlcs(data.plcs);
        if (!selectedPlc && data.plcs.length > 0) {
          setSelectedPlc(data.plcs[0]);
          setDefaultValueForPlc(data.plcs[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function setDefaultValueForPlc(plc: PLCRecord) {
    if (plc.enforced_envelope.includes("RPM")) {
      setTestValue(4800);
    } else if (plc.enforced_envelope.includes("PH")) {
      setTestValue(13.5);
    } else {
      setTestValue(68.5);
    }
  }

  function handleSelectPlc(plc: PLCRecord) {
    setSelectedPlc(plc);
    setDefaultValueForPlc(plc);
    setInspectionResult(null);
  }

  async function handleTransmitPacket() {
    if (!selectedPlc) return;
    setInspecting(true);
    try {
      const res = await fetch("/api/industrial-scada/inspect-packet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plc_id: selectedPlc.plc_id,
          protocol: selectedPlc.protocol,
          function_code: 16, // Preset Multiple Registers
          register_address: 4001,
          requested_value: Number(testValue),
        }),
      });
      const data = await res.json();
      if (data.inspection) {
        const item: InspectionResult = {
          ...data.inspection,
          timestamp: new Date().toLocaleTimeString(),
        };
        setInspectionResult(item);
        setInspectionLogs((prev) => [item, ...prev.slice(0, 9)]);

        // Update local clamped count if clamped
        if (item.clamped) {
          setPlcs((prev) =>
            prev.map((p) =>
              p.plc_id === selectedPlc.plc_id
                ? { ...p, threats_clamped: p.threats_clamped + 1 }
                : p
            )
          );
          setSelectedPlc((prev) =>
            prev ? { ...prev, threats_clamped: prev.threats_clamped + 1 } : null
          );
        }
      }
    } finally {
      setInspecting(false);
    }
  }

  const totalClamped = plcs.reduce((acc, curr) => acc + (curr.threats_clamped || 0), 0);

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Zap className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                ICS/SCADA Kinetic Shield & Actuator Clamps
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                CAP-48
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Out-of-Band Clamps Armed
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Autonomous Layer-7 deep packet inspection for Modbus TCP and DNP3 industrial protocols with hardware-speed kinetic safety envelopes.
            </p>
          </div>
        </div>

        <button
          onClick={fetchPLCs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh SCADA Telemetry
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Protected PLCs</p>
            <p className="text-2xl font-bold text-white mt-1">{plcs.length}</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% In-Line Filtered
            </p>
          </div>
          <Server className="w-8 h-8 text-indigo-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Clamped Kinetic Attacks</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{totalClamped}</p>
            <p className="text-xs text-amber-400/80 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Physical Destructive Limits
            </p>
          </div>
          <Flame className="w-8 h-8 text-amber-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Protocols Filtered</p>
            <p className="text-xl font-bold text-white mt-1">Modbus TCP / DNP3</p>
            <p className="text-xs text-zinc-400 mt-1">L7 Deep Packet Inspection</p>
          </div>
          <Radio className="w-8 h-8 text-cyan-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Actuator Clamping Speed</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">&lt; 1.2 ms</p>
            <p className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Zero-Drift Envelope Guard
            </p>
          </div>
          <Activity className="w-8 h-8 text-emerald-400 opacity-60" />
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: PLCs Inventory */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" /> Monitored Industrial Infrastructure
          </h2>

          <div className="space-y-3">
            {plcs.map((plc) => {
              const isSelected = selectedPlc?.plc_id === plc.plc_id;
              return (
                <div
                  key={plc.plc_id}
                  onClick={() => handleSelectPlc(plc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-800/90 border-amber-500/50 shadow-lg shadow-amber-500/10"
                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {plc.sector.includes("Energy") ? (
                          <Flame className="w-4 h-4 text-amber-400" />
                        ) : plc.sector.includes("Water") ? (
                          <Droplets className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Zap className="w-4 h-4 text-yellow-400" />
                        )}
                        <span className="font-semibold text-white text-sm">{plc.name}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        {plc.sector} &bull; <span className="font-mono text-zinc-300">{plc.ip_address}</span>
                      </p>
                    </div>

                    <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {plc.protocol}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <div>
                      <span>Envelope: </span>
                      <span className="font-mono text-indigo-300">{plc.enforced_envelope}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">Clamped:</span>
                      <span className="font-mono font-bold text-amber-400">{plc.threats_clamped}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Packet Injector & Safety Clamp Simulator */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" /> In-Line Micro-Firewall & Actuator Safety Clamp Simulator
          </h2>

          {selectedPlc ? (
            <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedPlc.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Target PLC ID: {selectedPlc.plc_id} | Protocol: {selectedPlc.protocol}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
                  Envelope: {selectedPlc.enforced_envelope}
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Target Actuator / Setpoint Register Value
                </label>

                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="any"
                    value={testValue}
                    onChange={(e) => setTestValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-mono text-base focus:outline-none focus:border-amber-500"
                    placeholder="Enter setpoint value..."
                  />

                  <button
                    onClick={handleTransmitPacket}
                    disabled={inspecting}
                    className="whitespace-nowrap px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {inspecting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    Transmit SCADA Packet
                  </button>
                </div>

                <div className="text-xs text-zinc-400 flex flex-wrap gap-2">
                  <span className="text-zinc-500">Quick Test Cases:</span>
                  {selectedPlc.enforced_envelope.includes("RPM") && (
                    <>
                      <button
                        onClick={() => setTestValue(3000)}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono"
                      >
                        Safe (3000 RPM)
                      </button>
                      <button
                        onClick={() => setTestValue(3800)}
                        className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono"
                      >
                        Overspeed Attack (3800 RPM)
                      </button>
                      <button
                        onClick={() => setTestValue(5200)}
                        className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-mono"
                      >
                        Catastrophic Rupture (5200 RPM)
                      </button>
                    </>
                  )}
                  {selectedPlc.enforced_envelope.includes("PH") && (
                    <>
                      <button
                        onClick={() => setTestValue(7.2)}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono"
                      >
                        Neutral Safe (7.2 pH)
                      </button>
                      <button
                        onClick={() => setTestValue(13.8)}
                        className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-mono"
                      >
                        Toxic Lye Poisoning (13.8 pH)
                      </button>
                    </>
                  )}
                  {selectedPlc.enforced_envelope.includes("FREQUENCY") && (
                    <>
                      <button
                        onClick={() => setTestValue(60.0)}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono"
                      >
                        Standard Grid (60.0 Hz)
                      </button>
                      <button
                        onClick={() => setTestValue(68.5)}
                        className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-mono"
                      >
                        Grid Instability Desync (68.5 Hz)
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Real-time Verdict Output */}
              {inspectionResult && (
                <div
                  className={`p-5 rounded-xl border transition-all ${
                    inspectionResult.clamped
                      ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                      : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {inspectionResult.clamped ? (
                        <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      )}
                      <div>
                        <span className="font-bold text-sm tracking-wide">
                          {inspectionResult.verdict === "BLOCKED_AND_CLAMPED"
                            ? "OUT-OF-BAND ACTUATOR CLAMP ENGAGED"
                            : "PACKET PERMITTED (WITHIN SAFETY ENVELOPE)"}
                        </span>
                        <p className="text-xs opacity-80 mt-0.5">
                          Action: {inspectionResult.action_taken}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                        inspectionResult.clamped
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {inspectionResult.verdict}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-zinc-400 block">Requested Payload Value:</span>
                      <span className="font-mono text-base font-bold text-rose-300">
                        {inspectionResult.requested_value}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Actuator Physical Clamp:</span>
                      <span className="font-mono text-base font-bold text-emerald-300">
                        {inspectionResult.clamped_value}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Inspection History Log */}
              {inspectionLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-semibold text-zinc-400">Recent Packet Verifications</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {inspectionLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/60 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">{log.timestamp}</span>
                          <span className={log.clamped ? "text-rose-400 font-bold" : "text-emerald-400"}>
                            {log.verdict}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">Req: {log.requested_value}</span>
                          <span className="text-zinc-400">&rarr;</span>
                          <span className="text-emerald-400 font-bold">Clamp: {log.clamped_value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">
              Select an industrial PLC on the left to configure actuator safety clamps and run in-line packet tests.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

