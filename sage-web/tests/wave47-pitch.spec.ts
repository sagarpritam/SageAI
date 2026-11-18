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

test.describe("Wave 47 Quantum-Sovereign Architecture & Executive Pitch Deck Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("sageai_onboarding_done", "true");
    });
  });

  // ---------------------------------------------------------------------------
  // API PROXY TESTS
  // ---------------------------------------------------------------------------

  test("GET /api/deck/metrics returns institutional pitch metrics and $840K ARR pipeline", async ({
    request,
  }) => {
    const res = await request.get("/api/deck/metrics");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.pipeline_arr_usd).toBe("$840,000 ARR");
    expect(data.gross_margin_pct).toBeGreaterThanOrEqual(90);
    expect(data.enterprise_logos.length).toBe(4);
    expect(data.status).toBe("DECK_METRICS_OPTIMAL");
  });

  test("GET & POST /api/fibonacci-anyon-braiding verifies non-Abelian anyon braid transformations", async ({
    request,
  }) => {
    const listRes = await request.get("/api/fibonacci-anyon-braiding/braids");
    expect(listRes.status()).toBe(200);
    const braids = (await listRes.json()).braids;
    expect(braids.length).toBeGreaterThanOrEqual(3);

    const execRes = await request.post("/api/fibonacci-anyon-braiding/execute-braid", {
      data: {
        braid_id: braids[0].braid_id,
        generator_index: 2,
        braid_turns: 8,
        topological_order_k: 5,
        braid_gain: 1.2,
      },
    });
    expect(execRes.status()).toBe(200);
    const body = await execRes.json();
    expect(body.status).toBe("ANYON_BRAID_EXECUTED");
    expect(body.fault_tolerant_unitary).toBe(true);
    expect(body.topological_fidelity_pct).toBeGreaterThan(99.99);
  });

  test("GET & POST /api/bgg-category-o-shield verifies Verma module Kazhdan-Lusztig grading", async ({
    request,
  }) => {
    const listRes = await request.get("/api/bgg-category-o-shield/modules");
    expect(listRes.status()).toBe(200);
    const modules = (await listRes.json()).modules;
    expect(modules.length).toBeGreaterThanOrEqual(3);

    const sealRes = await request.post("/api/bgg-category-o-shield/seal-verma", {
      data: {
        module_id: modules[0].module_id,
        weyl_length: 4,
        polynomial_deg_q: 2,
        filtration_steps: 8,
        kl_amplification: 1.0,
      },
    });
    expect(sealRes.status()).toBe(200);
    const body = await sealRes.json();
    expect(body.status).toBe("VERMA_MODULE_SEALED");
    expect(body.verma_module_shielded).toBe(true);
  });

  test("GET & POST /api/cryogenic-flux-qubit verifies 15 mK Josephson phase slip clamping", async ({
    request,
  }) => {
    const listRes = await request.get("/api/cryogenic-flux-qubit/qubits");
    expect(listRes.status()).toBe(200);
    const qubits = (await listRes.json()).qubits;
    expect(qubits.length).toBeGreaterThanOrEqual(3);

    const clampRes = await request.post("/api/cryogenic-flux-qubit/clamp-phase-slip", {
      data: {
        qubit_id: qubits[0].qubit_id,
        magnetic_flux_bias_phi0: 0.5,
        microwave_attenuation_db: 60.0,
        pump_frequency_ghz: 6.45,
        superconducting_gain: 1.2,
      },
    });
    expect(clampRes.status()).toBe(200);
    const body = await clampRes.json();
    expect(body.status).toBe("PHASE_SLIP_CLAMPED");
    expect(body.quantum_phase_slip_clamped).toBe(true);
  });

  test("GET & POST /api/majorana-supergrid-power verifies 2e^2/h conductance peak energy harvesting", async ({
    request,
  }) => {
    const listRes = await request.get("/api/majorana-supergrid-power/arrays");
    expect(listRes.status()).toBe(200);
    const arrays = (await listRes.json()).arrays;
    expect(arrays.length).toBeGreaterThanOrEqual(3);

    const harvestRes = await request.post("/api/majorana-supergrid-power/harvest-majorana", {
      data: {
        array_id: arrays[0].array_id,
        zeeman_field_tesla: 1.5,
        chemical_potential_mu_mev: 0.5,
        supercurrent_bias_ma: 4.2,
        grid_gain: 1.0,
      },
    });
    expect(harvestRes.status()).toBe(200);
    const body = await harvestRes.json();
    expect(body.grid_stabilization_status).toBe("MAJORANA_ZERO_MODE_HARVESTED");
    expect(body.quantized_conductance_g0).toBe("2e^2/h");
    expect(body.harvested_power_mw).toBeGreaterThan(8000.0);
  });

  // ---------------------------------------------------------------------------
  // FRONTEND UI TESTS
  // ---------------------------------------------------------------------------

  test("Interactive Pitch Deck Studio loads and navigates through executive slides", async ({
    page,
  }) => {
    await page.goto("/pitch");

    // Slide 1: Mission & Title
    await expect(page.locator("text=SageAI Sovereign Defense")).toBeVisible({ timeout: 6000 });
    await expect(page.locator("text=CONFIDENTIAL & PROPRIETARY")).toBeVisible();
    await expect(page.locator("text=$840,000 ARR").first()).toBeVisible();

    // Click Next
    const nextBtn = page.locator('button:has-text("Next")');
    await nextBtn.click();

    // Slide 2: Market Urgency
    await expect(page.locator("text=The 2026 Perimeter Collapse")).toBeVisible();
    await expect(page.locator("text=01 / ZERO-DAY EXPLOSION")).toBeVisible();

    // Jump to Slide 4: Enterprise Pilot Traction via pill button
    const pillBtn = page.locator('button[aria-label="Jump to slide 4"]');
    await pillBtn.click();

    // Slide 4: Enterprise Accounts
    await expect(page.locator("text=Enterprise Pilot Traction")).toBeVisible();
    await expect(page.locator("text=Apex Global Securities")).toBeVisible();
    await expect(page.locator("text=Vanguard Aerospace & Defense")).toBeVisible();
  });

  test("Command Center mounts Wave 47 Fibonacci Anyon and Majorana Supergrid Studios", async ({
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

    // Verify Fibonacci Anyon tab
    const anyonTab = page.locator('button:has-text("Fibonacci Anyon (Cap 161)")');
    await expect(anyonTab).toBeVisible();
    await anyonTab.click();
    await expect(page.locator("text=Capability 161").first()).toBeVisible();

    // Verify Majorana Supergrid tab
    const majoranaTab = page.locator('button:has-text("Majorana Supergrid (Option B)")').first();
    await expect(majoranaTab).toBeVisible();
    await majoranaTab.click();
    await expect(page.locator("text=Option B Wave 47").first()).toBeVisible();
  });
});

