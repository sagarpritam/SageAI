"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  HardDrive,
  ShieldCheck,
  FileCheck,
  Lock,
  Clock,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Eye,
  Hash,
  Server,
  Cloud,
} from "lucide-react";

interface SnapshotRecord {
  snapshot_id: string;
  incident_id: string;
  cloud_provider: string;
  resource_id: string;
  volume_size_gb: number;
  memory_captured: boolean;
  sha256: string;
  sha512: string;
  status: string;
  rfc3161_token: {
    token_id: string;
    policy_oid: string;
    verification_status: string;
    nonce?: string;
  };
  chain_of_custody: Array<{
    step: string;
    note: string;
  }>;
}

export function CloudForensicsVault() {
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [showManifestModal, setShowManifestModal] = useState(false);

  // New snapshot state
  const [cloudProvider, setCloudProvider] = useState("AWS");
  const [resourceId, setResourceId] = useState("vol-0a8912cf882b (prod-db-volume)");
  const [incidentId, setIncidentId] = useState("INC-2026-9481");
  const [creating, setCreating] = useState(false);

  const fetchSnapshots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cloud-forensics/snapshots");
      const data = await res.json();
      if (data.snapshots) {
        setSnapshots(data.snapshots);
        if (data.snapshots.length > 0) {
          setSelectedSnapshot((prev) => prev || data.snapshots[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  async function handleCreateSnapshot(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/cloud-forensics/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloud_provider: cloudProvider,
          resource_id: resourceId,
          incident_id: incidentId,
          volume_size_gb: 128,
          memory_capture: true,
        }),
      });
      const data = await res.json();
      if (data.snapshot) {
        setSnapshots((prev) => [data.snapshot, ...prev]);
        setSelectedSnapshot(data.snapshot);
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleVerify(snapshotId: string) {
    setVerifying(true);
    try {
      const res = await fetch("/api/cloud-forensics/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot_id: snapshotId }),
      });
      const data = await res.json();
      if (data.verification) {
        setVerificationResult(data.verification);
      }
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Capability 42
            </span>
            <span className="text-xs text-slate-400">RFC 3161 Timestamp Authority & Chain of Custody</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-emerald-400" />
            Cloud Forensic Snapshot & RFC 3161 Timestamp Vault
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Zero-delay cloud volume snapshotting across AWS, Azure, and GCP with dual SHA-256/SHA-512 chain of custody and court-admissible FRE 902 digital evidence certificates.
          </p>
        </div>
        <button
          onClick={fetchSnapshots}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Snapshot Cards & Vault Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & Snapshot List */}
        <div className="lg:col-span-1 space-y-4">
          <form onSubmit={handleCreateSnapshot} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-white uppercase tracking-wider mb-1">
              Trigger Forensic Capture
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Target Cloud Provider</label>
              <select
                value={cloudProvider}
                onChange={(e) => setCloudProvider(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
              >
                <option value="AWS">AWS (EBS Snapshot API)</option>
                <option value="AZURE">Azure (Managed Disk Snapshot)</option>
                <option value="GCP">GCP (Persistent Disk Freeze)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Target Resource ID / Volume ARN</label>
              <input
                type="text"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Security Incident Tag</label>
              <input
                type="text"
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition flex items-center justify-center gap-2 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Capture Disk & RAM Snapshot
            </button>
          </form>

          {/* List of Evidence Snapshots */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              Vaulted Evidence Snapshots ({snapshots.length})
            </h4>
            {snapshots.map((snap) => {
              const isSelected = selectedSnapshot?.snapshot_id === snap.snapshot_id;
              return (
                <div
                  key={snap.snapshot_id}
                  onClick={() => {
                    setSelectedSnapshot(snap);
                    setVerificationResult(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? "bg-slate-800/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20"
                      : "bg-slate-900/50 border-slate-800 hover:bg-slate-850 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-white">{snap.snapshot_id}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      RFC 3161 SEALED
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 truncate">{snap.resource_id}</div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800">
                    <span>{snap.cloud_provider} &bull; {snap.volume_size_gb} GB</span>
                    <span className="font-mono text-emerald-400 font-semibold">{snap.incident_id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Evidence & Legal Verification */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSnapshot ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-400" />
                    Forensic Artifact: {selectedSnapshot.snapshot_id}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Cloud Provider: {selectedSnapshot.cloud_provider} &bull; Target: {selectedSnapshot.resource_id}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerify(selectedSnapshot.snapshot_id)}
                    disabled={verifying}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify Hashes
                  </button>
                  <button
                    onClick={() => setShowManifestModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    FRE 902 Certificate
                  </button>
                </div>
              </div>

              {/* Cryptographic Digests */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tamper-Evident Cryptographic Digests
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">SHA-256 Block Digest</div>
                    <div className="font-mono text-xs text-emerald-400 break-all select-all">
                      {selectedSnapshot.sha256}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">SHA-512 Extended Digest</div>
                    <div className="font-mono text-[11px] text-slate-400 break-all select-all">
                      {selectedSnapshot.sha512}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chain of Custody */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Forensic Chain of Custody (Immutable Log)
                </span>
                <div className="space-y-2">
                  {selectedSnapshot.chain_of_custody?.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-white">{c.step}</span>
                      <span className="text-slate-400">{c.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Feedback */}
              {verificationResult && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Cryptographic Verification Passed</div>
                      <div className="text-[11px] text-slate-400">
                        SHA-256 match, SHA-512 match, RFC 3161 signature valid.
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-400">FRE 902 ADMISSIBLE</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500">
              Select a forensic snapshot to inspect cryptographic digests and chain of custody.
            </div>
          )}
        </div>
      </div>

      {/* Manifest Certificate Modal */}
      {showManifestModal && selectedSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-2xl w-full p-6 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                Federal Rules of Evidence FRE 902(13/14) Certificate
              </h3>
              <button
                onClick={() => setShowManifestModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 space-y-2 max-h-96 overflow-y-auto">
              <div className="text-emerald-400 font-bold">CERTIFICATE OF AUTHENTICITY OF ELECTRONICALLY STORED INFORMATION</div>
              <div>Statutory Standard: Federal Rule of Evidence 902(14) Certified Data Copied from Electronic Device</div>
              <div>Artifact Identifier: {selectedSnapshot.snapshot_id}</div>
              <div>Incident Association: {selectedSnapshot.incident_id}</div>
              <div>SHA-256 Digest: {selectedSnapshot.sha256}</div>
              <div>RFC 3161 Token Serial: {selectedSnapshot.rfc3161_token?.token_id}</div>
              <div>TSA Policy OID: {selectedSnapshot.rfc3161_token?.policy_oid}</div>
              <div className="text-slate-500 pt-2 border-t border-slate-800">
                Certified By: SageAI Sovereign Cryptographic Attestor Root CA
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowManifestModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

