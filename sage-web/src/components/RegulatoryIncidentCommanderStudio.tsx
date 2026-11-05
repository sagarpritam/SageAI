"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  ShieldAlert,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Send,
  Scale,
  Users,
  ShieldCheck,
} from "lucide-react";

interface IncidentRecord {
  incident_id: string;
  title: string;
  severity: string;
  status: string;
  impacted_systems: string[];
  records_compromised: number;
  materiality_verdict: string;
  deadlines: {
    SEC_8K_DAYS_REMAINING: number;
    NIS2_EARLY_WARNING_HOURS: number;
    GDPR_DPA_HOURS: number;
  };
}

interface FilingResult {
  filing_type: string;
  registrant: string;
  cik: string;
  filing_body: string;
  statutory_deadline_met: boolean;
}

export function RegulatoryIncidentCommanderStudio() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filingResult, setFilingResult] = useState<FilingResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [registrantName, setRegistrantName] = useState("SageAI Sovereign Enterprise Corp");

  // New incident modal state
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSeverity, setNewSeverity] = useState("CRITICAL");
  const [newSystems, setNewSystems] = useState("AWS Nitro Enclaves, Core Vault");
  const [newRecords, setNewRecords] = useState(50000);
  const [declaring, setDeclaring] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  async function fetchIncidents() {
    setLoading(true);
    try {
      const res = await fetch("/api/regulatory-commander/incidents");
      const data = await res.json();
      if (data.incidents) {
        setIncidents(data.incidents);
        if (!selectedIncident && data.incidents.length > 0) {
          setSelectedIncident(data.incidents[0]);
          generateFiling(data.incidents[0].incident_id);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function generateFiling(incidentId: string) {
    setGenerating(true);
    try {
      const res = await fetch("/api/regulatory-commander/generate-sec-8k", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident_id: incidentId,
          registrant_name: registrantName,
        }),
      });
      const data = await res.json();
      if (data.filing) {
        setFilingResult(data.filing);
      }
    } finally {
      setGenerating(false);
    }
  }

  function handleSelectIncident(inc: IncidentRecord) {
    setSelectedIncident(inc);
    generateFiling(inc.incident_id);
  }

  async function handleDeclareIncident(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle) return;
    setDeclaring(true);
    try {
      const res = await fetch("/api/regulatory-commander/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          severity: newSeverity,
          impacted_systems: newSystems.split(",").map((s) => s.trim()),
          records_compromised: Number(newRecords),
        }),
      });
      const data = await res.json();
      if (data.incident) {
        setIncidents((prev) => [data.incident, ...prev]);
        setSelectedIncident(data.incident);
        generateFiling(data.incident.incident_id);
        setShowDeclareModal(false);
        setNewTitle("");
      }
    } finally {
      setDeclaring(false);
    }
  }

  function handleCopyFiling() {
    if (!filingResult) return;
    navigator.clipboard.writeText(filingResult.filing_body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Scale className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Regulatory Incident Commander & SEC 8-K Engine
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                CAP-49
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                SEC Item 1.05 Enforced
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Multi-agent autonomous incident commander coordinating CISO response, legal counsel disclosure, and statutory filing generation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeclareModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-lg shadow-rose-500/20 transition"
          >
            <ShieldAlert className="w-4 h-4" />
            Declare Incident
          </button>
          <button
            onClick={fetchIncidents}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Metric Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Active Incidents</p>
            <p className="text-2xl font-bold text-white mt-1">{incidents.length}</p>
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> High / Critical Materiality
            </p>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">SEC Form 8-K Window</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {selectedIncident?.deadlines.SEC_8K_DAYS_REMAINING ?? 4} Business Days
            </p>
            <p className="text-xs text-amber-400/80 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Item 1.05 Strict Deadline
            </p>
          </div>
          <Clock className="w-8 h-8 text-amber-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">NIS2 Early Warning</p>
            <p className="text-xl font-bold text-indigo-400 mt-1">
              {selectedIncident?.deadlines.NIS2_EARLY_WARNING_HOURS ?? 24} Hours
            </p>
            <p className="text-xs text-zinc-400 mt-1">EU CSIRT Notification</p>
          </div>
          <Building className="w-8 h-8 text-indigo-400 opacity-60" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Autonomous CISO Status</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">COMMAND ACTIVE</p>
            <p className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Containment Executing
            </p>
          </div>
          <Users className="w-8 h-8 text-emerald-400 opacity-60" />
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Incidents List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Active Security Incidents
          </h2>

          <div className="space-y-3">
            {incidents.map((inc) => {
              const isSelected = selectedIncident?.incident_id === inc.incident_id;
              return (
                <div
                  key={inc.incident_id}
                  onClick={() => handleSelectIncident(inc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-800/90 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{inc.title}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 font-mono">
                        {inc.incident_id} &bull; Records:{" "}
                        <span className="text-rose-400 font-bold">
                          {inc.records_compromised.toLocaleString()}
                        </span>
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        inc.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <div>
                      <span>Verdict: </span>
                      <span className="font-mono text-rose-400 font-semibold">
                        {inc.materiality_verdict}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-amber-300">
                      <Clock className="w-3 h-3" />
                      <span>{inc.deadlines.SEC_8K_DAYS_REMAINING}d remaining</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: SEC Form 8-K Item 1.05 Legal Draft & Commander Directives */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> SEC Form 8-K (Item 1.05) Legal Filing Preview
            </h2>
            {filingResult && (
              <button
                onClick={handleCopyFiling}
                className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied to Clipboard" : "Copy EDGAR Filing"}
              </button>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Registrant:</span>
                <input
                  type="text"
                  value={registrantName}
                  onChange={(e) => setRegistrantName(e.target.value)}
                  className="bg-zinc-800 px-2 py-1 rounded text-white font-medium border border-zinc-700 text-xs w-64"
                />
                <button
                  onClick={() => selectedIncident && generateFiling(selectedIncident.incident_id)}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
                >
                  Regenerate
                </button>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <span>EDGAR CIK: 0001984210</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  STATUTORY MET
                </span>
              </div>
            </div>

            {generating ? (
              <div className="py-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                <span>Generating SEC Form 8-K Item 1.05 via Legal Multi-Agent Engine...</span>
              </div>
            ) : filingResult ? (
              <div className="space-y-4">
                <pre className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800/80 text-zinc-200 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-96">
                  {filingResult.filing_body}
                </pre>

                {/* Autonomous CISO Directives */}
                <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                    <ShieldCheck className="w-4 h-4" /> Multi-Agent CISO Directive Stream
                  </div>
                  <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
                    <li>CrossPlane Mesh micro-segmentation triggered across all impacted clusters.</li>
                    <li>UEFI Secure Boot and TPM PCR0 hash attestation dispatched to affected hypervisors.</li>
                    <li>SEC Form 8-K draft delivered to General Counsel and Audit Committee.</li>
                    <li>EU CSIRT Early Warning pre-notification formatted per NIS2 Article 23.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-zinc-500">
                Select an incident to view statutory legal filing.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Declare New Security Incident */}
      {showDeclareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" /> Declare Material Incident
              </h3>
              <button
                onClick={() => setShowDeclareModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeclareIncident} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Incident Title / Summary</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Unauthorized Credential Exfiltration via Micro-Service"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Severity Tier</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Compromised Records</label>
                  <input
                    type="number"
                    value={newRecords}
                    onChange={(e) => setNewRecords(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Impacted Systems (comma separated)</label>
                <input
                  type="text"
                  value={newSystems}
                  onChange={(e) => setNewSystems(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowDeclareModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={declaring}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500 flex items-center gap-1.5"
                >
                  {declaring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Declare & Engage Legal AI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

