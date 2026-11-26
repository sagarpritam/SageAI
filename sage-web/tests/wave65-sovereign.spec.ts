import { test, expect } from "@playwright/test";

test.describe("Wave 65 Sovereign Controls (v10.5.0)", () => {
  test("GET /api/ihara-galois-braid/braids returns 3 braids", async ({ request }) => {
    const res = await request.get("/api/ihara-galois-braid/braids");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.braids.length).toBe(3);
  });

  test("POST /api/ihara-galois-braid/evaluate-profinite-braid locks monodromy", async ({ request }) => {
    const res = await request.post("/api/ihara-galois-braid/evaluate-profinite-braid", {
      data: { braid_id: "IHARA-P1-MINUS3-01", puncture_count: 3, profinite_depth: 4, shield_gain: 1.25 },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("IHARA_GALOIS_BRAID_LOCKED");
  });

  test("GET /api/shimura-taniyama-modular/curves returns 3 curves", async ({ request }) => {
    const res = await request.get("/api/shimura-taniyama-modular/curves");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.curves.length).toBe(3);
  });

  test("POST /api/shimura-taniyama-modular/evaluate-modular-parametrization locks eigenform", async ({ request }) => {
    const res = await request.post("/api/shimura-taniyama-modular/evaluate-modular-parametrization", {
      data: { curve_id: "SHIMURA-X0-11-ELLIPTIC-01", level_n: 11, q_truncation_order: 8, barrier_gain: 1.25 },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("SHIMURA_TANIYAMA_MODULAR_LOCKED");
  });

  test("GET /api/stark-regulator-values/regulators returns 3 regulators", async ({ request }) => {
    const res = await request.get("/api/stark-regulator-values/regulators");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.regulators.length).toBe(3);
  });

  test("POST /api/stark-regulator-values/evaluate-stark-regulator locks stark unit", async ({ request }) => {
    const res = await request.post("/api/stark-regulator-values/evaluate-stark-regulator", {
      data: { regulator_id: "STARK-RANK1-ABELIAN-01", vanishing_order_r: 1, class_number_h: 1, firewall_gain: 1.25 },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("STARK_REGULATOR_LOCKED");
  });

  test("GET /api/planetary-oceanic-thermohaline/currents returns 3 currents", async ({ request }) => {
    const res = await request.get("/api/planetary-oceanic-thermohaline/currents");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.currents.length).toBe(3);
  });

  test("POST /api/planetary-oceanic-thermohaline/harvest-thermohaline-power dispatches baseload", async ({ request }) => {
    const res = await request.post("/api/planetary-oceanic-thermohaline/harvest-thermohaline-power", {
      data: { current_id: "AMOC-NORTH-ATLANTIC-DEEPWATER-01", coriolis_multiplier: 1.05, lorentz_efficiency: 0.984, dispatch_duration_s: 60.0 },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("THERMOHALINE_POWER_DISPATCHED");
  });
});
