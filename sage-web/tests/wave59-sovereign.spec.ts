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

test.describe("Wave 59 Sovereign Architecture Suite (v9.9.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  test("GET & POST /api/scholze-perfectoid-spaces verifies tilting equivalence and almost purity", async ({
    request,
  }) => {
    const getRes = await request.get("/api/scholze-perfectoid-spaces/spaces", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.spaces.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/scholze-perfectoid-spaces/evaluate-tilting-equivalence", {
      headers: AUTH_HEADERS,
      data: {
        space_id: "SCHOLZE-PERFECTOID-BALL-01",
        prime_p: 5,
        tilt_precision: 4,
        shield_gain: 1.25,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("SCHOLZE_TILTING_EQUIVALENCE_ENFORCED");
    expect(postData.almost_purity_verified).toBe(true);
    expect(postData.scholze_shield_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/borcherds-kac-moody-moonshine verifies automorphic products and Monster symmetry", async ({
    request,
  }) => {
    const getRes = await request.get("/api/borcherds-kac-moody-moonshine/algebras", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.algebras.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/borcherds-kac-moody-moonshine/evaluate-automorphic-product", {
      headers: AUTH_HEADERS,
      data: {
        algebra_id: "BORCHERDS-MONSTER-VOA-01",
        central_charge: 24,
        q_expansion_order: 4,
        barrier_gain: 1.25,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("BORCHERDS_MOONSHINE_BARRIER_LOCKED");
    expect(postData.monster_symmetry_verified).toBe(true);
    expect(postData.borcherds_barrier_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/kontsevich-noncommutative-motives verifies noncommutative Chern character and Morita stability", async ({
    request,
  }) => {
    const getRes = await request.get("/api/kontsevich-noncommutative-motives/motives", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.motives.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/kontsevich-noncommutative-motives/evaluate-noncommutative-chern-character", {
      headers: AUTH_HEADERS,
      data: {
        motive_id: "KONTSEVICH-DG-CAT-01",
        categorical_dimension: 3,
        hochschild_degree: 2,
        firewall_gain: 1.25,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("KONTSEVICH_NC_MOTIVE_LOCKED");
    expect(postData.morita_verified).toBe(true);
    expect(postData.kontsevich_firewall_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/planetary-innermost-inner-core-anisotropy dispatches central core baseload power", async ({
    request,
  }) => {
    const getRes = await request.get("/api/planetary-innermost-inner-core-anisotropy/arrays", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.arrays.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/planetary-innermost-inner-core-anisotropy/harvest-innermost-core-power", {
      headers: AUTH_HEADERS,
      data: {
        array_id: "IMIC-EQUATORIAL-FAST-AXIS-01",
        anisotropy_factor_override: 3.2,
        piezo_coupling_efficiency: 0.95,
        dispatch_duration_s: 60.0,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("INNERMOST_CORE_POWER_DISPATCHED");
    expect(postData.harvested_power_gw).toBeGreaterThanOrEqual(7.0);
  });

  test("Dashboard mounts Scholze Perfectoid Studio tab", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Scholze");

    const tabBtn = page.locator('button:has-text("Scholze Perfectoid")').first();
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();

    await expect(page.getByText(/Scholze Perfectoid Spaces & Tilting Equivalence Shield/i).first()).toBeVisible();
    await expect(page.getByText(/CAP-197/i).first()).toBeVisible();
  });

  test("Dashboard mounts Borcherds Moonshine Studio tab", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Borcherds");

    const tabBtn = page.locator('button:has-text("Borcherds Moonshine")').first();
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();

    await expect(
      page.getByText(/Borcherds Automorphic Products & Monstrous Moonshine Barrier/i).first()
    ).toBeVisible();
    await expect(page.getByText(/CAP-198/i).first()).toBeVisible();
  });

  test("Dashboard mounts Kontsevich Motives Studio tab", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Kontsevich Motives");

    const tabBtn = page.locator('button:has-text("Kontsevich Motives")').first();
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();

    await expect(
      page.getByText(/Kontsevich Noncommutative Motives & Chern Character Firewall/i).first()
    ).toBeVisible();
    await expect(page.getByText(/CAP-199/i).first()).toBeVisible();
  });

  test("Dashboard mounts Innermost Inner Core Studio tab", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Innermost Inner Core");

    const tabBtn = page.locator('button:has-text("Innermost Inner Core")').first();
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();

    await expect(
      page.getByText(/Planetary Innermost Inner Core \(IMIC\) Anisotropic Lattice Supergrid/i).first()
    ).toBeVisible();
    await expect(page.getByText(/OPTION-B WAVE-59/i).first()).toBeVisible();
  });
});
