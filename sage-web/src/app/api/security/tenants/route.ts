import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_TENANTS = {
  total_tenants: 4,
  isolation_standard: "FIPS_203_ML_KEM_768_POST_QUANTUM",
  tenants: [
    {
      tenant_id: "org-apex",
      company_name: "Apex Global Securities",
      domain: "apex-securities.io",
      primary_ciso: "Marcus Vance",
      ciso_email: "m.vance@apex-securities.io",
      recognized_arr_usd: 240000,
      enclave_region: "us-east-financial-zone-1",
      isolation_tier: "FIPS_203_DEDICATED_HARDWARE",
      active_user_seats: 48,
      kms_key: {
        key_ring_id: "KMS-APEX-SEC-9921",
        current_key_version: 2,
        algorithm: "FIPS 203 ML-KEM-768 + AES-256-GCM",
        created_at: 1794800000,
        last_rotated_at: 1794840000,
        rotation_interval_days: 90,
        status: "ACTIVE_HEALTHY",
      },
      rbac_roles: {
        TENANT_ADMIN: ["*"],
        SECURITY_OFFICER: ["audit:read", "keys:view", "ebpf:deploy", "soar:execute"],
        AUDITOR_READONLY: ["audit:read", "compliance:export", "contracts:view"],
      },
      status: "PILOT_PROVISIONED",
    },
    {
      tenant_id: "org-nexus",
      company_name: "Nexus BioHealth Global",
      domain: "nexusbiohealth.com",
      primary_ciso: "Dr. Sarah Lin",
      ciso_email: "s.lin@nexusbiohealth.com",
      recognized_arr_usd: 180000,
      enclave_region: "eu-west-clinical-zone-2",
      isolation_tier: "HIPAA_GxP_COMPLIANT_ENCLAVE",
      active_user_seats: 32,
      kms_key: {
        key_ring_id: "KMS-NEXUS-BIO-4412",
        current_key_version: 1,
        algorithm: "FIPS 203 ML-KEM-768 + AES-256-GCM",
        created_at: 1794800000,
        last_rotated_at: 1794800000,
        rotation_interval_days: 60,
        status: "ACTIVE_HEALTHY",
      },
      rbac_roles: {
        TENANT_ADMIN: ["*"],
        SECURITY_OFFICER: ["audit:read", "keys:view", "ebpf:deploy"],
      },
      status: "PILOT_PROVISIONED",
    },
    {
      tenant_id: "org-hyperscale",
      company_name: "HyperScale Cloud Systems",
      domain: "hyperscale.dev",
      primary_ciso: "Alex Chen",
      ciso_email: "a.chen@hyperscale.dev",
      recognized_arr_usd: 200000,
      enclave_region: "us-central-k8s-mesh-1",
      isolation_tier: "MULTI_TENANT_POD_ISOLATION",
      active_user_seats: 120,
      kms_key: {
        key_ring_id: "KMS-HYPER-CLOUD-8819",
        current_key_version: 3,
        algorithm: "FIPS 203 ML-KEM-768 + AES-256-GCM",
        created_at: 1794800000,
        last_rotated_at: 1794840000,
        rotation_interval_days: 30,
        status: "ACTIVE_HEALTHY",
      },
      rbac_roles: {
        TENANT_ADMIN: ["*"],
        SECURITY_OFFICER: ["audit:read", "keys:view", "ebpf:deploy"],
      },
      status: "PILOT_PROVISIONED",
    },
    {
      tenant_id: "org-vanguard",
      company_name: "Vanguard Aerospace & Defense Systems",
      domain: "vanguard-aero.def",
      primary_ciso: "Elena Rostova",
      ciso_email: "e.rostova@vanguard-aero.def",
      recognized_arr_usd: 220000,
      enclave_region: "govcloud-airgap-zone-alpha",
      isolation_tier: "AIR_GAPPED_FIPS_140_3",
      active_user_seats: 18,
      kms_key: {
        key_ring_id: "KMS-VANGUARD-DEF-0114",
        current_key_version: 4,
        algorithm: "FIPS 203 ML-KEM-768 + AES-256-GCM",
        created_at: 1794800000,
        last_rotated_at: 1794840000,
        rotation_interval_days: 14,
        status: "ACTIVE_HEALTHY",
      },
      rbac_roles: {
        TENANT_ADMIN: ["*"],
        SECURITY_OFFICER: ["audit:read", "keys:view", "ebpf:deploy"],
      },
      status: "PILOT_PROVISIONED",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/security/tenants`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_TENANTS);
    }
    const data = await safeUpstreamJson(res, FALLBACK_TENANTS);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_TENANTS);
  }
}
