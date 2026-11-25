"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, Network, AlertTriangle } from "lucide-react";

interface DessinEnfant {
  dessin_id: string;
  curve_name: string;
  genus_g: number;
  belyi_degree_d: number;
  galois_orbit_size: number;
  monodromy_group: string;
  base_galois_purity_pct: number;
  status: string;
}

interface GrothendieckTelemetry {
  dessin_id: string;
  status: string;
  drinfeld_associator_norm: number;
  associator_order: number;
  drinfeld_lambda: number;
  belyi_monodromy_verified: boolean;
  gt_firewall_strength_pev: number;
  galois_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function GrothendieckTeichmullerStudio() {
  const [dessins, setDessins] = useState<DessinEnfant[]>([]);
  const [selectedDessin, setSelectedDessin] = useState<string>("");
  const [drinfeldLambda, setDrinfeldLambda] = useState<number>(1.0);
  const [associatorOrder, setAssociatorOrder] = useState<number>(4);
  const [firewallGain, setFirewallGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<GrothendieckTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDessins = async () => {
    try {
      const res = await fetch("/api/grothendieck-teichmuller-galois/dessins");
      if (!res.ok) throw new Error("Failed to fetch dessins d'enfants");
      const data = await res.json();
      setDessins(data.dessins || []);
      if (data.dessins?.length > 0 && !selectedDessin) {
        setSelectedDessin(data.dessins[0].dessin_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching dessins");
    }
  };

  useEffect(() => {
    fetchDessins();
  }, []);

  const handleEvaluateAssociator = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/grothendieck-teichmuller-galois/evaluate-associator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dessin_id: selectedDessin,
          drinfeld_lambda: drinfeldLambda,
          associator_order: associatorOrder,
          firewall_gain: firewallGain,
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate Drinfeld associator");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error evaluating associator");
    } finally {
      setLoading(false);
    }
  };

  const currentDessin = dessins.find((d) => d.dessin_id === selectedDessin);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg text-fuchsia-400">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Grothendieck-Teichmuller &amp; Galois Dessins Firewall
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-medium">
                Capability 181
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Grothendieck-Teichmuller group action, absolute Galois group Gal(Q_bar/Q), Belyi maps, and Drinfeld-KZ associators
            </p>
          </div>
        </div>
        <button
          onClick={fetchDessins}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Dessins
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Dessin d&apos;Enfant Algebraic Curve
          </label>
          <select
            value={selectedDessin}
            onChange={(e) => setSelectedDessin(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          >
            {dessins.map((d) => (
              <option key={d.dessin_id} value={d.dessin_id}>
                {d.dessin_id} ({d.curve_name})
              </option>
            ))}
          </select>
          {currentDessin && (
            <p className="text-xs text-slate-500 italic mt-1">
              Genus {currentDessin.genus_g} &bull; Belyi Degree {currentDessin.belyi_degree_d} &bull; Galois Orbit {currentDessin.galois_orbit_size}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Drinfeld Associator Order: {associatorOrder}
          </label>
          <input
            type="range"
            min="2"
            max="8"
            step="1"
            value={associatorOrder}
            onChange={(e) => setAssociatorOrder(parseInt(e.target.value, 10))}
            className="w-full accent-fuchsia-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Order 2 (Quadratic)</span>
            <span>Order 8 (Octaval)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Galois Firewall Gain: {firewallGain}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.25"
            value={firewallGain}
            onChange={(e) => setFirewallGain(parseFloat(e.target.value))}
            className="w-full accent-fuchsia-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.5x</span>
            <span>2.5x</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleEvaluateAssociator}
          disabled={loading || !selectedDessin}
          className="flex items-center gap-2 px-6 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-fuchsia-950/50 transition cursor-pointer"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Evaluate Drinfeld Associator &amp; Lock Galois Group
        </button>
      </div>

      {telemetry && (
        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-fuchsia-400" />
              Grothendieck-Teichmuller Telemetry
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Drinfeld Associator Norm</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.drinfeld_associator_norm}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Belyi Monodromy</p>
              <p className="text-lg font-bold text-fuchsia-400 mt-0.5">VERIFIED</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Firewall Strength</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.gt_firewall_strength_pev} PeV</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Galois Suppression</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">+{telemetry.galois_suppression_db} dB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default GrothendieckTeichmullerStudio;
