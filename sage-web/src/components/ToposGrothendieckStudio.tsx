'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Layers } from 'lucide-react';

interface ToposSite {
  site_id: string;
  classification: string;
  default_sheaf_dimension: number;
  default_cech_cover_rank: number;
  default_omega_depth: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  site_id: string;
  classification: string;
  sheaf_dimension: number;
  cech_cover_rank: number;
  omega_classifier_depth: number;
  topos_gain: number;
  cech_gluing_obstruction: number;
  sheaf_descent_coherence: number;
  sheaf_suppression_db: number;
  topos_gluing_unitarity_pct: number;
  lawvere_tierney_idempotent: boolean;
  status: string;
  timestamp: number;
}

export default function ToposGrothendieckStudio() {
  const [sites, setSites] = useState<ToposSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('TOPOS-ETALE-Z3-01');
  const [sheafDimension, setSheafDimension] = useState<number>(8);
  const [cechCoverRank, setCechCoverRank] = useState<number>(12);
  const [omegaDepth, setOmegaDepth] = useState<number>(6);
  const [toposGain, setToposGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchSites = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/topos-grothendieck-firewall/sites');
      const data = (await res.json().catch(() => ({}))) as {
        sites?: ToposSite[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Grothendieck topos sites');
      }
      if (data.sites) {
        setSites(data.sites);
        if (data.sites.length > 0) {
          setSelectedSite((prev) => prev || data.sites![0].site_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load Grothendieck topos sites');
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/topos-grothendieck-firewall/seal-sheaf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: selectedSite,
          sheaf_dimension: sheafDimension,
          cech_cover_rank: cechCoverRank,
          omega_classifier_depth: omegaDepth,
          topos_gain: toposGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Grothendieck topos sheaf seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Grothendieck topos sheaf seal failed');
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
              Capability 137: Grothendieck Topos Site Sheaf &amp; Logic-Classifier Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Etale topos sheaves, Lawvere-Tierney modal topologies &amp; Cech 1-cocycle gluing verification
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchSites}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Sites</span>
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
        {sites.map((s) => (
          <button
            type="button"
            key={s.site_id}
            onClick={() => setSelectedSite(s.site_id)}
            aria-pressed={selectedSite === s.site_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedSite === s.site_id
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-indigo-400">{s.site_id}</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                {s.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{s.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Dim={s.default_sheaf_dimension} | Cech={s.default_cech_cover_rank}</div>
              <div>Base Suppression: {s.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Sheaf Dimension
            </label>
            <input
              type="number"
              min={2}
              max={64}
              step={2}
              value={sheafDimension}
              onChange={(e) => setSheafDimension(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Cech Cover Rank
            </label>
            <input
              type="number"
              min={4}
              max={128}
              step={2}
              value={cechCoverRank}
              onChange={(e) => setCechCoverRank(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Omega Classifier Depth
            </label>
            <input
              type="number"
              min={2}
              max={32}
              step={1}
              value={omegaDepth}
              onChange={(e) => setOmegaDepth(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Topos Modal Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={toposGain}
              onChange={(e) => setToposGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-indigo-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Sealing Topos Sheaf...' : 'Verify Cech Gluing & Seal Grothendieck Topos Sheaf'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-indigo-950/20 border border-indigo-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-900/50 pb-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Grothendieck Topos Telemetry ({telemetry.site_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Gluing Unitarity</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.topos_gluing_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Sheaf Suppression</div>
              <div className="text-base font-bold text-violet-300">
                {telemetry.sheaf_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Descent Coherence</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.sheaf_descent_coherence}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Cech Obstruction</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.cech_gluing_obstruction}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

