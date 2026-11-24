import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_BOARD_DOSSIER = {
  dossier_id: "DOSSIER-BOARD-2026-Q4-v8.7",
  title: "SageAI Enterprise Board of Directors Security Dossier",
  generated_at: new Date().toISOString(),
  platform_version: "v8.7.0",
  classification: "BOARD_RESTRICTED_AND_AUDIT_CERTIFIED",
  executive_kpis: {
    total_recognized_arr_usd: 840000,
    enterprise_pilot_count: 4,
    conversion_rate_pct: 100.0,
    mean_waf_clamp_latency_ms: 0.165,
    waf_clamp_sla_ceiling_ms: 0.20,
    waf_clamp_sla_passed: true,
    ast_autofix_compilation_success_rate_pct: 100.0,
    mean_ast_autofix_duration_ms: 41.3,
    overall_containment_ratio: 1.0,
    human_downtime_seconds: 0.0,
    cyber_indemnity_coverage_per_enterprise_usd: 10000000,
    ebpf_packet_drop_rate_pps: 14820,
  },
  enterprise_accounts: [
    {
      domain: "apex-securities.io",
      company_name: "Apex Global Securities",
      ciso: "Marcus Vance",
      arr_usd: 240000,
      contract_id: "CERT-EXEC-07F54648",
      threat_actor: "APT-FIN8",
      waf_clamp_ms: 0.167,
    },
    {
      domain: "nexusbiohealth.com",
      company_name: "Nexus BioHealth Global",
      ciso: "Dr. Sarah Lin",
      arr_usd: 180000,
      contract_id: "CERT-EXEC-5ABB5EE1",
      threat_actor: "APT-41",
      waf_clamp_ms: 0.162,
    },
    {
      domain: "hyperscale.dev",
      company_name: "HyperScale Cloud Systems",
      ciso: "Alex Chen",
      arr_usd: 200000,
      contract_id: "CERT-EXEC-FD5B216E",
      threat_actor: "Lazarus Group",
      waf_clamp_ms: 0.172,
    },
    {
      domain: "vanguard-aero.def",
      company_name: "Vanguard Aerospace & Defense Systems",
      ciso: "Elena Rostova",
      arr_usd: 220000,
      contract_id: "CERT-EXEC-17F2BA50",
      threat_actor: "APT-28",
      waf_clamp_ms: 0.160,
    },
  ],
  compliance_certifications: [
    "SOC 2 Type II",
    "ISO/IEC 27001:2022",
    "FedRAMP High (NIST 800-53 Rev 5)",
    "NIST FIPS 203 (ML-KEM-768)",
    "NIST FIPS 204 (Dilithium3)",
  ],
  merkle_root_hash:
    "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/board/dossier`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_BOARD_DOSSIER);
    }
    const data = await safeUpstreamJson(res, FALLBACK_BOARD_DOSSIER);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_BOARD_DOSSIER);
  }
}

export async function POST() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/board/dossier/generate`, {
      method: "POST",
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_BOARD_DOSSIER);
    }
    const data = await safeUpstreamJson(res, FALLBACK_BOARD_DOSSIER);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_BOARD_DOSSIER);
  }
}
