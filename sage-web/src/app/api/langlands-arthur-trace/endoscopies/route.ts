import { NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_BASE}/api/langlands-arthur-trace/endoscopies`, {
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch (err: unknown) {
    console.warn("Using fallback Arthur endoscopy profiles:", err);
  }

  return NextResponse.json({
    endoscopies: [
      {
        endoscopy_id: "ARTHUR-ENDOSCOPY-SL2-01",
        name: "Arthur Invariant Trace & Endoscopic Packet Firewall",
        group_rank: 2,
        orbital_integral_defect: 1e-18,
        arthur_firewall_strength_pev: 2.82e12,
        endoscopy_suppression_db: 201.0,
        status: "ARTHUR_ENDOSCOPY_LOCKED",
      },
      {
        endoscopy_id: "NGO-FUNDAMENTAL-LEMMA-02",
        name: "Ngo Hitchin Fibration Fundamental Lemma Shield",
        group_rank: 4,
        orbital_integral_defect: 1.1e-18,
        arthur_firewall_strength_pev: 2.92e12,
        endoscopy_suppression_db: 201.5,
        status: "ARTHUR_ENDOSCOPY_LOCKED",
      },
      {
        endoscopy_id: "LANGLANDS-FUNCTORIALITY-03",
        name: "Langlands L-Group Functoriality Transfer Barrier",
        group_rank: 6,
        orbital_integral_defect: 1.2e-18,
        arthur_firewall_strength_pev: 3.02e12,
        endoscopy_suppression_db: 202.0,
        status: "ARTHUR_ENDOSCOPY_LOCKED",
      },
    ],
  });
}
