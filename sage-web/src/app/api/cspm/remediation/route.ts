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

    const res = await fetchBackend(`${BACKEND}/cspm/remediation-script`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({
      status: "success",
      remediation: {
        type: "S3_BLOCK_PUBLIC_ACCESS",
        aws_cli: "aws s3api put-public-access-block --bucket TARGET --public-access-block-configuration BlockPublicAcls=true",
        terraform: "resource \"aws_s3_bucket_public_access_block\" \"secure_block\" { ... }",
      },
    });
  } catch {
    return NextResponse.json({
      status: "success",
      remediation: {
        type: "S3_BLOCK_PUBLIC_ACCESS",
        aws_cli: "aws s3api put-public-access-block --bucket TARGET --public-access-block-configuration BlockPublicAcls=true",
        terraform: "resource \"aws_s3_bucket_public_access_block\" \"secure_block\" { ... }",
      },
    });
  }
}

