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

  test("Health and Auth proxy routes expose v7.1.0 metadata and avoid 500s when backend is offline", async ({
    request,
  }) => {
    const healthRes = await request.get("/api/health");
    expect(healthRes.status()).toBe(200);
    const healthJson = (await healthRes.json()) as Record<string, unknown>;
    expect(healthJson.platform_version).toBe("7.1.0");
    expect(healthJson.version).toBe("7.1.0");
    expect(healthJson.backend_configured).toBe(false);
    expect(healthJson.mode).toBe("standalone-ui");

    for (const authPath of [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/sso/saml/acs",
    ]) {
      const badJsonRes = await request.post(authPath, {
        headers: { "Content-Type": "application/json" },
        data: "{invalid",
      });
      expect(badJsonRes.status(), `Expected 400 for malformed JSON at ${authPath}`).toBe(400);

      const offlineRes = await request.post(authPath, {
        data: { email: "ops@sageai.io", password: "SecretPassword123!" },
      });
      expect(offlineRes.status(), `Expected clean 502 instead of 500 at ${authPath}`).toBe(502);
      const errBody = (await offlineRes.json()) as Record<string, unknown>;
      expect(typeof errBody.error).toBe("string");
    }
  });

  test("Scan routes, public report SSR, and /scan UI degrade cleanly offline and robots.txt excludes private routes", async ({
    context,
    page,
    request,
  }) => {
    const postScan = await request.post("/api/scan", {
      headers: AUTH_HEADERS,
      data: { target: "https://example.com" },
    });
    expect(postScan.status()).toBe(502);
    const postBody = (await postScan.json()) as Record<string, unknown>;
    expect(postBody.scan_id).toBeUndefined();
    expect(typeof postBody.error).toBe("string");

    const getScan = await request.get("/api/scan/test-scan-123", {
      headers: AUTH_HEADERS,
    });
    expect(getScan.status()).toBe(502);
    const getBody = (await getScan.json()) as Record<string, unknown>;
    expect(getBody.status).toBeUndefined();

    const reportRes = await request.get("/report/test-token-123");
    expect(reportRes.status()).toBe(200);

    const robotsRes = await request.get("/robots.txt");
    expect(robotsRes.status()).toBe(200);
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain("/deep-search/");
    expect(robotsText).toContain("/report/");

    await context.addCookies([
      {
        name: "sageai_jwt",
        value: MOCK_E2E_JWT,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });

    const dialogs: string[] = [];
    page.on("dialog", (dialog) => {
      dialogs.push(`${dialog.type()}: ${dialog.message()}`);
      void dialog.dismiss();
    });

    await page.goto("/scan");
    await page.locator('input[placeholder="Enter domain (e.g. example.com)"]').fill("example.com");
    await page.locator('button:has-text("Start Scan")').click();

    await expect(
      page.locator('[role="alert"]:not(#__next-route-announcer__)')
    ).toContainText("BACKEND_URL");
    await expect(page.locator('button:has-text("Start Scan")')).toBeVisible();
    expect(dialogs).toEqual([]);
  });

  test("Unified fetchBackend rollout fails fast offline across core, streaming, billing, notification, and studio routes", async ({
    request,
  }) => {
    const startMs = Date.now();

    // Auth-gated core routes must reject unauthenticated callers before touching backend
    for (const check of [
      () => request.post("/api/checkout"),
      () => request.post("/api/billing/portal"),
      () => request.post("/api/copilot/chat", { data: { message: "hi" } }),
      () => request.get("/api/scan/test-scan-1/pdf"),
      () => request.post("/api/scan/test-scan-1/share"),
      () => request.post("/api/notifications/channels", { data: { type: "slack" } }),
    ]) {
      const res = await check();
      expect(res.status()).toBe(401);
    }

    // Authed core, SSE streaming, binary export, and notification channel routes fail cleanly with 502 (never 500)
    const coreOfflineChecks: Array<() => Promise<import("@playwright/test").APIResponse>> = [
      () => request.post("/api/checkout", { headers: AUTH_HEADERS }),
      () => request.post("/api/billing/portal", { headers: AUTH_HEADERS }),
      () =>
        request.post("/api/copilot/chat", {
          headers: AUTH_HEADERS,
          data: { message: "summarize posture" },
        }),
      () =>
        request.post("/api/intelligence/deep-search", {
          headers: AUTH_HEADERS,
          data: { query: "example.com" },
        }),
      () =>
        request.post("/api/dast/scan", {
          headers: AUTH_HEADERS,
          data: { target: "https://example.com" },
        }),
      () =>
        request.post("/api/export", {
          headers: AUTH_HEADERS,
          data: { type: "scans", format: "json" },
        }),
      () => request.get("/api/scan/test-scan-1/pdf", { headers: AUTH_HEADERS }),
      () => request.post("/api/scan/test-scan-1/share", { headers: AUTH_HEADERS }),
      () => request.post("/api/mfa?action=setup", { headers: AUTH_HEADERS }),
      () => request.get("/api/reports/test-scan-1/sarif", { headers: AUTH_HEADERS }),
      () => request.get("/api/auth/sso/config"),
      () =>
        request.post("/api/notifications/channels", {
          headers: AUTH_HEADERS,
          data: { type: "slack", target: "#secops" },
        }),
    ];

    for (const runCheck of coreOfflineChecks) {
      const res = await runCheck();
      expect(res.status(), `Expected 502 offline on ${res.url()}`).toBe(502);
      const body = (await res.json()) as Record<string, unknown>;
      expect(typeof body.error).toBe("string");
      expect(body.detail).toBeUndefined();
    }

    const notifChannelsGet = await request.get("/api/notifications/channels", {
      headers: AUTH_HEADERS,
    });
    expect(notifChannelsGet.status()).toBe(200);
    expect(await notifChannelsGet.json()).toEqual([]);

    // Studio simulation routes & fixed POST simulation fallbacks return 200 without hitting 500
    const zkpRes = await request.get("/api/zkp/proof");
    expect(zkpRes.status()).toBe(200);

    const depoisonRes = await request.post("/api/ai-depoison/scan", {
      data: { adapter_id: "finance-lora" },
    });
    expect(depoisonRes.status()).toBe(200);

    const casRes = await request.post("/api/cas-redteam/campaigns", {
      data: { name: "E2E Drill" },
    });
    expect(casRes.status()).toBe(200);
    const casBody = (await casRes.json()) as { status?: string; campaign?: { name?: string } };
    expect(casBody.status).toBe("success");
    expect(casBody.campaign?.name).toBe("E2E Drill");

    const llmGuardRes = await request.post("/api/airgap-llm-guard/scan-artifact", {
      data: { model_name: "Llama3-Test" },
    });
    expect(llmGuardRes.status()).toBe(200);
    const llmBody = (await llmGuardRes.json()) as { model?: { name?: string } };
    expect(llmBody.model?.name).toBe("Llama3-Test");

    const forensicsRes = await request.post("/api/cloud-forensics/snapshots", {
      data: { cloud_provider: "AWS" },
    });
    expect(forensicsRes.status()).toBe(200);

    const regRes = await request.post("/api/regulatory-commander/incidents", {
      data: { title: "E2E Tabletop" },
    });
    expect(regRes.status()).toBe(200);

    // Wave 29 studios (Caps 107-109 & Option B) return 200 deterministically offline
    const g2List = await request.get("/api/m-theory-g2/manifolds");
    expect(g2List.status()).toBe(200);
    const g2Sim = await request.post("/api/m-theory-g2/compactify-flux", {
      data: { manifold_id: "G2-JOYCE-ORBIFOLD-01", eleven_d_radius_planck: 18.5 },
    });
    expect(g2Sim.status()).toBe(200);
    expect(((await g2Sim.json()) as { status?: string }).status).toBe("M_THEORY_G2_COMPACTIFIED");

    const happyList = await request.get("/api/happy-holographic-qec/tessellations");
    expect(happyList.status()).toBe(200);
    const happySim = await request.post("/api/happy-holographic-qec/correct-erasure", {
      data: { tessellation_id: "HAPPY-PENTAGON-5-4-01", boundary_erasure_pct: 28.0 },
    });
    expect(happySim.status()).toBe(200);
    expect(((await happySim.json()) as { status?: string }).status).toBe("HAPPY_BULK_RECONSTRUCTED");

    const kthList = await request.get("/api/ktheory-dbrane/cycles");
    expect(kthList.status()).toBe(200);
    const kthSim = await request.post("/api/ktheory-dbrane/classify-charge", {
      data: { cycle_id: "KTHEORY-ABS-SPIN7-01", chern_character_rank: 16 },
    });
    expect(kthSim.status()).toBe(200);
    expect(((await kthSim.json()) as { status?: string }).status).toBe("KTHEORY_CHARGE_CLASSIFIED_STABLE");

    const kugList = await request.get("/api/kugelblitz-hawking/cores");
    expect(kugList.status()).toBe(200);
    const kugSim = await request.post("/api/kugelblitz-hawking/harvest-power", {
      data: { core_id: "KUGELBLITZ-ORBITAL-L4-01", singularity_mass_1e10_kg: 5.0 },
    });
    expect(kugSim.status()).toBe(200);
    const kugBody = (await kugSim.json()) as { status?: string; net_electrical_output_gw?: number };
    expect(kugBody.status).toBe("KUGELBLITZ_HAWKING_POWER_OPTIMAL");
    expect(Number(kugBody.net_electrical_output_gw)).toBeGreaterThan(125.0);

    // Wave 30 studios (Caps 110-112 & Option B) return 200 deterministically offline
    const ampList = await request.get("/api/amplituhedron-scattering/geometries");
    expect(ampList.status()).toBe(200);
    const ampSim = await request.post("/api/amplituhedron-scattering/optimize-form", {
      data: { geometry_id: "AMP-NMHV-2LOOP-02", particle_legs_n: 8, mhv_sector_k: 3 },
    });
    expect(ampSim.status()).toBe(200);
    expect(((await ampSim.json()) as { status?: string }).status).toBe("AMPLITUHEDRON_FORM_CONVERGED");

    const twList = await request.get("/api/twistor-holonomy/fibrations");
    expect(twList.status()).toBe(200);
    const twSim = await request.post("/api/twistor-holonomy/stabilize-holonomy", {
      data: { fibration_id: "TWISTOR-PENROSE-CP3-01", helicity_charge_2s: 4 },
    });
    expect(twSim.status()).toBe(200);
    expect(((await twSim.json()) as { status?: string }).status).toBe("TWISTOR_HOLONOMY_STABILIZED");

    const csList = await request.get("/api/causal-set-lattice/posets");
    expect(csList.status()).toBe(200);
    const csSim = await request.post("/api/causal-set-lattice/enforce-poset", {
      data: { poset_id: "CAUSAL-SPRINKLE-4D-01", sprinkling_density_factor: 1.25 },
    });
    expect(csSim.status()).toBe(200);
    expect(((await csSim.json()) as { status?: string }).status).toBe("CAUSAL_POSET_LORENTZ_INVARIANT");

    const schList = await request.get("/api/schwinger-vacuum/cavities");
    expect(schList.status()).toBe(200);
    const schSim = await request.post("/api/schwinger-vacuum/harvest-cascade", {
      data: { cavity_id: "SCHWINGER-L5-OPTICAL-01", field_ratio_e_ec: 0.86 },
    });
    expect(schSim.status()).toBe(200);
    const schBody = (await schSim.json()) as { status?: string; net_electrical_output_gw?: number };
    expect(schBody.status).toBe("SCHWINGER_HARVEST_POWER_OPTIMAL");
    expect(Number(schBody.net_electrical_output_gw)).toBeGreaterThan(155.0);

    // Wave 31 studios (Caps 113-115 & Option B) return 200 deterministically offline
    const csTqftList = await request.get("/api/chern-simons-tqft/manifolds");
    expect(csTqftList.status()).toBe(200);
    const csTqftSim = await request.post("/api/chern-simons-tqft/evaluate-invariant", {
      data: {
        manifold_id: "CS-SU2-S3-TREFOIL-01",
        gauge_rank_n: 2,
        chern_simons_level_k: 8,
        knot_crossings: 4,
      },
    });
    expect(csTqftSim.status()).toBe(200);
    expect(((await csTqftSim.json()) as { status?: string }).status).toBe(
      "CHERN_SIMONS_INVARIANT_LOCKED"
    );

    const qesList = await request.get("/api/quantum-extremal-island/horizons");
    expect(qesList.status()).toBe(200);
    const qesSim = await request.post("/api/quantum-extremal-island/audit-page-curve", {
      data: {
        horizon_id: "QES-PAGE-JT-ADS2-01",
        bekenstein_hawking_entropy_s0: 180.0,
        evaporation_page_ratio: 1.35,
      },
    });
    expect(qesSim.status()).toBe(200);
    expect(((await qesSim.json()) as { status?: string }).status).toBe(
      "QES_PAGE_CURVE_UNITARY"
    );

    const langList = await request.get("/api/geometric-langlands/sheaves");
    expect(langList.status()).toBe(200);
    const langSim = await request.post("/api/geometric-langlands/sync-duality", {
      data: {
        sheaf_id: "LANGLANDS-SU3-PSU3-01",
        yang_mills_coupling_g: 1.18,
        riemann_genus: 3,
      },
    });
    expect(langSim.status()).toBe(200);
    expect(((await langSim.json()) as { status?: string }).status).toBe(
      "LANGLANDS_SDUALITY_LOCKED"
    );

    const warpList = await request.get("/api/alcubierre-lentz-warp/corridors");
    expect(warpList.status()).toBe(200);
    const warpSim = await request.post("/api/alcubierre-lentz-warp/engage-soliton", {
      data: {
        corridor_id: "LENTZ-SOLITON-LEO-GEO-01",
        target_velocity_c: 0.28,
        soliton_radius_m: 45.0,
      },
    });
    expect(warpSim.status()).toBe(200);
    const warpBody = (await warpSim.json()) as {
      status?: string;
      positive_energy_only_t00_ge_0?: boolean;
      regenerative_bus_output_gw?: number;
    };
    expect(warpBody.status).toBe("LENTZ_SOLITON_TRANSIT_OPTIMAL");
    expect(warpBody.positive_energy_only_t00_ge_0).toBe(true);
    expect(Number(warpBody.regenerative_bus_output_gw)).toBeGreaterThan(160.0);

    expect(Date.now() - startMs).toBeLessThan(10000);
  });
});
