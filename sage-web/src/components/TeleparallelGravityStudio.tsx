'use client';

import React, { useState, useEffect } from 'react';
import { Compass, RefreshCw, Activity, Shield, Layers, Radio } from 'lucide-react';

interface TetradNode {
  node_id: string;
  location: string;
  base_torsion_scalar_m2: number;
  tetrad_orthogonality_loss: number;
  f_t_coupling_constant: number;
  inertia_decoupling_pct: number;
  riemann_curvature_residual: number;
  status: string;
}

interface TelemetryResult {
  node_id: string;
  boost_factor: number;
  torsion_flux_gain: number;
  modulated_torsion_scalar_m2: number;
  f_t_gravity_potential: number;
  inertia_decoupling_pct: number;
  riemann_curvature_residual: number;
  tetrad_orthogonality_loss: number;
  torsion_energy_density_j_m3: number;
  weitzenbock_affine_torsion_active: boolean;
  status: string;
  timestamp: number;
}

export default function TeleparallelGravityStudio() {
  const [nodes, setNodes] = useState<TetradNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('TETRAD-NODE-WEITZENBOCK-01');
  const [boostFactor, setBoostFactor] = useState<number>(1.2);
  const [fluxGain, setFluxGain] = useState<number>(1.1);
  const [loading, setLoading] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<TelemetryResult | null>(null);

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    try {
      const res = await fetch('/api/teleparallel-gravity/nodes');
      const data = await res.json();
      if (data.nodes) {
        setNodes(data.nodes);
        if (data.nodes.length > 0 && !selectedNode) {
          setSelectedNode(data.nodes[0].node_id);
        }
      }
    } catch (err) {
      console.error('Failed to load tetrad nodes', err);
    }
  };

  const handleModulate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teleparallel-gravity/modulate-torsion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: selectedNode,
          boost_factor: boostFactor,
          torsion_flux_gain: fluxGain,
        }),
      });
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      console.error('Modulation failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <Compass className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Capability 101: Topological Torsion Teleparallel Gravity Engine
            </h2>
            <p className="text-sm text-slate-400">
              Weitzenbock connection spacetime geometry with zero Riemann curvature and non-vanishing torsion
            </p>
          </div>
        </div>
        <button
          onClick={fetchNodes}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Tetrads</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((node) => (
          <div
            key={node.node_id}
            onClick={() => setSelectedNode(node.node_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedNode === node.node_id
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">{node.node_id}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {node.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{node.location}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Torsion Scalar T:</span>
                <span className="text-emerald-300">{node.base_torsion_scalar_m2.toExponential(2)} m^-2</span>
              </div>
              <div className="flex justify-between">
                <span>Riemann Curvature:</span>
                <span className="text-emerald-400 font-bold">{node.riemann_curvature_residual.toFixed(1)} (Strict 0)</span>
              </div>
              <div className="flex justify-between">
                <span>Inertia Decoupling:</span>
                <span className="text-cyan-300">{node.inertia_decoupling_pct.toFixed(3)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>Weitzenbock Vierbein Torsion Modulator</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Torsion Boost Factor: <span className="text-emerald-300 font-mono">{boostFactor}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.05"
              value={boostFactor}
              onChange={(e) => setBoostFactor(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Torsion Flux Gain: <span className="text-emerald-300 font-mono">{fluxGain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={fluxGain}
              onChange={(e) => setFluxGain(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        <button
          onClick={handleModulate}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Modulating Weitzenbock Torsion...</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4" />
              <span>Execute Teleparallel Torsion Alignment</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-emerald-300">TELEPARALLEL TORSION TELEMETRY</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TORSION SCALAR T</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.modulated_torsion_scalar_m2.toExponential(4)} m^-2
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">INERTIA DECOUPLING</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.inertia_decoupling_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">RIEMANN RESIDUAL</span>
              <span className="text-emerald-400 font-bold text-sm">
                {telemetry.riemann_curvature_residual.toFixed(1)} (STRICT ZERO)
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ORTHOGONALITY LOSS</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.tetrad_orthogonality_loss.toExponential(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Weitzenbock Affine Torsion Active | f(T) Cosmological Equivalence Locked</span>
          </div>
        </div>
      )}
    </div>
  );
}
