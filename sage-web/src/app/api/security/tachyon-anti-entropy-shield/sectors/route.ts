import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/security/tachyon-anti-entropy-shield/sectors', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Upstream responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json([
      {
        sector_id: 'TAES-SECTOR-PRIME',
        sector_name: 'Galactic Central PT-Symmetric Aegis',
        condensate_pressure_gpa: 7.8e15,
        entropy_suppression_pct: 99.9998,
        non_unitary_quench_rate_mhz: 420.5,
        status: 'PT_SYMMETRIC_UNBROKEN'
      },
      {
        sector_id: 'TAES-SECTOR-INNER',
        sector_name: 'Inner Spiral Arm Tachyon Matrix',
        condensate_pressure_gpa: 6.2e15,
        entropy_suppression_pct: 99.9992,
        non_unitary_quench_rate_mhz: 380.2,
        status: 'PT_SYMMETRIC_UNBROKEN'
      },
      {
        sector_id: 'TAES-SECTOR-PERSEUS',
        sector_name: 'Perseus Quadrant Condensate Field',
        condensate_pressure_gpa: 5.9e15,
        entropy_suppression_pct: 99.9989,
        non_unitary_quench_rate_mhz: 365.0,
        status: 'PT_SYMMETRIC_UNBROKEN'
      },
      {
        sector_id: 'TAES-SECTOR-VOID',
        sector_name: 'Outer Void Decoupling Perimeter',
        condensate_pressure_gpa: 4.8e15,
        entropy_suppression_pct: 99.9985,
        non_unitary_quench_rate_mhz: 310.8,
        status: 'CALIBRATION_SYNCHRONIZED'
      }
    ]);
  }
}
