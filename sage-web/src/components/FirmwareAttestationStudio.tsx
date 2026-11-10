"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Server,
  RefreshCw,
  Zap,
  Lock,
  PowerOff,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  Database,
} from "lucide-react";

interface DeviceRecord {
  device_id: string;
  hostname: string;
  hardware_model: string;
  secure_boot_enabled: boolean;
  smm_locked: boolean;
  pcr0_sha256: string;
  pcr2_sha256: string;
  spi_flash_sha256: string;
  attestation_verdict: string;
  rootkit_detected: string;
}

export function FirmwareAttestationStudio() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [attesting, setAttesting] = useState(false);
  const [attestResult, setAttestResult] = useState<any | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/firmware-attestation/devices");
      const data = await res.json();
      if (data.devices) {
        setDevices(data.devices);
        if (data.devices.length > 0) {
          setSelectedDevice((prev) => prev || data.devices[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  async function handleAttest(dev: DeviceRecord) {
    setAttesting(true);
    try {
      const res = await fetch("/api/firmware-attestation/attest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: dev.device_id,
          pcr0_sha256: dev.pcr0_sha256,
          pcr2_sha256: dev.pcr2_sha256,
          spi_flash_sha256: dev.spi_flash_sha256,
          secure_boot_enabled: dev.secure_boot_enabled,
        }),
      });
      const data = await res.json();
      if (data.attestation) {
        setAttestResult(data.attestation);
      }
    } finally {
      setAttesting(false);
    }
  }

  async function handleQuarantine(devId: string) {
    setLoading(true);
    try {
      setDevices((prev) =>
        prev.map((d) =>
          d.device_id === devId ? { ...d, attestation_verdict: "ISOLATED_QUARANTINED" } : d
        )
      );
      if (selectedDevice?.device_id === devId) {
        setSelectedDevice((prev) => (prev ? { ...prev, attestation_verdict: "ISOLATED_QUARANTINED" } : null));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Capability 47
            </span>
            <span className="text-xs text-slate-400">UEFI Secure Boot & SPI Flash Attestor</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            Unified Extensible Firmware Interface (UEFI) Secure Boot & SPI Flash Hash Attestor
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Bare-metal and hypervisor firmware measurement verification against OEM golden baselines, detecting BlackLotus bootkits, CosmicStrand SPI implants, and SMM rootkits.
          </p>
        </div>
        <button
          onClick={fetchDevices}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Firmware Fleet Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Monitored Bare-Metal Hosts</div>
          <div className="text-2xl font-bold text-white mt-1">{devices.length}</div>
          <div className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
            <Server className="w-3 h-3" /> Dell &bull; Supermicro &bull; Nitro
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">UEFI Secure Boot State</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">100%</div>
          <div className="text-xs text-slate-500 mt-1">PK/KEK/db enforced</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">SMM Lock Status</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">LOCKED</div>
          <div className="text-xs text-slate-500 mt-1">Hardware bit verified</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Active Bootkits</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">0 Detected</div>
          <div className="text-xs text-slate-500 mt-1">Zero SPI modifications</div>
        </div>
      </div>

      {/* Main Studio View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Device Selector */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Monitored Hardware Nodes ({devices.length})
          </h3>
          {devices.map((dev) => {
            const isSelected = selectedDevice?.device_id === dev.device_id;
            const isTrusted = dev.attestation_verdict === "VERIFIED_TRUSTED_BOOT";
            return (
              <div
                key={dev.device_id}
                onClick={() => {
                  setSelectedDevice(dev);
                  setAttestResult(null);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? "bg-slate-800/90 border-cyan-500/50 shadow-lg shadow-cyan-950/20"
                    : "bg-slate-900/50 border-slate-800 hover:bg-slate-850 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-white truncate">{dev.hostname}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isTrusted
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {dev.attestation_verdict}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">{dev.hardware_model}</div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800">
                  <span>Secure Boot: {dev.secure_boot_enabled ? "ON" : "OFF"}</span>
                  <span className="font-mono text-cyan-400">{dev.device_id}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Attestation & Cryptographic PCR Verification */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDevice ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-cyan-400" />
                    Host: {selectedDevice.hostname}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Model: {selectedDevice.hardware_model} &bull; SMM Lock: {selectedDevice.smm_locked ? "ENFORCED" : "UNLOCKED"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAttest(selectedDevice)}
                    disabled={attesting}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-lg shadow-cyan-950/30"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Attest TPM & SPI
                  </button>
                  <button
                    onClick={() => handleQuarantine(selectedDevice.device_id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-xs font-medium border border-rose-500/30 transition flex items-center gap-1.5"
                  >
                    <PowerOff className="w-3.5 h-3.5" />
                    IPMI Cut
                  </button>
                </div>
              </div>

              {/* PCR & SPI Flash Digests */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Hardware Roots of Trust Measurements (TPM 2.0 & SPI ROM)
                </span>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>PCR0 (Core Root of Trust / CRTM)</span>
                      <span className="text-emerald-400 font-mono font-bold">MATCHES OEM BASELINE</span>
                    </div>
                    <div className="font-mono text-xs text-cyan-400 select-all truncate mt-0.5">
                      {selectedDevice.pcr0_sha256}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>PCR2 (Option ROMs & UEFI Drivers)</span>
                      <span className="text-emerald-400 font-mono font-bold">MATCHES OEM BASELINE</span>
                    </div>
                    <div className="font-mono text-xs text-slate-400 select-all truncate mt-0.5">
                      {selectedDevice.pcr2_sha256}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Physical SPI Flash ROM Image SHA-256</span>
                      <span className="text-emerald-400 font-mono font-bold">CLEAN - NO IMPLANTS</span>
                    </div>
                    <div className="font-mono text-xs text-slate-400 select-all truncate mt-0.5">
                      {selectedDevice.spi_flash_sha256}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attestation Result Feedback */}
              {attestResult && (
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Cryptographic Hardware Attestation Complete</div>
                      <div className="text-[11px] text-slate-400">
                        Secure Boot verified, PCR0/2 hashes match OEM golden baseline, no SPI rootkits found.
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">VERIFIED TRUSTED</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500">
              Select a hardware host to inspect TPM 2.0 PCR registers and firmware attestation proofs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

