import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_PILOT_KITS = {
  total_kits: 4,
  orchestration_engine: "SAGEAI_UNIVERSAL_DEPLOYER_v8.7",
  pilot_kits: [
    {
      lead_id: "LEAD-APEX-01",
      company_name: "Apex Global Securities",
      ciso_name: "Marcus Vance",
      ciso_email: "m.vance@apex-securities.io",
      arr_usd: 240000,
      license_token: "CERT-EXEC-07F54648",
      deployment_type: "HELM_CHART",
      target_runtime: "High-Frequency Low-Latency Kubernetes (AWS EKS)",
      one_line_command:
        "curl -fsSL https://get.sageai.io/apex | bash -s -- --license-token=CERT-EXEC-07F54648 --kms-zone=us-east-1",
      config_filename: "apex-helm-values.yaml",
      raw_config:
        "# SageAI Enterprise Agent - Apex Global Securities Pilot\nagent:\n  licenseToken: \"CERT-EXEC-07F54648\"\n  ebpf:\n    enabled: true\n",
      heartbeat_status: "ONLINE_ACTIVE",
      sensor_nodes_count: 24,
      avg_latency_ms: 0.167,
    },
    {
      lead_id: "LEAD-NEXUS-02",
      company_name: "Nexus BioHealth Global",
      ciso_name: "Dr. Sarah Lin",
      ciso_email: "s.lin@nexusbiohealth.com",
      arr_usd: 180000,
      license_token: "CERT-EXEC-5ABB5EE1",
      deployment_type: "DOCKER_COMPOSE",
      target_runtime: "HIPAA/GxP On-Premise Enclave (Bare-Metal)",
      one_line_command:
        "curl -fsSL https://get.sageai.io/nexus | bash -s -- --license-token=CERT-EXEC-5ABB5EE1 --hipaa-enclave=true",
      config_filename: "docker-compose-nexus.yml",
      raw_config:
        "version: '3.8'\nservices:\n  sageai-sensor:\n    image: registry.sageai.io/sensor-mesh:v8.7\n",
      heartbeat_status: "ONLINE_ACTIVE",
      sensor_nodes_count: 16,
      avg_latency_ms: 0.162,
    },
    {
      lead_id: "LEAD-HYPER-03",
      company_name: "HyperScale Cloud Systems",
      ciso_name: "Alex Chen",
      ciso_email: "a.chen@hyperscale.dev",
      arr_usd: 200000,
      license_token: "CERT-EXEC-FD5B216E",
      deployment_type: "KUBERNETES_DAEMONSET",
      target_runtime: "Multi-Tenant Cloud Kubernetes (GKE / AKS)",
      one_line_command:
        "helm repo add sageai https://charts.sageai.io && helm install sageai-sensor sageai/sensor-mesh --set cluster.id=hyperscale-dev-01 --set token=CERT-EXEC-FD5B216E",
      config_filename: "hyperscale-daemonset.yaml",
      raw_config:
        "apiVersion: apps/v1\nkind: DaemonSet\nmetadata:\n  name: sageai-sensor-hyperscale\n",
      heartbeat_status: "ONLINE_ACTIVE",
      sensor_nodes_count: 64,
      avg_latency_ms: 0.172,
    },
    {
      lead_id: "LEAD-VANGUARD-04",
      company_name: "Vanguard Aerospace & Defense Systems",
      ciso_name: "Elena Rostova",
      ciso_email: "e.rostova@vanguard-aero.def",
      arr_usd: 220000,
      license_token: "CERT-EXEC-17F2BA50",
      deployment_type: "AIR_GAPPED_OCI_BUNDLE",
      target_runtime: "Air-Gapped GovCloud / SCIF Sovereign Enclave",
      one_line_command:
        "docker run --rm -v /etc/sageai:/etc/sageai:ro --network host sageai/vanguard-airgap:v8.7 --license=CERT-EXEC-17F2BA50",
      config_filename: "vanguard-airgap-manifest.json",
      raw_config:
        "{\n  \"package_id\": \"SAGEAI-VANGUARD-AIRGAP-v8.7\",\n  \"license_token\": \"CERT-EXEC-17F2BA50\"\n}\n",
      heartbeat_status: "ONLINE_ACTIVE",
      sensor_nodes_count: 8,
      avg_latency_ms: 0.160,
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/deployment/pilot-kits`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_PILOT_KITS);
    }
    const data = await safeUpstreamJson(res, FALLBACK_PILOT_KITS);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_PILOT_KITS);
  }
}
