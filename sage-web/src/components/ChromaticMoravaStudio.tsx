'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Layers } from 'lucide-react';

interface MoravaSpectrum {
  spectrum_id: string;
  classification: string;
  default_morava_height: number;
  default_formal_group_rank: number;
  default_stabilizer_nodes: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  spectrum_id: string;
  classification: string;
  morava_height: number;
  formal_group_rank: number;
  stabilizer_orbifold_nodes: number;
  chromatic_gain: number;
  chromatic_fracture_residual: number;
  lubin_tate_coherence: number;
  chromatic_suppression_db: number;
  morava_unitarity_pct: number;
  bousfield_localization_locked: boolean;
  status: string;
  timestamp: number;
}

export default function ChromaticMoravaStudio() {
  const [spectra, setSpectra] = useState<MoravaSpectrum[]>([]);
  const [selectedSpectrum, setSelectedSpectrum] = useState<string>('CHR-MORAVA-K4-01');
  const [moravaHeight, setMoravaHeight] = useState<number>(4);
  const [formalGroupRank, setFormalGroupRank] = useState<number>(8);
  const [stabilizerNodes, setStabilizerNodes] = useState<number>(16);
  const [chromaticGain, setChromaticGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchSpectra = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/chromatic-homotopy-morava/spectra');
      const data = (await res.json().catch(() => ({}))) as {
        spectra?: MoravaSpectrum[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load chromatic Morava spectra');
      }
      if (data.spectra) {
        setSpectra(data.spectra);
        if (data.spectra.length > 0) {
          setSelectedSpectrum((prev) => prev || data.spectra![0].spectrum_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load chromatic Morava spectra'
      );
    }
  }, []);

  useEffect(() => {
    fetchSpectra();
  }, [fetchSpectra]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/chromatic-homotopy-morava/seal-chromatic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spectrum_id: selectedSpectrum,
          morava_height: moravaHeight,
          formal_group_rank: formalGroupRank,
          stabilizer_orbifold_nodes: stabilizerNodes,
          chromatic_gain: chromaticGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Chromatic Morava seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Chromatic Morava seal failed'
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
            <Layers className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-300">
              Capability 146: Chromatic Homotopy Theory &amp; Morava E-Theory Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Morava K(n) stabilizer orbifolds, Lubin-Tate formal group deformations &amp; Bousfield fracture localization
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchSpectra}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Spectra</span>
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
        {spectra.map((s) => (
          <button
            type="button"
            key={s.spectrum_id}
            onClick={() => setSelectedSpectrum(s.spectrum_id)}
            aria-pressed={selectedSpectrum === s.spectrum_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedSpectrum === s.spectrum_id
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-indigo-400">
                {s.spectrum_id}
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                {s.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{s.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                K({s.default_morava_height}) | Nodes={s.default_stabilizer_nodes}
              </div>
              <div>Base Suppression: {s.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Morava Height (n)
            </label>
            <input
              type="number"
              min={1}
              max={16}
              step={1}
              value={moravaHeight}
              onChange={(e) => setMoravaHeight(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Formal Group Rank
            </label>
            <input
              type="number"
              min={2}
              max={64}
              step={1}
              value={formalGroupRank}
              onChange={(e) => setFormalGroupRank(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Stabilizer Orbifold Nodes
            </label>
            <input
              type="number"
              min={4}
              max={128}
              step={2}
              value={stabilizerNodes}
              onChange={(e) => setStabilizerNodes(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Chromatic Localization Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={chromaticGain}
              onChange={(e) => setChromaticGain(Number(e.target.value))}
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
              ? 'Sealing Chromatic Fracture Square...'
              : 'Seal Morava E-Theory Stratum & Bousfield Localization'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-indigo-950/20 border border-indigo-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-900/50 pb-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Chromatic Morava Telemetry ({telemetry.spectrum_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Morava Unitarity</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.morava_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Chromatic Suppression</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.chromatic_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Lubin-Tate Coherence</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.lubin_tate_coherence}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Fracture Residual</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.chromatic_fracture_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

