'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Orbit } from 'lucide-react';

interface JTWormholeTopology {
  topology_id: string;
  geometry: string;
  default_genus_g: number;
  default_s0_entropy: number;
  default_schwarzian_temp: number;
  base_fidelity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealWormholeResult {
  topology_id: string;
  geometry: string;
  genus_g: number;
  s0_entropy: number;
  schwarzian_temp: number;
  trumpet_clamp_gain: number;
  genus_weight_decay: number;
  spectral_curve_residue: number;
  factorization_leak_residual: number;
  wormhole_suppression_db: number;
  matrix_unitarity_fidelity_pct: number;
  weil_petersson_locked: boolean;
  status: string;
  timestamp: number;
}

export default function JTWormholeStudio() {
  const [topologies, setTopologies] = useState<JTWormholeTopology[]>([]);
  const [selectedTopology, setSelectedTopology] = useState<string>('JT-SSS-TRUMPET-01');
  const [genusG, setGenusG] = useState<number>(2);
  const [s0Entropy, setS0Entropy] = useState<number>(8.4);
  const [schwarzianTemp, setSchwarzianTemp] = useState<number>(1.25);
  const [clampGain, setClampGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealWormholeResult | null>(null);

  const fetchTopologies = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/jt-wormhole-matrix/topologies');
      const data = (await res.json().catch(() => ({}))) as {
        topologies?: JTWormholeTopology[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load JT wormhole topologies');
      }
      if (data.topologies) {
        setTopologies(data.topologies);
        if (data.topologies.length > 0) {
          setSelectedTopology((prev) => prev || data.topologies![0].topology_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load JT wormhole topologies');
    }
  }, []);

  useEffect(() => {
    fetchTopologies();
  }, [fetchTopologies]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/jt-wormhole-matrix/seal-wormhole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topology_id: selectedTopology,
          genus_g: genusG,
          s0_entropy: s0Entropy,
          schwarzian_temp: schwarzianTemp,
          trumpet_clamp_gain: clampGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealWormholeResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'JT wormhole genus seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'JT wormhole genus seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <Orbit className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-300">
              Capability 125: JT Dilaton Wormhole &amp; Double-Scaled Matrix Model Firewall
            </h2>
            <p className="text-sm text-slate-400">
              SSS genus-g topological expansion, Weil-Petersson moduli handlebodies &amp; trumpet throat sealing
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchTopologies}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Topologies</span>
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
        {topologies.map((t) => (
          <button
            type="button"
            key={t.topology_id}
            onClick={() => setSelectedTopology(t.topology_id)}
            aria-pressed={selectedTopology === t.topology_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedTopology === t.topology_id
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-indigo-400">{t.topology_id}</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                {t.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{t.geometry}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Genus: g={t.default_genus_g} | S_0={t.default_s0_entropy}</div>
              <div>Base Suppression: {t.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Handlebody Genus (g)
            </label>
            <input
              type="number"
              min={0}
              max={16}
              step={1}
              value={genusG}
              onChange={(e) => setGenusG(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Extremal Entropy (S_0)
            </label>
            <input
              type="number"
              min={4}
              max={20}
              step={0.2}
              value={s0Entropy}
              onChange={(e) => setS0Entropy(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Schwarzian Temp (T)
            </label>
            <input
              type="number"
              min={0.25}
              max={5}
              step={0.05}
              value={schwarzianTemp}
              onChange={(e) => setSchwarzianTemp(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Trumpet Clamp Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={clampGain}
              onChange={(e) => setClampGain(Number(e.target.value))}
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
          <span>{loading ? 'Sealing JT Matrix Wormhole...' : 'Seal JT Wormhole Genus & Spectral Curve'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-indigo-950/20 border border-indigo-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-900/50 pb-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>JT Wormhole Matrix Telemetry ({telemetry.topology_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Matrix Unitarity</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.matrix_unitarity_fidelity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Wormhole Suppression</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.wormhole_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Spectral Residue</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.spectral_curve_residue}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Factorization Leak</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.factorization_leak_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

