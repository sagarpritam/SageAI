import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_FINDINGS = [
  {
    id: "DSPM-FND-8821",
    timestamp: "2026-11-17T18:14:22Z",
    source_channel: "LLM-Inference-Prompt-Stream",
    severity: "CRITICAL",
    detection_type: "AWS_SECRET_ACCESS_KEY",
    masked_sample: "AKIA****************[REDACTED_BY_SAGE_DSPM]",
    origin_workload: "rag-query-pipeline-prod",
    status: "INTERCEPTED_AND_REDACTED",
    policy_rule: "DSPM-POL-01-CLOUD-SECRETS",
    action_taken: "IN_MEMORY_ZERO_COPY_REDACT",
  },
  {
    id: "DSPM-FND-8822",
    timestamp: "2026-11-17T18:32:05Z",
    source_channel: "RAG-Knowledge-Vector-Store",
    severity: "CRITICAL",
    detection_type: "PATIENT_HIPAA_MRN",
    masked_sample: "MRN-****-9481[REDACTED_BY_SAGE_DSPM]",
    origin_workload: "vector-embedder-medical-docs",
    status: "QUARANTINED",
    policy_rule: "DSPM-POL-04-HIPAA-EHR",
    action_taken: "CHUNK_PURGED_FROM_VECTOR_INDEX",
  },
  {
    id: "DSPM-FND-8823",
    timestamp: "2026-11-17T19:04:19Z",
    source_channel: "Agent-Tool-Execution-Buffer",
    severity: "HIGH",
    detection_type: "CREDENTIAL_BEARER_JWT",
    masked_sample: "eyJh****************[REDACTED_BY_SAGE_DSPM]",
    origin_workload: "autonomous-worker-subagent-4",
    status: "INTERCEPTED_AND_REDACTED",
    policy_rule: "DSPM-POL-02-API-TOKENS",
    action_taken: "IN_MEMORY_ZERO_COPY_REDACT",
  },
  {
    id: "DSPM-FND-8824",
    timestamp: "2026-11-17T19:25:40Z",
    source_channel: "Training-Fine-Tuning-Pipeline",
    severity: "HIGH",
    detection_type: "CUSTOMER_PCI_CARD",
    masked_sample: "4111-****-****-1111[REDACTED_BY_SAGE_DSPM]",
    origin_workload: "dataset-tokenizer-eval",
    status: "QUARANTINED",
    policy_rule: "DSPM-POL-03-PCI-CARDHOLDER",
    action_taken: "DATASET_ROW_ISOLATED",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const query = status ? `?status=${encodeURIComponent(status)}` : "";

  try {
    const res = await fetchBackend(`${BACKEND}/api/security/dspm/findings${query}`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_FINDINGS>(res, FALLBACK_FINDINGS);
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Using fallback DSPM findings:", e);
  }

  if (status) {
    return NextResponse.json(
      FALLBACK_FINDINGS.filter((f) => f.status.toUpperCase() === status.toUpperCase())
    );
  }
  return NextResponse.json(FALLBACK_FINDINGS);
}
