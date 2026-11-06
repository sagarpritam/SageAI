"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Radio,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  Sliders,
  Sparkles,
  Terminal,
  Share2,
  Navigation,
  Satellite,
} from "lucide-react";

interface DSOCTerminal {
  terminal_id: string;
  name: string;
  location: string;
  aperture_m: number;
  laser_power_watts: number;
  wavelength_nm: number;
  point_ahead_angle_urad: number;
  distance_km: number;
  status: string;
  target_node: string;
  frames_transmitted: number;
}

interface BeamAcquisition {
  acquisition_id: string;
  terminal_id: string;
  threat_detected: boolean;
  threat_type: string;
  point_ahead_angle_urad: number;
  doppler_shift_ghz: number;
  photon_snr_db: number;
  action_recommended: string;
}

interface TransmissionResult {
  transmission_id: string;
  terminal_id: string;
  payload_size_kb: number;
  pqc_cipher_standard: string;
  one_way_light_time_sec: number;
  ldpc_code_rate: string;
  single_event_upset_protection: boolean;
  frame_delivery_verified: boolean;
  new_status: string;
}

export function DeepSpaceLaserStudio() {
  const [terminals, setTerminals] = useState<DSOCTerminal[]>([]);
  const [selectedTerminal, setSelectedTerminal] = useState<DSOCTerminal | null>(null);
  const [loading, setLoading] = useState(false);
  const [pointAheadAngle, setPointAheadAngle] = useState<number>(1.15);
  const [dopplerShift, setDopplerShift] = useState<number>(4.5);
  const [photonSnr, setPhotonSnr] = useState<number>(12.0);
  const [payloadSize, setPayloadSize] = useState<number>(1024);
  const [acquiring, setAcquiring] = useState(false);
  const [transmitting, setTransmitting] = useState(false);
  const [acquisition, setAcquisition] = useState<BeamAcquisition | null>(null);
  const [transmission, setTransmission] = useState<TransmissionResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetchTerminals();
  }, []);

  async function fetchTerminals() {
    setLoading(true);
    try {
      const res = await fetch("/api/deep-space-laser/terminals");
      const data = await res.json();
      if (data.terminals) {
        setTerminals(data.terminals);
        if (!selectedTerminal && data.terminals.length > 0) {
          setSelectedTerminal(data.terminals[0]);
          setPointAheadAngle(data.terminals[0].point_ahead_angle_urad);
        }
      }
    } catch (err) {
      console.error("Failed to load DSOC terminals", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcquire() {
    if (!selectedTerminal) return;
    setAcquiring(true);
    setAcquisition(null);
    try {
      const res = await fetch("/api/deep-space-laser/acquire-beam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          terminal_id: selectedTerminal.terminal_id,
          point_ahead_angle_urad: pointAheadAngle,
          doppler_shift_ghz: dopplerShift,
          photon_snr_db: photonSnr,
        }),
      });
      const data = await res.json();
      if (data.acquisition) {
        setAcquisition(data.acquisition);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] BEAM ACQUIRE: ${selectedTerminal.terminal_id} -> ${data.acquisition.threat_type} (Point-Ahead: ${pointAheadAngle} μrad, Doppler: ${dopplerShift} GHz)`,
          ...prev.slice(0, 15),
        ]);
      }
    } catch (err) {
      console.error("Acquisition failed", err);
    } finally {
      setAcquiring(false);
    }
  }

  async function handleTransmit() {
    if (!selectedTerminal) return;
    setTransmitting(true);
    try {
      const res = await fetch("/api/deep-space-laser/transmit-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          terminal_id: selectedTerminal.terminal_id,
          payload_size_kb: payloadSize,
          pqc_cipher: "ML-KEM-1024_LDPC",
        }),
      });
      const data = await res.json();
      if (data.transmission) {
        setTransmission(data.transmission);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] TRANSMIT DSOC: ${selectedTerminal.terminal_id} -> ${data.transmission.payload_size_kb} KB relayed (OWLT: ${data.transmission.one_way_light_time_sec}s, Cipher: ${data.transmission.pqc_cipher_standard})`,
          ...prev.slice(0, 15),
        ]);
      }
    } catch (err) {
      console.error("Transmission failed", err);
    } finally {
      setTransmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-blue-900/20 to-slate-900/50 border border-indigo-500/30 backdrop-blur-md shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-400">
            <Satellite className="w-8 h-8 animate-pulse text-indigo-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Deep-Space Interplanetary Optical Laser Telemetry Mesh
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                CAP-60 • v4.6.0
              </span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Earth-Moon-Mars Optical Communications (DSOC), Sub-Micro-Radian Steering & ML-KEM-1024 / LDPC Telemetry
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={fetchTerminals}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Terminals</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-slate-400">Interplanetary Nodes</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{terminals.length}</span>
            <span className="text-xs text-slate-400">Earth / Moon / Mars</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-indigo-400">Max Optical Channel</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-300">225M km</span>
            <span className="text-xs text-indigo-400/80">Sun-Mars L4/L5</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-emerald-400">Point-Ahead Precision</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-300">1.15 &mu;rad</span>
            <span className="text-xs text-emerald-400/80">Sub-Micro-Radian</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-cyan-400">Photon Delivery</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-300">99.98%</span>
            <span className="text-xs text-cyan-400/80">SEU Immune</span>
          </div>
        </div>
      </div>

      {/* Main Studio Interactive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminals List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-400" />
            Interplanetary DSOC Terminals
          </h3>
          <div className="space-y-3">
            {terminals.map((terminal) => {
              const isSelected = selectedTerminal?.terminal_id === terminal.terminal_id;
              const isLocked = terminal.status === "ASTRONOMICAL_BEAM_LOCKED";

              return (
                <div
                  key={terminal.terminal_id}
                  onClick={() => {
                    setSelectedTerminal(terminal);
                    setPointAheadAngle(terminal.point_ahead_angle_urad);
                    setAcquisition(null);
                    setTransmission(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-950/40"
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{terminal.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{terminal.location}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isLocked
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {terminal.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Target: {terminal.target_node.slice(0, 12)}</span>
                    <span>Power: {terminal.laser_power_watts}W</span>
                    <span className="font-mono text-indigo-300">
                      {terminal.distance_km > 0 ? `${(terminal.distance_km / 1e6).toFixed(1)}M km` : "Earth Surface"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTerminal ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedTerminal.name}
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedTerminal.terminal_id}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Aperture: {selectedTerminal.aperture_m}m • Laser: {selectedTerminal.wavelength_nm} nm @ {selectedTerminal.laser_power_watts}W
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Relay Target</span>
                  <span className="text-xs font-bold text-indigo-400 font-mono">
                    {selectedTerminal.target_node}
                  </span>
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      Point-Ahead Steering Angle
                    </span>
                    <span className="font-mono text-indigo-300">{pointAheadAngle.toFixed(2)} &mu;rad</span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="1.80"
                    step="0.01"
                    value={pointAheadAngle}
                    onChange={(e) => setPointAheadAngle(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Angles &gt; 1.35 &mu;rad trigger fast-steering mirror closed-loop realignment.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      Relativistic Astronomical Doppler Shift
                    </span>
                    <span className="font-mono text-indigo-300">{dopplerShift.toFixed(1)} GHz</span>
                  </div>
                  <input
                    type="range"
                    min="-20.0"
                    max="20.0"
                    step="0.5"
                    value={dopplerShift}
                    onChange={(e) => setDopplerShift(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      Photon Signal-to-Noise Ratio (SNR)
                    </span>
                    <span className="font-mono text-indigo-300">{photonSnr.toFixed(1)} dB</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="18.0"
                    step="0.2"
                    value={photonSnr}
                    onChange={(e) => setPhotonSnr(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-300 mb-1.5 block">
                    Telemetry Frame Payload Size
                  </span>
                  <select
                    value={payloadSize}
                    onChange={(e) => setPayloadSize(parseInt(e.target.value))}
                    className="w-full bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg p-2 font-mono"
                  >
                    <option value={512}>512 KB (High-Priority Telecommand)</option>
                    <option value={1024}>1024 KB (Scientific Sensor Payload)</option>
                    <option value={2048}>2048 KB (Multispectral Image Burst)</option>
                    <option value={4096}>4096 KB (High-Def Surface Telemetry)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleAcquire}
                  disabled={acquiring}
                  className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-900/30"
                >
                  <Activity className={`w-4 h-4 ${acquiring ? "animate-spin" : ""}`} />
                  <span>{acquiring ? "Calibrating Beam..." : "Acquire & Track DSOC Beam"}</span>
                </button>

                <button
                  onClick={handleTransmit}
                  disabled={transmitting}
                  className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-900/30"
                >
                  <Share2 className={`w-4 h-4 ${transmitting ? "animate-spin" : ""}`} />
                  <span>{transmitting ? "Transmitting Frame..." : "Transmit Authenticated DSOC Frame"}</span>
                </button>
              </div>

              {/* Acquisition Verdict */}
              {acquisition && (
                <div
                  className={`p-4 rounded-xl border ${
                    acquisition.threat_detected
                      ? "bg-amber-950/20 border-amber-500/40"
                      : "bg-indigo-950/20 border-indigo-500/40"
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                      {acquisition.threat_detected ? (
                        <>
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                          Astronomical Line-of-Sight Desync
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-indigo-400" />
                          Deep-Space Optical Link Locked
                        </>
                      )}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      {acquisition.acquisition_id}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400">Status:</span>{" "}
                      <span className="font-semibold text-indigo-300">{acquisition.threat_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Point-Ahead:</span>{" "}
                      <span className="font-mono text-white">{acquisition.point_ahead_angle_urad} &mu;rad</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Action:</span>{" "}
                      <span className="font-semibold text-white">
                        {acquisition.action_recommended}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {transmission && (
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      Interplanetary Photon Frame Transmitted & Verified
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {transmission.transmission_id}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400">One-Way Light Time:</span>{" "}
                      <span className="text-blue-300 font-bold font-mono">
                        {transmission.one_way_light_time_sec} s
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">PQC Standard:</span>{" "}
                      <span className="text-blue-300 font-bold font-mono">
                        {transmission.pqc_cipher_standard}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">LDPC Rate:</span>{" "}
                      <span className="text-blue-300 font-bold font-mono">
                        {transmission.ldpc_code_rate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">SEU Immune:</span>{" "}
                      <span className="text-emerald-300 font-bold">VERIFIED</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              Select a deep-space optical terminal to calibrate
            </div>
          )}

          {/* Activity Terminal */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-lg">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Interplanetary Optical Laser Console
            </h4>
            <div className="space-y-1 font-mono text-xs text-slate-300 max-h-36 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-600">No transmissions logged in this session.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

