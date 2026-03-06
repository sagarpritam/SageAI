"""SAST (Static Application Security Testing) Scanner Tool.

Analyzes source code from a GitHub repository for security vulnerabilities
using Bandit (Python). Returns structured findings with exact file/line info.
"""

import json
import logging
import tempfile
import shutil
import subprocess
import os
from typing import Any, Dict

from app.services.tools.base import BaseTool

logger = logging.getLogger("SageAI.sast_scanner")


class SASTScanner(BaseTool):
    """
    Static Analysis Security Testing tool.
    Clones a GitHub repository and runs Bandit to find vulnerabilities 
    in Python source code, returning exact file paths and line numbers.
    """

    @property
    def name(self) -> str:
        return "sast_scanner"

    @property
    def description(self) -> str:
        return (
            "Runs Static Application Security Testing (SAST) on a GitHub repository. "
            "Clones the repo, runs Bandit for Python code, and returns a list of "
            "vulnerabilities with exact file paths, line numbers, and severity levels."
        )

    async def run(self, target: str, **kwargs) -> Dict[str, Any]:
        """
        Run SAST scan on a GitHub repository.
        
        Args:
            target: GitHub repo in 'owner/repo' format (e.g., 'sagarpritam/my-app')
            **kwargs:
                github_token: Optional GitHub PAT for private repos
                branch: Branch to scan (default: 'main')
        """
        github_token = kwargs.get("github_token", "")
        branch = kwargs.get("branch", "main")
        
        owner_repo = target.strip("/")
        if "/" not in owner_repo:
            return {"error": f"Invalid repo format. Expected 'owner/repo', got '{target}'"}

        tmp_dir = tempfile.mkdtemp(prefix="sageai_sast_")
        
        try:
            # Clone the repository
            if github_token:
                clone_url = f"https://x-access-token:{github_token}@github.com/{owner_repo}.git"
            else:
                clone_url = f"https://github.com/{owner_repo}.git"

            logger.info(f"Cloning {owner_repo} (branch: {branch}) for SAST scan...")
            result = subprocess.run(
                ["git", "clone", "--depth", "1", "--branch", branch, clone_url, tmp_dir],
                capture_output=True, text=True, timeout=60
            )
            if result.returncode != 0:
                return {"error": f"Failed to clone repository: {result.stderr.strip()}"}

            # Run Bandit (Python SAST)
            findings = await self._run_bandit(tmp_dir, owner_repo)
            
            return {
                "repository": owner_repo,
                "branch": branch,
                "scanner": "bandit",
                "total_findings": len(findings),
                "findings": findings
            }

        except subprocess.TimeoutExpired:
            return {"error": "Repository clone timed out (60s limit)"}
        except Exception as e:
            logger.error(f"SAST scan failed: {e}")
            return {"error": str(e)}
        finally:
            # Always clean up the temporary directory
            shutil.rmtree(tmp_dir, ignore_errors=True)

    async def _run_bandit(self, repo_path: str, repo_name: str) -> list:
        """Run Bandit on the cloned repository and parse JSON output."""
        try:
            result = subprocess.run(
                ["bandit", "-r", repo_path, "-f", "json", "-ll"],  # -ll = medium+ severity
                capture_output=True, text=True, timeout=120
            )
        except FileNotFoundError:
            logger.warning("Bandit is not installed. Install with: pip install bandit")
            return [{"error": "Bandit scanner not installed on the server."}]
        except subprocess.TimeoutExpired:
            return [{"error": "Bandit scan timed out (120s limit)"}]

        if not result.stdout:
            return []

        try:
            data = json.loads(result.stdout)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse Bandit output")
            return []

        findings = []
        for item in data.get("results", []):
            # Make file paths relative to the repo root
            file_path = item.get("filename", "")
            if repo_path in file_path:
                file_path = file_path.replace(repo_path + os.sep, "")
                file_path = file_path.replace("\\", "/")  # Normalize to forward slashes

            findings.append({
                "file": file_path,
                "line": item.get("line_number"),
                "col": item.get("col_offset", 0),
                "severity": item.get("issue_severity", "UNKNOWN"),
                "confidence": item.get("issue_confidence", "UNKNOWN"),
                "test_id": item.get("test_id", ""),
                "test_name": item.get("test_name", ""),
                "issue_text": item.get("issue_text", ""),
                "code": item.get("code", ""),
                "cwe": item.get("issue_cwe", {}).get("id", None),
                "more_info": item.get("more_info", "")
            })

        return findings
