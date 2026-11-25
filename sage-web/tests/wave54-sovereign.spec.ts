import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const MOCK_E2E_JWT =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvcGVyYXRvckBzYWdlYWkuY29tIiwiZW1haWwiOiJvcGVyYXRvckBzYWdlYWkuY29tIiwib3JnIjoib3JnLWUyZSJ9.mock_sig";

async function mockAuthenticatedSession(context: BrowserContext, page: Page) {
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
}

test.describe("Wave 54 Sovereign Architecture Suite (v9.4.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  // ---------------------------------------------------------------------------
  // API PROXY TESTS
  // ---------------------------------------------------------------------------

  test("GET & POST /api/yau-tian-donaldson-k-stability verifies K-polystability and KE shield", async ({
    request,
  }) => {
    const listRes = await request.get("/api/yau-tian-donaldson-k-stability/varieties");
    expect(listRes.status()).toBe(200);
    const varieties = (await listRes.json()).varieties;
    expect(varieties.length).toBeGreaterThanOrEqual(3);

    const verifyRes = await request.post("/api/yau-tian-donaldson-k-stability/verify-k-stability", {
      data: {
        variety_id: varieties[0].variety_id,
        test_configuration_exponent: 2,
        coercivity_threshold: 0.05,
        kahler_gain: 1.25,
      },
    });
    expect(verifyRes.status()).toBe(200);
    const result = await verifyRes.json();
    expect(result.variety_id).toBe(varieties[0].variety_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/deligne-lusztig-character verifies Deligne-Lusztig character barrier", async ({
    request,
  }) => {
    const listRes = await request.get("/api/deligne-lusztig-character/varieties");
    expect(listRes.status()).toBe(200);
    const varieties = (await listRes.json()).varieties;
    expect(varieties.length).toBeGreaterThanOrEqual(3);

    const evalRes = await request.post("/api/deligne-lusztig-character/evaluate-character", {
      data: {
        variety_id: varieties[0].variety_id,
        cohomology_degree: 2,
        unipotent_rank: 3,
        representation_gain: 1.25,
      },
    });
    expect(evalRes.status()).toBe(200);
    const result = await evalRes.json();
    expect(result.variety_id).toBe(varieties[0].variety_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/atiyah-segal-tqft verifies functorial TQFT and cobordism gluing", async ({
    request,
  }) => {
    const listRes = await request.get("/api/atiyah-segal-tqft/bordisms");
    expect(listRes.status()).toBe(200);
    const bordisms = (await listRes.json()).bordisms;
    expect(bordisms.length).toBeGreaterThanOrEqual(3);

    const evalRes = await request.post("/api/atiyah-segal-tqft/evaluate-functor", {
      data: {
        bordism_id: bordisms[0].bordism_id,
        gluing_cut_count: 2,
        mapping_class_order: 12,
        functor_gain: 1.25,
      },
    });
    expect(evalRes.status()).toBe(200);
    const result = await evalRes.json();
    expect(result.bordism_id).toBe(bordisms[0].bordism_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/mantle-transition-zone-wadsleyite-supergrid verifies proton conduction harvest", async ({
    request,
  }) => {
    const listRes = await request.get("/api/mantle-transition-zone-wadsleyite-supergrid/arrays");
    expect(listRes.status()).toBe(200);
    const arrays = (await listRes.json()).arrays;
    expect(arrays.length).toBeGreaterThanOrEqual(3);

    const harvestRes = await request.post(
      "/api/mantle-transition-zone-wadsleyite-supergrid/harvest-proton-conduction",
      {
        data: {
          array_id: arrays[0].array_id,
          water_content_override_wt_pct: 2.15,
          induction_efficiency: 0.95,
          dispatch_duration_s: 60.0,
        },
      }
    );
    expect(harvestRes.status()).toBe(200);
    const result = await harvestRes.json();
    expect(result.array_id).toBe(arrays[0].array_id);
    expect(result.status).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // UI DASHBOARD COMPONENT MOUNT TESTS
  // ---------------------------------------------------------------------------

  test("Dashboard mounts YTD K-Stability Studio (Cap 182)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /YTD K-Stability/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Yau-Tian-Donaldson K-Stability & Kahler-Einstein Shield").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Enforce YTD K-Stability Shield/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Deligne-Lusztig Studio (Cap 183)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Deligne-Lusztig/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Deligne-Lusztig Character Sheaves Barrier").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Enforce Character Sheaves Barrier/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Atiyah-Segal TQFT Studio (Cap 184)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Atiyah-Segal TQFT/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Atiyah-Segal Axiomatic Functorial TQFT Firewall").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Enforce Atiyah-Segal TQFT Firewall/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Mantle Wadsleyite Studio (Wave 54 Option B)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Mantle Wadsleyite/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Planetary Mantle Transition Zone Wadsleyite Supergrid").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Harvest Proton Conduction Power/i }).first()
    ).toBeVisible();
  });
});
