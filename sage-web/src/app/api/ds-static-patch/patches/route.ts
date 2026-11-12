import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_DATA = {
  patches: [
    {
      patch_id: "DS-STATIC-GIBBONS-01",
      horizon: "dS4 Gibbons-Hawking Cosmological Static Patch (r_H = l_dS)",
      default_hubble_scale: 1.0,
      default_york_time: 0.85,
      default_timelike_interval: 1.4,
      base_coherence_pct: 99.997,
      base_isolation_db: 158.1,
      status: "DS_PATCH_ACTIVE",
    },
    {
      patch_id: "DS-BILAYER-OBSERVER-02",
      horizon: "Bilateral Antipodal Static-Patch Observer Algebra (Type II_1 Factor)",
      default_hubble_scale: 1.6,
      default_york_time: 1.15,
      default_timelike_interval: 2.1,
      base_coherence_pct: 99.998,
      base_isolation_db: 160.7,
      status: "DS_PATCH_ACTIVE",
    },
    {
      patch_id: "DS-TIMELIKE-CFT3-03",
      horizon: "dS4/CFT3 Timelike Pseudo-Entanglement Wedge Boundary",
      default_hubble_scale: 2.2,
      default_york_time: 1.45,
      default_timelike_interval: 2.8,
      base_coherence_pct: 99.999,
      base_isolation_db: 163.4,
      status: "DS_PATCH_ACTIVE",
    },
  ],
};

export async function GET() {
  try {
    const res = await fetchBackend(
      `${BACKEND}/api/ds-static-patch/patches`,
      { cache: "no-store" },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, FALLBACK_DATA));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(FALLBACK_DATA);
}

