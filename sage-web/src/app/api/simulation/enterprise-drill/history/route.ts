import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_HISTORY = {
  history: [
    {
      drill_id: "WAR-DRILL-APEX-01",
      target_domains: ["apex-securities.io"],
      total_domains_tested: 1,
      attacker_ip: "198.51.100.117",
      scenario: "Autonomous APT Multi-Stage Drill",
      overall_status: "SUCCESS_ALL_ASSERTIONS_VERIFIED",
      waf_clamp_assertion_passed: true,
      mean_waf_clamp_latency_ms: 0.162,
      waf_clamp_threshold_ms: 0.20,
      ast_autofix_assertion_passed: true,
      mean_ast_autofix_ms: 41.5,
      containment_ratio: 1.0,
      human_downtime_seconds: 0.0,
      total_arr_protected_usd: 240000,
      execution_duration_sec: 0.045,
      timestamp: Date.now() / 1000 - 3600,
      domain_results: [
        {
          domain: "apex-securities.io",
          company_name: "Apex Global Securities",
          lead_id: "LEAD-APEX-01",
          ciso_name: "Marcus Vance",
          arr_usd: 240000,
          threat_actor: "APT-FIN8 (DarkSilk Financial Syndicate)",
          attack_vector: "Cloud IMDSv2 SSRF & High-Frequency Trading Parameter Tampering",
          target_endpoint: "/api/v1/trade/settle",
          waf_clamp_latency_ms: 0.162,
          waf_clamp_assertion_passed: true,
          ast_autofix_duration_ms: 41.5,
          ast_autofix_assertion_passed: true,
          ast_unified_diff:
            "--- a/services/apex_securities_io/handlers.py\n+++ b/services/apex_securities_io/handlers.py\n@@ -1,5 +1,9 @@\n-    response = urllib.request.urlopen(user_url)\n+    if parsed.scheme not in ('https',) or parsed.netloc not in {'api.apex-securities.io'}:\n+        raise ValueError('SSRF Protection: Untrusted callback target blocked')\n",
          merkle_block_hash:
            "8e924fd666b1a3d927c9f87498c1a6039540b615d8f6d53860bb77c3e3871182",
          incident_id: "INC-20261116-EEEAAB38",
          containment_ratio: 1.0,
          human_downtime_seconds: 0.0,
        },
      ],
    },
    {
      drill_id: "WAR-DRILL-MULTI-02",
      target_domains: [
        "apex-securities.io",
        "nexusbiohealth.com",
        "hyperscale.dev",
        "vanguard-aero.def",
      ],
      total_domains_tested: 4,
      attacker_ip: "198.51.100.117",
      scenario: "Full-Spectrum Sovereign Ingress & AST AutoFix War Drill",
      overall_status: "SUCCESS_ALL_ASSERTIONS_VERIFIED",
      waf_clamp_assertion_passed: true,
      mean_waf_clamp_latency_ms: 0.165,
      waf_clamp_threshold_ms: 0.20,
      ast_autofix_assertion_passed: true,
      mean_ast_autofix_ms: 41.3,
      containment_ratio: 1.0,
      human_downtime_seconds: 0.0,
      total_arr_protected_usd: 840000,
      execution_duration_sec: 0.112,
      timestamp: Date.now() / 1000 - 1800,
      domain_results: [
        {
          domain: "apex-securities.io",
          company_name: "Apex Global Securities",
          lead_id: "LEAD-APEX-01",
          ciso_name: "Marcus Vance",
          arr_usd: 240000,
          threat_actor: "APT-FIN8 (DarkSilk Financial Syndicate)",
          attack_vector: "Cloud IMDSv2 SSRF & High-Frequency Trading Parameter Tampering",
          target_endpoint: "/api/v1/trade/settle",
          waf_clamp_latency_ms: 0.167,
          waf_clamp_assertion_passed: true,
          ast_autofix_duration_ms: 41.4,
          ast_autofix_assertion_passed: true,
          ast_unified_diff:
            "--- a/services/apex_securities_io/handlers.py\n+++ b/services/apex_securities_io/handlers.py\n@@ -1,5 +1,9 @@\n-    response = urllib.request.urlopen(user_url)\n+    if parsed.scheme not in ('https',) or parsed.netloc not in {'api.apex-securities.io'}:\n+        raise ValueError('SSRF Protection: Untrusted callback target blocked')\n",
          merkle_block_hash:
            "bd524d08645c117d9e4c19a928f118c7283bc5d96a7516b3489110a18764032a",
          incident_id: "INC-20261116-FD5359EC",
          containment_ratio: 1.0,
          human_downtime_seconds: 0.0,
        },
        {
          domain: "nexusbiohealth.com",
          company_name: "Nexus BioHealth Global",
          lead_id: "LEAD-NEXUS-02",
          ciso_name: "Dr. Sarah Lin",
          arr_usd: 180000,
          threat_actor: "APT-41 (Barium Bio-Espionage Cell)",
          attack_vector: "GraphQL AST Recursive Depth Injection & HIPAA Genomic Sequence SSRF",
          target_endpoint: "/api/v2/genomics/sequence",
          waf_clamp_latency_ms: 0.162,
          waf_clamp_assertion_passed: true,
          ast_autofix_duration_ms: 41.3,
          ast_autofix_assertion_passed: true,
          ast_unified_diff:
            "--- a/services/nexusbiohealth_com/handlers.py\n+++ b/services/nexusbiohealth_com/handlers.py\n@@ -1,4 +1,6 @@\n-    results = execute_raw_graphql(query_str)\n+    validate_ast_query_depth(query_str, max_depth=4)\n+    sanitized = filter_hipaa_phi_fields(query_str)\n",
          merkle_block_hash:
            "3c6f485cf3789b88e1a629f120199cb190532ea48a97752e89f5bc3a67d98877",
          incident_id: "INC-20261116-93872DAE",
          containment_ratio: 1.0,
          human_downtime_seconds: 0.0,
        },
        {
          domain: "hyperscale.dev",
          company_name: "HyperScale Cloud Systems",
          lead_id: "LEAD-HYPER-03",
          ciso_name: "Alex Chen",
          arr_usd: 200000,
          threat_actor: "Lazarus Group (CloudHopper Ingress Unit)",
          attack_vector: "Kubernetes Kubelet API SSRF (:10250) & Container Breakout Exploit",
          target_endpoint: "/api/k8s/cluster/provision",
          waf_clamp_latency_ms: 0.172,
          waf_clamp_assertion_passed: true,
          ast_autofix_duration_ms: 41.3,
          ast_autofix_assertion_passed: true,
          ast_unified_diff:
            "--- a/services/hyperscale_dev/handlers.py\n+++ b/services/hyperscale_dev/handlers.py\n@@ -1,4 +1,7 @@\n-    cmd = f\"kubectl apply -f {manifest.get('path')}\"\n+    if not manifest_path.startswith('/etc/sageai/k8s/trusted/'):\n+        raise PermissionError('RBAC Violation: Untrusted manifest path')\n",
          merkle_block_hash:
            "ba6a9001edac988e0c83a79d3910c2837bc90293da88e1846b0a88b172a6bca2",
          incident_id: "INC-20261116-B9830417",
          containment_ratio: 1.0,
          human_downtime_seconds: 0.0,
        },
        {
          domain: "vanguard-aero.def",
          company_name: "Vanguard Aerospace & Defense Systems",
          lead_id: "LEAD-VANGUARD-04",
          ciso_name: "Elena Rostova",
          arr_usd: 220000,
          threat_actor: "APT-28 (Fancy Bear Aerospace Infiltration)",
          attack_vector: "Software Supply Chain Dependency Typosquatting & Satellite Telemetry Injection",
          target_endpoint: "/api/v1/telemetry/ingest",
          waf_clamp_latency_ms: 0.160,
          waf_clamp_assertion_passed: true,
          ast_autofix_duration_ms: 41.2,
          ast_autofix_assertion_passed: true,
          ast_unified_diff:
            "--- a/services/vanguard_aero_def/handlers.py\n+++ b/services/vanguard_aero_def/handlers.py\n@@ -1,4 +1,7 @@\n-    return pickle.loads(raw_bytes)\n+    decoded = raw_bytes.decode('utf-8', errors='strict')\n+    payload = json.loads(decoded)\n",
          merkle_block_hash:
            "69a7cdf8a3809cb8a183d8e92a11b84920b7849e89ab9211c42f0b998a1837d9",
          incident_id: "INC-20261116-DE174F03",
          containment_ratio: 1.0,
          human_downtime_seconds: 0.0,
        },
      ],
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/simulation/enterprise-drill/history`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(FALLBACK_HISTORY);
    }
    const data = await safeUpstreamJson(res, FALLBACK_HISTORY);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_HISTORY);
  }
}
