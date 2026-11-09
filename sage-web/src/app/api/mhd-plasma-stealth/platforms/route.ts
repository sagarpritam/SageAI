import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      platform_id: "MHD-AERO-01",
      callsign: "Sovereign Wave-Rider Prime (Mach 12.5)",
      mach_number: 12.5,
      altitude_km: 38.4,
      magnetic_field_tesla: 3.2,
      plasma_density_cm3: 3.8e14,
      rf_rcs_attenuation_db: 22.4,
      lorentz_bow_shock_damping_pct: 64.2,
      drag_reduction_pct: 34.0,
      status: "STANDBY_CRUISE",
    },
    {
      platform_id: "MHD-AERO-02",
      callsign: "Valkyrie Hypersonic Glide Penetrator (Mach 18.2)",
      mach_number: 18.2,
      altitude_km: 48.2,
      magnetic_field_tesla: 3.8,
      plasma_density_cm3: 8.5e14,
      rf_rcs_attenuation_db: 26.8,
      lorentz_bow_shock_damping_pct: 71.5,
      drag_reduction_pct: 39.5,
      status: "STANDBY_CRUISE",
    },
    {
      platform_id: "MHD-AERO-03",
      callsign: "Ghost-Fire Strato-Scramjet Interceptor (Mach 8.6)",
      mach_number: 8.6,
      altitude_km: 32.0,
      magnetic_field_tesla: 2.8,
      plasma_density_cm3: 1.6e14,
      rf_rcs_attenuation_db: 19.5,
      lorentz_bow_shock_damping_pct: 58.0,
      drag_reduction_pct: 29.2,
      status: "STANDBY_CRUISE",
    },
    {
      platform_id: "MHD-AERO-04",
      callsign: "Apex Trans-Atmospheric Wave-Rider Heavy (Mach 22.4)",
      mach_number: 22.4,
      altitude_km: 56.8,
      magnetic_field_tesla: 4.0,
      plasma_density_cm3: 1.4e15,
      rf_rcs_attenuation_db: 28.4,
      lorentz_bow_shock_damping_pct: 74.0,
      drag_reduction_pct: 42.1,
      status: "STANDBY_CRUISE",
    },
  ]);
}

