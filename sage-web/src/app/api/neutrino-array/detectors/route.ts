import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND}/neutrino-array/detectors`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackDetectors());
  } catch {
    return NextResponse.json(getFallbackDetectors());
  }
}

function getFallbackDetectors() {
  return {
    status: "success",
    detectors: [
      {
        detector_id: "detector-icecube-southpole-01",
        name: "IceCube DeepCore Sub-Glacial Neutrino Observatory",
        depth_km: 2.45,
        location: "Amundsen-Scott South Pole Station, Antarctica",
        target_mass_kton: 1000.0,
        medium: "Deep Antarctic Glacial Ice",
        optical_sensors_count: 5160,
        baseline_flux_ev_per_day: 142.5,
        status: "CHERENKOV_DETECTION_NOMINAL",
        anomalous_bursts_detected: 0,
      },
      {
        detector_id: "detector-superk-kamioka-02",
        name: "Super-Kamiokande Subterranean Gadolinium Cherenkov Array",
        depth_km: 1.0,
        location: "Mount Ikeno, Kamioka, Gifu, Japan",
        target_mass_kton: 50.0,
        medium: "Ultra-Pure Water + 0.02% Gd2(SO4)3",
        optical_sensors_count: 11129,
        baseline_flux_ev_per_day: 88.2,
        status: "CHERENKOV_DETECTION_NOMINAL",
        anomalous_bursts_detected: 0,
      },
      {
        detector_id: "detector-sno-ontario-03",
        name: "SNO+ Creighton Underground Scintillation Lab",
        depth_km: 2.07,
        location: "Sudbury, Ontario, Canada",
        target_mass_kton: 0.78,
        medium: "Linear Alkylbenzene (LAB) Liquid Scintillator",
        optical_sensors_count: 9300,
        baseline_flux_ev_per_day: 24.1,
        status: "CHERENKOV_DETECTION_NOMINAL",
        anomalous_bursts_detected: 0,
      },
      {
        detector_id: "detector-gransasso-lngs-04",
        name: "Laboratori Nazionali del Gran Sasso (LNGS) Enclave",
        depth_km: 1.4,
        location: "Gran Sasso Mountain, L'Aquila, Italy",
        target_mass_kton: 3.2,
        medium: "Liquid Argon (LAr) + Scintillation Doping",
        optical_sensors_count: 4200,
        baseline_flux_ev_per_day: 31.6,
        status: "CHERENKOV_DETECTION_NOMINAL",
        anomalous_bursts_detected: 0,
      },
    ],
  };
}

