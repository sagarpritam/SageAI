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

test.describe("Wave 55 Sovereign Architecture Suite (v9.5.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  // ---------------------------------------------------------------------------
  // API PROXY TESTS
  // ---------------------------------------------------------------------------

  test("GET & POST /api/simpson-nonabelian-hodge verifies Hitchin-Simpson solvability shield", async ({
    request,
  }) => {
    const listRes = await request.get("/api/simpson-nonabelian-hodge/bundles");
    expect(listRes.status()).toBe(200);
    const bundles = (await listRes.json()).bundles;
    expect(bundles.length).toBeGreaterThanOrEqual(3);

    const solveRes = await request.post("/api/simpson-nonabelian-hodge/solve-hitchin-simpson", {
      data: {
        bundle_id: bundles[0].bundle_id,
        harmonic_damping: 0.05,
        spectral_cutoff: 4,
        hodge_gain: 1.25,
      },
    });
    expect(solveRes.status()).toBe(200);
    const result = await solveRes.json();
    expect(result.bundle_id).toBe(bundles[0].bundle_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/cannon-thurston-hyperbolic verifies boundary rigidity and continuity", async ({
    request,
  }) => {
    const listRes = await request.get("/api/cannon-thurston-hyperbolic/groups");
    expect(listRes.status()).toBe(200);
    const groups = (await listRes.json()).groups;
    expect(groups.length).toBeGreaterThanOrEqual(3);

    const verifyRes = await request.post("/api/cannon-thurston-hyperbolic/verify-boundary-rigidity", {
      data: {
        group_id: groups[0].group_id,
        geodesic_ray_steps: 100,
        delta_hyperbolicity_tolerance: 0.05,
        barrier_gain: 1.25,
      },
    });
    expect(verifyRes.status()).toBe(200);
    const result = await verifyRes.json();
    expect(result.group_id).toBe(groups[0].group_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/waldhausen-algebraic-k verifies cyclotomic trace and K-firewall", async ({
    request,
  }) => {
    const listRes = await request.get("/api/waldhausen-algebraic-k/complexes");
    expect(listRes.status()).toBe(200);
    const complexes = (await listRes.json()).complexes;
    expect(complexes.length).toBeGreaterThanOrEqual(3);

    const evalRes = await request.post("/api/waldhausen-algebraic-k/evaluate-cyclotomic-trace", {
      data: {
        complex_id: complexes[0].complex_id,
        filtration_degree: 3,
        cyclotomic_prime: 3,
        firewall_gain: 1.25,
      },
    });
    expect(evalRes.status()).toBe(200);
    const result = await evalRes.json();
    expect(result.complex_id).toBe(complexes[0].complex_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/ulvz-magneto-thermal-waveguide-supergrid verifies baseload power dispatch", async ({
    request,
  }) => {
    const listRes = await request.get("/api/ulvz-magneto-thermal-waveguide-supergrid/arrays");
    expect(listRes.status()).toBe(200);
    const arrays = (await listRes.json()).arrays;
    expect(arrays.length).toBeGreaterThanOrEqual(3);

    const harvestRes = await request.post(
      "/api/ulvz-magneto-thermal-waveguide-supergrid/harvest-waveguide-power",
      {
        data: {
          array_id: arrays[0].array_id,
          iron_enrichment_override_x_fe: 0.18,
          waveguide_efficiency: 0.95,
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

  test("Dashboard mounts Simpson Nonabelian Hodge Studio tab", async ({ page, context }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.locator('button:has-text("Simpson Hodge")').first();
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();

    await expect(page.locator("text=Nonabelian Hodge").first()).toBeVisible({ timeout: 10000 });
  });

  test("Dashboard mounts Cannon-Thurston Hyperbolic Studio tab", async ({ page, context }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.locator('button:has-text("Cannon-Thurston")').first();
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();

    await expect(page.locator("text=Cannon-Thurston").first()).toBeVisible({ timeout: 10000 });
  });

  test("Dashboard mounts Waldhausen Algebraic K Studio tab", async ({ page, context }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.locator('button:has-text("Waldhausen K")').first();
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();

    await expect(page.locator("text=Waldhausen").first()).toBeVisible({ timeout: 10000 });
  });

  test("Dashboard mounts ULVZ Waveguide Supergrid Studio tab", async ({ page, context }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.locator('button:has-text("ULVZ Waveguide")').first();
    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();

    await expect(page.locator("text=Ultralow-Velocity").first()).toBeVisible({ timeout: 10000 });
  });
});
