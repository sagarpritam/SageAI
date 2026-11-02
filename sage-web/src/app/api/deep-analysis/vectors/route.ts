import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND}/deep-analysis/vectors`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // Fallback if backend is running separately or offline
  }

  // Fallback metadata for offline/local preview
  return NextResponse.json({
    status: "success",
    vectors: [
      {
        id: "cloud_imds_ssrf",
        name: "Cloud Metadata & IMDSv1/v2 SSRF",
        description: "Examines external fetch endpoints for AWS IMDSv1/v2 token bypass, GCP metadata, Azure instance data, and K8s tokens.",
        mitre_attack: "T1552.005",
        owasp_category: "OWASP-A10:2021-SSRF",
        cwe: "CWE-918",
        severity: "CRITICAL",
      },
      {
        id: "oauth_jwt_auth",
        name: "OAuth 2.0 Hijacking & JWT Confusion",
        description: "Probes redirect_uri path traversal, wildcard domain bypasses, 'none' algorithm acceptance, and RS256/HS256 public key confusion.",
        mitre_attack: "T1078",
        owasp_category: "OWASP-A07:2021-Auth",
        cwe: "CWE-345 / CWE-601",
        severity: "CRITICAL",
      },
      {
        id: "cache_smuggling",
        name: "HTTP Request Smuggling & Cache Poisoning",
        description: "Tests for CL.TE/TE.CL request desynchronization, unkeyed header injection (X-Forwarded-Host), and static Web Cache Deception.",
        mitre_attack: "T1190",
        owasp_category: "OWASP-A05:2021-Misconfig",
        cwe: "CWE-444 / CWE-524",
        severity: "HIGH",
      },
      {
        id: "llm_top10",
        name: "Generative AI & LLM Security (OWASP Top 10)",
        description: "Probes LLM endpoints for prompt injection overrides, initialization prompt leakage, indirect markdown data exfiltration, and unsafe output.",
        mitre_attack: "T1059",
        owasp_category: "OWASP-LLM01 / LLM06",
        cwe: "CWE-1384",
        severity: "CRITICAL",
      },
      {
        id: "concurrency_toctou",
        name: "Concurrency & TOCTOU Race Conditions",
        description: "Conducts parallel non-destructive bursts against transactional endpoints to identify missing idempotency locks and double-spend hazards.",
        mitre_attack: "T1499",
        owasp_category: "OWASP-A04:2021-InsecureDesign",
        cwe: "CWE-367",
        severity: "HIGH",
      },
    ],
  });
}
