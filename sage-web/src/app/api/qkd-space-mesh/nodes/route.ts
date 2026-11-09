import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      node_id: "QKD-EARTH-CANARY-01",
      node_name: "Teide Optical Ground Station (Tenerife)",
      platform_type: "OPTICAL_GROUND_STATION",
      distance_from_earth_km: 0.0,
      optical_telescope_aperture_m: 1.0,
      quantum_channel_wavelength_nm: 1550.0,
      raw_key_generation_rate_kbps: 45.2,
      quantum_bit_error_rate_pct: 1.45,
      entangled_bell_pairs_buffered: 250000,
      status: "QUANTUM_BEAM_TRACKING_LOCKED",
    },
    {
      node_id: "QKD-GATEWAY-LUNAR-02",
      node_name: "Artemis Halo Lunar Gateway Terminal",
      platform_type: "LUNAR_ORBITAL_GATEWAY",
      distance_from_earth_km: 384400.0,
      optical_telescope_aperture_m: 0.8,
      quantum_channel_wavelength_nm: 1550.0,
      raw_key_generation_rate_kbps: 18.6,
      quantum_bit_error_rate_pct: 2.1,
      entangled_bell_pairs_buffered: 180000,
      status: "QUANTUM_BEAM_TRACKING_LOCKED",
    },
    {
      node_id: "QKD-RELAY-LAGRANGE-L1-03",
      node_name: "Lagrange L1 Deep Space Quantum Optical Node",
      platform_type: "LAGRANGE_DEEP_SPACE",
      distance_from_earth_km: 1500000.0,
      optical_telescope_aperture_m: 1.5,
      quantum_channel_wavelength_nm: 1550.0,
      raw_key_generation_rate_kbps: 12.4,
      quantum_bit_error_rate_pct: 2.45,
      entangled_bell_pairs_buffered: 140000,
      status: "QUANTUM_BEAM_TRACKING_LOCKED",
    },
    {
      node_id: "QKD-PROBE-MARS-ORBIT-04",
      node_name: "Mars Areostationary Sovereign Transceiver",
      platform_type: "INTERPLANETARY_PROBE",
      distance_from_earth_km: 225000000.0,
      optical_telescope_aperture_m: 2.4,
      quantum_channel_wavelength_nm: 1550.0,
      raw_key_generation_rate_kbps: 4.2,
      quantum_bit_error_rate_pct: 3.15,
      entangled_bell_pairs_buffered: 85000,
      status: "QUANTUM_BEAM_TRACKING_LOCKED",
    },
  ]);
}

