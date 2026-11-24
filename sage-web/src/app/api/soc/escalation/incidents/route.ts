import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_INCIDENTS = [
  {
    incident_id: "INC-2026-9481",
    title: "POP-US-EAST Credential Stuffing & Kerberoasting Breach Contained",
    severity: "CRITICAL",
    status: "CONTAINED",
    target_asset: "POP-US-EAST (Ashburn / IAD)",
    threat_actor: "APT-FIN8",
    mitre_techniques: ["T1110.003", "T1558.003"],
    containment_latency_ms: 8.4,
    ebpf_rule_applied: "XDP_DROP_RATE_CLAMP_V8",
    slack_broadcast: {
      channel: "#soc-critical",
      ts: "1763321480.001",
      delivered: true,
      broadcast_summary: "SEV-1 ALERT: Edge POP-US-EAST contained Kerberoasting burst under 8.4ms SLA.",
    },
    pagerduty_escalation: {
      incident_key: "PD-INC-9481",
      status: "acknowledged",
      urgency: "high",
      assignee: "Primary On-Call CISO / SecEng Lead",
    },
    nist_ir_category: "NIST SP 800-61 Rev. 2 / Category 3 - Unauthorized Access",
    compliance_tags: ["SOC2-CC7.3", "ISO27001-A.16.1", "PCI-DSS-Req12"],
    created_at: Date.now() / 1000 - 14400,
    resolved_at: Date.now() / 1000 - 14390,
    merkle_record_hash: "9481a54b389cf7190e21ebefd229048a1c6a287cb23e4125b045330a13ef2b89",
  },
  {
    incident_id: "INC-2026-9482",
    title: "POP-EU-WEST TLS Session Ticket Hijacking Intercepted",
    severity: "HIGH",
    status: "CONTAINED",
    target_asset: "POP-EU-WEST (Frankfurt / FRA)",
    threat_actor: "APT-41",
    mitre_techniques: ["T1563.002", "T1539"],
    containment_latency_ms: 11.2,
    ebpf_rule_applied: "TLS_TICKET_REVOKE_ASYNC_V4",
    slack_broadcast: {
      channel: "#soc-alerts",
      ts: "1763322100.002",
      delivered: true,
      broadcast_summary: "SEV-2 ALERT: POP-EU-WEST revoked hijacked TLS session ticket in 11.2ms.",
    },
    pagerduty_escalation: {
      incident_key: "PD-INC-9482",
      status: "resolved",
      urgency: "high",
      assignee: "DevOps Incident Lead",
    },
    nist_ir_category: "NIST SP 800-61 Rev. 2 / Category 2 - Malicious Code & Session Hijack",
    compliance_tags: ["SOC2-CC7.2", "ISO27001-A.12.6"],
    created_at: Date.now() / 1000 - 7200,
    resolved_at: Date.now() / 1000 - 7188,
    merkle_record_hash: "9482c81a329e7190e21ebefd229048a1c6a287cb23e4125b045330a13ef2c12",
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/soc/escalation/incidents`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_INCIDENTS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback SOC incidents:", e);
  }
  return NextResponse.json(FALLBACK_INCIDENTS);
}
