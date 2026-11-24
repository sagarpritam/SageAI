'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface SolitonCavity {
  cavity_id: string;
  location: string;
  resonant_frequency_hz: number;
  cmb_depth_km: number;
  nominal_magnetic_field_tesla: number;
  acoustic_velocity_km_s: number;
  base_grid_efficiency_pct: number;
  status: string;
}

interface SolitonHarvestResult {
  cavity_id: string;
  status: string;
  harvested_power_gw: number;
  resonant_frequency_hz: number;
  soliton_amplitude_tesla: number;
  alfven_sound_velocity_km_s: number;
  piezo_conversion_efficiency_pct: number;
  grid_stability_pct: number;
  cmb_depth_km: number;
  extraction_duration_s: number;
  timestamp: number;
}

export default function MagnetoAcousticSolitonStudio() {
  const [cavities, setCavities] = useState<SolitonCavity[]>([]);
  const [selectedCavity, setSelectedCavity] = useState<string>('SOLITON-PACIFIC-RIM-01');
  const [magneticFieldTesla, setMagneticFieldTesla] = useState<number>(0.005);
  const [acousticVelocity, setAcousticVelocity] = useState<number>(13.6);
  const [piezoEfficiency, setPiezoEfficiency] = useState<number>(0.95);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SolitonHarvestResult | null>(null);

  const fetchCavities = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/magneto-acoustic-soliton-supergrid/cavities');
      const data = (await res.json().catch(() => ({}))) as {
        cavities?: SolitonCavity[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load soliton cavities');
      }
      if (data.cavities) {
        setCavities(data.cavities);
        if (data.cavities.length > 0) {
          setSelectedCavity((prev) => prev || data.cavities![0].cavity_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading cavities';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchCavities();
  }, [fetchCavities]);

  const handleHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/magneto-acoustic-soliton-supergrid/harvest-solitons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cavity_id: selectedCavity,
          magnetic_field_tesla: magneticFieldTesla,
          acoustic_velocity_km_s: acousticVelocity,
          piezo_efficiency: piezoEfficiency,
          extraction_duration_s: 60.0,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SolitonHarvestResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to harvest magneto-acoustic solitons');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to harvest solitons';
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
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Planetary Magneto-Acoustic Soliton Supergrid
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  Wave 51 Option B
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Core-mantle boundary (CMB) D&quot; layer solitons, Alfven-acoustic transduction, and multi-GW baseload power
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchCavities}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Cavities
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="my-4 p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-sm flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Soliton Grid Error</p>
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
            CMB Transduction Cavity
          </label>
          <select
            value={selectedCavity}
            onChange={(e) => setSelectedCavity(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {cavities.map((c) => (
              <option key={c.cavity_id} value={c.cavity_id}>
                {c.cavity_id} ({c.resonant_frequency_hz} Hz, {c.cmb_depth_km} km)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Acoustic Velocity ({acousticVelocity.toFixed(1)} km/s)
          </label>
          <input
            type="range"
            min={8.0}
            max={20.0}
            step={0.2}
            value={acousticVelocity}
            onChange={(e) => setAcousticVelocity(parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>8.0 km/s</span>
            <span>13.6 km/s (D&quot; Layer)</span>
            <span>20.0 km/s</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Piezoelectric Transduction ({Math.round(piezoEfficiency * 100)}%)
          </label>
          <input
            type="range"
            min={0.7}
            max={0.99}
            step={0.01}
            value={piezoEfficiency}
            onChange={(e) => setPiezoEfficiency(parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>70%</span>
            <span>95% (Resonant)</span>
            <span>99%</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={handleHarvest}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? 'Resonating CMB Solitary Wave...' : 'Harvest Magneto-Acoustic Solitons'}
        </button>
      </div>

      {telemetry && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Baseload Electrical Power Dispatched
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
              <span className="text-xs text-slate-400 block mb-1">Acoustic Speed</span>
              <span className="text-base font-bold font-mono text-cyan-400">
                {telemetry.alfven_sound_velocity_km_s.toFixed(1)} km/s
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Grid Stability</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {telemetry.grid_stability_pct.toFixed(2)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">CMB Depth</span>
              <span className="text-base font-bold font-mono text-purple-400">
                {telemetry.cmb_depth_km.toFixed(0)} km
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
