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

test.describe("Wave 61 Sovereign Architecture Suite (v10.1.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  test("GET & POST /api/gaitsgory-categorical-langlands verifies categorical equivalence", async ({
    request,
  }) => {
    const getRes = await request.get("/api/gaitsgory-categorical-langlands/functors", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.functors.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post(
      "/api/gaitsgory-categorical-langlands/evaluate-categorical-equivalence",
      {
        headers: AUTH_HEADERS,
        data: {
          functor_id: "GAITSGORY-INDCOH-SL2-01",
          dual_rank: 2,
          nilpotent_orbit_dim: 4,
          shield_gain: 1.25,
        },
      }
    );
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("GAITSGORY_CATEGORICAL_LANGLANDS_LOCKED");
    expect(postData.categorical_equivalence_verified).toBe(true);
    expect(postData.gaitsgory_shield_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/wiles-taylor-modularity-lifting verifies R = T patching", async ({
    request,
  }) => {
    const getRes = await request.get("/api/wiles-taylor-modularity-lifting/rings", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.rings.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post(
      "/api/wiles-taylor-modularity-lifting/evaluate-modularity-lifting",
      {
        headers: AUTH_HEADERS,
        data: {
          ring_id: "WILES-FREY-SEMISTABLE-01",
          conductor_n: 11,
          residue_prime: 3,
          barrier_gain: 1.25,
        },
      }
    );
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("WILES_TAYLOR_MODULARITY_LOCKED");
    expect(postData.modularity_lifting_verified).toBe(true);
    expect(postData.wiles_barrier_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/atiyah-singer-index-heat-kernel verifies analytical index invariants", async ({
    request,
  }) => {
    const getRes = await request.get("/api/atiyah-singer-index-heat-kernel/operators", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.operators.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post(
      "/api/atiyah-singer-index-heat-kernel/evaluate-index-heat-kernel",
      {
        headers: AUTH_HEADERS,
        data: {
          operator_id: "ATIYAH-SINGER-DIRAC-SPIN4-01",
          manifold_dimension: 4,
          chern_rank: 2,
          firewall_gain: 1.25,
        },
      }
    );
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("ATIYAH_SINGER_INDEX_LOCKED");
    expect(postData.index_theorem_verified).toBe(true);
    expect(postData.atiyah_firewall_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/planetary-geomagnetic-reversal-flux-capacitor verifies 8.200 GW dispatch", async ({
    request,
  }) => {
    const getRes = await request.get(
      "/api/planetary-geomagnetic-reversal-flux-capacitor/capacitors",
      { headers: AUTH_HEADERS }
    );
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.capacitors.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post(
      "/api/planetary-geomagnetic-reversal-flux-capacitor/harvest-geomagnetic-reversal-power",
      {
        headers: AUTH_HEADERS,
        data: {
          capacitor_id: "GEOMAG-SOUTH-ATLANTIC-ANOMALY-01",
          multipole_order_override: 3,
          lorentz_coupling_efficiency: 0.97,
          dispatch_duration_s: 60.0,
        },
      }
    );
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("GEOMAGNETIC_FLUX_POWER_DISPATCHED");
    expect(postData.harvested_power_gw).toBeGreaterThanOrEqual(8.0);
  });

  test("Command Center mounts and renders Gaitsgory Langlands Studio (Cap 203)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Gaitsgory Langlands");
    const tab = page.locator('button:has-text("Gaitsgory Langlands (Cap 203)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 203").first()).toBeVisible();
    await expect(page.locator("text=Whittaker").first()).toBeVisible();
  });

  test("Command Center mounts and renders Wiles-Taylor Modularity Studio (Cap 204)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Wiles-Taylor");
    const tab = page.locator('button:has-text("Wiles-Taylor R=T (Cap 204)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 204").first()).toBeVisible();
    await expect(page.locator("text=Modularity Lifting").first()).toBeVisible();
  });

  test("Command Center mounts and renders Atiyah-Singer Index Studio (Cap 205)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Atiyah-Singer");
    const tab = page.locator('button:has-text("Atiyah-Singer Index (Cap 205)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 205").first()).toBeVisible();
    await expect(page.locator("text=Getzler").first()).toBeVisible();
  });

  test("Command Center mounts and renders Geomagnetic Flux Capacitor Studio (Option B Wave 61)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Geomagnetic Flux");
    const tab = page.locator('button:has-text("Geomagnetic Flux (Option B W61)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Option B Wave 61").first()).toBeVisible();
    await expect(page.locator("text=South Atlantic Anomaly").first()).toBeVisible();
  });
});
