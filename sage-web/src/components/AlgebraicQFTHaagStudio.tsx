'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Shield } from 'lucide-react';

interface AQFTAlgebra {
  algebra_id: string;
  net_sector: string;
  default_diamond_radius: number;
  default_split_distance: number;
  default_modular_temp: number;
  base_unitarity_pct: number;
  base_isolation_db: number;
  status: string;
}

interface SealNetResult {
  algebra_id: string;
  net_sector: string;
  diamond_radius: number;
  split_distance: number;
  modular_temp: number;
  nuclearity_gain: number;
  nuclearity_index: number;
  araki_relative_entropy: number;
  microcausality_commutator_residual: number;
  locality_isolation_db: number;
  tomita_modular_unitarity_pct: number;
  microcausality_verified: boolean;
  status: string;
  timestamp: number;
}

export default function AlgebraicQFTHaagStudio() {
  const [algebras, setAlgebras] = useState<AQFTAlgebra[]>([]);
  const [selectedAlg, setSelectedAlg] = useState<string>('AQFT-HAAG-DIAMOND-01');
  const [radius, setRadius] = useState<number>(2.4);
  const [splitDistance, setSplitDistance] = useState<number>(0.45);
  const [modularTemp, setModularTemp] = useState<number>(1.0);
  const [nuclearityGain, setNuclearityGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealNetResult | null>(null);

  const fetchAlgebras = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/algebraic-qft-haag/algebras');
      const data = (await res.json().catch(() => ({}))) as {
        algebras?: AQFTAlgebra[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load AQFT Haag-Kastler algebras');
      }
      if (data.algebras) {
        setAlgebras(data.algebras);
        if (data.algebras.length > 0) {
          setSelectedAlg((prev) => prev || data.algebras![0].algebra_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load AQFT Haag-Kastler algebras');
    }
  }, []);

  useEffect(() => {
    fetchAlgebras();
  }, [fetchAlgebras]);

  const handleSealNet = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/algebraic-qft-haag/seal-net', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algebra_id: selectedAlg,
          diamond_radius: radius,
          split_distance: splitDistance,
          modular_temp: modularTemp,
          nuclearity_gain: nuclearityGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealNetResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'AQFT Haag-Kastler net seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'AQFT Haag-Kastler net seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-300">
              Capability 132: Algebraic QFT (AQFT) Haag-Kastler Net &amp; Tomita-Takesaki Modular Shield
            </h2>
            <p className="text-sm text-slate-400">
              von Neumann Type III_1 diamond nets, Einstein microcausality &amp; Buchholz-Wichmann nuclearity
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchAlgebras}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Algebras</span>
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
        {algebras.map((a) => (
          <button
            type="button"
            key={a.algebra_id}
            onClick={() => setSelectedAlg(a.algebra_id)}
            aria-pressed={selectedAlg === a.algebra_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedAlg === a.algebra_id
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-cyan-400">{a.algebra_id}</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                {a.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{a.net_sector}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Radius={a.default_diamond_radius} | Split={a.default_split_distance}</div>
              <div>Base Isolation: {a.base_isolation_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Diamond Radius
            </label>
            <input
              type="number"
              min={0.5}
              max={20}
              step={0.1}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Split Corridor Gap
            </label>
            <input
              type="number"
              min={0.1}
              max={5}
              step={0.05}
              value={splitDistance}
              onChange={(e) => setSplitDistance(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Modular Inverse Temp
            </label>
            <input
              type="number"
              min={0.25}
              max={8}
              step={0.05}
              value={modularTemp}
              onChange={(e) => setModularTemp(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Nuclearity Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={nuclearityGain}
              onChange={(e) => setNuclearityGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSealNet}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-cyan-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Sealing Haag-Kastler Net...' : 'Audit Microcausality & Seal AQFT Modular Wedge'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-cyan-950/20 border border-cyan-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/50 pb-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>AQFT Haag-Kastler Telemetry ({telemetry.algebra_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Tomita Unitarity</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.tomita_modular_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Locality Isolation</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.locality_isolation_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Nuclearity Index</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.nuclearity_index}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Commutator Residual</div>
              <div className="text-base font-bold text-sky-300">
                {telemetry.microcausality_commutator_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

