'use client';

import React, { useState, useEffect } from 'react';
import { Maximize2, RefreshCw, Activity, Shield, Sparkles, Sliders } from 'lucide-react';

interface NonCommManifold {
  manifold_id: string;
  sector: string;
  theta_scale_m2: number;
  uv_ir_mixing_damping_db: number;
  coordinate_uncertainty_floor_m: number;
  moyal_star_product_order: number;
  phase_space_coherence_pct: number;
  status: string;
}

interface ProtectionResult {
  manifold_id: string;
  theta_adjustment_factor: number;
  star_product_order: number;
  damping_gain: number;
  effective_theta_m2: number;
  coordinate_uncertainty_floor_m: number;
  uv_ir_mixing_damping_db: number;
  star_product_truncation_error: number;
  phase_space_coherence_pct: number;
  commutator_norm: number;
  uv_ir_mixing_decoupled: boolean;
  heisenberg_coordinate_uncertainty_enforced: boolean;
  status: string;
  timestamp: number;
}

export default function NonCommutativeSpacetimeStudio() {
  const [manifolds, setManifolds] = useState<NonCommManifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>('MOYAL-MANIFOLD-PLANCK-01');
  const [thetaAdj, setThetaAdj] = useState<number>(1.0);
  const [starOrder, setStarOrder] = useState<number>(4);
  const [dampingGain, setDampingGain] = useState<number>(1.1);
  const [loading, setLoading] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<ProtectionResult | null>(null);

  const fetchManifolds = async () => {
    try {
      const res = await fetch('/api/noncommutative-spacetime/manifolds');
      const data = await res.json();
      if (data.manifolds) {
        setManifolds(data.manifolds);
        if (data.manifolds.length > 0 && !selectedManifold) {
          setSelectedManifold(data.manifolds[0].manifold_id);
        }
      }
    } catch (err) {
      console.error('Failed to load non-commutative manifolds', err);
    }
  };

  useEffect(() => {
    fetchManifolds();
  }, []);

  const handleProtect = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/noncommutative-spacetime/protect-phase-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          theta_adjustment_factor: thetaAdj,
          star_product_order: starOrder,
          damping_gain: dampingGain,
        }),
      });
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      console.error('Phase space protection failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <Maximize2 className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-violet-300">
              Capability 103: Non-Commutative Moyal-Weyl Spacetime Phase Space Protector
            </h2>
            <p className="text-sm text-slate-400">
              Moyal star product coordinates [x^μ, x^ν] = i θ^μν with UV/IR mixing decoupling
            </p>
          </div>
        </div>
        <button
          onClick={fetchManifolds}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Manifolds</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {manifolds.map((m) => (
          <div
            key={m.manifold_id}
            onClick={() => setSelectedManifold(m.manifold_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedManifold === m.manifold_id
                ? 'bg-violet-950/40 border-violet-500/60 shadow-lg shadow-violet-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-violet-400">{m.manifold_id}</span>
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                {m.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{m.sector}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Theta Scale |θ|:</span>
                <span className="text-violet-300">{m.theta_scale_m2.toExponential(2)} m^2</span>
              </div>
              <div className="flex justify-between">
                <span>UV/IR Damping:</span>
                <span className="text-cyan-300">{m.uv_ir_mixing_damping_db.toFixed(1)} dB</span>
              </div>
              <div className="flex justify-between">
                <span>Uncertainty Floor:</span>
                <span className="text-emerald-300">{m.coordinate_uncertainty_floor_m.toExponential(2)} m</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-violet-400" />
          <span>Moyal Star Product Phase Space Guard</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Theta Scale Factor: <span className="text-violet-300 font-mono">{thetaAdj}x</span>
            </label>
            <input
              type="range"
              min="0.2"
              max="4.0"
              step="0.1"
              value={thetaAdj}
              onChange={(e) => setThetaAdj(parseFloat(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Star Product Order: <span className="text-violet-300 font-mono">O(θ^{starOrder})</span>
            </label>
            <input
              type="range"
              min="2"
              max="8"
              step="2"
              value={starOrder}
              onChange={(e) => setStarOrder(parseInt(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Damping Gain: <span className="text-violet-300 font-mono">{dampingGain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={dampingGain}
              onChange={(e) => setDampingGain(parseFloat(e.target.value))}
              className="w-full accent-violet-500"
            />
          </div>
        </div>

        <button
          onClick={handleProtect}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-violet-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Decoupling UV/IR Mixing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Enforce Non-Commutative Uncertainty Bounds</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-violet-950/20 border border-violet-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-violet-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-violet-300">MOYAL-WEYL NON-COMMUTATIVE TELEMETRY</span>
            <span className="text-[10px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">EFFECTIVE THETA</span>
              <span className="text-violet-300 font-bold text-sm">
                {telemetry.effective_theta_m2.toExponential(3)} m^2
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">UNCERTAINTY FLOOR</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.coordinate_uncertainty_floor_m.toExponential(3)} m
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">UV/IR DAMPING</span>
              <span className="text-emerald-400 font-bold text-sm">
                {telemetry.uv_ir_mixing_damping_db.toFixed(1)} dB
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PHASE COHERENCE</span>
              <span className="text-fuchsia-300 font-bold text-sm">
                {telemetry.phase_space_coherence_pct.toFixed(3)}%
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-violet-400 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>UV/IR Mixing Decoupled | Heisenberg Coordinate Uncertainty Enforced</span>
          </div>
        </div>
      )}
    </div>
  );
}

