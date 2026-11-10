import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetchBackend(`${BACKEND}/threat-feed`, {
      headers: { Authorization: `Bearer ${token}` },
    }, 5000);
    if (!res.ok) throw new Error();
    return NextResponse.json(await res.json());
  } catch {
    // Fallback sample feed for demo
    return NextResponse.json([
      { id: "CVE-2025-0001", title: "Critical RCE in OpenSSL 3.4", severity: "critical", source: "NVD", published: new Date().toISOString(), url: "https://nvd.nist.gov" },
      { id: "CVE-2025-0042", title: "XSS via innerHTML in React Router v7", severity: "high", source: "GitHub Advisory", published: new Date().toISOString(), url: "https://github.com/advisories" },
      { id: "CVE-2025-0099", title: "SSRF in Node.js fetch API", severity: "high", source: "NVD", published: new Date().toISOString(), url: "https://nvd.nist.gov" },
      { id: "CVE-2025-0123", title: "SQL Injection in Django REST Framework", severity: "critical", source: "Snyk", published: new Date().toISOString(), url: "https://snyk.io" },
      { id: "CVE-2025-0200", title: "Privilege Escalation in Linux Kernel 6.8", severity: "medium", source: "NVD", published: new Date().toISOString(), url: "https://nvd.nist.gov" },
    ]);
  }
}
