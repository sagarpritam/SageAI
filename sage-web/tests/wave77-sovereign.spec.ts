import { test, expect } from "@playwright/test";

test.describe("Wave 77 Sovereign Affine-Moonshine & Plasmapause Supergrid Proxies", () => {
  test("GET /api/kac-moody-affine/algebras returns Kac-Moody algebras", async ({ request }) => {
    const res = await request.get("/api/kac-moody-affine/algebras");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.algebras)).toBe(true);
    expect(data.algebras.length).toBeGreaterThanOrEqual(3);
  });

  test("POST /api/kac-moody-affine/evaluate-kac-moody locks Weyl-Kac character", async ({ request }) => {
    const res = await request.post("/api/kac-moody-affine/evaluate-kac-moody", {
      data: {
        algebra_id: "KAC-MOODY-AFFINE-01",
        central_level_k: 2,
        imaginary_root_mult: 4,
        shield_gain: 1.25,
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("KAC_MOODY_AFFINE_LOCKED");
    expect(data.weyl_kac_character_verified).toBe(true);
  });

  test("GET /api/frenkel-voa-chiral/algebras returns Vertex Operator Algebras", async ({ request }) => {
    const res = await request.get("/api/frenkel-voa-chiral/algebras");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.algebras)).toBe(true);
    expect(data.algebras.length).toBeGreaterThanOrEqual(3);
  });

  test("POST /api/frenkel-voa-chiral/evaluate-voa-chiral verifies Borcherds identity", async ({ request }) => {
    const res = await request.post("/api/frenkel-voa-chiral/evaluate-voa-chiral", {
      data: {
        voa_id: "FRENKEL-VOA-CHIRAL-01",
        central_charge_c: 24,
        zhu_rank: 4,
        barrier_gain: 1.25,
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("FRENKEL_VOA_CHIRAL_LOCKED");
    expect(data.borcherds_identity_verified).toBe(true);
  });

  test("GET /api/borcherds-moonshine/algebras returns Moonshine modules", async ({ request }) => {
    const res = await request.get("/api/borcherds-moonshine/algebras");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.algebras)).toBe(true);
    expect(data.algebras.length).toBeGreaterThanOrEqual(3);
  });

  test("POST /api/borcherds-moonshine/evaluate-borcherds-moonshine locks Hauptmodul j", async ({ request }) => {
    const res = await request.post("/api/borcherds-moonshine/evaluate-borcherds-moonshine", {
      data: {
        moonshine_id: "BORCHERDS-MONSTER-VOA-01",
        denominator_rank: 2,
        hauptmodul_order: 1,
        firewall_gain: 1.25,
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("BORCHERDS_MOONSHINE_LOCKED");
    expect(data.hauptmodul_j_verified).toBe(true);
  });

  test("GET /api/planetary-plasmapause/waveguides returns Plasmapause waveguides", async ({ request }) => {
    const res = await request.get("/api/planetary-plasmapause/waveguides");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.waveguides)).toBe(true);
    expect(data.waveguides.length).toBeGreaterThanOrEqual(3);
  });

  test("POST /api/planetary-plasmapause/harvest-plasmapause-power dispatches supergrid power", async ({ request }) => {
    const res = await request.post("/api/planetary-plasmapause/harvest-plasmapause-power", {
      data: {
        waveguide_id: "PLASMAPAUSE-CHORUS-01",
        whistler_multiplier: 1.05,
        waveguide_efficiency: 0.996,
        dispatch_duration_s: 60.0,
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("PLASMAPAUSE_POWER_DISPATCHED");
    expect(data.whistler_coupling_state).toBe("PLASMAPAUSE_WHISTLER_LOCKED");
    expect(data.harvested_power_gw).toBeGreaterThan(0);
  });
});
