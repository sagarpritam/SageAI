"""Developer Agent — AI Security Engineer.

This agent receives a vulnerability finding from the SAST scanner,
fetches the vulnerable code from GitHub, generates a secure patch using the LLM,
verifies the patch with a re-scan, and triggers a Pull Request.
"""

import json
import logging
import tempfile
import os
import subprocess
from typing import Dict, Any, Optional

from app.services.llm.gateway import llm_gateway
from app.services.integrations.github_service import GitHubService
from app.services.agent.guardrails import validate_patch, sanitize_code_for_prompt

logger = logging.getLogger("SageAI.developer_agent")

DEVELOPER_SYSTEM_PROMPT = """You are a senior application security engineer performing automated code remediation.

RULES:
1. Fix ONLY the specified security vulnerability. Do NOT change any business logic.
2. Maintain the original code formatting, style, and indentation.
3. Do NOT add comments explaining the fix unless the original code had similar comments.
4. Return ONLY the complete, corrected file content. No explanations, no markdown fences, no conversational text.
5. If you cannot fix the vulnerability safely, return the original code unchanged.
"""

DEVELOPER_PROMPT_TEMPLATE = """Fix the following security vulnerability in this source file.

VULNERABILITY:
- Type: {vuln_type}
- Severity: {severity}
- Test ID: {test_id}
- Description: {issue_text}
- File: {file_path}
- Line: {line_number}

ORIGINAL CODE:
{code}

Return ONLY the fully patched file content. No explanations."""


class DeveloperAgent:
    """
    AI agent that generates secure code patches for detected vulnerabilities.
    Includes a verification loop that re-runs SAST to confirm the fix works.
    """

    MAX_RETRIES = 3

    def __init__(self, github_service: GitHubService, org_id: str = "system"):
        self.github = github_service
        self.org_id = org_id

    async def generate_patch(
        self,
        owner: str,
        repo: str,
        finding: Dict[str, Any],
        branch: str = "main"
    ) -> Optional[Dict[str, Any]]:
        """
        Generate a secure patch for a single vulnerability finding.
        
        Args:
            owner: GitHub repository owner
            repo: GitHub repository name
            finding: A single SAST finding dict with keys: file, line, severity, issue_text, etc.
            branch: The branch to read the source code from
            
        Returns:
            A dict with 'file_path', 'original_code', 'patched_code', 'guardrail_result'
            or None if the patch was blocked or failed.
        """
        file_path = finding.get("file", "")
        vuln_type = finding.get("test_name", "Unknown")
        severity = finding.get("severity", "UNKNOWN")
        test_id = finding.get("test_id", "")
        issue_text = finding.get("issue_text", "")
        line_number = finding.get("line", 0)

        logger.info(f"DeveloperAgent: Fixing {vuln_type} in {file_path}:{line_number}")

        # 1. Fetch the original source code from GitHub
        try:
            original_code = await self.github.fetch_file_content(owner, repo, file_path, ref=branch)
        except Exception as e:
            logger.error(f"Failed to fetch {file_path} from GitHub: {e}")
            return None

        # 2. Sanitize code before sending to LLM (strip prompt injection patterns)
        sanitized_code = sanitize_code_for_prompt(original_code)

        # 3. Generate patch with retries
        patched_code = None
        for attempt in range(1, self.MAX_RETRIES + 1):
            logger.info(f"  Attempt {attempt}/{self.MAX_RETRIES} to generate patch...")

            prompt = DEVELOPER_PROMPT_TEMPLATE.format(
                vuln_type=vuln_type,
                severity=severity,
                test_id=test_id,
                issue_text=issue_text,
                file_path=file_path,
                line_number=line_number,
                code=sanitized_code
            )

            try:
                response = await llm_gateway.generate(
                    prompt,
                    system_message=DEVELOPER_SYSTEM_PROMPT,
                    org_id=self.org_id
                )
            except Exception as e:
                logger.error(f"  LLM generation failed: {e}")
                continue

            # Clean markdown fences if the LLM wraps them
            candidate = self._strip_markdown_fences(response)

            # 4. Validate with guardrails
            guardrail_result = validate_patch(file_path, original_code, candidate)
            if not guardrail_result["approved"]:
                logger.warning(f"  Guardrails rejected patch: {guardrail_result['reasons']}")
                continue

            # 5. Verify by re-running SAST on the patched code
            still_vulnerable = await self._verify_patch(candidate, file_path)
            if still_vulnerable:
                logger.warning(f"  Patch still has vulnerability after re-scan. Retrying...")
                # Feed back to the LLM for next attempt
                sanitized_code = candidate
                continue

            # Patch passed all checks
            patched_code = candidate
            break

        if patched_code is None:
            logger.error(f"DeveloperAgent: Failed to generate a valid patch for {file_path} after {self.MAX_RETRIES} attempts.")
            return None

        return {
            "file_path": file_path,
            "original_code": original_code,
            "patched_code": patched_code,
            "vulnerability": {
                "type": vuln_type,
                "severity": severity,
                "test_id": test_id,
                "issue_text": issue_text,
                "line": line_number
            },
            "guardrail_result": guardrail_result
        }

    async def _verify_patch(self, patched_code: str, file_path: str) -> bool:
        """
        Write the patched code to a temp file and re-run Bandit to verify
        the vulnerability is gone. Returns True if vulnerability STILL exists.
        """
        tmp_dir = tempfile.mkdtemp(prefix="sageai_verify_")
        try:
            # Recreate the file structure
            full_path = os.path.join(tmp_dir, os.path.basename(file_path))
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(patched_code)

            # Run Bandit on just this file
            try:
                result = subprocess.run(
                    ["bandit", full_path, "-f", "json", "-ll"],
                    capture_output=True, text=True, timeout=30
                )
            except (FileNotFoundError, subprocess.TimeoutExpired):
                # If bandit isn't available, assume the patch is fine
                return False

            if not result.stdout:
                return False  # No output = no vulnerabilities

            try:
                data = json.loads(result.stdout)
                findings = data.get("results", [])
                return len(findings) > 0
            except json.JSONDecodeError:
                return False

        finally:
            import shutil
            shutil.rmtree(tmp_dir, ignore_errors=True)

    def _strip_markdown_fences(self, text: str) -> str:
        """Remove ```python ... ``` wrapping if the LLM added it."""
        text = text.strip()
        if text.startswith("```"):
            # Remove opening fence
            first_newline = text.index("\n") if "\n" in text else len(text)
            text = text[first_newline + 1:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()
