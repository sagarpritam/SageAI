'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HydrideVault {
  vault_id: string;
  classification: string;
  critical_temperature_tc_k: number;
  chamber_pressure_gpa: number;
  phonon_coupling_alpha2f: number;
  base_harvest_mw: number;
  grid_efficiency_pct: number;
  status: string;
}

interface MegabarHarvestResult {
  vault_id: string;
  harvest_status: string;
  harvested_power_mw: number;
  eliashberg_spectral_function: number;
  meissner_fraction_pct: number;
  grid_efficiency_pct: number;
  megabar_pressure_gpa: number;
  phonon_coupling_alpha2f: number;
  rectification_gain: number;
  timestamp: number;
}

export default function HydrideMegabarSupergridStudio() {
  const [vaults, setVaults] = useState<HydrideVault[]>([]);
  const [selectedVault, setSelectedVault] = useState<string>('MEGABAR-LAH10-VAULT-01');
  const [pressureGpa, setPressureGpa] = useState<number>(170.0);
  const [phononCoupling, setPhononCoupling] = useState<number>(2.8);
  const [rectificationGain, setRectificationGain] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<MegabarHarvestResult | null>(null);

  const fetchVaults = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/hydride-megabar-supergrid/vaults');
      const data = (await res.json().catch(() => ({}))) as {
        vaults?: HydrideVault[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load hydride megabar vaults');
      }
      if (data.vaults) {
        setVaults(data.vaults);
        if (data.vaults.length > 0) {
          setSelectedVault((prev) => prev || data.vaults![0].vault_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading hydride vaults';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  const handleHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/hydride-megabar-supergrid/harvest-megabar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vault_id: selectedVault,
          megabar_pressure_gpa: pressureGpa,
          phonon_coupling_alpha2f: phononCoupling,
          rectification_gain: rectificationGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as MegabarHarvestResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to harvest hydride megabar power');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing megabar harvest';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">
              Hydride Megabar Supergrid Studio
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Option B Wave 48: Planetary High-Pressure LaH₁₀, Lu-N-H &amp; YH₉ Superhydride Zero-Loss Megabar Supergrid
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchVaults}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload Vaults
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300 font-mono"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-[10px] bg-red-900/60 hover:bg-red-900 px-2 py-0.5 rounded border border-red-700/50 text-red-200 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-zinc-400 block mb-1.5">
              Select Hydride Megabar Power Vault:
            </label>
            <select
              value={selectedVault}
              onChange={(e) => setSelectedVault(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-200 focus:border-amber-500 focus:outline-none"
            >
              {vaults.map((v) => (
                <option key={v.vault_id} value={v.vault_id}>
                  {v.vault_id} — {v.classification}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Pressure: {pressureGpa.toFixed(1)} GPa
              </label>
              <input
                type="range"
                min={1.0}
                max={300.0}
                step={5.0}
                value={pressureGpa}
                onChange={(e) => setPressureGpa(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Coupling (&alpha;&sup2;F): {phononCoupling.toFixed(1)}
              </label>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.1}
                value={phononCoupling}
                onChange={(e) => setPhononCoupling(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-zinc-400 block mb-1">
              Rectification Gain: {rectificationGain.toFixed(1)}x
            </label>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={rectificationGain}
              onChange={(e) => setRectificationGain(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={handleHarvest}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 py-2.5 text-xs font-mono font-bold text-white shadow-lg transition"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Harvesting Megabar Power...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Harvest Megabar Superconducting Power
              </>
            )}
          </button>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            Megabar Supergrid Harvest Telemetry
          </h3>
          {telemetry ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Vault ID:</span>
                <span className="text-amber-400 font-bold">{telemetry.vault_id}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Status:</span>
                <span className="text-zinc-200">{telemetry.harvest_status}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Harvested Power:</span>
                <span className="text-emerald-300 font-bold">
                  {telemetry.harvested_power_mw.toFixed(2)} MW
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Spectral Function &alpha;&sup2;F(&omega;):</span>
                <span className="text-blue-300 font-bold">
                  {telemetry.eliashberg_spectral_function.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Meissner Flux Expulsion:</span>
                <span className="text-yellow-400 font-bold">
                  {telemetry.meissner_fraction_pct.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Grid Efficiency:</span>
                <span className="text-amber-400 font-bold">
                  {telemetry.grid_efficiency_pct.toFixed(2)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-500 font-mono text-xs">
              <Zap className="h-8 w-8 text-zinc-700 mb-2" />
              <span>Select hydride vault and harvest superconducting electrical power</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
