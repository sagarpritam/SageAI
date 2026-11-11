'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layers, RefreshCw, Shield, Sparkles, Cpu, AlertTriangle } from 'lucide-react';

interface AmplituhedronGeometry {
  geometry_id: string;
  sector: string;
  default_legs_n: number;
  default_sector_k: number;
  default_loops_l: number;
  base_unitarity_fidelity_pct: number;
  base_ir_quench_db: number;
  status: string;
}

interface OptimizeFormResult {
  geometry_id: string;
  particle_legs_n: number;
  mhv_sector_k: number;
  loop_order_l: number;
  positivity_gain: number;
  grassmannian_dimension: number;
  bcfw_bridge_cells: number;
  feynman_diagrams_bypassed: number;
  combinatorial_speedup_factor: number;
  canonical_form_volume: number;
  positive_minor_residual: number;
  ir_divergence_quench_db: number;
  unitarity_fidelity_pct: number;
  yangian_symmetry_locked: boolean;
  status: string;
  timestamp: number;
}

export default function AmplituhedronScatteringStudio() {
  const [geometries, setGeometries] = useState<AmplituhedronGeometry[]>([]);
  const [selectedGeo, setSelectedGeo] = useState<string>('AMP-NMHV-2LOOP-02');
  const [particleLegs, setParticleLegs] = useState<number>(8);
  const [mhvSector, setMhvSector] = useState<number>(3);
  const [loopOrder, setLoopOrder] = useState<number>(2);
  const [positivityGain, setPositivityGain] = useState<number>(1.15);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<OptimizeFormResult | null>(null);

  const fetchGeometries = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/amplituhedron-scattering/geometries');
      const data = (await res.json().catch(() => ({}))) as {
        geometries?: AmplituhedronGeometry[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Amplituhedron polytopes');
      }
      if (data.geometries) {
        setGeometries(data.geometries);
        if (data.geometries.length > 0) {
          setSelectedGeo((prev) => prev || data.geometries![0].geometry_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load Amplituhedron polytopes');
    }
  }, []);

  useEffect(() => {
    fetchGeometries();
  }, [fetchGeometries]);

  const handleOptimize = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/amplituhedron-scattering/optimize-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geometry_id: selectedGeo,
          particle_legs_n: particleLegs,
          mhv_sector_k: mhvSector,
          loop_order_l: loopOrder,
          positivity_gain: positivityGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as OptimizeFormResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Amplituhedron canonical form evaluation failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Amplituhedron canonical form evaluation failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <Layers className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Capability 110: Amplituhedron Positive-Geometry Scattering Matrix Optimizer
            </h2>
            <p className="text-sm text-slate-400">
              Grassmannian G_+(k, n) BCFW bridge cells, canonical form Omega(Y; Z), and Yangian unitarity lock
            </p>
          </div>
        </div>
        <button
          onClick={fetchGeometries}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Polytopes</span>
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
        {geometries.map((g) => (
          <div
            key={g.geometry_id}
            onClick={() => setSelectedGeo(g.geometry_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedGeo === g.geometry_id
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">
                {g.geometry_id}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {g.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{g.sector}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Sector G_+(k, n):</span>
                <span className="text-emerald-300">
                  ({g.default_sector_k}, {g.default_legs_n}) @ {g.default_loops_l}-Loop
                </span>
              </div>
              <div className="flex justify-between">
                <span>Unitarity Fidelity:</span>
                <span className="text-cyan-300">{g.base_unitarity_fidelity_pct.toFixed(3)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Momentum-Twistor Amplituhedron Triangulation Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Gluon Legs (n): <span className="text-emerald-300 font-mono">{particleLegs}</span>
            </label>
            <input
              type="range"
              min="4"
              max="14"
              step="1"
              value={particleLegs}
              onChange={(e) => setParticleLegs(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Helicity Sector (k): <span className="text-emerald-300 font-mono">{mhvSector}</span>
            </label>
            <input
              type="range"
              min="2"
              max="6"
              step="1"
              value={mhvSector}
              onChange={(e) => setMhvSector(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Loop Order (L): <span className="text-emerald-300 font-mono">{loopOrder}</span>
            </label>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={loopOrder}
              onChange={(e) => setLoopOrder(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Positivity Gain: <span className="text-emerald-300 font-mono">{positivityGain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={positivityGain}
              onChange={(e) => setPositivityGain(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        <button
          onClick={handleOptimize}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Triangulating BCFW Positive Cells...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Optimize Amplituhedron Canonical Form Omega(Y; Z)</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-emerald-300">
              AMPLITUHEDRON CANONICAL FORM TELEMETRY
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">UNITARITY FIDELITY</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.unitarity_fidelity_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">SPEEDUP VS FEYNMAN</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.combinatorial_speedup_factor.toLocaleString()}x
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">BCFW BRIDGE CELLS</span>
              <span className="text-teal-300 font-bold text-sm">
                {telemetry.bcfw_bridge_cells} (dim {telemetry.grassmannian_dimension})
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">IR DIVERGENCE QUENCH</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.ir_divergence_quench_db.toFixed(1)} dB
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Yangian Positivity Enforced | Bypassed {telemetry.feynman_diagrams_bypassed.toLocaleString()} Feynman Diagrams
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

