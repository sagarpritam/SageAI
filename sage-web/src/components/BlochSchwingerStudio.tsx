'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, Cpu, AlertTriangle, Sparkles } from 'lucide-react';

interface FloquetCavity {
  cavity_id: string;
  location: string;
  chern_invariant: number;
  default_drive_thz: number;
  default_q_factor_1e8: number;
  base_efficiency_pct: number;
  status: string;
}

interface HarvestFloquetResult {
  cavity_id: string;
  location: string;
  chern_invariant: number;
  q_factor_1e8: number;
  floquet_drive_thz: number;
  edge_rectifier_gain: number;
  conversion_efficiency_pct: number;
  net_grid_output_gw: number;
  topological_edge_protected: boolean;
  zero_fossil_carbon: boolean;
  zero_fissile_waste: boolean;
  status: string;
  timestamp: number;
}

export default function BlochSchwingerStudio() {
  const [cavities, setCavities] = useState<FloquetCavity[]>([]);
  const [selectedCavity, setSelectedCavity] = useState<string>('FLOQUET-BLOCH-ORBIT-01');
  const [driveThz, setDriveThz] = useState<number>(22.0);
  const [rectifierGain, setRectifierGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HarvestFloquetResult | null>(null);

  const fetchCavities = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/bloch-schwinger-power/cavities');
      const data = (await res.json().catch(() => ({}))) as {
        cavities?: FloquetCavity[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Floquet-Bloch photonic cavities');
      }
      if (data.cavities) {
        setCavities(data.cavities);
        if (data.cavities.length > 0) {
          setSelectedCavity((prev) => prev || data.cavities![0].cavity_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load Floquet-Bloch photonic cavities');
    }
  }, []);

  useEffect(() => {
    fetchCavities();
  }, [fetchCavities]);

  const handleHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/bloch-schwinger-power/harvest-floquet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cavity_id: selectedCavity,
          floquet_drive_thz: driveThz,
          edge_rectifier_gain: rectifierGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HarvestFloquetResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Floquet-Bloch baseload harvest failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Floquet-Bloch baseload harvest failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-300">
              Option B Wave 36: Planetary Topological Floquet-Bloch Photonic Power Grid
            </h2>
            <p className="text-sm text-slate-400">
              High-Q Kerr Haldane-edge topological photonic cavities delivering clean gigawatt baseload (zero carbon, zero fissile waste)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchCavities}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Cavities</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cavities.map((c) => (
          <button
            type="button"
            key={c.cavity_id}
            onClick={() => setSelectedCavity(c.cavity_id)}
            aria-pressed={selectedCavity === c.cavity_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedCavity === c.cavity_id
                ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-amber-400">{c.cavity_id}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                {c.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{c.location}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Chern C={c.chern_invariant} | Drive={c.default_drive_thz} THz</div>
              <div>Base Efficiency: {c.base_efficiency_pct}%</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Floquet Drive Frequency (THz)
            </label>
            <input
              type="number"
              min={8}
              max={90}
              step={0.5}
              value={driveThz}
              onChange={(e) => setDriveThz(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Haldane Edge Rectifier Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={rectifierGain}
              onChange={(e) => setRectifierGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleHarvest}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-amber-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Harvesting Floquet-Bloch Baseload...' : 'Harvest Floquet-Bloch Photonic Baseload'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-amber-950/20 border border-amber-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Floquet-Bloch Photonic Telemetry ({telemetry.cavity_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Net Clean Output</div>
              <div className="text-base font-bold text-amber-300">
                {telemetry.net_grid_output_gw} GW
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Conversion Eff.</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.conversion_efficiency_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Zero Fossil Carbon</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.zero_fossil_carbon ? 'VERIFIED' : 'FALSE'}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Zero Fissile Waste</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.zero_fissile_waste ? 'VERIFIED' : 'FALSE'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

