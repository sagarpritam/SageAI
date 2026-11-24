'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Shield, AlertTriangle, ShieldCheck, Binary } from 'lucide-react';

interface AutomorphicPacket {
  packet_id: string;
  group: string;
  weight_k: number;
  conductor_level: number;
  character: string;
  representation_type: string;
  spectral_gap: number;
  base_fidelity_pct: number;
  status: string;
}

interface HeckeSynthesisResult {
  packet_id: string;
  status: string;
  hecke_eigenvalues: Record<string, number>;
  ramanujan_bounds: Record<string, number>;
  all_bounds_held: boolean;
  primes_evaluated: number[];
  dirichlet_l_val: number;
  hecke_shield_strength_pev: number;
  automorphic_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export default function LanglandsAutomorphicStudio() {
  const [packets, setPackets] = useState<AutomorphicPacket[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<string>('LANGLANDS-GL2-MODULAR-01');
  const [primeCutoff, setPrimeCutoff] = useState<number>(17);
  const [heckeGain, setHeckeGain] = useState<number>(1.25);
  const [lFunctionS, setLFunctionS] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<HeckeSynthesisResult | null>(null);

  const fetchPackets = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/langlands-automorphic/packets');
      const data = (await res.json().catch(() => ({}))) as {
        packets?: AutomorphicPacket[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Langlands automorphic packets');
      }
      if (data.packets) {
        setPackets(data.packets);
        if (data.packets.length > 0) {
          setSelectedPacket((prev) => prev || data.packets![0].packet_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading automorphic packets';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchPackets();
  }, [fetchPackets]);

  const handleSynthesize = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/langlands-automorphic/synthesize-hecke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packet_id: selectedPacket,
          prime_cutoff: primeCutoff,
          ram_bound_tolerance: 1e-5,
          l_function_s: lFunctionS,
          hecke_gain: heckeGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as HeckeSynthesisResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize Hecke eigenform packet');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to execute Hecke synthesis';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <Binary className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Langlands Automorphic Duality Engine
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  Capability 170
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Galois representation duality, cuspidal automorphic L-packets, and Hecke eigenform bounds
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchPackets}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Packets
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="my-4 p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-sm flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Automorphic Engine Error</p>
            <p>{errorMsg}</p>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-400 hover:text-red-200 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Automorphic Representation Packet
          </label>
          <select
            value={selectedPacket}
            onChange={(e) => setSelectedPacket(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {packets.map((p) => (
              <option key={p.packet_id} value={p.packet_id}>
                {p.packet_id} — {p.group} (wt {p.weight_k})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Prime Cutoff (p ≤ {primeCutoff})
          </label>
          <input
            type="range"
            min={3}
            max={23}
            step={2}
            value={primeCutoff}
            onChange={(e) => setPrimeCutoff(parseInt(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>p=3</span>
            <span>p=17</span>
            <span>p=23</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Hecke Eigenform Pinning Gain ({heckeGain.toFixed(2)}x)
          </label>
          <input
            type="range"
            min={0.5}
            max={3.0}
            step={0.05}
            value={heckeGain}
            onChange={(e) => setHeckeGain(parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0.50x</span>
            <span>1.25x (Optimal)</span>
            <span>3.00x</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={handleSynthesize}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Synthesizing Hecke L-Packet...' : 'Synthesize Hecke Eigenforms'}
        </button>
      </div>

      {telemetry && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Langlands Duality Synthesized
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Ramanujan Bound Status</span>
              <span className="text-base font-bold text-emerald-400">
                {telemetry.all_bounds_held ? '100% SATISFIED' : 'BOUND DEFECT'}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Dirichlet L(s, π) Val</span>
              <span className="text-base font-bold font-mono text-cyan-400">
                {telemetry.dirichlet_l_val.toFixed(6)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Automorphic Barrier</span>
              <span className="text-base font-bold font-mono text-indigo-400">
                {telemetry.hecke_shield_strength_pev.toFixed(2)} PeV
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Spectral Suppression</span>
              <span className="text-base font-bold font-mono text-purple-400">
                {telemetry.automorphic_suppression_db.toFixed(1)} dB
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
