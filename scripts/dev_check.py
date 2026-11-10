"""
SageAI Developer Environment & Code Quality Health Check.
Runs ruff linter, ruff formatter check, and pytest test suite in one command.
"""

import subprocess
import sys
import time

GREEN = "\033[92m"
RED = "\033[91m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def run_step(step_name: str, cmd: list[str]) -> bool:
    print(f"\n{CYAN}{BOLD}▶ Running: {step_name}...{RESET}")
    start_time = time.time()
    result = subprocess.run(cmd)
    elapsed = time.time() - start_time
    if result.returncode == 0:
        print(f"  {GREEN}✓ {step_name} PASSED ({elapsed:.2f}s){RESET}")
        return True
    else:
        print(
            f"  {RED}✗ {step_name} FAILED with exit code {result.returncode} ({elapsed:.2f}s){RESET}"
        )
        return False


def main():
    print(f"{CYAN}{BOLD}{'=' * 60}")
    print("  🛡️ SageAI Developer Verification & Health Check")
    print(f"{'=' * 60}{RESET}")

    steps = [
        (
            "Ruff Linter",
            [
                sys.executable,
                "-m",
                "ruff",
                "check",
                "app/",
                "tests/",
                "scripts/",
                "sagestrike/",
                "alembic/",
            ],
        ),
        (
            "Ruff Formatter",
            [
                sys.executable,
                "-m",
                "ruff",
                "format",
                "--check",
                "app/",
                "tests/",
                "scripts/",
                "sagestrike/",
                "alembic/",
            ],
        ),
        ("Pytest Test Suite", [sys.executable, "-m", "pytest", "-q"]),
    ]

    all_passed = True
    for name, cmd in steps:
        if not run_step(name, cmd):
            all_passed = False
            break

    print(f"\n{CYAN}{BOLD}{'=' * 60}{RESET}")
    if all_passed:
        print(
            f"{GREEN}{BOLD}🎉 ALL QUALITY CHECKS PASSED — Codebase is healthy and ready for deployment!{RESET}"
        )
        sys.exit(0)
    else:
        print(
            f"{RED}{BOLD}⚠️ One or more checks failed. Please resolve the issues before committing.{RESET}"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
