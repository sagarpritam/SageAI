'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Compass } from 'lucide-react';

interface HitchinBundle {
  bundle_id: string;
  classification: string;
  default_genus: number;
  default_spectral_nodes: number;
  default_twistor_angle_deg: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  bundle_id: string;
  classification: string;
  riemann_genus: number;
  spectral_network_nodes: number;
  twistor_rotation_deg: number;
  hyperkahler_gain: number;
  hitchin_self_duality_residual: number;
  hyperkahler_twistor_coherence: number;
  spectral_suppression_db: number;
  hitchin_unitarity_pct: number;
  gmn_wall_crossing_locked: boolean;
  status: string;
  timestamp: number;
}

export default function HitchinModuliStudio() {
  const [bundles, setBundles] = useState<HitchinBundle[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<string>('HITCHIN-SL2C-SIGMA3-01');
  const [riemannGenus, setRiemannGenus] = useState<number>(3);
  const [spectralNodes, setSpectralNodes] = useState<number>(12);
  const [twistorAngle, setTwistorAngle] = useState<number>(18);
  const [hyperkahlerGain, setHyperkahlerGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchBundles = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/hitchin-moduli-hyperkahler/bundles');
      const data = (await res.json().catch(() => ({}))) as {
        bundles?: HitchinBundle[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Hitchin moduli bundles');
      }
      if (data.bundles) {
        setBundles(data.bundles);
        if (data.bundles.length > 0) {
          setSelectedBundle((prev) => prev || data.bundles![0].bundle_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Hitchin moduli bundles'
      );
    }
  }, []);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/hitchin-moduli-hyperkahler/seal-hitchin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundle_id: selectedBundle,
          riemann_genus: riemannGenus,
          spectral_network_nodes: spectralNodes,
          twistor_rotation_deg: twistorAngle,
          hyperkahler_gain: hyperkahlerGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Hitchin moduli bundle seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Hitchin moduli bundle seal failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <Compass className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-300">
              Capability 143: Hitchin Moduli Space &amp; Hyperkähler Spectral-Network Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Hitchin self-duality Higgs-bundle stability, GMN spectral wall-crossing &amp; P^1 twistor coherence
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchBundles}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Bundles</span>
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
        {bundles.map((b) => (
          <button
            type="button"
            key={b.bundle_id}
            onClick={() => setSelectedBundle(b.bundle_id)}
            aria-pressed={selectedBundle === b.bundle_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedBundle === b.bundle_id
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-indigo-400">
                {b.bundle_id}
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                {b.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{b.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                g={b.default_genus} | Nodes={b.default_spectral_nodes}
              </div>
              <div>Base Suppression: {b.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Riemann Genus (g)
            </label>
            <input
              type="number"
              min={2}
              max={24}
              step={1}
              value={riemannGenus}
              onChange={(e) => setRiemannGenus(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Spectral Network Nodes
            </label>
            <input
              type="number"
              min={4}
              max={128}
              step={2}
              value={spectralNodes}
              onChange={(e) => setSpectralNodes(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Twistor Angle (deg)
            </label>
            <input
              type="number"
              min={1}
              max={90}
              step={1}
              value={twistorAngle}
              onChange={(e) => setTwistorAngle(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Hyperkähler Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={hyperkahlerGain}
              onChange={(e) => setHyperkahlerGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-indigo-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {loading
              ? 'Sealing Hitchin Moduli...'
              : 'Verify Self-Duality & Seal Hyperkähler Twistor Manifold'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-indigo-950/20 border border-indigo-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-900/50 pb-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Hitchin Moduli Telemetry ({telemetry.bundle_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Hitchin Unitarity</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.hitchin_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Spectral Suppression</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.spectral_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Twistor Coherence</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.hyperkahler_twistor_coherence}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Self-Duality Residual</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.hitchin_self_duality_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

