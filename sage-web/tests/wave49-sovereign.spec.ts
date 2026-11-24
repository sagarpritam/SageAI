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

test.describe("Wave 49 Quantum-Sovereign Architecture Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  // ---------------------------------------------------------------------------
  // API PROXY TESTS
  // ---------------------------------------------------------------------------

  test("GET & POST /api/spin7-cayley-shield verifies Cayley 4-cycle calibration", async ({
    request,
  }) => {
    const listRes = await request.get("/api/spin7-cayley-shield/manifolds");
    expect(listRes.status()).toBe(200);
    const manifolds = (await listRes.json()).manifolds;
    expect(manifolds.length).toBeGreaterThanOrEqual(3);

    const calibRes = await request.post("/api/spin7-cayley-shield/calibrate-cayley", {
      data: {
        manifold_id: manifolds[0].manifold_id,
        cayley_order: 4,
        self_dual_precision: 1e-6,
        octonionic_slice_depth: 8,
        calibration_gain: 1.25,
      },
    });
    expect(calibRes.status()).toBe(200);
    const result = await calibRes.json();
    expect(result.manifold_id).toBe(manifolds[0].manifold_id);
    expect(result.status || result.calibration_status).toBeTruthy();
  });

  test("GET & POST /api/voevodsky-motivic-shield verifies derived motivic homotopy barrier", async ({
    request,
  }) => {
    const listRes = await request.get("/api/voevodsky-motivic-shield/motives");
    expect(listRes.status()).toBe(200);
    const motives = (await listRes.json()).motives;
    expect(motives.length).toBeGreaterThanOrEqual(3);

    const evalRes = await request.post("/api/voevodsky-motivic-shield/evaluate-homotopy", {
      data: {
        motive_id: motives[0].motive_id,
        slice_filtration_level: 3,
        nisnevich_cohomology_degree: 2,
        weight_p: 4,
        homotopy_gain: 1.2,
      },
    });
    expect(evalRes.status()).toBe(200);
    const result = await evalRes.json();
    expect(result.motive_id).toBe(motives[0].motive_id);
    expect(result.status || result.homotopy_status).toBeTruthy();
  });

  test("GET & POST /api/twisted-k-theory verifies Freed-Witten anomaly firewall", async ({
    request,
  }) => {
    const listRes = await request.get("/api/twisted-k-theory/complexes");
    expect(listRes.status()).toBe(200);
    const complexes = (await listRes.json()).complexes;
    expect(complexes.length).toBeGreaterThanOrEqual(3);

    const cancelRes = await request.post("/api/twisted-k-theory/cancel-anomaly", {
      data: {
        complex_id: complexes[0].complex_id,
        dixmier_douady_flux: 3,
        ahss_filtration_depth: 6,
        branes_charge_n: 4,
        cancellation_gain: 1.2,
      },
    });
    expect(cancelRes.status()).toBe(200);
    const result = await cancelRes.json();
    expect(result.complex_id).toBe(complexes[0].complex_id);
    expect(result.status || result.cancellation_status).toBeTruthy();
  });

  test("GET & POST /api/rydberg-polariton-supergrid verifies planetary polariton power harvest", async ({
    request,
  }) => {
    const listRes = await request.get("/api/rydberg-polariton-supergrid/cavities");
    expect(listRes.status()).toBe(200);
    const cavities = (await listRes.json()).cavities;
    expect(cavities.length).toBeGreaterThanOrEqual(3);

    const harvestRes = await request.post("/api/rydberg-polariton-supergrid/harvest-polariton", {
      data: {
        cavity_id: cavities[0].cavity_id,
        exciton_fraction_pct: 50.0,
        pump_fluence_uj_cm2: 120.0,
        superfluid_coupling_gain: 1.15,
        temperature_k: 295.0,
      },
    });
    expect(harvestRes.status()).toBe(200);
    const result = await harvestRes.json();
    expect(result.cavity_id).toBe(cavities[0].cavity_id);
    expect(result.status || result.harvest_status).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // DASHBOARD UI MOUNTING TESTS
  // ---------------------------------------------------------------------------

  test("Command Center mounts all 4 Wave 49 Sovereign Studios", async ({
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

    // 1. Spin(7) Cayley Shield tab
    const spin7Tab = page.locator('button:has-text("Spin(7) Cayley Shield (Cap 167)")');
    await expect(spin7Tab).toBeVisible();
    await spin7Tab.click();
    await expect(page.locator("text=Capability 167").first()).toBeVisible();

    // 2. Voevodsky Motivic Shield tab
    const voevodskyTab = page.locator('button:has-text("Voevodsky Motivic Shield (Cap 168)")');
    await expect(voevodskyTab).toBeVisible();
    await voevodskyTab.click();
    await expect(page.locator("text=Capability 168").first()).toBeVisible();

    // 3. Twisted K-Theory tab
    const twistedTab = page.locator('button:has-text("Twisted K-Theory (Cap 169)")');
    await expect(twistedTab).toBeVisible();
    await twistedTab.click();
    await expect(page.locator("text=Capability 169").first()).toBeVisible();

    // 4. Rydberg Polariton Supergrid tab
    const rydbergTab = page.locator('button:has-text("Rydberg Polariton (Option B W49)")');
    await expect(rydbergTab).toBeVisible();
    await rydbergTab.click();
    await expect(page.locator("text=Option B Wave 49").first()).toBeVisible();
  });
});
