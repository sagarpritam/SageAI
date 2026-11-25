"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers } from "lucide-react";

interface MicrolocalSheaf {
  sheaf_id: string;
  manifold_name: string;
  cotangent_dimension: number;
  singular_support_dimension: number;
  involutive_codimension: number;
  base_fidelity_pct: number;
  involutive_verified: boolean;
}

interface KashiwaraTelemetry {
  sheaf_id: string;
  status: string;
  microlocal_residual: number;
  involutive_verified: boolean;
  singular_support_dimension: number;
  cotangent_order: number;
  ks_shield_strength_pev: number;
  cotangent_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function KashiwaraMicrolocalStudio() {
  const [sheaves, setSheaves] = useState<MicrolocalSheaf[]>([]);
  const [selectedSheaf, setSelectedSheaf] = useState<string>("");
  const [cotangentOrder, setCotangentOrder] = useState<number>(4);
  const [contactGain, setContactGain] = useState<number>(1.25);
  const [phaseCutoff, setPhaseCutoff] = useState<number>(0.0001);
  const [telemetry, setTelemetry] = useState<KashiwaraTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSheaves = async () => {
    try {
      const res = await fetch("/api/kashiwara-schapira-microlocal/sheaves");
      if (!res.ok) throw new Error("Failed to fetch microlocal sheaves");
      const data = await res.json();
      setSheaves(data.sheaves || []);
      if (data.sheaves?.length > 0 && !selectedSheaf) {
        setSelectedSheaf(data.sheaves[0].sheaf_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching sheaves");
    }
  };

  useEffect(() => {
    fetchSheaves();
  }, []);

  const handleEvaluateMicrolocalSupport = async () => {
    if (!selectedSheaf) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kashiwara-schapira-microlocal/evaluate-microlocal-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheaf_id: selectedSheaf,
          cotangent_order: cotangentOrder,
          contact_gain: contactGain,
          phase_cutoff: phaseCutoff,
        }),
      });
      if (!res.ok) throw new Error("Microlocal support evaluation failed");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Shield className="w-3.5 h-3.5" />
              Capability 191 • Wave 57
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Kashiwara-Schapira Sheaves & Microlocal Defect Shield
            </h2>
            <p className="text-sm text-zinc-400">
              Formulates Masaki Kashiwara and Pierre Schapira&apos;s microlocal theory of sheaves on manifolds, calculating singular supports SS(F) in T*X and enforcing involutivity.
            </p>
          </div>
          <button
            onClick={fetchSheaves}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Sheaves
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Control & Parameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Select Sheaf Configuration
          </h3>
          <div className="space-y-2">
            {sheaves.map((s) => (
              <button
                key={s.sheaf_id}
                onClick={() => setSelectedSheaf(s.sheaf_id)}
                className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all ${
                  selectedSheaf === s.sheaf_id
                    ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                    : "bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800/70 text-zinc-400"
                }`}
              >
                <div className="font-bold text-zinc-200">{s.sheaf_id}</div>
                <div className="text-zinc-400 text-[11px] truncate">{s.manifold_name}</div>
                <div className="mt-1 flex gap-3 text-[10px] text-zinc-500">
                  <span>dim(T*X)={s.cotangent_dimension}</span>
                  <span>dim(SS)={s.singular_support_dimension}</span>
                  <span>Involutive={String(s.involutive_verified)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-5">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Microlocal Shield Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Cotangent Order: {cotangentOrder}</label>
              <input
                type="range"
                min="1"
                max="16"
                step="1"
                value={cotangentOrder}
                onChange={(e) => setCotangentOrder(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Contact Gain: {contactGain.toFixed(2)}</label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={contactGain}
                onChange={(e) => setContactGain(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Phase Cutoff: {phaseCutoff}</label>
              <input
                type="number"
                value={phaseCutoff}
                onChange={(e) => setPhaseCutoff(parseFloat(e.target.value) || 0.0001)}
                className="w-full bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded text-xs text-white"
              />
            </div>
          </div>

          <button
            onClick={handleEvaluateMicrolocalSupport}
            disabled={loading || !selectedSheaf}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Enforce Microlocal Singular Involutivity
          </button>
        </div>
      </div>

      {/* Telemetry Output */}
      {telemetry && (
        <div className="p-6 bg-zinc-900/60 border border-emerald-500/20 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 font-mono">
              <Activity className="w-4 h-4" />
              TELEMETRY: {telemetry.status}
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              {new Date(telemetry.timestamp * 1000).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Shield Strength</div>
              <div className="text-lg font-bold text-white font-mono">{telemetry.ks_shield_strength_pev.toFixed(1)} PeV</div>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Cotangent Suppression</div>
              <div className="text-lg font-bold text-white font-mono">{telemetry.cotangent_suppression_db.toFixed(1)} dB</div>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Microlocal Residual</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">{telemetry.microlocal_residual.toFixed(6)}</div>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Involutive Verified</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">{String(telemetry.involutive_verified)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
