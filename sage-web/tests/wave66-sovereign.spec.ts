import { test, expect } from "@playwright/test";

test.describe("Wave 66 Sovereign Controls (v10.6.0)", () => {
  test("GET /api/mazur-eisenstein-torsion/curves returns 3 curves", async ({ request }) => {
    const res = await request.get("/api/mazur-eisenstein-torsion/curves");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.curves.length).toBe(3);
  });

  test("POST /api/mazur-eisenstein-torsion/evaluate-eisenstein-torsion locks torsion", async ({ request }) => {
    const res = await request.post("/api/mazur-eisenstein-torsion/evaluate-eisenstein-torsion", {
      data: { curve_id: "MAZUR-EISENSTEIN-X0-11-01", prime_n: 11, torsion_order: 5, shield_gain: 1.25 },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("MAZUR_EISENSTEIN_TORSION_LOCKED");
  });

  test("GET /api/ribet-level-lowering/forms returns 3 forms", async ({ request }) => {
    const res = await request.get("/api/ribet-level-lowering/forms");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.forms.length).toBe(3);
  });

  test("POST /api/ribet-level-lowering/evaluate-level-lowering locks level", async ({ request }) => {
    const res = await request.post("/api/ribet-level-lowering/evaluate-level-lowering", {
      data: { form_id: "RIBET-LEVEL-LOWER-P5-01", residual_prime_p: 5, serre_weight_k: 2, barrier_gain: 1.25 },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("RIBET_LEVEL_LOWERING_LOCKED");
  });

  test("GET /api/iwasawa-main-conjecture/extensions returns 3 extensions", async ({ request }) => {
    const res = await request.get("/api/iwasawa-main-conjecture/extensions");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.extensions.length).toBe(3);
  });

  test("POST /api/iwasawa-main-conjecture/evaluate-iwasawa-ideal locks ideal", async ({ request }) => {
    const res = await request.post("/api/iwasawa-main-conjecture/evaluate-iwasawa-ideal", {
      data: { extension_id: "IWASAWA-ZP-CYCLOTOMIC-01", prime_p: 5, lambda_invariant: 1, firewall_gain: 1.25 },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("IWASAWA_MAIN_CONJECTURE_LOCKED");
  });

  test("GET /api/planetary-stratospheric-jetstream/streams returns 3 streams", async ({ request }) => {
    const res = await request.get("/api/planetary-stratospheric-jetstream/streams");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.streams.length).toBe(3);
  });

  test("POST /api/planetary-stratospheric-jetstream/harvest-jetstream-power dispatches baseload", async ({ request }) => {
    const res = await request.post("/api/planetary-stratospheric-jetstream/harvest-jetstream-power", {
      data: { stream_id: "POLAR-FRONT-JETSTREAM-01", rossby_multiplier: 1.05, triboelectric_efficiency: 0.986, dispatch_duration_s: 60.0 },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("JETSTREAM_POWER_DISPATCHED");
  });
});
