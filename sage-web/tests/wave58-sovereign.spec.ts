import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const MOCK_E2E_JWT =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvcGVyYXRvckBzYWdlYWkuY29tIiwiZW1haWwiOiJvcGVyYXRvckBzYWdlYWkuY29tIiwib3JnIjoib3JnLWUyZSJ9.mock_sig";

const AUTH_HEADERS = {
  Cookie: `sageai_jwt=${MOCK_E2E_JWT}`,
};

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

test.describe("Wave 58 Sovereign Architecture Suite (v9.8.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  test("GET & POST /api/faltings-almost-etale verifies almost étale descent and valuation residual", async ({
    request,
  }) => {
    const getRes = await request.get("/api/faltings-almost-etale/schemes", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.schemes.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/faltings-almost-etale/evaluate-almost-etale-descent", {
      headers: AUTH_HEADERS,
      data: {
        scheme_id: "FALTINGS-PADIC-CURVE-01",
        p_prime: 5,
        truncation_degree: 4,
        shield_gain: 1.25,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("ALMOST_ETALE_DESCENT_ENFORCED");
    expect(postData.almost_etale_verified).toBe(true);
    expect(postData.faltings_shield_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/beilinson-bernstein-localization verifies D-module localization and flag variety stability", async ({
    request,
  }) => {
    const getRes = await request.get("/api/beilinson-bernstein-localization/algebras", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.algebras.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/beilinson-bernstein-localization/evaluate-d-module-localization", {
      headers: AUTH_HEADERS,
      data: {
        variety_id: "BB-SL2-FLAG-01",
        flag_dimension: 1,
        twisted_lambda: 1.0,
        barrier_gain: 1.25,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("BEILINSON_BERNSTEIN_LOCALIZATION_LOCKED");
    expect(postData.holonomic_verified).toBe(true);
    expect(postData.beilinson_barrier_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/connes-kreimer-hopf verifies Birkhoff decomposition and antipode regularity", async ({
    request,
  }) => {
    const getRes = await request.get("/api/connes-kreimer-hopf/graphs", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.graphs.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/connes-kreimer-hopf/evaluate-birkhoff-decomposition", {
      headers: AUTH_HEADERS,
      data: {
        graph_id: "CK-PHI4-TWO-LOOP-01",
        loop_order: 2,
        dimensional_epsilon: 0.01,
        firewall_gain: 1.25,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("CONNES_KREIMER_BIRKHOFF_LOCKED");
    expect(postData.antipode_verified).toBe(true);
    expect(postData.connes_firewall_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/planetary-outer-core-tangent-cylinder-jet verifies tangent jet power harvest", async ({
    request,
  }) => {
    const getRes = await request.get("/api/planetary-outer-core-tangent-cylinder-jet/arrays", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.arrays.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/planetary-outer-core-tangent-cylinder-jet/harvest-tangent-jet-power", {
      headers: AUTH_HEADERS,
      data: {
        array_id: "TC-NORTHERN-ARCTIC-JET-01",
        jet_velocity_override_km_yr: 42.5,
        mhd_induction_efficiency: 0.95,
        dispatch_duration_s: 60.0,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("TANGENT_CYLINDER_POWER_DISPATCHED");
    expect(postData.harvested_power_gw).toBeGreaterThanOrEqual(7.0);
  });

  test("Dashboard mounts Faltings Almost Étale Studio tab", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Faltings");

    const tabBtn = page.locator('button:has-text("Faltings Almost Étale")').first();
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();

    await expect(page.getByText(/Faltings Almost Étale & Fontaine Period Ring Shield/i).first()).toBeVisible();
    await expect(page.getByText(/CAP-194/i).first()).toBeVisible();
  });

  test("Dashboard mounts Beilinson-Bernstein Studio tab", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Beilinson-Bernstein");

    const tabBtn = page.locator('button:has-text("Beilinson-Bernstein")').first();
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();

    await expect(
      page.getByText(/Beilinson-Bernstein Localization & Flag Variety D-Modules Barrier/i).first()
    ).toBeVisible();
    await expect(page.getByText(/CAP-195/i).first()).toBeVisible();
  });

  test("Dashboard mounts Connes-Kreimer Studio tab", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Connes-Kreimer");

    const tabBtn = page.locator('button:has-text("Connes-Kreimer Hopf")').first();
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();

    await expect(
      page.getByText(/Connes-Kreimer Hopf Renormalization & Rooted Trees Firewall/i).first()
    ).toBeVisible();
    await expect(page.getByText(/CAP-196/i).first()).toBeVisible();
  });

  test("Dashboard mounts Tangent Cylinder Jet Studio tab", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Tangent Cylinder");

    const tabBtn = page.locator('button:has-text("Tangent Cylinder Jet")').first();
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();

    await expect(
      page.getByText(/Planetary Outer-Core Tangent Cylinder Jet Supergrid/i).first()
    ).toBeVisible();
    await expect(page.getByText(/OPTION-B WAVE-58/i).first()).toBeVisible();
  });
});
