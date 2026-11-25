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

test.describe("Wave 63 Sovereign Architecture Suite (v10.3.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  test("GET & POST /api/grothendieck-standard-conjectures verifies Chow semisimplicity", async ({
    request,
  }) => {
    const getRes = await request.get("/api/grothendieck-standard-conjectures/motives", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).motives.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post(
      "/api/grothendieck-standard-conjectures/evaluate-standard-conjectures",
      {
        headers: AUTH_HEADERS,
        data: {
          motive_id: "GROTHENDIECK-CHOW-K3-01",
          cycle_codimension: 1,
          lefschetz_degree: 2,
          shield_gain: 1.25,
        },
      }
    );
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("GROTHENDIECK_STANDARD_CONJECTURES_LOCKED");
    expect(postData.semisimple_verified).toBe(true);
    expect(postData.grothendieck_shield_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/hodge-deligne-mixed-motives verifies Griffiths transversality", async ({
    request,
  }) => {
    const getRes = await request.get("/api/hodge-deligne-mixed-motives/structures", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).structures.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/hodge-deligne-mixed-motives/evaluate-mixed-hodge", {
      headers: AUTH_HEADERS,
      data: {
        structure_id: "DELIGNE-MIXED-HODGE-01",
        weight_filtration_k: 2,
        hodge_filtration_p: 1,
        barrier_gain: 1.25,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("HODGE_DELIGNE_MIXED_LOCKED");
    expect(postData.transversality_verified).toBe(true);
    expect(postData.deligne_barrier_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/serre-tate-canonical-lift verifies Witt lift rigidity", async ({
    request,
  }) => {
    const getRes = await request.get("/api/serre-tate-canonical-lift/lifts", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).lifts.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post("/api/serre-tate-canonical-lift/evaluate-canonical-lift", {
      headers: AUTH_HEADERS,
      data: {
        lift_id: "SERRE-TATE-WITT-LIFT-01",
        prime_p: 5,
        abelian_dimension_g: 2,
        firewall_gain: 1.25,
      },
    });
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("SERRE_TATE_CANONICAL_LIFT_LOCKED");
    expect(postData.canonical_lift_verified).toBe(true);
    expect(postData.serre_tate_firewall_strength_pev).toBeGreaterThan(500.0);
  });

  test("GET & POST /api/planetary-telluric-schumann-cavity verifies 8.800 GW dispatch", async ({
    request,
  }) => {
    const getRes = await request.get("/api/planetary-telluric-schumann-cavity/cavities", {
      headers: AUTH_HEADERS,
    });
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).cavities.length).toBeGreaterThanOrEqual(3);

    const postRes = await request.post(
      "/api/planetary-telluric-schumann-cavity/harvest-schumann-cavity-power",
      {
        headers: AUTH_HEADERS,
        data: {
          cavity_id: "SCHUMANN-FUNDAMENTAL-783HZ-01",
          q_factor_multiplier: 1.05,
          waveguide_efficiency: 0.98,
          dispatch_duration_s: 60.0,
        },
      }
    );
    expect(postRes.status()).toBe(200);
    const postData = await postRes.json();
    expect(postData.status).toBe("SCHUMANN_CAVITY_POWER_DISPATCHED");
    expect(postData.harvested_power_gw).toBeGreaterThanOrEqual(8.5);
  });

  test("Command Center mounts and renders Grothendieck Cycles Studio (Cap 209)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Grothendieck Cycles");
    const tab = page.locator('button:has-text("Grothendieck Cycles (Cap 209)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 209").first()).toBeVisible();
    await expect(page.locator("text=Lefschetz").first()).toBeVisible();
  });

  test("Command Center mounts and renders Hodge-Deligne Studio (Cap 210)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Hodge-Deligne");
    const tab = page.locator('button:has-text("Hodge-Deligne (Cap 210)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 210").first()).toBeVisible();
    await expect(page.locator("text=Griffiths").first()).toBeVisible();
  });

  test("Command Center mounts and renders Serre-Tate Lift Studio (Cap 211)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Serre-Tate Lift");
    const tab = page.locator('button:has-text("Serre-Tate Lift (Cap 211)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Capability 211").first()).toBeVisible();
    await expect(page.locator("text=Witt-vector").first()).toBeVisible();
  });

  test("Command Center mounts and renders Schumann Cavity Studio (Option B Wave 63)", async ({
    context,
    page,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Search"][placeholder*="modules..."]');
    await searchInput.fill("Schumann Cavity");
    const tab = page.locator('button:has-text("Schumann Cavity (Option B W63)")');
    await expect(tab).toBeVisible();
    await tab.click();

    await expect(page.locator("text=Option B Wave 63").first()).toBeVisible();
    await expect(page.locator("text=7.83 Hz").first()).toBeVisible();
  });
});
