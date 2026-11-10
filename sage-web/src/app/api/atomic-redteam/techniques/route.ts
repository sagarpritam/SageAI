import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/proxy-utils";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchBackend(`${BACKEND}/atomic-redteam/techniques`, {
      method: "GET",
      headers,
      cache: "no-store",
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json(getFallbackTechniques());
  } catch {
    return NextResponse.json(getFallbackTechniques());
  }
}

function getFallbackTechniques() {
  return {
    techniques: [
      {
        technique_id: "T1059.001",
        technique_name: "PowerShell Script Execution",
        tactic: "Execution",
        elevation_required: false,
        atomic_command: "powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Command \"Invoke-WebRequest -Uri 'http://127.0.0.1:8000/telemetry/canary'\"",
        expected_telemetry: ["Sysmon Event ID 1", "PowerShell ScriptBlock 4104"],
        detection_sigma: "proc_creation_win_powershell_obfuscated_cmd.yml",
      },
      {
        technique_id: "T1003.001",
        technique_name: "LSASS Memory Credential Dumping",
        tactic: "Credential Access",
        elevation_required: true,
        atomic_command: "rundll32.exe C:\\windows\\System32\\comsvcs.dll, MiniDump lsass.dmp full",
        expected_telemetry: ["Sysmon Event ID 10", "VSS Shadow Copy Read"],
        detection_sigma: "proc_access_win_lsass_dump_comsvcs.yml",
      },
      {
        technique_id: "T1547.001",
        technique_name: "Registry Run Keys Persistence",
        tactic: "Persistence",
        elevation_required: false,
        atomic_command: "reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\" /v \"SageCanary\"",
        expected_telemetry: ["Sysmon Event ID 13", "EDR Run Key Alert"],
        detection_sigma: "registry_set_autorun_persistence.yml",
      },
      {
        technique_id: "T1078.004",
        technique_name: "Cloud Account Abuse",
        tactic: "Initial Access",
        elevation_required: false,
        atomic_command: "aws iam list-attached-user-policies --user-name sage-canary",
        expected_telemetry: ["CloudTrail IAM:ListAttachedUserPolicies"],
        detection_sigma: "cloudtrail_iam_recon_burst.yml",
      },
      {
        technique_id: "T1021.002",
        technique_name: "SMB / Windows Admin Shares",
        tactic: "Lateral Movement",
        elevation_required: true,
        atomic_command: "net use \\\\192.168.1.50\\C$ /user:DOMAIN\\Admin",
        expected_telemetry: ["Event ID 5140 Network Share", "Kerberos TGS 4769"],
        detection_sigma: "win_admin_share_lateral_movement.yml",
      },
      {
        technique_id: "T1486",
        technique_name: "Data Encrypted for Impact",
        tactic: "Impact",
        elevation_required: false,
        atomic_command: "python -c \"mass_entropy_encryption_simulation()\"",
        expected_telemetry: ["Shannon Entropy Burst (H > 7.50)"],
        detection_sigma: "entropy_rapid_mass_encryption_burst.yml",
      },
    ],
  };
}

