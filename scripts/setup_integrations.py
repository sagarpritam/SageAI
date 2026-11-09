"""SageAI — Automated AI & Intelligence Setup Wizard.

Interactive CLI tool to probe, verify, and automatically configure API keys
for NVIDIA NIM, Censys, Shodan, VirusTotal, and GitHub in your local environment.

Usage:
    python scripts/setup_integrations.py
    python scripts/setup_integrations.py --verify-only
"""

import argparse
import asyncio
import io
import os
import sys

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv

load_dotenv()

from app.core.config import settings
from app.services.integrations.verifier import (
    get_all_integrations_status,
    update_env_file,
    verify_censys_credentials,
    verify_nvidia_key,
    verify_shodan_key,
    verify_virustotal_key,
)

if sys.platform == "win32" and isinstance(sys.stdout, io.TextIOWrapper):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def print_banner():
    banner = "\n".join(
        [
            r"   _____                   _____ ",
            r"  / ____|                 / ____|",
            r" | (___   __ _  __ _  ___| |     ",
            r"  \___ \ / _` |/ _` |/ _ \ |     ",
            r"  ____) | (_| | (_| |  __/ |____ ",
            r" |_____/ \__,_|\__, |\___|\_____|",
            r"                __/ |            ",
            r"               |___/   AUTOMATION SETUP WIZARD",
            r"=======================================================",
            r" Automated AI & Threat Intelligence Integration Setup",
            r"=======================================================",
        ]
    )
    print(banner)


async def run_verify_only():
    print("\n[+] Checking status of currently configured integrations in .env:\n")
    status = get_all_integrations_status()

    # 1. NVIDIA
    nv = status["nvidia"]
    if nv["configured"]:
        print(
            f"[*] NVIDIA NIM: Probing key ({nv['masked_key']})...", end=" ", flush=True
        )
        res = await verify_nvidia_key(settings.NVIDIA_API_KEY)
        if res["valid"]:
            print(f"[OK] ACTIVE ({res['latency_ms']}ms) - Model: {nv['model']}")
        else:
            print(f"[ERROR] FAILED - {res.get('error')}")
    else:
        print(
            "[-] NVIDIA NIM: Not configured. (Fallback to OpenAI/Anthropic or rule-based engine)"
        )

    # 2. Censys
    cen = status["censys"]
    if cen["configured"]:
        print(
            f"[*] Censys Pro: Probing credentials ({cen['masked_id']})...",
            end=" ",
            flush=True,
        )
        res = await verify_censys_credentials(
            settings.CENSYS_API_ID, settings.CENSYS_API_SECRET
        )
        if res["valid"]:
            print(f"[OK] ACTIVE ({res['latency_ms']}ms)")
        else:
            print(f"[ERROR] FAILED - {res.get('error')}")
    else:
        print(
            "[FREE] Censys: Free Mode Active (Certspotter CT API + Direct TLS Socket Inspection)"
        )

    # 3. Shodan
    sh = status["shodan"]
    if sh["configured"]:
        print(
            f"[*] Shodan Pro: Probing key ({sh['masked_key']})...", end=" ", flush=True
        )
        res = await verify_shodan_key(settings.SHODAN_API_KEY)
        if res["valid"]:
            print(f"[OK] ACTIVE ({res['message']})")
        else:
            print(f"[ERROR] FAILED - {res.get('error')}")
    else:
        print("[FREE] Shodan: Free Mode Active (Shodan InternetDB API — No key needed)")

    # 4. VirusTotal
    vt = status["virustotal"]
    if vt["configured"]:
        print(
            f"[*] VirusTotal: Probing key ({vt['masked_key']})...", end=" ", flush=True
        )
        res = await verify_virustotal_key(settings.VIRUSTOTAL_API_KEY)
        if res["valid"]:
            print("[OK] ACTIVE")
        else:
            print(f"[ERROR] FAILED - {res.get('error')}")
    else:
        print("[-] VirusTotal: Not configured.")

    print("\nVerification complete.\n")


async def run_interactive_wizard():
    print_banner()
    print(
        "This wizard will help you configure and verify external intelligence & AI APIs."
    )
    print("Press [Enter] at any prompt to keep existing value or use the free tier.\n")

    updates = {}

    # ── 1. NVIDIA Build / NIM API Key ──────────────────────────────────────────
    print("-" * 55)
    print("1. NVIDIA Build / NIM (AI Explanations & Red Teaming)")
    print("   -> Free 1,000 credits at: https://build.nvidia.com")
    print(
        f"   Current Key: {settings.NVIDIA_API_KEY[:6]}... (if set)"
        if settings.NVIDIA_API_KEY
        else "   Current: Not set"
    )
    nv_input = input("   Enter NVIDIA_API_KEY (nvapi-...): ").strip()

    if nv_input:
        print(
            "   [*] Testing key against live NVIDIA NIM endpoint...",
            end=" ",
            flush=True,
        )
        res = await verify_nvidia_key(nv_input)
        if res["valid"]:
            print(f"[OK] Success! ({res.get('latency_ms', 0)}ms)")
            print(
                f"   Model: {res.get('model', 'nvidia/llama-3.1-nemotron-70b-instruct')}"
            )
            updates["NVIDIA_API_KEY"] = nv_input
        else:
            print(f"[ERROR] Failed: {res.get('error')}")
            proceed = input("   Save anyway? (y/N): ").lower()
            if proceed == "y":
                updates["NVIDIA_API_KEY"] = nv_input
    else:
        print("   [>>] Skipped. Existing configuration retained.")

    # ── 2. Censys Global Radar ────────────────────────────────────────────────
    print("\n" + "-" * 55)
    print("2. Censys Global Radar (Certificate Transparency & Service Discovery)")
    print("   -> Free 250 queries/month at: https://search.censys.io/register")
    print("   [INFO] If left blank, SageAI automatically uses built-in Free Mode")
    print("          (Certspotter CT Logs + Direct TLS Inspection — Zero cost).")

    censys_id = input("   Enter CENSYS_API_ID (or press Enter for Free Mode): ").strip()
    if censys_id:
        censys_secret = input("   Enter CENSYS_API_SECRET: ").strip()
        print("   [*] Testing Censys credentials...", end=" ", flush=True)
        res = await verify_censys_credentials(censys_id, censys_secret)
        if res["valid"]:
            print(f"[OK] Success! ({res.get('latency_ms', 0)}ms)")
            updates["CENSYS_API_ID"] = censys_id
            updates["CENSYS_API_SECRET"] = censys_secret
        else:
            print(f"[ERROR] Failed: {res.get('error')}")
            proceed = input("   Save anyway? (y/N): ").lower()
            if proceed == "y":
                updates["CENSYS_API_ID"] = censys_id
                updates["CENSYS_API_SECRET"] = censys_secret
    else:
        print("   [OK] Free Mode enabled (Certspotter CT + Direct TLS).")

    # ── 3. Shodan Scanner ──────────────────────────────────────────────────────
    print("\n" + "-" * 55)
    print("3. Shodan Infrastructure Scanner")
    print("   -> Get key at: https://account.shodan.io/register")
    print("   [INFO] If left blank, SageAI uses Shodan InternetDB (100% Free).")
    shodan_key = input(
        "   Enter SHODAN_API_KEY (or press Enter for Free Mode): "
    ).strip()
    if shodan_key:
        print("   [*] Testing Shodan key...", end=" ", flush=True)
        res = await verify_shodan_key(shodan_key)
        if res["valid"]:
            print(f"[OK] Success! {res.get('message')}")
            updates["SHODAN_API_KEY"] = shodan_key
        else:
            print(f"[ERROR] Failed: {res.get('error')}")
            proceed = input("   Save anyway? (y/N): ").lower()
            if proceed == "y":
                updates["SHODAN_API_KEY"] = shodan_key
    else:
        print("   [OK] Free Mode enabled (Shodan InternetDB API).")

    # ── 4. VirusTotal ──────────────────────────────────────────────────────────
    print("\n" + "-" * 55)
    print("4. VirusTotal (Optional Threat Intel)")
    print("   -> Free API key at: https://www.virustotal.com/gui/join-us")
    vt_key = input("   Enter VIRUSTOTAL_API_KEY (or press Enter to skip): ").strip()
    if vt_key:
        print("   [*] Testing VirusTotal key...", end=" ", flush=True)
        res = await verify_virustotal_key(vt_key)
        if res["valid"]:
            print("[OK] Success!")
            updates["VIRUSTOTAL_API_KEY"] = vt_key
        else:
            print(f"[ERROR] Failed: {res.get('error')}")
            proceed = input("   Save anyway? (y/N): ").lower()
            if proceed == "y":
                updates["VIRUSTOTAL_API_KEY"] = vt_key

    # ── Save Updates ──────────────────────────────────────────────────────────
    print("\n" + "=" * 55)
    if updates:
        print(f"[+] Updating environment variables: {', '.join(updates.keys())}...")
        update_env_file(updates)
        print(
            "[SUCCESS] Successfully saved and activated in .env and runtime settings!"
        )
    else:
        print("[INFO] No changes made.")

    print("\nReady to run scans! Example:")
    print("   python -m app.main")
    print("   python scripts/verify_nvidia_live.py\n")


def main():
    parser = argparse.ArgumentParser(description="SageAI Integration Setup Wizard")
    parser.add_argument(
        "--verify-only",
        action="store_true",
        help="Check status of configured keys without prompting",
    )
    args = parser.parse_args()

    if args.verify_only:
        asyncio.run(run_verify_only())
    else:
        asyncio.run(run_interactive_wizard())


if __name__ == "__main__":
    main()
