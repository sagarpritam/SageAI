import { test, expect } from "@playwright/test";

test.describe("Wave 76 Sovereign Crystal-Cluster & Electrojet Supergrid Proxies", () => {
  test("GET /api/lusztig-canonical-basis/bases returns canonical bases", async ({ request }) => {
    const res = await request.get("/api/lusztig-canonical-basis/bases");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.bases)).toBe(true);
    expect(data.bases.length).toBeGreaterThanOrEqual(3);
  });

  test("POST /api/lusztig-canonical-basis/evaluate-canonical-basis locks bar involution", async ({ request }) => {
    const res = await request.post("/api/lusztig-canonical-basis/evaluate-canonical-basis", {
      data: {
        basis_id: "LUSZTIG-CANONICAL-UQG-01",
        crystal_rank: 4,
        bar_order: 2,
        shield_gain: 1.25,
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("LUSZTIG_CANONICAL_LOCKED");
    expect(data.bar_involution_verified).toBe(true);
  });

  test("GET /api/kashiwara-crystal-graph/crystals returns crystal graphs", async ({ request }) => {
    const res = await request.get("/api/kashiwara-crystal-graph/crystals");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.crystals)).toBe(true);
    expect(data.crystals.length).toBeGreaterThanOrEqual(3);
  });

  test("POST /api/kashiwara-crystal-graph/evaluate-crystal-graph verifies Littelmann path", async ({ request }) => {
    const res = await request.post("/api/kashiwara-crystal-graph/evaluate-crystal-graph", {
      data: {
        crystal_id: "KASHIWARA-CRYSTAL-B-01",
        operator_rank: 6,
        string_cone_dim: 4,
        barrier_gain: 1.25,
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("KASHIWARA_CRYSTAL_LOCKED");
    expect(data.littelmann_path_verified).toBe(true);
  });

  test("GET /api/fomin-zelevinsky-cluster/clusters returns cluster seeds", async ({ request }) => {
    const res = await request.get("/api/fomin-zelevinsky-cluster/clusters");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.clusters)).toBe(true);
    expect(data.clusters.length).toBeGreaterThanOrEqual(3);
  });

  test("POST /api/fomin-zelevinsky-cluster/evaluate-cluster-mutation locks Laurent positivity", async ({ request }) => {
    const res = await request.post("/api/fomin-zelevinsky-cluster/evaluate-cluster-mutation", {
      data: {
        cluster_id: "FOMIN-ZELEVINSKY-CLUSTER-01",
        seed_rank: 5,
        mutation_depth: 4,
        firewall_gain: 1.25,
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("FOMIN_ZELEVINSKY_CLUSTER_LOCKED");
    expect(data.laurent_positivity_verified).toBe(true);
  });

  test("GET /api/planetary-electrojet/electrojets returns Auroral Electrojets", async ({ request }) => {
    const res = await request.get("/api/planetary-electrojet/electrojets");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.electrojets)).toBe(true);
    expect(data.electrojets.length).toBeGreaterThanOrEqual(3);
  });

  test("POST /api/planetary-electrojet/harvest-electrojet-power dispatches supergrid power", async ({ request }) => {
    const res = await request.post("/api/planetary-electrojet/harvest-electrojet-power", {
      data: {
        electrojet_id: "ELECTROJET-WESTWARD-01",
        substorm_multiplier: 1.05,
        induction_efficiency: 0.996,
        dispatch_duration_s: 60.0,
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ELECTROJET_POWER_DISPATCHED");
    expect(data.electrojet_coupling_state).toBe("ELECTROJET_SUBSTORM_LOCKED");
    expect(data.harvested_power_gw).toBeGreaterThan(0);
  });
});
