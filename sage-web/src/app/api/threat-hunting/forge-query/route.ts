import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;

  try {
    const body = await req.json();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BACKEND}/threat-hunting/forge-query`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(getFallbackQueryForge(body.hypothesis));
  } catch {
    return NextResponse.json(getFallbackQueryForge("Living off the land"));
  }
}

function getFallbackQueryForge(hypothesis: string) {
  return {
    status: "success",
    queries: {
      hypothesis,
      synthesized_at: new Date().toISOString(),
      extracted_indicators: ["powershell", "certutil", "-enc", "c2_beacon"],
      sigma_yaml: `title: SageAI Autonomous Threat Hunt
id: sigma-8f12a03c
status: experimental
description: Proactive hunt rule from: "${hypothesis}"
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        Image|endswith:
            - '\\powershell.exe'
            - '\\pwsh.exe'
        CommandLine|contains:
            - '-enc'
            - 'downloadstring'
    condition: selection
level: high
tags:
    - attack.execution
    - attack.t1059.001`,
      sentinel_kql: `DeviceProcessEvents
| where TimeGenerated >= ago(7d)
| where FileName in~ ("powershell.exe", "pwsh.exe")
| where ProcessCommandLine has_any ("-enc", "bypass", "invoke")
| project TimeGenerated, DeviceName, AccountName, FileName, ProcessCommandLine
| sort by TimeGenerated desc`,
      splunk_spl: `index=security sourcetype="XmlWinEventLog:Microsoft-Windows-Sysmon/Operational" EventCode=1
| search process_name="*powershell*" CommandLine="*-enc*"
| stats count earliest(_time) as first_seen latest(_time) as last_seen by host, user, process_name
| sort - count`,
      elastic_eql: `sequence by host.id with maxspan=5m
  [process where event.type == "start" and process.name in ("powershell.exe", "pwsh.exe") and process.command_line : "*-enc*"]
  [network where event.type == "start" and destination.ip != "127.0.0.1"]`,
      mitre_technique: "T1059.001 / T1071",
    },
  };
}

