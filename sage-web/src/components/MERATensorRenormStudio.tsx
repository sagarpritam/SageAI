'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Network } from 'lucide-react';

interface MERANetwork {
  network_id: string;
  architecture: string;
  default_bond_dim_chi: number;
  default_rg_layers: number;
  default_c_central_charge: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface RenormResult {
  network_id: string;
  architecture: string;
  bond_dim_chi: number;
  rg_layers: number;
  central_charge: number;
  disentangler_gain: number;
  ascending_spectral_gap: number;
  uv_entanglement_entropy: number;
  cone_truncation_residual: number;
  causal_cone_suppression_db: number;
  isometry_unitarity_pct: number;
  causal_cone_certified: boolean;
  status: string;
  timestamp: number;
}

export default function MERATensorRenormStudio() {
  const [networks, setNetworks] = useState<MERANetwork[]>([]);
  const [selectedNet, setSelectedNet] = useState<string>('MERA-TERNARY-ADS3-01');
  const [bondDimChi, setBondDimChi] = useState<number>(32);
  const [rgLayers, setRgLayers] = useState<number>(14);
  const [centralCharge, setCentralCharge] = useState<number>(12.0);
  const [disentanglerGain, setDisentanglerGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<RenormResult | null>(null);

  const fetchNetworks = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/mera-tensor-renorm/networks');
      const data = (await res.json().catch(() => ({}))) as {
        networks?: MERANetwork[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load MERA tensor networks');
      }
      if (data.networks) {
        setNetworks(data.networks);
        if (data.networks.length > 0) {
          setSelectedNet((prev) => prev || data.networks![0].network_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load MERA tensor networks');
    }
  }, []);

  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  const handleRenormalize = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/mera-tensor-renorm/renormalize-cone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network_id: selectedNet,
          bond_dim_chi: bondDimChi,
          rg_layers: rgLayers,
          central_charge: centralCharge,
          disentangler_gain: disentanglerGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as RenormResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'MERA causal-cone renormalization failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'MERA causal-cone renormalization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <Network className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-violet-300">
              Capability 131: MERA &amp; Continuous cMERA Tensor Renormalization Circuit Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Multi-scale entanglement renormalization ansatz, isometric disentanglers &amp; causal-cone suppression
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchNetworks}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Networks</span>
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
        {networks.map((n) => (
          <button
            type="button"
            key={n.network_id}
            onClick={() => setSelectedNet(n.network_id)}
            aria-pressed={selectedNet === n.network_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedNet === n.network_id
                ? 'bg-violet-950/40 border-violet-500/60 shadow-lg shadow-violet-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-violet-400">{n.network_id}</span>
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                {n.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{n.architecture}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Bond Dim chi={n.default_bond_dim_chi} | Layers={n.default_rg_layers}</div>
              <div>Base Suppression: {n.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Bond Dimension (chi)
            </label>
            <input
              type="number"
              min={8}
              max={512}
              step={8}
              value={bondDimChi}
              onChange={(e) => setBondDimChi(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              RG Layers
            </label>
            <input
              type="number"
              min={4}
              max={64}
              step={1}
              value={rgLayers}
              onChange={(e) => setRgLayers(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Central Charge (c)
            </label>
            <input
              type="number"
              min={1}
              max={128}
              step={1}
              value={centralCharge}
              onChange={(e) => setCentralCharge(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Disentangler Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={disentanglerGain}
              onChange={(e) => setDisentanglerGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleRenormalize}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-violet-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Contracting Causal Cone...' : 'Contract MERA Causal Cone & Seal Isometry'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-violet-950/20 border border-violet-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-violet-900/50 pb-3">
            <div className="flex items-center space-x-2 text-violet-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>MERA Tensor Renormalization Telemetry ({telemetry.network_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Isometry Unitarity</div>
              <div className="text-base font-bold text-violet-300">
                {telemetry.isometry_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Cone Suppression</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.causal_cone_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Spectral Gap</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.ascending_spectral_gap}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Truncation Residual</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.cone_truncation_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

