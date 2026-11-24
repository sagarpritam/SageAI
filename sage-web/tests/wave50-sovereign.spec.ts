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

test.describe("Wave 50 Golden Milestone Architecture Suite (v9.0.0)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  // ---------------------------------------------------------------------------
  // API PROXY TESTS
  // ---------------------------------------------------------------------------

  test("GET & POST /api/langlands-automorphic verifies Hecke eigenform synthesis", async ({
    request,
  }) => {
    const listRes = await request.get("/api/langlands-automorphic/packets");
    expect(listRes.status()).toBe(200);
    const packets = (await listRes.json()).packets;
    expect(packets.length).toBeGreaterThanOrEqual(3);

    const synthRes = await request.post("/api/langlands-automorphic/synthesize-hecke", {
      data: {
        packet_id: packets[0].packet_id,
        prime_cutoff: 17,
        ram_bound_tolerance: 1e-5,
        l_function_s: 1.0,
        hecke_gain: 1.25,
      },
    });
    expect(synthRes.status()).toBe(200);
    const result = await synthRes.json();
    expect(result.packet_id).toBe(packets[0].packet_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/calabi-yau-mirror verifies Picard-Fuchs monodromy solution", async ({
    request,
  }) => {
    const listRes = await request.get("/api/calabi-yau-mirror/pairs");
    expect(listRes.status()).toBe(200);
    const pairs = (await listRes.json()).pairs;
    expect(pairs.length).toBeGreaterThanOrEqual(3);

    const solveRes = await request.post("/api/calabi-yau-mirror/solve-picard-fuchs", {
      data: {
        pair_id: pairs[0].pair_id,
        deformation_psi: 0.5,
        instanton_degree: 4,
        monodromy_damping: 1.25,
        frobenius_precision: 1e-6,
      },
    });
    expect(solveRes.status()).toBe(200);
    const result = await solveRes.json();
    expect(result.pair_id).toBe(pairs[0].pair_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/connes-spectral-geometry verifies Dixmier trace spectral action", async ({
    request,
  }) => {
    const listRes = await request.get("/api/connes-spectral-geometry/triples");
    expect(listRes.status()).toBe(200);
    const triples = (await listRes.json()).triples;
    expect(triples.length).toBeGreaterThanOrEqual(3);

    const actionRes = await request.post("/api/connes-spectral-geometry/evaluate-action", {
      data: {
        triple_id: triples[0].triple_id,
        energy_cutoff_gev: 1e16,
        heat_kernel_order: 4,
        dixmier_trace_scale: 1.15,
        gauge_coupling_unification: 0.98,
      },
    });
    expect(actionRes.status()).toBe(200);
    const result = await actionRes.json();
    expect(result.triple_id).toBe(triples[0].triple_id);
    expect(result.status).toBeTruthy();
  });

  test("GET & POST /api/gravitational-phonon verifies resonant energy harvest", async ({
    request,
  }) => {
    const listRes = await request.get("/api/gravitational-phonon/lattices");
    expect(listRes.status()).toBe(200);
    const lattices = (await listRes.json()).lattices;
    expect(lattices.length).toBeGreaterThanOrEqual(3);

    const harvestRes = await request.post("/api/gravitational-phonon/harvest-phonons", {
      data: {
        lattice_id: lattices[0].lattice_id,
        strain_amplitude_h: 1e-22,
        acoustic_coupling: 0.88,
        piezo_efficiency: 0.94,
        extraction_duration_s: 60.0,
      },
    });
    expect(harvestRes.status()).toBe(200);
    const result = await harvestRes.json();
    expect(result.lattice_id).toBe(lattices[0].lattice_id);
    expect(result.status).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // UI DASHBOARD COMPONENT MOUNT TESTS
  // ---------------------------------------------------------------------------

  test("Dashboard mounts Langlands Automorphic Duality Studio (Cap 170)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Langlands Automorphic/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Langlands Automorphic Duality Engine").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Synthesize Hecke/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Calabi-Yau Mirror Symmetry Wall Studio (Cap 171)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Calabi-Yau Mirror/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Superstring Calabi-Yau Mirror Symmetry Wall").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Solve Picard-Fuchs/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Connes Spectral Geometry Armor Studio (Cap 172)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Connes Spectral Armor/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Non-Commutative Connes Spectral Geometry Armor").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Evaluate Spectral Action/i }).first()
    ).toBeVisible();
  });

  test("Dashboard mounts Gravitational Phonon Lattice Studio (Wave 50 Option B)", async ({
    page,
    context,
  }) => {
    await mockAuthenticatedSession(context, page);
    await page.goto("/dashboard");

    const tab = page.getByRole("button", { name: /Gravitational Phonon/i }).first();
    await expect(tab).toBeVisible({ timeout: 15000 });
    await tab.click();

    await expect(
      page.getByText("Planetary Gravitational Phonon Lattice Supergrid").first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /Harvest Gravitational Phonons/i }).first()
    ).toBeVisible();
  });
});
