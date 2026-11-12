'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Shield } from 'lucide-react';

interface BCFTInterface {
  interface_id: string;
  boundary_system: string;
  default_g_uv: number;
  default_g_ir: number;
  default_transmission_coeff: number;
  base_unitarity_pct: number;
  base_isolation_db: number;
  status: string;
}

interface SealInterfaceResult {
  interface_id: string;
  boundary_system: string;
  g_uv: number;
  g_ir: number;
  delta_ln_g: number;
  g_theorem_satisfied: boolean;
  transmission_coeff: number;
  reflection_coeff: number;
  cardy_clamp_gain: number;
  cardy_orthogonality_index: number;
  boundary_anomaly_residual: number;
  defect_isolation_db: number;
  bcft_unitarity_pct: number;
  status: string;
  timestamp: number;
}

export default function CFTDefectBCFTStudio() {
  const [interfaces, setInterfaces] = useState<BCFTInterface[]>([]);
  const [selectedInterface, setSelectedInterface] = useState<string>('BCFT-CARDY-ISING-01');
  const [gUv, setGUv] = useState<number>(2.0);
  const [gIr, setGIr] = useState<number>(1.414);
  const [transmissionCoeff, setTransmissionCoeff] = useState<number>(0.94);
  const [clampGain, setClampGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealInterfaceResult | null>(null);

  const fetchInterfaces = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/cft-defect-bcft/interfaces');
      const data = (await res.json().catch(() => ({}))) as {
        interfaces?: BCFTInterface[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load BCFT defect interfaces');
      }
      if (data.interfaces) {
        setInterfaces(data.interfaces);
        if (data.interfaces.length > 0) {
          setSelectedInterface((prev) => prev || data.interfaces![0].interface_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load BCFT defect interfaces');
    }
  }, []);

  useEffect(() => {
    fetchInterfaces();
  }, [fetchInterfaces]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/cft-defect-bcft/seal-interface', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interface_id: selectedInterface,
          g_uv: gUv,
          g_ir: gIr,
          transmission_coeff: transmissionCoeff,
          cardy_clamp_gain: clampGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealInterfaceResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'BCFT defect interface seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'BCFT defect interface seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-300">
              Capability 129: Boundary CFT (BCFT) Defect Line &amp; g-Theorem RG Interface Shield
            </h2>
            <p className="text-sm text-slate-400">
              Cardy-Ishibashi boundary orthogonality, Affleck-Ludwig g-theorem monotonicity &amp; defect reflection audit
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchInterfaces}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Interfaces</span>
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
        {interfaces.map((i) => (
          <button
            type="button"
            key={i.interface_id}
            onClick={() => setSelectedInterface(i.interface_id)}
            aria-pressed={selectedInterface === i.interface_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedInterface === i.interface_id
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-cyan-400">{i.interface_id}</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                {i.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{i.boundary_system}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>g_UV={i.default_g_uv} → g_IR={i.default_g_ir}</div>
              <div>Base Isolation: {i.base_isolation_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              UV Boundary g_UV
            </label>
            <input
              type="number"
              min={1}
              max={16}
              step={0.1}
              value={gUv}
              onChange={(e) => setGUv(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              IR Boundary g_IR
            </label>
            <input
              type="number"
              min={0.5}
              max={16}
              step={0.05}
              value={gIr}
              onChange={(e) => setGIr(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Transmission (T)
            </label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={transmissionCoeff}
              onChange={(e) => setTransmissionCoeff(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Cardy Clamp Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={clampGain}
              onChange={(e) => setClampGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-cyan-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Sealing BCFT Defect Interface...' : 'Seal BCFT Defect & Enforce g-Theorem Flow'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-cyan-950/20 border border-cyan-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/50 pb-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>BCFT Defect &amp; g-Theorem Telemetry ({telemetry.interface_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">BCFT Unitarity</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.bcft_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Defect Isolation</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.defect_isolation_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Δ ln(g) RG Gradient</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.delta_ln_g}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Cardy Orthogonality</div>
              <div className="text-base font-bold text-sky-300">
                {telemetry.cardy_orthogonality_index}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

