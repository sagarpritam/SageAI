'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Orbit, RefreshCw, Shield, Sparkles, Cpu, AlertTriangle } from 'lucide-react';

interface CelestialBoundary {
  boundary_id: string;
  manifold: string;
  default_mellin_delta: number;
  default_soft_order: number;
  default_w_mode_cutoff: number;
  base_ward_fidelity_pct: number;
  base_memory_suppression_db: number;
  status: string;
}

interface SealWardResult {
  boundary_id: string;
  manifold: string;
  mellin_boost_delta: number;
  soft_theorem_order: number;
  w_infinity_mode_cutoff: number;
  bms_damping_gain: number;
  mellin_kernel_modulus: number;
  w_infinity_chiral_coherence: number;
  bondi_news_shear_residual: number;
  memory_suppression_db: number;
  ward_identity_fidelity_pct: number;
  bms4_supertranslation_sealed: boolean;
  status: string;
  timestamp: number;
}

export default function CelestialHolographyStudio() {
  const [boundaries, setBoundaries] = useState<CelestialBoundary[]>([]);
  const [selectedBoundary, setSelectedBoundary] = useState<string>('CS2-CELESTIAL-BMS-01');
  const [mellinDelta, setMellinDelta] = useState<number>(1.5);
  const [softOrder, setSoftOrder] = useState<number>(2);
  const [wCutoff, setWCutoff] = useState<number>(20);
  const [bmsGain, setBmsGain] = useState<number>(1.35);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealWardResult | null>(null);

  const fetchBoundaries = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/celestial-holography/boundaries');
      const data = (await res.json().catch(() => ({}))) as {
        boundaries?: CelestialBoundary[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Celestial Holography boundaries');
      }
      if (data.boundaries) {
        setBoundaries(data.boundaries);
        if (data.boundaries.length > 0) {
          setSelectedBoundary((prev) => prev || data.boundaries![0].boundary_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Celestial Holography boundaries'
      );
    }
  }, []);

  useEffect(() => {
    fetchBoundaries();
  }, [fetchBoundaries]);

  const handleSealWard = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/celestial-holography/seal-ward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boundary_id: selectedBoundary,
          mellin_boost_delta: mellinDelta,
          soft_theorem_order: softOrder,
          w_infinity_mode_cutoff: wCutoff,
          bms_damping_gain: bmsGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealWardResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Celestial BMS4 Ward sealing failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Celestial BMS4 Ward sealing failed');
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
              Capability 116: Celestial Holography w&#8321;&#8330;&#8734; &amp; BMS4 Memory Shield
            </h2>
            <p className="text-sm text-slate-400">
              CCFT Mellin celestial amplitudes on CS&#178;, w&#8321;&#8330;&#8734; wedge chiral locks &amp; soft-graviton Bondi news damping
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchBoundaries}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Boundaries</span>
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
        {boundaries.map((b) => (
          <button
            type="button"
            key={b.boundary_id}
            onClick={() => setSelectedBoundary(b.boundary_id)}
            aria-pressed={selectedBoundary === b.boundary_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedBoundary === b.boundary_id
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-indigo-400">
                {b.boundary_id}
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                {b.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{b.manifold}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Mellin Delta:</span>
                <span className="text-indigo-300">
                  {b.default_mellin_delta.toFixed(1)} (w={b.default_w_mode_cutoff})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ward Fidelity:</span>
                <span className="text-cyan-300">{b.base_ward_fidelity_pct.toFixed(3)}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>BMS4 Supertranslation &amp; w&#8321;&#8330;&#8734; Chiral Mode Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Mellin Delta: <span className="text-indigo-300 font-mono">{mellinDelta.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={mellinDelta}
              onChange={(e) => setMellinDelta(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Soft Theorem Order: <span className="text-indigo-300 font-mono">{softOrder}</span>
            </label>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={softOrder}
              onChange={(e) => setSoftOrder(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              w Mode Cutoff: <span className="text-indigo-300 font-mono">{wCutoff}</span>
            </label>
            <input
              type="range"
              min="4"
              max="64"
              step="2"
              value={wCutoff}
              onChange={(e) => setWCutoff(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              BMS Shear Gain: <span className="text-indigo-300 font-mono">{bmsGain.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min="0.85"
              max="2.5"
              step="0.05"
              value={bmsGain}
              onChange={(e) => setBmsGain(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSealWard}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Sealing Celestial w&#8321;&#8330;&#8734; Ward Identity...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Lock Celestial w&#8321;&#8330;&#8734; Algebra &amp; Seal BMS4 Horizon</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-indigo-300">
              CELESTIAL HOLOGRAPHY WARD TELEMETRY
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">WARD FIDELITY</span>
              <span className="text-indigo-300 font-bold text-sm">
                {telemetry.ward_identity_fidelity_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">MELLIN KERNEL</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.mellin_kernel_modulus.toFixed(4)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">MEMORY QUENCH</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.memory_suppression_db.toFixed(1)} dB
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">BONDI SHEAR RESIDUAL</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.bondi_news_shear_residual.toExponential(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-indigo-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              BMS4 Supertranslation Sealed | Chiral Coherence={telemetry.w_infinity_chiral_coherence}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

