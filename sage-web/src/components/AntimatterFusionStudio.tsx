'use client';

import React, { useState, useEffect } from 'react';
import { Rocket, RefreshCw, Activity, Shield, Flame, Gauge, Zap } from 'lucide-react';

interface ACFThruster {
  thruster_id: string;
  interceptor_class: string;
  location: string;
  base_antiproton_inventory_pg: number;
  base_isp_s: number;
  magnetic_nozzle_field_tesla: number;
  collimation_efficiency_pct: number;
  pulse_rep_rate_hz: number;
  status: string;
}

interface PulseResult {
  thruster_id: string;
  interceptor_class: string;
  antiprotons_injected_pg: number;
  pellet_compression_gain: number;
  repetition_rate_hz: number;
  thermal_yield_gw: number;
  pulse_energy_mj: number;
  specific_impulse_isp_s: number;
  exhaust_velocity_km_s: number;
  relativistic_c_fraction_pct: number;
  continuous_thrust_kn: number;
  magnetic_nozzle_field_tesla: number;
  collimation_efficiency_pct: number;
  remaining_antiproton_inventory_pg: number;
  trans_solar_relativistic_capability: boolean;
  status: string;
  timestamp: number;
}

export default function AntimatterFusionStudio() {
  const [thrusters, setThrusters] = useState<ACFThruster[]>([]);
  const [selectedThruster, setSelectedThruster] = useState<string>('ACF-THRUSTER-VALKYRIE-01');
  const [pbarDose, setPbarDose] = useState<number>(0.5);
  const [compressionGain, setCompressionGain] = useState<number>(1.15);
  const [repRate, setRepRate] = useState<number>(30.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<PulseResult | null>(null);

  useEffect(() => {
    fetchThrusters();
  }, []);

  const fetchThrusters = async () => {
    try {
      const res = await fetch('/api/antimatter-fusion/thrusters');
      const data = await res.json();
      if (data.thrusters) {
        setThrusters(data.thrusters);
        if (data.thrusters.length > 0 && !selectedThruster) {
          setSelectedThruster(data.thrusters[0].thruster_id);
        }
      }
    } catch (err) {
      console.error('Failed to load ACF thrusters', err);
    }
  };

  const handleIgnite = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/antimatter-fusion/ignite-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thruster_id: selectedThruster,
          antiprotons_pg: pbarDose,
          pellet_compression_gain: compressionGain,
          rep_rate_hz: repRate,
        }),
      });
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      console.error('ACF pulse ignition failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
            <Rocket className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-rose-300">
              Option B Wave 27: Sovereign Planetary Antimatter-Catalyzed Fusion (ACF) Rocket
            </h2>
            <p className="text-sm text-slate-400">
              Antiproton-induced micro-fission/fusion propulsion (Isp &gt; 350,000s, vex &gt; 3,400 km/s, trans-solar sorties)
            </p>
          </div>
        </div>
        <button
          onClick={fetchThrusters}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Thrusters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {thrusters.map((t) => (
          <div
            key={t.thruster_id}
            onClick={() => setSelectedThruster(t.thruster_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedThruster === t.thruster_id
                ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-rose-400">{t.thruster_id}</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-mono">
                {t.status}
              </span>
            </div>
            <p className="text-xs text-slate-200 font-semibold mb-1">{t.interceptor_class}</p>
            <p className="text-[11px] text-slate-400 mb-2">{t.location}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Base Specific Impulse:</span>
                <span className="text-rose-300">{t.base_isp_s.toLocaleString()} s</span>
              </div>
              <div className="flex justify-between">
                <span>Antiproton Inventory:</span>
                <span className="text-amber-300">{t.base_antiproton_inventory_pg.toFixed(1)} pg</span>
              </div>
              <div className="flex justify-between">
                <span>Magnetic Nozzle:</span>
                <span className="text-cyan-300">{t.magnetic_nozzle_field_tesla} T</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-rose-400" />
          <span>Antimatter Injection &amp; Thermonuclear Pulse Igniter</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Antiproton Dose: <span className="text-rose-300 font-mono">{pbarDose} pg</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.05"
              value={pbarDose}
              onChange={(e) => setPbarDose(parseFloat(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Pellet Compression: <span className="text-rose-300 font-mono">{compressionGain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.05"
              value={compressionGain}
              onChange={(e) => setCompressionGain(parseFloat(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Pulse Frequency: <span className="text-rose-300 font-mono">{repRate} Hz</span>
            </label>
            <input
              type="range"
              min="10"
              max="50"
              step="1"
              value={repRate}
              onChange={(e) => setRepRate(parseFloat(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>
        </div>

        <button
          onClick={handleIgnite}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Igniting ACF Thermonuclear Pulse...</span>
            </>
          ) : (
            <>
              <Flame className="w-4 h-4" />
              <span>Fire Antimatter-Catalyzed Fusion Burn Cycle</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-rose-300">ACF PROPULSION TELEMETRY</span>
            <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">SPECIFIC IMPULSE (Isp)</span>
              <span className="text-rose-300 font-bold text-sm">
                {telemetry.specific_impulse_isp_s.toLocaleString()} s
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">EXHAUST VELOCITY</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.exhaust_velocity_km_s.toLocaleString()} km/s ({telemetry.relativistic_c_fraction_pct.toFixed(2)}% c)
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">THERMAL YIELD</span>
              <span className="text-orange-300 font-bold text-sm">
                {telemetry.thermal_yield_gw.toFixed(2)} GW_th
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CONTINUOUS THRUST</span>
              <span className="text-emerald-400 font-bold text-sm">
                {telemetry.continuous_thrust_kn.toFixed(1)} kN
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-rose-400 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Collimation Efficiency: {telemetry.collimation_efficiency_pct.toFixed(1)}% | Penning Trap Reserve: {telemetry.remaining_antiproton_inventory_pg.toFixed(1)} pg</span>
          </div>
        </div>
      )}
    </div>
  );
}
