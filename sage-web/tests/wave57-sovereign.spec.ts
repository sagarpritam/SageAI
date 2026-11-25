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

test.describe("Wave 57 Sovereign Architecture Suite (v9.7.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  test("GET & POST /api/kashiwara-schapira-microlocal verifies microlocal support and involutivity", async ({
    request,
  }) => {
    const getRes = await request.get("/api/kashiwara-schapira-microlocal/sheaves", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.sheaves.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/kashiwara-schapira-microlocal/evaluate-microlocal-support", {
      headers: AUTH_HEADERS,
      data: {
        sheaf_id: "KS-COTANGENT-BUNDLE-01",
        cotangent_order: 4,
        contact_gain: 1.25,
        phase_cutoff: 1e-4,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("MICROLOCAL_SUPPORT_INVOLUTIVE_LOCKED");
    expect(postData.involutive_verified).toBe(true);
    expect(postData.ks_shield_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/macdonald-daha-polynomial verifies DAHA duality and polynomial stability", async ({
    request,
  }) => {
    const getRes = await request.get("/api/macdonald-daha-polynomial/algebras", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.algebras.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/macdonald-daha-polynomial/evaluate-macdonald-duality", {
      headers: AUTH_HEADERS,
      data: {
        algebra_id: "DAHA-GLN-ROOT-01",
        polynomial_degree: 4,
        dunkl_order: 6,
        barrier_gain: 1.25,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("MACDONALD_DAHA_DUALITY_LOCKED");
    expect(postData.duality_verified).toBe(true);
    expect(postData.daha_barrier_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/gromov-eliashberg-symplectic verifies symplectic capacity and non-squeezing", async ({
    request,
  }) => {
    const getRes = await request.get("/api/gromov-eliashberg-symplectic/manifolds", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.manifolds.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/gromov-eliashberg-symplectic/evaluate-symplectic-capacity", {
      headers: AUTH_HEADERS,
      data: {
        manifold_id: "GROMOV-CYLINDER-PHASE-01",
        ball_radius: 1.0,
        cylinder_radius: 1.0,
        firewall_gain: 1.25,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("SYMPLECTIC_NON_SQUEEZING_LOCKED");
    expect(postData.non_squeezing_verified).toBe(true);
    expect(postData.c0_rigidity_confirmed).toBe(true);
    expect(postData.eliashberg_firewall_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/planetary-f-layer-slurry-supergrid verifies slurry baseload dispatch", async ({
    request,
  }) => {
    const getRes = await request.get("/api/planetary-f-layer-slurry-supergrid/arrays", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.arrays.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/planetary-f-layer-slurry-supergrid/harvest-slurry-power", {
      headers: AUTH_HEADERS,
      data: {
        array_id: "F-LAYER-PACIFIC-SEDIMENT-01",
        sedimentation_rate_override_mm_yr: 2.5,
        magnetostrictive_efficiency: 0.95,
        dispatch_duration_s: 60.0,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("F_LAYER_POWER_DISPATCHED");
    expect(postData.harvested_power_gw).toBeGreaterThan(6.0);
    expect(postData.grid_stability_pct).toBeGreaterThanOrEqual(99.90);
  });

  test("Dashboard mounts Kashiwara-Schapira Studio tab", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Kashiwara");

    const tabBtn = page.locator('button:has-text("Kashiwara Microlocal")').first();
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();

    await expect(page.locator("text=Capability 191 • Wave 57").first()).toBeVisible();
    await expect(page.locator("text=Kashiwara-Schapira Sheaves & Microlocal Defect Shield").first()).toBeVisible();
  });

  test("Dashboard mounts Macdonald DAHA Studio tab", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Macdonald");

    const tabBtn = page.locator('button:has-text("Macdonald DAHA")').first();
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();

    await expect(page.locator("text=Capability 192 • Wave 57").first()).toBeVisible();
    await expect(page.locator("text=Macdonald Polynomials & Double Affine Hecke Algebra Barrier").first()).toBeVisible();
  });

  test("Dashboard mounts Gromov Symplectic Studio tab", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Gromov Symplectic");

    const tabBtn = page.locator('button:has-text("Gromov Symplectic")').first();
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();

    await expect(page.locator("text=Capability 193 • Wave 57").first()).toBeVisible();
    await expect(page.locator("text=Gromov-Eliashberg Symplectic Topology & Non-Squeezing Firewall").first()).toBeVisible();
  });

  test("Dashboard mounts F-Layer Slurry Supergrid Studio tab", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("F-Layer");

    const tabBtn = page.locator('button:has-text("F-Layer Slurry")').first();
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();

    await expect(page.locator("text=Option B • Wave 57 Supergrid").first()).toBeVisible();
    await expect(page.locator("text=Planetary F-Layer Slurry Stratification Supergrid").first()).toBeVisible();
  });
});
