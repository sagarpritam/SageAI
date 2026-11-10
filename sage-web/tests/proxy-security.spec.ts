import { test, expect } from "@playwright/test";

const MOCK_E2E_JWT =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvcGVyYXRvckBzYWdlYWkuY29tIiwiZW1haWwiOiJvcGVyYXRvckBzYWdlYWkuY29tIiwib3JnIjoib3JnLWUyZSJ9.mock_sig";

const AUTH_HEADERS = {
  Cookie: `sageai_jwt=${MOCK_E2E_JWT}`,
};

test.describe("Next.js API Proxy Security & Resilience Regression Suite", () => {
  test("POST /api/scan enforces auth and blocks IPv4 & IPv6 SSRF bypass targets", async ({
    request,
  }) => {
    const unauth = await request.post("/api/scan", {
      data: { target: "https://example.com" },
    });
    expect(unauth.status()).toBe(401);

    const blockedTargets = [
      "http://[::1]/",
      "http://[::]/",
      "http://[::ffff:127.0.0.1]/",
      "http://[::ffff:169.254.169.254]/latest/meta-data/",
      "http://[::ffff:10.0.0.1]/",
      "http://[fe80::1]/",
      "http://[fc00::1]/",
      "http://[fd12:3456::1]/",
      "http://[::127.0.0.1]/",
      "http://0.0.0.0/",
      "http://100.64.0.1/",
      "http://100.100.100.200/",
      "http://2130706433/",
      "http://0x7f000001/",
      "http://metadata.google.internal/",
      "http://internal-db.local/",
      "http://service.internal/",
      "http://redis:6379/",
      "HTTP://[::1]/",
      "ftp://example.com",
      "file:///etc/passwd",
      "javascript:alert(1)",
    ];

    for (const target of blockedTargets) {
      const res = await request.post("/api/scan", {
        headers: AUTH_HEADERS,
        data: { target },
      });
      expect(
        res.status(),
        `Expected 400 SSRF rejection for target ${target}`
      ).toBe(400);
    }

    const badJson = await request.post("/api/scan", {
      headers: {
        ...AUTH_HEADERS,
        "Content-Type": "application/json",
      },
      data: "{not-valid-json",
    });
    expect(badJson.status()).toBe(400);
  });

  test("GET /api/posture/[...path] rejects traversal and non-allowlisted paths", async ({
    request,
  }) => {
    const invalidPaths = [
      "/api/posture/unknown-endpoint",
      "/api/posture/remediation/..%2Fadmin",
      "/api/posture/quick-wins/bad%2Fid",
      "/api/posture/compliance/invalid_fw",
      "/api/posture/score/extra/segment",
    ];

    for (const url of invalidPaths) {
      const res = await request.get(url, { headers: AUTH_HEADERS });
      expect(res.status(), `Expected 400 for ${url}`).toBe(400);
    }

    // Bare dot-segment traversal is blocked at Next.js routing layer (404) or handler layer (400)
    const bareTraversal = await request.get("/api/posture/%2e%2e/auth/me", {
      headers: AUTH_HEADERS,
    });
    expect([400, 404]).toContain(bareTraversal.status());
  });

  test("Dynamic proxy IDs and query IDs reject path traversal and injection", async ({
    request,
  }) => {
    const invalidGetUrls = [
      "/api/scan/bad%2Fid",
      "/api/scan/bad..id",
      "/api/scan/..%2Fadmin/pdf",
      "/api/reports/bad%2Fid",
      "/api/reports/bad%2Fid/sarif",
      "/api/reports/bad%2Fid/hackerone",
      "/api/reports/bad%2Fid/debrief",
      "/api/reports/scan123/debrief?lang=..%2Fetc",
      "/api/rules/cve/..%2Fsecret",
      "/api/autofix/patches/..%2Fusers",
      "/api/telemetry/traces/..%2Fmetrics",
      "/api/redteam?job_id=..%2Fsecrets",
      "/api/compliance?framework=..%2Fauth",
    ];

    for (const url of invalidGetUrls) {
      const res = await request.get(url, { headers: AUTH_HEADERS });
      expect(res.status(), `Expected 400 for GET ${url}`).toBe(400);
    }

    const bareScanTraversal = await request.get("/api/scan/%2e%2e", {
      headers: AUTH_HEADERS,
    });
    expect([400, 404]).toContain(bareScanTraversal.status());

    const invalidPostCases: Array<{
      url: string;
      data?: Record<string, unknown>;
    }> = [
      { url: "/api/scan/bad%2Fid/share" },
      { url: "/api/autofix/patches/..%2Fusers/approve" },
      {
        url: "/api/autofix/patches/..%2Fusers/reject",
        data: { reason: "test" },
      },
      { url: "/api/incidents/..%2Fadmin/remediate", data: {} },
      {
        url: "/api/incidents/action",
        data: { incident_id: "../admin", action: "isolate" },
      },
    ];

    for (const { url, data } of invalidPostCases) {
      const res = await request.post(url, {
        headers: AUTH_HEADERS,
        data: data ?? {},
      });
      expect(res.status(), `Expected 400 for POST ${url}`).toBe(400);
    }

    const invalidDeleteUrls = [
      "/api/api-keys?id=../admin",
      "/api/schedules?id=../admin",
      "/api/webhooks?id=../admin",
    ];

    for (const url of invalidDeleteUrls) {
      const res = await request.delete(url, { headers: AUTH_HEADERS });
      expect(res.status(), `Expected 400 for DELETE ${url}`).toBe(400);
    }

    const badOrgUser = await request.patch("/api/org", {
      headers: AUTH_HEADERS,
      data: { user_id: "../admin", role: "admin" },
    });
    expect(badOrgUser.status()).toBe(400);

    const badOrgRole = await request.patch("/api/org", {
      headers: AUTH_HEADERS,
      data: { user_id: "user-123", role: "superadmin&bypass=1" },
    });
    expect(badOrgRole.status()).toBe(400);
  });

  test("POST /api/export rejects header/CRLF injection in export format", async ({
    request,
  }) => {
    for (const badFormat of [
      'json"\r\nX-Injected: 1',
      "../evil",
      "exe",
      123,
    ]) {
      const res = await request.post("/api/export", {
        headers: AUTH_HEADERS,
        data: { type: "scans", format: badFormat },
      });
      expect(
        res.status(),
        `Expected 400 for format ${String(badFormat)}`
      ).toBe(400);
    }
  });

  test("API proxies return 400 on malformed JSON and sanitize upstream 502 errors", async ({
    request,
  }) => {
    for (const url of [
      "/api/export",
      "/api/webhooks",
      "/api/ai/chat",
      "/api/incidents/action",
      "/api/warroom",
      "/api/autofix",
      "/api/autofix/patches",
    ]) {
      const res = await request.post(url, {
        headers: {
          ...AUTH_HEADERS,
          "Content-Type": "application/json",
        },
        data: "{malformed",
      });
      expect(
        res.status(),
        `Expected 400 for malformed JSON at POST ${url}`
      ).toBe(400);
    }

    const badPatch = await request.patch("/api/org", {
      headers: {
        ...AUTH_HEADERS,
        "Content-Type": "application/json",
      },
      data: "{malformed",
    });
    expect(badPatch.status()).toBe(400);

    // When backend is offline in standalone E2E, upstream errors must degrade to clean JSON 502
    // without exposing raw internal error details or HTML stack traces.
    for (const url of [
      "/api/analytics",
      "/api/org",
      "/api/posture/score",
      "/api/autofix/patches",
      "/api/telemetry/metrics",
    ]) {
      const res = await request.get(url, { headers: AUTH_HEADERS });
      expect(res.status()).not.toBe(500);
      if (res.status() === 502) {
        const body = (await res.json()) as Record<string, unknown>;
        expect(typeof body.error).toBe("string");
        expect(body.details).toBeUndefined();
        expect(body.detail).toBeUndefined();
      }
    }
  });
});
