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

test.describe("Wave 64 Sovereign Architecture Suite (v10.4.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  test("GET & POST /api/tate-shafarevich-selmer verifies Selmer descent", async ({ request }) => {
    const getRes = await request.get("/api/tate-shafarevich-selmer/curves", { headers: AUTH_HEADERS });
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).curves.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/tate-shafarevich-selmer/evaluate-selmer-descent", {
      headers: AUTH_HEADERS,
      data: { curve_id: "SHA-BSD-RANK1-01", selmer_rank: 1, sha_order: 1, shield_gain: 1.25 },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("TATE_SHAFAREVICH_SELMER_LOCKED");
    expect(postData.descent_verified).toBe(true);
    expect(postData.tate_shield_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/bloch-kato-tamagawa verifies Tamagawa invariants", async ({ request }) => {
    const getRes = await request.get("/api/bloch-kato-tamagawa/systems", { headers: AUTH_HEADERS });
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).systems.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/bloch-kato-tamagawa/evaluate-tamagawa-number", {
      headers: AUTH_HEADERS,
      data: { system_id: "TAMAGAWA-CYCLOTOMIC-Z-01", motive_weight: 2, tamagawa_product: 1, barrier_gain: 1.25 },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("BLOCH_KATO_TAMAGAWA_LOCKED");
    expect(postData.tamagawa_verified).toBe(true);
    expect(postData.tamagawa_barrier_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/fontaine-mazur-geometricity verifies de Rham geometricity", async ({ request }) => {
    const getRes = await request.get("/api/fontaine-mazur-geometricity/representations", { headers: AUTH_HEADERS });
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).representations.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/fontaine-mazur-geometricity/evaluate-galois-geometricity", {
      headers: AUTH_HEADERS,
      data: { rep_id: "FONTAINE-MAZUR-GL2-DE-RHAM-01", prime_p: 5, hodge_tate_span: 2, firewall_gain: 1.25 },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("FONTAINE_MAZUR_GEOMETRIC_LOCKED");
    expect(postData.geometric_verified).toBe(true);
    expect(postData.fontaine_firewall_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/planetary-piezoelectric-tectonic-subduction verifies 9.200 GW dispatch", async ({
    request,
  }) => {
    const getRes = await request.get("/api/planetary-piezoelectric-tectonic-subduction/slabs", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).slabs.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post(
      "/api/planetary-piezoelectric-tectonic-subduction/harvest-tectonic-piezo-power",
      {
        headers: AUTH_HEADERS,
        data: {
          slab_id: "SUBDUCTION-CASCADIA-MEGATHRUST-01",
          strain_multiplier: 1.05,
          piezo_efficiency: 0.982,
          dispatch_duration_s: 60.0,
        },
      }
    );
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("TECTONIC_PIEZO_POWER_DISPATCHED");
    expect(postData.harvested_power_gw).toBeGreaterThanOrEqual(9.0);
  });

  test("Command Center mounts and renders Tate-Shafarevich Studio (Cap 212)", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Tate-Shafarevich");
    const tab = page.locator('button:has-text("Tate-Shafarevich (Cap 212)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 212").first()).toBeVisible();
    await expect(page.locator("text=Selmer").first()).toBeVisible();
  });

  test("Command Center mounts and renders Bloch-Kato Tamagawa Studio (Cap 213)", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Bloch-Kato Tamagawa");
    const tab = page.locator('button:has-text("Bloch-Kato Tamagawa (Cap 213)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 213").first()).toBeVisible();
    await expect(page.locator("text=Tamagawa").first()).toBeVisible();
  });

  test("Command Center mounts and renders Fontaine-Mazur Studio (Cap 214)", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Fontaine-Mazur");
    const tab = page.locator('button:has-text("Fontaine-Mazur (Cap 214)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 214").first()).toBeVisible();
    await expect(page.locator("text=de Rham").first()).toBeVisible();
  });

  test("Command Center mounts and renders Piezo Subduction Studio (Option B Wave 64)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Piezo Subduction");
    const tab = page.locator('button:has-text("Piezo Subduction (Option B W64)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Option B Wave 64").first()).toBeVisible();
    await expect(page.locator("text=9.200 GW").first()).toBeVisible();
  });
});
