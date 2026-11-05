"use client";

import React, { useState, useEffect } from "react";
import {
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  Layers,
  KeyRound,
  RefreshCw,
  Plus,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Radio,
  Clock,
  Server,
  ArrowRight,
  Play,
} from "lucide-react";

interface SvidRecord {
  svid_id: string;
  spiffe_id: string;
  workload_name: string;
  namespace: string;
  service_account: string;
  cert_serial: string;
  status: string;
  ttl_minutes: number;
  rotation_interval_minutes: number;
  enclave_attested: boolean;
}

export function WorkloadIdentityStudio() {
  const [svids, setSvids] = useState<SvidRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);

  // New SVID form state
  const [newNamespace, setNewNamespace] = useState("prod");
  const [newSa, setNewSa] = useState("recommendation-worker");
  const [newAttested, setNewAttested] = useState(true);

  // L7 Policy Simulator state
  const [srcSpiffe, setSrcSpiffe] = useState("spiffe://sageai.internal/ns/prod/sa/order-service");
  const [dstSpiffe, setDstSpiffe] = useState("spiffe://sageai.internal/ns/prod/sa/payment-service");
  const [httpMethod, setHttpMethod] = useState("POST");
  const [httpPath, setHttpPath] = useState("/v1/charge");
  const [evalResult, setEvalResult] = useState<any>(null);

  const fetchSvids = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workload-identity/svids");
      if (res.ok) {
        const data = await res.json();
        setSvids(data.svids || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSvids();
  }, []);

  const issueSvid = async () => {
    setIssuing(true);
    try {
      const res = await fetch("/api/workload-identity/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespace: newNamespace,
          service_account: newSa,
          enclave_attested: newAttested,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSvids((prev) => [data.svid, ...prev]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIssuing(false);
    }
  };

  const evaluateL7 = async () => {
    setEvalLoading(true);
    try {
      const res = await fetch("/api/workload-identity/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_spiffe_id: srcSpiffe,
          destination_spiffe_id: dstSpiffe,
          http_method: httpMethod,
          http_path: httpPath,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvalResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvalLoading(false);
    }
  };

  const revokeSvid = async (id: string) => {
    try {
      setSvids((prev) =>
        prev.map((s) => (s.svid_id === id ? { ...s, status: "REVOKED_COMPROMISED" } : s))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Zero-Trust Workload Identity Fabric &bull; SPIFFE/SPIRE
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                Phase 6.5 &bull; Rotating 60m SVIDs + Cilium eBPF L7
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Cryptographic workload-to-workload mutual TLS (mTLS) with 60-minute rotating X.509 SVIDs enforced via kernel-level Cilium eBPF socket filters.
            </p>
          </div>
        </div>

        <button
          onClick={fetchSvids}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: SVID Issuance & Active SVIDs */}
        <div className="lg:col-span-6 space-y-4">
          {/* Issue SVID Form */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                Issue Attested Workload SVID
              </span>
              <span className="text-xs text-blue-400 font-mono">60m Lifetime</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Kubernetes Namespace</label>
                <input
                  type="text"
                  value={newNamespace}
                  onChange={(e) => setNewNamespace(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">ServiceAccount Name</label>
                <input
                  type="text"
                  value={newSa}
                  onChange={(e) => setNewSa(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-300 font-mono">Hardware Enclave Attestation Required</span>
              <input
                type="checkbox"
                checked={newAttested}
                onChange={(e) => setNewAttested(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={issueSvid}
              disabled={issuing}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {issuing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {issuing ? "Attesting & Issuing SVID..." : "Attest Workload & Issue SVID"}
            </button>
          </div>

          {/* Active SVIDs List */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Monitored SVID Certificates ({svids.length})
              </span>
              <span className="text-xs text-emerald-400 font-mono">Rotating mTLS Active</span>
            </div>

            <div className="space-y-2.5">
              {svids.map((s) => (
                <div
                  key={s.svid_id}
                  className={`p-3 rounded-lg border transition font-mono text-xs space-y-1.5 ${
                    s.status.includes("REVOKED")
                      ? "bg-red-950/20 border-red-500/30 text-red-300"
                      : "bg-slate-950 border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-blue-300 font-bold truncate max-w-[280px]">
                      {s.spiffe_id}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        s.status.includes("REVOKED")
                          ? "bg-red-500/20 text-red-300"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Serial: {s.cert_serial}</span>
                    <span>TTL: {s.ttl_minutes}m (Rotate: {s.rotation_interval_minutes}m)</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    {s.enclave_attested && (
                      <span className="text-[10px] text-teal-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Silicon Attested
                      </span>
                    )}
                    {s.status === "ACTIVE_VALID" && (
                      <button
                        onClick={() => revokeSvid(s.svid_id)}
                        className="text-[10px] text-red-400 hover:text-red-300 transition"
                      >
                        Revoke SVID
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Cilium in-Kernel eBPF L7 Policy Simulator */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                In-Kernel Cilium eBPF L7 Policy Simulator
              </span>
              <span className="text-xs text-blue-400 font-mono">Socket-Level Fastpath</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Cilium directly inspects SPIFFE mTLS identities and HTTP semantics inside Linux kernel socket tracepoints without passing untrusted packets into user space.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Source Workload SPIFFE ID</label>
                <input
                  type="text"
                  value={srcSpiffe}
                  onChange={(e) => setSrcSpiffe(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Destination Workload SPIFFE ID</label>
                <input
                  type="text"
                  value={dstSpiffe}
                  onChange={(e) => setDstSpiffe(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">HTTP Method</label>
                  <select
                    value={httpMethod}
                    onChange={(e) => setHttpMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                  >
                    <option>POST</option>
                    <option>GET</option>
                    <option>DELETE</option>
                    <option>PUT</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 block mb-1">Target Endpoint / Path</label>
                  <input
                    type="text"
                    value={httpPath}
                    onChange={(e) => setHttpPath(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={evaluateL7}
                disabled={evalLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {evalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {evalLoading ? "Filtering in eBPF..." : "Simulate eBPF Kernel L7 Filter"}
              </button>
            </div>

            {evalResult && (
              <div
                className={`p-4 rounded-xl border space-y-2 font-mono text-xs ${
                  evalResult.verdict === "ALLOW"
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : "bg-red-950/40 border-red-500/40 text-red-300"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    {evalResult.verdict === "ALLOW" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                    Kernel Verdict: {evalResult.verdict}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {evalResult.latency_overhead_ms ? `${evalResult.latency_overhead_ms}ms overhead` : "Immediate Drop"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">{evalResult.kernel_reason}</div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  Enforcement: {evalResult.enforcement}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
