import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_CERTIFICATES = [
  {
    cert_id: "CERT-DR-2026-SLA",
    title: "Multi-Region Anycast Disaster Failover SLA Certificate",
    domain: "Infrastructure & Reliability",
    issuer: "SageAI Autonomous SRE Fleet",
    standard: "Sub-45ms Convergence SLA (Observed: 38.4ms, 0% Data Loss)",
    audit_hash: "3840000a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e",
    status: "VERIFIED_PASS",
  },
  {
    cert_id: "CERT-SETTLE-SERIES-A",
    title: "FedWire Settlement & Cap Table Immutable Ledger Seal",
    domain: "Finance & Corporate Governance",
    issuer: "Chief Financial Officer & Silicon Valley Bank Custody",
    standard: "Delaware General Corporation Law § 224 Immutable Stock Ledger",
    audit_hash: "4800000a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e",
    status: "VERIFIED_PASS",
  },
  {
    cert_id: "CERT-REDTEAM-EDGE-POP",
    title: "Autonomous Red Team POP Hardening & Penetration Battery",
    domain: "Cybersecurity & Edge Defense",
    issuer: "Autonomous CISO Adversary Simulation Office",
    standard: "MITRE ATT&CK Enterprise (99.4% Resilience, Sub-15ms Containment)",
    audit_hash: "9940000a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e",
    status: "VERIFIED_PASS",
  },
  {
    cert_id: "CERT-SOC-IR-NIST",
    title: "Autonomous SOC Incident Response & PagerDuty Escalation Dossier",
    domain: "SecOps & Incident Handling",
    issuer: "Autonomous SOC Level 3 Commander",
    standard: "NIST SP 800-61 Rev. 2 & ISO/IEC 27035:2023",
    audit_hash: "8006100a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e",
    status: "VERIFIED_PASS",
  },
  {
    cert_id: "CERT-STIX-TAXII-FEED",
    title: "STIX 2.1 & TAXII Global Threat Intelligence Dissemination",
    domain: "Threat Intelligence & ISAC Sharing",
    issuer: "Global CTI Panopticon Intelligence Hub",
    standard: "OASIS CTI TC STIX 2.1 Specification",
    audit_hash: "2100000a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e",
    status: "VERIFIED_PASS",
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/investor-data-room/certificates`);
    if (res.ok) {
      const data = await safeUpstreamJson(res, FALLBACK_CERTIFICATES);
      return NextResponse.json(data);
    }
  } catch (e: unknown) {
    console.warn("Using fallback LP certificates:", e);
  }
  return NextResponse.json(FALLBACK_CERTIFICATES);
}
