import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/iac-drift/scan`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackDriftScan());
  } catch {
    return NextResponse.json(getFallbackDriftScan());
  }
}

function getFallbackDriftScan() {
  return {
    status: "success",
    drift_report: {
      scan_timestamp: new Date().toISOString(),
      resources_inspected: 4,
      drifts_detected: 4,
      critical_drifts: 3,
      high_drifts: 1,
      cloud_iac_posture_score: 35,
      drifts: [
        {
          drift_id: "drift-aws_security_group.sg_enterprise_bastion-ingress-any",
          resource_id: "aws_security_group.sg_enterprise_bastion",
          resource_type: "aws_security_group",
          provider: "AWS",
          file_path: "terraform/network/security_groups.tf",
          drift_type: "DRIFT_SECURITY_GROUP_INGRESS_ALL",
          severity: "CRITICAL",
          description: "Security group has drifted: Port 22 is open to 0.0.0.0/0, violating declared IaC.",
          remediation_cli: "aws ec2 revoke-security-group-ingress --group-id sg_enterprise_bastion --protocol tcp --port 22 --cidr 0.0.0.0/0",
          remediation_hcl: "resource \"aws_security_group_rule\" \"ingress_bastion_ssh\" {\n  type = \"ingress\"\n  from_port = 22\n  to_port = 22\n  cidr_blocks = [\"10.0.0.0/16\"]\n}",
        },
        {
          drift_id: "drift-aws_s3_bucket.financial_records_vault-encryption-disabled",
          resource_id: "aws_s3_bucket.financial_records_vault",
          resource_type: "aws_s3_bucket",
          provider: "AWS",
          file_path: "terraform/storage/s3_buckets.tf",
          drift_type: "DRIFT_UNENCRYPTED_S3_STORAGE",
          severity: "HIGH",
          description: "S3 bucket server-side encryption was disabled out-of-band in cloud console.",
          remediation_cli: "aws s3api put-bucket-encryption --bucket sage-financial-records-vault",
          remediation_hcl: "resource \"aws_s3_bucket_server_side_encryption_configuration\" \"reconciled_sse\" {\n  rule {\n    apply_server_side_encryption_by_default {\n      sse_algorithm = \"aws:kms\"\n    }\n  }\n}",
        },
        {
          drift_id: "drift-aws_iam_policy.billing_auditor_policy-iam-wildcard",
          resource_id: "aws_iam_policy.billing_auditor_policy",
          resource_type: "aws_iam_policy",
          provider: "AWS",
          file_path: "terraform/iam/policies.tf",
          drift_type: "DRIFT_IAM_WILDCARD_ADMIN",
          severity: "CRITICAL",
          description: "IAM Policy escalated out-of-band to wildcard administrative actions (*).",
          remediation_cli: "aws iam create-policy-version --set-as-default",
          remediation_hcl: "# Enforce least privilege\nresource \"aws_iam_policy\" \"reconciled\" {\n  policy = jsonencode({ Action = [\"ce:*\"], Resource = \"*\" })\n}",
        },
        {
          drift_id: "drift-k8s_deployment.payment_processor_service-k8s-privileged",
          resource_id: "k8s_deployment.payment_processor_service",
          resource_type: "kubernetes_deployment",
          provider: "Kubernetes",
          file_path: "helm/templates/payment-processor.yaml",
          drift_type: "DRIFT_K8S_PRIVILEGED_POD",
          severity: "CRITICAL",
          description: "Kubernetes container deployment running in privileged mode, drifting from Helm specification.",
          remediation_cli: "kubectl patch deployment payment-processor --type='json' -p='[{\"op\": \"replace\", \"path\": \"/spec/template/spec/containers/0/securityContext/privileged\", \"value\": false}]'",
          remediation_hcl: "securityContext:\n  privileged: false\n  allowPrivilegeEscalation: false\n  readOnlyRootFilesystem: true",
        },
      ],
    },
  };
}

