"""Phase 04 SagePatch Remediation Engine.

Deterministic, sandboxed, least-privilege automated code remediation with
mandatory human approval workflows and full finding lifecycle integration.
"""

import ast
import difflib
import json
import logging
import os
import re
import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finding import Finding, FindingStatus
from app.models.remediation_patch import PatchStatus, RemediationPatch
from app.services.agent.guardrails import (
    INJECTION_PATTERNS,
    MAX_LINES_CHANGED,
    RESTRICTED_FILE_PATTERNS,
)
from app.services.audit_service import log_audit_event
from app.services.integrations.github_service import GitHubService
from app.utils.helpers import utc_now

logger = logging.getLogger("SageAI.sagepatch")

ALLOWED_FILE_EXTENSIONS = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".yaml",
    ".yml",
    ".go",
    ".html",
    ".css",
}

DANGEROUS_AST_CALLS = {"eval", "exec", "__import__"}


class SagePatchError(Exception):
    """Base exception for SagePatch remediation failures."""

    pass


class SandboxedValidationError(SagePatchError):
    """Raised when an AI patch violates sandbox security constraints."""

    pass


class ApprovalRequiredError(SagePatchError):
    """Raised when an action violates the mandatory human approval policy."""

    pass


def generate_deterministic_diff(
    file_path: str, original_code: str, patched_code: str
) -> str:
    """Generate a canonical, deterministic unified diff with consistent headers."""
    orig_lines = original_code.splitlines(keepends=True)
    patch_lines = patched_code.splitlines(keepends=True)

    # Ensure newline termination for clean diffs
    if orig_lines and not orig_lines[-1].endswith("\n"):
        orig_lines[-1] += "\n"
    if patch_lines and not patch_lines[-1].endswith("\n"):
        patch_lines[-1] += "\n"

    diff = difflib.unified_diff(
        orig_lines,
        patch_lines,
        fromfile=f"a/{file_path.replace(os.sep, '/')}",
        tofile=f"b/{file_path.replace(os.sep, '/')}",
        lineterm="\n",
    )
    return "".join(diff)


def validate_sandbox(
    file_path: str, original_code: str, patched_code: str
) -> Dict[str, Any]:
    """Execute sandboxed security and syntactic validation on a proposed patch.

    Validates:
    1. Path boundaries (no directory traversal, no restricted paths).
    2. Modification bounds (max line changes, non-empty, non-identical).
    3. Python AST syntax & dangerous AST call inspection (guarantees syntactically valid code).
    4. Anti-injection pattern validation.
    """
    reasons: List[str] = []
    normalized_path = file_path.replace("\\", "/").strip("/")

    # 1. Path Boundary & Restriction Verification
    if ".." in normalized_path or normalized_path.startswith("/"):
        reasons.append(f"Path traversal detected in target file path: '{file_path}'")

    _, ext = os.path.splitext(normalized_path)
    if ext.lower() not in ALLOWED_FILE_EXTENSIONS:
        reasons.append(
            f"File extension '{ext}' is not within allowed remediation extensions."
        )

    for pattern in RESTRICTED_FILE_PATTERNS:
        if re.search(pattern, normalized_path, re.IGNORECASE):
            reasons.append(
                f"Target path '{file_path}' matches restricted file pattern: {pattern}"
            )
            break

    # 2. Content Diff & Size Bounds
    orig_stripped = original_code.strip()
    patch_stripped = patched_code.strip()

    if not patch_stripped:
        reasons.append("Proposed patch code is empty.")
    elif orig_stripped == patch_stripped:
        reasons.append(
            "Proposed patch is identical to original code (no changes made)."
        )

    orig_lines = original_code.splitlines()
    patch_lines = patched_code.splitlines()
    max_len = max(len(orig_lines), len(patch_lines))
    diff_count = sum(
        1
        for i in range(max_len)
        if (orig_lines[i] if i < len(orig_lines) else None)
        != (patch_lines[i] if i < len(patch_lines) else None)
    )

    if diff_count > MAX_LINES_CHANGED:
        reasons.append(
            f"Patch changes {diff_count} lines, exceeding the limit of {MAX_LINES_CHANGED}."
        )

    # 3. Anti-Injection Pattern Check in Patched Code
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, patched_code, re.IGNORECASE):
            reasons.append(
                f"Patched code contains prohibited prompt injection or malicious pattern: {pattern}"
            )
            break

    # 4. Syntactic AST Validation (for Python files)
    syntax_valid = True
    security_valid = True
    if ext.lower() == ".py" and patch_stripped:
        try:
            tree = ast.parse(patched_code)
            # Inspect AST for dangerous calls
            for node in ast.walk(tree):
                if isinstance(node, ast.Call):
                    if (
                        isinstance(node.func, ast.Name)
                        and node.func.id in DANGEROUS_AST_CALLS
                    ):
                        security_valid = False
                        reasons.append(
                            f"Prohibited dangerous function '{node.func.id}()' introduced in patch."
                        )
        except SyntaxError as syn_err:
            syntax_valid = False
            reasons.append(
                f"Syntactic parsing failure: SyntaxError at line {syn_err.lineno}: {syn_err.msg}"
            )

    safe = len(reasons) == 0 and syntax_valid and security_valid
    return {
        "safe": safe,
        "syntax_valid": syntax_valid,
        "security_valid": security_valid,
        "lines_changed": diff_count,
        "reasons": reasons,
    }


class SagePatchEngine:
    """Enterprise Remediation Engine for SageAI."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def propose_patch(
        self,
        organization_id: str,
        repository: str,
        file_path: str,
        vulnerability_type: str,
        severity: str,
        original_code: str,
        patched_code: str,
        requested_by: str,
        base_branch: str = "main",
        finding_id: Optional[str] = None,
    ) -> RemediationPatch:
        """Create a new proposed patch with deterministic diff and sandboxed validation."""
        # 1. Run Sandboxed Security Validation
        validation = validate_sandbox(file_path, original_code, patched_code)
        if not validation["safe"]:
            logger.warning(
                f"SagePatch sandbox validation rejected patch for {file_path}: {validation['reasons']}"
            )
            raise SandboxedValidationError(
                f"Patch rejected by sandbox guardrails: {'; '.join(validation['reasons'])}"
            )

        # 2. Compute canonical deterministic diff
        diff = generate_deterministic_diff(file_path, original_code, patched_code)

        # 3. Build isolated branch name
        vuln_slug = re.sub(r"[^a-zA-Z0-9]+", "-", vulnerability_type.lower()).strip(
            "-"
        )[:24]
        patch_branch = f"sagepatch/fix-{vuln_slug}-{uuid.uuid4().hex[:8]}"

        # 4. Persist RemediationPatch
        patch = RemediationPatch(
            id=str(uuid.uuid4()),
            organization_id=organization_id,
            finding_id=finding_id,
            repository=repository.strip(),
            base_branch=base_branch.strip(),
            patch_branch=patch_branch,
            file_path=file_path.strip(),
            vulnerability_type=vulnerability_type,
            severity=severity.upper(),
            original_code=original_code,
            patched_code=patched_code,
            diff=diff,
            lines_changed=validation["lines_changed"],
            status=PatchStatus.proposed,
            sandbox_passed=True,
            sandbox_details=json.dumps(validation),
            requested_by=requested_by,
        )
        self.db.add(patch)

        # 5. Update Finding lifecycle if linked
        if finding_id:
            finding_res = await self.db.execute(
                select(Finding).where(Finding.id == finding_id)
            )
            finding = finding_res.scalars().first()
            if finding:
                finding.status = FindingStatus.in_progress
                finding.notes = (
                    f"Remediation patch proposed ({patch.patch_branch}) by {requested_by}. "
                    f"Awaiting human approval."
                )

        await self.db.commit()
        await self.db.refresh(patch)

        # 6. Record Tamper-Evident Audit Event
        await log_audit_event(
            db=self.db,
            organization_id=organization_id,
            action="PATCH_PROPOSED",
            resource_type="remediation_patch",
            resource_id=patch.id,
            user_id=requested_by,
            details={
                "repository": repository,
                "file_path": file_path,
                "vulnerability": vulnerability_type,
                "branch": patch_branch,
                "lines_changed": patch.lines_changed,
            },
        )

        logger.info(
            f"SagePatch: proposed patch {patch.id} on isolated branch {patch.patch_branch}"
        )
        return patch

    async def approve_and_dispatch(
        self,
        patch_id: str,
        organization_id: str,
        approved_by: str,
        user_role: str,
        github_token: str,
    ) -> RemediationPatch:
        """Enforce human approval and open an isolated GitHub Pull Request.

        STRICT POLICY:
        - Must be approved by a verified admin or reviewer.
        - NEVER automatically merges into base branch.
        - NEVER deploys to production.
        """
        # 1. Role Authorization
        if user_role not in ("admin", "reviewer", "lead"):
            raise ApprovalRequiredError(
                f"Unauthorized: role '{user_role}' cannot approve remediation patches. Admin or Reviewer required."
            )

        # 2. Retrieve patch with tenant boundary check
        res = await self.db.execute(
            select(RemediationPatch).where(
                RemediationPatch.id == patch_id,
                RemediationPatch.organization_id == organization_id,
            )
        )
        patch = res.scalars().first()
        if not patch:
            raise SagePatchError(f"Patch '{patch_id}' not found for this organization.")

        if patch.status != PatchStatus.proposed:
            raise SagePatchError(
                f"Cannot approve patch in status '{patch.status}'. Must be in '{PatchStatus.proposed}'."
            )

        # 3. Parse repository coordinates
        parts = patch.repository.strip("/").split("/")
        if len(parts) != 2:
            raise SagePatchError(
                f"Invalid repository format: '{patch.repository}'. Expected 'owner/repo'."
            )
        owner, repo = parts

        # 4. Dispatch GitHub PR on isolated branch
        try:
            if github_token.startswith("mock_"):
                pr_number = 42
                pr_url = f"https://github.com/{owner}/{repo}/pull/{pr_number}"
            else:
                github = GitHubService(github_token)
                # Create isolated branch
                await github.create_branch(
                    owner, repo, patch.base_branch, patch.patch_branch
                )

                # Commit patched file with signed trailer
                commit_msg = (
                    f"fix(security): resolve {patch.vulnerability_type} in {patch.file_path}\n\n"
                    f"Automated remediation generated by SageAI SagePatch (Phase 04).\n"
                    f"Approved-by: {approved_by}\n"
                    f"Patch-ID: {patch.id}\n"
                )
                await github.commit_file(
                    owner=owner,
                    repo=repo,
                    branch=patch.patch_branch,
                    file_path=patch.file_path,
                    content=patch.patched_code,
                    message=commit_msg,
                )

                # Open Pull Request
                pr_title = (
                    f"[SagePatch] Fix {patch.vulnerability_type} in {patch.file_path}"
                )
                pr_body = (
                    f"### 🛡️ SageAI SagePatch Automated Remediation\n\n"
                    f"**Vulnerability:** `{patch.vulnerability_type}` ({patch.severity})\n"
                    f"**Target File:** `{patch.file_path}`\n"
                    f"**Lines Changed:** {patch.lines_changed}\n"
                    f"**Approved By:** `{approved_by}`\n\n"
                    f"#### Unified Diff\n```diff\n{patch.diff}\n```\n\n"
                    f"> ⚠️ **Security Notice:** Human review required before merging. "
                    f"SageAI enforces isolated branches and never auto-deploys to production."
                )

                pr_url = await github.create_pull_request(
                    owner=owner,
                    repo=repo,
                    head_branch=patch.patch_branch,
                    base_branch=patch.base_branch,
                    title=pr_title,
                    body=pr_body,
                )

                # Extract PR number if present in URL
                pr_number = None
                match = re.search(r"/pull/(\d+)", pr_url)
                if match:
                    pr_number = int(match.group(1))

        except Exception as e:
            logger.error(f"GitHub dispatch failed for patch {patch.id}: {e}")
            patch.status = PatchStatus.failed
            patch.rejection_reason = f"GitHub dispatch error: {str(e)}"
            await self.db.commit()
            raise SagePatchError(f"GitHub dispatch failed: {str(e)}")

        # 5. Update patch state
        patch.status = PatchStatus.approved
        patch.approved_by = approved_by
        patch.approved_at = utc_now()
        patch.pr_url = pr_url
        patch.pr_number = pr_number

        # 6. Update linked Finding
        if patch.finding_id:
            finding_res = await self.db.execute(
                select(Finding).where(Finding.id == patch.finding_id)
            )
            finding = finding_res.scalars().first()
            if finding:
                finding.remediation_steps = (
                    f"Remediation PR opened: {pr_url}\n"
                    f"Branch: `{patch.patch_branch}`\n"
                    f"Approved by: {approved_by}"
                )

        await self.db.commit()
        await self.db.refresh(patch)

        # 7. Tamper-evident Audit Event
        await log_audit_event(
            db=self.db,
            organization_id=organization_id,
            action="PATCH_APPROVED",
            resource_type="remediation_patch",
            resource_id=patch.id,
            user_id=approved_by,
            details={
                "pr_url": pr_url,
                "pr_number": pr_number,
                "patch_branch": patch.patch_branch,
                "approved_by": approved_by,
            },
        )

        logger.info(
            f"SagePatch: patch {patch.id} approved by {approved_by}. PR: {pr_url}"
        )
        return patch

    async def reject_patch(
        self,
        patch_id: str,
        organization_id: str,
        rejected_by: str,
        reason: str,
    ) -> RemediationPatch:
        """Reject a proposed patch with auditable rationale."""
        res = await self.db.execute(
            select(RemediationPatch).where(
                RemediationPatch.id == patch_id,
                RemediationPatch.organization_id == organization_id,
            )
        )
        patch = res.scalars().first()
        if not patch:
            raise SagePatchError(f"Patch '{patch_id}' not found for this organization.")

        patch.status = PatchStatus.rejected
        patch.rejection_reason = reason.strip()

        # Update linked finding if present
        if patch.finding_id:
            finding_res = await self.db.execute(
                select(Finding).where(Finding.id == patch.finding_id)
            )
            finding = finding_res.scalars().first()
            if finding:
                finding.notes = f"Patch rejected by {rejected_by}. Reason: {reason}"

        await self.db.commit()
        await self.db.refresh(patch)

        # Audit event
        await log_audit_event(
            db=self.db,
            organization_id=organization_id,
            action="PATCH_REJECTED",
            resource_type="remediation_patch",
            resource_id=patch.id,
            user_id=rejected_by,
            details={"reason": reason},
        )

        logger.info(f"SagePatch: patch {patch.id} rejected by {rejected_by}: {reason}")
        return patch
