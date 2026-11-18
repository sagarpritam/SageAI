'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, ThermometerSnowflake, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CryoQubit {
  qubit_id: string;
  classification: string;
  base_temperature_mk: number;
  josephson_energy_ej_ghz: number;
  charging_energy_ec_ghz: number;
  base_coherence_t1_us: number;
  base_clamping_db: number;
  status: string;
}

interface PhaseSlipClampResult {
  qubit_id: string;
  classification: string;
  magnetic_flux_bias_phi0: number;
  sweet_spot_offset: number;
  pump_frequency_ghz: number;
  base_temperature_mk: number;
  thermal_photon_attenuation_db: number;
  flux_confinement_pct: number;
  quantum_phase_slip_clamped: boolean;
  status: string;
  timestamp: number;
}

export default function CryogenicFluxQubitStudio() {
  const [qubits, setQubits] = useState<CryoQubit[]>([]);
  const [selectedQubit, setSelectedQubit] = useState<string>('CRYO-FLUX-15MK-01');
  const [fluxBias, setFluxBias] = useState<number>(0.5);
  const [microwaveAtten, setMicrowaveAtten] = useState<number>(60);
  const [pumpFreq, setPumpFreq] = useState<number>(6.45);
  const [superconductingGain, setSuperconductingGain] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<PhaseSlipClampResult | null>(null);

  const fetchQubits = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/cryogenic-flux-qubit/qubits');
      const data = (await res.json().catch(() => ({}))) as {
        qubits?: CryoQubit[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Cryogenic Flux Qubit enclaves');
      }
      if (data.qubits) {
        setQubits(data.qubits);
        if (data.qubits.length > 0) {
          setSelectedQubit((prev) => prev || data.qubits![0].qubit_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading cryogenic qubits';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchQubits();
  }, [fetchQubits]);

  const handleClampPhaseSlip = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/cryogenic-flux-qubit/clamp-phase-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qubit_id: selectedQubit,
          magnetic_flux_bias_phi0: fluxBias,
          microwave_attenuation_db: microwaveAtten,
          pump_frequency_ghz: pumpFreq,
          superconducting_gain: superconductingGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as PhaseSlipClampResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to clamp quantum phase slip');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error clamping phase slip';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-blue-500/30 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-400">
            <ThermometerSnowflake className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">
              Sub-Kelvin Cryogenic Flux Qubit Studio
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Capability 163: 15 mK Josephson Phase Slip Suppression &amp; Quantum-Classical Thermal Shield
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchQubits}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload Enclaves
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300 font-mono">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-zinc-400 block mb-1.5">
              Select Cryogenic Flux Qubit Enclave:
            </label>
            <select
              value={selectedQubit}
              onChange={(e) => setSelectedQubit(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-200 focus:border-blue-500 focus:outline-none"
            >
              {qubits.map((q) => (
                <option key={q.qubit_id} value={q.qubit_id}>
                  {q.qubit_id} — {q.classification} ({q.base_temperature_mk} mK)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Flux Bias (&Phi;/&Phi;<sub>0</sub>): {fluxBias}
              </label>
              <input
                type="range"
                min={0.0}
                max={1.0}
                step={0.05}
                value={fluxBias}
                onChange={(e) => setFluxBias(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Microwave Atten: {microwaveAtten} dB
              </label>
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={microwaveAtten}
                onChange={(e) => setMicrowaveAtten(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Pump Freq (GHz): {pumpFreq}
              </label>
              <input
                type="number"
                min={1.0}
                max={15.0}
                step={0.05}
                value={pumpFreq}
                onChange={(e) => setPumpFreq(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-200"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Superconducting Gain: {superconductingGain}x
              </label>
              <input
                type="number"
                min={0.1}
                max={5.0}
                step={0.1}
                value={superconductingGain}
                onChange={(e) => setSuperconductingGain(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-200"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleClampPhaseSlip}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 py-2.5 px-4 text-xs font-bold font-mono text-white transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Clamp Quantum Phase Slip &amp; Isolate Dilution Loop
          </button>
        </div>

        {/* Telemetry Panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-zinc-400 font-bold">CRYOGENIC QUANTUM TELEMETRY</span>
            {telemetry && (
              <span className="flex items-center gap-1 text-[11px] text-blue-400 font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> 15 mK MEISSNER LOCKED
              </span>
            )}
          </div>

          {telemetry ? (
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Qubit ID:</span>
                <span className="text-white font-bold">{telemetry.qubit_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Base Temperature:</span>
                <span className="text-blue-400 font-bold">{telemetry.base_temperature_mk} mK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Sweet Spot Offset:</span>
                <span className="text-zinc-300 font-bold">{telemetry.sweet_spot_offset} &Phi;<sub>0</sub></span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Flux Confinement:</span>
                <span className="text-blue-400 font-bold">{telemetry.flux_confinement_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Thermal Photon Attenuation:</span>
                <span className="text-emerald-400 font-bold">{telemetry.thermal_photon_attenuation_db} dB</span>
              </div>
              <div className="p-2 rounded bg-black/60 border border-zinc-800 text-[10px] text-zinc-400">
                Josephson Phase Slip: Persistent current I<sub>p</sub> clamped at sweet spot bias.
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-600 text-center">
              Trigger a phase slip clamp to stream dilution refrigerator telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

