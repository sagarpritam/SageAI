'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, Cpu, AlertTriangle, Sparkles } from 'lucide-react';

interface RatchetHarvester {
  harvester_id: string;
  location: string;
  default_bath_delta_k: number;
  winding_invariant: number;
  base_output_gw: number;
  base_efficiency_pct: number;
  status: string;
}

interface HarvestResult {
  harvester_id: string;
  location: string;
  winding_invariant: number;
  bath_gradient_kelvin: number;
  nonhermitian_gain: number;
  conversion_efficiency_pct: number;
  net_grid_output_gw: number;
  pt_exceptional_point_locked: boolean;
  zero_fossil_carbon: boolean;
  zero_fissile_waste: boolean;
  status: string;
  timestamp: number;
}

export default function QuantumThermoelectricPowerStudio() {
  const [harvesters, setHarvesters] = useState<RatchetHarvester[]>([]);
  const [selectedHarvester, setSelectedHarvester] = useState<string>('NONHERM-SKIN-ARRAY-01');
  const [bathDeltaK, setBathDeltaK] = useState<number>(420);
  const [nonhermitianGain, setNonhermitianGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HarvestResult | null>(null);

  const fetchHarvesters = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/quantum-thermoelectric-power/harvesters');
      const data = (await res.json().catch(() => ({}))) as {
        harvesters?: RatchetHarvester[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load non-Hermitian ratchet harvesters');
      }
      if (data.harvesters) {
        setHarvesters(data.harvesters);
        if (data.harvesters.length > 0) {
          setSelectedHarvester((prev) => prev || data.harvesters![0].harvester_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to load non-Hermitian ratchet harvesters'
      );
    }
  }, []);

  useEffect(() => {
    fetchHarvesters();
  }, [fetchHarvesters]);

  const handleHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/quantum-thermoelectric-power/harvest-ratchet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          harvester_id: selectedHarvester,
          bath_gradient_kelvin: bathDeltaK,
          nonhermitian_gain: nonhermitianGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HarvestResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Non-Hermitian ratchet baseload harvest failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Non-Hermitian ratchet baseload harvest failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
            <Zap className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-rose-300">
              Option B Wave 40: Planetary Non-Hermitian PT-Symmetric &amp; Quantum Thermal Ratchet Grid
            </h2>
            <p className="text-sm text-slate-400">
              Hatano-Nelson skin-effect waveguides, PT-symmetric cavities &amp; chiral Josephson thermal ratchets (zero carbon, zero fissile waste)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchHarvesters}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Harvesters</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {harvesters.map((h) => (
          <button
            type="button"
            key={h.harvester_id}
            onClick={() => setSelectedHarvester(h.harvester_id)}
            aria-pressed={selectedHarvester === h.harvester_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedHarvester === h.harvester_id
                ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-rose-400">
                {h.harvester_id}
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-mono">
                {h.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{h.location}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                Winding={h.winding_invariant} | DeltaT={h.default_bath_delta_k} K
              </div>
              <div>Base Efficiency: {h.base_efficiency_pct}%</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Bath Thermal Gradient (K)
            </label>
            <input
              type="number"
              min={50}
              max={2500}
              step={10}
              value={bathDeltaK}
              onChange={(e) => setBathDeltaK(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Non-Hermitian Skin Gain
            </label>
            <input
              type="number"
              min={0.8}
              max={2.5}
              step={0.05}
              value={nonhermitianGain}
              onChange={(e) => setNonhermitianGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleHarvest}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-rose-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {loading
              ? 'Harvesting Ratchet Baseload...'
              : 'Harvest Non-Hermitian Quantum Ratchet Baseload'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-rose-950/20 border border-rose-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-900/50 pb-3">
            <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Quantum Ratchet Grid Telemetry ({telemetry.harvester_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Net Baseload Output</div>
              <div className="text-base font-bold text-rose-300">
                {telemetry.net_grid_output_gw} GW
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Conversion Efficiency</div>
              <div className="text-base font-bold text-pink-300">
                {telemetry.conversion_efficiency_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Winding Invariant</div>
              <div className="text-base font-bold text-emerald-300">
                w={telemetry.winding_invariant}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Zero Carbon / Waste</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.zero_fossil_carbon && telemetry.zero_fissile_waste ? 'VERIFIED' : 'CHECK'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

