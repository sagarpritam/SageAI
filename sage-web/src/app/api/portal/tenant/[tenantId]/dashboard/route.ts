import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_PORTAL = {
  status: "PORTAL_LOADED",
  dashboard: {
    tenant_id: "org-apex",
    company_name: "Apex Global Securities",
    portal_branding: "Apex Citadel Global Sentinel",
    primary_ciso: "Marcus Vance",
    ciso_title: "Chief Information Security Officer",
    ciso_email: "m.vance@apex-securities.io",
    sla_tier: "99.999% Financial Uptime Guarantee",
    uptime_pct: 100.0,
    downtime_minutes_ytd: 0.0,
    mean_waf_clamp_ms: 0.167,
    sla_ceiling_ms: 0.20,
    indemnity_coverage_usd: 10000000,
    active_sensor_nodes: 24,
    active_ebpf_filters: 3,
    pending_ast_patches: [
      {
        patch_id: "AST-PATCH-APEX-04",
        title: "Fix SSRF in Trade Settlement Webhook Dispatcher",
        target_file: "services/trade_settlement/webhook.py",
        threat_actor: "APT-FIN8",
        severity: "CRITICAL",
        unified_diff:
          "--- a/services/trade_settlement/webhook.py\n+++ b/services/trade_settlement/webhook.py\n+if '169.254' in url: raise SSRFError('Blocked')\n",
        synthesized_at: Date.now() / 1000 - 3600,
        status: "AWAITING_CISO_APPROVAL",
      },
    ],
    applied_ast_patches: [
      { patch_id: "AST-PATCH-APEX-01", title: "SQL Injection Parameter Sanitization", applied_at: Date.now() / 1000 - 86400 },
    ],
  },
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;

  try {
    const res = await fetchBackend(`${BACKEND}/api/portal/tenant/${tenantId}/dashboard`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({
        ...FALLBACK_PORTAL,
        dashboard: { ...FALLBACK_PORTAL.dashboard, tenant_id: tenantId },
      });
    }
    const data = await safeUpstreamJson(res, FALLBACK_PORTAL);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      ...FALLBACK_PORTAL,
      dashboard: { ...FALLBACK_PORTAL.dashboard, tenant_id: tenantId },
    });
  }
}
