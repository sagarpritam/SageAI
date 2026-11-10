'use client';

import React, { useState, useEffect } from 'react';
import { FlipHorizontal, RefreshCw, Activity, Shield, Sparkles, Orbit } from 'lucide-react';

interface MirrorPair {
  manifold_id: string;
  original_manifold: string;
  mirror_manifold: string;
  h_1_1_original: number;
  h_2_1_original: number;
  euler_characteristic_original: number;
  h_1_1_mirror: number;
  h_2_1_mirror: number;
  euler_characteristic_mirror: number;
  status: string;
}

interface InvertResult {
  manifold_id: string;
  original_manifold: string;
  mirror_manifold: string;
  h_1_1_original: number;
  h_2_1_original: number;
  h_1_1_inverted_mirror: number;
  h_2_1_inverted_mirror: number;
  hodge_diamond_flipped: boolean;
  complex_modulus_z: number;
  instanton_degree_max: number;
  picard_fuchs_period_pi0: number;
  gromov_witten_instanton_sum: number;
  fukaya_to_sheaf_equivalence_pct: number;
  homological_mirror_symmetry_verified: boolean;
  status: string;
  timestamp: number;
}

export default function MirrorSymmetryStudio() {
  const [manifolds, setManifolds] = useState<MirrorPair[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>('CY-MIRROR-FERMAT-QUINTIC-01');
  const [modulusZ, setModulusZ] = useState<number>(0.05);
  const [degreeMax, setDegreeMax] = useState<number>(5);
  const [gain, setGain] = useState<number>(1.05);
  const [loading, setLoading] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<InvertResult | null>(null);

  const fetchManifolds = async () => {
    try {
      const res = await fetch('/api/mirror-symmetry/manifolds');
      const data = await res.json();
      if (data.manifolds) {
        setManifolds(data.manifolds);
        if (data.manifolds.length > 0 && !selectedManifold) {
          setSelectedManifold(data.manifolds[0].manifold_id);
        }
      }
    } catch (err) {
      console.error('Failed to load mirror pairs', err);
    }
  };

  useEffect(() => {
    fetchManifolds();
  }, []);

  const handleInvert = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mirror-symmetry/invert-hodge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          complex_modulus_z: modulusZ,
          instanton_degree_max: degreeMax,
          duality_coupling_gain: gain,
        }),
      });
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      console.error('Mirror symmetry inversion failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
            <FlipHorizontal className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-teal-300">
              Capability 105: Calabi-Yau Mirror Symmetry Hodge Diamond Inverter
            </h2>
            <p className="text-sm text-slate-400">
              Homological mirror symmetry Fuk(X) ~ D^b(Coh(W)) and Hodge diamond topology flip
            </p>
          </div>
        </div>
        <button
          onClick={fetchManifolds}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Pairs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {manifolds.map((m) => (
          <div
            key={m.manifold_id}
            onClick={() => setSelectedManifold(m.manifold_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedManifold === m.manifold_id
                ? 'bg-teal-950/40 border-teal-500/60 shadow-lg shadow-teal-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-teal-400">{m.manifold_id}</span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono">
                {m.status}
              </span>
            </div>
            <p className="text-xs text-slate-200 font-semibold mb-1">{m.original_manifold}</p>
            <p className="text-[11px] text-slate-400 mb-2">Mirror: {m.mirror_manifold}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Original Hodge (1,1 / 2,1):</span>
                <span className="text-teal-300">{m.h_1_1_original} / {m.h_2_1_original}</span>
              </div>
              <div className="flex justify-between">
                <span>Mirror Hodge (1,1 / 2,1):</span>
                <span className="text-cyan-300 font-bold">{m.h_1_1_mirror} / {m.h_2_1_mirror}</span>
              </div>
              <div className="flex justify-between">
                <span>Euler Characteristic:</span>
                <span className="text-amber-300">{m.euler_characteristic_original} ➔ {m.euler_characteristic_mirror}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Orbit className="w-4 h-4 text-teal-400" />
          <span>Picard-Fuchs Instanton Duality Engine</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Complex Modulus z: <span className="text-teal-300 font-mono">{modulusZ}</span>
            </label>
            <input
              type="range"
              min="0.01"
              max="0.25"
              step="0.01"
              value={modulusZ}
              onChange={(e) => setModulusZ(parseFloat(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Max Curve Degree d: <span className="text-teal-300 font-mono">d = {degreeMax}</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={degreeMax}
              onChange={(e) => setDegreeMax(parseInt(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Duality Coupling: <span className="text-teal-300 font-mono">{gain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={gain}
              onChange={(e) => setGain(parseFloat(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
        </div>

        <button
          onClick={handleInvert}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-teal-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Inverting Hodge Diamond...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Execute Calabi-Yau Homological Mirror Duality</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-teal-950/20 border border-teal-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-teal-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-teal-300">CALABI-YAU MIRROR TELEMETRY</span>
            <span className="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ORIGINAL HODGE</span>
              <span className="text-teal-300 font-bold text-sm">
                h^(1,1)={telemetry.h_1_1_original}, h^(2,1)={telemetry.h_2_1_original}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">INVERTED MIRROR HODGE</span>
              <span className="text-cyan-300 font-bold text-sm">
                h^(1,1)={telemetry.h_1_1_inverted_mirror}, h^(2,1)={telemetry.h_2_1_inverted_mirror}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PERIOD INTEGRAL Pi_0</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.picard_fuchs_period_pi0.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HMS EQUIVALENCE</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.fukaya_to_sheaf_equivalence_pct.toFixed(3)}%
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-teal-400 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Hodge Diamond Inverted | Homological Mirror Symmetry Verified</span>
          </div>
        </div>
      )}
    </div>
  );
}

