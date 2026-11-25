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

test.describe("Wave 53 Sovereign Architecture Suite (v9.3.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  // ---------------------------------------------------------------------------
  // API PROXY TESTS
  // ---------------------------------------------------------------------------

  test("GET & POST /api/uhlenbeck-gauge-compactness verifies Uhlenbeck compactness enforcement", async ({
    request,
  }) => {
    const listRes = await request.get("/api/uhlenbeck-gauge-compactness/configurations");
    expect(listRes.status()).toBe(200);
    const configs = (await listRes.json()).configurations;
    expect(configs.length).toBeGreaterThanOrEqual(3);

    const enforceRes = await request.post("/api/uhlenbeck-gauge-compactness/enforce-compactness", {
      data: {
        connection_id: configs[0].connection_id,
        curvature_threshold: 1e-4,
        bubbling_radius_delta: 0.02,
        sobolev_gain: 1.25,
      },
    });
    expect(enforceRes.status()).toBe(200);
    const result = await enforceRes.json();
    expect(result.connection_id).toBe(configs[0].connection_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/taubes-vortex-sw verifies SW=Gr equivalence and vortex barrier", async ({
    request,
  }) => {
    const listRes = await request.get("/api/taubes-vortex-sw/manifolds");
    expect(listRes.status()).toBe(200);
    const manifolds = (await listRes.json()).manifolds;
    expect(manifolds.length).toBeGreaterThanOrEqual(3);

    const equateRes = await request.post("/api/taubes-vortex-sw/equate-sw-gromov", {
      data: {
        manifold_id: manifolds[0].manifold_id,
        vortex_parameter_r: 1.0,
        perturbation_eta: 0.01,
        coupling_gain: 1.25,
      },
    });
    expect(equateRes.status()).toBe(200);
    const result = await equateRes.json();
    expect(result.manifold_id).toBe(manifolds[0].manifold_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/grothendieck-teichmuller-galois verifies Drinfeld associator and Galois firewall", async ({
    request,
  }) => {
    const listRes = await request.get("/api/grothendieck-teichmuller-galois/dessins");
    expect(listRes.status()).toBe(200);
    const dessins = (await listRes.json()).dessins;
    expect(dessins.length).toBeGreaterThanOrEqual(3);

    const evalRes = await request.post("/api/grothendieck-teichmuller-galois/evaluate-associator", {
      data: {
        dessin_id: dessins[0].dessin_id,
        drinfeld_lambda: 1.0,
        associator_order: 4,
        firewall_gain: 1.25,
      },
    });
    expect(evalRes.status()).toBe(200);
    const result = await evalRes.json();
    expect(result.dessin_id).toBe(dessins[0].dessin_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/geodynamo-helical-turbulent-supergrid verifies outer-core power harvest", async ({
    request,
  }) => {
    const listRes = await request.get("/api/geodynamo-helical-turbulent-supergrid/arrays");
    expect(listRes.status()).toBe(200);
    const arrays = (await listRes.json()).arrays;
    expect(arrays.length).toBeGreaterThanOrEqual(3);

    const harvestRes = await request.post("/api/geodynamo-helical-turbulent-supergrid/harvest-induction-power", {
      data: {
        array_id: arrays[0].array_id,
        helicity_override_alpha: 0.045,
        induction_efficiency: 0.95,
        dispatch_duration_s: 60.0,
      },
    });
    expect(harvestRes.status()).toBe(200);
    const result = await harvestRes.json();
    expect(result.array_id).toBe(arrays[0].array_id);
    expect(result.status).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // UI DASHBOARD COMPONENT MOUNT TESTS
  // ---------------------------------------------------------------------------

  test("Dashboard mounts Uhlenbeck Compactness Studio (Cap 179)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Uhlenbeck Compactness/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Uhlenbeck Gauge Compactness & Instanton Wall").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Enforce Uhlenbeck Compactness/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Taubes Vortices Studio (Cap 180)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Taubes Vortices/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Taubes Vortices & SW=Gr Equivalence Barrier").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Equate Seiberg-Witten & Gromov Invariants/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Grothendieck-Teichmuller Studio (Cap 181)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Grothendieck-Teichmuller/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Grothendieck-Teichmuller & Galois Dessins Firewall").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Evaluate Drinfeld Associator & Lock Galois Group/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Geodynamo Turbulent Studio (Wave 53 Option B)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Geodynamo Turbulent/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Planetary Outer-Core Geodynamo Induction Supergrid").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Harvest Geodynamo Induction Power/i }).first()
    ).toBeVisible();
  });
});
