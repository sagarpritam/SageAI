import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND}/rules/templates`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // Fallback if backend offline
  }

  // Fallback templates
  return NextResponse.json({
    status: "success",
    templates: [
      {
        cve_id: "CVE-2024-21887",
        title: "Ivanti Connect Secure Command Injection",
        description: "Command injection vulnerability in web components of Ivanti Connect Secure allowing unauthenticated remote code execution.",
        severity: "critical",
        vendor: "Ivanti",
        product: "Connect Secure / Policy Secure",
      },
      {
        cve_id: "CVE-2023-34362",
        title: "MOVEit Transfer SQL Injection & RCE",
        description: "SQL injection vulnerability in the MOVEit Transfer web application that could allow an unauthenticated attacker to gain unauthorized access.",
        severity: "critical",
        vendor: "Progress Software",
        product: "MOVEit Transfer",
      },
      {
        cve_id: "CVE-2021-44228",
        title: "Apache Log4j Remote Code Execution (Log4Shell)",
        description: "JNDI lookup features used in configuration, log messages, and parameters do not protect against attacker-controlled LDAP endpoints.",
        severity: "critical",
        vendor: "Apache",
        product: "Log4j",
      },
      {
        cve_id: "CVE-2022-22965",
        title: "Spring Framework Remote Code Execution (Spring4Shell)",
        description: "A Spring MVC or Spring WebFlux application running on JDK 9+ may be vulnerable to remote code execution.",
        severity: "critical",
        vendor: "VMware",
        product: "Spring Framework",
      },
    ],
  });
}
