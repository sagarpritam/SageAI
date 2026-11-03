"use client";

import { useState, useEffect } from "react";
import { AlertCircle, ShieldAlert, CheckCircle, FileCode, Upload, RefreshCw, Lock, Terminal, Activity, GitBranch, ExternalLink } from "lucide-react";
import axios from "axios";

interface IncidentAction {
  action: string;
  requires_approval: boolean;
}

interface ExecutedAction {
  action: string;
  status: string;
  executed_at: string;
  executed_by: string;
  details: string;
}

interface Incident {
  incident_id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "INVESTIGATING" | "CONTAINED" | "RESOLVED";
  source: string;
  created_at: string;
  suggested_actions: IncidentAction[];
  executed_actions: ExecutedAction[];
}

interface ReverseEngResult {
  filename: string;
  size: number;
  sections: Array<{ name: string; entropy: number; is_executable: boolean; is_packed_or_encrypted: boolean }>;
  imported_apis: Record<string, string[]>;
  detected_capabilities: string[];
  deobfuscated_intel: {
    recovered_payloads: Array<{ type: string; encoded: string; decoded: string }>;
    xor_keys_detected: string[];
  };
  disassembly_preview: Array<{ offset: string; byte: string; disassembly: string }>;
  re_summary: string;
}

export function IncidentCenter() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [remediating, setRemediating] = useState(false);
  const [patchResult, setPatchResult] = useState<any | null>(null);

  // Reverse Engineering State
  const [reSampleText, setReSampleText] = useState("powershell.exe -ExecutionPolicy Bypass -enc SQBFAFgA\nVirtualAllocEx WriteProcessMemory CreateRemoteThread\nhttp://evil-c2.internal/beacon");
  const [reLoading, setReLoading] = useState(false);
  const [reResult, setReResult] = useState<ReverseEngResult | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/incidents");
      const list = res.data?.incidents || [];
      setIncidents(list);
      if (list.length > 0 && !selectedIncident) {
        setSelectedIncident(list[0]);
      }
    } catch {
      // Mock fallback
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleExecuteAction = async (actionName: string) => {
    if (!selectedIncident || actionLoading) return;
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("/api/incidents/action", {
        incident_id: selectedIncident.incident_id,
        action: actionName,
      });

      if (res.data?.status === "SUCCESS") {
        setMessage(`Action ${actionName} executed successfully.`);
        fetchIncidents();
      } else {
        setMessage(res.data?.message || "Action completed.");
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      setMessage(`Authorization blocked: ${detail}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemediate = async (incidentId: string) => {
    setRemediating(true);
    setPatchResult(null);
    setMessage(null);
    try {
      const res = await axios.post(`/api/incidents/${incidentId}/remediate`, {
        repository: "demo/security-service",
      });
      if (res.data?.status === "success") {
        setPatchResult(res.data);
        setMessage(`SagePatch proposed: ${res.data.patch_id}. Queued for human review.`);
        fetchIncidents();
      } else {
        setMessage(res.data?.message || "Remediation submitted.");
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      setMessage(`Remediation error: ${detail}`);
    } finally {
      setRemediating(false);
    }
  };

  const handleRunReverseEngineering = async () => {
    setReLoading(true);
    setReResult(null);
    try {
      // Encode sample to base64
      const b64 = btoa(unescape(encodeURIComponent(reSampleText)));
      const res = await axios.post("/api/incidents/reverse-engineer", {
        filename: "suspicious_payload.bin",
        base64_data: b64,
      });
      if (res.data?.analysis) {
        setReResult(res.data.analysis);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setReLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-red-950/40 via-zinc-900/60 to-black border border-red-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">SOAR Incident Response & Forensics</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Prioritized security incidents with automated virtual patching and role-guarded containment actions.
          </p>
        </div>
        <button
          onClick={fetchIncidents}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-zinc-500 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Grid: Incidents & Playbooks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Incident List */}
        <div className="lg:col-span-1 p-5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Active Incidents ({incidents.length})</h3>
            <span className="text-[10px] font-mono text-zinc-500">Live Queue</span>
          </div>

          {incidents.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-zinc-800 rounded-lg text-xs text-zinc-500">
              No active incidents reported.
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {incidents.map((inc) => {
                const isSelected = selectedIncident?.incident_id === inc.incident_id;
                return (
                  <div
                    key={inc.incident_id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      isSelected
                        ? "bg-red-950/30 border-red-500/80 text-white"
                        : "bg-black/50 border-zinc-900 text-zinc-300 hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-zinc-400">{inc.incident_id}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-950/60 text-red-400 border border-red-900/50">
                        {inc.severity}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold truncate">{inc.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2">
                      <span>{inc.source}</span>
                      <span className="capitalize">{inc.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Center/Right: Selected Incident Details & Playbooks */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-4">
          {selectedIncident ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-xs font-mono text-zinc-500">{selectedIncident.incident_id}</span>
                  <h3 className="text-base font-bold text-white">{selectedIncident.title}</h3>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-mono uppercase bg-red-950/50 text-red-300 border border-red-800/60">
                  {selectedIncident.status}
                </span>
              </div>

              {/* Playbook Actions */}
              <div className="p-4 rounded-lg bg-black/60 border border-zinc-900 space-y-3">
                <h4 className="text-xs font-semibold text-zinc-300">Playbook Containment Actions:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedIncident.suggested_actions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => handleExecuteAction(act.action)}
                      disabled={actionLoading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                        act.requires_approval
                          ? "bg-red-900/30 text-red-300 border border-red-800/60 hover:bg-red-900/50"
                          : "bg-emerald-900/30 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/50"
                      }`}
                    >
                      {act.requires_approval ? <Lock className="w-3 h-3 text-red-400" /> : <Activity className="w-3 h-3 text-emerald-400" />}
                      <span>{act.action}</span>
                      {act.requires_approval && <span className="text-[9px] text-zinc-400">(Approval Req)</span>}
                    </button>
                  ))}
                  <button
                    onClick={() => handleRemediate(selectedIncident.incident_id)}
                    disabled={remediating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-blue-900/30 text-blue-300 border border-blue-800/60 hover:bg-blue-900/50 transition"
                  >
                    <FileCode className="w-3 h-3 text-blue-400" />
                    <span>{remediating ? "Synthesizing Patch..." : "Draft SagePatch Code Fix"}</span>
                  </button>
                </div>
              </div>

              {/* Proposed Patch Preview */}
              {patchResult && (
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">SagePatch Proposal #{patchResult.patch_id?.substring(0, 8)}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-500/20">
                      AST Validated
                    </span>
                  </div>
                  <pre className="p-3 bg-black/80 border border-zinc-800 rounded-lg text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48">
                    {patchResult.diff}
                  </pre>
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>Branch: {patchResult.patch_branch}</span>
                    <span className="text-blue-400 font-bold">Review in Auto-Fix Tab</span>
                  </div>
                </div>
              )}

              {/* Executed Audit Log */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-300">Audit Trail of Containment Actions:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedIncident.executed_actions.map((ex, i) => (
                    <div key={i} className="p-2.5 rounded bg-black/40 border border-zinc-900 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono text-zinc-200">{ex.action}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        by {ex.executed_by} at {new Date(ex.executed_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-500 text-xs">Select an incident to view response actions</div>
          )}
        </div>
      </div>

      {/* Reverse Engineering Sandbox Section */}
      <div className="p-5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Reverse Engineering & Disassembly Sandbox</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">Isolated In-Memory Analysis</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 block">Sample Payload / Script / Base64 Data</label>
            <textarea
              rows={5}
              value={reSampleText}
              onChange={(e) => setReSampleText(e.target.value)}
              className="w-full bg-black/60 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              onClick={handleRunReverseEngineering}
              disabled={reLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs transition"
            >
              {reLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Disassemble & Analyze
            </button>
          </div>

          {/* Analysis View */}
          <div className="p-4 rounded-lg bg-black/80 border border-zinc-900 text-xs font-mono space-y-3">
            {reResult ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-emerald-400 font-bold">{reResult.filename}</span>
                  <span className="text-zinc-500">{reResult.size} bytes</span>
                </div>

                {/* Capabilities */}
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Detected Capabilities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {reResult.detected_capabilities.map((cap, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-red-950/50 text-red-300 border border-red-900/50">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Disassembly preview */}
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Disassembly Preview:</span>
                  <div className="mt-1 space-y-0.5 max-h-24 overflow-y-auto text-[11px] text-zinc-300">
                    {reResult.disassembly_preview.map((d, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-zinc-600">{d.offset}</span>
                        <span className="text-emerald-400">{d.disassembly}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-600 text-xs">
                Upload or paste sample code above to inspect imported APIs, entropy, and opcode disassembly.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

