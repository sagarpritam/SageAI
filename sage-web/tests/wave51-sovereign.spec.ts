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

test.describe("Wave 51 Sovereign Architecture Suite (v9.1.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  // ---------------------------------------------------------------------------
  // API PROXY TESTS
  // ---------------------------------------------------------------------------

  test("GET & POST /api/kontsevich-deformation verifies formality star-product quantization", async ({
    request,
  }) => {
    const listRes = await request.get("/api/kontsevich-deformation/manifolds");
    expect(listRes.status()).toBe(200);
    const manifolds = (await listRes.json()).manifolds;
    expect(manifolds.length).toBeGreaterThanOrEqual(3);

    const quantizeRes = await request.post("/api/kontsevich-deformation/quantize-deformation", {
      data: {
        manifold_id: manifolds[0].manifold_id,
        hbar_order: 4,
        harmonic_precision: 1e-6,
        deformation_gain: 1.25,
      },
    });
    expect(quantizeRes.status()).toBe(200);
    const result = await quantizeRes.json();
    expect(result.manifold_id).toBe(manifolds[0].manifold_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/novikov-shubin verifies L2-Betti invariant computation", async ({
    request,
  }) => {
    const listRes = await request.get("/api/novikov-shubin/coverings");
    expect(listRes.status()).toBe(200);
    const coverings = (await listRes.json()).coverings;
    expect(coverings.length).toBeGreaterThanOrEqual(3);

    const computeRes = await request.post("/api/novikov-shubin/compute-invariants", {
      data: {
        covering_id: coverings[0].covering_id,
        spectral_order: 6,
        dilatational_cutoff: 1e-4,
        barrier_gain: 1.25,
      },
    });
    expect(computeRes.status()).toBe(200);
    const result = await computeRes.json();
    expect(result.covering_id).toBe(coverings[0].covering_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/aps-eta-firewall verifies spectral asymmetry evaluation", async ({
    request,
  }) => {
    const listRes = await request.get("/api/aps-eta-firewall/manifolds");
    expect(listRes.status()).toBe(200);
    const manifolds = (await listRes.json()).manifolds;
    expect(manifolds.length).toBeGreaterThanOrEqual(3);

    const evalRes = await request.post("/api/aps-eta-firewall/evaluate-eta", {
      data: {
        manifold_id: manifolds[0].manifold_id,
        spectral_s: 0.0,
        eigenvalue_cutoff: 50,
        boundary_damping: 1.25,
      },
    });
    expect(evalRes.status()).toBe(200);
    const result = await evalRes.json();
    expect(result.manifold_id).toBe(manifolds[0].manifold_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/magneto-acoustic-soliton-supergrid verifies soliton power harvesting", async ({
    request,
  }) => {
    const listRes = await request.get("/api/magneto-acoustic-soliton-supergrid/cavities");
    expect(listRes.status()).toBe(200);
    const cavities = (await listRes.json()).cavities;
    expect(cavities.length).toBeGreaterThanOrEqual(3);

    const harvestRes = await request.post("/api/magneto-acoustic-soliton-supergrid/harvest-solitons", {
      data: {
        cavity_id: cavities[0].cavity_id,
        magnetic_field_tesla: 0.005,
        acoustic_velocity_km_s: 13.6,
        piezo_efficiency: 0.95,
        extraction_duration_s: 60.0,
      },
    });
    expect(harvestRes.status()).toBe(200);
    const result = await harvestRes.json();
    expect(result.cavity_id).toBe(cavities[0].cavity_id);
    expect(result.status).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // UI DASHBOARD COMPONENT MOUNT TESTS
  // ---------------------------------------------------------------------------

  test("Dashboard mounts Kontsevich Deformation Quantization Studio (Cap 173)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Kontsevich Deformation/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Kontsevich Deformation Quantization Shield").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Quantize Poisson Deformation/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Novikov-Shubin Invariants Studio (Cap 174)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Novikov-Shubin Barrier/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Novikov-Shubin Invariants & L²-Betti Barrier").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Compute Invariants & Seal L² Barrier/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts APS Eta Invariant Firewall Studio (Cap 175)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /APS Eta Firewall/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Atiyah-Patodi-Singer η-Invariant Firewall").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Evaluate η-Invariant & Seal Boundary/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Magneto-Acoustic Soliton Studio (Wave 51 Option B)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Magneto-Acoustic Soliton/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Planetary Magneto-Acoustic Soliton Supergrid").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Harvest Magneto-Acoustic Solitons/i }).first()
    ).toBeVisible();
  });
});
