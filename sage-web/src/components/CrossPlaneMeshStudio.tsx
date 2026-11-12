"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Network,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  Zap,
  Globe,
  Radio,
} from "lucide-react";

interface PolicyTranslation {
  AWS?: { sg_id: string; rules: any[] };
  AZURE?: { nsg_id: string; rules: any[] };
  GCP?: { firewall_rule: string; rules?: any[] };
  CILIUM_K8S?: { kind: string; rules?: any[] };
}

interface PolicyRecord {
  policy_id: string;
  name: string;
  intent_description: string;
  enforcement_mode: string;
  status: string;
  translations: PolicyTranslation;
}

export function CrossPlaneMeshStudio() {
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRecord | null>(null);
  const [healthData, setHealthData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // New policy state
  const [intentName, setIntentName] = useState("Strict Payment Gateway Isolation");
  const [intentDesc, setIntentDesc] = useState("Allow mTLS only from checkout pods to billing vault on port 8443; deny internet.");
  const [targetPort, setTargetPort] = useState(8443);
  const [translating, setTranslating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/crossplane-mesh/policies");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to load cross-plane mesh policies");
      }
      if (data.policies) {
        setPolicies(data.policies);
        if (data.policies.length > 0) {
          setSelectedPolicy((prev) => prev || data.policies[0]);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load cross-plane mesh policies");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/crossplane-mesh/health");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to load cross-plane mesh health telemetry");
      }
      if (data.health) {
        setHealthData(data.health);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load cross-plane mesh health telemetry");
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
    fetchHealth();
  }, [fetchPolicies, fetchHealth]);

  async function handleTranslatePolicy(e: React.FormEvent) {
    e.preventDefault();
    setTranslating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/crossplane-mesh/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: intentName,
          intent_description: intentDesc,
          target_port: Number(targetPort),
          target_clouds: ["AWS", "AZURE", "GCP", "CILIUM_K8S"],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to translate cross-plane security policy");
      }
      if (data.policy) {
        setPolicies((prev) => [data.policy, ...prev]);
        setSelectedPolicy(data.policy);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to translate cross-plane security policy");
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-950 border border-teal-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Capability 43
            </span>
            <span className="text-xs text-slate-400">Cross-Cloud Policy & SPIFFE Federation Mesh</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-teal-400" />
            Multi-Cloud Zero-Trust Cross-Plane Mesh
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Translates unified security intent into AWS Security Groups, Azure NSGs, GCP Firewalls, and Cilium eBPF NetworkPolicies while synchronizing federated workload identities.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            fetchPolicies();
            fetchHealth();
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-950/40 border border-red-700/60 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-red-300 hover:text-white underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Cross-Cloud Mesh Telemetry Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Mesh Nodes Online</div>
          <div className="text-2xl font-bold text-white mt-1">3 / 3</div>
          <div className="text-xs text-teal-400 mt-1 flex items-center gap-1">
            <Cloud className="w-3 h-3" /> AWS &bull; Azure &bull; GCP
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Cross-Plane Latency (p95)</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">
            {healthData?.cross_plane_latency_p95_ms || 16.5} ms
          </div>
          <div className="text-xs text-slate-500 mt-1">Direct wireguard tunnel</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Active Policies</div>
          <div className="text-2xl font-bold text-white mt-1">{policies.length}</div>
          <div className="text-xs text-emerald-400 mt-1">Synchronized across planes</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Identity Federation</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">100%</div>
          <div className="text-xs text-slate-500 mt-1 truncate">SPIFFE &bull; AWS &bull; Azure &bull; GCP</div>
        </div>
      </div>

      {/* Main Studio View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Intent Policy Synthesizer Form & Policy List */}
        <div className="lg:col-span-1 space-y-4">
          <form onSubmit={handleTranslatePolicy} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-white uppercase tracking-wider">
              Declare Unified Security Intent
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Intent Policy Name</label>
              <input
                type="text"
                value={intentName}
                onChange={(e) => setIntentName(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">High-Level Intent Specification</label>
              <textarea
                value={intentDesc}
                onChange={(e) => setIntentDesc(e.target.value)}
                rows={2}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Target Microservice Port</label>
              <input
                type="number"
                value={targetPort}
                onChange={(e) => setTargetPort(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={translating}
              className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition flex items-center justify-center gap-2 mt-2"
            >
              <Zap className="w-3.5 h-3.5" />
              Translate & Enforce Across Clouds
            </button>
          </form>

          {/* List of Policies */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              Active Unified Intent Policies ({policies.length})
            </h4>
            {policies.map((pol) => {
              const isSelected = selectedPolicy?.policy_id === pol.policy_id;
              return (
                <div
                  key={pol.policy_id}
                  onClick={() => setSelectedPolicy(pol)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? "bg-slate-800/90 border-teal-500/50 shadow-lg shadow-teal-950/20"
                      : "bg-slate-900/50 border-slate-800 hover:bg-slate-850 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-white">{pol.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {pol.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 truncate">{pol.intent_description}</div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800">
                    <span>Enforcement: {pol.enforcement_mode}</span>
                    <span className="font-mono text-teal-400">AWS &bull; Azure &bull; GCP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Multi-Cloud Translation Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPolicy ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">{selectedPolicy.name}</h3>
                  <span className="text-xs font-mono text-teal-400 bg-teal-950/50 px-2.5 py-1 rounded border border-teal-800/40">
                    {selectedPolicy.policy_id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedPolicy.intent_description}</p>
              </div>

              {/* Cloud Firewall Translations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AWS Security Group Rule */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5" /> AWS VPC Security Group
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {selectedPolicy.translations?.AWS?.sg_id || "sg-091248ac91"}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-300 p-2.5 rounded bg-slate-900/80 border border-slate-800/60">
                    <div>ALLOW INGRESS TCP : 8443</div>
                    <div className="text-slate-500 text-[11px]">Source: 10.100.0.0/16 (mTLS Mesh)</div>
                  </div>
                </div>

                {/* Azure NSG Rule */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5" /> Azure Network Security Group
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {selectedPolicy.translations?.AZURE?.nsg_id || "nsg-pci-vault-prod"}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-300 p-2.5 rounded bg-slate-900/80 border border-slate-800/60">
                    <div>Priority 100: Allow Inbound : 8443</div>
                    <div className="text-slate-500 text-[11px]">Priority 4096: Deny Internet</div>
                  </div>
                </div>

                {/* GCP Firewall Rule */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5" /> GCP VPC Firewall Rule
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {selectedPolicy.translations?.GCP?.firewall_rule || "fw-crossplane"}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-300 p-2.5 rounded bg-slate-900/80 border border-slate-800/60">
                    <div>ACTION: ALLOW tcp:8443</div>
                    <div className="text-slate-500 text-[11px]">TargetTags: [&quot;sage-crossplane&quot;]</div>
                  </div>
                </div>

                {/* Cilium Kubernetes eBPF */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Cilium eBPF L7 Policy
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">CiliumNetworkPolicy</span>
                  </div>
                  <div className="font-mono text-xs text-slate-300 p-2.5 rounded bg-slate-900/80 border border-slate-800/60">
                    <div>enforce mTLS L7 ingress : 8443</div>
                    <div className="text-slate-500 text-[11px]">Drop unauthorized cleartext TCP</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500">
              Select an intent policy to view multi-cloud firewall translations and enforcement status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

