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

test.describe("Wave 60 Sovereign Architecture Suite (v10.0.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  test("GET & POST /api/fargues-fontaine-curve verifies vector bundles and Harder-Narasimhan filtration", async ({
    request,
  }) => {
    const getRes = await request.get("/api/fargues-fontaine-curve/bundles", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.bundles.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/fargues-fontaine-curve/evaluate-vector-bundle-slope", {
      headers: AUTH_HEADERS,
      data: {
        bundle_id: "FF-CURVE-RANK2-SLOPE0-01",
        bundle_rank: 2,
        bundle_degree: 0,
        shield_gain: 1.25,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("FARGUES_FONTAINE_SLOPE_LOCKED");
    expect(postData.harder_narasimhan_verified).toBe(true);
    expect(postData.fargues_shield_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/voevodsky-bloch-kato verifies motivic complexes and norm residue isomorphism", async ({
    request,
  }) => {
    const getRes = await request.get("/api/voevodsky-bloch-kato/complexes", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.complexes.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/voevodsky-bloch-kato/evaluate-norm-residue-isomorphism", {
      headers: AUTH_HEADERS,
      data: {
        complex_id: "VOEVODSKY-MILNOR-K3-01",
        prime_l: 2,
        weight_n: 3,
        barrier_gain: 1.25,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("VOEVODSKY_BLOCH_KATO_LOCKED");
    expect(postData.norm_residue_verified).toBe(true);
    expect(postData.voevodsky_barrier_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/donaldson-gauge-moduli verifies smooth 4-manifolds and Donaldson invariants", async ({
    request,
  }) => {
    const getRes = await request.get("/api/donaldson-gauge-moduli/manifolds", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.manifolds.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/donaldson-gauge-moduli/evaluate-donaldson-invariants", {
      headers: AUTH_HEADERS,
      data: {
        manifold_id: "DONALDSON-K3-SURFACE-01",
        second_chern_number: 2,
        b2_plus: 3,
        firewall_gain: 1.25,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("DONALDSON_GAUGE_MODULI_LOCKED");
    expect(postData.smoothness_verified).toBe(true);
    expect(postData.donaldson_firewall_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/planetary-coupled-dynasphere-resonance verifies Whole-Earth resonance and power dispatch", async ({
    request,
  }) => {
    const getRes = await request.get("/api/planetary-coupled-dynasphere-resonance/nodes", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    const getData = await getRes.json();
    expect(getData.nodes.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post(
      "/api/planetary-coupled-dynasphere-resonance/harvest-dynasphere-resonance-power",
      {
        headers: AUTH_HEADERS,
        data: {
          node_id: "DYNASPHERE-WHOLE-EARTH-RESONATOR-01",
          resonance_multiplier_override: 1.05,
          telluric_waveguide_efficiency: 0.96,
          dispatch_duration_s: 60.0,
        },
      }
    );
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("DYNASPHERE_POWER_DISPATCHED");
    expect(postData.harvested_power_gw).toBeGreaterThanOrEqual(7.5);
  });

  test("Command Center mounts and renders Fargues-Fontaine Curve Studio (Cap 200)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Fargues-Fontaine");
    const tab = page.locator('button:has-text("Fargues-Fontaine (Cap 200)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 200").first()).toBeVisible();
    await expect(page.locator("text=Harder-Narasimhan").first()).toBeVisible();
  });

  test("Command Center mounts and renders Voevodsky Bloch-Kato Studio (Cap 201)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Voevodsky Bloch-Kato");
    const tab = page.locator('button:has-text("Voevodsky Bloch-Kato (Cap 201)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 201").first()).toBeVisible();
    await expect(page.locator("text=Bloch-Kato").first()).toBeVisible();
  });

  test("Command Center mounts and renders Donaldson Gauge Moduli Studio (Cap 202)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Donaldson Moduli");
    const tab = page.locator('button:has-text("Donaldson Moduli (Cap 202)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 202").first()).toBeVisible();
    await expect(page.locator("text=Anti-self-dual").first()).toBeVisible();
  });

  test("Command Center mounts and renders Coupled Dynasphere Studio (Option B Wave 60)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Coupled Dynasphere");
    const tab = page.locator('button:has-text("Coupled Dynasphere (Option B W60)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Option B Wave 60").first()).toBeVisible();
    await expect(page.locator("text=Whole-Earth").first()).toBeVisible();
  });
});
