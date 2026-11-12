'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Orbit } from 'lucide-react';

interface SkyrmionLattice {
  lattice_id: string;
  topology: string;
  default_winding_q: number;
  default_instanton_size_rho: number;
  default_gauge_coupling: number;
  base_fidelity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface ClampInstantonResult {
  lattice_id: string;
  topology: string;
  winding_number_q: number;
  instanton_size_rho: number;
  gauge_coupling: number;
  theta_clamp_gain: number;
  pontryagin_euclidean_action: number;
  theta_vacuum_cp_residual: number;
  tunneling_suppression_db: number;
  topological_winding_fidelity_pct: number;
  cp_symmetry_protected: boolean;
  status: string;
  timestamp: number;
}

export default function SkyrmionInstantonStudio() {
  const [lattices, setLattices] = useState<SkyrmionLattice[]>([]);
  const [selectedLattice, setSelectedLattice] = useState<string>('BPST-INSTANTON-SU2-01');
  const [windingQ, setWindingQ] = useState<number>(2);
  const [rho, setRho] = useState<number>(0.35);
  const [gaugeCoupling, setGaugeCoupling] = useState<number>(1.25);
  const [thetaGain, setThetaGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<ClampInstantonResult | null>(null);

  const fetchLattices = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/skyrmion-instanton-qcd/lattices');
      const data = (await res.json().catch(() => ({}))) as {
        lattices?: SkyrmionLattice[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Skyrmion-Instanton lattices');
      }
      if (data.lattices) {
        setLattices(data.lattices);
        if (data.lattices.length > 0) {
          setSelectedLattice((prev) => prev || data.lattices![0].lattice_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load Skyrmion-Instanton lattices');
    }
  }, []);

  useEffect(() => {
    fetchLattices();
  }, [fetchLattices]);

  const handleClamp = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/skyrmion-instanton-qcd/clamp-instanton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lattice_id: selectedLattice,
          winding_q: windingQ,
          instanton_size_rho: rho,
          gauge_coupling: gaugeCoupling,
          theta_clamp_gain: thetaGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as ClampInstantonResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'BPST instanton clamping failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'BPST instanton clamping failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <Orbit className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Capability 133: Topological Skyrmion-Instanton BPST Lattice &amp; Theta-Vacuum Shield
            </h2>
            <p className="text-sm text-slate-400">
              Pontryagin winding index quantization, Yang-Mills instanton action &amp; Callan-Dashen-Gross CP guard
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchLattices}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Lattices</span>
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
        {lattices.map((l) => (
          <button
            type="button"
            key={l.lattice_id}
            onClick={() => setSelectedLattice(l.lattice_id)}
            aria-pressed={selectedLattice === l.lattice_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedLattice === l.lattice_id
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">{l.lattice_id}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {l.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{l.topology}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Winding Q={l.default_winding_q} | Coupling={l.default_gauge_coupling}</div>
              <div>Base Suppression: {l.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Winding Index (Q)
            </label>
            <input
              type="number"
              min={1}
              max={32}
              step={1}
              value={windingQ}
              onChange={(e) => setWindingQ(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Instanton Size (rho)
            </label>
            <input
              type="number"
              min={0.05}
              max={2.5}
              step={0.05}
              value={rho}
              onChange={(e) => setRho(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Gauge Coupling (g)
            </label>
            <input
              type="number"
              min={0.4}
              max={5}
              step={0.05}
              value={gaugeCoupling}
              onChange={(e) => setGaugeCoupling(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Theta Clamp Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={thetaGain}
              onChange={(e) => setThetaGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleClamp}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-emerald-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Clamping Instanton Tunneling...' : 'Clamp BPST Instanton & Seal Theta Vacuum'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Skyrmion-Instanton Telemetry ({telemetry.lattice_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Winding Fidelity</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.topological_winding_fidelity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Tunneling Suppression</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.tunneling_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Pontryagin Action S_E</div>
              <div className="text-base font-bold text-green-300">
                {telemetry.pontryagin_euclidean_action}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Theta CP Residual</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.theta_vacuum_cp_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

