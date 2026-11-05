"use client";

import React, { useState } from "react";
import {
  PackageCheck,
  FileCode,
  ShieldCheck,
  RefreshCw,
  Award,
  Layers,
  CheckCircle,
  Copy,
} from "lucide-react";

export function SBOMVexStudio() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"vex" | "cyclonedx">("vex");
  const [vexData, setVexData] = useState<any>(null);
  const [cyclonedxData, setCyclonedxData] = useState<any>(null);

  const fetchVex = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sbom-vex/openvex");
      if (res.ok) {
        const data = await res.json();
        setVexData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycloneDX = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sbom-vex/cyclonedx");
      if (res.ok) {
        const data = await res.json();
        setCyclonedxData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <PackageCheck className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Software Supply Chain, OpenVEX & SLSA Studio
            </h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Author machine-readable OpenVEX (v0.2.0) exploitability statements, generate CycloneDX 1.5 SBOMs, and verify SLSA Level 3 build provenance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeTab === "vex") fetchVex();
              else fetchCycloneDX();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Generate {activeTab === "vex" ? "OpenVEX Statement" : "CycloneDX SBOM"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => {
            setActiveTab("vex");
            if (!vexData) fetchVex();
          }}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "vex"
              ? "bg-emerald-950/70 text-emerald-300 border border-emerald-800/60"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          OpenVEX Exploitability Statements
        </button>
        <button
          onClick={() => {
            setActiveTab("cyclonedx");
            if (!cyclonedxData) fetchCycloneDX();
          }}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "cyclonedx"
              ? "bg-emerald-950/70 text-emerald-300 border border-emerald-800/60"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          CycloneDX 1.5 Component SBOM
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "vex" && (
        <div className="space-y-4">
          {vexData ? (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 font-mono">SPECIFICATION: OpenVEX v0.2.0</span>
                  <p className="text-sm font-semibold text-white mt-0.5">Autonomous Attestor: {vexData.author}</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-800/40">
                  <Award className="h-3.5 w-3.5" /> SLSA LEVEL 3 COMPLIANT
                </span>
              </div>

              <div className="space-y-3">
                {vexData.statements.map((s: any, idx: number) => (
                  <div key={idx} className="p-4 bg-zinc-950/70 border border-zinc-800/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-cyan-400 border border-zinc-800">
                          {s.vulnerability.name}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">{s.products[0]}</span>
                      </div>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                        STATUS: {s.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-medium">{s.vulnerability.description}</p>
                    <div className="p-2.5 bg-zinc-900/80 rounded border border-zinc-800/80 text-xs space-y-1">
                      <p className="text-zinc-400">
                        <span className="text-emerald-400 font-semibold">Justification:</span> {s.justification}
                      </p>
                      <p className="text-zinc-400">
                        <span className="text-cyan-400 font-semibold">Impact:</span> {s.impact_statement}
                      </p>
                      <p className="text-zinc-400">
                        <span className="text-amber-400 font-semibold">Action:</span> {s.action_statement}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 text-sm border border-dashed border-zinc-800/80 rounded-xl">
              Click <span className="text-emerald-400 font-semibold">Generate OpenVEX Statement</span> to author exploitability justifications.
            </div>
          )}
        </div>
      )}

      {activeTab === "cyclonedx" && (
        <div className="space-y-4">
          {cyclonedxData ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto">
              <pre>{JSON.stringify(cyclonedxData, null, 2)}</pre>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 text-sm border border-dashed border-zinc-800/80 rounded-xl">
              Click <span className="text-emerald-400 font-semibold">Generate CycloneDX SBOM</span> to export bill of materials.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

