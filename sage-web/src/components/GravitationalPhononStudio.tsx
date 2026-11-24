'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface PhononLattice {
  lattice_id: string;
  material: string;
  target_frequency_hz: number;
  mechanical_q_factor: number;
  acoustic_velocity_m_s: number;
  lattice_volume_m3: number;
  cryogenic_temperature_k: number;
  base_grid_efficiency_pct: number;
  status: string;
}

interface PhononHarvestResult {
  lattice_id: string;
  status: string;
  harvested_power_gw: number;
  target_frequency_hz: number;
  resonant_acoustic_q: number;
  strain_sensitivity_h: number;
  piezo_conversion_efficiency_pct: number;
  grid_stability_pct: number;
  lattice_temperature_k: number;
  extraction_duration_s: number;
  timestamp: number;
}

export default function GravitationalPhononStudio() {
  const [lattices, setLattices] = useState<PhononLattice[]>([]);
  const [selectedLattice, setSelectedLattice] = useState<string>('PHONON-ANTARCTIC-DIAMOND-01');
  const [strainAmplitudeLog, setStrainAmplitudeLog] = useState<number>(-22);
  const [acousticCoupling, setAcousticCoupling] = useState<number>(0.88);
  const [piezoEfficiency, setPiezoEfficiency] = useState<number>(0.94);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<PhononHarvestResult | null>(null);

  const fetchLattices = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gravitational-phonon/lattices');
      const data = (await res.json().catch(() => ({}))) as {
        lattices?: PhononLattice[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load gravitational phonon lattices');
      }
      if (data.lattices) {
        setLattices(data.lattices);
        if (data.lattices.length > 0) {
          setSelectedLattice((prev) => prev || data.lattices![0].lattice_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading phonon lattices';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchLattices();
  }, [fetchLattices]);

  const handleHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gravitational-phonon/harvest-phonons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lattice_id: selectedLattice,
          strain_amplitude_h: Math.pow(10, strainAmplitudeLog),
          acoustic_coupling: acousticCoupling,
          piezo_efficiency: piezoEfficiency,
          extraction_duration_s: 60.0,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as PhononHarvestResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to harvest gravitational-wave phonons');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to harvest phonons';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Planetary Gravitational Phonon Lattice Supergrid
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  Wave 50 Option B
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Spacetime metric strain conversion, ultra-high-Q BAW resonators, and continuous GW energy harvesting
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchLattices}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Lattices
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="my-4 p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-sm flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Phonon Supergrid Error</p>
            <p>{errorMsg}</p>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-400 hover:text-red-200 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Resonant Phonon Crystal Array
          </label>
          <select
            value={selectedLattice}
            onChange={(e) => setSelectedLattice(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {lattices.map((l) => (
              <option key={l.lattice_id} value={l.lattice_id}>
                {l.lattice_id} ({l.target_frequency_hz} Hz, Q={l.mechanical_q_factor.toExponential(1)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Strain Sensitivity h (10^{strainAmplitudeLog} / √Hz)
          </label>
          <input
            type="range"
            min={-24}
            max={-20}
            step={1}
            value={strainAmplitudeLog}
            onChange={(e) => setStrainAmplitudeLog(parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>10^-24</span>
            <span>10^-22 (Astrophysical)</span>
            <span>10^-20</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Piezoelectric Efficiency ({Math.round(piezoEfficiency * 100)}%)
          </label>
          <input
            type="range"
            min={0.7}
            max={0.99}
            step={0.01}
            value={piezoEfficiency}
            onChange={(e) => setPiezoEfficiency(parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>70%</span>
            <span>94% (Cryo-Diamond)</span>
            <span>99%</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={handleHarvest}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-amber-600/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? 'Resonating Acoustic Lattice...' : 'Harvest Gravitational Phonons'}
        </button>
      </div>

      {telemetry && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Continuous Energy Dispatched
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Harvested Power</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {telemetry.harvested_power_gw.toFixed(3)} GW
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Resonant Acoustic Q</span>
              <span className="text-base font-bold font-mono text-amber-400">
                {telemetry.resonant_acoustic_q.toExponential(2)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Grid Stability</span>
              <span className="text-base font-bold font-mono text-cyan-400">
                {telemetry.grid_stability_pct.toFixed(2)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Cryogenic Temperature</span>
              <span className="text-base font-bold font-mono text-purple-400">
                {telemetry.lattice_temperature_k.toFixed(1)} K
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
