import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      obs_id: "GEON-OBS-JUNO-JIANGMEN",
      observatory_name: "Jiangmen Underground Neutrino Observatory",
      latitude: 22.1197,
      longitude: 112.5186,
      overburden_mwe: 1800.0,
      scintillator_mass_ktons: 20.0,
      threshold_energy_mev: 1.806,
      annual_geoneutrino_events: 450,
      status: "CONTINUOUS_DATA_TAKING",
    },
    {
      obs_id: "GEON-OBS-KAMLAND-KAMIOKA",
      observatory_name: "Kamioka Liquid Scintillator Array",
      latitude: 36.4256,
      longitude: 137.3103,
      overburden_mwe: 2700.0,
      scintillator_mass_ktons: 1.0,
      threshold_energy_mev: 1.806,
      annual_geoneutrino_events: 110,
      status: "CONTINUOUS_DATA_TAKING",
    },
    {
      obs_id: "GEON-OBS-BOREXINO-GRAN-SASSO",
      observatory_name: "Gran Sasso Deep Laboratory",
      latitude: 42.4534,
      longitude: 13.5756,
      overburden_mwe: 3800.0,
      scintillator_mass_ktons: 0.3,
      threshold_energy_mev: 1.806,
      annual_geoneutrino_events: 85,
      status: "CONTINUOUS_DATA_TAKING",
    },
  ]);
}

