"""Auto-Fix & SagePatch Remediation API Routes.

Exposes:
- Automated SAST scanning & AI patch generation
- Phase 04 SagePatch Engine:
  - Deterministic diff inspection
  - Sandboxed validation
  - Strict human approval & rejection workflow
  - Isolated branch PR dispatch
"""

import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.encryption import decrypt
from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.models.organization import Organization
from app.models.remediation_patch import RemediationPatch
from app.services.sagepatch.engine import (
    ApprovalRequiredError,
    SagePatchEngine,
    SagePatchError,
    SandboxedValidationError,
)
from app.services.tools.github_pr_tool import GitHubPRTool
from app.services.tools.sast_scanner import SASTScanner

router = APIRouter(prefix="/autofix", tags=["Self-Healing Code & SagePatch"])


class AutoFixRequest(BaseModel):
    repository: str = Field(..., description="GitHub repo in 'owner/repo' format")
    branch: str = Field(default="main", description="Branch to scan and fix")
    max_fixes: int = Field(
        default=5, ge=1, le=20, description="Max number of vulnerabilities to fix"
    )


class AutoFixStatusResponse(BaseModel):
    ready: bool
    message: str


class ProposePatchRequest(BaseModel):
    repository: str = Field(..., description="GitHub repository 'owner/repo'")
    file_path: str = Field(..., description="Relative file path within repository")
    vulnerability_type: str = Field(..., description="Vulnerability type or test ID")
    severity: str = Field(
        default="MEDIUM", description="Severity (LOW, MEDIUM, HIGH, CRITICAL)"
    )
    original_code: str = Field(..., description="Original code before patch")
    patched_code: str = Field(..., description="AI proposed patched code")
    base_branch: str = Field(default="main", description="Target base branch")
    finding_id: Optional[str] = Field(default=None, description="Linked Finding ID")


class RejectPatchRequest(BaseModel):
    reason: str = Field(
        ..., min_length=3, description="Rationale for rejecting the patch"
    )


# ─────────────────────────────────────────────────────────────
# 1. Status & Readiness
# ─────────────────────────────────────────────────────────────


@router.get("/status", response_model=AutoFixStatusResponse)
async def autofix_status(
    current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Check if GitHub integration is configured for the organization."""
    org = await db.get(Organization, current_user["org"])
    if not org or not org.github_token_encrypted:
        return AutoFixStatusResponse(
            ready=False,
            message="GitHub token not configured. Go to Settings → Integrations to connect GitHub.",
        )
    return AutoFixStatusResponse(
        ready=True,
        message="SagePatch & Self-Healing Code are ready. Scans and human-in-the-loop patches enabled.",
    )


# ─────────────────────────────────────────────────────────────
# 2. SagePatch Remediation Review Queue (Phase 04)
# ─────────────────────────────────────────────────────────────


@router.get("/patches")
async def list_remediation_patches(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all proposed, approved, or rejected SagePatch remediations for the tenant."""
    org_id = current_user["org"]
    query = select(RemediationPatch).where(RemediationPatch.organization_id == org_id)

    if status_filter:
        query = query.where(RemediationPatch.status == status_filter.lower())

    query = query.order_by(desc(RemediationPatch.created_at))
    res = await db.execute(query)
    patches = res.scalars().all()

    return [
        {
            "id": p.id,
            "repository": p.repository,
            "base_branch": p.base_branch,
            "patch_branch": p.patch_branch,
            "file_path": p.file_path,
            "vulnerability_type": p.vulnerability_type,
            "severity": p.severity,
            "diff": p.diff,
            "lines_changed": p.lines_changed,
            "status": p.status.value if hasattr(p.status, "value") else str(p.status),
            "sandbox_passed": p.sandbox_passed,
            "sandbox_details": json.loads(p.sandbox_details or "{}"),
            "requested_by": p.requested_by,
            "approved_by": p.approved_by,
            "approved_at": p.approved_at.isoformat() if p.approved_at else None,
            "rejection_reason": p.rejection_reason,
            "pr_number": p.pr_number,
            "pr_url": p.pr_url,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in patches
    ]


@router.get("/patches/{patch_id}")
async def get_remediation_patch(
    patch_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full details of a specific patch including unified diff and sandbox audit."""
    org_id = current_user["org"]
    res = await db.execute(
        select(RemediationPatch).where(
            RemediationPatch.id == patch_id,
            RemediationPatch.organization_id == org_id,
        )
    )
    p = res.scalars().first()
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Remediation patch not found or unauthorized.",
        )

    return {
        "id": p.id,
        "organization_id": p.organization_id,
        "finding_id": p.finding_id,
        "repository": p.repository,
        "base_branch": p.base_branch,
        "patch_branch": p.patch_branch,
        "file_path": p.file_path,
        "vulnerability_type": p.vulnerability_type,
        "severity": p.severity,
        "original_code": p.original_code,
        "patched_code": p.patched_code,
        "diff": p.diff,
        "lines_changed": p.lines_changed,
        "status": p.status.value if hasattr(p.status, "value") else str(p.status),
        "sandbox_passed": p.sandbox_passed,
        "sandbox_details": json.loads(p.sandbox_details or "{}"),
        "requested_by": p.requested_by,
        "approved_by": p.approved_by,
        "approved_at": p.approved_at.isoformat() if p.approved_at else None,
        "rejection_reason": p.rejection_reason,
        "pr_number": p.pr_number,
        "pr_url": p.pr_url,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


@router.post("/propose", status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def propose_patch(
    request: Request,
    payload: ProposePatchRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Propose an AI remediation patch through the sandboxed validation pipeline."""
    engine = SagePatchEngine(db)
    try:
        patch = await engine.propose_patch(
            organization_id=current_user["org"],
            repository=payload.repository,
            file_path=payload.file_path,
            vulnerability_type=payload.vulnerability_type,
            severity=payload.severity,
            original_code=payload.original_code,
            patched_code=payload.patched_code,
            requested_by=current_user.get("sub", "user"),
            base_branch=payload.base_branch,
            finding_id=payload.finding_id,
        )
        return {
            "status": "proposed",
            "message": "Patch passed sandboxed validation and is awaiting human review.",
            "patch_id": patch.id,
            "patch_branch": patch.patch_branch,
            "diff": patch.diff,
            "lines_changed": patch.lines_changed,
        }
    except SandboxedValidationError as sve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(sve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to propose patch: {str(e)}",
        )


@router.post("/patches/{patch_id}/approve")
@limiter.limit("20/minute")
async def approve_patch(
    request: Request,
    patch_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Human approval endpoint to dispatch the patch to GitHub on an isolated branch."""
    # Enforce role
    user_role = current_user.get("role", "member")
    if user_role not in ("admin", "reviewer", "lead"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: Human approval requires an admin or reviewer role.",
        )

    # Get org GitHub token
    org = await db.get(Organization, current_user["org"])
    github_token = ""
    if org and org.github_token_encrypted:
        github_token = decrypt(org.github_token_encrypted) or ""

    if not github_token:
        # Check for simulate mode
        simulate = request.query_params.get("simulate", "false").lower() == "true"
        if (
            simulate
            or request.headers.get("x-simulate-dispatch", "false").lower() == "true"
        ):
            github_token = "mock_gh_token_simulated"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub token not configured. Go to Settings → Integrations.",
            )

    engine = SagePatchEngine(db)
    try:
        patch = await engine.approve_and_dispatch(
            patch_id=patch_id,
            organization_id=current_user["org"],
            approved_by=current_user.get("sub", "admin"),
            user_role=user_role,
            github_token=github_token,
        )
        return {
            "status": "approved",
            "message": "Patch approved by human reviewer. Pull Request opened on isolated branch.",
            "patch_id": patch.id,
            "pr_url": patch.pr_url,
            "pr_number": patch.pr_number,
            "patch_branch": patch.patch_branch,
        }
    except ApprovalRequiredError as are:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(are),
        )
    except SagePatchError as spe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(spe),
        )


@router.post("/patches/{patch_id}/reject")
@limiter.limit("20/minute")
async def reject_patch(
    request: Request,
    patch_id: str,
    payload: RejectPatchRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reject a proposed patch with an auditable explanation."""
    user_role = current_user.get("role", "member")
    if user_role not in ("admin", "reviewer", "lead"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: Patch rejection requires an admin or reviewer role.",
        )

    engine = SagePatchEngine(db)
    try:
        patch = await engine.reject_patch(
            patch_id=patch_id,
            organization_id=current_user["org"],
            rejected_by=current_user.get("sub", "user"),
            reason=payload.reason,
        )
        return {
            "status": "rejected",
            "message": "Patch rejected.",
            "patch_id": patch.id,
            "rejection_reason": patch.rejection_reason,
        }
    except SagePatchError as spe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(spe),
        )


# ─────────────────────────────────────────────────────────────
# 3. Pipeline Run (Backward Compatibility & Automation)
# ─────────────────────────────────────────────────────────────


@router.post("/run")
@limiter.limit("5/minute")
async def run_autofix(
    request: Request,
    payload: AutoFixRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run SAST scan and generate candidate fixes."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can run auto-fix.",
        )

    org_id = current_user["org"]
    org = await db.get(Organization, org_id)
    if not org or not org.github_token_encrypted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub token not configured. Go to Settings → Integrations.",
        )

    github_token = decrypt(org.github_token_encrypted)
    if not github_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to decrypt GitHub token. Please re-configure it.",
        )

    # Step 1: Run SAST Scanner
    sast = SASTScanner()
    scan_results = await sast.run(
        payload.repository, github_token=github_token, branch=payload.branch
    )

    if "error" in scan_results:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=scan_results["error"]
        )

    findings = scan_results.get("findings", [])
    if not findings:
        return {
            "status": "clean",
            "message": f"No vulnerabilities found in {payload.repository}. Your code is secure! 🎉",
            "scan_results": scan_results,
        }

    findings_to_fix = findings[: payload.max_fixes]

    # Step 2 & 3: Run GitHub PR tool
    pr_tool = GitHubPRTool()
    fix_results = await pr_tool.run(
        payload.repository,
        github_token=github_token,
        findings=findings_to_fix,
        branch=payload.branch,
        org_id=org_id,
    )

    return {
        "status": "completed",
        "scan_results": scan_results,
        "fix_results": fix_results,
    }
