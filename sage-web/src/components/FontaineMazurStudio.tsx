"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, KeyRound } from "lucide-react";

interface GaloisRepresentation {
  rep_id: string;
  name: string;
  prime_p: number;
  hodge_tate_span: number;
  geometric_verified: boolean;
  base_fidelity_pct: number;
}

interface FontaineTelemetry {
  rep_id: string;
  status: string;
  de_rham_ramification_defect: number;
  geometric_verified: boolean;
  prime_p: number;
  hodge_tate_span: number;
  fontaine_firewall_strength_pev: number;
  non_geometric_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function FontaineMazurStudio() {
  const [reps, setReps] = useState<GaloisRepresentation[]>([]);
  const [selectedRep, setSelectedRep] = useState<string>("");
  const [primeP, setPrimeP] = useState<number>(5);
  const [hodgeTateSpan, setHodgeTateSpan] = useState<number>(2);
  const [firewallGain, setFirewallGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<FontaineTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReps = async () => {
    try {
      const res = await fetch("/api/fontaine-mazur-geometricity/representations");
      if (!res.ok) throw new Error("Failed to fetch representations");
      const data = await res.json();
      setReps(data.representations || []);
      if (data.representations?.length > 0 && !selectedRep) {
        setSelectedRep(data.representations[0].rep_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching representations");
    }
  };

  useEffect(() => {
    fetchReps();
  }, []);

  const evaluateGeometricity = async () => {
    if (!selectedRep) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fontaine-mazur-geometricity/evaluate-galois-geometricity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rep_id: selectedRep,
          prime_p: primeP,
          hodge_tate_span: hodgeTateSpan,
          firewall_gain: firewallGain,
        }),
      });
      if (!res.ok) throw new Error("Geometricity evaluation failed");
      setTelemetry(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating geometricity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Fontaine-Mazur Galois Geometricity Firewall
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Capability 214
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Fontaine-Mazur Conjecture characterizing geometric p-adic Galois representations (unramified outside S, de Rham at p)
            </p>
          </div>
        </div>
        <button
          onClick={fetchReps}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Target Galois Representation
            </label>
            <select
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {reps.map((r) => (
                <option key={r.rep_id} value={r.rep_id}>
                  {r.name} ({r.rep_id})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Prime p: {primeP}
              </label>
              <input
                type="range"
                min="3"
                max="19"
                step="2"
                value={primeP}
                onChange={(e) => setPrimeP(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Hodge-Tate Weight Span: {hodgeTateSpan}
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={hodgeTateSpan}
                onChange={(e) => setHodgeTateSpan(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Firewall Gain Multiplier: {firewallGain.toFixed(2)}x
              </label>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.05"
                value={firewallGain}
                onChange={(e) => setFirewallGain(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <button
            onClick={evaluateGeometricity}
            disabled={loading || !selectedRep}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-amber-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Checking de Rham...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Lock Galois Geometricity
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2">
          {telemetry ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Telemetry Status
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Shield className="w-3.5 h-3.5" /> {telemetry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Hodge-Tate</span>
                  <span className="text-lg font-bold text-amber-400">
                    span = {telemetry.hodge_tate_span}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Firewall Strength</span>
                  <span className="text-lg font-bold text-orange-400">
                    {telemetry.fontaine_firewall_strength_pev.toFixed(2)} PeV
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Non-Geom Suppr</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.non_geometric_suppression_db.toFixed(1)} dB
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Fidelity</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {telemetry.effective_fidelity_pct.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Jean-Marc Fontaine &amp; Barry Mazur de Rham Invariants
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">de Rham Ramification Defect:</div>
                  <div className="text-slate-200 font-mono text-right">
                    {telemetry.de_rham_ramification_defect.toExponential(4)}
                  </div>

                  <div className="text-slate-400">Geometricity Status:</div>
                  <div className="text-amber-400 font-semibold text-right flex items-center justify-end gap-1">
                    <Lock className="w-3.5 h-3.5" />{" "}
                    {telemetry.geometric_verified ? "DE RHAM GEOMETRIC LOCKED" : "DEVIATING"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <KeyRound className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Representation Evaluated</p>
              <p className="text-sm">Select a p-adic Galois representation and verify de Rham geometricity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
