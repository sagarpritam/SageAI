import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stationId = body.station_id || "MUON-TEL-ALPS-GRANITE";
    const targetZone = body.target_zone || "Mont Blanc Deep Shaft Adit-4";
    const depthMeters = body.target_depth_meters || 450.0;
    const exposureHours = body.exposure_time_hours || 12.0;

    return NextResponse.json({
      scan_id: `MUON-SCAN-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      station_id: stationId,
      target_geological_zone: targetZone,
      depth_meters: depthMeters,
      overburden_density_mean_g_cm3: 2.41,
      integrated_muon_events: Math.floor(82.0 * 3600 * exposureHours),
      detected_density_anomalies: [
        {
          anomaly_id: `ANOM-VOID-${Math.floor(Math.random() * 900 + 100)}`,
          classification: "CLANDESTINE_EXCAVATED_VOID",
          estimated_density_g_cm3: 0.08,
          density_contrast_pct: -96.9,
          relative_depth_m: depthMeters - 45.0,
          estimated_volume_m3: 12450.0,
          confidence_score: 0.984,
        },
        {
          anomaly_id: `ANOM-HIGHZ-${Math.floor(Math.random() * 900 + 100)}`,
          classification: "HIGH_Z_SHIELDED_MASS",
          estimated_density_g_cm3: 9.45,
          density_contrast_pct: 256.6,
          relative_depth_m: depthMeters,
          estimated_volume_m3: 340.0,
          confidence_score: 0.961,
        },
      ],
      void_detection_confidence_pct: 98.4,
      high_z_material_confidence_pct: 96.1,
      spatial_resolution_meters: 2.2,
      reconstruction_time_ms: 28.4,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
