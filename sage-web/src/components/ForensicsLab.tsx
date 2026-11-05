"use client";

import React, { useState } from "react";
import {
  Microscope,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Radio,
  FileSearch,
  CheckCircle2,
  Terminal,
} from "lucide-react";

export function ForensicsLab() {
  const [host, setHost] = useState("prod-k8s-node-04");
  const [loading, setLoading] = useState(false);
  const [bundle, setBundle] = useState<any>(null);

  const acquireMemory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/forensics/acquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_host: host }),
      });
      if (res.ok) {
        const data = await res.json();
        setBundle(data.forensic_bundle);
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
            <Microscope className="h-6 w-6 text-teal-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Autonomous Live Forensics & Volatility Acquisition Lab
            </h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Non-disruptive volatile memory acquisition, parent-child process anomaly carving, unbacked RWX shellcode extraction, and chain-of-custody seals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:border-teal-500 focus:outline-none"
            placeholder="Host to acquire..."
          />
          <button
            onClick={acquireMemory}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-500 hover:to-cyan-600 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-teal-950/40 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Microscope className="h-4 w-4" />}
            Acquire Live Volatile Memory
          </button>
        </div>
      </div>

      {bundle ? (
        <div className="space-y-6">
          {/* Chain of Custody Seal Card */}
          <div className="p-4 bg-teal-950/30 border border-teal-500/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-teal-400" />
              <div>
                <p className="text-xs font-semibold text-white">Chain of Custody Cryptographically Verified</p>
                <p className="text-[11px] text-teal-300 font-mono">
                  Container: {bundle.container_id} | SHA-256: {bundle.evidence_sha256?.substring(0, 32)}...
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-900/60 text-teal-300">RFC 3161 SEALED</span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Target Host</span>
              <p className="text-sm font-bold text-zinc-200 mt-1">{bundle.target_host}</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Anomalous Processes</span>
              <p className="text-2xl font-bold text-rose-500">{bundle.anomalous_process_count}</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Active C2 Sockets</span>
              <p className="text-2xl font-bold text-amber-400">{bundle.suspicious_socket_count}</p>
            </div>
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl">
              <span className="text-xs text-zinc-400">Carved RWX Injections</span>
              <p className="text-2xl font-bold text-teal-400">{bundle.carved_memory_injections}</p>
            </div>
          </div>

          {/* Anomalous Process Tree */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-rose-400" />
              Carved Process Execution Anomalies
            </h3>
            <div className="space-y-2">
              {bundle.process_tree?.map((p: any, idx: number) => (
                <div key={idx} className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-white">
                      PID {p.pid} ({p.name}) &lt;- PPID {p.ppid}
                    </span>
                    <p className="text-[11px] text-zinc-400 font-mono">{p.path}</p>
                    <p className="text-[11px] text-rose-400 mt-0.5">{p.reason}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300">ANOMALY</span>
                </div>
              ))}
            </div>
          </div>

          {/* Memory Carving & Shellcode Hex Preview */}
          {bundle.injected_memory_regions?.length > 0 && (
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-teal-400" />
                Carved Injected Shellcode Memory Preview
              </h3>
              {bundle.injected_memory_regions.map((inj: any, idx: number) => (
                <div key={idx} className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span>BASE: {inj.base_address} | SIZE: {inj.region_size_kb} KB</span>
                    <span className="text-amber-400 font-bold">{inj.protection}</span>
                  </div>
                  <div className="p-3 bg-zinc-900/90 rounded border border-zinc-800/90 text-teal-300 overflow-x-auto">
                    <code>{inj.hex_preview}</code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-zinc-500 text-sm border border-dashed border-zinc-800/80 rounded-xl">
          Click <span className="text-teal-400 font-semibold">Acquire Live Volatile Memory</span> to perform memory forensics on the designated cluster host.
        </div>
      )}
    </div>
  );
}

