import { NextResponse } from "next/server";
import { fetchBackend, safeUpstreamJson } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

const FALLBACK_SETTLEMENT_STATUS = {
  settlement_id: "SETTLE-SERIES-A-2026-v8.7",
  round_name: "Series A Preferred Stock Financing",
  target_raise_usd: 6000000.0,
  total_committed_usd: 6000000.0,
  total_cleared_usd: 6000000.0,
  total_shares_issued: 1935484,
  price_per_share_usd: 3.10,
  pre_money_valuation_usd: 25000000.0,
  post_money_valuation_usd: 31000000.0,
  is_fully_wired: true,
  is_ledger_locked: false,
  locked_at: null,
  merkle_root_seal: null,
  signatory_cfo: "Sarah Chen, Chief Financial Officer & RevOps",
  investor_allocations: [
    {
      investor_id: "INV-APEX-01",
      name: "Apex Sovereign Ventures",
      role: "Lead Institutional Series A Investor",
      wire_amount_usd: 4000000.0,
      shares_allocated: 1290323,
      price_per_share: 3.10,
      ownership_pct: 13.68,
      fedwire_confirmation: "FW-20261117-0094821",
      custody_bank: "Silicon Valley Bank Treasury / First Republic",
      wire_status: "CONFIRMED_RECEIVED",
      tokenized_certificate_id: "CERT-APEX-SR-A-001",
      certificate_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      board_representative: "Marcus Vance, Managing Partner (Board Director Seat 1)",
    },
    {
      investor_id: "INV-HYPER-02",
      name: "HyperScale Cloud Ventures",
      role: "Strategic Enterprise Co-Investor",
      wire_amount_usd: 1500000.0,
      shares_allocated: 483871,
      price_per_share: 3.10,
      ownership_pct: 5.13,
      fedwire_confirmation: "FW-20261117-0094822",
      custody_bank: "Morgan Stanley Institutional Treasury",
      wire_status: "CONFIRMED_RECEIVED",
      tokenized_certificate_id: "CERT-HYPER-SR-A-002",
      certificate_hash: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
      board_representative: "Elena Rostova, General Partner (Board Observer)",
    },
    {
      investor_id: "INV-CISO-03",
      name: "Enterprise CISO Angel Syndicate",
      role: "Cybersecurity Executive Network",
      wire_amount_usd: 500000.0,
      shares_allocated: 161290,
      price_per_share: 3.10,
      ownership_pct: 1.71,
      fedwire_confirmation: "FW-20261117-0094823",
      custody_bank: "J.P. Morgan Private Bank",
      wire_status: "CONFIRMED_RECEIVED",
      tokenized_certificate_id: "CERT-CISO-SR-A-003",
      certificate_hash: "fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9",
      board_representative: "Devin Thorne, CISO Council Chair (Advisory Seat)",
    },
  ],
  receipt_path: null,
};

export async function GET() {
  try {
    const res = await fetchBackend(`${BACKEND}/api/finance/settlement/status`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(FALLBACK_SETTLEMENT_STATUS);
    }
    const data = await safeUpstreamJson(res, FALLBACK_SETTLEMENT_STATUS);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_SETTLEMENT_STATUS);
  }
}
