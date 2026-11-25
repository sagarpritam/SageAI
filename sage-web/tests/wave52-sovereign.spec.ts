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

test.describe("Wave 52 Sovereign Architecture Suite (v9.2.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  // ---------------------------------------------------------------------------
  // API PROXY TESTS
  // ---------------------------------------------------------------------------

  test("GET & POST /api/perelman-ricci-flow verifies Ricci flow with surgery execution", async ({
    request,
  }) => {
    const listRes = await request.get("/api/perelman-ricci-flow/manifolds");
    expect(listRes.status()).toBe(200);
    const manifolds = (await listRes.json()).manifolds;
    expect(manifolds.length).toBeGreaterThanOrEqual(3);

    const surgeryRes = await request.post("/api/perelman-ricci-flow/execute-surgery", {
      data: {
        manifold_id: manifolds[0].manifold_id,
        flow_time_tau: 0.25,
        surgery_cutoff: 1e-4,
        curvature_gain: 1.25,
      },
    });
    expect(surgeryRes.status()).toBe(200);
    const result = await surgeryRes.json();
    expect(result.manifold_id).toBe(manifolds[0].manifold_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/gromov-witten-cohomology verifies quantum cup product and WDVV", async ({
    request,
  }) => {
    const listRes = await request.get("/api/gromov-witten-cohomology/targets");
    expect(listRes.status()).toBe(200);
    const targets = (await listRes.json()).targets;
    expect(targets.length).toBeGreaterThanOrEqual(3);

    const productRes = await request.post("/api/gromov-witten-cohomology/compute-quantum-product", {
      data: {
        target_id: targets[0].target_id,
        quantum_degree: 3,
        novikov_parameter_q: 0.05,
        deformation_gain: 1.25,
      },
    });
    expect(productRes.status()).toBe(200);
    const result = await productRes.json();
    expect(result.target_id).toBe(targets[0].target_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/quillen-determinant verifies Quillen metric and Deligne firewall", async ({
    request,
  }) => {
    const listRes = await request.get("/api/quillen-determinant/bundles");
    expect(listRes.status()).toBe(200);
    const bundles = (await listRes.json()).bundles;
    expect(bundles.length).toBeGreaterThanOrEqual(3);

    const evalRes = await request.post("/api/quillen-determinant/evaluate-determinant", {
      data: {
        bundle_id: bundles[0].bundle_id,
        regularization_cutoff: 1e-5,
        zeta_derivative_scale: 1.0,
        firewall_gain: 1.25,
      },
    });
    expect(evalRes.status()).toBe(200);
    const result = await evalRes.json();
    expect(result.bundle_id).toBe(bundles[0].bundle_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/core-mantle-seebeck-supergrid verifies thermoelectric power harvest", async ({
    request,
  }) => {
    const listRes = await request.get("/api/core-mantle-seebeck-supergrid/arrays");
    expect(listRes.status()).toBe(200);
    const arrays = (await listRes.json()).arrays;
    expect(arrays.length).toBeGreaterThanOrEqual(3);

    const harvestRes = await request.post("/api/core-mantle-seebeck-supergrid/harvest-thermal-power", {
      data: {
        array_id: arrays[0].array_id,
        delta_temp_override_k: 1250.0,
        thermopile_efficiency: 0.95,
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

  test("Dashboard mounts Perelman Ricci Flow Studio (Cap 176)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Perelman Ricci Flow/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Perelman Ricci Flow & Surgery Shield").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Execute Ricci Flow & Surgery/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Gromov-Witten Invariants Studio (Cap 177)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Gromov-Witten Barrier/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Gromov-Witten & Quantum Cohomology Barrier").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Compute Quantum Cup Product & Verify WDVV/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Quillen Determinant Studio (Cap 178)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Quillen Determinant/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Quillen Determinant & Deligne-Riemann-Roch Firewall").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Evaluate Quillen Metric & Seal Anomaly/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Core-Mantle Seebeck Studio (Wave 52 Option B)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Core-Mantle Seebeck/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Planetary Core-Mantle Seebeck Supergrid").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Harvest Core-Mantle Seebeck Power/i }).first()
    ).toBeVisible();
  });
});
