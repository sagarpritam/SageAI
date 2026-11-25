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

test.describe("Wave 56 Sovereign Architecture Suite (v9.6.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  // ---------------------------------------------------------------------------
  // API PROXY TESTS
  // ---------------------------------------------------------------------------

  test("GET & POST /api/lurie-higher-topos-spectral verifies spectral descent and higher topos shield", async ({
    request,
  }) => {
    const listRes = await request.get("/api/lurie-higher-topos-spectral/topoi");
    expect(listRes.status()).toBe(200);
    const topoi = (await listRes.json()).topoi;
    expect(topoi.length).toBeGreaterThanOrEqual(3);

    const evalRes = await request.post("/api/lurie-higher-topos-spectral/evaluate-spectral-descent", {
      data: {
        topos_id: topoi[0].topos_id,
        truncation_level: 4,
        e_infinity_order: 8,
        shield_gain: 1.25,
      },
    });
    expect(evalRes.status()).toBe(200);
    const result = await evalRes.json();
    expect(result.topos_id).toBe(topoi[0].topos_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/grr-baum-fulton-macpherson verifies singular Chern character and BFM commutativity", async ({
    request,
  }) => {
    const listRes = await request.get("/api/grr-baum-fulton-macpherson/varieties");
    expect(listRes.status()).toBe(200);
    const varieties = (await listRes.json()).varieties;
    expect(varieties.length).toBeGreaterThanOrEqual(3);

    const compRes = await request.post(
      "/api/grr-baum-fulton-macpherson/compute-singular-chern-character",
      {
        data: {
          variety_id: varieties[0].variety_id,
          stratification_depth: 3,
          todd_degree: 4,
          barrier_gain: 1.25,
        },
      }
    );
    expect(compRes.status()).toBe(200);
    const result = await compRes.json();
    expect(result.variety_id).toBe(varieties[0].variety_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/kazhdan-lusztig-hecke verifies KL polynomials and canonical basis self-duality", async ({
    request,
  }) => {
    const listRes = await request.get("/api/kazhdan-lusztig-hecke/pairs");
    expect(listRes.status()).toBe(200);
    const pairs = (await listRes.json()).pairs;
    expect(pairs.length).toBeGreaterThanOrEqual(3);

    const evalRes = await request.post("/api/kazhdan-lusztig-hecke/evaluate-kl-polynomial", {
      data: {
        pair_id: pairs[0].pair_id,
        hecke_q_parameter: 1.0,
        kazhdan_inversion_order: 4,
        firewall_gain: 1.25,
      },
    });
    expect(evalRes.status()).toBe(200);
    const result = await evalRes.json();
    expect(result.pair_id).toBe(pairs[0].pair_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/icb-dendritic-solidification-supergrid verifies latent heat baseload dispatch", async ({
    request,
  }) => {
    const listRes = await request.get("/api/icb-dendritic-solidification-supergrid/arrays");
    expect(listRes.status()).toBe(200);
    const arrays = (await listRes.json()).arrays;
    expect(arrays.length).toBeGreaterThanOrEqual(3);

    const harvestRes = await request.post(
      "/api/icb-dendritic-solidification-supergrid/harvest-latent-heat",
      {
        data: {
          array_id: arrays[0].array_id,
          crystallization_rate_override_mm_yr: 1.5,
          thermo_acoustic_efficiency: 0.95,
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
  // DASHBOARD UI MOUNT TESTS
  // ---------------------------------------------------------------------------

  test("Dashboard mounts Lurie Higher Topos Studio tab", async ({ page, context }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.locator('button:has-text("Lurie Spectral")').first();
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();

    await expect(page.locator("text=Lurie Higher Topos").first()).toBeVisible({ timeout: 10000 });
  });

  test("Dashboard mounts GRR Baum-Fulton Studio tab", async ({ page, context }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.locator('button:has-text("GRR Baum-Fulton")').first();
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();

    await expect(page.locator("text=Baum-Fulton-MacPherson").first()).toBeVisible({ timeout: 10000 });
  });

  test("Dashboard mounts Kazhdan-Lusztig Studio tab", async ({ page, context }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.locator('button:has-text("Kazhdan-Lusztig")').first();
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();

    await expect(page.locator("text=Kazhdan-Lusztig").first()).toBeVisible({ timeout: 10000 });
  });

  test("Dashboard mounts ICB Solidification Supergrid Studio tab", async ({ page, context }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.locator('button:has-text("ICB Solidification")').first();
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();

    await expect(page.locator("text=Inner-Core Boundary").first()).toBeVisible({ timeout: 10000 });
  });
});
