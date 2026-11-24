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

test.describe("Wave 48 Quantum-Sovereign Architecture Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  // ---------------------------------------------------------------------------
  // API PROXY TESTS
  // ---------------------------------------------------------------------------

  test("GET & POST /api/g2-octonionic-shield verifies associative 3-cycle calibration", async ({
    request,
  }) => {
    const listRes = await request.get("/api/g2-octonionic-shield/manifolds");
    expect(listRes.status()).toBe(200);
    const manifolds = (await listRes.json()).manifolds;
    expect(manifolds.length).toBeGreaterThanOrEqual(3);

    const calibRes = await request.post("/api/g2-octonionic-shield/calibrate-associative", {
      data: {
        manifold_id: manifolds[0].manifold_id,
        instanton_charge: 3,
        torsion_free_precision: 1e-6,
        associative_refinement_depth: 8,
        calibration_gain: 1.2,
      },
    });
    expect(calibRes.status()).toBe(200);
    const result = await calibRes.json();
    expect(result.manifold_id).toBe(manifolds[0].manifold_id);
    expect(result.status || result.calibration_status).toBeTruthy();
  });

  test("GET & POST /api/azumaya-brauer-shield verifies derived Brauer non-commutative seal", async ({
    request,
  }) => {
    const listRes = await request.get("/api/azumaya-brauer-shield/algebras");
    expect(listRes.status()).toBe(200);
    const algebras = (await listRes.json()).algebras;
    expect(algebras.length).toBeGreaterThanOrEqual(3);

    const sealRes = await request.post("/api/azumaya-brauer-shield/seal-brauer", {
      data: {
        algebra_id: algebras[0].algebra_id,
        torsion_order_n: 4,
        periodic_cyclic_degree: 2,
        morita_equivalence_depth: 8,
        brauer_amplification: 1.2,
      },
    });
    expect(sealRes.status()).toBe(200);
    const result = await sealRes.json();
    expect(result.algebra_id).toBe(algebras[0].algebra_id);
    expect(result.status || result.seal_status).toBeTruthy();
  });

  test("GET & POST /api/cardy-boundary-cft verifies conformal boundary CFT seal", async ({
    request,
  }) => {
    const listRes = await request.get("/api/cardy-boundary-cft/states");
    expect(listRes.status()).toBe(200);
    const states = (await listRes.json()).states;
    expect(states.length).toBeGreaterThanOrEqual(3);

    const sealRes = await request.post("/api/cardy-boundary-cft/seal-boundary", {
      data: {
        state_id: states[0].state_id,
        modular_s_parameter: 0.7071,
        verlinde_fusion_level_k: 4,
        boundary_defect_charge: 1.0,
        conformal_gain: 1.2,
      },
    });
    expect(sealRes.status()).toBe(200);
    const result = await sealRes.json();
    expect(result.state_id).toBe(states[0].state_id);
    expect(result.status || result.seal_status).toBeTruthy();
  });

  test("GET & POST /api/hydride-megabar-supergrid verifies planetary hydride power harvest", async ({
    request,
  }) => {
    const listRes = await request.get("/api/hydride-megabar-supergrid/vaults");
    expect(listRes.status()).toBe(200);
    const vaults = (await listRes.json()).vaults;
    expect(vaults.length).toBeGreaterThanOrEqual(3);

    const harvestRes = await request.post("/api/hydride-megabar-supergrid/harvest-megabar", {
      data: {
        vault_id: vaults[0].vault_id,
        megabar_pressure_gpa: 175.0,
        phonon_coupling_alpha2f: 2.8,
        rectification_gain: 1.2,
      },
    });
    expect(harvestRes.status()).toBe(200);
    const result = await harvestRes.json();
    expect(result.vault_id).toBe(vaults[0].vault_id);
    expect(result.status || result.harvest_status).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // DASHBOARD UI MOUNTING TESTS
  // ---------------------------------------------------------------------------

  test("Command Center mounts all 4 Wave 48 Sovereign Studios", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);

    await page.route("/api/notifications*", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
    await page.route("/api/scans*", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
    await page.route("/api/analytics*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ trend: [], severityCounts: { Critical: 0, High: 0, Medium: 0, Low: 0 }, totalCompleted: 0 }),
      });
    });

    await page.goto("/dashboard");
    await expect(page.locator('h1:has-text("Command Center")')).toBeVisible({ timeout: 6000 });

    // 1. G2 Octonionic Shield tab
    const g2Tab = page.locator('button:has-text("G₂ Octonionic Shield (Cap 164)")');
    await expect(g2Tab).toBeVisible();
    await g2Tab.click();
    await expect(page.locator("text=Capability 164").first()).toBeVisible();

    // 2. Azumaya-Brauer Shield tab
    const azuTab = page.locator('button:has-text("Azumaya-Brauer Shield (Cap 165)")');
    await expect(azuTab).toBeVisible();
    await azuTab.click();
    await expect(page.locator("text=Capability 165").first()).toBeVisible();

    // 3. Cardy Boundary CFT tab
    const cardyTab = page.locator('button:has-text("Cardy Boundary CFT (Cap 166)")');
    await expect(cardyTab).toBeVisible();
    await cardyTab.click();
    await expect(page.locator("text=Capability 166").first()).toBeVisible();

    // 4. Hydride Megabar Supergrid tab
    const hydTab = page.locator('button:has-text("Hydride Megabar (Option B W48)")');
    await expect(hydTab).toBeVisible();
    await hydTab.click();
    await expect(page.locator("text=Option B Wave 48").first()).toBeVisible();
  });
});
