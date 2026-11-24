import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_CONFIGS: Record<string, { filename: string; content: string }> = {
  "LEAD-APEX-01": {
    filename: "apex-helm-values.yaml",
    content: "# SageAI Enterprise Agent - Apex Global Securities Pilot\nagent:\n  licenseToken: \"CERT-EXEC-07F54648\"\n  ebpf:\n    enabled: true\n",
  },
  "LEAD-NEXUS-02": {
    filename: "docker-compose-nexus.yml",
    content: "version: '3.8'\nservices:\n  sageai-sensor:\n    image: registry.sageai.io/sensor-mesh:v8.7\n",
  },
  "LEAD-HYPER-03": {
    filename: "hyperscale-daemonset.yaml",
    content: "apiVersion: apps/v1\nkind: DaemonSet\nmetadata:\n  name: sageai-sensor-hyperscale\n",
  },
  "LEAD-VANGUARD-04": {
    filename: "vanguard-airgap-manifest.json",
    content: "{\n  \"package_id\": \"SAGEAI-VANGUARD-AIRGAP-v8.7\",\n  \"license_token\": \"CERT-EXEC-17F2BA50\"\n}\n",
  },
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;

  try {
    const res = await fetchBackend(`${BACKEND}/api/deployment/pilot-kits/${leadId}/download`, {
      cache: "no-store",
    });
    if (res.ok) {
      const text = await res.text();
      const disposition = res.headers.get("content-disposition") || `attachment; filename="${leadId}-config.yaml"`;
      return new NextResponse(text, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": disposition,
        },
      });
    }
  } catch {
    // Local fallback
  }

  const fallback = FALLBACK_CONFIGS[leadId] || {
    filename: `${leadId}-config.yaml`,
    content: `# SageAI Config for ${leadId}\n`,
  };

  const localCandidates = [
    path.resolve(process.cwd(), "..", "artifacts", "deployments", fallback.filename),
    path.resolve(process.cwd(), "artifacts", "deployments", fallback.filename),
  ];

  for (const candidate of localCandidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
      const text = fs.readFileSync(/*turbopackIgnore: true*/ candidate, "utf-8");
      return new NextResponse(text, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="${fallback.filename}"`,
        },
      });
    }
  }

  return new NextResponse(fallback.content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="${fallback.filename}"`,
    },
  });
}
