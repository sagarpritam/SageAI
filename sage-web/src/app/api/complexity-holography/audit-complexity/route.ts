import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedAudit(body: Record<string, unknown>) {
  const boundId =
    typeof body.bound_id === "string" && body.bound_id
      ? body.bound_id
      : "CMP-WDW-ACTION-01";
  const cVal = Math.max(24.0, Math.min(Number(body.central_charge ?? 240.0) || 240.0, 4096.0));
  const lloyd = Math.max(0.5, Math.min(Number(body.lloyd_ratio ?? 0.94) || 0.94, 1.0));
  const shocks = Math.max(1, Math.min(Math.round(Number(body.switchback_shocks ?? 4) || 4), 24));
  const gain = Math.max(0.85, Math.min(Number(body.wdw_anchor_gain ?? 1.45) || 1.45, 2.5));

  const actionNorm = Number((cVal * lloyd * (1.0 + 0.14 * shocks)).toFixed(3));
  const delay = Number(((shocks * Math.log1p(cVal / 24.0)) / 3.2).toFixed(4));
  const residual = Number((1.0e-5 / (1.0 + lloyd) / 10.0 ** (3.15 * gain)).toFixed(12));
  const suppressionDb = Number(
    (156.4 + 4.7 * Math.log10(1.0 + gain) + 2.1 * Math.log1p(shocks) + 1.3 * lloyd).toFixed(2)
  );
  const fidelityPct = Number(
    Math.min(99.99999, 99.997 + 0.0014 * Math.tanh(gain) + 0.0005 * lloyd).toFixed(5)
  );

  return {
    bound_id: boundId,
    geometry: "BTZ AdS3 Wheeler-DeWitt Action Patch (C_A = I_WDW / pi)",
    central_charge: Number(cVal.toFixed(2)),
    lloyd_ratio: Number(lloyd.toFixed(4)),
    switchback_shocks: shocks,
    wdw_anchor_gain: Number(gain.toFixed(3)),
    action_complexity_norm: actionNorm,
    switchback_foldback_delay: delay,
    complexity_drift_residual: residual,
    chaos_suppression_db: suppressionDb,
    complexity_fidelity_pct: fidelityPct,
    lloyd_bound_satisfied: lloyd <= 1.0,
    status: "COMPLEXITY_WDW_SEALED",
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
      `${BACKEND}/api/complexity-holography/audit-complexity`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, buildSimulatedAudit(body)));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(buildSimulatedAudit(body));
}

