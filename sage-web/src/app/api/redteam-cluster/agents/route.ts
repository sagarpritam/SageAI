import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      agent_id: "RED-ALPHA-EW",
      codename: "Specter-RF",
      specialization: "Intersite RF/AESA Jamming & GPS Optical Drift Injection",
      aggression_level: 0.92,
      evasion_techniques: ["Frequency-Hopping DRFM", "Relativistic Phase Deception", "Chirp Inversion"],
      active_payload_vectors: 4,
      status: "STANDBY_READY",
    },
    {
      agent_id: "RED-BETA-QUANTUM",
      codename: "Lattice-Shatter",
      specialization: "Quantum Lattice Side-Channel & HNDL Harvest Exfiltration",
      aggression_level: 0.96,
      evasion_techniques: ["SMT Fault Injection", "Optical Power Side-Channel", "Decoherence Exploitation"],
      active_payload_vectors: 6,
      status: "STANDBY_READY",
    },
    {
      agent_id: "RED-GAMMA-ORBITAL",
      codename: "Orbital-Kinetic",
      specialization: "Hypervelocity ASAT Kinetic & Spaceborne Plasma Penetration",
      aggression_level: 0.98,
      evasion_techniques: ["Hypervelocity Gliding (Mach 28)", "Ablation Shielding", "Chaff Decoy Swarm"],
      active_payload_vectors: 5,
      status: "STANDBY_READY",
    },
    {
      agent_id: "RED-DELTA-SUBTERRANEAN",
      codename: "Borehole-Wraith",
      specialization: "Subterranean Acoustic Cavitation & Tectonic Strain Masking",
      aggression_level: 0.88,
      evasion_techniques: ["Seismic Reverberation Damping", "Muon Attenuation Camouflage", "Laser Meter Nulling"],
      active_payload_vectors: 3,
      status: "STANDBY_READY",
    },
  ]);
}

