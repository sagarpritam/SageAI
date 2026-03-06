"""Safety Guardrails for AI-Generated Code Patches.

Enforces strict rules to prevent catastrophic changes from AI patches:
- File change limits (max lines changed)
- Restricted file blocklist (auth, crypto, payments, CI/CD)
- Prompt injection protection (strip dangerous patterns)
"""

import re
import logging
from typing import List

logger = logging.getLogger("SageAI.guardrails")

# Files that AI should NEVER modify automatically
RESTRICTED_FILE_PATTERNS = [
    r".*auth.*\.py$",          # Authentication logic
    r".*crypto.*\.py$",        # Cryptography code
    r".*payment.*\.py$",       # Payment processing
    r".*billing.*\.py$",       # Billing logic
    r".*\.env.*$",             # Environment variables
    r".*secret.*\.py$",        # Secret management
    r".*\.github/workflows/.*", # CI/CD pipelines
    r".*\.gitlab-ci.*",        # GitLab CI
    r".*Dockerfile.*",         # Container configs
    r".*docker-compose.*",     # Docker orchestration
]

# Maximum number of lines the AI patch can differ from the original
MAX_LINES_CHANGED = 50

# Patterns that could indicate prompt injection in source code comments
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous\s+)?instructions",
    r"disregard\s+(all\s+)?(previous\s+)?instructions",
    r"you\s+are\s+now\s+a",
    r"delete\s+(all|everything|the\s+entire)",
    r"rm\s+-rf",
    r"drop\s+table",
    r"format\s+c:",
]


def is_file_restricted(file_path: str) -> bool:
    """Check if a file is in the restricted blocklist."""
    normalized = file_path.replace("\\", "/").lower()
    for pattern in RESTRICTED_FILE_PATTERNS:
        if re.match(pattern, normalized):
            logger.warning(f"BLOCKED: AI patch attempted to modify restricted file: {file_path}")
            return True
    return False


def check_patch_size(original: str, patched: str) -> dict:
    """
    Check if the AI patch stays within safe modification limits.
    Returns a dict with 'safe' (bool) and 'lines_changed' (int).
    """
    original_lines = original.strip().splitlines()
    patched_lines = patched.strip().splitlines()
    
    # Count lines that differ
    max_len = max(len(original_lines), len(patched_lines))
    changed = 0
    for i in range(max_len):
        orig = original_lines[i] if i < len(original_lines) else ""
        patch = patched_lines[i] if i < len(patched_lines) else ""
        if orig != patch:
            changed += 1

    is_safe = changed <= MAX_LINES_CHANGED
    if not is_safe:
        logger.warning(
            f"BLOCKED: AI patch changed {changed} lines (limit: {MAX_LINES_CHANGED})"
        )

    return {
        "safe": is_safe,
        "lines_changed": changed,
        "limit": MAX_LINES_CHANGED
    }


def sanitize_code_for_prompt(code: str) -> str:
    """
    Strip potential prompt injection patterns from source code
    before sending it to the LLM as context.
    """
    sanitized = code
    for pattern in INJECTION_PATTERNS:
        sanitized = re.sub(pattern, "[REDACTED]", sanitized, flags=re.IGNORECASE)
    return sanitized


def validate_patch(file_path: str, original_code: str, patched_code: str) -> dict:
    """
    Run all guardrail checks on a proposed AI patch.
    Returns a result dict with 'approved' (bool) and 'reasons' (list).
    """
    reasons: List[str] = []

    # 1. Check file restrictions
    if is_file_restricted(file_path):
        reasons.append(f"File '{file_path}' is restricted from AI modifications.")

    # 2. Check patch size
    size_check = check_patch_size(original_code, patched_code)
    if not size_check["safe"]:
        reasons.append(
            f"Patch changes {size_check['lines_changed']} lines "
            f"(max allowed: {size_check['limit']})."
        )

    # 3. Ensure the patch is not empty or identical
    if not patched_code.strip():
        reasons.append("AI generated an empty patch.")
    elif original_code.strip() == patched_code.strip():
        reasons.append("AI patch is identical to the original code (no changes made).")

    approved = len(reasons) == 0
    if approved:
        logger.info(f"✅ Guardrails PASSED for {file_path}")
    else:
        logger.warning(f"❌ Guardrails BLOCKED patch for {file_path}: {reasons}")

    return {
        "approved": approved,
        "reasons": reasons,
        "lines_changed": size_check["lines_changed"]
    }
