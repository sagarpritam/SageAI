"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Globe2,
  Lock,
  RefreshCw,
  Zap,
  Activity,
  CheckCircle2,
  Radio,
  KeyRound,
  ShieldAlert,
  Clock,
  Compass,
} from "lucide-react";

interface SatelliteRecord {
  satellite_id: string;
  name: string;
  altitude_km: number;
  inclination_deg: number;
  isl_links_active: number;
  fso_wavelength_nm: number;
  pat_tracking_error_urad: number;
  session_key_sha256: string;
  key_rotation_cadence_sec: number;
  status: string;
}

interface RekeyResult {
  rekey_id: string;
  satellite_id: string;
  algorithm: string;
  session_key_sha256: string;
  ephemeral_cadence_sec: number;
  handshake_latency_ms: number;
  status: string;
}

export function OrbitalLaserMeshStudio() {
  const [satellites, setSatellites] = useState<SatelliteRecord[]>([]);
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [rekeying, setRekeying] = useState(false);
  const [rekeyResult, setRekeyResult] = useState<RekeyResult | null>(null);
  const [countdown, setCountdown] = useState<number>(45);

  const fetchSatellites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orbital-laser/satellites");
      const data = await res.json();
      if (data.satellites) {
        setSatellites(data.satellites);
        if (data.satellites.length > 0) {
          setSelectedSatellite((prev) => prev || data.satellites[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSatellites();
  }, [fetchSatellites]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleRekey() {
    if (!selectedSatellite) return;
    setRekeying(true);
    try {
      const res = await fetch("/api/orbital-laser/rekey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ satellite_id: selectedSatellite.satellite_id }),
      });
      const data = await res.json();
      if (data.rekey) {
        setRekeyResult(data.rekey);
        setSatellites((prev) =>
          prev.map((s) =>
            s.satellite_id === selectedSatellite.satellite_id
              ? { ...s, session_key_sha256: data.rekey.session_key_sha256 }
              : s
          )
        );
        setSelectedSatellite((prev) =>
          prev ? { ...prev, session_key_sha256: data.rekey.session_key_sha256 } : null
        );
        setCountdown(60);
      }
    } finally {
      setRekeying(false);
    }
  }

  const totalLinks = satellites.reduce((acc, curr) => acc + (curr.isl_links_active || 0), 0);

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl text-violet-400">
            <Globe2 className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Spaceborne Satellite Laser Inter-Link (ISL) Defense
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                CAP-51
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ML-KEM-768 FSO
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Low Earth Orbit (LEO) Free-Space Optical laser constellation with 60-second ephemeral quantum-safe rekeying and CCSDS telecommand hardening.
            </p>
          </div>
        </div>

        <button
          onClick={fetchSatellites}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Constellation
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Constellation Satellites</p>
            <p className="text-2xl font-bold text-white mt-1">{satellites.length} Nodes</p>
            <p className="text-xs text-violet-400 mt-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> LEO 550 km Orbit
            </p>
          </div>
          <Globe2 className="w-8 h-8 text-violet-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Active Laser ISL Links</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{totalLinks}</p>
            <p className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> 1550nm Infrared Optical Lock
            </p>
          </div>
          <Radio className="w-8 h-8 text-emerald-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Ephemeral Rekey Cycle</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{countdown}s</p>
            <p className="text-xs text-amber-400/80 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 60s Cadence (NIST FIPS 203)
            </p>
          </div>
          <KeyRound className="w-8 h-8 text-amber-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">PAT Pointing Error</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">&lt; 0.45 &mu;rad</p>
            <p className="text-xs text-zinc-400 mt-1">Diffraction-Limited Tracking</p>
          </div>
          <Activity className="w-8 h-8 text-cyan-400 opacity-60" />
        </div>
      </div>

      {/* Main Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Constellation Nodes */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-violet-400" /> Spaceborne Satellite Nodes
          </h2>

          <div className="space-y-3">
            {satellites.map((sat) => {
              const isSelected = selectedSatellite?.satellite_id === sat.satellite_id;
              return (
                <div
                  key={sat.satellite_id}
                  onClick={() => {
                    setSelectedSatellite(sat);
                    setRekeyResult(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-800/90 border-violet-500/50 shadow-lg shadow-violet-500/10"
                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white text-sm">{sat.name}</span>
                      <p className="text-xs text-zinc-400 mt-1 font-mono">
                        {sat.satellite_id} &bull; Alt: {sat.altitude_km} km &bull; Inc: {sat.inclination_deg}&deg;
                      </p>
                    </div>

                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {sat.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/80 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Laser ISL Links:</span>
                      <span className="font-mono text-cyan-300">{sat.isl_links_active} Active Links</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">PAT Tracking Error:</span>
                      <span className="font-mono text-emerald-400">{sat.pat_tracking_error_urad} &mu;rad</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Rekeying & Optical Link Hardening Console */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Lock className="w-4 h-4 text-violet-400" /> Ephemeral PQC Rekeying & Beam Hardening
          </h2>

          {selectedSatellite ? (
            <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedSatellite.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Node ID: {selectedSatellite.satellite_id} | Optical Wave: {selectedSatellite.fso_wavelength_nm} nm
                  </p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-mono">
                  Cadence: {selectedSatellite.key_rotation_cadence_sec}s Ephemeral
                </div>
              </div>

              {/* Current Session Key */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <span className="text-xs uppercase font-semibold text-zinc-400 block">
                  Active Laser ISL Post-Quantum Session Key (ML-KEM-768)
                </span>
                <p className="font-mono text-xs text-violet-300 break-all select-all">
                  {selectedSatellite.session_key_sha256}
                </p>
              </div>

              {/* Trigger Rekey Button */}
              <button
                onClick={handleRekey}
                disabled={rekeying}
                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white shadow-lg shadow-violet-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {rekeying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Trigger Ephemeral PQC Laser Rekey Handshake
              </button>

              {/* Rekey Output Banner */}
              {rekeyResult && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm">
                      OPTICAL ISL REKEY COMPLETED IN {rekeyResult.handshake_latency_ms} ms
                    </span>
                  </div>
                  <p className="text-xs font-mono text-emerald-300">
                    Algorithm: {rekeyResult.algorithm} &bull; Rekey ID: {rekeyResult.rekey_id}
                  </p>
                </div>
              )}

              {/* CCSDS Telecommand Defense Info */}
              <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/60 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-zinc-200">
                  <ShieldAlert className="w-4 h-4 text-violet-400" /> CCSDS Space Telecommand Hardening
                </div>
                <ul className="text-zinc-400 space-y-1 list-disc list-inside">
                  <li>Mutual authentication enforced for ground stations (Svalbard, Kauai, Canberra).</li>
                  <li>Monotonically strictly increasing anti-replay counter prevents orbital hijacking.</li>
                  <li>Free-space optical beam pointing monitored against spaceborne laser dazzling attacks.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">
              Select a satellite node on the left to inspect laser mesh telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

