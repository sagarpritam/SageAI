import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/infrastructure/stratospheric-aerosol-albedo/telemetry', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        ...data,
        grid_id: data.grid_id || data.system_id || 'stratospheric-calcite-albedo-01',
        system_id: data.system_id || data.grid_id || 'stratospheric-calcite-albedo-01',
        injection_material: data.injection_material || data.aerosol_material || 'Sub-Micron Engineered Calcite (CaCO3)',
        aerosol_material: data.aerosol_material || data.injection_material || 'Sub-Micron Engineered Calcite (CaCO3)',
        global_cooling_forcing_mw_per_m2: data.global_cooling_forcing_mw_per_m2 ?? Math.abs((data.radiative_forcing_offset_w_per_m2 ?? -1.45) * 1000),
        radiative_forcing_offset_w_per_m2: data.radiative_forcing_offset_w_per_m2 ?? -1.45,
        active_stratospheric_uas_drones: data.active_stratospheric_uas_drones ?? data.active_drone_fleets ?? 48,
        active_drone_fleets: data.active_drone_fleets ?? data.active_stratospheric_uas_drones ?? 16,
        annual_calcite_injection_megatons: data.annual_calcite_injection_megatons ?? 2.4,
        ozone_depletion_potential_odp: data.ozone_depletion_potential_odp ?? data.ozone_depletion_potential ?? 0.0,
        ozone_depletion_potential: data.ozone_depletion_potential ?? data.ozone_depletion_potential_odp ?? 0.0,
        stratospheric_residence_time_months: data.stratospheric_residence_time_months ?? 14.5,
      });
    }
  } catch (error) {
    console.error('Using fallback Stratospheric Aerosol Albedo telemetry:', error);
  }

  return NextResponse.json({
    grid_id: 'stratospheric-calcite-albedo-01',
    system_id: 'stratospheric-calcite-albedo-01',
    status: 'CALCITE_AEROSOL_DISPERSAL_NOMINAL',
    aerosol_material: 'Sub-Micron Engineered Calcite (CaCO3)',
    injection_material: 'Sub-Micron Engineered Calcite (CaCO3)',
    mean_particle_diameter_nm: 280.0,
    injection_altitude_km: 22.0,
    radiative_forcing_offset_w_per_m2: -1.45,
    global_cooling_forcing_mw_per_m2: 1450.0,
    active_drone_fleets: 16,
    active_stratospheric_uas_drones: 48,
    annual_calcite_injection_megatons: 2.4,
    total_dispersed_calcite_metric_tons: 18400.0,
    ozone_depletion_potential: 0.0,
    ozone_depletion_potential_odp: 0.0,
    global_albedo_delta_pct: 0.024,
    stratospheric_residence_time_months: 14.5,
    last_dispersal_cycle_timestamp: new Date().toISOString(),
    last_albedo_telemetry_timestamp: new Date().toISOString(),
  });
}
