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

test.describe("Wave 62 Sovereign Architecture Suite (v10.2.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  test("GET & POST /api/hirzebruch-riemann-roch verifies HRR Todd genus", async ({ request }) => {
    const getRes = await request.get("/api/hirzebruch-riemann-roch/sheaves", { headers: AUTH_HEADERS });
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).sheaves.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/hirzebruch-riemann-roch/evaluate-hrr-todd-genus", {
      headers: AUTH_HEADERS,
      data: { sheaf_id: "HIRZEBRUCH-K3-TODD-01", complex_dimension: 2, bundle_rank: 3, shield_gain: 1.25 },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("HIRZEBRUCH_HRR_TODD_LOCKED");
    expect(postData.todd_genus_verified).toBe(true);
    expect(postData.hirzebruch_shield_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/weil-conjectures-purity verifies Frobenius purity", async ({ request }) => {
    const getRes = await request.get("/api/weil-conjectures-purity/varieties", { headers: AUTH_HEADERS });
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).varieties.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/weil-conjectures-purity/evaluate-frobenius-purity", {
      headers: AUTH_HEADERS,
      data: { variety_id: "WEIL-ELLIPTIC-CURVE-FQ-01", finite_field_q: 7, cohomology_weight_w: 1, barrier_gain: 1.25 },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("WEIL_FROBENIUS_PURITY_LOCKED");
    expect(postData.frobenius_purity_verified).toBe(true);
    expect(postData.weil_barrier_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/kontsevich-cyclic-homotopy verifies HKR formality", async ({ request }) => {
    const getRes = await request.get("/api/kontsevich-cyclic-homotopy/algebras", { headers: AUTH_HEADERS });
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).algebras.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/kontsevich-cyclic-homotopy/evaluate-cyclic-formality", {
      headers: AUTH_HEADERS,
      data: { algebra_id: "CYCLIC-AINFINITY-HKR-01", arity_m_k: 3, cyclic_degree: 2, firewall_gain: 1.25 },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("CYCLIC_HOMOTOPY_FORMALITY_LOCKED");
    expect(postData.hkr_formality_verified).toBe(true);
    expect(postData.cyclic_firewall_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/planetary-birkeland-auroral-electrojet verifies 8.400 GW dispatch", async ({
    request,
  }) => {
    const getRes = await request.get("/api/planetary-birkeland-auroral-electrojet/electrojets", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).electrojets.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post(
      "/api/planetary-birkeland-auroral-electrojet/harvest-birkeland-electrojet-power",
      {
        headers: AUTH_HEADERS,
        data: {
          electrojet_id: "BIRKELAND-REGION1-AURORAL-OVAL-01",
          current_multiplier_override: 1.05,
          tether_efficiency: 0.975,
          dispatch_duration_s: 60.0,
        },
      }
    );
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("BIRKELAND_ELECTROJET_POWER_DISPATCHED");
    expect(postData.harvested_power_gw).toBeGreaterThanOrEqual(8.0);
  });

  test("Command Center mounts and renders Hirzebruch HRR Studio (Cap 206)", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Hirzebruch HRR");
    const tab = page.locator('button:has-text("Hirzebruch HRR (Cap 206)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 206").first()).toBeVisible();
    await expect(page.locator("text=Todd").first()).toBeVisible();
  });

  test("Command Center mounts and renders Weil Purity Studio (Cap 207)", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Weil Purity");
    const tab = page.locator('button:has-text("Weil Purity (Cap 207)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 207").first()).toBeVisible();
    await expect(page.locator("text=Frobenius").first()).toBeVisible();
  });

  test("Command Center mounts and renders Cyclic Homotopy Studio (Cap 208)", async ({ context, page }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Cyclic Homotopy");
    const tab = page.locator('button:has-text("Cyclic Homotopy (Cap 208)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 208").first()).toBeVisible();
    await expect(page.locator("text=HKR").first()).toBeVisible();
  });

  test("Command Center mounts and renders Birkeland Electrojet Studio (Option B Wave 62)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Birkeland Electrojet");
    const tab = page.locator('button:has-text("Birkeland Electrojet (Option B W62)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Option B Wave 62").first()).toBeVisible();
    await expect(page.locator("text=Region-1").first()).toBeVisible();
  });
});
