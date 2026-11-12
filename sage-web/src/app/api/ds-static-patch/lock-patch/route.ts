import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedLock(body: Record<string, unknown>) {
  const patchId =
    typeof body.patch_id === "string" && body.patch_id
      ? body.patch_id
      : "DS-STATIC-GIBBONS-01";
  const hVal = Math.max(0.2, Math.min(Number(body.hubble_scale ?? 1.0) || 1.0, 10.0));
  const yorkVal = Math.max(0.1, Math.min(Number(body.york_time ?? 0.85) || 0.85, 5.0));
  const tInt = Math.max(0.2, Math.min(Number(body.timelike_interval ?? 1.4) || 1.4, 8.0));
  const gain = Math.max(0.85, Math.min(Number(body.observer_clamp_gain ?? 1.55) || 1.55, 2.5));

  const sgh = Number((128.0 / (hVal * hVal + 0.15)).toFixed(3));
  const st = Number((Math.log1p(tInt * 4.2) * (1.0 + 0.25 * yorkVal)).toFixed(4));
  const residual = Number((1.0e-5 / (1.0 + yorkVal) / 10.0 ** (3.18 * gain)).toFixed(12));
  const isolationDb = Number(
    (158.1 + 4.5 * Math.log10(1.0 + gain) + 1.9 * Math.log1p(tInt) + 0.8 * yorkVal).toFixed(2)
  );
  const coherencePct = Number(
    Math.min(99.99999, 99.997 + 0.0014 * Math.tanh(gain) + 0.0004 * Math.tanh(yorkVal)).toFixed(5)
  );

  return {
    patch_id: patchId,
    horizon: "dS4 Gibbons-Hawking Cosmological Static Patch (r_H = l_dS)",
    hubble_scale: Number(hVal.toFixed(3)),
    york_time: Number(yorkVal.toFixed(3)),
    timelike_interval: Number(tInt.toFixed(3)),
    observer_clamp_gain: Number(gain.toFixed(3)),
    gibbons_hawking_entropy_sgh: sgh,
    timelike_pseudo_entropy_st: st,
    horizon_drift_residual: residual,
    horizon_isolation_db: isolationDb,
    patch_coherence_pct: coherencePct,
    type_ii1_algebra_locked: true,
    status: "DS_STATIC_PATCH_LOCKED",
    timestamp: Date.now() / 1000,
  };
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  try {
    const res = await fetchBackend(
      `${BACKEND}/api/ds-static-patch/lock-patch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, buildSimulatedLock(body)));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(buildSimulatedLock(body));
}

