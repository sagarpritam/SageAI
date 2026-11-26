import { test, expect } from "@playwright/test";

test.describe("Wave 67 Sovereign Controls (v10.7.0)", () => {
  test("GET /api/kato-euler-system/systems returns 3 systems", async ({ request }) => {
    const res = await request.get("/api/kato-euler-system/systems");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.systems.length).toBe(3);
  });

  test("POST /api/kato-euler-system/evaluate-euler-system locks euler system", async ({ request }) => {
    const res = await request.post("/api/kato-euler-system/evaluate-euler-system", {
      data: { system_id: "KATO-EULER-ZETA-01", prime_p: 5, weight_k: 2, shield_gain: 1.25 },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("KATO_EULER_SYSTEM_LOCKED");
  });

  test("GET /api/gross-zagier-heegner/pairings returns 3 pairings", async ({ request }) => {
    const res = await request.get("/api/gross-zagier-heegner/pairings");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.pairings.length).toBe(3);
  });

  test("POST /api/gross-zagier-heegner/evaluate-height-pairing locks heegner height", async ({ request }) => {
    const res = await request.post("/api/gross-zagier-heegner/evaluate-height-pairing", {
      data: { pairing_id: "GROSS-ZAGIER-HEEGNER-01", conductor_n: 37, analytic_rank: 1, barrier_gain: 1.25 },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("GROSS_ZAGIER_HEIGHT_LOCKED");
  });

  test("GET /api/faltings-mordell-finiteness/curves returns 3 curves", async ({ request }) => {
    const res = await request.get("/api/faltings-mordell-finiteness/curves");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.curves.length).toBe(3);
  });

  test("POST /api/faltings-mordell-finiteness/evaluate-mordell-finiteness locks finiteness", async ({ request }) => {
    const res = await request.post("/api/faltings-mordell-finiteness/evaluate-mordell-finiteness", {
      data: { curve_id: "FALTINGS-MORDELL-GENUS2-01", genus_g: 2, bad_primes_count: 3, firewall_gain: 1.25 },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("FALTINGS_MORDELL_LOCKED");
  });

  test("GET /api/planetary-mesospheric-plasma/layers returns 3 layers", async ({ request }) => {
    const res = await request.get("/api/planetary-mesospheric-plasma/layers");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.layers.length).toBe(3);
  });

  test("POST /api/planetary-mesospheric-plasma/harvest-mesospheric-power dispatches baseload", async ({ request }) => {
    const res = await request.post("/api/planetary-mesospheric-plasma/harvest-mesospheric-power", {
      data: { layer_id: "MESOPAUSE-NOCTILUCENT-01", electrojet_multiplier: 1.05, plasma_efficiency: 0.987, dispatch_duration_s: 60.0 },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("MESOSPHERIC_POWER_DISPATCHED");
  });
});
