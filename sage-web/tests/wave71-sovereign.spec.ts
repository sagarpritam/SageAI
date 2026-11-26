import { test, expect } from "@playwright/test";

test.describe("Wave 71 Sovereign Quantum-Algebraic & Ring-Current Supergrid Proxies", () => {
  test("GET /api/nakajima-quiver-yangian/quivers returns Nakajima quiver varieties", async ({ request }) => {
    const res = await request.get("/api/nakajima-quiver-yangian/quivers");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.quivers)).toBe(true);
    expect(data.quivers.length).toBeGreaterThanOrEqual(3);
  });

  test("POST /api/nakajima-quiver-yangian/evaluate-quiver-yangian locks stable envelope", async ({ request }) => {
    const res = await request.post("/api/nakajima-quiver-yangian/evaluate-quiver-yangian", {
      data: {
        quiver_id: "NAKAJIMA-QUIVER-ADE-01",
        framing_rank: 2,
        equivariant_weight: 3,
        shield_gain: 1.25,
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("NAKAJIMA_QUIVER_LOCKED");
    expect(data.stable_envelope_verified).toBe(true);
  });

  test("GET /api/pandharipande-thomas-bps/pairs returns stable pair invariants", async ({ request }) => {
    const res = await request.get("/api/pandharipande-thomas-bps/pairs");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.pairs)).toBe(true);
    expect(data.pairs.length).toBeGreaterThanOrEqual(3);
  });

  test("POST /api/pandharipande-thomas-bps/evaluate-pt-bps verifies GV integrality", async ({ request }) => {
    const res = await request.post("/api/pandharipande-thomas-bps/evaluate-pt-bps", {
      data: {
        pair_id: "PT-STABLE-PAIR-CY3-01",
        euler_char: 1,
        curve_degree: 2,
        barrier_gain: 1.25,
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("PT_BPS_LOCKED");
    expect(data.gv_integrality_verified).toBe(true);
  });

  test("GET /api/joyce-song-hall/invariants returns Hall algebra channels", async ({ request }) => {
    const res = await request.get("/api/joyce-song-hall/invariants");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.invariants)).toBe(true);
    expect(data.invariants.length).toBeGreaterThanOrEqual(3);
  });

  test("POST /api/joyce-song-hall/evaluate-joyce-song locks motivic DT firewall", async ({ request }) => {
    const res = await request.post("/api/joyce-song-hall/evaluate-joyce-song", {
      data: {
        invariant_id: "JOYCE-SONG-HALL-ALGEBRA-01",
        chern_rank: 2,
        behrend_weight: 1,
        firewall_gain: 1.25,
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("JOYCE_SONG_HALL_LOCKED");
    expect(data.hall_identity_verified).toBe(true);
  });

  test("GET /api/planetary-ring-current/tori returns Ring-Current Alfvén tori", async ({ request }) => {
    const res = await request.get("/api/planetary-ring-current/tori");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.tori)).toBe(true);
    expect(data.tori.length).toBeGreaterThanOrEqual(3);
  });

  test("POST /api/planetary-ring-current/harvest-ring-current-power dispatches supergrid power", async ({ request }) => {
    const res = await request.post("/api/planetary-ring-current/harvest-ring-current-power", {
      data: {
        torus_id: "RING-CURRENT-TORUS-01",
        alfven_multiplier: 1.05,
        alfven_efficiency: 0.991,
        dispatch_duration_s: 60.0,
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("RING_CURRENT_POWER_DISPATCHED");
    expect(data.alfven_coupling_state).toBe("RING_CURRENT_ALFVEN_LOCKED");
    expect(data.harvested_power_gw).toBeGreaterThan(0);
  });
});
