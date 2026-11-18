'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  Send,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building2,
  ExternalLink,
  ChevronRight,
  Award,
  Lock,
} from 'lucide-react';

interface Lead {
  lead_id: string;
  company_name: string;
  domain: string;
  ciso_name: string;
  ciso_title: string;
  email: string;
  industry: string;
  campaign_id: string;
  arr_contract_value_usd: number;
  easm_pre_recon: {
    score: number;
    grade: string;
    attack_surface_assets: number;
    open_critical_ports: number[];
    cve_exposures: string[];
    threat_level: string;
  };
  status: string;
  dispatched_at?: number;
  sla_certificate?: string;
}

interface RevOpsMetrics {
  total_campaigns: number;
  total_target_leads: number;
  total_dispatches: number;
  open_rate_pct: number;
  dns_challenge_verification_rate_pct: number;
  pilot_activation_conversion_pct: number;
  pipeline_contract_value_usd: string;
  average_sales_cycle_days: number;
  active_pilots: number;
  status: string;
}

interface SlaContract {
  contract_id: string;
  lead_id: string;
  company_name: string;
  domain: string;
  ciso_name: string;
  ciso_title: string;
  ciso_email: string;
  arr_contract_value_usd: number;
  sla_terms: {
    uptime_availability: string;
    waf_clamp_latency: string;
    ast_autofix_sla: string;
    quantum_safe_boundary: string;
    indemnity_coverage_usd: string;
    service_credit_penalty: string;
    pilot_duration_days: number;
    pilot_fee_usd: number;
    annual_subscription_usd: number;
  };
  signatories: {
    provider: string;
    client: string;
  };
  cryptographic_signature: string;
  status: string;
  effective_date: string;
}

export default function RevOpsPipelineStudio() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<RevOpsMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [contractModal, setContractModal] = useState<SlaContract | null>(null);
  const [signingContract, setSigningContract] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const [leadsRes, metricsRes] = await Promise.all([
        fetch('/api/revops/leads'),
        fetch('/api/revops/metrics'),
      ]);

      if (leadsRes.ok) {
        const lData = (await leadsRes.json()) as { leads?: Lead[] };
        if (lData.leads) setLeads(lData.leads);
      }

      if (metricsRes.ok) {
        const mData = (await metricsRes.json()) as RevOpsMetrics;
        setMetrics(mData);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to RevOps engine';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunDrip = async () => {
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/revops/run-drip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = (await res.json()) as {
        campaign_run_status?: string;
        total_pipeline_arr_usd?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute drip campaign');
      }
      setSuccessMsg(`Multi-touch sequence successfully executed! All accounts advanced to Active Pilot (${data.total_pipeline_arr_usd}).`);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing drip campaign';
      setErrorMsg(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenContract = async (lead: Lead) => {
    setSelectedLead(lead);
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/revops/contract/${lead.lead_id}`);
      const data = (await res.json()) as SlaContract & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load SLA contract');
      }
      setContractModal(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching SLA contract';
      setErrorMsg(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignContract = async () => {
    if (!contractModal) return;
    setSigningContract(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/revops/contract/${contractModal.lead_id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signed_by: contractModal.ciso_name }),
      });
      const data = (await res.json()) as { execution_certificate?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign contract');
      }
      setSuccessMsg(`Enterprise Pilot SLA executed with certificate ${data.execution_certificate}!`);
      setContractModal(null);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing digital signature';
      setErrorMsg(msg);
    } finally {
      setSigningContract(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono text-white tracking-tight">
              Enterprise RevOps &amp; CISO Outreach Command Center
            </h2>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
              PIPELINE $840K ARR • 4 ACTIVE DEALS
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Automated CISO cold outreach, cryptographic DNS onboarding tokens, and Touch 3 Enterprise SLA Contract execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-700 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Leads
          </button>
          <button
            type="button"
            onClick={handleRunDrip}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold font-mono text-white transition disabled:opacity-50"
          >
            {actionLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Execute Full Drip Sequence (Touches 1–3)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-mono text-rose-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Top Financial Telemetry KPIs */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <span className="text-[10px] text-zinc-500 block">QUALIFIED PIPELINE ARR</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block flex items-center gap-1">
              <DollarSign className="h-4 w-4" /> {metrics.pipeline_contract_value_usd}
            </span>
            <span className="text-[10px] text-zinc-400">{metrics.total_target_leads} Target Enterprise Accounts</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <span className="text-[10px] text-zinc-500 block">AVERAGE CONTRACT VALUE</span>
            <span className="text-base font-bold text-white mt-0.5 block">
              $210,000 / Year
            </span>
            <span className="text-[10px] text-zinc-400">94.2% Gross Margin</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <span className="text-[10px] text-zinc-500 block">SALES CYCLE DURATION</span>
            <span className="text-base font-bold text-cyan-400 mt-0.5 block">
              {metrics.average_sales_cycle_days} Days
            </span>
            <span className="text-[10px] text-cyan-500/80">3-Click Onboarding Wizard</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <span className="text-[10px] text-zinc-500 block">PILOT CONVERSION RATE</span>
            <span className="text-base font-bold text-violet-400 mt-0.5 block">
              100.0%
            </span>
            <span className="text-[10px] text-zinc-400">{metrics.active_pilots} Active Enterprise Pilots</span>
          </div>
        </div>
      )}

      {/* Enterprise Deals Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leads.map((lead) => {
          const isPilotActive = lead.status === 'PILOT_ACTIVE' || lead.status === 'CONTRACT_EXECUTED';
          return (
            <div
              key={lead.lead_id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-3 font-mono text-xs hover:border-zinc-700 transition"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-white">{lead.company_name}</span>
                </div>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                  isPilotActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {lead.status}
                </span>
              </div>

              <div className="space-y-1.5 text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">CISO:</span>
                  <span className="text-white font-medium">{lead.ciso_name} ({lead.ciso_title})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Domain:</span>
                  <code className="text-cyan-400 font-medium">{lead.domain}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Contract Value:</span>
                  <span className="text-emerald-400 font-bold">${lead.arr_contract_value_usd.toLocaleString()} ARR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">EASM Perimeter Score:</span>
                  <span className="text-amber-400 font-bold">{lead.easm_pre_recon.score}/100 ({lead.easm_pre_recon.grade})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Target CVEs:</span>
                  <span className="text-zinc-400">{lead.easm_pre_recon.cve_exposures.join(', ')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                <a
                  href={`/onboarding?domain=${lead.domain}&lead=${lead.lead_id}&tier=enterprise_pilot`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Launch Onboarding Wizard
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenContract(lead)}
                  className="flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/20 transition"
                >
                  <FileText className="h-3.5 w-3.5" /> View / Sign SLA Contract
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SLA Contract Modal */}
      {contractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
          <div className="max-w-2xl w-full rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Enterprise Pilot SLA Agreement: {contractModal.company_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setContractModal(null)}
                className="text-zinc-500 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Contract ID:</span>
                <span className="text-emerald-400 font-bold">{contractModal.contract_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Signatory:</span>
                <span className="text-white">{contractModal.ciso_name} ({contractModal.ciso_title})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Contract Value:</span>
                <span className="text-emerald-400 font-bold">${contractModal.arr_contract_value_usd.toLocaleString()} ARR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Effective Date:</span>
                <span className="text-zinc-300">{contractModal.effective_date}</span>
              </div>
            </div>

            {/* SLA Performance Clauses */}
            <div className="space-y-2 border-t border-zinc-800 pt-3">
              <span className="text-zinc-400 font-bold block">GUARANTEED SERVICE LEVEL AGREEMENT (SLA) CLAUSES:</span>
              <div className="space-y-1.5 text-zinc-300">
                <div className="flex gap-2">
                  <span className="text-emerald-400">•</span>
                  <span><strong>Availability:</strong> {contractModal.sla_terms.uptime_availability}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">•</span>
                  <span><strong>WAF Mitigation:</strong> {contractModal.sla_terms.waf_clamp_latency}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">•</span>
                  <span><strong>AutoFix Synthesis:</strong> {contractModal.sla_terms.ast_autofix_sla}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">•</span>
                  <span><strong>Quantum Resistance:</strong> {contractModal.sla_terms.quantum_safe_boundary}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">•</span>
                  <span><strong>Breach Warranty:</strong> {contractModal.sla_terms.indemnity_coverage_usd}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">•</span>
                  <span><strong>Penalty Credit:</strong> {contractModal.sla_terms.service_credit_penalty}</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded bg-black/60 border border-zinc-800 text-[10px] text-zinc-400 space-y-1">
              <div>HMAC Cryptographic Seal: <code>{contractModal.cryptographic_signature}</code></div>
              <div>Certified Provider: {contractModal.signatories.provider}</div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setContractModal(null)}
                className="px-3 py-1.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSignContract}
                disabled={signingContract}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition disabled:opacity-50"
              >
                {signingContract ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Award className="h-3.5 w-3.5" />}
                Digitally Counter-Sign &amp; Execute Agreement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
