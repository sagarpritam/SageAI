import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/infrastructure/gravitational-wave-interferometer/arms", {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Backend response error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Using fallback Gravitational Wave Interferometer arms:", err);
    return NextResponse.json([
      {
        arm_id: "GWIS-ARM-LISA-ALPHA",
        constellation_pair: "SC1-SC2-HELIOCENTRIC",
        length_km: 2500000.0,
        laser_power_w: 2.0,
        carrier_phase_offset_rad: 0.00012,
        photodiode_shot_noise_relative: 0.00003,
        gravitational_sensor_status: "DRAG_FREE_TEST_MASS_FLOATING",
      },
      {
        arm_id: "GWIS-ARM-LISA-BETA",
        constellation_pair: "SC2-SC3-HELIOCENTRIC",
        length_km: 2500000.0,
        laser_power_w: 2.0,
        carrier_phase_offset_rad: 0.00015,
        photodiode_shot_noise_relative: 0.00004,
        gravitational_sensor_status: "DRAG_FREE_TEST_MASS_FLOATING",
      },
      {
        arm_id: "GWIS-ARM-DECIGO-PRECURSOR",
        constellation_pair: "SC3-SC1-HELIOCENTRIC",
        length_km: 1000.0,
        laser_power_w: 10.0,
        carrier_phase_offset_rad: 0.00008,
        photodiode_shot_noise_relative: 0.00002,
        gravitational_sensor_status: "FABRY_PEROT_RESONATOR_LOCKED",
      },
      {
        arm_id: "GWIS-ARM-TIANQIN-GEO",
        constellation_pair: "TQ1-TQ2-HIGH_EARTH_ORBIT",
        length_km: 170000.0,
        laser_power_w: 5.0,
        carrier_phase_offset_rad: 0.00010,
        photodiode_shot_noise_relative: 0.000025,
        gravitational_sensor_status: "INCLINED_CIRCULAR_SYNCHRONIZED",
      },
    ]);
  }
}
