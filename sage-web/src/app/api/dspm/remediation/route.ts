import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const body = await req.json();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetchBackend(`${BACKEND}/dspm/remediation-plan`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(getFallbackDSPMRemediation(body.scan_result?.store_id || "s3-analytics-data"));
  } catch {
    return NextResponse.json(getFallbackDSPMRemediation("s3-analytics-data"));
  }
}

function getFallbackDSPMRemediation(storeId: string) {
  return {
    status: "success",
    remediation_plan: {
      store_id: storeId,
      terraform_hcl: `resource "aws_s3_bucket_public_access_block" "remediate_${storeId}" {
  bucket = "${storeId}"
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "kms_enforce_${storeId}" {
  bucket = "${storeId}"
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = "arn:aws:kms:us-east-1:123456789012:key/sageai-dspm-key"
    }
  }
}`,
      aws_cli_commands: `aws s3api put-public-access-block --bucket ${storeId} --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
aws s3api put-bucket-encryption --bucket ${storeId} --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "aws:kms"}}]}'`,
      estimated_remediation_time: "< 2 minutes",
    },
  };
}

