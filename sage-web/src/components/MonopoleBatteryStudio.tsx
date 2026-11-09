'use client';

import React, { useState, useEffect } from 'react';
import { BatteryCharging, RefreshCw, Activity, Shield, Zap, Gauge, Flame } from 'lucide-react';

interface MonopoleTrap {
  trap_id: string;
  location: string;
  monopoles_confined_count: number;
  magnetic_confinement_tesla: number;
  base_proton_feed_mg_s: number;
  conversion_efficiency_pct: number;
  decay_rate_per_sec: number;
  status: string;
}

interface CatalysisResult {
  trap_id: string;
  monopoles_confined_count: number;
  magnetic_confinement_tesla: number;
  dirac_magnetic_charge_e: number;
  proton_feed_rate_mg_s: number;
  confinement_boost: number;
  gross_thermal_power_gw: number;
  net_electrical_baseload_gw: number;
  mass_to_energy_conversion_pct: number;
  callan_rubakov_decay_rate_per_sec: number;
  conversion_efficiency_pct: number;
  zero_long_lived_nuclear_waste: boolean;
  status: string;
  timestamp: number;
}

export default function MonopoleBatteryStudio() {
  const [traps, setTraps] = useState<MonopoleTrap[]>([]);
  const [selectedTrap, setSelectedTrap] = useState<string>('MONOPOLE-TRAP-ICELAND-01');
  const [feedRate, setFeedRate] = useState<number>(1.25);
  const [boost, setBoost] = useState<number>(1.05);
  const [demand, setDemand] = useState<number>(100.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<CatalysisResult | null>(null);

  useEffect(() => {
    fetchTraps();
  }, []);

  const fetchTraps = async () => {
    try {
      const res = await fetch('/api/monopole-battery/traps');
      const data = await res.json();
      if (data.traps) {
        setTraps(data.traps);
        if (data.traps.length > 0 && !selectedTrap) {
          setSelectedTrap(data.traps[0].trap_id);
        }
      }
    } catch (err) {
      console.error('Failed to load monopole traps', err);
    }
  };

  const handleCatalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/monopole-battery/catalyze-decay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trap_id: selectedTrap,
          proton_feed_mg_s: feedRate,
          confinement_boost: boost,
          load_demand_gw: demand,
        }),
      });
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      console.error('Monopole catalysis failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <BatteryCharging className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-300">
              Option B Wave 28: Sovereign Planetary Relativistic Magnetic Monopole Proton Decay Battery
            </h2>
            <p className="text-sm text-slate-400">
              Dirac magnetic monopoles (g = 68.5e) catalyzing Callan-Rubakov nucleon decay for 100% E=mc^2 conversion (&gt;100 GW)
            </p>
          </div>
        </div>
        <button
          onClick={fetchTraps}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Traps</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {traps.map((t) => (
          <div
            key={t.trap_id}
            onClick={() => setSelectedTrap(t.trap_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedTrap === t.trap_id
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-cyan-400">{t.trap_id}</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                {t.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{t.location}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Monopoles Confined:</span>
                <span className="text-cyan-300 font-bold">{t.monopoles_confined_count} Units</span>
              </div>
              <div className="flex justify-between">
                <span>B-Field Confinement:</span>
                <span className="text-amber-300">{t.magnetic_confinement_tesla} T</span>
              </div>
              <div className="flex justify-between">
                <span>Conversion Efficiency:</span>
                <span className="text-emerald-300">{t.conversion_efficiency_pct.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <span>Callan-Rubakov Catalytic Reactor Injector</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Proton Fuel Feed: <span className="text-cyan-300 font-mono">{feedRate} mg/s</span>
            </label>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.05"
              value={feedRate}
              onChange={(e) => setFeedRate(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Confinement Boost: <span className="text-cyan-300 font-mono">{boost}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.05"
              value={boost}
              onChange={(e) => setBoost(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Grid Load Demand: <span className="text-cyan-300 font-mono">{demand} GW</span>
            </label>
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={demand}
              onChange={(e) => setDemand(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>

        <button
          onClick={handleCatalyze}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Catalyzing Proton Decay...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Initiate 100% E=mc^2 Monopole Catalysis Cycle</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-cyan-300">MONOPOLE CATALYSIS TELEMETRY</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">NET ELECTRICAL POWER</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.net_electrical_baseload_gw.toFixed(2)} GW
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">GROSS THERMAL</span>
              <span className="text-blue-300 font-bold text-sm">
                {telemetry.gross_thermal_power_gw.toFixed(2)} GW_th
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">MASS CONVERSION</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.mass_to_energy_conversion_pct.toFixed(0)}% (E=mc^2)
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">DIRAC CHARGE g</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.dirac_magnetic_charge_e.toFixed(1)} e
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-cyan-400 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Callan-Rubakov Catalytic Cross Section: 10^-27 cm^2 | Zero Actinide Waste</span>
          </div>
        </div>
      )}
    </div>
  );
}

