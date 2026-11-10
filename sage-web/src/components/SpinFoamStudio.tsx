'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layers, RefreshCw, Activity, Shield, Box, Sparkles } from 'lucide-react';

interface SimplexComplex {
  simplex_id: string;
  sector: string;
  tetrahedra_count: number;
  base_spin_j: number;
  immirzi_gamma: number;
  vertex_amplitude_coherence_pct: number;
  lorentz_intertwiner_dimension: number;
  status: string;
}

interface QuantizeResult {
  simplex_id: string;
  spin_representation_j: number;
  immirzi_gamma: number;
  amplitude_gain: number;
  area_eigenvalue_m2: number;
  area_planck_units: number;
  discrete_volume_quantum_m3: number;
  vertex_amplitude: number;
  intertwiner_dimension: number;
  intertwiner_norm: number;
  vertex_amplitude_coherence_pct: number;
  quantum_geometry_discreteness_enforced: boolean;
  status: string;
  timestamp: number;
}

export default function SpinFoamStudio() {
  const [simplices, setSimplices] = useState<SimplexComplex[]>([]);
  const [selectedSimplex, setSelectedSimplex] = useState<string>('SPIN-SIMPLEX-EPRL-01');
  const [spinJ, setSpinJ] = useState<number>(1.5);
  const [immirziGamma, setImmirziGamma] = useState<number>(0.2375);
  const [gain, setGain] = useState<number>(1.1);
  const [loading, setLoading] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<QuantizeResult | null>(null);

  const fetchSimplices = useCallback(async () => {
    try {
      const res = await fetch('/api/spin-foam/simplices');
      const data = await res.json();
      if (data.simplices) {
        setSimplices(data.simplices);
        if (data.simplices.length > 0) {
          setSelectedSimplex((prev) => prev || data.simplices[0].simplex_id);
        }
      }
    } catch (err) {
      console.error('Failed to load spin-foam simplices', err);
    }
  }, []);

  useEffect(() => {
    fetchSimplices();
  }, [fetchSimplices]);

  const handleQuantize = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/spin-foam/quantize-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simplex_id: selectedSimplex,
          spin_j: spinJ,
          immirzi_gamma: immirziGamma,
          amplitude_gain: gain,
        }),
      });
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      console.error('Spin-foam quantization failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <Box className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-300">
              Capability 102: Spin-Foam Quantum Geometry Area-Spectra Quantizer
            </h2>
            <p className="text-sm text-slate-400">
              EPRL-FK 4-simplex discrete area spectra with SU(2) representations and Lorentz intertwiners
            </p>
          </div>
        </div>
        <button
          onClick={fetchSimplices}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Simplices</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {simplices.map((s) => (
          <div
            key={s.simplex_id}
            onClick={() => setSelectedSimplex(s.simplex_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedSimplex === s.simplex_id
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-indigo-400">{s.simplex_id}</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                {s.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{s.sector}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Tetrahedra Count:</span>
                <span className="text-indigo-300">{s.tetrahedra_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Base Spin j:</span>
                <span className="text-violet-300">{s.base_spin_j.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Vertex Coherence:</span>
                <span className="text-cyan-300">{s.vertex_amplitude_coherence_pct.toFixed(3)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>EPRL-FK Spin-Foam Area Operator Controller</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Spin Representation j: <span className="text-indigo-300 font-mono">{spinJ}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={spinJ}
              onChange={(e) => setSpinJ(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Immirzi Parameter γ: <span className="text-indigo-300 font-mono">{immirziGamma}</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.01"
              value={immirziGamma}
              onChange={(e) => setImmirziGamma(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Amplitude Gain: <span className="text-indigo-300 font-mono">{gain}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={gain}
              onChange={(e) => setGain(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={handleQuantize}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Quantizing 4-Simplex Area Spectra...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Compute Discrete Area Spectra Eigenvalue</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-indigo-300">SPIN-FOAM QUANTUM GEOMETRY TELEMETRY</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">AREA EIGENVALUE</span>
              <span className="text-indigo-300 font-bold text-sm">
                {telemetry.area_eigenvalue_m2.toExponential(3)} m^2
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PLANCK UNITS (A / l_Pl^2)</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.area_planck_units.toFixed(2)} l_Pl^2
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">VERTEX AMPLITUDE</span>
              <span className="text-purple-300 font-bold text-sm">
                {telemetry.vertex_amplitude.toFixed(4)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">COHERENCE</span>
              <span className="text-emerald-400 font-bold text-sm">
                {telemetry.vertex_amplitude_coherence_pct.toFixed(3)}%
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-indigo-400 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Discreteness Enforced | Intertwiner Dimension: {telemetry.intertwiner_dimension} | Norm: {telemetry.intertwiner_norm}</span>
          </div>
        </div>
      )}
    </div>
  );
}

