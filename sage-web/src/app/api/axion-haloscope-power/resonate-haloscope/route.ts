import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

function buildSimulatedResonance(body: Record<string, unknown>) {
  const arrayId =
    typeof body.array_id === "string" && body.array_id
      ? body.array_id
      : "AXION-ADMX-TOROID-01";
  const bTesla = Math.max(8.0, Math.min(Number(body.magnetic_field_tesla ?? 14.0) || 14.0, 28.0));
  const qMillion = Math.max(
    1.0,
    Math.min(Number(body.cavity_quality_q_million ?? 2.8) || 2.8, 8.0)
  );
  const mUev = Math.max(1.0, Math.min(Number(body.axion_mass_uev ?? 42.0) || 42.0, 250.0));
  const gain = Math.max(
    0.85,
    Math.min(Number(body.primakov_coupling_gain ?? 1.25) || 1.25, 1.6)
  );

  const fieldFactor = (bTesla / 14.0) ** 1.15;
  const qFactor = Math.sqrt(qMillion / 2.4);
  const conversionEff = Math.min(
    98.1,
    95.4 + 1.45 * (gain - 1.0) + 0.25 * (qFactor - 1.0)
  );
  const resonantFreqGhz = mUev * 0.241799;
  const rawPrimakovGw = Math.max(
    172.0,
    188.0 * (0.72 + 0.28 * fieldFactor) * (0.85 + 0.15 * qFactor) * gain ** 0.55
  );
  const netGridGw = rawPrimakovGw * (conversionEff / 100.0);

  return {
    array_id: arrayId,
    location: "Cryo-Superconducting Sub-Crustal 14 T NbTi Primakov Toroid",
    magnetic_field_tesla: Number(bTesla.toFixed(2)),
    cavity_quality_q_million: Number(qMillion.toFixed(2)),
    axion_mass_uev: Number(mUev.toFixed(2)),
    resonant_frequency_ghz: Number(resonantFreqGhz.toFixed(4)),
    primakov_coupling_gain: Number(gain.toFixed(3)),
    coherent_rectification_eff_pct: Number(conversionEff.toFixed(2)),
    raw_primakov_flux_gw: Number(rawPrimakovGw.toFixed(2)),
    net_clean_baseload_gw: Number(netGridGw.toFixed(2)),
    zero_fossil_carbon: true,
    zero_fissile_waste: true,
    status: "AXION_PRIMAKOV_GRID_OPTIMAL",
    timestamp: Date.now() / 1000,
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const fallback = buildSimulatedResonance(body);

  try {
    const res = await fetchBackend(
      `${BACKEND}/api/axion-haloscope-power/resonate-haloscope`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      5000
    );
    if (res.ok) {
      return NextResponse.json(await safeUpstreamJson(res, fallback));
    }
  } catch {
    // Fallback when standalone offline or backend unreachable
  }
  return NextResponse.json(fallback);
}

