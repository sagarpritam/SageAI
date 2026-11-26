import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_WORKLOADS = [
  {
    id: "WKL-GPU-H100-NODE-1",
    name: "NVIDIA H100 Tensor-Core LLM Inference",
    provider: "GCP (us-central1)",
    resource_type: "a3-highgpu-8g (8x H100 80GB)",
    cost_per_hour_usd: 9.8,
    utilization_pct: 94.2,
    cost_per_scan_usd: 0.0021,
    efficiency_tier: "OPTIMAL",
    auto_scale_mode: "DYNAMIC_TOKEN_BATCHING",
  },
  {
    id: "WKL-CLOUDRUN-FLUID-API",
    name: "Cloud Run Serverless Fluid Compute API",
    provider: "GCP (europe-west1)",
    resource_type: "Serverless 4vCPU 8GB (Min: 2, Max: 80)",
    cost_per_hour_usd: 4.12,
    utilization_pct: 76.5,
    cost_per_scan_usd: 0.0006,
    efficiency_tier: "HIGH",
    auto_scale_mode: "CONCURRENCY_TUNED_120",
  },
  {
    id: "WKL-AWS-GRAVITON3-WORKER",
    name: "AWS Graviton3 CTI Enrichment Daemons",
    provider: "AWS (us-east-1)",
    resource_type: "c7g.4xlarge (16 vCPU ARM64)",
    cost_per_hour_usd: 3.25,
    utilization_pct: 88.0,
    cost_per_scan_usd: 0.0005,
    efficiency_tier: "OPTIMAL",
    auto_scale_mode: "SPOT_INTERRUPT_FALLBACK",
  },
  {
    id: "WKL-AZURE-VECTOR-STORE",
    name: "Azure Cosmos Multi-Region Vector Index",
    provider: "Azure (eastus2)",
    resource_type: "Cosmos DB Autoscale RU/s",
    cost_per_hour_usd: 1.25,
    utilization_pct: 62.4,
    cost_per_scan_usd: 0.0002,
    efficiency_tier: "REBALANCING_RECOMMENDED",
    auto_scale_mode: "BURST_CAPACITY_ENABLED",
  },
];

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/finops/workloads`);
    if (res.ok) {
      const data = await safeUpstreamJson<typeof FALLBACK_WORKLOADS>(res, FALLBACK_WORKLOADS);
      return NextResponse.json(data);
    }
  } catch (e: unknown) {
    console.warn("Using fallback FinOps workloads:", e);
  }
  return NextResponse.json(FALLBACK_WORKLOADS);
}
